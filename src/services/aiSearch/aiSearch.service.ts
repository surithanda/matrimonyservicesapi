import pool from '../../config/database';
import logger from '../../config/logger';
import { IAIProvider, IAISearchResult, ISearchIntent, IResolvedIds } from '../../interfaces/aiSearch.interface';
import { createAIProvider } from './aiProviderFactory';
import { SchemaContext } from './schemaContext';
import { IntentValidator } from './intentValidator';
import { LookupResolver } from './lookupResolver';
import { QueryBuilder } from './queryBuilder';

export class AISearchService {
  private provider: IAIProvider;
  private schemaContext: SchemaContext;
  private intentValidator: IntentValidator;
  private lookupResolver: LookupResolver;
  private queryBuilder: QueryBuilder;
  private initialized: boolean = false;

  constructor() {
    this.provider = createAIProvider();
    this.schemaContext = new SchemaContext();
    this.intentValidator = new IntentValidator();
    this.lookupResolver = new LookupResolver();
    this.queryBuilder = new QueryBuilder();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.schemaContext.initialize();
    this.initialized = true;
    logger.info(`[AISearch] Service initialized with provider: ${this.provider.name} (${this.provider.model})`);
  }

  async search(
    userQuery: string,
    callerProfileId: number,
    accountId: number
  ): Promise<IAISearchResult> {
    // Ensure schema context is loaded
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    let intent: ISearchIntent | null = null;
    let resolvedIds: IResolvedIds | null = null;
    let sqlExecuted: string | null = null;

    try {
      // Step 1: Call AI provider
      logger.info('[AISearch] Calling AI provider', {
        provider: this.provider.name,
        model: this.provider.model,
        queryLength: userQuery.length,
      });

      const aiResponse = await this.provider.parseSearchIntent(
        userQuery,
        this.schemaContext.getSystemPrompt()
      );

      // Step 2: Validate AI output
      intent = this.intentValidator.validate(aiResponse.intent);

      logger.info('[AISearch] AI response validated', {
        confidence: intent.confidence,
        filterCount: Object.keys(intent.filters).length,
        interpretation: intent.interpretation,
      });

      // Step 3: Check confidence threshold
      if (intent.confidence < 0.3) {
        const totalTimeMs = Date.now() - startTime;
        this.logSearchAsync(
          accountId, callerProfileId, userQuery, intent, null,
          null, 0, aiResponse.tokensUsed.total, totalTimeMs,
          intent.confidence, 'Low confidence — query unclear'
        );

        return {
          success: false,
          message: 'Could not understand the search query. Please try rephrasing with more specific criteria.',
          data: {
            profiles: [],
            interpretation: intent.interpretation,
            filters_applied: intent.filters,
            resolved_ids: {},
            confidence: intent.confidence,
            result_count: 0,
            ai_provider: this.provider.name,
            ai_model: this.provider.model,
            tokens_used: aiResponse.tokensUsed.total,
            response_time_ms: totalTimeMs,
          },
        };
      }

      // Step 4: Check if any meaningful filters were extracted
      const filterCount = Object.keys(intent.filters).length;
      if (filterCount === 0) {
        const totalTimeMs = Date.now() - startTime;
        this.logSearchAsync(
          accountId, callerProfileId, userQuery, intent, null,
          null, 0, aiResponse.tokensUsed.total, totalTimeMs,
          intent.confidence, 'No filters extracted'
        );

        return {
          success: false,
          message: 'No search criteria could be extracted from your query. Please describe what you are looking for.',
          data: {
            profiles: [],
            interpretation: intent.interpretation,
            filters_applied: intent.filters,
            resolved_ids: {},
            confidence: intent.confidence,
            result_count: 0,
            ai_provider: this.provider.name,
            ai_model: this.provider.model,
            tokens_used: aiResponse.tokensUsed.total,
            response_time_ms: totalTimeMs,
          },
        };
      }

      // Step 5: Resolve lookup text → IDs
      resolvedIds = this.lookupResolver.resolve(
        intent.filters,
        this.schemaContext.getLookupCache(),
        this.schemaContext.getCountryCache(),
        this.schemaContext.getStateCache()
      );

      logger.info('[AISearch] Lookups resolved', { resolvedIds });

      // Step 6: Build parameterized SQL
      const { sql, params } = this.queryBuilder.build(intent, resolvedIds, callerProfileId);
      sqlExecuted = sql;

      logger.info('[AISearch] Executing query', {
        paramCount: params.length,
      });

      // Step 7: Execute query
      const [rows] = await pool.execute(sql, params);
      const profiles = (rows as any[]) || [];

      const totalTimeMs = Date.now() - startTime;

      logger.info('[AISearch] Search complete', {
        resultCount: profiles.length,
        totalTimeMs,
        tokensUsed: aiResponse.tokensUsed.total,
      });

      // Step 8: Log search (fire-and-forget)
      this.logSearchAsync(
        accountId, callerProfileId, userQuery, intent, resolvedIds,
        sqlExecuted, profiles.length, aiResponse.tokensUsed.total,
        totalTimeMs, intent.confidence, null
      );

      return {
        success: true,
        message: 'Profiles fetched successfully',
        data: {
          profiles,
          interpretation: intent.interpretation,
          filters_applied: intent.filters,
          resolved_ids: resolvedIds,
          confidence: intent.confidence,
          result_count: profiles.length,
          ai_provider: this.provider.name,
          ai_model: this.provider.model,
          tokens_used: aiResponse.tokensUsed.total,
          response_time_ms: totalTimeMs,
        },
      };
    } catch (error: any) {
      const totalTimeMs = Date.now() - startTime;

      logger.error('[AISearch] Search failed', {
        error: error.message,
        stack: error.stack,
        provider: this.provider.name,
      });

      // Log failed search
      this.logSearchAsync(
        accountId, callerProfileId, userQuery, intent, resolvedIds,
        sqlExecuted, 0, 0, totalTimeMs, 0, error.message
      );

      throw error;
    }
  }

  async refreshCache(): Promise<{ success: boolean; message: string }> {
    try {
      this.initialized = false;
      await this.schemaContext.initialize();
      this.initialized = true;
      return {
        success: true,
        message: `Schema context refreshed at ${this.schemaContext.getLastRefreshed()?.toISOString()}`,
      };
    } catch (error: any) {
      logger.error('[AISearch] Cache refresh failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  getProviderInfo(): { name: string; model: string; lastRefreshed: Date | null } {
    return {
      name: this.provider.name,
      model: this.provider.model,
      lastRefreshed: this.schemaContext.getLastRefreshed(),
    };
  }

  private logSearchAsync(
    accountId: number,
    profileId: number,
    userQuery: string,
    intent: ISearchIntent | null,
    resolvedIds: IResolvedIds | null,
    sqlExecuted: string | null,
    resultCount: number,
    tokensUsed: number,
    responseTimeMs: number,
    confidence: number,
    errorMessage: string | null
  ): void {
    setImmediate(async () => {
      try {
        await pool.execute(
          `INSERT INTO ai_search_log
            (account_id, profile_id, user_query, interpreted_query, resolved_filters,
             sql_executed, result_count, ai_provider, ai_model, tokens_used,
             response_time_ms, confidence, error_message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            accountId,
            profileId,
            userQuery,
            intent ? JSON.stringify(intent) : null,
            resolvedIds ? JSON.stringify(resolvedIds) : null,
            sqlExecuted,
            resultCount,
            this.provider.name,
            this.provider.model,
            tokensUsed,
            responseTimeMs,
            confidence,
            errorMessage,
          ]
        );
      } catch (err: any) {
        logger.error('[AISearch] Failed to log search', { error: err.message });
      }
    });
  }
}

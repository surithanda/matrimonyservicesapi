import OpenAI from 'openai';
import { IAIProvider, IAIProviderResponse, ISearchIntent } from '../../../interfaces/aiSearch.interface';
import logger from '../../../config/logger';

export class OpenAIProvider implements IAIProvider {
  name = 'openai';
  model: string;
  private client: OpenAI;

  constructor() {
    if (!process.env.AI_OPENAI_API_KEY) {
      throw new Error('AI_OPENAI_API_KEY environment variable is required for OpenAI provider');
    }
    this.model = process.env.AI_OPENAI_MODEL || 'gpt-4o-mini';
    this.client = new OpenAI({
      apiKey: process.env.AI_OPENAI_API_KEY,
      timeout: parseInt(process.env.AI_TIMEOUT_MS || '15000', 10),
    });
  }

  async parseSearchIntent(
    userQuery: string,
    schemaContext: string
  ): Promise<IAIProviderResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: schemaContext },
          { role: 'user', content: userQuery },
        ],
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '500', 10),
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      let intent: ISearchIntent;

      try {
        intent = JSON.parse(content);
      } catch (parseError) {
        logger.error('[OpenAI] Failed to parse AI response as JSON', { content });
        throw new Error('AI returned invalid JSON response');
      }

      return {
        intent,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        responseTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      logger.error('[OpenAI] API call failed', {
        error: error.message,
        status: error.status,
        code: error.code,
      });

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('AI provider timed out. Please try again.');
      }

      throw error;
    }
  }
}

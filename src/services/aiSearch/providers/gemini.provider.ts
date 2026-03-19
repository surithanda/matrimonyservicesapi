import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider, IAIProviderResponse, ISearchIntent } from '../../../interfaces/aiSearch.interface';
import logger from '../../../config/logger';

export class GeminiProvider implements IAIProvider {
  name = 'gemini';
  model: string;
  private client: GoogleGenerativeAI;

  constructor() {
    if (!process.env.AI_GEMINI_API_KEY) {
      throw new Error('AI_GEMINI_API_KEY environment variable is required for Gemini provider');
    }
    this.model = process.env.AI_GEMINI_MODEL || 'gemini-2.0-flash';
    this.client = new GoogleGenerativeAI(process.env.AI_GEMINI_API_KEY);
  }

  async parseSearchIntent(
    userQuery: string,
    schemaContext: string
  ): Promise<IAIProviderResponse> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
          maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '500', 10),
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(
        `${schemaContext}\n\nUser search query: ${userQuery}`
      );

      const content = result.response.text();
      let intent: ISearchIntent;

      try {
        intent = JSON.parse(content);
      } catch (parseError) {
        logger.error('[Gemini] Failed to parse AI response as JSON', { content });
        throw new Error('AI returned invalid JSON response');
      }

      const usage = result.response.usageMetadata;

      return {
        intent,
        tokensUsed: {
          prompt: usage?.promptTokenCount || 0,
          completion: usage?.candidatesTokenCount || 0,
          total: usage?.totalTokenCount || 0,
        },
        responseTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      logger.error('[Gemini] API call failed', {
        error: error.message,
        status: error.status,
      });

      if (error.message?.includes('timeout') || error.message?.includes('DEADLINE_EXCEEDED')) {
        throw new Error('AI provider timed out. Please try again.');
      }

      throw error;
    }
  }
}

import { IAIProvider } from '../../interfaces/aiSearch.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

const SUPPORTED_PROVIDERS = ['openai', 'gemini'] as const;
type ProviderName = typeof SUPPORTED_PROVIDERS[number];

export function createAIProvider(providerOverride?: string): IAIProvider {
  const provider = (providerOverride || process.env.AI_PROVIDER || 'openai').toLowerCase() as ProviderName;

  switch (provider) {
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(
        `Unknown AI provider: "${provider}". Supported: ${SUPPORTED_PROVIDERS.join(', ')}`
      );
  }
}

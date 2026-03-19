import { createAIProvider } from '../../services/aiSearch/aiProviderFactory';

describe('AIProviderFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.AI_OPENAI_API_KEY = 'test-openai-key';
    process.env.AI_GEMINI_API_KEY = 'test-gemini-key';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should create OpenAI provider by default', () => {
    delete process.env.AI_PROVIDER;
    const provider = createAIProvider();
    expect(provider.name).toBe('openai');
  });

  it('should create OpenAI provider when AI_PROVIDER=openai', () => {
    process.env.AI_PROVIDER = 'openai';
    const provider = createAIProvider();
    expect(provider.name).toBe('openai');
  });

  it('should create Gemini provider when AI_PROVIDER=gemini', () => {
    process.env.AI_PROVIDER = 'gemini';
    const provider = createAIProvider();
    expect(provider.name).toBe('gemini');
  });

  it('should accept provider override parameter', () => {
    process.env.AI_PROVIDER = 'openai';
    const provider = createAIProvider('gemini');
    expect(provider.name).toBe('gemini');
  });

  it('should be case-insensitive', () => {
    const provider = createAIProvider('OPENAI');
    expect(provider.name).toBe('openai');
  });

  it('should throw on unknown provider', () => {
    expect(() => createAIProvider('claude')).toThrow(
      'Unknown AI provider: "claude". Supported: openai, gemini'
    );
  });

  it('should use default model when env not set', () => {
    delete process.env.AI_OPENAI_MODEL;
    const provider = createAIProvider('openai');
    expect(provider.model).toBe('gpt-4o-mini');
  });

  it('should use custom model from env', () => {
    process.env.AI_OPENAI_MODEL = 'gpt-4o';
    const provider = createAIProvider('openai');
    expect(provider.model).toBe('gpt-4o');
  });

  it('should use default Gemini model when env not set', () => {
    delete process.env.AI_GEMINI_MODEL;
    const provider = createAIProvider('gemini');
    expect(provider.model).toBe('gemini-2.0-flash');
  });

  it('should throw when OpenAI key is missing', () => {
    delete process.env.AI_OPENAI_API_KEY;
    expect(() => createAIProvider('openai')).toThrow(
      'AI_OPENAI_API_KEY environment variable is required'
    );
  });

  it('should throw when Gemini key is missing', () => {
    delete process.env.AI_GEMINI_API_KEY;
    expect(() => createAIProvider('gemini')).toThrow(
      'AI_GEMINI_API_KEY environment variable is required'
    );
  });
});

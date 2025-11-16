// OpenAI Service for ChatGPT integration

class OpenAIService {
  constructor() {
    this.apiKey = null;
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      lastRequestTime: null,
      errors: []
    };
    this.models = {
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        maxTokens: 4096,
        costPerToken: 0.000002 // $0.002 per 1K tokens
      },
      'gpt-4': {
        name: 'GPT-4',
        maxTokens: 8192,
        costPerToken: 0.00003 // $0.03 per 1K tokens
      }
    };
  }

  // API Key Management
  setApiKey(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('Valid API key is required');
    }
    this.apiKey = key.trim();
    localStorage.setItem('openai_api_key', this.apiKey);
  }

  getApiKey() {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openai_api_key');
    }
    return this.apiKey;
  }

  hasApiKey() {
    return Boolean(this.getApiKey());
  }

  removeApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }

  // Validation
  validateApiKey(key = null) {
    const apiKey = key || this.getApiKey();
    if (!apiKey) return false;
    return apiKey.startsWith('sk-') && apiKey.length > 20;
  }

  // Chat completion with streaming support
  async createChatCompletion(messages, options = {}) {
    if (!this.hasApiKey()) {
      throw new Error('OpenAI API key not configured. Please set your API key in the ChatGPT widget settings.');
    }

    const defaultOptions = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    };

    const config = { ...defaultOptions, ...options };

    // Validate model exists
    if (!this.models[config.model]) {
      throw new Error(`Unsupported model: ${config.model}`);
    }

    // Add system message if provided
    const fullMessages = this.prepareMessages(messages, options.systemPrompt);

    const payload = {
      model: config.model,
      messages: fullMessages,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      stream: config.stream
    };

    const startTime = Date.now();

    try {
      const response = config.stream
        ? await this.streamingChatCompletion(payload)
        : await this.standardChatCompletion(payload);

      // Track usage
      this.trackUsage(config.model, startTime, response.usage);

      return response;
    } catch (error) {
      this.trackError(error);
      throw error;
    }
  }

  // Standard (non-streaming) completion
  async standardChatCompletion(payload) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${response.status} - ${errorBody.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  // Streaming completion (for future enhancement)
  async streamingChatCompletion(payload) {
    // Note: Streaming requires specific handling with EventSource or Server-Sent Events
    // For now, fall back to standard completion
    payload.stream = false;
    return this.standardChatCompletion(payload);
  }

  // Prepare messages with system prompt
  prepareMessages(userMessages, systemPrompt = null) {
    const messages = [...userMessages];

    if (systemPrompt) {
      messages.unshift({
        role: 'system',
        content: systemPrompt
      });
    }

    return messages;
  }

  // Usage tracking
  trackUsage(model, startTime, usage = null) {
    this.usageStats.totalRequests++;
    this.usageStats.lastRequestTime = startTime;

    if (usage && usage.total_tokens) {
      this.usageStats.totalTokens += usage.total_tokens;
    }

    // Persist to localStorage
    localStorage.setItem('openai_usage_stats', JSON.stringify(this.usageStats));
  }

  trackError(error) {
    this.usageStats.errors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack
    });

    // Keep only last 10 errors
    if (this.usageStats.errors.length > 10) {
      this.usageStats.errors.shift();
    }

    localStorage.setItem('openai_usage_stats', JSON.stringify(this.usageStats));
  }

  // Get usage statistics
  getUsageStats() {
    const stored = localStorage.getItem('openai_usage_stats');
    if (stored) {
      this.usageStats = { ...this.usageStats, ...JSON.parse(stored) };
    }
    return { ...this.usageStats };
  }

  // Estimate cost
  estimateCost(model, tokensUsed) {
    const modelInfo = this.models[model];
    if (!modelInfo) return 0;

    return (tokensUsed / 1000) * modelInfo.costPerToken;
  }

  // Get available models
  getAvailableModels() {
    return Object.keys(this.models).map(key => ({
      id: key,
      name: this.models[key].name,
      maxTokens: this.models[key].maxTokens,
      costPerToken: this.models[key].costPerToken
    }));
  }

  // Test API key
  async testApiKey(apiKey = null) {
    const testKey = apiKey || this.getApiKey();
    if (!testKey) return false;

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  // Clear all stored data
  clearStoredData() {
    this.removeApiKey();
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      lastRequestTime: null,
      errors: []
    };
    localStorage.removeItem('openai_usage_stats');
  }
}

// Create singleton instance
const openaiService = new OpenAIService();

export default openaiService;

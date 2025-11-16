// API Client with interceptors, caching, and rate limiting

class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.cache = new Map();
    this.requests = new Map(); // For tracking request counts (rate limiting)
    this.rateLimits = new Map();
    this.interceptors = {
      request: [],
      response: []
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  // Rate limiting check
  checkRateLimit(endpoint, limit = 100, windowMs = 60000) { // 100 requests per minute default
    const key = endpoint;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requests = this.requests.get(key);

    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }

    if (requests.length >= limit) {
      throw new Error(`Rate limit exceeded for ${endpoint}. Try again later.`);
    }

    requests.push(now);
  }

  // Cache management
  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key); // Remove expired cache
    return null;
  }

  setCache(key, data, ttlMs = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  // Main request method
  async request(url, options = {}) {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Check rate limit
    this.checkRateLimit(fullURL);

    // Apply request interceptors
    let processedOptions = { ...options };
    for (const interceptor of this.interceptors.request) {
      processedOptions = await interceptor(processedOptions);
    }

    try {
      const response = await fetch(fullURL, processedOptions);

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Apply response interceptors
      let processedData = data;
      for (const interceptor of this.interceptors.response) {
        processedData = await interceptor(processedData, response);
      }

      return processedData;
    } catch (error) {
      // Enhanced error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server');
      }
      throw error;
    }
  }

  // Convenience methods
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(body)
    });
  }

  async put(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(body)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // Mock API for development
  mockAPI = {
    get: (url) => {
      const mockData = {
        'https://api.openai.com/v1/chat/completions': {
          choices: [{ message: { content: 'This is a mock response for development.' } }]
        }
      };
      return Promise.resolve(mockData[url] || { error: 'Mock endpoint not found' });
    },
    post: (url) => {
      return this.mockAPI.get(url);
    }
  };

  // Enable/disable mock mode
  setMockMode(enabled = true) {
    this.isMockMode = enabled;
    if (enabled) {
      this.addRequestInterceptor(async () => {
        // In interceptors, we could check for mock headers
        return null;
      });
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        expiresAt: new Date(value.expiry)
      }))
    };
  }
}

// Create instance
const apiClient = new APIClient();

// Add default headers interceptor
apiClient.addRequestInterceptor(async (options) => {
  return {
    ...options,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Business-Copilot/1.0',
      ...options.headers
    }
  };
});

// Add logging interceptor
apiClient.addResponseInterceptor(async (data, response) => {
  console.log(`API Call: ${response.url} - Status: ${response.status}`);
  return data;
});

export default apiClient;

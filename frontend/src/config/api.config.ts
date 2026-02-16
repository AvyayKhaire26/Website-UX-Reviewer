export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    REVIEW: '/api/v1/review',
    REVIEWS_HISTORY: '/api/v1/reviews',
    REVIEW_BY_ID: (id: string) => `/api/v1/review/${id}`,
    HEALTH: '/api/v1/health',
    HEALTH_LLM: '/api/v1/health/llm',
    HEALTH_DATABASE: '/api/v1/health/database',
    HEALTH_SCREENSHOT: '/api/v1/health/screenshot',
  },
  TIMEOUT: 500000,
};

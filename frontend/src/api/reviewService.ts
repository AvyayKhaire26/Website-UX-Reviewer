import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { ReviewRequest, ReviewResponse, ReviewListResponse, ReviewData } from '../types/review.types';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ReviewService {
  // Create review - NO TRANSFORMATION
  static async createReview(request: ReviewRequest): Promise<{ success: boolean; data?: ReviewData; error?: string }> {
    try {
      const response = await apiClient.post<ReviewResponse>(
        API_CONFIG.ENDPOINTS.REVIEW,
        request
      );
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Get last 5 reviews - NO TRANSFORMATION
  static async getReviewHistory(): Promise<{ success: boolean; data?: ReviewData[]; error?: string }> {
    try {
      const response = await apiClient.get<ReviewListResponse>(
        API_CONFIG.ENDPOINTS.REVIEWS_HISTORY
      );
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'Failed to fetch review history',
      };
    }
  }

  // Get review by ID - NO TRANSFORMATION
  static async getReviewById(id: string): Promise<{ success: boolean; data?: ReviewData; error?: string }> {
    try {
      const response = await apiClient.get<ReviewResponse>(
        API_CONFIG.ENDPOINTS.REVIEW_BY_ID(id)
      );
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'Failed to fetch review',
      };
    }
  }

  // Health checks remain same
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async checkLLMHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH_LLM);
      return {
        healthy: response.status === 200,
        message: response.data.llm === 'ok' ? 'LLM service operational' : 'LLM service unavailable',
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Cannot connect to LLM service',
      };
    }
  }

  static async checkDatabaseHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH_DATABASE);
      return {
        healthy: response.status === 200,
        message: response.data.database === 'ok' ? 'Database connected' : 'Database unavailable',
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Cannot connect to database',
      };
    }
  }

  static async checkScreenshotHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH_SCREENSHOT);
      return {
        healthy: response.status === 200,
        message: response.data.screenshot === 'ok' ? 'Playwright ready' : 'Playwright unavailable',
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Cannot verify screenshot service',
      };
    }
  }
}

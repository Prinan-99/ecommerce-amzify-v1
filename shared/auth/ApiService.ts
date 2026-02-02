/**
 * Enhanced API Service with Authentication Integration
 * 
 * This service provides automatic token inclusion in API requests,
 * request interceptors for authentication headers, and token refresh
 * handling for API calls.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { SessionManager } from './SessionManager';
import { AuthenticationService } from './AuthenticationService';

/**
 * API Service class with authentication integration
 * Provides automatic token handling, refresh, and error management
 */
export class ApiService {
  private axiosInstance: AxiosInstance;
  private sessionManager: SessionManager;
  private authService: AuthenticationService;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(baseURL: string = '/api') {
    this.sessionManager = new SessionManager();
    this.authService = new AuthenticationService();
    
    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors for authentication
   */
  private setupInterceptors(): void {
    // Request interceptor - automatically add authentication headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const sessionData = this.sessionManager.getSessionData();
        
        if (sessionData?.accessToken) {
          config.headers.Authorization = `Bearer ${sessionData.accessToken}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh and errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful requests in development
        if (process.env.NODE_ENV === 'development') {
          const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();
          console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh the token
            const refreshed = await this.sessionManager.refreshSession();
            
            if (refreshed) {
              // Process queued requests
              this.processQueue(null);
              
              // Retry the original request with new token
              const sessionData = this.sessionManager.getSessionData();
              if (sessionData?.accessToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${sessionData.accessToken}`;
              }
              
              return this.axiosInstance(originalRequest);
            } else {
              // Refresh failed, redirect to login
              this.processQueue(new Error('Token refresh failed'));
              this.handleAuthenticationFailure();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.handleAuthenticationFailure();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Handle authentication failure by clearing session and redirecting
   */
  private handleAuthenticationFailure(): void {
    this.sessionManager.clearSession();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Handle API errors with appropriate logging and user feedback
   */
  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status,
        message,
        error
      });
    }

    // Handle specific error types
    switch (status) {
      case 403:
        console.warn('Access denied - insufficient permissions');
        break;
      case 404:
        console.warn('Resource not found');
        break;
      case 429:
        console.warn('Rate limit exceeded');
        break;
      case 500:
        console.error('Server error occurred');
        break;
      default:
        if (status && status >= 500) {
          console.error('Server error occurred');
        }
    }
  }

  /**
   * Make a GET request with authentication
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request with authentication
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request with authentication
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request with authentication
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request with authentication
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload files with authentication
   */
  public async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const uploadConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await this.axiosInstance.post<T>(url, formData, uploadConfig);
    return response.data;
  }

  /**
   * Download files with authentication
   */
  public async download(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const downloadConfig = {
      ...config,
      responseType: 'blob' as const,
    };
    
    const response = await this.axiosInstance.get(url, downloadConfig);
    return response.data;
  }

  /**
   * Get the current authentication token
   */
  public getAuthToken(): string | null {
    const sessionData = this.sessionManager.getSessionData();
    return sessionData?.accessToken || null;
  }

  /**
   * Check if the user is authenticated
   */
  public isAuthenticated(): boolean {
    const sessionData = this.sessionManager.getSessionData();
    return !!sessionData?.accessToken;
  }

  /**
   * Get the current user's role
   */
  public getUserRole(): string | null {
    const sessionData = this.sessionManager.getSessionData();
    return sessionData?.user?.role || null;
  }

  /**
   * Create a new instance with different base URL
   */
  public createInstance(baseURL: string): ApiService {
    return new ApiService(baseURL);
  }
}

// Create default instances for different services
export const adminApi = new ApiService('/api/admin');
export const sellerApi = new ApiService('/api/seller');
export const customerApi = new ApiService('/api/customer');

// Export default instance
export default new ApiService();
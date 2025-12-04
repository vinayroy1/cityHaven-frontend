import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { ApiResponse, ApiError } from "@/types/api.types";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: APP_CONFIG.API.BASE_URL,
      timeout: APP_CONFIG.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const isRefreshCall = originalRequest?.url?.includes(API_ENDPOINTS.auth.refreshToken);

        if (status === 401 && !isRefreshCall) {
          try {
            const newToken = await this.refreshAccessToken();
            if (newToken && originalRequest) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (err) {
            // fall through to clear/redirect
          }
          this.clearTokens();
          window.location.href = "/login";
        }
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      code: error.code,
    };
  }

  private getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;
    this.refreshPromise = this.client
      .post<{ data?: { accessToken?: string; refreshToken?: string } }>(API_ENDPOINTS.auth.refreshToken, { refreshToken })
      .then((res) => {
        const tokens = res.data?.data;
        if (tokens?.accessToken) {
          localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, tokens.accessToken);
          if (tokens.refreshToken) localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, tokens.refreshToken);
          return tokens.accessToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        this.refreshPromise = null;
      });
    return this.refreshPromise;
  }

  private clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

export const apiClient = new ApiClient();

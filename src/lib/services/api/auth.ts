import { apiClient } from './client';
import { User, AuthUser, LoginCredentials, RegisterData } from '@/types/user.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { APP_CONFIG } from '@/constants/app-config';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>(API_ENDPOINTS.auth.login, credentials);
    
    if (response.data.accessToken && typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, response.data.accessToken);
      localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, response.data.refreshToken);
      // Store the auth user data as the user object
      localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data));
    }

    return response.data;
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>(API_ENDPOINTS.auth.register, data);
    
    if (response.data.accessToken && typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, response.data.accessToken);
      localStorage.setItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(response.data));
    }

    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } finally {
      this.clearAuthData();
    }
  },

  // Refresh access token
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ accessToken: string }>(
      API_ENDPOINTS.auth.refreshToken,
      { refreshToken }
    );

    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, response.data.accessToken);
    }

    return response.data.accessToken;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.auth.me);
    return response.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.auth.profile, data);
    
    if (typeof window !== 'undefined') {
      // Update the stored user data with the new profile data
      const currentUser = this.getStoredUser();
      const updatedUser = currentUser ? { ...currentUser, ...response.data } : response.data;
      localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(updatedUser));
    }

    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.changePassword, {
      currentPassword,
      newPassword,
    });
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
      token,
      newPassword,
    });
  },

  // Helper methods
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    }
    return null;
  },

  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    }
  },
};

export default authService;

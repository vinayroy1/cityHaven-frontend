import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import authService from './auth';
import apiClient from './client';
import { LoginCredentials, RegisterData } from '@/types/user.types';

// Mock the apiClient
jest.mock('./client', () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user and store tokens', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const mockResponse = {
        user: { id: '1', email: 'john@example.com' },
        token: 'new-token',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authService.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should logout user and clear tokens', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({});

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should clear tokens even if logout request fails', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(authService.logout()).resolves.not.toThrow();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user data', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = { name: 'Updated Name' };
      const mockResponse = { data: { id: '1', email: 'test@example.com', name: 'Updated Name' } };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(updates);

      expect(apiClient.put).toHaveBeenCalledWith('/auth/profile', updates);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('token management', () => {
    it('should get access token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('stored-token');

      const result = authService.getAccessToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
      expect(result).toBe('stored-token');
    });

    it('should return null when no access token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.getAccessToken();

      expect(result).toBeNull();
    });

    it('should check if user is authenticated', () => {
      localStorageMock.getItem.mockReturnValue('valid-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should check if user is not authenticated', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('clearAuthData', () => {
    it('should clear all authentication data', () => {
      authService.clearAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });
});
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { authService } from "./auth";
import { apiClient } from "./client";
import { LoginCredentials, RegisterData, User } from "@/types/user.types";
import { APP_CONFIG } from "@/constants/app-config";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

// Mock the apiClient
jest.mock("./client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login user and store tokens", async () => {
      const credentials: LoginCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse = {
        data: {
          id: "1",
          email: "test@example.com",
          role: "user",
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      };

      mockedApiClient.post.mockResolvedValue({ success: true, data: mockResponse.data, timestamp: "" });

      const result = await authService.login(credentials);

      expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.login, credentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.TOKEN_KEY, "access-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY, "refresh-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(mockResponse.data));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const registerData: RegisterData = {
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const mockResponse = {
        id: "1",
        email: "john@example.com",
        role: "user",
        accessToken: "new-token",
        refreshToken: "refresh-token",
      };

      mockedApiClient.post.mockResolvedValue({ success: true, data: mockResponse, timestamp: "" });

      const result = await authService.register(registerData);

      expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.register, registerData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should logout user and clear tokens", async () => {
      mockedApiClient.post.mockResolvedValue({ success: true, data: {}, timestamp: "" });

      await authService.logout();

      expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.logout);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.TOKEN_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.USER_KEY);
    });

    it("should clear tokens even if logout request fails", async () => {
      mockedApiClient.post.mockRejectedValue(new Error("Network error"));

      await expect(authService.logout()).resolves.not.toThrow();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.TOKEN_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.USER_KEY);
    });
  });

  describe("getCurrentUser", () => {
    it("should fetch current user data", async () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
      mockedApiClient.get.mockResolvedValue({ success: true, data: mockUser, timestamp: "" });

      const result = await authService.getCurrentUser();

      expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.auth.me);
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const updates: Partial<User> = { firstName: "Updated", lastName: "Name" };
      const mockResponse = {
        success: true,
        data: {
          id: "1",
          email: "test@example.com",
          firstName: "Updated",
          lastName: "Name",
          role: "user",
          preferences: { notifications: true, newsletter: true },
          createdAt: "",
          updatedAt: "",
        },
        timestamp: "",
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(updates);

      expect(mockedApiClient.put).toHaveBeenCalledWith(API_ENDPOINTS.auth.profile, updates);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(mockResponse.data));
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("token management", () => {
    it("should get access token from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("stored-token");

      const result = authService.getAccessToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.TOKEN_KEY);
      expect(result).toBe("stored-token");
    });

    it("should return null when no access token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.getAccessToken();

      expect(result).toBeNull();
    });

    it("should check if user is authenticated", () => {
      localStorageMock.getItem.mockReturnValue("valid-token");

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it("should check if user is not authenticated", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("clearAuthData", () => {
    it("should clear all authentication data", () => {
      authService.clearAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.TOKEN_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(APP_CONFIG.AUTH.USER_KEY);
    });
  });
});

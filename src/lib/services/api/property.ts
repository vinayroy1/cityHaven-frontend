import { apiClient } from './client';
import { Property, PropertySearchParams } from '@/types/property.types';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { ApiResponse } from '@/types/api.types';

export const propertyService = {
  // Get all properties with pagination and search
  async getProperties(params?: PropertySearchParams): Promise<ApiResponse<Property[]>> {
    const response = await apiClient.get<ApiResponse<Property[]>>(API_ENDPOINTS.PROPERTIES.LIST, {
      params,
    });
    return response.data;
  },

  // Get single property by ID
  async getPropertyById(id: string): Promise<Property> {
    const response = await apiClient.get<Property>(
      API_ENDPOINTS.PROPERTIES.DETAIL.replace(':id', id)
    );
    return response.data;
  },

  // Search properties
  async searchProperties(query: string, filters?: PropertySearchParams['filters']): Promise<ApiResponse<Property[]>> {
    const response = await apiClient.get<ApiResponse<Property[]>>(API_ENDPOINTS.PROPERTIES.SEARCH, {
      params: { query, ...filters },
    });
    return response.data;
  },

  // Filter properties
  async filterProperties(filters: PropertySearchParams['filters']): Promise<ApiResponse<Property[]>> {
    const response = await apiClient.get<ApiResponse<Property[]>>(API_ENDPOINTS.PROPERTIES.FILTER, {
      params: filters,
    });
    return response.data;
  },

  // Create new property
  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const response = await apiClient.post<Property>(API_ENDPOINTS.PROPERTIES.CREATE, property);
    return response.data;
  },

  // Update property
  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const response = await apiClient.put<Property>(
      API_ENDPOINTS.PROPERTIES.UPDATE.replace(':id', id),
      property
    );
    return response.data;
  },

  // Delete property
  async deleteProperty(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROPERTIES.DELETE.replace(':id', id));
  },

  // Upload property image
  async uploadPropertyImage(id: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const response = await apiClient.upload<{ imageUrl: string }>(
      API_ENDPOINTS.PROPERTIES.UPLOAD_IMAGE.replace(':id', id),
      file,
      onProgress
    );
    return response.data.imageUrl;
  },
};
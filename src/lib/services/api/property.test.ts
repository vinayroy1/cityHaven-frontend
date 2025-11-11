import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { propertyService } from './property';
import { apiClient } from './client';
import { Property, PropertySearchParams } from '@/types/property.types';

// We will spy on apiClient methods to avoid real network calls

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProperties', () => {
    it('should fetch properties with pagination and search params', async () => {
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };
      
      jest.spyOn(apiClient, 'get').mockResolvedValue({ data: mockResponse } as any);

      const params: PropertySearchParams = {
        page: 1,
        limit: 10,
        query: 'test',
      };

      const result = await propertyService.getProperties(params);

      expect(apiClient.get).toHaveBeenCalledWith('/properties', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPropertyById', () => {
    it('should fetch single property by ID', async () => {
      const mockProperty: Property = {
        id: '123',
        title: 'Test Property',
        description: 'Test description',
        price: 100000,
        location: {
          address: '123 Test St',
          city: 'Testville',
          state: 'TS',
          zipCode: '12345',
        },
        details: {
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          yearBuilt: 2020,
          propertyType: 'house',
          status: 'available',
        },
        images: [],
        amenities: [],
        agent: {
          id: 'agent-1',
          name: 'Agent Name',
          email: 'agent@example.com',
          phone: '123-456-7890',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(apiClient, 'get').mockResolvedValue({ data: mockProperty } as any);

      const result = await propertyService.getPropertyById('123');

      expect(apiClient.get).toHaveBeenCalledWith('/properties/123');
      expect(result).toEqual(mockProperty);
    });
  });

  describe('searchProperties', () => {
    it('should search properties with query and filters', async () => {
      const mockResponse = { data: { properties: [], total: 0 } };
      jest.spyOn(apiClient, 'get').mockResolvedValue({ data: mockResponse } as any);

      const result = await propertyService.searchProperties('New York', {
        location: { city: 'New York' },
        priceRange: { min: 100000, max: 500000 },
      });

      expect(apiClient.get).toHaveBeenCalledWith('/properties/search', {
        params: {
          query: 'New York',
          location: { city: 'New York' },
          priceRange: { min: 100000, max: 500000 },
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProperty', () => {
    it('should create a new property', async () => {
      const mockPropertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        title: 'Test Property',
        description: 'Test description',
        price: 250000,
        location: {
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
        },
        details: {
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          yearBuilt: 2020,
          propertyType: 'house',
          status: 'available',
        },
        images: ['https://example.com/image.jpg'],
        amenities: ['garage'],
        agent: {
          id: 'agent-1',
          name: 'Agent Name',
          email: 'agent@example.com',
          phone: '123-456-7890',
        },
      };

      const mockResponse = { data: { id: '1', ...mockPropertyData } };
      jest.spyOn(apiClient, 'post').mockResolvedValue(mockResponse as any);

      const result = await propertyService.createProperty(mockPropertyData);

      expect(apiClient.post).toHaveBeenCalledWith('/properties', mockPropertyData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateProperty', () => {
    it('should update existing property', async () => {
      const updates = { title: 'Updated Title', price: 250000 };
      const mockResponse = { ...updates, id: '123' };

      jest.spyOn(apiClient, 'put').mockResolvedValue({ data: mockResponse } as any);

      const result = await propertyService.updateProperty('123', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/properties/123', updates);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProperty', () => {
    it('should delete property', async () => {
      jest.spyOn(apiClient, 'delete').mockResolvedValue({} as any);

      await propertyService.deleteProperty('123');

      expect(apiClient.delete).toHaveBeenCalledWith('/properties/123');
    });
  });

  describe('uploadPropertyImage', () => {
    it('should upload property image', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { data: { imageUrl: 'https://example.com/image.jpg' } };
      const mockProgress = jest.fn();

      jest.spyOn(apiClient, 'upload').mockResolvedValue(mockResponse as any);

      const result = await propertyService.uploadPropertyImage('123', mockFile, mockProgress);

      expect(apiClient.upload).toHaveBeenCalledWith(
        '/properties/123/images',
        mockFile,
        mockProgress
      );
      expect(result).toBe('https://example.com/image.jpg');
    });
  });
});
import { describe, it, expect } from '@jest/globals';
import { formatDate, formatCurrency, calculateDaysAgo } from './date';

describe('date utility functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-15');
      expect(formatDate(date)).toBe('January 15, 2023');
    });

    it('should format date string correctly', () => {
      expect(formatDate('2023-01-15')).toBe('January 15, 2023');
    });

    it('should handle invalid dates gracefully', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format decimal amounts correctly', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
    });

    it('should format large amounts correctly', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('calculateDaysAgo', () => {
    it('should calculate days ago correctly for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(calculateDaysAgo(pastDate)).toBe(5);
    });

    it('should return 0 for current date', () => {
      expect(calculateDaysAgo(new Date())).toBe(0);
    });

    it('should handle date strings correctly', () => {
      const dateString = new Date();
      dateString.setDate(dateString.getDate() - 10);
      expect(calculateDaysAgo(dateString.toISOString())).toBe(10);
    });

    it('should calculate days ago correctly for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      expect(calculateDaysAgo(futureDate)).toBe(3);
    });
  });
});
import { describe, it, expect } from '@jest/globals';
import { cn } from './cn';

describe('cn utility function', () => {
  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('px-4 py-1');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-true', false && 'conditional-false');
    expect(result).toBe('base-class conditional-true');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'visible': true,
    });
    expect(result).toBe('active visible');
  });

  it('should handle mixed input types', () => {
    const result = cn(
      'base',
      ['array1', 'array2'],
      { conditional: true, skip: false },
      'string'
    );
    expect(result).toBe('base array1 array2 conditional string');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toBe('base valid');
  });

  it('should handle empty strings', () => {
    const result = cn('base', '', 'valid');
    expect(result).toBe('base valid');
  });

  it('should merge conflicting Tailwind classes', () => {
    const result = cn('p-2', 'p-4', 'm-1', 'm-3');
    expect(result).toBe('p-4 m-3');
  });
});
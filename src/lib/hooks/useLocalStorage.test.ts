import { renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

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

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should return initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should return stored value when localStorage has data', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('should set value in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    // Set new value
    const newValue = 'new-value';
    result.current[1](newValue);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(newValue));
  });

  it('should handle function-based updates', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5));
    
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    // Update using function
    result.current[1]((prev) => prev + 1);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('counter', JSON.stringify(6));
  });

  it('should handle objects', () => {
    const initialObject = { name: 'John', age: 30 };
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('user', initialObject));
    
    expect(result.current[0]).toEqual(initialObject);
    
    // Update object
    const updatedObject = { name: 'Jane', age: 25 };
    result.current[1](updatedObject);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedObject));
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => useLocalStorage('error-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalledWith('Error reading localStorage key "error-key":', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should handle server-side rendering', () => {
    // Temporarily remove window object to simulate SSR
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    const { result } = renderHook(() => useLocalStorage('ssr-key', 'ssr-value'));
    
    expect(result.current[0]).toBe('ssr-value');
    
    // Restore window object
    global.window = originalWindow;
  });
});
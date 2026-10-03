import { renderHook } from '@testing-library/react';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted Hook', () => {
  it('should return false initially', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current).toBe(false);
  });

  it('should return true after component mounts', () => {
    const { result } = renderHook(() => useIsMounted());
    
    // After render, the effect should have run
    expect(result.current).toBe(true);
  });

  it('should handle multiple renders', () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    
    expect(result.current).toBe(true);
    
    // Re-render should keep it true
    rerender();
    expect(result.current).toBe(true);
    
    // Another re-render
    rerender();
    expect(result.current).toBe(true);
  });

  it('should be consistent across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useIsMounted());
    const { result: result2 } = renderHook(() => useIsMounted());
    
    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });
});
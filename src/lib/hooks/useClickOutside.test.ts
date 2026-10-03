import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside Hook', () => {
  let mockHandler: jest.Mock;
  let container: HTMLDivElement;
  let insideElement: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    mockHandler = jest.fn();
    container = document.createElement('div');
    insideElement = document.createElement('div');
    outsideElement = document.createElement('div');
    
    container.appendChild(insideElement);
    document.body.appendChild(container);
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(outsideElement);
  });

  it('should call handler when clicking outside the element', () => {
    const { result } = renderHook(() => useClickOutside(mockHandler));
    
    // Set ref to container
    result.current(container);
    
    // Simulate click outside
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    outsideElement.dispatchEvent(clickEvent);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when clicking inside the element', () => {
    const { result } = renderHook(() => useClickOutside(mockHandler));
    
    // Set ref to container
    result.current(container);
    
    // Simulate click inside
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    insideElement.dispatchEvent(clickEvent);
    
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should not call handler when clicking on ignored elements', () => {
    const ignoreElement = document.createElement('div');
    document.body.appendChild(ignoreElement);
    
    const { result } = renderHook(() => useClickOutside(mockHandler, [ignoreElement]));
    
    // Set ref to container
    result.current(container);
    
    // Simulate click on ignored element
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    ignoreElement.dispatchEvent(clickEvent);
    
    expect(mockHandler).not.toHaveBeenCalled();
    
    document.body.removeChild(ignoreElement);
  });

  it('should handle null ref gracefully', () => {
    const { result } = renderHook(() => useClickOutside(mockHandler));
    
    // Don't set ref (remains null)
    
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    document.body.dispatchEvent(clickEvent);
    
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should handle null elements in ignoreElements array', () => {
    const { result } = renderHook(() => useClickOutside(mockHandler, [null]));
    
    // Set ref to container
    result.current(container);
    
    // Simulate click outside
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    outsideElement.dispatchEvent(clickEvent);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should clean up event listener on unmount', () => {
    const { result, unmount } = renderHook(() => useClickOutside(mockHandler));
    
    // Set ref to container
    result.current(container);
    
    // Unmount the hook
    unmount();
    
    // Simulate click outside after unmount
    const clickEvent = new MouseEvent('mousedown', { bubbles: true });
    outsideElement.dispatchEvent(clickEvent);
    
    expect(mockHandler).not.toHaveBeenCalled();
  });
});
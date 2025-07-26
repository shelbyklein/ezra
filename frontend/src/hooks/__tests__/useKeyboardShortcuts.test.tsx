/**
 * Tests for useKeyboardShortcuts hook
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { BrowserRouter } from 'react-router-dom';

// Mock useLocation
const mockLocation = { pathname: '/app/board/1' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

// Create wrapper component for hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    {children}
  </BrowserRouter>
);

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Clear all custom event listeners
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    expect(result.current.selectedTaskId).toBeNull();
    expect(result.current.isHelpOpen).toBe(false);
    expect(result.current.isNewTaskOpen).toBe(false);
    expect(result.current.shortcuts).toBeDefined();
  });

  it('shows help modal on ? key press', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Simulate pressing '?' key
    act(() => {
      const event = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
      window.dispatchEvent(event);
    });
    
    expect(result.current.isHelpOpen).toBe(true);
  });

  it('opens new task modal on N key when on board', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Simulate pressing 'n' key
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'n' });
      window.dispatchEvent(event);
    });
    
    expect(result.current.isNewTaskOpen).toBe(true);
  });

  it('does not trigger shortcuts when typing in input', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Create an input element and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    // Simulate pressing 'n' key while input is focused
    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'n',
        bubbles: true
      });
      Object.defineProperty(event, 'target', {
        value: input,
        enumerable: true
      });
      input.dispatchEvent(event);
    });
    
    expect(result.current.isNewTaskOpen).toBe(false);
    
    // Cleanup
    document.body.removeChild(input);
  });

  it('triggers edit task event when E is pressed with selected task', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Set selected task
    act(() => {
      result.current.setSelectedTaskId(123);
    });
    
    // Mock event listener
    const mockEventListener = jest.fn();
    window.addEventListener('editTask', mockEventListener);
    
    // Simulate pressing 'e' key
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'e' });
      window.dispatchEvent(event);
    });
    
    expect(mockEventListener).toHaveBeenCalled();
    
    // Cleanup
    window.removeEventListener('editTask', mockEventListener);
  });

  it('triggers delete task event when Delete is pressed with selected task', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Set selected task
    act(() => {
      result.current.setSelectedTaskId(123);
    });
    
    // Mock event listener
    const mockEventListener = jest.fn();
    window.addEventListener('deleteTask', mockEventListener);
    
    // Simulate pressing Delete key
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);
    });
    
    expect(mockEventListener).toHaveBeenCalled();
    
    // Cleanup
    window.removeEventListener('deleteTask', mockEventListener);
  });

  it('deselects task on Escape key', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Set selected task
    act(() => {
      result.current.setSelectedTaskId(123);
    });
    
    expect(result.current.selectedTaskId).toBe(123);
    
    // Simulate pressing Escape key
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
    });
    
    expect(result.current.selectedTaskId).toBeNull();
  });

  it('triggers command bar event on Cmd+K', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    // Mock event listener
    const mockEventListener = jest.fn();
    window.addEventListener('openCommandBar', mockEventListener);
    
    // Simulate pressing Cmd+K
    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'k', 
        metaKey: true,
        ctrlKey: true 
      });
      window.dispatchEvent(event);
    });
    
    expect(mockEventListener).toHaveBeenCalled();
    
    // Cleanup
    window.removeEventListener('openCommandBar', mockEventListener);
  });

  it('updates selectedTaskId when taskSelected event is fired', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    expect(result.current.selectedTaskId).toBeNull();
    
    // Fire custom event
    act(() => {
      const event = new CustomEvent('taskSelected', { detail: { taskId: 456 } });
      window.dispatchEvent(event);
    });
    
    expect(result.current.selectedTaskId).toBe(456);
  });

  it('filters shortcuts based on enabled state', () => {
    // Mock location to not be on board
    mockLocation.pathname = '/app/settings';
    
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });
    
    const boardShortcuts = result.current.shortcuts.filter(s => 
      ['Create new task', 'Edit selected task'].includes(s.description)
    );
    
    expect(boardShortcuts).toHaveLength(0);
  });
});
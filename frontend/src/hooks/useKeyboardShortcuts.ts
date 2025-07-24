/**
 * Global keyboard shortcuts hook
 */

import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDisclosure } from '@chakra-ui/react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = () => {
  const location = useLocation();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { isOpen: isHelpOpen, onOpen: onOpenHelp, onClose: onCloseHelp } = useDisclosure();
  const { isOpen: isNewTaskOpen, onOpen: onOpenNewTask, onClose: onCloseNewTask } = useDisclosure();

  // Check if we're on the board page
  const isOnBoard = location.pathname.includes('/board/');
  
  // Parse project ID from URL
  const projectId = location.pathname.match(/\/board\/(\d+)/)?.[1];

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'n',
      description: 'Create new task',
      action: () => {
        if (isOnBoard) {
          onOpenNewTask();
        }
      },
      enabled: isOnBoard,
    },
    {
      key: 'e',
      description: 'Edit selected task',
      action: () => {
        if (selectedTaskId && isOnBoard) {
          // Trigger edit modal for selected task
          const event = new CustomEvent('editTask', { detail: { taskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard && !!selectedTaskId,
    },
    {
      key: 'Delete',
      description: 'Delete selected task',
      action: () => {
        if (selectedTaskId && isOnBoard) {
          // Trigger delete confirmation for selected task
          const event = new CustomEvent('deleteTask', { detail: { taskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard && !!selectedTaskId,
    },
    {
      key: ' ',
      description: 'Change task status',
      action: () => {
        if (selectedTaskId && isOnBoard) {
          // Cycle through task statuses
          const event = new CustomEvent('cycleTaskStatus', { detail: { taskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard && !!selectedTaskId,
    },
    {
      key: 'ArrowUp',
      description: 'Select previous task',
      action: () => {
        if (isOnBoard) {
          const event = new CustomEvent('selectPreviousTask', { detail: { currentTaskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard,
    },
    {
      key: 'ArrowDown',
      description: 'Select next task',
      action: () => {
        if (isOnBoard) {
          const event = new CustomEvent('selectNextTask', { detail: { currentTaskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard,
    },
    {
      key: 'ArrowLeft',
      description: 'Move task to previous column',
      action: () => {
        if (selectedTaskId && isOnBoard) {
          const event = new CustomEvent('moveTaskLeft', { detail: { taskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard && !!selectedTaskId,
    },
    {
      key: 'ArrowRight',
      description: 'Move task to next column',
      action: () => {
        if (selectedTaskId && isOnBoard) {
          const event = new CustomEvent('moveTaskRight', { detail: { taskId: selectedTaskId } });
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard && !!selectedTaskId,
    },
    {
      key: '/',
      description: 'Search tasks',
      action: () => {
        if (isOnBoard) {
          const event = new CustomEvent('openSearch');
          window.dispatchEvent(event);
        }
      },
      enabled: isOnBoard,
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        onOpenHelp();
      },
      enabled: true,
    },
    {
      key: 'Escape',
      description: 'Deselect task / Close modals',
      action: () => {
        setSelectedTaskId(null);
        // Also trigger a general close event for modals
        const event = new CustomEvent('closeModals');
        window.dispatchEvent(event);
      },
      enabled: true,
    },
    {
      key: 'k',
      cmd: true,
      ctrl: true,
      description: 'Open AI command bar',
      action: () => {
        const event = new CustomEvent('openCommandBar');
        window.dispatchEvent(event);
      },
      enabled: true,
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).contentEditable === 'true'
    ) {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = event.key === shortcut.key;
      const ctrlMatches = !shortcut.ctrl || event.ctrlKey;
      const cmdMatches = !shortcut.cmd || event.metaKey;
      const shiftMatches = !shortcut.shift || event.shiftKey;
      const altMatches = !shortcut.alt || event.altKey;
      
      return keyMatches && ctrlMatches && cmdMatches && shiftMatches && altMatches && shortcut.enabled !== false;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [selectedTaskId, isOnBoard, projectId]);

  // Listen for task selection events
  useEffect(() => {
    const handleTaskSelected = (event: CustomEvent) => {
      setSelectedTaskId(event.detail.taskId);
    };

    window.addEventListener('taskSelected' as any, handleTaskSelected);
    return () => {
      window.removeEventListener('taskSelected' as any, handleTaskSelected);
    };
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: shortcuts.filter(s => s.enabled !== false),
    selectedTaskId,
    setSelectedTaskId,
    isHelpOpen,
    onOpenHelp,
    onCloseHelp,
    isNewTaskOpen,
    onCloseNewTask,
  };
};
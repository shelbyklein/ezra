/**
 * Kanban board component with drag-and-drop functionality
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Spinner,
  Center,
  useToast,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, ArrowLeftIcon, EditIcon } from '@chakra-ui/icons';
import { FaMagic, FaBook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { api } from '../../services/api';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { CreateTaskForm } from '../Tasks/CreateTaskForm';
import { TaskDetailModal } from '../Tasks/TaskDetailModal';
import { NaturalLanguageInput } from '../AI/NaturalLanguageInput';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../common/KeyboardShortcutsHelp';
import { CreateProjectModal } from '../Projects/CreateProjectModal';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: number;
  position: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  color?: string;
}

const COLUMN_TITLES = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
} as const;

export const Board: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isNLOpen, onOpen: onNLOpen, onClose: onNLClose } = useDisclosure();
  const { isOpen: isProjectEditOpen, onOpen: onProjectEditOpen, onClose: onProjectEditClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Initialize keyboard shortcuts
  const {
    shortcuts,
    selectedTaskId,
    setSelectedTaskId,
    isHelpOpen,
    onOpenHelp,
    onCloseHelp,
    isNewTaskOpen,
    onCloseNewTask,
  } = useKeyboardShortcuts();

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch project details
  const { data: project } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project ID');
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Fetch tasks for the project
  const { data: tasks = [], isLoading, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project ID');
      const response = await api.get(`/tasks/project/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Check if this project has notebooks
  const { data: projectNotebooks = [], isLoading: notebooksLoading } = useQuery({
    queryKey: ['project-notebooks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await api.get('/notebooks');
      // Filter notebooks for this project
      return response.data.filter((notebook: any) => notebook.project_id === Number(projectId));
    },
    enabled: !!projectId,
  });

  // Mutation for reordering tasks
  const reorderMutation = useMutation({
    mutationFn: async (updatedTasks: { id: number; position: number; status: string }[]) => {
      const response = await api.post('/tasks/reorder', { tasks: updatedTasks });
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast({
        title: 'Failed to reorder tasks',
        status: 'error',
        duration: 3000,
      });
      refetch();
    },
  });
  
  // Mutation for moving a single task
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, newStatus, newPosition }: { 
      taskId: number; 
      newStatus: 'todo' | 'in_progress' | 'done';
      newPosition: number;
    }) => {
      const response = await api.patch(`/tasks/${taskId}`, { 
        status: newStatus,
        position: newPosition 
      });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Task moved',
        status: 'success',
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to move task',
        status: 'error',
        duration: 3000,
      });
    },
  });

  // Group tasks by status
  const columns = React.useMemo(() => {
    return {
      todo: tasks.filter(task => task.status === 'todo').sort((a, b) => a.position - b.position),
      in_progress: tasks.filter(task => task.status === 'in_progress').sort((a, b) => a.position - b.position),
      done: tasks.filter(task => task.status === 'done').sort((a, b) => a.position - b.position),
    };
  }, [tasks]);

  // Find active task for drag overlay
  const activeTask = React.useMemo(
    () => tasks.find((task) => task.id.toString() === activeId),
    [activeId, tasks]
  );

  // Handle keyboard shortcut events
  React.useEffect(() => {
    const handleOpenCommandBar = () => onNLOpen();
    const handleOpenSearch = () => {
      // TODO: Implement search functionality
      toast({
        title: 'Search coming soon',
        description: 'Task search functionality will be implemented',
        status: 'info',
        duration: 2000,
      });
    };
    
    const handleEditTask = (event: CustomEvent) => {
      const task = tasks.find(t => t.id === event.detail.taskId);
      if (task) {
        setSelectedTask(task);
        onDetailOpen();
      }
    };
    
    const handleDeleteTask = (event: CustomEvent) => {
      const task = tasks.find(t => t.id === event.detail.taskId);
      if (task) {
        setSelectedTask(task);
        // The delete will be handled in the detail modal
        onDetailOpen();
      }
    };
    
    const handleCycleTaskStatus = async (event: CustomEvent) => {
      const task = tasks.find(t => t.id === event.detail.taskId);
      if (task) {
        const statusOrder = ['todo', 'in_progress', 'done'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        
        await moveTaskMutation.mutateAsync({
          taskId: task.id,
          newStatus: nextStatus as 'todo' | 'in_progress' | 'done',
          newPosition: 0,
        });
      }
    };
    
    const handleSelectPreviousTask = (event: CustomEvent) => {
      const allTasks = [...columns.todo, ...columns.in_progress, ...columns.done];
      const currentIndex = allTasks.findIndex(t => t.id === event.detail.currentTaskId);
      if (currentIndex > 0) {
        setSelectedTaskId(allTasks[currentIndex - 1].id);
        const taskEvent = new CustomEvent('taskSelected', { detail: { taskId: allTasks[currentIndex - 1].id } });
        window.dispatchEvent(taskEvent);
      }
    };
    
    const handleSelectNextTask = (event: CustomEvent) => {
      const allTasks = [...columns.todo, ...columns.in_progress, ...columns.done];
      const currentIndex = allTasks.findIndex(t => t.id === event.detail.currentTaskId);
      if (currentIndex < allTasks.length - 1 && currentIndex !== -1) {
        setSelectedTaskId(allTasks[currentIndex + 1].id);
        const taskEvent = new CustomEvent('taskSelected', { detail: { taskId: allTasks[currentIndex + 1].id } });
        window.dispatchEvent(taskEvent);
      } else if (currentIndex === -1 && allTasks.length > 0) {
        setSelectedTaskId(allTasks[0].id);
        const taskEvent = new CustomEvent('taskSelected', { detail: { taskId: allTasks[0].id } });
        window.dispatchEvent(taskEvent);
      }
    };
    
    const handleMoveTaskLeft = async (event: CustomEvent) => {
      const task = tasks.find(t => t.id === event.detail.taskId);
      if (task) {
        const statusOrder = ['done', 'in_progress', 'todo'];
        const currentIndex = statusOrder.indexOf(task.status);
        if (currentIndex < statusOrder.length - 1) {
          const nextStatus = statusOrder[currentIndex + 1];
          await moveTaskMutation.mutateAsync({
            taskId: task.id,
            newStatus: nextStatus as 'todo' | 'in_progress' | 'done',
            newPosition: 0,
          });
        }
      }
    };
    
    const handleMoveTaskRight = async (event: CustomEvent) => {
      const task = tasks.find(t => t.id === event.detail.taskId);
      if (task) {
        const statusOrder = ['todo', 'in_progress', 'done'];
        const currentIndex = statusOrder.indexOf(task.status);
        if (currentIndex < statusOrder.length - 1) {
          const nextStatus = statusOrder[currentIndex + 1];
          await moveTaskMutation.mutateAsync({
            taskId: task.id,
            newStatus: nextStatus as 'todo' | 'in_progress' | 'done',
            newPosition: 0,
          });
        }
      }
    };
    
    const handleCloseModals = () => {
      onClose();
      onDetailClose();
      onNLClose();
      onCloseHelp();
    };
    
    // Add event listeners
    window.addEventListener('openCommandBar', handleOpenCommandBar);
    window.addEventListener('openSearch', handleOpenSearch);
    window.addEventListener('editTask' as any, handleEditTask);
    window.addEventListener('deleteTask' as any, handleDeleteTask);
    window.addEventListener('cycleTaskStatus' as any, handleCycleTaskStatus);
    window.addEventListener('selectPreviousTask' as any, handleSelectPreviousTask);
    window.addEventListener('selectNextTask' as any, handleSelectNextTask);
    window.addEventListener('moveTaskLeft' as any, handleMoveTaskLeft);
    window.addEventListener('moveTaskRight' as any, handleMoveTaskRight);
    window.addEventListener('closeModals', handleCloseModals);
    
    return () => {
      window.removeEventListener('openCommandBar', handleOpenCommandBar);
      window.removeEventListener('openSearch', handleOpenSearch);
      window.removeEventListener('editTask' as any, handleEditTask);
      window.removeEventListener('deleteTask' as any, handleDeleteTask);
      window.removeEventListener('cycleTaskStatus' as any, handleCycleTaskStatus);
      window.removeEventListener('selectPreviousTask' as any, handleSelectPreviousTask);
      window.removeEventListener('selectNextTask' as any, handleSelectNextTask);
      window.removeEventListener('moveTaskLeft' as any, handleMoveTaskLeft);
      window.removeEventListener('moveTaskRight' as any, handleMoveTaskRight);
      window.removeEventListener('closeModals', handleCloseModals);
    };
  }, [tasks, columns, onNLOpen, onDetailOpen, toast, setSelectedTaskId]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  // Handle drag over (moving between columns)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = overId in columns ? overId : findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // We'll handle the actual movement in handleDragEnd
    // This is just for visual feedback during drag
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeContainer = findContainer(activeId);
    const overContainer = overId in columns ? overId : findContainer(overId);
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // Prepare updated tasks for reordering
    const updatedTasks: { id: number; position: number; status: string }[] = [];
    
    if (activeContainer === overContainer) {
      // Moving within the same column
      const column = columns[activeContainer as keyof typeof columns];
      const oldIndex = column.findIndex((task) => task.id.toString() === activeId);
      const newIndex = column.findIndex((task) => task.id.toString() === overId);
      
      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(column, oldIndex, newIndex);
        reorderedTasks.forEach((task, index) => {
          updatedTasks.push({
            id: task.id,
            position: index,
            status: task.status,
          });
        });
      }
    } else {
      // Moving between columns
      const newStatus = overContainer as Task['status'];
      const targetColumn = columns[newStatus];
      
      // Update all tasks in the target column
      targetColumn.forEach((task, index) => {
        updatedTasks.push({
          id: task.id,
          position: index + 1, // Make room for the new task
          status: task.status,
        });
      });
      
      // Add the moved task at the beginning
      updatedTasks.push({
        id: parseInt(activeId),
        position: 0,
        status: newStatus,
      });
    }

    if (updatedTasks.length > 0) {
      // Send to backend
      reorderMutation.mutate(updatedTasks);
    }

    setActiveId(null);
  };

  // Helper function to find which column a task belongs to
  const findContainer = (id: string) => {
    if (id in columns) {
      return id;
    }
    
    const foundKey = Object.keys(columns).find((key) => {
      const column = columns[key as keyof typeof columns];
      return column.some((task) => task.id.toString() === id);
    });
    
    return foundKey;
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedTaskId(task.id);
    // Dispatch selection event for keyboard shortcuts
    const event = new CustomEvent('taskSelected', { detail: { taskId: task.id } });
    window.dispatchEvent(event);
    onDetailOpen();
  };

  if (!projectId) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.500">
            No project selected
          </Text>
          <Button colorScheme="blue" onClick={() => navigate('/projects')}>
            Go to Projects
          </Button>
        </VStack>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Text color="red.500">Failed to load board</Text>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <VStack id="kanban-board" className="kanban-board" spacing={6} align="stretch" h="full">
        {/* Header */}
        <HStack id="board-header" className="board-header" justify="space-between">
          <HStack spacing={4}>
            <Button
              id="board-back-button"
              leftIcon={<ArrowLeftIcon />}
              variant="ghost"
              onClick={() => navigate('/projects')}
            >
              Back
            </Button>
            <HStack spacing={2}>
              {project && (
                <Box
                  w={4}
                  h={4}
                  borderRadius="full"
                  bg={project.color}
                  borderWidth={1}
                  borderColor="border.primary"
                />
              )}
              <Heading id="board-title" size="lg">{project?.name || 'Loading...'}</Heading>
              {!notebooksLoading && projectNotebooks.length > 0 && (
                <HStack spacing={2}>
                  {projectNotebooks.map((notebook: any) => (
                    <Button
                      key={notebook.id}
                      size="sm"
                      variant="solid"
                      colorScheme="blue"
                      leftIcon={<FaBook />}
                      onClick={() => navigate(`/app/notebooks/${notebook.id}`)}
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {notebook.title}
                    </Button>
                  ))}
                </HStack>
              )}
              {project && (
                <Tooltip label="Edit project" placement="top">
                  <IconButton
                    aria-label="Edit project"
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={onProjectEditOpen}
                  />
                </Tooltip>
              )}
            </HStack>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label="⌘K / Ctrl+K" placement="bottom">
              <Button 
                id="board-ai-command-button"
                leftIcon={<FaMagic />} 
                colorScheme="purple" 
                variant="outline"
                onClick={onNLOpen}
              >
                AI Command
              </Button>
            </Tooltip>
            <Tooltip label="Press N" placement="bottom">
              <Button id="board-new-task-button" leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
                New Task
              </Button>
            </Tooltip>
            <Tooltip label="Keyboard Shortcuts" placement="bottom">
              <Button 
                id="board-help-button"
                variant="ghost"
                onClick={() => onOpenHelp()}
                size="sm"
                color="gray.500"
              >
                ?
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        {/* Board Columns */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={6}
          h="calc(100vh - 200px)"
          overflowX={{ base: 'auto', md: 'visible' }}
        >
          {(Object.keys(columns) as Array<keyof typeof columns>).map((status) => (
            <BoardColumn
              key={status}
              status={status}
              title={COLUMN_TITLES[status]}
              tasks={columns[status]}
              projectId={Number(projectId)}
              onTaskClick={handleTaskClick}
              selectedTaskId={selectedTaskId}
            />
          ))}
        </Grid>
      </VStack>

      {/* Drag Overlay */}
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}
      >
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>

      {/* Create Task Modal */}
      {projectId && (
        <CreateTaskForm
          isOpen={isOpen}
          onClose={onClose}
          projectId={Number(projectId)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            onDetailClose();
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
      )}

      {/* Natural Language Input Modal */}
      {projectId && (
        <NaturalLanguageInput
          isOpen={isNLOpen}
          onClose={onNLClose}
          projectId={Number(projectId)}
        />
      )}
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={isHelpOpen}
        onClose={onCloseHelp}
        shortcuts={shortcuts}
      />
      
      {/* Create Task Modal for keyboard shortcut */}
      <CreateTaskForm
        isOpen={isNewTaskOpen}
        onClose={onCloseNewTask}
        projectId={Number(projectId)}
      />
      
      {/* Edit Project Modal */}
      {project && (
        <CreateProjectModal
          isOpen={isProjectEditOpen}
          onClose={onProjectEditClose}
          project={project ? {
            id: project.id,
            name: project.name,
            description: project.description,
            color: project.color || '#3182CE',
            user_id: 0, // Not available in this interface
            is_archived: false, // Not available in this interface
            position: 0, // Not available in this interface
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } : null}
        />
      )}
    </DndContext>
  );
};
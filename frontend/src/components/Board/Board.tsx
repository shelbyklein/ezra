/**
 * Kanban board component with drag-and-drop functionality
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Grid,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, ArrowLeftIcon } from '@chakra-ui/icons';
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
}

interface Project {
  id: number;
  name: string;
  description: string | null;
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

  // Group tasks by status with mutable state for optimistic updates
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const columns = React.useMemo(() => {
    return {
      todo: localTasks.filter(task => task.status === 'todo').sort((a, b) => a.position - b.position),
      in_progress: localTasks.filter(task => task.status === 'in_progress').sort((a, b) => a.position - b.position),
      done: localTasks.filter(task => task.status === 'done').sort((a, b) => a.position - b.position),
    };
  }, [localTasks]);

  // Find active task for drag overlay
  const activeTask = React.useMemo(
    () => localTasks.find((task) => task.id.toString() === activeId),
    [activeId, localTasks]
  );

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

    setLocalTasks((tasks) => {
      const activeTask = tasks.find((t) => t.id.toString() === activeId);
      if (!activeTask) return tasks;

      // Update task status
      const updatedTask = { ...activeTask, status: overContainer as Task['status'] };
      
      // Remove from old position and add to new
      const newTasks = tasks.filter((t) => t.id !== activeTask.id);
      newTasks.push(updatedTask);
      
      return newTasks;
    });
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
      // Optimistically update UI
      setLocalTasks((tasks) => {
        return tasks.map((task) => {
          const update = updatedTasks.find((u) => u.id === task.id);
          if (update) {
            return { ...task, position: update.position, status: update.status as Task['status'] };
          }
          return task;
        });
      });

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
      <VStack spacing={6} align="stretch" h="full">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowLeftIcon />}
              variant="ghost"
              onClick={() => navigate('/projects')}
            >
              Back
            </Button>
            <Heading size="lg">{project?.name || 'Loading...'}</Heading>
          </HStack>
          <Button leftIcon={<AddIcon />} colorScheme="blue">
            New Task
          </Button>
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
    </DndContext>
  );
};
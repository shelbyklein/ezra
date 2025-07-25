/**
 * Board column component representing a task status
 */

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface BoardColumnProps {
  status: 'todo' | 'in_progress' | 'done';
  title: string;
  tasks: Task[];
  projectId: number;
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: number | null;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  selectedTaskId,
}) => {
  const activeBg = useColorModeValue('gray.100', 'gray.600');

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Task IDs for sortable context
  const taskIds = React.useMemo(() => tasks.map((task) => task.id.toString()), [tasks]);

  // Column colors based on status
  const getColumnColor = () => {
    switch (status) {
      case 'todo':
        return 'gray';
      case 'in_progress':
        return 'blue';
      case 'done':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      id={`board-column-${status}`}
      className={`board-column board-column-${status}`}
      ref={setNodeRef}
      bg={isOver ? activeBg : 'bg.tertiary'}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={isOver ? `${getColumnColor()}.400` : 'border.primary'}
      p={4}
      h="full"
      display="flex"
      flexDirection="column"
      transition="all 0.2s"
    >
      {/* Column Header */}
      <VStack spacing={2} align="stretch" mb={4}>
        <Heading id={`column-title-${status}`} size="sm" display="flex" alignItems="center" gap={2}>
          {title}
          <Badge id={`column-count-${status}`} colorScheme={getColumnColor()} borderRadius="full" px={2}>
            {tasks.length}
          </Badge>
        </Heading>
      </VStack>

      {/* Task List */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <VStack
          spacing={3}
          align="stretch"
          flex={1}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray',
              borderRadius: '24px',
            },
          }}
        >
          {tasks.length === 0 ? (
            <Box py={8} textAlign="center">
              <Text color="text.secondary" fontSize="sm">
                No tasks in {title.toLowerCase()}
              </Text>
            </Box>
          ) : (
            tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => onTaskClick?.(task)}
                isSelected={selectedTaskId === task.id}
              />
            ))
          )}
        </VStack>
      </SortableContext>
    </Box>
  );
};
/**
 * Task card component for displaying task information
 */

import React from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  Icon,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { CalendarIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

const priorityColors = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

const priorityBorderColors = {
  low: 'green.500',
  medium: 'yellow.500',
  high: 'red.500',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onClick, isSelected = false }) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'red' };
    if (diffDays === 0) return { text: 'Today', color: 'orange' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'yellow' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'blue' };
    return { text: date.toLocaleDateString(), color: 'gray' };
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if not dragging and onClick is provided
    if (!isSortableDragging && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      bg="bg.card"
      borderRadius="md"
      borderWidth={isSelected ? "2px" : "1px"}
      borderColor={isSelected ? "blue.500" : "border.primary"}
      borderLeftWidth="3px"
      borderLeftColor={priorityBorderColors[task.priority]}
      p={3}
      cursor="pointer"
      transition="all 0.2s"
      opacity={isSortableDragging || isDragging ? 0.5 : 1}
      boxShadow={isSelected ? "0 0 0 3px rgba(66, 153, 225, 0.3)" : undefined}
      _hover={{
        bg: 'bg.hover',
        transform: isSortableDragging ? undefined : 'translateY(-2px)',
        shadow: 'md',
      }}
      position="relative"
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <Icon
        as={HamburgerIcon}
        position="absolute"
        top={2}
        right={2}
        color="text.muted"
        opacity={0}
        transition="opacity 0.2s"
        _groupHover={{ opacity: 0.6 }}
        cursor="grab"
        boxSize={4}
      />

      <VStack align="stretch" spacing={2}>
        {/* Task Title */}
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="text.primary"
          noOfLines={2}
        >
          {task.title}
        </Text>

        {/* Task Description Preview */}
        {task.description && (
          <Text
            fontSize="xs"
            color="text.secondary"
            noOfLines={2}
          >
            {task.description}
          </Text>
        )}

        {/* Task Metadata */}
        <HStack spacing={2} flexWrap="wrap">
          {/* Priority Badge */}
          <Badge
            colorScheme={priorityColors[task.priority]}
            size="sm"
            fontSize="xs"
          >
            {task.priority}
          </Badge>

          {/* Due Date */}
          {task.due_date && (
            <HStack spacing={1}>
              <Icon as={CalendarIcon} boxSize={3} color="text.muted" />
              <Text
                fontSize="xs"
                color={formatDueDate(task.due_date).color + '.500'}
              >
                {formatDueDate(task.due_date).text}
              </Text>
            </HStack>
          )}
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              {task.tags.slice(0, 2).map(tag => (
                <Tag
                  key={tag.id}
                  size="sm"
                  borderRadius="full"
                  variant="solid"
                  bg={tag.color}
                  color="white"
                  fontSize="xs"
                  py={0}
                  px={2}
                  h={5}
                >
                  <TagLabel>{tag.name}</TagLabel>
                </Tag>
              ))}
              {task.tags.length > 2 && (
                <Text fontSize="xs" color="text.muted">
                  +{task.tags.length - 2}
                </Text>
              )}
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
/**
 * Task detail view and edit modal
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  HStack,
  VStack,
  Text,
  Badge,
  Box,
  IconButton,
  useToast,
  FormErrorMessage,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { FaMagic } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TagSelector } from '../common/TagSelector';
import { Tag, TagLabel } from '@chakra-ui/react';
import { TaskAttachments } from './TaskAttachments';
import { TaskEnhancer } from '../AI/TaskEnhancer';

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

interface TagData {
  id: number;
  name: string;
  color: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string;
}

const priorityColors = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

const statusColors = {
  todo: 'gray',
  in_progress: 'blue',
  done: 'green',
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    },
  });

  // Fetch task tags
  const { data: taskTags = [] } = useQuery<TagData[]>({
    queryKey: ['task-tags', task.id],
    queryFn: async () => {
      const response = await api.get(`/tags/task/${task.id}`);
      return response.data;
    },
  });

  // Update selected tags when task tags are loaded
  React.useEffect(() => {
    setSelectedTags(taskTags.map(tag => tag.id));
  }, [taskTags]);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await api.put(`/tasks/${task.id}`, {
        ...data,
        due_date: data.due_date || null,
      });
      
      // Update tags if they've changed
      await api.post(`/tags/task/${task.id}`, {
        tagIds: selectedTags,
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['task-tags', task.id] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Error updating task',
        description: 'Failed to update task. Please try again.',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/tasks/${task.id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project_id.toString()] });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error deleting task',
        description: 'Failed to delete task. Please try again.',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    updateTaskMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate();
    }
  };

  const handleCancel = () => {
    reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setSelectedTags(taskTags.map(tag => tag.id));
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApplyEnhancement = (enhancement: any) => {
    if (enhancement.title) {
      setValue('title', enhancement.title);
    }
    if (enhancement.description) {
      setValue('description', enhancement.description);
    }
    if (enhancement.priority) {
      setValue('priority', enhancement.priority);
    }
    setShowEnhancer(false);
  };

  return (<>
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Task Details</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              {isEditing ? (
                <>
                  <FormControl isRequired isInvalid={!!errors.title}>
                    <FormLabel>Title</FormLabel>
                    <Input
                      {...register('title', {
                        required: 'Title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' },
                        maxLength: { value: 100, message: 'Title must be less than 100 characters' },
                      })}
                    />
                    <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      {...register('description')}
                      rows={3}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Priority</FormLabel>
                      <Select {...register('priority')}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Select {...register('status')}>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Due Date</FormLabel>
                    <Input
                      {...register('due_date')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>

                  <TagSelector
                    label="Tags"
                    value={selectedTags}
                    onChange={setSelectedTags}
                  />

                  <Divider />

                  <TaskAttachments taskId={task.id} isEditing={true} />
                </>
              ) : (
                <>
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={2}>
                      {task.title}
                    </Text>
                    <HStack spacing={2} mb={4}>
                      <Badge colorScheme={priorityColors[task.priority]}>
                        {task.priority} priority
                      </Badge>
                      <Badge colorScheme={statusColors[task.status]}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </HStack>
                    
                    {taskTags.length > 0 && (
                      <HStack spacing={2} flexWrap="wrap" mt={2}>
                        {taskTags.map(tag => (
                          <Tag
                            key={tag.id}
                            size="sm"
                            borderRadius="full"
                            variant="solid"
                            bg={tag.color}
                            color="white"
                          >
                            <TagLabel>{tag.name}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    )}
                  </Box>

                  {task.description && (
                    <Box>
                      <Text fontWeight="semibold" mb={1}>Description</Text>
                      <Text color="gray.600" whiteSpace="pre-wrap">
                        {task.description}
                      </Text>
                    </Box>
                  )}

                  <Divider />

                  <HStack spacing={6}>
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.500">
                        Due Date
                      </Text>
                      <Text>{formatDate(task.due_date)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.500">
                        Created
                      </Text>
                      <Text>{formatDate(task.created_at)}</Text>
                    </Box>
                  </HStack>

                  <Divider />

                  <TaskAttachments taskId={task.id} isEditing={false} />
                </>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            {isEditing ? (
              <>
                <IconButton
                  aria-label="Delete task"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={handleDelete}
                  isLoading={deleteTaskMutation.isPending}
                  mr="auto"
                />
                <Tooltip label="Enhance with AI" placement="top">
                  <IconButton
                    aria-label="Enhance with AI"
                    icon={<FaMagic />}
                    size="sm"
                    colorScheme="purple"
                    variant="ghost"
                    onClick={() => setShowEnhancer(true)}
                    mr={3}
                  />
                </Tooltip>
                <Button variant="ghost" mr={3} onClick={handleCancel}>
                  <CloseIcon mr={2} />
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting || updateTaskMutation.isPending}
                  leftIcon={<CheckIcon />}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <HStack spacing={3}>
                <IconButton
                  aria-label="Edit task"
                  icon={<EditIcon />}
                  size="sm"
                  onClick={() => setIsEditing(true)}
                />
                <IconButton
                  aria-label="Delete task"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={handleDelete}
                  isLoading={deleteTaskMutation.isPending}
                />
              </HStack>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

    {/* AI Enhancement Modal */}
    <Modal isOpen={showEnhancer} onClose={() => setShowEnhancer(false)} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Task Enhancement</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TaskEnhancer
            taskId={task.id}
            title={task.title}
            description={task.description || ''}
            onApply={handleApplyEnhancement}
            onClose={() => setShowEnhancer(false)}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  </>);
};
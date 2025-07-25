/**
 * Quick task creation form for kanban board
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
  useToast,
  VStack,
  FormErrorMessage,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaMagic } from 'react-icons/fa';
import { api } from '../../services/api';
import { TagSelector } from '../common/TagSelector';
import { TaskEnhancer } from '../AI/TaskEnhancer';

interface CreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  initialStatus?: 'todo' | 'in_progress' | 'done';
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  isOpen,
  onClose,
  projectId,
  initialStatus = 'todo',
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showEnhancer, setShowEnhancer] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: initialStatus,
      due_date: '',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await api.post('/tasks', {
        ...data,
        project_id: projectId,
        due_date: data.due_date || null,
      });
      
      // Assign tags to the newly created task if any are selected
      if (selectedTags.length > 0) {
        await api.post(`/tags/task/${response.data.id}`, {
          tagIds: selectedTags,
        });
      }
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId.toString()] });
      handleClose();
    },
    onError: () => {
      toast({
        title: 'Error creating task',
        description: 'Failed to create task. Please try again.',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setShowEnhancer(false);
    onClose();
  };

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');

  const handleEnhance = () => {
    if (!watchedTitle) {
      toast({
        title: 'Title required',
        description: 'Please enter a task title before enhancing',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setShowEnhancer(true);
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

  return (
    <Modal id="create-task-modal" isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form id="create-task-form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <HStack justify="space-between" w="full">
              <span>Create New Task</span>
              <Tooltip label="Enhance with AI" placement="left">
                <IconButton
                  id="task-enhance-button"
                  aria-label="Enhance with AI"
                  icon={<FaMagic />}
                  size="sm"
                  colorScheme="purple"
                  variant="ghost"
                  onClick={handleEnhance}
                  isDisabled={!watchedTitle || showEnhancer}
                />
              </Tooltip>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel htmlFor="task-title">Title</FormLabel>
                <Input
                  id="task-title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Title must be less than 100 characters' },
                  })}
                  placeholder="Enter task title"
                  autoFocus
                />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="task-description">Description</FormLabel>
                <Textarea
                  id="task-description"
                  {...register('description')}
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </FormControl>

              <HStack spacing={4} width="full">
                <FormControl>
                  <FormLabel htmlFor="task-priority">Priority</FormLabel>
                  <Select id="task-priority" {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="task-status">Status</FormLabel>
                  <Select id="task-status" {...register('status')}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel htmlFor="task-due-date">Due Date</FormLabel>
                <Input
                  id="task-due-date"
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button id="task-cancel-button" variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              id="task-submit-button"
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting || createTaskMutation.isPending}
            >
              Create Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>

      {/* AI Enhancement Modal */}
      <Modal id="task-enhancer-modal" isOpen={showEnhancer} onClose={() => setShowEnhancer(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AI Task Enhancement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TaskEnhancer
              title={watchedTitle}
              description={watchedDescription}
              onApply={handleApplyEnhancement}
              onClose={() => setShowEnhancer(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Modal>
  );
};
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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TagSelector } from '../common/TagSelector';

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
  
  const {
    register,
    handleSubmit,
    reset,
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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input
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
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </FormControl>

              <HStack spacing={4} width="full">
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting || createTaskMutation.isPending}
            >
              Create Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
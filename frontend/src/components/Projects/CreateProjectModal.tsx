/**
 * Modal for creating and editing projects
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { api } from '../../services/api';

interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  user_id: number;
  is_archived: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

interface ProjectFormData {
  name: string;
  description: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [project, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (isEditing) {
        const response = await api.put(`/projects/${project.id}`, data);
        return response.data;
      } else {
        const response = await api.post('/projects', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: isEditing ? 'Project updated' : 'Project created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      reset();
    },
    onError: () => {
      toast({
        title: isEditing ? 'Failed to update project' : 'Failed to create project',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditing ? 'Edit Project' : 'Create New Project'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Project Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Project name is required',
                    minLength: {
                      value: 3,
                      message: 'Project name must be at least 3 characters',
                    },
                  })}
                  placeholder="Enter project name"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Enter project description"
                  rows={4}
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting || createMutation.isPending}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
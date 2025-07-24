/**
 * Modal for creating and editing projects
 */

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { ColorPicker } from '../common/ColorPicker';
import { TagSelector } from '../common/TagSelector';

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
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

interface ProjectFormData {
  name: string;
  description: string;
  color: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!project;
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      color: project?.color || '#3182CE',
    },
  });

  // Fetch project tags if editing
  const { data: projectTags = [] } = useQuery({
    queryKey: ['project-tags', project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const response = await api.get(`/tags/project/${project.id}`);
      return response.data;
    },
    enabled: !!project?.id,
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        color: project.color || '#3182CE',
      });
      setSelectedTags(projectTags.map((tag: any) => tag.id));
    } else {
      reset({
        name: '',
        description: '',
        color: '#3182CE',
      });
      setSelectedTags([]);
    }
  }, [project, projectTags, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      let projectResponse;
      if (isEditing) {
        projectResponse = await api.put(`/projects/${project.id}`, data);
      } else {
        projectResponse = await api.post('/projects', data);
      }
      
      // Update project tags
      if (projectResponse.data.id) {
        await api.post(`/tags/project/${projectResponse.data.id}`, {
          tagIds: selectedTags,
        });
      }
      
      return projectResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-tags'] });
      toast({
        title: isEditing ? 'Project updated' : 'Project created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      reset();
      setSelectedTags([]);
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

              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <ColorPicker
                    label="Project Color"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <TagSelector
                label="Project Tags"
                value={selectedTags}
                onChange={setSelectedTags}
              />
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
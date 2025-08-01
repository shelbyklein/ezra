/**
 * Modal for creating and editing projects
 */

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  HStack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
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
  const navigate = useNavigate();
  const isEditing = !!project;
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

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
    } else {
      reset({
        name: '',
        description: '',
        color: '#3182CE',
      });
      setSelectedTags([]);
    }
  }, [project, reset]);

  // Separate effect for tags to avoid infinite loop
  useEffect(() => {
    if (project && projectTags.length > 0) {
      setSelectedTags(projectTags.map((tag: any) => tag.id));
    }
  }, [project?.id, projectTags.length]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset({
        name: '',
        description: '',
        color: '#3182CE',
      });
      setSelectedTags([]);
    }
  }, [isOpen, reset]);

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${project?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      onClose();
      // Redirect to home page and refresh after successful deletion
      navigate('/app/projects');
      window.location.reload();
    },
    onError: () => {
      toast({
        title: 'Failed to delete project',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <Modal id={isEditing ? "edit-project-modal" : "create-project-modal"} isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Project' : 'Create New Project'}</ModalHeader>
          <ModalCloseButton />
          <form id="project-form" onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel htmlFor="project-name">Project Name</FormLabel>
                  <Input
                    id="project-name"
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
                  <FormLabel htmlFor="project-description">Description (Optional)</FormLabel>
                  <Textarea
                    id="project-description"
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
              <HStack justify="space-between" w="full">
                {isEditing ? (
                  <Button
                    id="project-delete-button"
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={onDeleteOpen}
                  >
                    Delete Project
                  </Button>
                ) : (
                  <div />
                )}
                <HStack>
                  <Button id="project-cancel-button" variant="ghost" mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    id="project-submit-button"
                    colorScheme="blue"
                    type="submit"
                    isLoading={isSubmitting || createMutation.isPending}
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this project? This will also delete all associated tasks. This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
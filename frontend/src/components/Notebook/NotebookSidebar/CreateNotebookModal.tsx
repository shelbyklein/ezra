/**
 * Modal for creating a new notebook
 */

import React from 'react';
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
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotebookFormData {
  title: string;
  description: string;
  icon: string;
}

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NotebookFormData>();

  const createNotebook = useMutation({
    mutationFn: async (data: NotebookFormData) => {
      const response = await api.post('/notebooks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast({
        title: 'Notebook created',
        status: 'success',
        duration: 3000,
      });
      reset();
      onClose();
    },
    onError: () => {
      toast({
        title: 'Failed to create notebook',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: NotebookFormData) => {
    createNotebook.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Notebook</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="My Notebook"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="What's this notebook about?"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Icon (emoji)</FormLabel>
                <Input
                  {...register('icon')}
                  placeholder="📓"
                  maxLength={2}
                />
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
              isLoading={isSubmitting || createNotebook.isPending}
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
/**
 * Modal for creating a new page
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
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: number;
  folderId: number | null;
}

interface PageFormData {
  title: string;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  onClose,
  notebookId,
  folderId,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PageFormData>();

  const createPage = useMutation({
    mutationFn: async (data: PageFormData) => {
      const response = await api.post(`/notebooks/${notebookId}/pages`, {
        ...data,
        folder_id: folderId,
      });
      return response.data;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] });
      toast({
        title: 'Page created',
        status: 'success',
        duration: 3000,
      });
      reset();
      onClose();
      // Navigate to the new page
      navigate(`/notebooks/${notebookId}/${page.id}`);
    },
    onError: () => {
      toast({
        title: 'Failed to create page',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: PageFormData) => {
    createPage.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Page</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="Untitled Page"
                autoFocus
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting || createPage.isPending}
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
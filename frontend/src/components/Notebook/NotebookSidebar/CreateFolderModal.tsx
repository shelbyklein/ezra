/**
 * Modal for creating a new folder
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
import { api } from '../../../services/api';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: number;
  parentFolderId: number | null;
}

interface FolderFormData {
  name: string;
  icon: string;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  notebookId,
  parentFolderId,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FolderFormData>();

  const createFolder = useMutation({
    mutationFn: async (data: FolderFormData) => {
      const response = await api.post(`/notebooks/${notebookId}/folders`, {
        ...data,
        parent_folder_id: parentFolderId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] });
      toast({
        title: 'Folder created',
        status: 'success',
        duration: 3000,
      });
      reset();
      onClose();
    },
    onError: () => {
      toast({
        title: 'Failed to create folder',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: FolderFormData) => {
    createFolder.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="New Folder"
                  autoFocus
                />
              </FormControl>

              <FormControl>
                <FormLabel>Icon (emoji)</FormLabel>
                <Input
                  {...register('icon')}
                  placeholder="📁"
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
              isLoading={isSubmitting || createFolder.isPending}
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
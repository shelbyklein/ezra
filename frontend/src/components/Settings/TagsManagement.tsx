/**
 * Tags management component for Settings page
 */

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useDisclosure,
  Box,
  SimpleGrid,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ColorPicker } from '../common/ColorPicker';

interface Tag {
  id: number;
  name: string;
  color: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface TagFormData {
  name: string;
  color: string;
}

export const TagsManagement: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Fetch tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get('/tags');
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TagFormData>({
    defaultValues: {
      name: '',
      color: '#3182CE',
    },
  });

  // Create/Update tag mutation
  const tagMutation = useMutation({
    mutationFn: async (data: TagFormData) => {
      if (selectedTag) {
        const response = await api.put(`/tags/${selectedTag.id}`, data);
        return response.data;
      } else {
        const response = await api.post('/tags', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: selectedTag ? 'Tag updated' : 'Tag created',
        status: 'success',
        duration: 3000,
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save tag',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: async (tagId: number) => {
      await api.delete(`/tags/${tagId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: 'Tag deleted',
        status: 'success',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete tag',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    reset({
      name: tag.name,
      color: tag.color,
    });
    onOpen();
  };

  const handleCreate = () => {
    setSelectedTag(null);
    reset({
      name: '',
      color: '#3182CE',
    });
    onOpen();
  };

  const handleClose = () => {
    onClose();
    reset();
    setSelectedTag(null);
  };

  const handleDelete = (tagId: number) => {
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all tasks.')) {
      deleteMutation.mutate(tagId);
    }
  };

  const onSubmit = (data: TagFormData) => {
    tagMutation.mutate(data);
  };

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Box>
          <Heading size="md">Tags</Heading>
          <Text color="text.secondary" fontSize="sm" mt={1}>
            Create and manage tags to organize your tasks
          </Text>
        </Box>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={handleCreate}>
          New Tag
        </Button>
      </HStack>

      {tags.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>No tags yet. Create your first tag to start organizing tasks.</Text>
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {tags.map((tag) => (
            <Box
              key={tag.id}
              p={4}
              borderWidth={1}
              borderColor="border.primary"
              borderRadius="md"
              _hover={{ borderColor: 'border.secondary' }}
              transition="all 0.2s"
            >
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Box
                    w={4}
                    h={4}
                    borderRadius="full"
                    bg={tag.color}
                    borderWidth={1}
                    borderColor="border.primary"
                  />
                  <Text fontWeight="medium">{tag.name}</Text>
                </HStack>
                <HStack spacing={1}>
                  <IconButton
                    aria-label="Edit tag"
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tag)}
                  />
                  <IconButton
                    aria-label="Delete tag"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDelete(tag.id)}
                    isLoading={deleteMutation.isPending}
                  />
                </HStack>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Create/Edit Tag Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedTag ? 'Edit Tag' : 'Create Tag'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Tag Name</FormLabel>
                  <Input
                    {...register('name', {
                      required: 'Tag name is required',
                      minLength: {
                        value: 1,
                        message: 'Tag name must be at least 1 character',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Tag name must be less than 50 characters',
                      },
                    })}
                    placeholder="Enter tag name"
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      label="Tag Color"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
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
                isLoading={isSubmitting || tagMutation.isPending}
              >
                {selectedTag ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
/**
 * Task attachments component for managing files, URLs, and notes
 */

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  Link,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  ExternalLinkIcon, 
  AttachmentIcon as ChakraAttachmentIcon,
  EditIcon,
  LinkIcon,
  ChatIcon,
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface Attachment {
  id: number;
  task_id: number;
  type: 'file' | 'url' | 'note';
  name: string;
  content: string;
  mime_type: string | null;
  size: number | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskAttachmentsProps {
  taskId: number;
  isEditing: boolean;
}

interface AttachmentFormData {
  type: 'file' | 'url' | 'note';
  name: string;
  content: string;
}

const AttachmentIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'url':
      return <LinkIcon />;
    case 'note':
      return <ChatIcon />;
    default:
      return <ChakraAttachmentIcon />;
  }
};

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId, isEditing }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  const [formData, setFormData] = useState<AttachmentFormData>({
    type: 'url',
    name: '',
    content: '',
  });

  // Fetch attachments
  const { data: attachments = [] } = useQuery<Attachment[]>({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const response = await api.get(`/attachments/task/${taskId}`);
      return response.data;
    },
  });

  // Create attachment mutation
  const createMutation = useMutation({
    mutationFn: async (data: AttachmentFormData) => {
      const response = await api.post('/attachments', {
        task_id: taskId,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      toast({
        title: 'Attachment added',
        status: 'success',
        duration: 3000,
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: 'Failed to add attachment',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Update attachment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AttachmentFormData> }) => {
      const response = await api.put(`/attachments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      toast({
        title: 'Attachment updated',
        status: 'success',
        duration: 3000,
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: 'Failed to update attachment',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Delete attachment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/attachments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      toast({
        title: 'Attachment deleted',
        status: 'success',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete attachment',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleOpenModal = (attachment?: Attachment) => {
    if (attachment) {
      setEditingAttachment(attachment);
      setFormData({
        type: attachment.type,
        name: attachment.name,
        content: attachment.content,
      });
    } else {
      setEditingAttachment(null);
      setFormData({
        type: 'url',
        name: '',
        content: '',
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingAttachment(null);
    setFormData({
      type: 'url',
      name: '',
      content: '',
    });
    onClose();
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast({
        title: 'Please fill in all fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (editingAttachment) {
      updateMutation.mutate({
        id: editingAttachment.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const renderAttachmentContent = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'url':
        return (
          <Link href={attachment.content} isExternal color="blue.500">
            {attachment.name} <ExternalLinkIcon mx="2px" />
          </Link>
        );
      case 'note':
        return (
          <Box>
            <Text fontWeight="medium">{attachment.name}</Text>
            <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
              {attachment.content}
            </Text>
          </Box>
        );
      default:
        return <Text>{attachment.name}</Text>;
    }
  };

  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <Text fontWeight="semibold">Attachments</Text>
        {isEditing && (
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Add
          </Button>
        )}
      </HStack>

      {attachments.length === 0 ? (
        <Text fontSize="sm" color="gray.500">No attachments</Text>
      ) : (
        <VStack align="stretch" spacing={2} divider={<Divider />}>
          {attachments.map((attachment) => (
            <HStack key={attachment.id} justify="space-between">
              <HStack flex={1}>
                <AttachmentIcon type={attachment.type} />
                {renderAttachmentContent(attachment)}
                <Badge colorScheme="gray" fontSize="xs">
                  {attachment.type}
                </Badge>
                {attachment.size && (
                  <Text fontSize="xs" color="gray.500">
                    {formatSize(attachment.size)}
                  </Text>
                )}
              </HStack>
              {isEditing && (
                <HStack>
                  <IconButton
                    aria-label="Edit attachment"
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenModal(attachment)}
                  />
                  <IconButton
                    aria-label="Delete attachment"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDelete(attachment.id)}
                  />
                </HStack>
              )}
            </HStack>
          ))}
        </VStack>
      )}

      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAttachment ? 'Edit Attachment' : 'Add Attachment'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  isDisabled={!!editingAttachment}
                >
                  <option value="url">URL</option>
                  <option value="note">Note</option>
                  <option value="file">File</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.type === 'url' ? 'e.g., Documentation' :
                    formData.type === 'note' ? 'e.g., Meeting Notes' :
                    'e.g., Design Mockup'
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  {formData.type === 'url' ? 'URL' :
                   formData.type === 'note' ? 'Note Content' :
                   'File Path'}
                </FormLabel>
                {formData.type === 'note' ? (
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your note here..."
                    rows={4}
                  />
                ) : (
                  <Input
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={
                      formData.type === 'url' ? 'https://example.com' :
                      '/path/to/file'
                    }
                  />
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingAttachment ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
/**
 * Task attachments component for managing files, URLs, and notes
 */

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
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
} from '@chakra-ui/react';
import { 
  AddIcon, 
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FileUpload } from './FileUpload';
import { AttachmentsList } from './AttachmentsList';

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
  useQuery<Attachment[]>({
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




  return (
    <VStack align="stretch" spacing={4}>
      <HStack justify="space-between">
        <Text fontWeight="semibold">Attachments</Text>
        {isEditing && (
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Add Link/Note
          </Button>
        )}
      </HStack>

      {isEditing && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>Upload Files</Text>
          <FileUpload taskId={taskId} />
        </Box>
      )}

      <AttachmentsList taskId={taskId} />

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
                  {formData.type === 'url' ? 'URL' : 'Note Content'}
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
                    placeholder="https://example.com"
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
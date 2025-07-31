/**
 * Component to display and manage task attachments
 */

import React from 'react';
import {
  VStack,
  HStack,
  Text,
  IconButton,
  Box,
  Link,
  Spinner,
  Icon,
  useToast,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaLink,
  FaStickyNote,
} from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface Attachment {
  id: number;
  task_id: number;
  type: 'file' | 'url' | 'note';
  name: string;
  content: string;
  mime_type?: string;
  size?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
  url?: string;
}

interface AttachmentsListProps {
  taskId: number;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({ taskId }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const response = await api.get(`/attachments/task/${taskId}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const attachment = attachments?.find((a: Attachment) => a.id === attachmentId);
      
      // If it's a file attachment, delete from upload endpoint
      if (attachment?.type === 'file' && attachment.content) {
        await api.delete(`/upload/files/${attachment.content}`);
      } else {
        // Otherwise use regular attachments endpoint
        await api.delete(`/attachments/${attachmentId}`);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Attachment deleted',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    },
    onError: () => {
      toast({
        title: 'Failed to delete attachment',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const getFileIcon = (attachment: Attachment) => {
    if (attachment.type === 'url') return FaLink;
    if (attachment.type === 'note') return FaStickyNote;

    const mimeType = attachment.mime_type || '';
    if (mimeType.startsWith('image/')) return FaFileImage;
    if (mimeType === 'application/pdf') return FaFilePdf;
    if (mimeType.includes('word')) return FaFileWord;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return FaFileExcel;
    if (mimeType.includes('zip')) return FaFileArchive;
    
    return FaFile;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = (attachment: Attachment) => {
    if (attachment.type === 'file') {
      const url = `/api/upload/files/${attachment.content}`;
      window.open(url, '_blank');
    } else if (attachment.type === 'url') {
      window.open(attachment.content, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="sm" />
      </Box>
    );
  }

  if (!attachments || attachments.length === 0) {
    return (
      <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
        No attachments yet
      </Text>
    );
  }

  return (
    <VStack align="stretch" spacing={2}>
      {attachments.map((attachment: Attachment) => (
        <HStack
          key={attachment.id}
          p={3}
          borderWidth={1}
          borderRadius="md"
          _hover={{ bg: hoverBg }}
          spacing={3}
        >
          <Icon as={getFileIcon(attachment)} color="gray.400" />
          
          <Box flex={1}>
            <HStack spacing={2}>
              <Link
                fontWeight="medium"
                fontSize="sm"
                onClick={() => handleDownload(attachment)}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                {attachment.name}
              </Link>
              <Badge size="xs" colorScheme="gray">
                {attachment.type}
              </Badge>
            </HStack>
            
            <HStack spacing={2} fontSize="xs" color="gray.500">
              {attachment.size && (
                <Text>{formatFileSize(attachment.size)}</Text>
              )}
              <Text>
                {new Date(attachment.created_at).toLocaleDateString()}
              </Text>
            </HStack>
          </Box>

          <HStack>
            {(attachment.type === 'file' || attachment.type === 'url') && (
              <IconButton
                aria-label="Download"
                icon={<DownloadIcon />}
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(attachment)}
              />
            )}
            <IconButton
              aria-label="Delete"
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => deleteMutation.mutate(attachment.id)}
              isLoading={deleteMutation.isPending}
            />
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
};
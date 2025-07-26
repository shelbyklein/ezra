/**
 * File upload component for task attachments
 */

import React, { useCallback } from 'react';
import {
  Box,
  Text,
  VStack,
  Icon,
  useToast,
  Progress,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface FileUploadProps {
  taskId: number;
  onUploadComplete?: (attachment: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ taskId, onUploadComplete }) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/upload/task/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'File uploaded',
        description: `${data.name} has been uploaded successfully.`,
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      onUploadComplete?.(data);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Failed to upload file',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Box>
      <VStack
        {...getRootProps()}
        spacing={4}
        p={6}
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragActive ? 'blue.400' : 'gray.300'}
        borderRadius="md"
        bg={isDragActive ? 'blue.50' : 'gray.50'}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: 'blue.400',
          bg: 'blue.50',
        }}
      >
        <input {...getInputProps()} />
        <Icon as={FaUpload} boxSize={8} color="gray.400" />
        <VStack spacing={1}>
          <Text fontWeight="medium">
            {isDragActive
              ? 'Drop files here'
              : 'Drag & drop files here, or click to select'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Maximum file size: 10MB
          </Text>
          <Text fontSize="xs" color="gray.400">
            Supported: Images, PDF, Word, Excel, Text, ZIP
          </Text>
        </VStack>
      </VStack>

      {uploadMutation.isPending && (
        <Box mt={4}>
          <Text fontSize="sm" mb={2}>Uploading...</Text>
          <Progress size="xs" isIndeterminate colorScheme="blue" />
        </Box>
      )}
    </Box>
  );
};
/**
 * Image upload component for notebook editor
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Input,
  useToast,
  Progress,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaUpload, FaImage } from 'react-icons/fa';
import { api } from '../../../services/api';

interface ImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (url: string) => void;
  notebookId: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  isOpen,
  onClose,
  onImageUploaded,
  notebookId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post(
        `/upload/notebook/${notebookId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      // Insert the image into the editor
      onImageUploaded(response.data.url);
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been inserted into the document',
        status: 'success',
        duration: 3000,
      });

      handleClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Failed to upload image',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
    onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect({ target: { files: [file] } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle paste event
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFileSelect({ target: { files: [file] } } as any);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Insert Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {!preview ? (
              <Box
                borderWidth={2}
                borderStyle="dashed"
                borderColor="gray.300"
                borderRadius="lg"
                p={8}
                textAlign="center"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                _hover={{ borderColor: 'blue.400' }}
                width="full"
              >
                <Icon as={FaImage} boxSize={12} color="gray.400" mb={4} />
                <Text fontWeight="medium" mb={2}>
                  Drop an image here, click to browse, or paste
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Supports JPEG, PNG, GIF, WebP (max 5MB)
                </Text>
              </Box>
            ) : (
              <Box position="relative" width="full">
                <Image
                  src={preview}
                  alt="Preview"
                  maxH="400px"
                  mx="auto"
                  borderRadius="md"
                />
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                >
                  Remove
                </Button>
              </Box>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              display="none"
            />

            {isUploading && (
              <Box width="full">
                <Text fontSize="sm" mb={2}>
                  Uploading... {uploadProgress}%
                </Text>
                <Progress value={uploadProgress} colorScheme="blue" />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FaUpload />}
              onClick={handleUpload}
              isLoading={isUploading}
              isDisabled={!selectedFile}
            >
              Upload Image
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
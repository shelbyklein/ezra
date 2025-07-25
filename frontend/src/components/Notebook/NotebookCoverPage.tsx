/**
 * Notebook cover page displaying metadata and overview
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  IconButton,
  Button,
  Textarea,
  useToast,
  Flex,
  Tag,
  TagLabel,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { TagSelector } from '../common/TagSelector';

interface Notebook {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  project_id?: number | null;
  project_name?: string;
  project_color?: string;
  pages?: any[];
  folders?: any[];
}

interface Project {
  id: number;
  name: string;
  color: string;
}

interface TagData {
  id: number;
  name: string;
  color: string;
}

interface NotebookCoverPageProps {
  notebook: Notebook;
}

export const NotebookCoverPage: React.FC<NotebookCoverPageProps> = ({ notebook }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(notebook.title);
  const [editedDescription, setEditedDescription] = useState(notebook.description || '');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(notebook.project_id || null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch notebook tags
  const { data: notebookTags = [] } = useQuery<TagData[]>({
    queryKey: ['notebook-tags', notebook.id],
    queryFn: async () => {
      const response = await api.get(`/tags/notebook/${notebook.id}`);
      return response.data;
    },
  });

  // Fetch all projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
  });

  // Update selected tags when notebook tags are loaded
  React.useEffect(() => {
    setSelectedTags(notebookTags.map(tag => tag.id));
  }, [notebookTags]);

  // Update notebook mutation
  const updateNotebookMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; project_id: number | null }) => {
      const response = await api.put(`/notebooks/${notebook.id}`, data);
      
      // Update tags
      await api.post(`/tags/notebook/${notebook.id}`, {
        tagIds: selectedTags,
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Notebook updated',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['notebook', notebook.id] });
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      queryClient.invalidateQueries({ queryKey: ['notebook-tags', notebook.id] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Failed to update notebook',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSave = () => {
    updateNotebookMutation.mutate({
      title: editedTitle,
      description: editedDescription,
      project_id: selectedProjectId,
    });
  };

  const handleCancel = () => {
    setEditedTitle(notebook.title);
    setEditedDescription(notebook.description || '');
    setSelectedProjectId(notebook.project_id || null);
    setSelectedTags(notebookTags.map(tag => tag.id));
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="flex-start">
          <VStack align="start" spacing={2} flex={1}>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                fontSize="3xl"
                fontWeight="bold"
                variant="flushed"
                size="lg"
                autoFocus
              />
            ) : (
              <Heading size="2xl">{notebook.title}</Heading>
            )}
            
            <HStack spacing={2} color="gray.500" fontSize="sm">
              <Text>Created {formatDate(notebook.created_at)}</Text>
              <Text>•</Text>
              <Text>Updated {formatDate(notebook.updated_at)}</Text>
            </HStack>
          </VStack>

          {!isEditing && (
            <IconButton
              aria-label="Edit notebook"
              icon={<EditIcon />}
              variant="ghost"
              onClick={() => setIsEditing(true)}
            />
          )}
        </Flex>

        {/* Project Association */}
        {isEditing ? (
          <FormControl>
            <FormLabel>Associated Project</FormLabel>
            <Select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              placeholder="Select a project (optional)"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormControl>
        ) : notebook.project_id && (
          <HStack spacing={2}>
            <Text fontWeight="semibold">Project:</Text>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={
                <Box
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={notebook.project_color}
                  borderWidth={1}
                  borderColor="border.primary"
                />
              }
              onClick={() => navigate(`/app/board/${notebook.project_id}`)}
              _hover={{
                bg: 'gray.100',
                textDecoration: 'none',
              }}
            >
              {notebook.project_name}
            </Button>
          </HStack>
        )}

        {/* Tags */}
        {isEditing ? (
          <Box>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpen}
            >
              Manage Tags
            </Button>
          </Box>
        ) : (
          <HStack spacing={2} flexWrap="wrap">
            {notebookTags.length > 0 ? (
              notebookTags.map(tag => (
                <Tag
                  key={tag.id}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  bg={tag.color}
                  color="white"
                >
                  <TagLabel>{tag.name}</TagLabel>
                </Tag>
              ))
            ) : (
              <Text color="gray.500" fontSize="sm">No tags added</Text>
            )}
          </HStack>
        )}

        {/* Description */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Description</Text>
          {isEditing ? (
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add a description for your notebook..."
              rows={4}
              resize="vertical"
            />
          ) : (
            <Text color={notebook.description ? 'text.primary' : 'gray.500'}>
              {notebook.description || 'No description added yet'}
            </Text>
          )}
        </Box>

        {/* Action Buttons */}
        {isEditing && (
          <HStack spacing={3} justify="flex-end">
            <Button
              variant="ghost"
              leftIcon={<CloseIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<CheckIcon />}
              onClick={handleSave}
              isLoading={updateNotebookMutation.isPending}
            >
              Save Changes
            </Button>
          </HStack>
        )}

        {/* Quick Stats */}
        <Box
          bg="bg.card"
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor="border.primary"
        >
          <Text fontWeight="semibold" mb={2}>Notebook Overview</Text>
          <HStack spacing={8}>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold">
                {notebook.pages?.length || 0}
              </Text>
              <Text color="gray.500" fontSize="sm">Pages</Text>
            </VStack>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold">
                {notebook.folders?.length || 0}
              </Text>
              <Text color="gray.500" fontSize="sm">Folders</Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>

      {/* Tag Selector Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Tags</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TagSelector
              label="Select tags for this notebook"
              value={selectedTags}
              onChange={setSelectedTags}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
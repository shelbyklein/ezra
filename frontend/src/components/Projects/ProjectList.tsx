/**
 * Project list component for displaying and managing projects
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  useToast,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { CreateProjectModal } from './CreateProjectModal';

interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  user_id: number;
  is_archived: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete project',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    onOpen();
  };

  const handleDelete = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      deleteMutation.mutate(projectId);
    }
  };

  const handleCreateNew = () => {
    setSelectedProject(null);
    onOpen();
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <Text color="red.500">Failed to load projects</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <HStack justify="space-between">
        <Heading>My Projects</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateNew}>
          New Project
        </Button>
      </HStack>

      {projects?.length === 0 ? (
        <Center h="300px">
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.500">
              No projects yet
            </Text>
            <Button colorScheme="blue" onClick={handleCreateNew}>
              Create your first project
            </Button>
          </VStack>
        </Center>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {projects?.map((project) => (
            <Card
              key={project.id}
              cursor="pointer"
              onClick={() => navigate(`/board/${project.id}`)}
              _hover={{ shadow: 'lg' }}
              transition="all 0.2s"
            >
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <Heading size="md">{project.name}</Heading>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Edit project"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                    />
                    <IconButton
                      aria-label="Delete project"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                    />
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody py={2}>
                <Text color="gray.600" noOfLines={2}>
                  {project.description || 'No description'}
                </Text>
              </CardBody>
              <CardFooter pt={2}>
                <HStack justify="space-between" w="full">
                  <Badge colorScheme="blue">Active</Badge>
                  <Text fontSize="sm" color="gray.500">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </Text>
                </HStack>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}

      <CreateProjectModal
        isOpen={isOpen}
        onClose={onClose}
        project={selectedProject}
      />
    </VStack>
  );
};
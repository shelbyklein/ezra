/**
 * Dashboard component showing recent projects and notebooks
 */

import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Spinner,
  Center,
  useColorModeValue,
  Icon,
  Badge,
  Container,
  SimpleGrid,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FaProjectDiagram, FaBook, FaClock, FaPlus, FaFolder, FaStar } from 'react-icons/fa';
import { api } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubble } from '../AI/ChatBubble';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsIcon } from '@chakra-ui/icons';

interface Project {
  id: number;
  title: string;
  description: string | null;
  color: string;
  updated_at: string;
  task_count?: number;
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface Notebook {
  id: number;
  title: string;
  icon: string;
  color?: string;
  updated_at: string;
  page_count?: number;
}

interface StarredPage {
  id: number;
  title: string;
  slug: string;
  updated_at: string;
  notebook_id: number;
  notebook_title: string;
  notebook_icon: string;
  notebook_color?: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'gray.200');

  // Fetch recent projects
  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['recent-projects'],
    queryFn: async () => {
      const response = await api.get('/projects/recent?limit=3');
      return response.data;
    },
  });

  // Fetch recent notebooks
  const { data: recentNotebooks, isLoading: notebooksLoading } = useQuery({
    queryKey: ['recent-notebooks'],
    queryFn: async () => {
      const response = await api.get('/notebooks/recent?limit=3');
      return response.data;
    },
  });

  // Fetch starred pages
  const { data: starredPages, isLoading: starredLoading } = useQuery({
    queryKey: ['starred-pages'],
    queryFn: async () => {
      const response = await api.get('/notebooks/starred-pages');
      return response.data;
    },
  });

  const isLoading = projectsLoading || notebooksLoading || starredLoading;

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="start">
              <Box>
                <Heading size="xl" color={headingColor} mb={2}>
                  Welcome back, {user?.username || 'User'}
                </Heading>
                <Text color="gray.500" fontSize="lg">
                  Here's what you've been working on recently
                </Text>
              </Box>
              <Button
                leftIcon={<SettingsIcon />}
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/settings')}
              >
                Settings
              </Button>
            </HStack>
          </Box>

          {/* Recent Projects Section */}
          <Box>
            <HStack justify="space-between" mb={6}>
              <HStack>
                <Icon as={FaProjectDiagram} color="purple.500" boxSize={6} />
                <Heading size="lg" color={headingColor}>
                  Recent Projects
                </Heading>
              </HStack>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="purple"
                size="sm"
                onClick={() => navigate('/app/projects')}
              >
                View All
              </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {recentProjects?.length > 0 ? (
                recentProjects.map((project: Project) => (
                  <Card
                    key={project.id}
                    bg={cardBg}
                    borderWidth={1}
                    borderColor={borderColor}
                    _hover={{ 
                      shadow: 'lg', 
                      transform: 'translateY(-2px)',
                      cursor: 'pointer' 
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/app/board/${project.id}`)}
                  >
                    <Box
                      h={2}
                      bg={project.color || 'purple.500'}
                      roundedTop="md"
                    />
                    <CardHeader pb={2}>
                      <VStack align="start" spacing={1}>
                        <Heading size="md">{project.title}</Heading>
                        {project.description && (
                          <Text fontSize="sm" color="gray.500" noOfLines={2}>
                            {project.description}
                          </Text>
                        )}
                      </VStack>
                    </CardHeader>
                    <CardBody py={2}>
                      {project.tags && project.tags.length > 0 && (
                        <HStack spacing={2} mb={3} flexWrap="wrap">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              colorScheme="gray"
                              bg={tag.color}
                              color="white"
                              fontSize="xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge colorScheme="gray" fontSize="xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </HStack>
                      )}
                      {project.task_count !== undefined && (
                        <Text fontSize="sm" color="gray.500">
                          {project.task_count} task{project.task_count !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </CardBody>
                    <CardFooter pt={2}>
                      <HStack>
                        <Icon as={FaClock} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500">
                          Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                        </Text>
                      </HStack>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={3}>
                      <Icon as={FaProjectDiagram} boxSize={8} color="gray.400" />
                      <Text color="gray.500">No projects yet</Text>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        onClick={() => navigate('/app/projects')}
                      >
                        Create your first project
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>
          </Box>

          {/* Favorites Section */}
          <Box>
            <HStack justify="space-between" mb={6}>
              <HStack>
                <Icon as={FaStar} color="yellow.500" boxSize={6} />
                <Heading size="lg" color={headingColor}>
                  Favorites
                </Heading>
              </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {starredPages?.length > 0 ? (
                starredPages.slice(0, 6).map((page: StarredPage) => (
                  <Card
                    key={page.id}
                    bg={cardBg}
                    borderWidth={1}
                    borderColor={borderColor}
                    _hover={{ 
                      shadow: 'lg', 
                      transform: 'translateY(-2px)',
                      cursor: 'pointer' 
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/app/notebooks/${page.notebook_id}/${page.id}`)}
                  >
                    <CardHeader pb={2}>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Heading size="md" noOfLines={1}>{page.title}</Heading>
                          <Icon as={FaStar} color="yellow.400" boxSize={4} />
                        </HStack>
                        <HStack spacing={2}>
                          <Box
                            p={1}
                            borderRadius="sm"
                            bg={page.notebook_color || 'blue.500'}
                            color="white"
                          >
                            <Icon as={FaFolder} boxSize={3} />
                          </Box>
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {page.notebook_title}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardHeader>
                    <CardFooter pt={2}>
                      <HStack>
                        <Icon as={FaClock} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500">
                          Updated {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                        </Text>
                      </HStack>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={3}>
                      <Icon as={FaStar} boxSize={8} color="gray.400" />
                      <Text color="gray.500">No starred pages yet</Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Star important notebook pages to see them here
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>
          </Box>

          {/* Recent Notebooks Section */}
          <Box>
            <HStack justify="space-between" mb={6}>
              <HStack>
                <Icon as={FaBook} color="blue.500" boxSize={6} />
                <Heading size="lg" color={headingColor}>
                  Recent Notebooks
                </Heading>
              </HStack>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/app/notebooks')}
              >
                View All
              </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {recentNotebooks?.length > 0 ? (
                recentNotebooks.map((notebook: Notebook) => (
                  <Card
                    key={notebook.id}
                    bg={cardBg}
                    borderWidth={1}
                    borderColor={borderColor}
                    _hover={{ 
                      shadow: 'lg', 
                      transform: 'translateY(-2px)',
                      cursor: 'pointer' 
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/app/notebooks/${notebook.id}`)}
                  >
                    <CardHeader>
                      <HStack spacing={3}>
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={notebook.color || 'blue.500'}
                          color="white"
                        >
                          <Icon as={FaFolder} boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Heading size="md">{notebook.title}</Heading>
                          {notebook.page_count !== undefined && (
                            <Text fontSize="sm" color="gray.500">
                              {notebook.page_count} page{notebook.page_count !== 1 ? 's' : ''}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardFooter pt={2}>
                      <HStack>
                        <Icon as={FaClock} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500">
                          Updated {formatDistanceToNow(new Date(notebook.updated_at), { addSuffix: true })}
                        </Text>
                      </HStack>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={3}>
                      <Icon as={FaBook} boxSize={8} color="gray.400" />
                      <Text color="gray.500">No notebooks yet</Text>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => navigate('/app/notebooks')}
                      >
                        Create your first notebook
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
      
      {/* Floating Chat Bubble */}
      <ChatBubble />
    </Box>
  );
};
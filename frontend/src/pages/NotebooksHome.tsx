/**
 * Notebooks home page with card-based layout
 */

import React from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  useDisclosure,
  Spinner,
  Center,
  useColorModeValue,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaBook, FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreateNotebookModal } from '../components/Notebook/NotebookSidebar/CreateNotebookModal';

interface Notebook {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  project_id?: number;
  project_name?: string;
  project_color?: string;
}

const NotebookCard: React.FC<{ notebook: Notebook; onEdit: () => void; onDelete: () => void }> = ({ 
  notebook, 
  onEdit, 
  onDelete 
}) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const iconColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box
      bg={cardBg}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      onClick={() => navigate(`/app/notebooks/${notebook.id}`)}
      position="relative"
      // 8.5:11 aspect ratio (portrait orientation like a sheet of paper)
      aspectRatio="8.5/11"
      display="flex"
      flexDirection="column"
    >
      {/* Menu button */}
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FaEllipsisV />}
          size="sm"
          variant="ghost"
          position="absolute"
          top={2}
          right={2}
          onClick={(e) => e.stopPropagation()}
          aria-label="Options"
        />
        <MenuList onClick={(e) => e.stopPropagation()}>
          <MenuItem icon={<EditIcon />} onClick={onEdit}>
            Edit
          </MenuItem>
          <MenuItem icon={<DeleteIcon />} onClick={onDelete} color="red.500">
            Delete
          </MenuItem>
        </MenuList>
      </Menu>

      <VStack spacing={4} p={6} align="stretch" h="full">
        {/* Icon */}
        <Center flexShrink={0}>
          <Icon as={FaBook} boxSize={12} color={iconColor} />
        </Center>

        {/* Title */}
        <VStack spacing={2} flex={1} align="center" justify="center">
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            textAlign="center"
            noOfLines={2}
          >
            {notebook.title}
          </Text>
          
          {notebook.description && (
            <Text 
              fontSize="sm" 
              color="gray.500" 
              textAlign="center"
              noOfLines={3}
            >
              {notebook.description}
            </Text>
          )}
        </VStack>

        {/* Footer with metadata */}
        <VStack spacing={2} fontSize="xs" color="gray.500" flexShrink={0}>
          {notebook.project_name && (
            <HStack>
              <Box 
                w={2} 
                h={2} 
                borderRadius="full" 
                bg={notebook.project_color || 'gray.400'} 
              />
              <Text>{notebook.project_name}</Text>
            </HStack>
          )}
          <Text>
            Created {new Date(notebook.created_at).toLocaleDateString()}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export const NotebooksHome: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingNotebook, setEditingNotebook] = React.useState<Notebook | null>(null);

  // Fetch notebooks
  const { data: notebooks = [], isLoading } = useQuery<Notebook[]>({
    queryKey: ['notebooks'],
    queryFn: async () => {
      const response = await api.get('/notebooks');
      return response.data;
    },
  });

  // Delete notebook mutation
  const deleteNotebookMutation = useMutation({
    mutationFn: async (notebookId: number) => {
      await api.delete(`/notebooks/${notebookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });

  const handleCreateNotebook = () => {
    setEditingNotebook(null);
    onOpen();
  };

  const handleEditNotebook = (notebook: Notebook) => {
    setEditingNotebook(notebook);
    onOpen();
  };

  const handleDeleteNotebook = async (notebookId: number) => {
    if (window.confirm('Are you sure you want to delete this notebook? This will delete all pages within it.')) {
      deleteNotebookMutation.mutate(notebookId);
    }
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={1}>
          <Text fontSize="3xl" fontWeight="bold">
            Notebooks
          </Text>
          <Text color="gray.500">
            Create and manage your notebooks
          </Text>
        </VStack>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleCreateNotebook}
        >
          New Notebook
        </Button>
      </HStack>

      {/* Notebooks Grid */}
      {notebooks.length === 0 ? (
        <Center h="400px">
          <VStack spacing={4}>
            <Icon as={FaBook} boxSize={16} color="gray.300" />
            <Text fontSize="lg" color="gray.500">
              No notebooks yet
            </Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleCreateNotebook}
            >
              Create Your First Notebook
            </Button>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={6}
        >
          {notebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              onEdit={() => handleEditNotebook(notebook)}
              onDelete={() => handleDeleteNotebook(notebook.id)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Create/Edit Modal */}
      <CreateNotebookModal
        isOpen={isOpen}
        onClose={onClose}
        notebook={editingNotebook}
      />
    </Box>
  );
};
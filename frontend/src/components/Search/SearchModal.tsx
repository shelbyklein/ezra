/**
 * Global search modal component
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  Spinner,
  useColorModeValue,
  Badge,
  InputGroup,
  InputLeftElement,
  Center,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaFileAlt, FaFolder, FaTasks, FaProjectDiagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

interface SearchResult {
  type: 'task' | 'project' | 'notebook' | 'page';
  id: number;
  title: string;
  description?: string;
  content?: string;
  projectId?: number;
  projectName?: string;
  notebookId?: number;
  notebookTitle?: string;
  match?: string;
  score: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await api.get('/search', {
        params: { q: searchQuery }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(data.results);
      setSelectedIndex(0);
    },
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchMutation.mutate(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    onClose();
    setQuery('');
    setResults([]);

    switch (result.type) {
      case 'task':
        navigate(`/app/board/${result.projectId}`);
        break;
      case 'project':
        navigate(`/app/board/${result.id}`);
        break;
      case 'notebook':
        navigate(`/app/notebooks/${result.id}`);
        break;
      case 'page':
        navigate(`/app/notebooks/${result.notebookId}/${result.id}`);
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return FaTasks;
      case 'project':
        return FaProjectDiagram;
      case 'notebook':
        return FaFolder;
      case 'page':
        return FaFileAlt;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'task':
        return 'blue';
      case 'project':
        return 'green';
      case 'notebook':
        return 'purple';
      case 'page':
        return 'orange';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bg} mt="10vh">
        <ModalHeader>Search</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                ref={searchInputRef}
                placeholder="Search tasks, projects, notebooks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                variant="filled"
              />
            </InputGroup>

            {searchMutation.isPending && (
              <Center py={8}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            )}

            {results.length > 0 && (
              <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
                {results.map((result, index) => (
                  <Box
                    key={`${result.type}-${result.id}`}
                    p={3}
                    cursor="pointer"
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={index === selectedIndex ? selectedBg : 'transparent'}
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <HStack spacing={3}>
                      <Icon
                        as={getIcon(result.type)}
                        color={`${getTypeColor(result.type)}.500`}
                        boxSize={5}
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Text fontWeight="medium">{result.title}</Text>
                          <Badge colorScheme={getTypeColor(result.type)} size="sm">
                            {result.type}
                          </Badge>
                        </HStack>
                        {result.description && (
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {result.description}
                          </Text>
                        )}
                        {result.content && (
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {result.content}
                          </Text>
                        )}
                        {result.projectName && (
                          <Text fontSize="xs" color="gray.400">
                            Project: {result.projectName}
                          </Text>
                        )}
                        {result.notebookTitle && (
                          <Text fontSize="xs" color="gray.400">
                            Notebook: {result.notebookTitle}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}

            {query.length >= 2 && results.length === 0 && !searchMutation.isPending && (
              <Text textAlign="center" color="gray.500" py={8}>
                No results found for "{query}"
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
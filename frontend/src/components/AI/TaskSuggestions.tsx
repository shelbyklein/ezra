/**
 * AI-powered task suggestions for projects
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Text,
  Badge,
  IconButton,
  useToast,
  Spinner,
  Card,
  CardBody,
  Heading,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaMagic } from 'react-icons/fa';
import { api } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

interface TaskSuggestionsProps {
  projectId: number;
  onCreateTask?: (task: Partial<TaskSuggestion>) => void;
}

export const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({
  projectId,
  onCreateTask,
}) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onToggle } = useDisclosure();

  const getSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/suggest-tasks', { projectId });
      setSuggestions(response.data.suggestions);
      if (!isOpen) onToggle();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to get suggestions';
      setError(errorMessage);
      
      if (errorMessage.includes('API key')) {
        toast({
          title: 'API Key Required',
          description: 'Please add your Anthropic API key in settings to use AI features.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createTaskMutation = useMutation({
    mutationFn: async (suggestion: TaskSuggestion) => {
      const response = await api.post('/tasks', {
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        status: 'todo',
        project_id: projectId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId.toString()] });
      toast({
        title: 'Task created',
        description: 'AI-suggested task has been added to your board',
        status: 'success',
        duration: 3000,
      });
    },
  });

  const handleCreateTask = (suggestion: TaskSuggestion) => {
    if (onCreateTask) {
      onCreateTask(suggestion);
    } else {
      createTaskMutation.mutate(suggestion);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <Button
        leftIcon={<FaMagic />}
        colorScheme="purple"
        variant="outline"
        size="sm"
        onClick={getSuggestions}
        isLoading={isLoading}
      >
        AI Task Suggestions
      </Button>

      {isOpen && (
        <Box mt={4}>
          {error && (
            <Alert status="error" borderRadius="md" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {isLoading && (
            <VStack spacing={4} py={8}>
              <Spinner size="lg" color="purple.500" />
              <Text>Analyzing your project and generating task suggestions...</Text>
            </VStack>
          )}

          {suggestions.length > 0 && !isLoading && (
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="sm">AI-Generated Task Suggestions</Heading>
                <IconButton
                  aria-label="Regenerate suggestions"
                  icon={<RepeatIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={getSuggestions}
                />
              </HStack>

              {suggestions.map((suggestion, index) => (
                <Card key={index} variant="outline">
                  <CardBody>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" flex={1} spacing={2}>
                        <Text fontWeight="semibold">{suggestion.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {suggestion.description}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <Badge colorScheme="blue">
                            {suggestion.estimatedTime}
                          </Badge>
                        </HStack>
                      </VStack>
                      <IconButton
                        aria-label="Create task"
                        icon={<AddIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleCreateTask(suggestion)}
                        isLoading={createTaskMutation.isPending}
                      />
                    </HStack>
                  </CardBody>
                </Card>
              ))}

              <Text fontSize="xs" color="gray.500" textAlign="center">
                These suggestions are AI-generated based on your project context.
              </Text>
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};
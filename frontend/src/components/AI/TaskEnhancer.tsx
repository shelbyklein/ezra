/**
 * AI-powered task enhancement component
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
  Divider,
  useToast,
  Spinner,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckIcon, RepeatIcon } from '@chakra-ui/icons';
import { MdCheckCircle } from 'react-icons/md';
import { api } from '../../services/api';

interface TaskEnhancement {
  title?: string;
  description?: string;
  subtasks?: string[];
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  tags?: string[];
}

interface TaskEnhancerProps {
  title: string;
  description?: string;
  onApply: (enhancement: TaskEnhancement) => void;
  onClose: () => void;
  taskId?: number; // If enhancing existing task
}

export const TaskEnhancer: React.FC<TaskEnhancerProps> = ({
  title,
  description,
  onApply,
  onClose,
  taskId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enhancement, setEnhancement] = useState<TaskEnhancement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const enhanceTask = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = taskId 
        ? `/ai/tasks/${taskId}/enhance`
        : '/ai/enhance';
      
      const payload = taskId ? {} : { title, description };
      
      const response = await api.post(endpoint, payload);
      setEnhancement(response.data.enhancement);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to enhance task';
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

  // Auto-enhance on mount
  React.useEffect(() => {
    enhanceTask();
  }, []);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const handleApply = () => {
    if (enhancement) {
      onApply(enhancement);
      toast({
        title: 'AI enhancements applied',
        status: 'success',
        duration: 2000,
      });
      onClose();
    }
  };

  return (
    <Box>
      {isLoading && (
        <VStack spacing={4} py={8}>
          <Spinner size="lg" color="blue.500" />
          <Text>Enhancing your task with AI...</Text>
        </VStack>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {enhancement && !isLoading && (
        <VStack align="stretch" spacing={4}>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              AI has analyzed your task and suggested improvements below.
            </Text>
          </Alert>

          {/* Enhanced Title */}
          {enhancement.title && enhancement.title !== title && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Enhanced Title:</Text>
              <Box p={3} bg="bg.muted" borderRadius="md">
                <Text>{enhancement.title}</Text>
              </Box>
            </Box>
          )}

          {/* Enhanced Description */}
          {enhancement.description && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Enhanced Description:</Text>
              <Box p={3} bg="bg.muted" borderRadius="md">
                <Text whiteSpace="pre-wrap">{enhancement.description}</Text>
              </Box>
            </Box>
          )}

          {/* Subtasks */}
          {enhancement.subtasks && enhancement.subtasks.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Suggested Subtasks:</Text>
              <List spacing={2}>
                {enhancement.subtasks.map((subtask, index) => (
                  <ListItem key={index} display="flex" alignItems="start">
                    <ListIcon as={MdCheckCircle} color="green.500" mt={0.5} />
                    <Text fontSize="sm">{subtask}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Priority and Time Estimate */}
          <HStack spacing={4}>
            {enhancement.priority && (
              <Box>
                <Text fontWeight="semibold" mb={1}>Priority:</Text>
                <Badge colorScheme={getPriorityColor(enhancement.priority)}>
                  {enhancement.priority}
                </Badge>
              </Box>
            )}
            
            {enhancement.estimatedTime && (
              <Box>
                <Text fontWeight="semibold" mb={1}>Estimated Time:</Text>
                <Badge colorScheme="blue">{enhancement.estimatedTime}</Badge>
              </Box>
            )}
          </HStack>

          {/* Suggested Tags */}
          {enhancement.tags && enhancement.tags.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Suggested Tags:</Text>
              <HStack wrap="wrap" spacing={2}>
                {enhancement.tags.map((tag, index) => (
                  <Badge key={index} colorScheme="purple">
                    {tag}
                  </Badge>
                ))}
              </HStack>
            </Box>
          )}

          <Divider />

          {/* Action Buttons */}
          <HStack justify="space-between">
            <Button
              leftIcon={<RepeatIcon />}
              variant="ghost"
              onClick={enhanceTask}
              isLoading={isLoading}
            >
              Regenerate
            </Button>
            
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                Skip
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<CheckIcon />}
                onClick={handleApply}
              >
                Apply Enhancements
              </Button>
            </HStack>
          </HStack>
        </VStack>
      )}
    </Box>
  );
};
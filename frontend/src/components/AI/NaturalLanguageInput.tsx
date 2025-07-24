/**
 * Natural language input component for task management
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  VStack,
  Text,
  Box,
  Button,
  HStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Badge,
  Divider,
  Icon,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaMagic, FaCheck, FaRobot } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface NaturalLanguageInputProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

interface ParsedCommand {
  action: string;
  taskData?: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    tags?: string[];
  };
  targetTasks?: {
    taskIds?: number[];
    filter?: any;
  };
  updates?: any;
}

interface CommandResult {
  success: boolean;
  parsedCommand?: ParsedCommand;
  result?: any;
  error?: string;
}

const MotionBox = motion(Box);

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [command, setCommand] = useState('');
  const [preview, setPreview] = useState<ParsedCommand | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const processCommandMutation = useMutation({
    mutationFn: async (naturalCommand: string) => {
      const response = await api.post('/tasks/natural-language', {
        command: naturalCommand,
        projectId,
      });
      return response.data as CommandResult;
    },
    onSuccess: (data) => {
      if (data.success && data.result) {
        let message = '';
        switch (data.result.action) {
          case 'created':
            message = `Task "${data.result.task.title}" created successfully`;
            break;
          case 'updated':
            message = `Updated ${data.result.count} task(s)`;
            break;
          case 'deleted':
            message = `Deleted ${data.result.count} task(s)`;
            break;
          case 'bulk_updated':
            message = `Updated ${data.result.count} task(s)`;
            break;
        }
        
        toast({
          title: 'Command executed',
          description: message,
          status: 'success',
          duration: 3000,
        });
        
        // Refresh tasks
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId.toString()] });
        
        // Reset and close
        setCommand('');
        setPreview(null);
        onClose();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Command failed',
        description: error.response?.data?.error || 'Failed to process command',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!command.trim()) return;

    setIsProcessing(true);
    try {
      await processCommandMutation.mutateAsync(command);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCommand('');
    setPreview(null);
    onClose();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'green';
      case 'update':
      case 'move': return 'blue';
      case 'delete': return 'red';
      case 'bulk': return 'purple';
      case 'query': return 'teal';
      default: return 'gray';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return '➕';
      case 'update':
      case 'move': return '✏️';
      case 'delete': return '🗑️';
      case 'bulk': return '📦';
      case 'query': return '🔍';
      default: return '❓';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <HStack>
              <Icon as={FaRobot} color="purple.500" />
              <Text>Natural Language Command</Text>
            </HStack>
          </ModalHeader>
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <InputGroup size="lg">
                  <InputLeftElement>
                    <Icon as={FaMagic} color="purple.400" />
                  </InputLeftElement>
                  <Input
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Type a command... (e.g., 'Create a task to review the design mockups by Friday')"
                    isDisabled={isProcessing}
                    _focus={{
                      borderColor: 'purple.400',
                      boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)',
                    }}
                  />
                </InputGroup>
                
                <Text fontSize="sm" color="text.secondary" mt={2}>
                  Examples: "Move task 5 to done" • "Set all high priority tasks to in progress" • "Delete the authentication task"
                </Text>
              </Box>

              {isProcessing && (
                <Box textAlign="center" py={4}>
                  <Spinner size="lg" color="purple.500" />
                  <Text mt={2} color="text.secondary">Processing command...</Text>
                </Box>
              )}

              <AnimatePresence>
                {preview && (
                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert status="info" variant="subtle" borderRadius="md">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertDescription>
                          <VStack align="start" spacing={2}>
                            <HStack>
                              <Text fontWeight="bold">Action:</Text>
                              <Badge colorScheme={getActionColor(preview.action)}>
                                {getActionIcon(preview.action)} {preview.action}
                              </Badge>
                            </HStack>
                            
                            {preview.taskData && (
                              <>
                                <Divider />
                                <Box>
                                  <Text fontWeight="bold" mb={1}>Task Details:</Text>
                                  {preview.taskData.title && (
                                    <Text fontSize="sm">• Title: {preview.taskData.title}</Text>
                                  )}
                                  {preview.taskData.description && (
                                    <Text fontSize="sm">• Description: {preview.taskData.description}</Text>
                                  )}
                                  {preview.taskData.priority && (
                                    <Text fontSize="sm">• Priority: {preview.taskData.priority}</Text>
                                  )}
                                  {preview.taskData.status && (
                                    <Text fontSize="sm">• Status: {preview.taskData.status}</Text>
                                  )}
                                  {preview.taskData.due_date && (
                                    <Text fontSize="sm">• Due date: {preview.taskData.due_date}</Text>
                                  )}
                                </Box>
                              </>
                            )}
                            
                            {preview.targetTasks?.taskIds && (
                              <>
                                <Divider />
                                <Text fontSize="sm">
                                  <Text as="span" fontWeight="bold">Target tasks:</Text> {preview.targetTasks.taskIds.join(', ')}
                                </Text>
                              </>
                            )}
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </MotionBox>
                )}
              </AnimatePresence>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="purple"
                leftIcon={<FaCheck />}
                isLoading={isProcessing}
                isDisabled={!command.trim()}
              >
                Execute Command
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
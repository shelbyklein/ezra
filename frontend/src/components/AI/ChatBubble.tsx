/**
 * Floating chat bubble component for AI assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  Spinner,
  Badge,
  Card,
  CloseButton,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaComment,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    result?: any;
    error?: boolean;
  };
}

const MotionBox = motion(Box);

export const ChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userMsgBg = useColorModeValue('blue.50', 'blue.900');
  const assistantMsgBg = useColorModeValue('gray.50', 'gray.700');
  const shadowColor = useColorModeValue('lg', 'dark-lg');
  const headerBgColor = useColorModeValue('purple.50', 'purple.900');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch user's projects for context
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
  });

  // Get current project from URL if on board view
  const getCurrentProject = () => {
    const path = location.pathname;
    const match = path.match(/\/app\/board\/(\d+)/);
    if (match) {
      const projectId = parseInt(match[1]);
      return projects?.find((p: any) => p.id === projectId);
    }
    return null;
  };

  // Get current notebook and page from URL if on notebook view
  const getCurrentNotebookContext = () => {
    const path = location.pathname;
    const match = path.match(/\/app\/notebooks\/(\d+)(?:\/(\d+))?/);
    if (match) {
      return {
        notebookId: parseInt(match[1]),
        pageId: match[2] ? parseInt(match[2]) : null
      };
    }
    return null;
  };

  // Fetch current page data for context display
  const { data: currentPage } = useQuery({
    queryKey: ['notebook-page', currentContext?.currentPageId],
    queryFn: async () => {
      if (!currentContext?.currentPageId) return null;
      const response = await api.get(`/notebooks/pages/${currentContext.currentPageId}`);
      return response.data;
    },
    enabled: !!currentContext?.currentPageId,
  });

  // Fetch current notebook data for context display
  const { data: currentNotebook } = useQuery({
    queryKey: ['notebook', currentContext?.currentNotebookId],
    queryFn: async () => {
      if (!currentContext?.currentNotebookId) return null;
      const response = await api.get(`/notebooks/${currentContext.currentNotebookId}`);
      return response.data;
    },
    enabled: !!currentContext?.currentNotebookId && !currentContext?.currentPageId,
  });

  // Update context when location changes
  useEffect(() => {
    const project = getCurrentProject();
    const notebookContext = getCurrentNotebookContext();
    
    setCurrentContext({
      currentProjectId: project?.id,
      currentProjectName: project?.name,
      currentNotebookId: notebookContext?.notebookId,
      currentPageId: notebookContext?.pageId,
      currentView: location.pathname,
      projects: projects?.map((p: any) => ({ id: p.id, name: p.name })),
    });
  }, [location.pathname, projects]);

  // Set context-aware greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let greeting = `Hi! I'm Ezra. `;
      
      if (currentContext?.currentPageId && currentPage) {
        greeting += `I see you're editing "${currentPage.title}". How can I help you with this page?`;
      } else if (currentContext?.currentNotebookId && currentNotebook) {
        greeting += `I see you're in the "${currentNotebook.title}" notebook. What would you like to do?`;
      } else if (currentContext?.currentProjectId) {
        greeting += `I see you're working on ${currentContext.currentProjectName || 'your project'}. How can I assist you?`;
      } else {
        greeting += `How can I help you today?`;
      }
      
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, currentContext, currentPage, currentNotebook]);

  // Process message with AI
  const processChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('/ai/chat', {
        message,
        context: currentContext,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Handle any actions that were performed
      if (data.metadata?.action) {
        console.log('Handling action result:', data.metadata);
        handleActionResult(data.metadata);
      }
    },
    onError: (error: any) => {
      setIsTyping(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I encountered an error: ${error.response?.data?.error || 'Something went wrong'}. Please try again.`,
        timestamp: new Date(),
        metadata: { error: true },
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleActionResult = (metadata: any) => {
    // Refresh relevant data based on action
    switch (metadata.action) {
      case 'created_project':
      case 'updated_project':
      case 'deleted_project':
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        break;
      
      case 'created_task':
      case 'updated_task':
      case 'deleted_task':
      case 'bulk_updated_tasks':
        const currentProject = getCurrentProject();
        if (currentProject) {
          queryClient.invalidateQueries({ 
            queryKey: ['tasks', currentProject.id.toString()] 
          });
        }
        break;
      
      case 'updated_page':
        const notebookContext = getCurrentNotebookContext();
        console.log('Updated page action, notebook context:', notebookContext);
        if (notebookContext?.pageId) {
          // Invalidate the page query to trigger a refresh
          console.log('Invalidating queries for pageId:', notebookContext.pageId);
          // Use number for pageId to match the query key format
          queryClient.invalidateQueries({ 
            queryKey: ['notebook-page', notebookContext.pageId] 
          });
          // Also invalidate the notebook query to update the sidebar
          if (notebookContext.notebookId) {
            queryClient.invalidateQueries({ 
              queryKey: ['notebook', notebookContext.notebookId] 
            });
          }
          // Force refetch with immediate execution
          setTimeout(() => {
            console.log('Force refetching page:', notebookContext.pageId);
            queryClient.invalidateQueries({ 
              queryKey: ['notebook-page', notebookContext.pageId],
              exact: true,
              refetchType: 'active',
            });
            queryClient.refetchQueries({ 
              queryKey: ['notebook-page', notebookContext.pageId],
              exact: true,
            });
          }, 100);
        } else {
          console.warn('No notebook context found for page update');
        }
        break;
      
      case 'created_page':
        if (metadata.result?.notebookId) {
          queryClient.invalidateQueries({ 
            queryKey: ['notebook', metadata.result.notebookId.toString()] 
          });
          // Navigate to the new page
          if (metadata.result.pageId) {
            navigate(`/app/notebooks/${metadata.result.notebookId}/${metadata.result.pageId}`);
          }
        }
        break;
      
      case 'navigate':
        if (metadata.result?.path) {
          navigate(metadata.result.path);
          // Optionally close the chat after navigation
          setTimeout(() => setIsOpen(false), 500);
        }
        break;
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    processChatMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {!isOpen && (
          <MotionBox
            position="fixed"
            bottom={6}
            right={6}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            zIndex={20}
          >
            <Tooltip label="Chat with Ezra" placement="left">
              <IconButton
                aria-label="Open chat"
                icon={<FaComment />}
                size="lg"
                colorScheme="purple"
                rounded="full"
                shadow={shadowColor}
                onClick={() => setIsOpen(true)}
                width={16}
                height={16}
              />
            </Tooltip>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            bottom={6}
            right={6}
            width={{ base: 'calc(100% - 48px)', md: '400px' }}
            height="600px"
            maxHeight="calc(100vh - 100px)"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            zIndex={20}
          >
            <Card
              height="full"
              shadow={shadowColor}
              borderWidth={1}
              borderColor={borderColor}
              overflow="hidden"
            >
              {/* Header */}
              <Flex
                p={4}
                borderBottomWidth={1}
                borderColor={borderColor}
                align="center"
                justify="space-between"
                bg={headerBgColor}
              >
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Avatar icon={<FaRobot />} bg="purple.500" size="sm" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">Ezra</Text>
                      <Text fontSize="xs" opacity={0.8}>AI Assistant</Text>
                    </VStack>
                  </HStack>
                  {currentContext?.currentPageId && currentPage && (
                    <Text fontSize="xs" opacity={0.7} ml={12}>
                      Editing: {currentPage.title}
                    </Text>
                  )}
                  {currentContext?.currentNotebookId && !currentContext?.currentPageId && currentNotebook && (
                    <Text fontSize="xs" opacity={0.7} ml={12}>
                      Viewing: {currentNotebook.title}
                    </Text>
                  )}
                  {currentContext?.currentProjectId && !currentContext?.currentPageId && !currentContext?.currentNotebookId && (
                    <Text fontSize="xs" opacity={0.7} ml={12}>
                      Working on: {currentContext.currentProjectName || `Project ${currentContext.currentProjectId}`}
                    </Text>
                  )}
                </VStack>
                <CloseButton onClick={() => setIsOpen(false)} />
              </Flex>

              {/* Messages */}
              <Box
                flex={1}
                overflowY="auto"
                p={4}
                bg={bgColor}
              >
                <VStack spacing={3} align="stretch">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <MotionBox
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <HStack
                          align="start"
                          spacing={2}
                          justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                        >
                          {message.role === 'assistant' && (
                            <Avatar
                              icon={<FaRobot />}
                              bg="purple.500"
                              size="xs"
                              mt={1}
                            />
                          )}
                          
                          <Box
                            maxW="85%"
                            bg={message.role === 'user' ? userMsgBg : assistantMsgBg}
                            px={3}
                            py={2}
                            borderRadius="lg"
                            fontSize="sm"
                          >
                            {message.role === 'assistant' ? (
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <Text>{children}</Text>,
                                  ul: ({ children }) => <Box as="ul" pl={3}>{children}</Box>,
                                  li: ({ children }) => <Box as="li" mb={1}>{children}</Box>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : (
                              <Text>{message.content}</Text>
                            )}
                            
                            {message.metadata?.action && (
                              <Badge
                                mt={1}
                                colorScheme={message.metadata.error ? 'red' : 'green'}
                                fontSize="xs"
                              >
                                {message.metadata.action.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </Box>
                          
                          {message.role === 'user' && (
                            <Avatar
                              icon={<FaUser />}
                              bg="blue.500"
                              size="xs"
                              mt={1}
                            />
                          )}
                        </HStack>
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <HStack>
                      <Avatar icon={<FaRobot />} bg="purple.500" size="xs" />
                      <Box
                        bg={assistantMsgBg}
                        px={3}
                        py={2}
                        borderRadius="lg"
                      >
                        <Spinner size="xs" />
                      </Box>
                    </HStack>
                  )}
                  
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>

              {/* Input */}
              <Box
                p={3}
                borderTopWidth={1}
                borderColor={borderColor}
                bg={bgColor}
              >
                <InputGroup size="md">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    isDisabled={isTyping}
                    size="sm"
                    _focus={{
                      borderColor: 'purple.400',
                      boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)',
                    }}
                  />
                  <InputRightElement height="auto">
                    <IconButton
                      aria-label="Send message"
                      icon={<FaPaperPlane />}
                      onClick={handleSend}
                      isDisabled={!input.trim() || isTyping}
                      colorScheme="purple"
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </Box>
            </Card>
          </MotionBox>
        )}
      </AnimatePresence>
    </>
  );
};
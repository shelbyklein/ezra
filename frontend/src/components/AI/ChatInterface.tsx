/**
 * Main chat interface for natural language interaction with Ezra
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
  CardBody,
  Divider,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { 
  FaPaperPlane, 
  FaRobot, 
  FaUser, 
  FaProjectDiagram, 
  FaTasks,
  FaBook,
  FaPlus,
  FaEllipsisV,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

interface ChatContext {
  currentProjectId?: number;
  currentProjectName?: string;
  currentView?: string;
  recentTasks?: Array<{ id: number; title: string }>;
}

const MotionBox = motion(Box);

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hi! I'm Ezra, your AI project assistant. I can help you manage your projects, tasks, and notes through natural conversation.

Here are some things you can ask me:
- "Create a new project called Website Redesign"
- "Show me all my high priority tasks"
- "Add a task to review the design mockups by Friday"
- "Move task 5 to done"
- "Create a note about today's meeting"
- "What projects am I working on?"

What would you like to do today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userMsgBg = useColorModeValue('blue.50', 'blue.900');
  const assistantMsgBg = useColorModeValue('gray.50', 'gray.700');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch user's projects for context
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    },
  });

  // Process message with AI
  const processChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('/ai/chat', {
        message,
        context: {
          ...context,
          projects: projects?.map((p: any) => ({ id: p.id, name: p.name })),
        },
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
        if (metadata.result?.projectId) {
          setContext(prev => ({
            ...prev,
            currentProjectId: metadata.result.projectId,
            currentProjectName: metadata.result.projectName,
          }));
        }
        break;
      
      case 'created_task':
      case 'updated_task':
      case 'deleted_task':
      case 'bulk_updated_tasks':
        if (context.currentProjectId) {
          queryClient.invalidateQueries({ 
            queryKey: ['tasks', context.currentProjectId.toString()] 
          });
        }
        break;
      
      case 'navigate':
        if (metadata.result?.path) {
          navigate(metadata.result.path);
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

  const quickActions = [
    { icon: FaProjectDiagram, label: 'New Project', action: 'Create a new project called ' },
    { icon: FaTasks, label: 'Add Task', action: 'Add a task to ' },
    { icon: FaBook, label: 'Create Note', action: 'Create a note about ' },
  ];

  return (
    <Flex h="100vh" direction="column" bg={bgColor}>
      {/* Header */}
      <Box p={4} borderBottomWidth={1} borderColor={borderColor}>
        <HStack justify="space-between">
          <HStack>
            <Avatar icon={<FaRobot />} bg="purple.500" size="sm" />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">Ezra AI Assistant</Text>
              <Text fontSize="sm" color="gray.500">
                {context.currentProjectName 
                  ? `Working on: ${context.currentProjectName}`
                  : 'No project selected'
                }
              </Text>
            </VStack>
          </HStack>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem onClick={() => navigate('/app/projects')}>
                View All Projects
              </MenuItem>
              <MenuItem onClick={() => navigate('/app/notebooks')}>
                Open Notebooks
              </MenuItem>
              <MenuItem onClick={() => navigate('/app/settings')}>
                Settings
              </MenuItem>
              <MenuItem onClick={() => setMessages([messages[0]])}>
                Clear Chat
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      {/* Messages */}
      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          <AnimatePresence>
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
                  spacing={3}
                  justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                >
                  {message.role === 'assistant' && (
                    <Avatar
                      icon={<FaRobot />}
                      bg="purple.500"
                      size="sm"
                      mt={1}
                    />
                  )}
                  
                  <Card
                    maxW="70%"
                    bg={message.role === 'user' ? userMsgBg : assistantMsgBg}
                    variant="filled"
                  >
                    <CardBody py={2} px={3}>
                      {message.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <Text mb={2}>{children}</Text>,
                            ul: ({ children }) => <Box as="ul" pl={4} mb={2}>{children}</Box>,
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
                          mt={2}
                          colorScheme={message.metadata.error ? 'red' : 'green'}
                          fontSize="xs"
                        >
                          {message.metadata.action.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </CardBody>
                  </Card>
                  
                  {message.role === 'user' && (
                    <Avatar
                      icon={<FaUser />}
                      bg="blue.500"
                      size="sm"
                      mt={1}
                    />
                  )}
                </HStack>
              </MotionBox>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <HStack>
              <Avatar icon={<FaRobot />} bg="purple.500" size="sm" />
              <Box
                bg={assistantMsgBg}
                px={4}
                py={2}
                borderRadius="lg"
              >
                <Spinner size="sm" />
              </Box>
            </HStack>
          )}
          
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Quick Actions */}
      <Box px={4} pb={2}>
        <HStack spacing={2}>
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              leftIcon={<action.icon />}
              variant="ghost"
              onClick={() => setInput(action.action)}
            >
              {action.label}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Input */}
      <Box p={4} borderTopWidth={1} borderColor={borderColor}>
        <InputGroup size="lg">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message or ask me anything..."
            isDisabled={isTyping}
            _focus={{
              borderColor: 'purple.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)',
            }}
          />
          <InputRightElement>
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
    </Flex>
  );
};
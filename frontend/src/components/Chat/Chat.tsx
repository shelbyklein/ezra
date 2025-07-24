/**
 * Dedicated chat page component
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Card,
  useColorModeValue,
  Spinner,
  Avatar,
  Flex,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FaPaperPlane, FaHistory } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { ChatHistory } from './ChatHistory';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const userMessageBg = useColorModeValue('blue.50', 'blue.900');
  const assistantMessageBg = useColorModeValue('gray.100', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you manage tasks, projects, and notebooks. How can I assist you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('/ai/chat', {
        message,
        context: {
          location: 'chat_page',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    sendMessage.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box bg={bgColor} h="calc(100vh - 200px)" display="flex" flexDirection="column">
      <VStack h="full" spacing={0}>
        {/* Chat Header */}
        <Box w="full" bg={cardBg} p={4} borderBottomWidth={1}>
          <HStack justify="space-between">
            <Box>
              <Text fontSize="xl" fontWeight="bold">AI Assistant</Text>
              <Text fontSize="sm" color="gray.500">
                Ask me anything about your projects, tasks, or notebooks
              </Text>
            </Box>
            <Button
              leftIcon={<FaHistory />}
              variant="outline"
              size="sm"
              onClick={onOpen}
            >
              Chat History
            </Button>
          </HStack>
        </Box>

        {/* Messages Area */}
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          p={4}
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('#CBD5E0', '#4A5568'),
              borderRadius: '4px',
            },
          }}
        >
          <VStack spacing={4} align="stretch" maxW="3xl" mx="auto">
            {messages.map((message) => (
              <Flex
                key={message.id}
                justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
              >
                <HStack
                  maxW="70%"
                  align="flex-start"
                  spacing={3}
                  flexDirection={message.role === 'user' ? 'row-reverse' : 'row'}
                >
                  <Avatar
                    size="sm"
                    name={message.role === 'user' ? 'You' : 'AI'}
                    bg={message.role === 'user' ? 'blue.500' : 'purple.500'}
                  />
                  <Card
                    bg={message.role === 'user' ? userMessageBg : assistantMessageBg}
                    p={4}
                    borderRadius="lg"
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <Text mb={2}>{children}</Text>,
                          ul: ({ children }) => <Box as="ul" pl={4} mb={2}>{children}</Box>,
                          ol: ({ children }) => <Box as="ol" pl={4} mb={2}>{children}</Box>,
                          li: ({ children }) => <Box as="li" mb={1}>{children}</Box>,
                          code: ({ children, ...props }) => {
                            const isInline = !props.node || props.node.children.length === 1;
                            return isInline ? (
                              <Text as="code" bg="gray.700" px={1} borderRadius="sm">
                                {children}
                              </Text>
                            ) : (
                              <Box
                                as="pre"
                                bg="gray.900"
                                p={3}
                                borderRadius="md"
                                overflowX="auto"
                                my={2}
                              >
                                <Text as="code" fontSize="sm">
                                  {children}
                                </Text>
                              </Box>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <Text>{message.content}</Text>
                    )}
                  </Card>
                </HStack>
              </Flex>
            ))}
            {sendMessage.isPending && (
              <Flex justify="flex-start">
                <HStack maxW="70%" align="center" spacing={3}>
                  <Avatar size="sm" name="AI" bg="purple.500" />
                  <Card bg={assistantMessageBg} p={4} borderRadius="lg">
                    <HStack>
                      <Spinner size="sm" />
                      <Text>Thinking...</Text>
                    </HStack>
                  </Card>
                </HStack>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* Input Area */}
        <Box w="full" bg={cardBg} p={4} borderTopWidth={1}>
          <HStack maxW="3xl" mx="auto">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              size="lg"
              flex={1}
              disabled={sendMessage.isPending}
            />
            <IconButton
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={handleSend}
              colorScheme="blue"
              size="lg"
              isLoading={sendMessage.isPending}
              isDisabled={!input.trim()}
            />
          </HStack>
        </Box>
      </VStack>

      {/* Chat History Modal */}
      <ChatHistory isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};
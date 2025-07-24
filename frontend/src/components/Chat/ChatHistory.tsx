/**
 * Chat history component for viewing past conversations
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Spinner,
  IconButton,
  useToast,
  Badge,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTrash, FaComment, FaRobot, FaUser } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Conversation {
  id: number;
  title: string;
  started_at: string;
  last_message_at: string;
  messageCount: number;
  preview: string;
  lastMessageRole: 'user' | 'assistant';
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  metadata: any;
  created_at: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ isOpen, onClose }) => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const userMsgBg = useColorModeValue('blue.50', 'blue.900');
  const assistantMsgBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const response = await api.get('/chat-history/conversations');
      return response.data as Conversation[];
    },
    enabled: isOpen,
  });

  // Fetch messages for selected conversation
  const { data: conversationData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedConversation],
    queryFn: async () => {
      const response = await api.get(`/chat-history/conversations/${selectedConversation}/messages`);
      return response.data;
    },
    enabled: !!selectedConversation,
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/chat-history/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      setSelectedConversation(null);
      toast({
        title: 'Conversation deleted',
        status: 'success',
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete conversation',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversationMutation.mutate(id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent bg={bgColor} maxH="90vh">
        <ModalHeader>Chat History</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <HStack spacing={4} align="stretch" h="70vh">
            {/* Conversations List */}
            <VStack
              w="350px"
              align="stretch"
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              p={4}
              overflowY="auto"
            >
              <Text fontSize="sm" fontWeight="bold" mb={2}>
                Conversations
              </Text>
              
              {conversationsLoading ? (
                <Box textAlign="center" py={4}>
                  <Spinner />
                </Box>
              ) : conversations?.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  No conversations yet
                </Text>
              ) : (
                conversations?.map((conv) => (
                  <Box
                    key={conv.id}
                    p={3}
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="md"
                    cursor="pointer"
                    bg={selectedConversation === conv.id ? hoverBg : 'transparent'}
                    _hover={{ bg: hoverBg }}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {conv.title}
                      </Text>
                      <IconButton
                        aria-label="Delete conversation"
                        icon={<FaTrash />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => handleDelete(conv.id, e)}
                      />
                    </HStack>
                    
                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      {conv.preview}
                    </Text>
                    
                    <HStack justify="space-between" mt={2}>
                      <Badge size="sm">
                        <HStack spacing={1}>
                          <FaComment size={10} />
                          <Text>{conv.messageCount}</Text>
                        </HStack>
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {format(new Date(conv.last_message_at), 'MMM d, h:mm a')}
                      </Text>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>

            {/* Messages View */}
            <Box
              flex={1}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              p={4}
              overflowY="auto"
            >
              {!selectedConversation ? (
                <Text color="gray.500" textAlign="center" mt={10}>
                  Select a conversation to view messages
                </Text>
              ) : messagesLoading ? (
                <Box textAlign="center" mt={10}>
                  <Spinner />
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {conversationData?.messages.map((message: Message) => (
                    <HStack
                      key={message.id}
                      align="start"
                      spacing={2}
                      justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                    >
                      {message.role === 'assistant' && (
                        <Avatar
                          icon={<FaRobot />}
                          bg="purple.500"
                          size="sm"
                        />
                      )}
                      
                      <Box
                        maxW="70%"
                        bg={message.role === 'user' ? userMsgBg : assistantMsgBg}
                        px={4}
                        py={2}
                        borderRadius="lg"
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
                          <Badge mt={2} size="sm">
                            {message.metadata.action.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </Text>
                      </Box>
                      
                      {message.role === 'user' && (
                        <Avatar
                          icon={<FaUser />}
                          bg="blue.500"
                          size="sm"
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </HStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
/**
 * API Key management component for user settings
 */

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  IconButton,
  useColorModeValue,
  Heading,
  Text,
  Code,
  Link,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { api } from '../../services/api';

export const ApiKeySettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch user profile to check if API key exists
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return response.data;
    },
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async (newApiKey: string) => {
      const response = await api.put('/users/api-key', { apiKey: newApiKey });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'API key updated',
        description: 'Your Anthropic API key has been saved securely.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setApiKey('');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update API key',
        description: error.response?.data?.error || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Remove API key mutation
  const removeApiKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/users/api-key');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'API key removed',
        description: 'Your Anthropic API key has been deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove API key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'API key required',
        description: 'Please enter your Anthropic API key',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      toast({
        title: 'Invalid API key format',
        description: 'Anthropic API keys start with "sk-ant-"',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    updateApiKeyMutation.mutate(apiKey);
  };

  const handleCancel = () => {
    setApiKey('');
    setIsEditing(false);
  };

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading size="md" mb={2}>
            Anthropic API Key
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Connect your Anthropic API key to enable AI-powered features.
          </Text>
        </Box>

        {!userProfile?.hasApiKey && !isEditing ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              <VStack align="start" spacing={1}>
                <Text>No API key configured.</Text>
                <Text fontSize="sm">
                  Get your API key from{' '}
                  <Link
                    href="https://console.anthropic.com/settings/keys"
                    isExternal
                    color="blue.500"
                  >
                    Anthropic Console
                  </Link>
                </Text>
              </VStack>
            </AlertDescription>
          </Alert>
        ) : null}

        {userProfile?.hasApiKey && !isEditing ? (
          <Box>
            <Alert status="success" borderRadius="md" mb={4}>
              <AlertIcon />
              <AlertDescription>
                API key is configured and ready to use.
              </AlertDescription>
            </Alert>
            <HStack>
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                colorScheme="blue"
              >
                Update Key
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => removeApiKeyMutation.mutate()}
                isLoading={removeApiKeyMutation.isPending}
              >
                Remove Key
              </Button>
            </HStack>
          </Box>
        ) : null}

        {isEditing || (!userProfile?.hasApiKey && !isEditing) ? (
          <Box>
            <FormControl>
              <FormLabel>API Key</FormLabel>
              <InputGroup>
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  fontFamily="mono"
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                    icon={showApiKey ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowApiKey(!showApiKey)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText>
                Your API key will be encrypted and stored securely.
              </FormHelperText>
            </FormControl>

            <HStack mt={4}>
              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={updateApiKeyMutation.isPending}
              >
                Save API Key
              </Button>
              {isEditing && (
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </HStack>
          </Box>
        ) : null}

        <Box mt={4} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            How to get your API key:
          </Text>
          <VStack align="start" spacing={1} fontSize="sm">
            <Text>1. Visit the Anthropic Console</Text>
            <Text>2. Navigate to API Keys section</Text>
            <Text>3. Create a new key or copy an existing one</Text>
            <Text>4. Keys start with <Code>sk-ant-</Code></Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
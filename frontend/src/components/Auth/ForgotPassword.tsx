/**
 * Forgot password component for requesting password reset
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { api } from '../../services/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [emailError, setEmailError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        // In development, show the token
        if (response.data.resetToken) {
          setResetToken(response.data.resetToken);
        } else {
          toast({
            title: 'Check your email',
            description: response.data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetToken) {
    return (
      <Container maxW="lg" py={12}>
        <VStack spacing={8} align="stretch">
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Development Mode</AlertTitle>
              <AlertDescription>
                In production, this token would be sent via email. For testing, use this token:
              </AlertDescription>
            </Box>
          </Alert>
          
          <Code p={4} borderRadius="md" fontSize="sm" wordBreak="break-all">
            {resetToken}
          </Code>
          
          <Button
            colorScheme="blue"
            onClick={() => navigate(`/reset-password?token=${resetToken}`)}
          >
            Go to Reset Password Page
          </Button>
          
          <Button
            variant="ghost"
            leftIcon={<ArrowBackIcon />}
            onClick={() => {
              setResetToken('');
              setEmail('');
            }}
          >
            Request Another Reset
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="lg" py={12}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2} align="center">
          <Heading size="xl">Forgot Password</Heading>
          <Text color="gray.600">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </VStack>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!emailError}>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                size="lg"
              />
              {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Sending..."
            >
              Send Reset Link
            </Button>

            <Button
              as={Link}
              to="/login"
              variant="ghost"
              leftIcon={<ArrowBackIcon />}
              width="full"
            >
              Back to Login
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
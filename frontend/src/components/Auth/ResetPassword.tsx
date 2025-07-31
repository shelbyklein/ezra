/**
 * Reset password component for setting new password with token
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { api } from '../../services/api';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {
      token: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!token) {
      newErrors.token = 'Reset token is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password-token', {
        token,
        newPassword,
      });

      if (response.data.success) {
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been reset. Please log in with your new password.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.error?.message || 'Failed to reset password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={12}>
      <VStack spacing={8} align="stretch">
        <VStack spacing={2} align="center">
          <Heading size="xl">Reset Your Password</Heading>
          <Text color="gray.600">
            Enter your new password below
          </Text>
        </VStack>

        {!token && (
          <Alert status="warning">
            <AlertIcon />
            No reset token found. Please use the link from your email or request a new password reset.
          </Alert>
        )}

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.token}>
              <FormLabel>Reset Token</FormLabel>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your reset token"
                size="lg"
              />
              {errors.token && <FormErrorMessage>{errors.token}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.newPassword}>
              <FormLabel>New Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              {errors.newPassword && <FormErrorMessage>{errors.newPassword}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Resetting..."
            >
              Reset Password
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
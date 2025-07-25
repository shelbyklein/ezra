/**
 * Login component for user authentication
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { LoginDevTools } from './LoginDevTools';

interface LoginFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Container id="login-container" className="auth-container" maxW="lg" py={{ base: '12', md: '24' }}>
        <VStack spacing="8">
        <VStack spacing="2">
          <Heading id="login-heading" size="xl">Welcome back</Heading>
          <Text color="text.secondary">Sign in to your account to continue</Text>
        </VStack>

        <Box
          id="login-form-container"
          className="auth-form-container"
          py="8"
          px={{ base: '4', sm: '10' }}
          bg="bg.card"
          boxShadow="base"
          borderRadius="xl"
          w="full"
        >
          <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing="6">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel htmlFor="login-email">Email</FormLabel>
                <Input
                  id="login-email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel htmlFor="login-password">Password</FormLabel>
                <InputGroup>
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      id="login-password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Button
                id="login-submit-button"
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isSubmitting}
                w="full"
              >
                Sign in
              </Button>
            </VStack>
          </form>
        </Box>

        <Text>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="blue.500">
            Sign up
          </Link>
        </Text>
      </VStack>
    </Container>
    <LoginDevTools />
    </>
  );
};
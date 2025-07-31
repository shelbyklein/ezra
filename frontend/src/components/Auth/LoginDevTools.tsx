/**
 * Developer tools for login page (development only)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  Code,
  Select,
  FormControl,
  FormLabel,
  Divider,
  Input,
  Icon,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { FaUserShield } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Create axios instance with same config as main API
const devApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
}

export const LoginDevTools: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adminSecret, setAdminSecret] = useState('');
  
  // Get admin secret from environment or localStorage
  useEffect(() => {
    const savedSecret = localStorage.getItem('ezra_admin_secret') || '';
    setAdminSecret(savedSecret);
  }, []);

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const handleResetAll = async () => {
    setIsLoading(true);
    try {
      const response = await devApi.delete('/dev/reset-all');
      toast({
        title: 'Database Reset',
        description: response.data.message,
        status: 'success',
        duration: 5000,
      });
      onClose();
    } catch (error: any) {
      console.error('Reset error:', error);
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.error || error.message || 'Failed to reset database. Make sure the backend is running.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const response = await devApi.post('/dev/seed');
      toast({
        title: 'Sample Data Created',
        description: (
          <Box>
            <Text>Test user created:</Text>
            <Code fontSize="sm">Email: {response.data.testUser.email}</Code>
            <br />
            <Code fontSize="sm">Password: {response.data.testUser.password}</Code>
          </Box>
        ),
        status: 'success',
        duration: 10000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      console.error('Seed error:', error);
      toast({
        title: 'Seeding Failed',
        description: error.response?.data?.error || error.message || 'Failed to create sample data. Make sure the backend is running.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!adminSecret) {
      toast({
        title: 'Admin Secret Required',
        description: 'Please set admin secret in the input field',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const response = await devApi.get('/auth/users-list', {
        headers: {
          'x-admin-secret': adminSecret,
        },
      });
      setUsers(response.data.data.users);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      toast({
        title: 'Failed to fetch users',
        description: error.response?.data?.error?.message || 'Check admin secret',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleAdminLogin = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Select a user',
        description: 'Please select a user to login as',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await devApi.post('/auth/admin-login', 
        { userId: parseInt(selectedUserId) },
        {
          headers: {
            'x-admin-secret': adminSecret,
          },
        }
      );

      // Use the AuthContext loginWithToken method
      loginWithToken(response.data.data.token, response.data.data.user);
      
      // Close the modal first
      onClose();
      
      // Show success message
      toast({
        title: 'Admin Override Login',
        description: `Logged in as ${response.data.data.user.username}`,
        status: 'success',
        duration: 3000,
      });

      // Navigate to home using React Router after a brief delay to ensure modal is closed
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: 'Admin Login Failed',
        description: error.response?.data?.error?.message || 'Failed to login',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'reset-all') {
      handleResetAll();
    } else if (confirmAction === 'seed') {
      handleSeedData();
    }
  };

  const openConfirmDialog = (action: string) => {
    setConfirmAction(action);
    onOpen();
  };

  return (
    <>
      <Box position="fixed" bottom={4} right={4}>
        <Button
          leftIcon={<SettingsIcon />}
          size="sm"
          variant="outline"
          colorScheme="gray"
          onClick={onOpen}
        >
          Dev Tools
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Developer Tools</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!confirmAction ? (
              <VStack spacing={4} align="stretch">
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Development Mode</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Use these tools to manage test data
                    </AlertDescription>
                  </Box>
                </Alert>

                <Button
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  onClick={() => openConfirmDialog('reset-all')}
                  isLoading={isLoading}
                >
                  Reset All Data
                </Button>

                <Button
                  colorScheme="green"
                  leftIcon={<AddIcon />}
                  onClick={() => openConfirmDialog('seed')}
                  isLoading={isLoading}
                >
                  Generate Sample Data
                </Button>

                <Box pt={2}>
                  <Text fontSize="sm" color="text.secondary" fontWeight="bold">
                    Test Account:
                  </Text>
                  <Code fontSize="xs">test@example.com / testpass123</Code>
                </Box>

                <Divider />

                {/* Admin Override Section */}
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" fontWeight="bold" color="purple.500">
                    Admin Override Login
                  </Text>
                  
                  <FormControl size="sm">
                    <FormLabel fontSize="xs">Admin Secret</FormLabel>
                    <Input
                      size="sm"
                      type="password"
                      value={adminSecret}
                      onChange={(e) => {
                        setAdminSecret(e.target.value);
                        localStorage.setItem('ezra_admin_secret', e.target.value);
                      }}
                      placeholder="Enter admin secret"
                    />
                  </FormControl>

                  <HStack spacing={2}>
                    <FormControl size="sm" flex={1}>
                      <FormLabel fontSize="xs">Select User</FormLabel>
                      <Select
                        size="sm"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        placeholder="Choose a user"
                      >
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      size="sm"
                      onClick={fetchUsers}
                      isDisabled={!adminSecret}
                    >
                      Load
                    </Button>
                  </HStack>

                  <Button
                    colorScheme="purple"
                    size="sm"
                    onClick={handleAdminLogin}
                    isLoading={isLoading}
                    isDisabled={!selectedUserId}
                    leftIcon={<Icon as={FaUserShield} />}
                  >
                    Login as User
                  </Button>
                </VStack>
              </VStack>
            ) : (
              <>
                {confirmAction === 'reset-all' && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Delete All Data?</AlertTitle>
                      <AlertDescription>
                        This will permanently delete ALL data in the database.
                        This action cannot be undone.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
                {confirmAction === 'seed' && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Generate Sample Data?</AlertTitle>
                      <AlertDescription>
                        This will create a test user with sample projects and tasks.
                        Existing data will not be affected.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {confirmAction ? (
              <HStack spacing={3}>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmAction(null)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  colorScheme={confirmAction === 'reset-all' ? 'red' : 'green'}
                  onClick={handleConfirmAction}
                  isLoading={isLoading}
                >
                  Confirm
                </Button>
              </HStack>
            ) : (
              <Button onClick={onClose}>Close</Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
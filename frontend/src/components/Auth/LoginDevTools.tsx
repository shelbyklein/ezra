/**
 * Developer tools for login page (development only)
 */

import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import axios from 'axios';

// Create axios instance with same config as main API
const devApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const LoginDevTools: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

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
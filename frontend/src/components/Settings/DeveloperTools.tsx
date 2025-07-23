/**
 * Developer tools for testing and data management (development only)
 */

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Divider,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface DatabaseStats {
  users: number;
  projects: number;
  tasks: number;
  notes: number;
  environment: string;
}

export const DeveloperTools: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch database statistics
  const { data: stats, refetch: refetchStats } = useQuery<DatabaseStats>({
    queryKey: ['devStats'],
    queryFn: async () => {
      const response = await api.get('/dev/stats');
      return response.data;
    },
  });

  // Reset all data mutation
  const resetAllMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/dev/reset-all');
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Database Reset',
        description: data.message,
        status: 'success',
        duration: 5000,
      });
      refetchStats();
      onClose();
      // Reload the page to clear any cached data
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset database',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Reset user data mutation
  const resetUserMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/dev/reset-user');
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'User Data Reset',
        description: data.message,
        status: 'success',
        duration: 5000,
      });
      refetchStats();
      onClose();
      // Reload to refresh UI
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: () => {
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset user data',
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Seed data mutation
  const seedDataMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/dev/seed');
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Sample Data Created',
        description: (
          <Box>
            <Text>Test user created:</Text>
            <Text fontSize="sm">Email: {data.testUser.email}</Text>
            <Text fontSize="sm">Password: {data.testUser.password}</Text>
          </Box>
        ),
        status: 'success',
        duration: 10000,
        isClosable: true,
      });
      refetchStats();
    },
    onError: () => {
      toast({
        title: 'Seeding Failed',
        description: 'Failed to create sample data',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case 'reset-all':
        resetAllMutation.mutate();
        break;
      case 'reset-user':
        resetUserMutation.mutate();
        break;
    }
  };

  const openConfirmDialog = (action: string) => {
    setConfirmAction(action);
    onOpen();
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            These tools are only available in development. Use with caution!
          </AlertDescription>
        </Box>
      </Alert>

      {/* Database Statistics */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Database Statistics</Heading>
          <Button
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={() => refetchStats()}
            variant="ghost"
          >
            Refresh
          </Button>
        </HStack>
        
        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Users</StatLabel>
              <StatNumber>{stats.users}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Projects</StatLabel>
              <StatNumber>{stats.projects}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Tasks</StatLabel>
              <StatNumber>{stats.tasks}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Notes</StatLabel>
              <StatNumber>{stats.notes}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}
      </Box>

      <Divider />

      {/* Data Management Actions */}
      <Box>
        <Heading size="md" mb={4}>Data Management</Heading>
        <VStack align="stretch" spacing={3}>
          {/* Reset All Data */}
          <Box>
            <Button
              colorScheme="red"
              leftIcon={<DeleteIcon />}
              onClick={() => openConfirmDialog('reset-all')}
              isLoading={resetAllMutation.isPending}
              width="full"
            >
              Reset All Data
            </Button>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Delete all users, projects, tasks, and notes
            </Text>
          </Box>

          {/* Reset User Data */}
          {user && (
            <Box>
              <Button
                colorScheme="orange"
                leftIcon={<DeleteIcon />}
                onClick={() => openConfirmDialog('reset-user')}
                isLoading={resetUserMutation.isPending}
                width="full"
              >
                Reset My Data Only
              </Button>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Delete all your projects and tasks
              </Text>
            </Box>
          )}

          {/* Generate Sample Data */}
          <Box>
            <Button
              colorScheme="green"
              leftIcon={<AddIcon />}
              onClick={() => seedDataMutation.mutate()}
              isLoading={seedDataMutation.isPending}
              width="full"
            >
              Generate Sample Data
            </Button>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Create test user with sample projects and tasks
            </Text>
          </Box>
        </VStack>
      </Box>

      <Divider />

      {/* API Endpoints Info */}
      <Box>
        <Heading size="md" mb={4}>API Endpoints</Heading>
        <VStack align="stretch" spacing={2} fontSize="sm">
          <Code p={2}>DELETE /api/dev/reset-all</Code>
          <Code p={2}>DELETE /api/dev/reset-user</Code>
          <Code p={2}>POST /api/dev/seed</Code>
          <Code p={2}>GET /api/dev/stats</Code>
        </VStack>
      </Box>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {confirmAction === 'reset-all' && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Delete All Data?</AlertTitle>
                  <AlertDescription>
                    This will permanently delete ALL data in the database including all users,
                    projects, tasks, and notes. This action cannot be undone.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            {confirmAction === 'reset-user' && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Delete Your Data?</AlertTitle>
                  <AlertDescription>
                    This will permanently delete all your projects and tasks.
                    Your account will remain but all data will be lost.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmAction}
              isLoading={resetAllMutation.isPending || resetUserMutation.isPending}
            >
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
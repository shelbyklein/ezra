/**
 * Main application layout with navigation
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box bg={useColorModeValue('white', 'gray.800')} px={4} boxShadow="sm">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems="center">
            <Box
              fontWeight="bold"
              fontSize="xl"
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate('/')}
            >
              Ezra
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                Projects
              </Button>
              <Button variant="ghost" onClick={() => navigate('/board')}>
                Board
              </Button>
            </HStack>
          </HStack>
          <Flex alignItems="center">
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar size="sm" name={user?.username} />
              </MenuButton>
              <MenuList>
                <MenuItem>
                  <Stack spacing={0}>
                    <Text fontWeight="medium">{user?.username}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {user?.email}
                    </Text>
                  </Stack>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Sign out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                Projects
              </Button>
              <Button variant="ghost" onClick={() => navigate('/board')}>
                Board
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
};
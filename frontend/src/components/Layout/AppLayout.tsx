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
  useColorMode,
  Stack,
  Avatar,
  Text,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { ChatBubble } from '../AI/ChatBubble';

export const AppLayout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg="bg.secondary">
      <Box bg="bg.primary" px={4} boxShadow="sm">
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
              <Button variant="ghost" onClick={() => navigate('/')}>
                Chat
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/projects')}>
                Projects
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/board')}>
                Board
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/notebooks')}>
                Notebooks
              </Button>
            </HStack>
          </HStack>
          <Flex alignItems="center" gap={2}>
            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
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
                    <Text fontSize="sm" color="text.secondary">
                      {user?.email}
                    </Text>
                  </Stack>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => navigate('/app/settings')}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Sign out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Chat
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/projects')}>
                Projects
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/board')}>
                Board
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/notebooks')}>
                Notebooks
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
      
      {/* Floating Chat Bubble */}
      <ChatBubble />
    </Box>
  );
};
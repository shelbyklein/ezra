/**
 * Main application layout with navigation
 */

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  useColorMode,
  Stack,
  Avatar,
  Text,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { ChatBubble } from '../AI/ChatBubble';
import { BreadcrumbFooter } from './BreadcrumbFooter';
import { SearchModal } from '../Search/SearchModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const AppLayout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isSearchOpen, onCloseSearch } = useKeyboardShortcuts();
  
  // Determine if current route should have padding
  // Chat and individual notebook views should have no padding
  const shouldHavePadding = !location.pathname.includes('/chat') && 
                           !location.pathname.match(/\/notebooks\/\d+/);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex direction="column" minH="100vh" bg="bg.secondary">
      <Box bg="bg.primary" px={4} boxShadow="sm" flexShrink={0}>
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
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/chat')}>
                Chat
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/projects')}>
                Projects
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
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/chat')}>
                Chat
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/projects')}>
                Projects
              </Button>
              <Button variant="ghost" onClick={() => navigate('/app/notebooks')}>
                Notebooks
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box 
        flex="1"
        w="full" 
        py={shouldHavePadding ? 8 : 0} 
        pb={shouldHavePadding ? 16 : 0}
        px={shouldHavePadding ? { base: 4, md: 8 } : 0}
        display="flex"
        flexDirection="column"
      >
        <Outlet />
      </Box>
      
      {/* Floating Chat Bubble */}
      <ChatBubble />
      
      {/* Breadcrumb Footer */}
      <BreadcrumbFooter />
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={onCloseSearch} />
    </Flex>
  );
};
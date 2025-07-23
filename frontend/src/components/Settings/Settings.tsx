/**
 * Settings page with user preferences and developer tools
 */

import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeveloperTools } from './DeveloperTools';

export const Settings: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Only show developer tools in development mode
  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">Settings</Heading>
        
        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          p={6}
        >
          <Tabs>
            <TabList>
              <Tab>General</Tab>
              <Tab>Account</Tab>
              {isDevelopment && <Tab>Developer Tools</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">General Settings</Heading>
                  <Box color="gray.500">
                    General settings will be added here (theme, notifications, etc.)
                  </Box>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Account Settings</Heading>
                  <Box color="gray.500">
                    Account settings will be added here (profile, password, API keys)
                  </Box>
                </VStack>
              </TabPanel>

              {isDevelopment && (
                <TabPanel>
                  <DeveloperTools />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};
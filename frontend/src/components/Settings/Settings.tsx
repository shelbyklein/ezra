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
  useColorMode,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { DeveloperTools } from './DeveloperTools';
import { TagsManagement } from './TagsManagement';

export const Settings: React.FC = () => {
  const { colorMode, setColorMode } = useColorMode();

  // Only show developer tools in development mode
  const isDevelopment = import.meta.env.MODE === 'development';

  // Determine current theme preference
  const getThemePreference = () => {
    const stored = localStorage.getItem('chakra-ui-color-mode');
    if (!stored || stored === 'system') return 'system';
    return stored;
  };

  const [themePreference, setThemePreference] = React.useState(getThemePreference);

  const handleThemeChange = (value: string) => {
    setThemePreference(value);
    if (value === 'system') {
      localStorage.removeItem('chakra-ui-color-mode');
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setColorMode(systemPreference);
    } else {
      setColorMode(value as 'light' | 'dark');
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">Settings</Heading>
        
        <Box
          bg="bg.card"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border.primary"
          p={6}
        >
          <Tabs>
            <TabList>
              <Tab>General</Tab>
              <Tab>Account</Tab>
              <Tab>Tags</Tab>
              {isDevelopment && <Tab>Developer Tools</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md">General Settings</Heading>
                  
                  {/* Theme Preferences */}
                  <FormControl>
                    <FormLabel>Theme Preference</FormLabel>
                    <RadioGroup value={themePreference} onChange={handleThemeChange}>
                      <Stack spacing={3}>
                        <Radio value="system">
                          <HStack spacing={2}>
                            <Text>System</Text>
                            <Text fontSize="sm" color="text.secondary">
                              (Automatically match your system preference)
                            </Text>
                          </HStack>
                        </Radio>
                        <Radio value="light">
                          <HStack spacing={2}>
                            <Icon as={SunIcon} />
                            <Text>Light</Text>
                          </HStack>
                        </Radio>
                        <Radio value="dark">
                          <HStack spacing={2}>
                            <Icon as={MoonIcon} />
                            <Text>Dark</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                    <Text fontSize="sm" color="text.secondary" mt={2}>
                      Current theme: {colorMode === 'light' ? 'Light' : 'Dark'} mode
                    </Text>
                  </FormControl>

                  <Box color="text.secondary" pt={4}>
                    More settings coming soon (notifications, language, etc.)
                  </Box>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Account Settings</Heading>
                  <Box color="text.secondary">
                    Account settings will be added here (profile, password, API keys)
                  </Box>
                </VStack>
              </TabPanel>

              <TabPanel>
                <TagsManagement />
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
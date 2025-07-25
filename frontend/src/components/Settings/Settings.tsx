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
import { ApiKeySettings } from './ApiKeySettings';
import { ProfileSettings } from './ProfileSettings';
import { BackupSettings } from './BackupSettings';

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
    <Container id="settings-container" className="settings-page" maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        <Heading id="settings-heading" size="lg">Settings</Heading>
        
        <Box
          id="settings-content"
          className="settings-tabs-container"
          bg="bg.card"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border.primary"
          p={6}
        >
          <Tabs>
            <TabList>
              <Tab id="general-tab">General</Tab>
              <Tab id="account-tab">Account</Tab>
              <Tab id="tags-tab">Tags</Tab>
              <Tab id="backup-tab">Backup</Tab>
              {isDevelopment && <Tab id="developer-tab">Developer Tools</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel id="general-panel" className="settings-panel">
                <VStack align="stretch" spacing={6}>
                  <Heading id="general-settings-heading" size="md">General Settings</Heading>
                  
                  {/* Theme Preferences */}
                  <FormControl id="theme-control">
                    <FormLabel htmlFor="theme-preference">Theme Preference</FormLabel>
                    <RadioGroup id="theme-preference" value={themePreference} onChange={handleThemeChange}>
                      <Stack spacing={3}>
                        <Radio id="theme-system" value="system">
                          <HStack spacing={2}>
                            <Text>System</Text>
                            <Text fontSize="sm" color="text.secondary">
                              (Automatically match your system preference)
                            </Text>
                          </HStack>
                        </Radio>
                        <Radio id="theme-light" value="light">
                          <HStack spacing={2}>
                            <Icon as={SunIcon} />
                            <Text>Light</Text>
                          </HStack>
                        </Radio>
                        <Radio id="theme-dark" value="dark">
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

              <TabPanel id="account-panel" className="settings-panel">
                <VStack align="stretch" spacing={6}>
                  <Heading id="account-settings-heading" size="md">Account Settings</Heading>
                  <ProfileSettings />
                  <ApiKeySettings />
                </VStack>
              </TabPanel>

              <TabPanel id="tags-panel" className="settings-panel">
                <TagsManagement />
              </TabPanel>

              <TabPanel id="backup-panel" className="settings-panel">
                <BackupSettings />
              </TabPanel>

              {isDevelopment && (
                <TabPanel id="developer-panel" className="settings-panel">
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
/**
 * Custom Chakra UI theme configuration with dark/light mode support
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'system', // Use system preference as default
  useSystemColorMode: true,   // Enable system color mode detection
};

// Custom color palette
const colors = {
  brand: {
    50: '#e6f2ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6', // Primary blue
    600: '#005bb3',
    700: '#004280',
    800: '#002a4d',
    900: '#00121a',
  },
  // Override gray colors for better dark mode support
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

// Semantic tokens for color mode switching
const semanticTokens = {
  colors: {
    // Background colors
    'bg.primary': {
      default: 'white',
      _dark: 'gray.800',
    },
    'bg.secondary': {
      default: 'gray.50',
      _dark: 'gray.900',
    },
    'bg.tertiary': {
      default: 'gray.100',
      _dark: 'gray.700',
    },
    'bg.card': {
      default: 'white',
      _dark: 'gray.800',
    },
    'bg.hover': {
      default: 'gray.50',
      _dark: 'whiteAlpha.100',
    },
    
    // Border colors
    'border.primary': {
      default: 'gray.200',
      _dark: 'gray.600',
    },
    'border.secondary': {
      default: 'gray.300',
      _dark: 'gray.600',
    },
    
    // Text colors
    'text.primary': {
      default: 'gray.800',
      _dark: 'gray.100',
    },
    'text.secondary': {
      default: 'gray.600',
      _dark: 'gray.400',
    },
    'text.muted': {
      default: 'gray.500',
      _dark: 'gray.500',
    },
    
    // Task priority colors (adjusted for dark mode)
    'priority.low': {
      default: 'green.500',
      _dark: 'green.400',
    },
    'priority.medium': {
      default: 'yellow.500',
      _dark: 'yellow.400',
    },
    'priority.high': {
      default: 'red.500',
      _dark: 'red.400',
    },
    
    // Status colors
    'status.todo': {
      default: 'gray.500',
      _dark: 'gray.400',
    },
    'status.inProgress': {
      default: 'blue.500',
      _dark: 'blue.400',
    },
    'status.done': {
      default: 'green.500',
      _dark: 'green.400',
    },
  },
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        color: props.colorScheme === 'brand' ? 'white' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
        },
      }),
      ghost: (props: any) => ({
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100',
        },
      }),
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.card',
        borderColor: 'border.primary',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'bg.card',
      },
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
  Select: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
  Textarea: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
};

// Global styles
const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
    },
  }),
};

// Extend the theme
const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  components,
  styles,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
});

export default theme;
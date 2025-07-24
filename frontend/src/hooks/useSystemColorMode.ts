/**
 * Hook to detect and respond to system color mode changes
 */

import { useEffect } from 'react';
import { useColorMode } from '@chakra-ui/react';

export const useSystemColorMode = () => {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    // Check if we should use system preference
    const stored = localStorage.getItem('chakra-ui-color-mode');
    if (stored && stored !== 'system') {
      // User has manually set a preference, don't override
      return;
    }

    // Function to update color mode based on system preference
    const updateColorMode = (e: MediaQueryListEvent | MediaQueryList) => {
      const systemPreference = e.matches ? 'dark' : 'light';
      setColorMode(systemPreference);
    };

    // Get the media query
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial color mode
    updateColorMode(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateColorMode);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateColorMode as any);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateColorMode);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(updateColorMode as any);
      }
    };
  }, [setColorMode]);
};
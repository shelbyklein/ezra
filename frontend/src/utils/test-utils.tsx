/**
 * Test utilities and custom render functions
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../theme';

// Create a custom render function that includes all providers
interface AllProvidersProps {
  children: React.ReactNode;
}

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const mockProject = (overrides = {}) => ({
  id: 1,
  name: 'Test Project',
  description: 'Test project description',
  color: '#3182ce',
  user_id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: [],
  ...overrides,
});

export const mockTask = (overrides = {}) => ({
  id: 1,
  project_id: 1,
  title: 'Test Task',
  description: 'Test task description',
  status: 'todo' as const,
  priority: 'medium' as const,
  position: 0,
  due_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: [],
  ...overrides,
});

export const mockTag = (overrides = {}) => ({
  id: 1,
  name: 'Test Tag',
  color: '#805AD5',
  user_id: 1,
  created_at: new Date().toISOString(),
  ...overrides,
});

// Helper to wait for loading states to resolve
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));
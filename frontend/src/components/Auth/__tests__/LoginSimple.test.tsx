/**
 * Simplified tests for Login component focusing on form behavior
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from '../Login';

// Mock LoginDevTools to avoid import.meta issues
jest.mock('../LoginDevTools', () => ({
  LoginDevTools: () => null,
}));

// Mock the entire auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <Login />
        </QueryClientProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

describe('Login Component - Basic UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    renderLogin();
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('accepts valid input in email and password fields', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText(/show password/i);
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has a link to the register page', () => {
    renderLogin();
    
    const signUpLink = screen.getByText(/sign up/i);
    expect(signUpLink).toHaveAttribute('href', '/register');
  });
});
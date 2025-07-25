/**
 * Main App component with routing
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { AppLayout } from './components/Layout/AppLayout';
import { ProjectList } from './components/Projects/ProjectList';
import { Board } from './components/Board/Board';
import { Settings } from './components/Settings/Settings';
import { NotebookLayout } from './components/Notebook/NotebookLayout';
import { NotebooksHome } from './pages/NotebooksHome';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Chat } from './components/Chat/Chat';
import theme from './theme';
import { useSystemColorMode } from './hooks/useSystemColorMode';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
    },
  },
});

// Component to initialize system color mode
const AppWithSystemColorMode = () => {
  useSystemColorMode();
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* App routes with layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/chat" replace />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="board/:projectId?" element={<Board />} />
          <Route path="chat" element={<Chat />} />
          <Route path="notebooks" element={<NotebooksHome />} />
          <Route path="notebooks/:notebookId/:pageId?" element={<NotebookLayout />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ChatProvider>
              <AppWithSystemColorMode />
            </ChatProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
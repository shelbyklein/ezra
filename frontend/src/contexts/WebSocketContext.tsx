/**
 * WebSocket context for development hot reload notifications
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  backendVersion: string | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  backendVersion: null,
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const lastVersionRef = useRef<string | null>(null);

  useEffect(() => {
    // Only enable in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Connect to backend WebSocket
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:6001';
    const socketInstance = io(backendUrl, {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to backend WebSocket');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from backend WebSocket');
      setIsConnected(false);
    });

    socketInstance.on('backend-updated', (data) => {
      console.log('🔄 Backend updated:', data);
      
      // Show toast notification
      toast({
        title: 'Backend Updated',
        description: 'The backend has been updated. Refreshing data...',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    });

    setSocket(socketInstance);

    // Check backend version periodically
    const checkBackendVersion = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6001/api';
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();
        
        if (data.startTime !== lastVersionRef.current && lastVersionRef.current !== null) {
          console.log('🔄 Backend restarted detected');
          
          // Show toast notification
          toast({
            title: 'Backend Restarted',
            description: 'The backend has been restarted. Refreshing data...',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right',
          });

          // Invalidate all queries to refresh data
          queryClient.invalidateQueries();
        }
        
        lastVersionRef.current = data.startTime;
        setBackendVersion(data.startTime);
      } catch (error) {
        console.error('Failed to check backend version:', error);
      }
    };

    // Check immediately
    checkBackendVersion();

    // Check every 5 seconds
    const interval = setInterval(checkBackendVersion, 5000);

    return () => {
      socketInstance.disconnect();
      clearInterval(interval);
    };
  }, [toast, queryClient]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, backendVersion }}>
      {children}
    </WebSocketContext.Provider>
  );
};
/**
 * Context for managing chat state across the application
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    result?: any;
    error?: boolean;
    hasContext?: boolean;
  };
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      setMessages, 
      isOpen, 
      setIsOpen,
      clearMessages 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
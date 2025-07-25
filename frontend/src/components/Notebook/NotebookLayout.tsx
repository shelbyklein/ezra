/**
 * Main notebook layout with sidebar and editor
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { DraggableNotebookSidebar } from './NotebookSidebar/DraggableNotebookSidebar';
import { NotebookEditor } from './Editor/NotebookEditor';
import { NotebookCoverPage } from './NotebookCoverPage';

interface Notebook {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: number;
  notebook_id: number;
  parent_folder_id: number | null;
  name: string;
  icon: string | null;
  position: number;
}

interface Page {
  id: number;
  notebook_id: number;
  folder_id: number | null;
  title: string;
  slug: string;
  position: number;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

interface NotebookWithStructure extends Notebook {
  folders: Folder[];
  pages: Page[];
}

export const NotebookLayout: React.FC = () => {
  const { notebookId, pageId } = useParams<{ notebookId?: string; pageId?: string }>();
  const navigate = useNavigate();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(
    pageId ? parseInt(pageId) : null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Redirect to notebooks home if no notebook is selected
  useEffect(() => {
    if (!notebookId) {
      navigate('/app/notebooks');
    }
  }, [notebookId, navigate]);

  // Update selectedPageId when URL changes
  useEffect(() => {
    if (pageId) {
      setSelectedPageId(parseInt(pageId));
    }
  }, [pageId]);

  // Fetch notebooks list
  const { data: notebooks = [], isLoading: notebooksLoading } = useQuery<Notebook[]>({
    queryKey: ['notebooks'],
    queryFn: async () => {
      const response = await api.get('/notebooks');
      return response.data;
    },
  });

  // Fetch current notebook with structure
  const { data: currentNotebook, isLoading: notebookLoading } = useQuery<NotebookWithStructure>({
    queryKey: ['notebook', notebookId ? parseInt(notebookId) : null],
    queryFn: async () => {
      if (!notebookId) return null;
      const response = await api.get(`/notebooks/${notebookId}`);
      return response.data;
    },
    enabled: !!notebookId,
  });

  const handlePageSelect = (pageId: number) => {
    setSelectedPageId(pageId);
    // Update the URL to reflect the new page
    navigate(`/app/notebooks/${notebookId}/${pageId}`);
    if (isMobile) {
      onClose();
    }
  };

  if (notebooksLoading || notebookLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  const sidebarContent = (
    <DraggableNotebookSidebar
      notebooks={notebooks}
      currentNotebook={currentNotebook}
      selectedPageId={selectedPageId}
      onPageSelect={handlePageSelect}
    />
  );

  return (
    <Flex h="calc(100vh - 160px)" position="relative">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w="280px"
          borderRightWidth="1px"
          borderColor="border.primary"
          bg="bg.primary"
          overflowY="auto"
        >
          {sidebarContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <>
          <IconButton
            aria-label="Open sidebar"
            icon={<HamburgerIcon />}
            position="absolute"
            top={4}
            left={4}
            zIndex={1}
            onClick={onOpen}
          />
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Notebooks</DrawerHeader>
              <DrawerBody p={0}>{sidebarContent}</DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      )}

      {/* Editor Area */}
      <Box flex={1} bg="bg.secondary" position="relative">
        {selectedPageId ? (
          <NotebookEditor
            pageId={selectedPageId}
            notebookId={currentNotebook?.id || parseInt(notebookId || '0')}
          />
        ) : currentNotebook ? (
          <NotebookCoverPage notebook={currentNotebook} />
        ) : (
          <Center h="full">
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                Select a notebook
              </Text>
            </VStack>
          </Center>
        )}
      </Box>
    </Flex>
  );
};
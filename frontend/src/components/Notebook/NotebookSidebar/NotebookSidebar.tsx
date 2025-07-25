/**
 * Notebook sidebar with folders and pages
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Box,
  Collapse,
  useToast,
  Icon,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { FaFolder, FaFolderOpen, FaFile } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { CreateNotebookModal } from './CreateNotebookModal';
import { CreatePageModal } from './CreatePageModal';
import { CreateFolderModal } from './CreateFolderModal';

interface Notebook {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
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
}

interface NotebookWithStructure extends Notebook {
  folders: Folder[];
  pages: Page[];
}

interface NotebookSidebarProps {
  notebooks: Notebook[];
  currentNotebook?: NotebookWithStructure | null;
  selectedPageId: number | null;
  onPageSelect: (pageId: number) => void;
}

export const NotebookSidebar: React.FC<NotebookSidebarProps> = ({
  notebooks,
  currentNotebook,
  selectedPageId,
  onPageSelect,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  
  const { isOpen: isNotebookModalOpen, onOpen: onNotebookModalOpen, onClose: onNotebookModalClose } = useDisclosure();
  const { isOpen: isPageModalOpen, onOpen: onPageModalOpen, onClose: onPageModalClose } = useDisclosure();
  const { isOpen: isFolderModalOpen, onOpen: onFolderModalOpen, onClose: onFolderModalClose } = useDisclosure();
  
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const deletePage = useMutation({
    mutationFn: async (pageId: number) => {
      await api.delete(`/notebooks/pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', currentNotebook?.id] });
      toast({
        title: 'Page deleted',
        status: 'success',
        duration: 3000,
      });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: number) => {
      await api.delete(`/notebooks/folders/${folderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', currentNotebook?.id] });
      toast({
        title: 'Folder deleted',
        status: 'success',
        duration: 3000,
      });
    },
  });

  const renderPages = (pages: Page[], folderId: number | null = null, level: number = 0) => {
    return pages
      .filter((page) => page.folder_id === folderId)
      .map((page) => (
        <HStack
          key={page.id}
          w="full"
          px={4}
          py={2}
          pl={4 + level * 4}
          cursor="pointer"
          bg={selectedPageId === page.id ? 'bg.hover' : undefined}
          _hover={{ bg: 'bg.hover' }}
          onClick={() => onPageSelect(page.id)}
          justify="space-between"
          role="group"
        >
          <HStack spacing={2} flex={1}>
            <Icon as={FaFile} boxSize={3} color="text.muted" />
            <Text fontSize="sm" noOfLines={1}>
              {page.title}
            </Text>
          </HStack>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Page options"
              icon={<EditIcon />}
              size="xs"
              variant="ghost"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem icon={<DeleteIcon />} onClick={() => deletePage.mutate(page.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      ));
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const childFolders = currentNotebook?.folders.filter(
      (f) => f.parent_folder_id === folder.id
    ) || [];
    const folderPages = currentNotebook?.pages.filter(
      (p) => p.folder_id === folder.id
    ) || [];
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <Box key={folder.id} id={`notebook-folder-${folder.id}`} className="notebook-folder" w="full">
        <HStack
          className="folder-header"
          w="full"
          px={4}
          py={2}
          pl={4 + level * 4}
          cursor="pointer"
          _hover={{ bg: 'bg.hover' }}
          onClick={() => toggleFolder(folder.id)}
          justify="space-between"
          role="group"
        >
          <HStack flex={1}>
            <IconButton
              aria-label="Toggle folder"
              icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              size="xs"
              variant="ghost"
            />
            <Icon 
              as={isExpanded ? FaFolderOpen : FaFolder} 
              boxSize={4} 
              color="blue.500" 
            />
            <Text fontSize="sm" fontWeight="medium">
              {folder.icon} {folder.name}
            </Text>
          </HStack>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Folder options"
              icon={<EditIcon />}
              size="xs"
              variant="ghost"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem
                icon={<AddIcon />}
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  onPageModalOpen();
                }}
              >
                New Page
              </MenuItem>
              <MenuItem
                icon={<AddIcon />}
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  onFolderModalOpen();
                }}
              >
                New Folder
              </MenuItem>
              <MenuItem icon={<DeleteIcon />} onClick={() => deleteFolder.mutate(folder.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <Collapse in={isExpanded}>
          <VStack align="stretch" spacing={0}>
            {childFolders.map((childFolder) => renderFolder(childFolder, level + 1))}
            {renderPages(folderPages, folder.id, level + 1)}
          </VStack>
        </Collapse>
      </Box>
    );
  };

  return (
    <VStack id="notebook-sidebar-content" className="notebook-sidebar-container" align="stretch" spacing={0} h="full">
      {/* Notebooks List */}
      <VStack id="notebooks-list" className="notebooks-section" align="stretch" spacing={1} p={4}>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="semibold" color="text.muted">
            NOTEBOOKS
          </Text>
          <IconButton
            id="new-notebook-button"
            aria-label="New notebook"
            icon={<AddIcon />}
            size="xs"
            variant="ghost"
            onClick={onNotebookModalOpen}
          />
        </HStack>
        {notebooks.map((notebook) => (
          <Button
            key={notebook.id}
            id={`notebook-item-${notebook.id}`}
            className={`notebook-nav-item ${currentNotebook?.id === notebook.id ? 'active' : ''}`}
            variant={currentNotebook?.id === notebook.id ? 'solid' : 'ghost'}
            size="sm"
            justifyContent="flex-start"
            onClick={() => navigate(`/app/notebooks/${notebook.id}`)}
          >
            {notebook.icon} {notebook.title}
          </Button>
        ))}
      </VStack>

      {/* Current Notebook Structure */}
      {currentNotebook && (
        <VStack align="stretch" spacing={0} flex={1} overflowY="auto">
          <HStack justify="space-between" px={4} py={2} borderTopWidth={1}>
            <Text fontSize="sm" fontWeight="semibold" color="text.muted">
              PAGES
            </Text>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Add content"
                icon={<AddIcon />}
                size="xs"
                variant="ghost"
              />
              <MenuList>
                <MenuItem
                  icon={<AddIcon />}
                  onClick={() => {
                    setSelectedFolderId(null);
                    onPageModalOpen();
                  }}
                >
                  New Page
                </MenuItem>
                <MenuItem
                  icon={<AddIcon />}
                  onClick={() => {
                    setSelectedFolderId(null);
                    onFolderModalOpen();
                  }}
                >
                  New Folder
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Render root-level folders */}
          {currentNotebook.folders
            .filter((folder) => !folder.parent_folder_id)
            .map((folder) => renderFolder(folder))}

          {/* Render root-level pages */}
          {renderPages(currentNotebook.pages.filter((page) => !page.folder_id))}
        </VStack>
      )}

      {/* Modals */}
      <CreateNotebookModal isOpen={isNotebookModalOpen} onClose={onNotebookModalClose} />
      {currentNotebook && (
        <>
          <CreatePageModal
            isOpen={isPageModalOpen}
            onClose={onPageModalClose}
            notebookId={currentNotebook.id}
            folderId={selectedFolderId}
          />
          <CreateFolderModal
            isOpen={isFolderModalOpen}
            onClose={onFolderModalClose}
            notebookId={currentNotebook.id}
            parentFolderId={selectedFolderId}
          />
        </>
      )}
    </VStack>
  );
};
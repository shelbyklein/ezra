/**
 * Draggable notebook sidebar with drag-and-drop functionality
 */

import React, { useState, useMemo } from 'react';
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
import { MdDragIndicator } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
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

interface DraggableNotebookSidebarProps {
  notebooks: Notebook[];
  currentNotebook?: NotebookWithStructure | null;
  selectedPageId: number | null;
  onPageSelect: (pageId: number) => void;
}

interface DraggableItem {
  id: string;
  type: 'folder' | 'page';
  data: Folder | Page;
}

// Sortable Item Component with drag handle
const SortableItem: React.FC<{
  item: DraggableItem;
  children: (dragHandleProps: { listeners?: any; attributes?: any }) => React.ReactNode;
}> = ({ item, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ listeners, attributes })}
    </div>
  );
};

// Droppable Root Zone Component
const DroppableRootZone: React.FC<{ children: React.ReactNode; isOver?: boolean }> = ({ children, isOver }) => {
  const { setNodeRef } = useDroppable({
    id: 'root-drop-zone',
  });

  return (
    <Box 
      ref={setNodeRef} 
      w="full" 
      minH="100%"
      bg={isOver ? 'bg.hover' : undefined}
      borderRadius="md"
      transition="background-color 0.2s"
    >
      {children}
    </Box>
  );
};

export const DraggableNotebookSidebar: React.FC<DraggableNotebookSidebarProps> = ({
  notebooks,
  currentNotebook,
  selectedPageId,
  onPageSelect,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isNotebooksCollapsed, setIsNotebooksCollapsed] = useState(() => {
    // Get saved state from localStorage
    const saved = localStorage.getItem('notebooks-list-collapsed');
    return saved === 'true';
  });
  
  const { isOpen: isNotebookModalOpen, onOpen: onNotebookModalOpen, onClose: onNotebookModalClose } = useDisclosure();
  const { isOpen: isPageModalOpen, onOpen: onPageModalOpen, onClose: onPageModalClose } = useDisclosure();
  const { isOpen: isFolderModalOpen, onOpen: onFolderModalOpen, onClose: onFolderModalClose } = useDisclosure();
  
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create flat list of all draggable items
  const allItems = useMemo(() => {
    if (!currentNotebook) return [];
    
    const items: DraggableItem[] = [];
    
    // Add root drop zone as a special item
    items.push({
      id: 'root-drop-zone',
      type: 'folder' as const,
      data: { id: -1, name: 'Root', parent_folder_id: null } as any,
    });
    
    // Add all folders
    currentNotebook.folders.forEach(folder => {
      items.push({
        id: `folder-${folder.id}`,
        type: 'folder',
        data: folder,
      });
    });
    
    // Add all pages
    currentNotebook.pages.forEach(page => {
      items.push({
        id: `page-${page.id}`,
        type: 'page',
        data: page,
      });
    });
    
    return items;
  }, [currentNotebook]);

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleNotebooksList = () => {
    const newState = !isNotebooksCollapsed;
    setIsNotebooksCollapsed(newState);
    localStorage.setItem('notebooks-list-collapsed', newState.toString());
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

  const batchUpdate = useMutation({
    mutationFn: async (updates: any[]) => {
      if (!currentNotebook) return;
      await api.put(`/notebooks/${currentNotebook.id}/batch-update`, { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', currentNotebook?.id] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
    
    // Auto-expand folders when dragging over them
    if (over && over.id.toString().startsWith('folder-')) {
      const folderId = parseInt(over.id.toString().replace('folder-', ''));
      if (!expandedFolders.has(folderId)) {
        // Auto-expand after a short delay
        setTimeout(() => {
          setExpandedFolders(prev => new Set([...prev, folderId]));
        }, 500);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !currentNotebook) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeItem = allItems.find(item => item.id === active.id);
    const overItem = allItems.find(item => item.id === over.id);
    
    if (!activeItem) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // Prepare updates based on drag operation
    const updates: any[] = [];
    
    // Check if dropping on root drop zone
    if (over.id === 'root-drop-zone') {
      if (activeItem.type === 'page') {
        const activePage = activeItem.data as Page;
        // Move page to root if it's not already there
        if (activePage.folder_id !== null) {
          updates.push({
            type: 'page',
            id: activePage.id,
            folder_id: null,
            position: 0,
          });
        }
      } else if (activeItem.type === 'folder') {
        const activeFolder = activeItem.data as Folder;
        // Move folder to root if it's not already there
        if (activeFolder.parent_folder_id !== null) {
          updates.push({
            type: 'folder',
            id: activeFolder.id,
            parent_folder_id: null,
            position: 0,
          });
        }
      }
    } else if (activeItem.type === 'folder' && overItem?.type === 'folder') {
      // Dragging folder to another folder
      const activeFolder = activeItem.data as Folder;
      const overFolder = overItem.data as Folder;
      
      // Prevent dropping folder into its own children
      if (isChildFolder(activeFolder.id, overFolder.id, currentNotebook.folders)) {
        toast({
          title: 'Cannot move folder into its own subfolder',
          status: 'error',
          duration: 3000,
        });
        setActiveId(null);
    setOverId(null);
        return;
      }
      
      updates.push({
        type: 'folder',
        id: activeFolder.id,
        parent_folder_id: overFolder.id,
        position: 0, // Will be at the top of the target folder
      });
    } else if (activeItem.type === 'page') {
      // Dragging a page
      const activePage = activeItem.data as Page;
      
      if (overItem?.type === 'folder') {
        // Dropping on a folder
        const overFolder = overItem.data as Folder;
        
        // Only update if moving to a different folder
        if (activePage.folder_id !== overFolder.id) {
          updates.push({
            type: 'page',
            id: activePage.id,
            folder_id: overFolder.id,
            position: 0,
          });
        }
      } else if (overItem?.type === 'page') {
        // Dropping on another page
        const overPage = overItem.data as Page;
        
        // Get all pages in the target folder
        const targetFolderPages = currentNotebook.pages
          .filter(p => p.folder_id === overPage.folder_id)
          .sort((a, b) => a.position - b.position);
        
        // Find the over page index
        const overIndex = targetFolderPages.findIndex(p => p.id === overPage.id);
        
        if (activePage.folder_id !== overPage.folder_id) {
          // Moving to a different folder
          updates.push({
            type: 'page',
            id: activePage.id,
            folder_id: overPage.folder_id,
            position: overPage.position,
          });
        } else {
          // Reordering within the same folder
          const activeIndex = targetFolderPages.findIndex(p => p.id === activePage.id);
          
          if (activeIndex !== overIndex) {
            // Calculate new positions for all affected pages
            const newPages = [...targetFolderPages];
            const [removed] = newPages.splice(activeIndex, 1);
            newPages.splice(overIndex, 0, removed);
            
            // Update positions for all pages that changed
            newPages.forEach((page, index) => {
              if (page.position !== index) {
                updates.push({
                  type: 'page',
                  id: page.id,
                  folder_id: page.folder_id,
                  position: index,
                });
              }
            });
          }
        }
      } else if (!overItem) {
        // Dropping in empty space - move to root
        if (activePage.folder_id !== null) {
          updates.push({
            type: 'page',
            id: activePage.id,
            folder_id: null,
            position: 0,
          });
        }
      }
    }
    
    if (updates.length > 0) {
      batchUpdate.mutate(updates);
    }
    
    setActiveId(null);
    setOverId(null);
  };

  // Helper function to check if targetFolder is a child of sourceFolder
  const isChildFolder = (sourceFolderId: number, targetFolderId: number, folders: Folder[]): boolean => {
    const targetFolder = folders.find(f => f.id === targetFolderId);
    if (!targetFolder) return false;
    
    if (targetFolder.parent_folder_id === sourceFolderId) return true;
    
    if (targetFolder.parent_folder_id) {
      return isChildFolder(sourceFolderId, targetFolder.parent_folder_id, folders);
    }
    
    return false;
  };

  const renderPages = (pages: Page[], folderId: number | null = null, level: number = 0) => {
    return pages
      .filter((page) => page.folder_id === folderId)
      .sort((a, b) => a.position - b.position)
      .map((page) => {
        const item: DraggableItem = {
          id: `page-${page.id}`,
          type: 'page',
          data: page,
        };
        
        return (
          <SortableItem key={page.id} item={item}>
            {({ listeners, attributes }) => (
              <HStack
                w="full"
                px={2}
                py={2}
                pl={2 + level * 4}
                cursor="pointer"
                bg={selectedPageId === page.id ? 'bg.hover' : undefined}
                _hover={{ bg: 'bg.hover' }}
                onClick={() => onPageSelect(page.id)}
                justify="space-between"
                role="group"
              >
                <HStack spacing={2} flex={1}>
                  <Icon
                    as={MdDragIndicator}
                    boxSize={4}
                    color="text.muted"
                    cursor="grab"
                    opacity={0}
                    _groupHover={{ opacity: 0.5 }}
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                  />
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
            )}
          </SortableItem>
        );
      });
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const childFolders = currentNotebook?.folders.filter(
      (f) => f.parent_folder_id === folder.id
    ).sort((a, b) => a.position - b.position) || [];
    const folderPages = currentNotebook?.pages.filter(
      (p) => p.folder_id === folder.id
    ) || [];
    const isExpanded = expandedFolders.has(folder.id);
    const isDragOver = overId === `folder-${folder.id}`;
    const isDraggingPage = activeId?.startsWith('page-');
    
    const item: DraggableItem = {
      id: `folder-${folder.id}`,
      type: 'folder',
      data: folder,
    };

    return (
      <Box key={folder.id} w="full">
        <SortableItem item={item}>
          {({ listeners, attributes }) => (
            <HStack
              w="full"
              px={2}
              py={2}
              pl={2 + level * 4}
              cursor="pointer"
              bg={isDragOver && isDraggingPage ? 'blue.50' : undefined}
              borderWidth={isDragOver && isDraggingPage ? 2 : 0}
              borderColor="blue.300"
              borderRadius="md"
              _hover={{ bg: 'bg.hover' }}
              onClick={() => toggleFolder(folder.id)}
              justify="space-between"
              role="group"
            >
              <HStack flex={1}>
                <Icon
                  as={MdDragIndicator}
                  boxSize={4}
                  color="text.muted"
                  cursor="grab"
                  opacity={0}
                  _groupHover={{ opacity: 0.5 }}
                  {...attributes}
                  {...listeners}
                  onClick={(e) => e.stopPropagation()}
                />
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
          )}
        </SortableItem>
        <Collapse in={isExpanded}>
          <VStack align="stretch" spacing={0}>
            {childFolders.map((childFolder) => renderFolder(childFolder, level + 1))}
            {renderPages(folderPages, folder.id, level + 1)}
          </VStack>
        </Collapse>
      </Box>
    );
  };

  const activeItem = allItems.find(item => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={allItems.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <VStack align="stretch" spacing={0} h="full">
          {/* Notebooks List */}
          <VStack align="stretch" spacing={1} p={4}>
            <HStack justify="space-between" mb={2}>
              <HStack>
                <IconButton
                  aria-label={isNotebooksCollapsed ? 'Expand notebooks' : 'Collapse notebooks'}
                  icon={isNotebooksCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                  size="xs"
                  variant="ghost"
                  onClick={toggleNotebooksList}
                />
                <Text fontSize="sm" fontWeight="semibold" color="text.muted">
                  NOTEBOOKS
                </Text>
              </HStack>
              <IconButton
                aria-label="New notebook"
                icon={<AddIcon />}
                size="xs"
                variant="ghost"
                onClick={onNotebookModalOpen}
              />
            </HStack>
            <Collapse in={!isNotebooksCollapsed}>
              <VStack align="stretch" spacing={1}>
                {notebooks.map((notebook) => (
                  <Button
                    key={notebook.id}
                    variant={currentNotebook?.id === notebook.id ? 'solid' : 'ghost'}
                    size="sm"
                    justifyContent="flex-start"
                    onClick={() => navigate(`/app/notebooks/${notebook.id}`)}
                  >
                    {notebook.icon} {notebook.title}
                  </Button>
                ))}
              </VStack>
            </Collapse>
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

              <DroppableRootZone isOver={overId === 'root-drop-zone'}>
                <VStack align="stretch" spacing={1} p={2}>
                  {/* Render root-level folders */}
                  {currentNotebook.folders
                    .filter((folder) => !folder.parent_folder_id)
                    .sort((a, b) => a.position - b.position)
                    .map((folder) => renderFolder(folder))}

                  {/* Render root-level pages */}
                  {renderPages(currentNotebook.pages.filter((page) => !page.folder_id))}
                  
                  {/* Add some minimum height to make drop zone more accessible */}
                  <Box minH="50px" />
                </VStack>
              </DroppableRootZone>
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
      </SortableContext>
      
      <DragOverlay>
        {activeItem && (
          <Box
            bg="bg.primary"
            p={2}
            borderRadius="md"
            borderWidth={1}
            borderColor="border.primary"
            opacity={0.8}
          >
            <HStack>
              {activeItem.type === 'folder' ? (
                <>
                  <Icon as={FaFolder} boxSize={4} color="blue.500" />
                  <Text fontSize="sm" fontWeight="medium">
                    {(activeItem.data as Folder).name}
                  </Text>
                </>
              ) : (
                <>
                  <Icon as={FaFile} boxSize={3} color="text.muted" />
                  <Text fontSize="sm">
                    {(activeItem.data as Page).title}
                  </Text>
                </>
              )}
            </HStack>
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
};
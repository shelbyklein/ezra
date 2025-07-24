/**
 * Footer component showing navigation breadcrumbs
 */

import React from 'react';
import {
  Box,
  HStack,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { 
  FaHome, 
  FaProjectDiagram, 
  FaTasks, 
  FaBook, 
  FaFolder,
  FaFileAlt,
  FaCog 
} from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface BreadcrumbData {
  label: string;
  icon?: React.ElementType;
  href?: string;
  isCurrentPage?: boolean;
}

export const BreadcrumbFooter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Fetch project data if on a project route
  const { data: project } = useQuery({
    queryKey: ['project', params.projectId],
    queryFn: async () => {
      if (!params.projectId) return null;
      const response = await api.get(`/projects/${params.projectId}`);
      return response.data;
    },
    enabled: !!params.projectId,
  });

  // Fetch notebook data if on a notebook route
  const { data: notebook } = useQuery({
    queryKey: ['notebook', params.notebookId ? parseInt(params.notebookId) : null],
    queryFn: async () => {
      if (!params.notebookId) return null;
      const response = await api.get(`/notebooks/${params.notebookId}`);
      return response.data;
    },
    enabled: !!params.notebookId,
  });

  // Fetch page data if on a page route
  const { data: page } = useQuery({
    queryKey: ['notebook-page', params.pageId ? parseInt(params.pageId) : null],
    queryFn: async () => {
      if (!params.pageId) return null;
      const response = await api.get(`/notebooks/pages/${params.pageId}`);
      return response.data;
    },
    enabled: !!params.pageId,
  });

  // Build breadcrumb items based on current route
  const getBreadcrumbs = (): BreadcrumbData[] => {
    const path = location.pathname;
    const items: BreadcrumbData[] = [
      { label: 'Home', icon: FaHome, href: '/app' }
    ];

    if (path.includes('/app/projects')) {
      items.push({ label: 'Projects', icon: FaProjectDiagram, href: '/app/projects' });
      
      if (params.projectId && project) {
        items.push({ 
          label: project.name, 
          isCurrentPage: !path.includes('/board')
        });
      }
    }

    if (path.includes('/app/board')) {
      if (!path.includes('/projects')) {
        items.push({ label: 'Board', icon: FaTasks, href: '/app/board' });
      } else if (project) {
        items.push({ 
          label: 'Board', 
          icon: FaTasks,
          href: `/app/board/${params.projectId}`,
          isCurrentPage: true 
        });
      }
    }

    if (path.includes('/app/notebooks')) {
      items.push({ label: 'Notebooks', icon: FaBook, href: '/app/notebooks' });
      
      if (params.notebookId && notebook) {
        items.push({ 
          label: notebook.title,
          icon: FaBook,
          href: `/app/notebooks/${params.notebookId}`,
          isCurrentPage: !params.pageId
        });

        // Find the page and its folder if applicable
        if (params.pageId && page) {
          // If page is in a folder, add folder to breadcrumb
          if (page.folder_id && notebook.folders) {
            const folder = notebook.folders.find((f: any) => f.id === page.folder_id);
            if (folder) {
              items.push({
                label: folder.name,
                icon: FaFolder,
              });
            }
          }

          items.push({
            label: page.title,
            icon: FaFileAlt,
            isCurrentPage: true
          });
        }
      }
    }

    if (path.includes('/app/settings')) {
      items.push({ 
        label: 'Settings', 
        icon: FaCog, 
        href: '/app/settings',
        isCurrentPage: true 
      });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show footer on home/dashboard
  if (location.pathname === '/app' || location.pathname === '/') {
    return null;
  }

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      borderTopWidth={1}
      borderColor={borderColor}
      px={6}
      py={2}
      zIndex={10}
    >
      <Breadcrumb 
        spacing={2} 
        separator={<ChevronRightIcon color={textColor} />}
        fontSize="sm"
      >
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem 
            key={index} 
            isCurrentPage={item.isCurrentPage}
            color={item.isCurrentPage ? 'text.primary' : textColor}
          >
            <BreadcrumbLink
              onClick={() => item.href && !item.isCurrentPage && navigate(item.href)}
              cursor={item.href && !item.isCurrentPage ? 'pointer' : 'default'}
              _hover={item.href && !item.isCurrentPage ? { color: 'blue.500' } : {}}
            >
              <HStack spacing={1}>
                {item.icon && <Icon as={item.icon} boxSize={3} />}
                <Text>{item.label}</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </Box>
  );
};
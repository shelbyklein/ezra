/**
 * TipTap-based WYSIWYG editor for notebook pages
 */

import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
// import { Table } from '@tiptap/extension-table';
// import { TableRow } from '@tiptap/extension-table-row';
// import { TableCell } from '@tiptap/extension-table-cell';
// import { TableHeader } from '@tiptap/extension-table-header';
// import Image from '@tiptap/extension-image';
import ImageResize from 'tiptap-extension-resize-image';
import Link from '@tiptap/extension-link';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { EditorToolbar } from './EditorToolbar';
import { SlashCommands } from './extensions/SlashCommands';
import { ColumnBlock } from './extensions/columns/ColumnBlock';
import { Column } from './extensions/columns/Column';
import { ColumnToolbar } from './ColumnToolbar';

// Create lowlight instance
const lowlight = createLowlight();

// Register languages
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);
import './editor.css';
import './image-resize.css';
import './extensions/columns/columns.css';

interface Page {
  id: number;
  notebook_id: number;
  folder_id: number | null;
  title: string;
  slug: string;
  content: string;
  position: number;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

interface NotebookEditorProps {
  pageId: number;
  notebookId: number;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({ pageId, notebookId }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = React.useState('');
  const [saveTimer, setSaveTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Fetch page data
  const { data: page, isLoading, refetch } = useQuery<Page>({
    queryKey: ['notebook-page', pageId],
    queryFn: async () => {
      console.log('Fetching page:', pageId);
      const response = await api.get(`/notebooks/pages/${pageId}`);
      return response.data;
    },
    enabled: !!pageId,
  });

  // Expose refetch to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__refetchPage = refetch;
    }
  }, [refetch]);

  // Update page mutation
  const updatePage = useMutation({
    mutationFn: async (data: Partial<Page>) => {
      const response = await api.put(`/notebooks/pages/${pageId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] });
    },
  });

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        link: false, // We'll configure Link separately
      }),
      Typography,
      Highlight,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      // Table.configure({
      //   resizable: true,
      // }),
      // TableRow,
      // TableCell,
      // TableHeader,
      ImageResize.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'notebook-image',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'notebook-link',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'paragraph') {
            return 'Type / for commands...';
          }
          return '';
        },
        includeChildren: true,
      }),
      SlashCommands,
      ColumnBlock,
      Column,
    ],
    content: page?.content ? JSON.parse(page.content) : '',
    onUpdate: ({ editor }) => {
      // Clear existing timer
      if (saveTimer) {
        clearTimeout(saveTimer);
      }

      // Set new timer for autosave
      const timer = setTimeout(() => {
        updatePage.mutate({
          content: JSON.stringify(editor.getJSON()),
        });
      }, 1000); // Save after 1 second of inactivity

      setSaveTimer(timer);
    },
  });

  // Update editor content when page loads or content changes
  useEffect(() => {
    if (page && editor && !editor.isFocused) {
      setTitle(page.title);
      const content = page.content ? JSON.parse(page.content) : '';
      // Only update if content has actually changed to avoid cursor jumping
      const currentContent = JSON.stringify(editor.getJSON());
      if (currentContent !== page.content) {
        editor.commands.setContent(content);
      }
    }
  }, [page?.content, page?.title, editor]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, [saveTimer]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    
    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    // Set new timer for title save
    const timer = setTimeout(() => {
      updatePage.mutate({ title: newTitle });
    }, 1000);

    setSaveTimer(timer);
  };

  const toggleStar = () => {
    if (page) {
      updatePage.mutate({ is_starred: !page.is_starred });
    }
  };

  if (isLoading) {
    return (
      <Center h="full">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!page || !editor) {
    return null;
  }

  return (
    <VStack h="full" align="stretch" spacing={0}>
      {/* Header */}
      <Box bg="bg.primary" borderBottomWidth={1} borderColor="border.primary">
        <VStack align="stretch" spacing={0} p={4}>
          <HStack>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              fontSize="2xl"
              fontWeight="bold"
              variant="unstyled"
              placeholder="Untitled"
            />
            <IconButton
              aria-label="Star page"
              icon={<StarIcon />}
              variant="ghost"
              color={page.is_starred ? 'yellow.400' : 'gray.400'}
              onClick={toggleStar}
            />
          </HStack>
          <Text fontSize="sm" color="text.muted">
            {updatePage.isPending ? 'Saving...' : 'All changes saved'}
          </Text>
        </VStack>
        <EditorToolbar editor={editor} notebookId={notebookId} />
      </Box>

      {/* Editor */}
      <Box flex={1} overflowY="auto" bg="white" _dark={{ bg: 'gray.800' }}>
        <Box maxW="4xl" mx="auto" p={8} position="relative">
          <EditorContent editor={editor} className="notebook-editor" />
          {editor && <ColumnToolbar editor={editor} />}
        </Box>
      </Box>
    </VStack>
  );
};
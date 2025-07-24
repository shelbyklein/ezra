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
  ButtonGroup,
  Divider,
  useToast,
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
import Image from '@tiptap/extension-image';
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

// Create lowlight instance
const lowlight = createLowlight();

// Register languages
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('python', python);
import './editor.css';

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
  const toast = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = React.useState('');
  const [saveTimer, setSaveTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Fetch page data
  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ['notebook-page', pageId],
    queryFn: async () => {
      const response = await api.get(`/notebooks/pages/${pageId}`);
      return response.data;
    },
    enabled: !!pageId,
  });

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
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Type / for commands...',
      }),
      SlashCommands,
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

  // Update editor content when page loads
  useEffect(() => {
    if (page && editor) {
      setTitle(page.title);
      const content = page.content ? JSON.parse(page.content) : '';
      editor.commands.setContent(content);
    }
  }, [page, editor]);

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
        <EditorToolbar editor={editor} />
      </Box>

      {/* Editor */}
      <Box flex={1} overflowY="auto" bg="white" _dark={{ bg: 'gray.800' }}>
        <Box maxW="4xl" mx="auto" p={8}>
          <EditorContent editor={editor} className="notebook-editor" />
        </Box>
      </Box>
    </VStack>
  );
};
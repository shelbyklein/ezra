/**
 * Toolbar for the notebook editor
 */

import React, { useEffect } from 'react';
import {
  HStack,
  IconButton,
  ButtonGroup,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { Editor } from '@tiptap/react';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeLine,
  RiListUnordered,
  RiListOrdered,
  RiDoubleQuotesL,
  RiCodeBoxLine,
  RiLink,
  RiLinkUnlink,
  RiImageLine,
  RiTable2,
  RiLayoutColumnLine,
} from 'react-icons/ri';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ImageUpload } from './ImageUpload';

interface EditorToolbarProps {
  editor: Editor;
  notebookId?: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, notebookId }) => {
  const { isOpen: isImageUploadOpen, onOpen: onImageUploadOpen, onClose: onImageUploadClose } = useDisclosure();

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImageFromUrl = () => {
    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleImageUploaded = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  // Listen for image upload event from slash commands
  useEffect(() => {
    const handleOpenImageUpload = () => {
      onImageUploadOpen();
    };

    window.addEventListener('openImageUpload', handleOpenImageUpload);
    return () => {
      window.removeEventListener('openImageUpload', handleOpenImageUpload);
    };
  }, [onImageUploadOpen]);

  const addTable = () => {
    // Table functionality temporarily disabled
    // editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <>
    <HStack spacing={1} p={2} borderTopWidth={1} flexWrap="wrap">
      {/* Text Style */}
      <ButtonGroup size="sm" variant="ghost" spacing={1}>
        <Tooltip label="Bold">
          <IconButton
            aria-label="Bold"
            icon={<RiBold />}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            colorScheme={editor.isActive('bold') ? 'blue' : undefined}
          />
        </Tooltip>
        <Tooltip label="Italic">
          <IconButton
            aria-label="Italic"
            icon={<RiItalic />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            colorScheme={editor.isActive('italic') ? 'blue' : undefined}
          />
        </Tooltip>
        <Tooltip label="Strikethrough">
          <IconButton
            aria-label="Strikethrough"
            icon={<RiStrikethrough />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            colorScheme={editor.isActive('strike') ? 'blue' : undefined}
          />
        </Tooltip>
        <Tooltip label="Code">
          <IconButton
            aria-label="Code"
            icon={<RiCodeLine />}
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            colorScheme={editor.isActive('code') ? 'blue' : undefined}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h={6} />

      {/* Headings */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="ghost">
          Heading
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            Heading 1
          </MenuItem>
          <MenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            Heading 2
          </MenuItem>
          <MenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            Heading 3
          </MenuItem>
          <MenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            Paragraph
          </MenuItem>
        </MenuList>
      </Menu>

      <Divider orientation="vertical" h={6} />

      {/* Lists */}
      <ButtonGroup size="sm" variant="ghost" spacing={1}>
        <Tooltip label="Bullet List">
          <IconButton
            aria-label="Bullet List"
            icon={<RiListUnordered />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            colorScheme={editor.isActive('bulletList') ? 'blue' : undefined}
          />
        </Tooltip>
        <Tooltip label="Numbered List">
          <IconButton
            aria-label="Numbered List"
            icon={<RiListOrdered />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            colorScheme={editor.isActive('orderedList') ? 'blue' : undefined}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h={6} />

      {/* Blocks */}
      <ButtonGroup size="sm" variant="ghost" spacing={1}>
        <Tooltip label="Quote">
          <IconButton
            aria-label="Quote"
            icon={<RiDoubleQuotesL />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            colorScheme={editor.isActive('blockquote') ? 'blue' : undefined}
          />
        </Tooltip>
        <Tooltip label="Code Block">
          <IconButton
            aria-label="Code Block"
            icon={<RiCodeBoxLine />}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            colorScheme={editor.isActive('codeBlock') ? 'blue' : undefined}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" h={6} />

      {/* Insert */}
      <ButtonGroup size="sm" variant="ghost" spacing={1}>
        <Tooltip label="Link">
          <IconButton
            aria-label="Link"
            icon={editor.isActive('link') ? <RiLinkUnlink /> : <RiLink />}
            onClick={setLink}
            colorScheme={editor.isActive('link') ? 'blue' : undefined}
          />
        </Tooltip>
        <Menu>
          <Tooltip label="Image">
            <MenuButton
              as={IconButton}
              aria-label="Image"
              icon={<RiImageLine />}
            />
          </Tooltip>
          <MenuList>
            <MenuItem onClick={onImageUploadOpen}>Upload Image</MenuItem>
            <MenuItem onClick={addImageFromUrl}>Image from URL</MenuItem>
          </MenuList>
        </Menu>
        <Tooltip label="Table">
          <IconButton
            aria-label="Table"
            icon={<RiTable2 />}
            onClick={addTable}
          />
        </Tooltip>
        <Menu>
          <Tooltip label="Columns">
            <MenuButton
              as={IconButton}
              aria-label="Columns"
              icon={<RiLayoutColumnLine />}
            />
          </Tooltip>
          <MenuList>
            <MenuItem onClick={() => editor.chain().focus().setColumnBlock().run()}>
              Equal Columns (50/50)
            </MenuItem>
            <MenuItem onClick={() => {
              editor.chain().focus().setColumnBlock().run();
              // We'll implement layout switching after initial creation
            }}>
              Left Heavy (70/30)
            </MenuItem>
            <MenuItem onClick={() => {
              editor.chain().focus().setColumnBlock().run();
              // We'll implement layout switching after initial creation
            }}>
              Right Heavy (30/70)
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>
    </HStack>

    {/* Image Upload Modal */}
    {notebookId && (
      <ImageUpload
        isOpen={isImageUploadOpen}
        onClose={onImageUploadClose}
        onImageUploaded={handleImageUploaded}
        notebookId={notebookId}
      />
    )}
  </>
  );
};
/**
 * Toolbar for the notebook editor
 */

import React from 'react';
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
} from '@chakra-ui/react';
import { Editor } from '@tiptap/react';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeLine,
  RiH1,
  RiH2,
  RiListUnordered,
  RiListOrdered,
  RiDoubleQuotesL,
  RiCodeBoxLine,
  RiLink,
  RiLinkUnlink,
  RiImageLine,
  RiTable2,
} from 'react-icons/ri';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
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

  const addImage = () => {
    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    // Table functionality temporarily disabled
    // editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
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
        <Tooltip label="Image">
          <IconButton
            aria-label="Image"
            icon={<RiImageLine />}
            onClick={addImage}
          />
        </Tooltip>
        <Tooltip label="Table">
          <IconButton
            aria-label="Table"
            icon={<RiTable2 />}
            onClick={addTable}
          />
        </Tooltip>
      </ButtonGroup>
    </HStack>
  );
};
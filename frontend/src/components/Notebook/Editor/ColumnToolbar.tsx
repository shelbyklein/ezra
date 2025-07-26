/**
 * Floating toolbar for column layout manipulation
 */

import React from 'react';
import {
  Box,
  ButtonGroup,
  IconButton,
  Tooltip,
  Portal,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { Editor } from '@tiptap/react';
import {
  RiLayoutColumnLine,
  RiLayoutLeft2Line,
  RiLayoutRight2Line,
  RiDeleteBinLine,
  RiAlignLeft,
  RiAlignCenter,
  RiAlignRight,
  RiAlignTop,
  RiAlignVertically,
  RiAlignBottom,
} from 'react-icons/ri';
import { 
  setColumnLayout, 
  deleteColumnBlock, 
  isInColumnBlock,
  setColumnAlignment
} from './extensions/columns/ColumnCommands';

interface ColumnToolbarProps {
  editor: Editor;
}

export const ColumnToolbar: React.FC<ColumnToolbarProps> = ({ editor }) => {
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [currentLayout, setCurrentLayout] = React.useState<string>('50-50');

  React.useEffect(() => {
    const updatePosition = () => {
      if (!editor || !isInColumnBlock(editor)) {
        setPosition(null);
        return;
      }

      // Get the current selection and find the column block
      const { from } = editor.state.selection;
      const resolved = editor.state.doc.resolve(from);
      
      let depth = resolved.depth;
      while (depth > 0) {
        const node = resolved.node(depth);
        if (node.type.name === 'columnBlock') {
          // Get the DOM element for this node
          const dom = editor.view.nodeDOM(resolved.before(depth));
          if (dom && dom instanceof HTMLElement) {
            const rect = dom.getBoundingClientRect();
            const editorRect = editor.view.dom.getBoundingClientRect();
            
            setPosition({
              top: rect.top - editorRect.top - 44,
              left: rect.left - editorRect.left + (rect.width / 2) - 100,
            });
            
            // Update current layout
            setCurrentLayout(node.attrs.layout || '50-50');
          }
          break;
        }
        depth--;
      }
    };

    // Update position on selection change
    editor.on('selectionUpdate', updatePosition);
    editor.on('update', updatePosition);

    // Initial position
    updatePosition();

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('update', updatePosition);
    };
  }, [editor]);

  if (!position || !isInColumnBlock(editor)) {
    return null;
  }

  const handleLayoutChange = (layout: string) => {
    setColumnLayout(editor, layout);
    setCurrentLayout(layout);
  };

  const handleDelete = () => {
    deleteColumnBlock(editor);
  };

  const handleColumnAlignment = (
    columnIndex: number,
    verticalAlign?: 'top' | 'center' | 'bottom',
    horizontalAlign?: 'left' | 'center' | 'right'
  ) => {
    setColumnAlignment(editor, columnIndex, verticalAlign, horizontalAlign);
  };

  return (
    <Portal>
      <Box
        position="absolute"
        top={`${position.top}px`}
        left={`${position.left}px`}
        bg="white"
        boxShadow="lg"
        borderRadius="md"
        p={1}
        zIndex={20}
        _dark={{
          bg: 'gray.800',
        }}
      >
        <ButtonGroup size="xs" spacing={1}>
          <Tooltip label="Equal columns (50/50)">
            <IconButton
              aria-label="Equal columns"
              icon={<RiLayoutColumnLine />}
              onClick={() => handleLayoutChange('50-50')}
              colorScheme={currentLayout === '50-50' ? 'blue' : undefined}
              variant={currentLayout === '50-50' ? 'solid' : 'ghost'}
            />
          </Tooltip>
          <Tooltip label="Wide left (70/30)">
            <IconButton
              aria-label="Wide left"
              icon={<RiLayoutLeft2Line />}
              onClick={() => handleLayoutChange('70-30')}
              colorScheme={currentLayout === '70-30' ? 'blue' : undefined}
              variant={currentLayout === '70-30' ? 'solid' : 'ghost'}
            />
          </Tooltip>
          <Tooltip label="Wide right (30/70)">
            <IconButton
              aria-label="Wide right"
              icon={<RiLayoutRight2Line />}
              onClick={() => handleLayoutChange('30-70')}
              colorScheme={currentLayout === '30-70' ? 'blue' : undefined}
              variant={currentLayout === '30-70' ? 'solid' : 'ghost'}
            />
          </Tooltip>
          <Box w="1px" bg="gray.300" h={6} />
          
          {/* Left Column Alignment */}
          <Menu>
            <Tooltip label="Left column alignment">
              <MenuButton
                as={IconButton}
                aria-label="Left column alignment"
                icon={<RiAlignLeft />}
                size="xs"
                variant="ghost"
              />
            </Tooltip>
            <MenuList fontSize="sm">
              <MenuItem icon={<RiAlignTop />} onClick={() => handleColumnAlignment(0, 'top')}>
                Top
              </MenuItem>
              <MenuItem icon={<RiAlignVertically />} onClick={() => handleColumnAlignment(0, 'center')}>
                Middle
              </MenuItem>
              <MenuItem icon={<RiAlignBottom />} onClick={() => handleColumnAlignment(0, 'bottom')}>
                Bottom
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<RiAlignLeft />} onClick={() => handleColumnAlignment(0, undefined, 'left')}>
                Align Left
              </MenuItem>
              <MenuItem icon={<RiAlignCenter />} onClick={() => handleColumnAlignment(0, undefined, 'center')}>
                Center
              </MenuItem>
              <MenuItem icon={<RiAlignRight />} onClick={() => handleColumnAlignment(0, undefined, 'right')}>
                Align Right
              </MenuItem>
            </MenuList>
          </Menu>
          
          {/* Right Column Alignment */}
          <Menu>
            <Tooltip label="Right column alignment">
              <MenuButton
                as={IconButton}
                aria-label="Right column alignment"
                icon={<RiAlignRight />}
                size="xs"
                variant="ghost"
              />
            </Tooltip>
            <MenuList fontSize="sm">
              <MenuItem icon={<RiAlignTop />} onClick={() => handleColumnAlignment(1, 'top')}>
                Top
              </MenuItem>
              <MenuItem icon={<RiAlignVertically />} onClick={() => handleColumnAlignment(1, 'center')}>
                Middle
              </MenuItem>
              <MenuItem icon={<RiAlignBottom />} onClick={() => handleColumnAlignment(1, 'bottom')}>
                Bottom
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<RiAlignLeft />} onClick={() => handleColumnAlignment(1, undefined, 'left')}>
                Align Left
              </MenuItem>
              <MenuItem icon={<RiAlignCenter />} onClick={() => handleColumnAlignment(1, undefined, 'center')}>
                Center
              </MenuItem>
              <MenuItem icon={<RiAlignRight />} onClick={() => handleColumnAlignment(1, undefined, 'right')}>
                Align Right
              </MenuItem>
            </MenuList>
          </Menu>
          
          <Box w="1px" bg="gray.300" h={6} />
          <Tooltip label="Delete columns">
            <IconButton
              aria-label="Delete columns"
              icon={<RiDeleteBinLine />}
              onClick={handleDelete}
              colorScheme="red"
              variant="ghost"
            />
          </Tooltip>
        </ButtonGroup>
      </Box>
    </Portal>
  );
};
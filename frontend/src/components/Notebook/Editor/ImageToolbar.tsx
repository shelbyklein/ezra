/**
 * Floating toolbar for image manipulation
 */

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  ButtonGroup,
  IconButton,
  Tooltip,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import {
  RiAlignLeft,
  RiAlignCenter,
  RiAlignRight,
  RiDeleteBinLine,
  RiArrowGoBackLine,
} from 'react-icons/ri';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface ImageToolbarProps {
  editor: Editor;
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
}

export const ImageToolbar: React.FC<ImageToolbarProps> = ({
  node,
  updateAttributes,
  deleteNode,
}) => {
  const currentAlign = node.attrs.align || 'center';

  const setAlignment = (align: string) => {
    updateAttributes({ align });
  };

  const setSize = (size: string) => {
    let width: string;
    switch (size) {
      case 'small':
        width = '25%';
        break;
      case 'medium':
        width = '50%';
        break;
      case 'large':
        width = '75%';
        break;
      case 'full':
        width = '100%';
        break;
      default:
        width = '100%';
    }
    updateAttributes({ width });
  };

  const resetSize = () => {
    updateAttributes({ width: null, height: null });
  };

  return (
    <Box className="image-toolbar">
      {/* Alignment buttons */}
      <ButtonGroup size="sm" isAttached variant="ghost">
        <Tooltip label="Align left">
          <IconButton
            aria-label="Align left"
            icon={<RiAlignLeft />}
            onClick={() => setAlignment('left')}
            isActive={currentAlign === 'left'}
          />
        </Tooltip>
        <Tooltip label="Align center">
          <IconButton
            aria-label="Align center"
            icon={<RiAlignCenter />}
            onClick={() => setAlignment('center')}
            isActive={currentAlign === 'center'}
          />
        </Tooltip>
        <Tooltip label="Align right">
          <IconButton
            aria-label="Align right"
            icon={<RiAlignRight />}
            onClick={() => setAlignment('right')}
            isActive={currentAlign === 'right'}
          />
        </Tooltip>
      </ButtonGroup>

      <Box className="divider" />

      {/* Size presets */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="ghost">
          Size
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => setSize('small')}>Small (25%)</MenuItem>
          <MenuItem onClick={() => setSize('medium')}>Medium (50%)</MenuItem>
          <MenuItem onClick={() => setSize('large')}>Large (75%)</MenuItem>
          <MenuItem onClick={() => setSize('full')}>Full (100%)</MenuItem>
        </MenuList>
      </Menu>

      <Box className="divider" />

      {/* Actions */}
      <ButtonGroup size="sm" variant="ghost">
        <Tooltip label="Reset size">
          <IconButton
            aria-label="Reset size"
            icon={<RiArrowGoBackLine />}
            onClick={resetSize}
          />
        </Tooltip>
        <Tooltip label="Delete image">
          <IconButton
            aria-label="Delete image"
            icon={<RiDeleteBinLine />}
            onClick={deleteNode}
            colorScheme="red"
          />
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};
/**
 * Keyboard shortcuts help modal
 */

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Kbd,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Array<{
    key: string;
    ctrl?: boolean;
    cmd?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
  }>;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  const formatKey = (shortcut: typeof shortcuts[0]) => {
    const keys: string[] = [];
    
    if (shortcut.cmd) keys.push('⌘');
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.shift) keys.push('Shift');
    
    // Format special keys
    let keyDisplay = shortcut.key;
    switch (shortcut.key) {
      case ' ':
        keyDisplay = 'Space';
        break;
      case 'ArrowUp':
        keyDisplay = '↑';
        break;
      case 'ArrowDown':
        keyDisplay = '↓';
        break;
      case 'ArrowLeft':
        keyDisplay = '←';
        break;
      case 'ArrowRight':
        keyDisplay = '→';
        break;
      case 'Delete':
        keyDisplay = 'Del';
        break;
      case 'Escape':
        keyDisplay = 'Esc';
        break;
      default:
        keyDisplay = keyDisplay.toUpperCase();
    }
    
    keys.push(keyDisplay);
    
    return keys;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Shortcut</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {shortcuts.map((shortcut, index) => (
                <Tr key={index}>
                  <Td>
                    <HStack spacing={1}>
                      {formatKey(shortcut).map((key, idx) => (
                        <React.Fragment key={idx}>
                          <Kbd>{key}</Kbd>
                          {idx < formatKey(shortcut).length - 1 && (
                            <Text fontSize="sm" color="gray.500">+</Text>
                          )}
                        </React.Fragment>
                      ))}
                    </HStack>
                  </Td>
                  <Td>{shortcut.description}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          <Text fontSize="sm" color="gray.500" mt={4}>
            Note: Shortcuts are disabled when typing in input fields.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
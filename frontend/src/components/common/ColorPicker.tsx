/**
 * Color picker component with predefined palette
 */

import React from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

// Predefined color palette that works well in both light and dark modes
const COLOR_PALETTE = [
  '#3182CE', // Blue (default)
  '#38A169', // Green
  '#805AD5', // Purple
  '#D69E2E', // Yellow
  '#DD6B20', // Orange
  '#E53E3E', // Red
  '#319795', // Teal
  '#D53F8C', // Pink
  '#718096', // Gray
  '#2D3748', // Dark Gray
  '#00B5D8', // Cyan
  '#9F7AEA', // Light Purple
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [customColor, setCustomColor] = React.useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      onChange(color);
    }
  };

  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover isOpen={isOpen} onClose={onToggle}>
        <PopoverTrigger>
          <Button
            onClick={onToggle}
            size="md"
            borderWidth={2}
            borderColor="border.primary"
            _hover={{ borderColor: 'border.secondary' }}
          >
            <HStack spacing={3}>
              <Box
                w={6}
                h={6}
                borderRadius="md"
                bg={value}
                borderWidth={1}
                borderColor="border.primary"
              />
              <Text>{value}</Text>
            </HStack>
          </Button>
        </PopoverTrigger>
        <PopoverContent width="280px">
          <PopoverArrow />
          <PopoverBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium">
                Choose a color
              </Text>
              
              {/* Predefined colors */}
              <SimpleGrid columns={6} spacing={2}>
                {COLOR_PALETTE.map((color) => (
                  <Box
                    key={color}
                    as="button"
                    w={10}
                    h={10}
                    borderRadius="md"
                    bg={color}
                    borderWidth={2}
                    borderColor={value === color ? 'blue.500' : 'transparent'}
                    position="relative"
                    onClick={() => handleColorSelect(color)}
                    _hover={{
                      transform: 'scale(1.1)',
                      boxShadow: 'md',
                    }}
                    transition="all 0.2s"
                  >
                    {value === color && (
                      <CheckIcon
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        color="white"
                        fontSize="sm"
                      />
                    )}
                  </Box>
                ))}
              </SimpleGrid>

              {/* Custom color input */}
              <Box>
                <Text fontSize="sm" mb={2}>
                  Custom color
                </Text>
                <HStack>
                  <Input
                    size="sm"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    placeholder="#000000"
                    maxLength={7}
                  />
                  <Box
                    w={10}
                    h={10}
                    borderRadius="md"
                    bg={customColor}
                    borderWidth={1}
                    borderColor="border.primary"
                  />
                </HStack>
              </Box>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </FormControl>
  );
};
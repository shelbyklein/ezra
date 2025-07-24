/**
 * Tag selector component for task forms
 */

import React from 'react';
import {
  FormControl,
  FormLabel,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Checkbox,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface TagData {
  id: number;
  name: string;
  color: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface TagSelectorProps {
  value: number[];
  onChange: (tagIds: number[]) => void;
  label?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, label }) => {
  // Fetch available tags
  const { data: availableTags = [] } = useQuery<TagData[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get('/tags');
      return response.data;
    },
  });

  const selectedTags = availableTags.filter(tag => value.includes(tag.id));

  const handleToggleTag = (tagId: number) => {
    if (value.includes(tagId)) {
      onChange(value.filter(id => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    onChange(value.filter(id => id !== tagId));
  };

  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <HStack spacing={2} wrap="wrap" mb={2}>
          {selectedTags.map(tag => (
            <Tag
              key={tag.id}
              size="md"
              borderRadius="full"
              variant="solid"
              bg={tag.color}
              color="white"
            >
              <TagLabel>{tag.name}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveTag(tag.id)} />
            </Tag>
          ))}
        </HStack>
      )}

      {/* Tag selector dropdown */}
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" width="full">
          {selectedTags.length === 0 
            ? 'Select tags...' 
            : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
          }
        </MenuButton>
        <MenuList maxH="300px" overflowY="auto">
          {availableTags.length === 0 ? (
            <MenuItem isDisabled>
              <Text fontSize="sm" color="text.secondary">
                No tags available. Create tags in Settings.
              </Text>
            </MenuItem>
          ) : (
            availableTags.map(tag => (
              <MenuItem key={tag.id} onClick={() => handleToggleTag(tag.id)}>
                <HStack spacing={3} width="full">
                  <Checkbox
                    isChecked={value.includes(tag.id)}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={tag.color}
                    flexShrink={0}
                  />
                  <Text>{tag.name}</Text>
                </HStack>
              </MenuItem>
            ))
          )}
        </MenuList>
      </Menu>
    </FormControl>
  );
};
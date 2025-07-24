/**
 * Slash commands list component
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';

interface Command {
  title: string;
  description: string;
  command: (props: any) => void;
}

interface SlashCommandsListProps {
  items: Command[];
  command: (props: any) => void;
  editor: any;
  range: any;
}

export const SlashCommandsList = forwardRef<any, SlashCommandsListProps>(
  ({ items, command, editor, range }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = items[index];

      if (item) {
        command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: any) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <Box
        bg="white"
        _dark={{ bg: 'gray.800' }}
        borderRadius="md"
        boxShadow="lg"
        p={2}
        maxH="300px"
        overflowY="auto"
      >
        <VStack align="stretch" spacing={1}>
          {items.length ? (
            items.map((item, index) => (
              <HStack
                key={index}
                p={2}
                borderRadius="md"
                cursor="pointer"
                bg={index === selectedIndex ? 'blue.50' : undefined}
                _dark={{
                  bg: index === selectedIndex ? 'blue.900' : undefined,
                }}
                _hover={{
                  bg: 'gray.50',
                  _dark: { bg: 'gray.700' },
                }}
                onClick={() => selectItem(index)}
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{item.title}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {item.description}
                  </Text>
                </VStack>
              </HStack>
            ))
          ) : (
            <Text p={2} color="gray.500">
              No results
            </Text>
          )}
        </VStack>
      </Box>
    );
  }
);

SlashCommandsList.displayName = 'SlashCommandsList';
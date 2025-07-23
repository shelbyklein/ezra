/**
 * Kanban board component - placeholder for now
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { Center, Heading, Text, VStack } from '@chakra-ui/react';

export const Board: React.FC = () => {
  const { projectId } = useParams();

  return (
    <Center h="400px">
      <VStack spacing={4}>
        <Heading>Kanban Board</Heading>
        <Text color="gray.500">
          {projectId ? `Project ID: ${projectId}` : 'No project selected'}
        </Text>
        <Text color="gray.500">Board implementation coming soon...</Text>
      </VStack>
    </Center>
  );
};
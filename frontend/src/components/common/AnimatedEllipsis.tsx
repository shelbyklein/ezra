import React from 'react';
import { keyframes } from '@emotion/react';
import { Box, HStack } from '@chakra-ui/react';

const dot1 = keyframes`
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
`;

const dot2 = keyframes`
  0%, 100% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
`;

const dot3 = keyframes`
  0%, 100% { opacity: 0; }
  40% { opacity: 1; }
  80% { opacity: 1; }
`;

interface AnimatedEllipsisProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
}

export const AnimatedEllipsis: React.FC<AnimatedEllipsisProps> = ({ 
  size = 'sm',
  color = 'currentColor' 
}) => {
  const dotSize = {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '10px',
  };

  const spacing = {
    xs: 1,
    sm: 1.5,
    md: 2,
    lg: 2.5,
  };

  return (
    <HStack spacing={spacing[size]}>
      <Box
        w={dotSize[size]}
        h={dotSize[size]}
        borderRadius="full"
        bg={color}
        animation={`${dot1} 1.4s infinite ease-in-out`}
      />
      <Box
        w={dotSize[size]}
        h={dotSize[size]}
        borderRadius="full"
        bg={color}
        animation={`${dot2} 1.4s infinite ease-in-out`}
        animationDelay="0.16s"
      />
      <Box
        w={dotSize[size]}
        h={dotSize[size]}
        borderRadius="full"
        bg={color}
        animation={`${dot3} 1.4s infinite ease-in-out`}
        animationDelay="0.32s"
      />
    </HStack>
  );
};
// Main App component
import { Box, Container, Heading, Text } from '@chakra-ui/react'

function App() {
  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>
          Ezra
        </Heading>
        <Text fontSize="xl" color="gray.600">
          LLM-Powered Project Management
        </Text>
      </Box>
    </Container>
  )
}

export default App
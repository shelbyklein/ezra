// Jest setup file for global test configuration

// Add any global test setup here
beforeAll(() => {
  // Set test environment variables if needed
  process.env.NODE_ENV = 'test';
});

// Clean up after all tests
afterAll(() => {
  // Add any cleanup logic here
});
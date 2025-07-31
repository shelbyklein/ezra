// Test chat API after saving an API key
const axios = require('axios');

async function testChatWithKey() {
  console.log('=== Testing Chat API with API Key ===\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful');
    
    // Step 2: Check current API key status
    console.log('\n2. Checking API key status...');
    const profile = await axios.get('http://localhost:6001/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Has API key:', profile.data.hasApiKey);
    console.log('  Full response:', JSON.stringify(profile.data, null, 2));
    
    // Step 3: Test chat
    console.log('\n3. Testing chat API...');
    try {
      const chatResponse = await axios.post('http://localhost:6001/api/ai/chat', {
        message: 'Hello, can you help me?',
        context: {}
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✓ Chat response received:');
      console.log('  Response:', chatResponse.data.response);
      console.log('  Metadata:', chatResponse.data.metadata);
    } catch (chatError) {
      if (chatError.response) {
        console.error('✗ Chat API error:', chatError.response.status);
        console.error('  Error data:', chatError.response.data);
      } else {
        console.error('✗ Chat error:', chatError.message);
      }
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.response ? error.response.data : error.message);
  }
}

console.log('Starting chat API test...\n');
console.log('Make sure the backend is running on port 6001\n');

testChatWithKey().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('\n=== Test Failed ===', err);
});
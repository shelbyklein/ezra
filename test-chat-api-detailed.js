// Detailed test script to debug chat API issue
const axios = require('axios');

async function testChatAPI() {
  console.log('=== Testing Chat API ===\n');
  
  try {
    // Step 1: Check if backend is running
    console.log('1. Checking backend health...');
    try {
      const healthResponse = await axios.get('http://localhost:6001/api/health');
      console.log('✓ Backend is running:', healthResponse.data);
    } catch (error) {
      console.error('✗ Backend not accessible:', error.message);
      return;
    }
    
    // Step 2: Login to get a token
    console.log('\n2. Attempting login...');
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful, token received');
    console.log('  User:', loginResponse.data.data.user.email);
    
    // Step 3: Test chat API without API key
    console.log('\n3. Testing chat API (expecting API key required message)...');
    try {
      const chatResponse = await axios.post('http://localhost:6001/api/ai/chat', {
        message: 'Hello',
        context: {},
        conversationId: null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✓ Chat API responded successfully:');
      console.log('  Response:', chatResponse.data.response);
      console.log('  Metadata:', chatResponse.data.metadata);
      
      if (chatResponse.data.metadata?.action === 'api_key_required') {
        console.log('\n✓ Expected behavior: User needs to add Anthropic API key in settings');
      }
    } catch (chatError) {
      console.error('✗ Chat API error:', chatError.response?.status || chatError.message);
      if (chatError.response?.data) {
        console.error('  Error details:', chatError.response.data);
      }
      if (chatError.response?.status === 500) {
        console.error('\n💡 This is the error you\'re seeing in the browser!');
        console.error('   The 500 error suggests a server-side issue in the chat endpoint');
      }
    }
    
    // Step 4: Check if user has API key set
    console.log('\n4. Checking user API key status...');
    try {
      const profileResponse = await axios.get('http://localhost:6001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✓ User profile retrieved');
      console.log('  Has API key:', profileResponse.data.data.has_api_key ? 'Yes' : 'No');
    } catch (error) {
      console.error('✗ Could not check user profile:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('\n✗ Unexpected error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
    }
  }
}

// Run the test
console.log('Starting chat API test...\n');
console.log('Make sure the backend is running on port 6001\n');

testChatAPI().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('\n=== Test Failed ===', err);
});
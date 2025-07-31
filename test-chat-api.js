// Test script to debug chat API issue
const axios = require('axios');

async function testChatAPI() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Got token:', token);
    
    // Now test the chat API
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
    
    console.log('Chat response:', chatResponse.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testChatAPI();
const axios = require('axios');

const API_URL = 'http://localhost:6001/api';

async function testChatHistory() {
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test1234!'
    });
    const token = loginResponse.data.token;
    
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Get existing conversations
    console.log('\n2. Getting existing conversations...');
    const existingConvs = await axios.get(`${API_URL}/chat-history/conversations`, config);
    console.log(`Found ${existingConvs.data.length} existing conversations`);

    // 3. Create a new conversation with a test message
    console.log('\n3. Creating new conversation...');
    const newConvResponse = await axios.post(`${API_URL}/chat-history/conversations`, {
      isNewConversation: true,
      message: {
        role: 'user',
        content: 'Test message for chat history'
      }
    }, config);
    
    const conversationId = newConvResponse.data.conversationId;
    console.log(`Created conversation ID: ${conversationId}`);

    // 4. Send a chat message with the conversation ID
    console.log('\n4. Sending chat message...');
    const chatResponse = await axios.post(`${API_URL}/ai/chat`, {
      message: 'Hello, this is a test message',
      context: {},
      conversationId: conversationId
    }, config);
    
    console.log('Chat response received:', chatResponse.data.response.substring(0, 100) + '...');

    // 5. Retrieve messages from the conversation
    console.log('\n5. Retrieving conversation messages...');
    const messagesResponse = await axios.get(`${API_URL}/chat-history/conversations/${conversationId}/messages`, config);
    
    console.log(`\nConversation has ${messagesResponse.data.messages.length} messages:`);
    messagesResponse.data.messages.forEach((msg, index) => {
      console.log(`\nMessage ${index + 1}:`);
      console.log(`  Role: ${msg.role}`);
      console.log(`  Content: ${msg.content.substring(0, 100)}...`);
      console.log(`  Created: ${msg.created_at}`);
    });

    // 6. Verify Ezra's response is saved
    const ezraMessages = messagesResponse.data.messages.filter(m => m.role === 'assistant');
    if (ezraMessages.length > 0) {
      console.log('\n✅ SUCCESS: Ezra\'s responses are being saved to chat history!');
    } else {
      console.log('\n❌ ISSUE: No assistant messages found in chat history');
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run the test
testChatHistory();
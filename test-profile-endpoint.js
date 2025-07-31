// Test profile endpoint response format
const axios = require('axios');

async function testProfileEndpoint() {
  console.log('=== Testing Profile Endpoint ===\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful');
    
    // Step 2: Test /users/profile endpoint
    console.log('\n2. Testing /users/profile endpoint...');
    const profileResponse = await axios.get('http://localhost:6001/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Profile response:', JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n✗ Error:', error.response ? error.response.data : error.message);
  }
}

console.log('Starting profile endpoint test...\n');
console.log('Make sure the backend is running on port 6001\n');

testProfileEndpoint().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('\n=== Test Failed ===', err);
});
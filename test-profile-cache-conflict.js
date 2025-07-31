// Test to understand the React Query cache conflict
const axios = require('axios');

async function testProfileEndpoints() {
  console.log('=== Testing Profile Endpoints and Cache Conflict ===\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful');
    
    // Step 2: Test /users/profile endpoint (used by ProfileSettings.tsx)
    console.log('\n2. Testing /users/profile endpoint (ProfileSettings.tsx expects response.data)...');
    const profileResponse = await axios.get('http://localhost:6001/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Response structure:');
    console.log('- response.data:', JSON.stringify(profileResponse.data, null, 2));
    console.log('- What ProfileSettings gets:', profileResponse.data);
    console.log('- What ApiKeySettings expects:', profileResponse.data.data);
    
    // Step 3: Show the issue
    console.log('\n3. THE ISSUE:');
    console.log('- Both components use queryKey: ["user-profile"]');
    console.log('- ProfileSettings stores response.data in cache:', profileResponse.data);
    console.log('- ApiKeySettings tries to access response.data.data');
    console.log('- So ApiKeySettings is looking for:', profileResponse.data.data);
    console.log('- Which means it\'s trying to access:', profileResponse.data.data?.has_api_key);
    console.log('- But ProfileSettings cached:', profileResponse.data);
    console.log('- So ApiKeySettings should be accessing:', profileResponse.data?.has_api_key, '(UNDEFINED!)');
    
  } catch (error) {
    console.error('\n✗ Error:', error.response ? error.response.data : error.message);
  }
}

console.log('Starting profile cache conflict test...\n');
console.log('Make sure the backend is running on port 6001\n');

testProfileEndpoints().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('\n=== Test Failed ===', err);
});
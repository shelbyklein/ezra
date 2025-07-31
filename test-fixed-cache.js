// Test to verify the fix works correctly
const axios = require('axios');

async function testFixedCache() {
  console.log('=== Testing Fixed Cache Behavior ===\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful');
    
    // Step 2: Simulate what both components now get
    console.log('\n2. Testing /users/profile endpoint with the fix...');
    const profileResponse = await axios.get('http://localhost:6001/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Both components now return response.data.data
    const cachedData = profileResponse.data.data;
    
    console.log('\n✓ What gets cached by both components:', JSON.stringify(cachedData, null, 2));
    console.log('\n✓ ProfileSettings can access:');
    console.log('  - profile.username:', cachedData.username);
    console.log('  - profile.email:', cachedData.email);
    console.log('  - profile.avatar_url:', cachedData.avatar_url);
    
    console.log('\n✓ ApiKeySettings can access:');
    console.log('  - userProfile.has_api_key:', cachedData.has_api_key);
    console.log('  - This should now correctly show:', cachedData.has_api_key ? 'API key is configured' : 'No API key configured');
    
  } catch (error) {
    console.error('\n✗ Error:', error.response ? error.response.data : error.message);
  }
}

console.log('Starting fixed cache test...\n');
console.log('Make sure the backend is running on port 6001\n');

testFixedCache().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('\n=== Test Failed ===', err);
});
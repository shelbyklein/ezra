// Test script to verify API key save and retrieval
const axios = require('axios');

async function testAPIKeyFlow() {
  console.log('=== Testing API Key Save/Retrieve Flow ===\n');
  
  const testApiKey = 'sk-ant-test123456789';
  let token;
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:6001/api/auth/login', {
      email: 'debug@test.com',
      password: 'password123'
    });
    
    token = loginResponse.data.data.token;
    console.log('✓ Login successful');
    
    // Step 2: Check initial state
    console.log('\n2. Checking initial API key state...');
    const initialProfile = await axios.get('http://localhost:6001/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Initial hasApiKey:', initialProfile.data.hasApiKey);
    
    // Step 3: Save API key
    console.log('\n3. Saving API key...');
    const saveResponse = await axios.put('http://localhost:6001/api/users/api-key', 
      { apiKey: testApiKey },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log('✓ Save response:', saveResponse.data);
    
    // Step 4: Check if key was saved
    console.log('\n4. Checking if API key was saved...');
    const afterSaveProfile = await axios.get('http://localhost:6001/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ After save hasApiKey:', afterSaveProfile.data.hasApiKey);
    
    // Step 5: Query database directly
    console.log('\n5. Checking database directly...');
    const directCheck = await axios.get('http://localhost:6001/api/dev/query', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { 
        query: "SELECT id, email, anthropic_api_key IS NOT NULL as has_key FROM users WHERE email = 'debug@test.com'"
      }
    });
    console.log('✓ Database check:', directCheck.data);
    
    // Step 6: Test both endpoints
    console.log('\n6. Comparing /users/me vs /users/profile...');
    const meResponse = await axios.get('http://localhost:6001/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileResponse = await axios.get('http://localhost:6001/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✓ /users/me response:', {
      hasApiKey: meResponse.data.hasApiKey,
      fields: Object.keys(meResponse.data)
    });
    console.log('✓ /users/profile response:', {
      fields: Object.keys(profileResponse.data)
    });
    
    // Step 7: Remove API key
    console.log('\n7. Removing API key...');
    await axios.delete('http://localhost:6001/api/users/api-key', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ API key removed');
    
    // Step 8: Final check
    console.log('\n8. Final check after removal...');
    const finalProfile = await axios.get('http://localhost:6001/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Final hasApiKey:', finalProfile.data.hasApiKey);
    
  } catch (error) {
    console.error('\n✗ Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  URL:', error.config.url);
    }
  }
}

console.log('Starting API key flow test...\n');
console.log('Make sure the backend is running on port 6001\n');

testAPIKeyFlow().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(err => {
  console.error('\n=== Test Failed ===', err);
});
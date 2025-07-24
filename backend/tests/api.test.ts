/**
 * Simple API test script for testing backend endpoints
 */

const API_URL = 'http://localhost:5001/api';
let authToken = '';
let userId = '';
let projectId = '';
let taskId = '';
let noteId = '';

// Helper function for API calls
async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ ${method} ${endpoint}: ${response.status} - ${JSON.stringify(data)}`);
      return { error: data, status: response.status };
    }
    
    console.log(`✅ ${method} ${endpoint}: ${response.status}`);
    return { data, status: response.status };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}: Network error - ${error}`);
    return { error, status: 0 };
  }
}

// Test functions
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  // Register new user
  const registerData = {
    username: `testuser_${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123'
  };
  
  const registerResult = await apiCall('/auth/register', 'POST', registerData);
  if (registerResult.data) {
    authToken = registerResult.data.token;
    userId = registerResult.data.user.id;
    console.log('   Registered new user:', registerResult.data.user.username);
  }
  
  // Test login
  const loginResult = await apiCall('/auth/login', 'POST', {
    email: registerData.email,
    password: registerData.password
  });
  
  if (loginResult.data) {
    console.log('   Login successful');
  }
}

async function testProjects() {
  console.log('\n📁 Testing Projects...');
  
  // Create project
  const createResult = await apiCall('/projects', 'POST', {
    name: 'Test Project',
    description: 'This is a test project'
  }, authToken);
  
  if (createResult.data) {
    projectId = createResult.data.id;
    console.log('   Created project:', createResult.data.name);
  }
  
  // Get all projects
  await apiCall('/projects', 'GET', null, authToken);
  
  // Get single project
  await apiCall(`/projects/${projectId}`, 'GET', null, authToken);
  
  // Update project
  await apiCall(`/projects/${projectId}`, 'PUT', {
    name: 'Updated Test Project',
    description: 'Updated description'
  }, authToken);
  
  // Delete will be tested at the end
}

async function testTasks() {
  console.log('\n✅ Testing Tasks...');
  
  // Create task
  const createResult = await apiCall('/tasks', 'POST', {
    project_id: projectId,
    title: 'Test Task',
    description: 'This is a test task',
    status: 'todo',
    priority: 'high'
  }, authToken);
  
  if (createResult.data) {
    taskId = createResult.data.id;
    console.log('   Created task:', createResult.data.title);
  }
  
  // Get tasks for project
  await apiCall(`/tasks/project/${projectId}`, 'GET', null, authToken);
  
  // Get single task
  await apiCall(`/tasks/${taskId}`, 'GET', null, authToken);
  
  // Update task
  await apiCall(`/tasks/${taskId}`, 'PUT', {
    title: 'Updated Test Task',
    status: 'in_progress',
    position: 1
  }, authToken);
  
  // Test reorder
  await apiCall('/tasks/reorder', 'POST', {
    tasks: [
      { id: taskId, position: 1, status: 'done' }
    ]
  }, authToken);
}

async function testNotes() {
  console.log('\n📝 Testing Notes...');
  
  // Create note for project
  const createResult = await apiCall('/notes', 'POST', {
    project_id: projectId,
    title: 'Test Note',
    content: '# Test Note\n\nThis is a test note with **markdown**'
  }, authToken);
  
  if (createResult.data) {
    noteId = createResult.data.id;
    console.log('   Created note:', createResult.data.title);
  }
  
  // Create note for task
  await apiCall('/notes', 'POST', {
    project_id: projectId,
    task_id: taskId,
    title: 'Task Note',
    content: 'This note is attached to a task'
  }, authToken);
  
  // Get notes for project
  await apiCall(`/notes/project/${projectId}`, 'GET', null, authToken);
  
  // Get notes for task
  await apiCall(`/notes/task/${taskId}`, 'GET', null, authToken);
  
  // Get single note
  await apiCall(`/notes/${noteId}`, 'GET', null, authToken);
  
  // Update note
  await apiCall(`/notes/${noteId}`, 'PUT', {
    title: 'Updated Test Note',
    content: '# Updated\n\nThis note has been updated'
  }, authToken);
}

async function testCleanup() {
  console.log('\n🧹 Cleaning up...');
  
  // Delete note
  await apiCall(`/notes/${noteId}`, 'DELETE', null, authToken);
  
  // Delete task
  await apiCall(`/tasks/${taskId}`, 'DELETE', null, authToken);
  
  // Delete project (should cascade delete tasks)
  await apiCall(`/projects/${projectId}`, 'DELETE', null, authToken);
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...');
  
  try {
    await testAuth();
    await testProjects();
    await testTasks();
    await testNotes();
    await testCleanup();
    
    console.log('\n✨ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run tests
runTests();
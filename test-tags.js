// Test script to verify tags are working
// Run this in browser console after logging in

async function testTags() {
  try {
    // Get auth token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.error('Not logged in');
      return;
    }

    // Fetch projects
    const projectsResponse = await fetch('http://localhost:6001/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const projects = await projectsResponse.json();
    console.log('Projects:', projects);

    if (projects.length > 0) {
      // Fetch tasks for first project
      const projectId = projects[0].id;
      const tasksResponse = await fetch(`http://localhost:6001/api/tasks/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const tasks = await tasksResponse.json();
      console.log('Tasks with tags:', tasks);
      
      // Count tasks with tags
      const tasksWithTags = tasks.filter(t => t.tags && t.tags.length > 0);
      console.log(`${tasksWithTags.length} out of ${tasks.length} tasks have tags`);
      
      // Show tag details
      tasksWithTags.forEach(task => {
        console.log(`Task "${task.title}" has tags:`, task.tags.map(t => t.name).join(', '));
      });
    }
  } catch (error) {
    console.error('Error testing tags:', error);
  }
}

testTags();
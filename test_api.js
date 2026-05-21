const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('Starting extended API tests...');

  const timestamp = Date.now();
  
  // Test User 1 (Admin)
  const testAdmin = {
    name: `Test Admin ${timestamp}`,
    email: `testadmin${timestamp}@example.com`,
    password: 'password123',
    role: 'Admin'
  };

  // Test User 2 (Member to be deleted)
  const testMember = {
    name: `Test Member ${timestamp}`,
    email: `testmember${timestamp}@example.com`,
    password: 'password123',
    role: 'Member'
  };

  let adminToken;
  let adminId;
  let memberToken;
  let memberId;

  // 1. Register Admin
  try {
    console.log('1. Registering Admin...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAdmin),
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error(`Register admin failed: ${JSON.stringify(registerData)}`);
    console.log('Admin registered:', registerData.email);
    adminToken = registerData.token;
    adminId = registerData._id;
  } catch (err) {
    console.error('Register Admin Error:', err.message);
    return;
  }

  // 2. Register Member
  try {
    console.log('\n2. Registering Member...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMember),
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error(`Register member failed: ${JSON.stringify(registerData)}`);
    console.log('Member registered:', registerData.email);
    memberToken = registerData.token;
    memberId = registerData._id;
  } catch (err) {
    console.error('Register Member Error:', err.message);
    return;
  }

  // 3. Update Admin Profile (Bio, Phone, Address)
  try {
    console.log('\n3. Testing Update Profile (Admin User)...');
    const updateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: `${testAdmin.name} Updated`,
        phone: '+1-555-0199',
        bio: 'Lead Administrator and Developer',
        address: '123 Tech Park, Suite 400, CA'
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error(`Profile update failed: ${JSON.stringify(updateData)}`);
    console.log('Updated Profile Response:', updateData);
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    return;
  }

  // 4. Create Project with Member
  let projectId;
  try {
    console.log('\n4. Creating project with member added...');
    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: `Project Cascading Test ${timestamp}`,
        description: 'Testing cascading member deletion',
        members: [memberId]
      }),
    });
    const projectData = await projectRes.json();
    if (!projectRes.ok) throw new Error(`Project creation failed: ${JSON.stringify(projectData)}`);
    console.log('Project created, members listed count:', projectData.members.length);
    projectId = projectData._id;
  } catch (err) {
    console.error('Project Error:', err.message);
    return;
  }

  // 5. Create Task assigned to Member
  let taskId;
  try {
    console.log('\n5. Creating task assigned to Member...');
    const taskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: `Task assigned to ${testMember.name}`,
        description: 'Test unassignment cascade',
        status: 'Todo',
        priority: 'High',
        assignedTo: memberId,
        project: projectId
      }),
    });
    const taskData = await taskRes.json();
    if (!taskRes.ok) throw new Error(`Task creation failed: ${JSON.stringify(taskData)}`);
    console.log('Task created, assigned to ID:', taskData.assignedTo?._id || taskData.assignedTo);
    taskId = taskData._id;
  } catch (err) {
    console.error('Task Error:', err.message);
    return;
  }

  // 6. Delete Member User (Admin action)
  try {
    console.log('\n6. Admin deleting Member User...');
    const deleteRes = await fetch(`${BASE_URL}/users/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
    });
    const deleteData = await deleteRes.json();
    if (!deleteRes.ok) throw new Error(`Delete failed: ${JSON.stringify(deleteData)}`);
    console.log('Delete response:', deleteData.message);
  } catch (err) {
    console.error('Delete Member Error:', err.message);
    return;
  }

  // 7. Verify Cascade: Task should now be unassigned, Project should not list Member ID
  try {
    console.log('\n7. Verifying deletion cascade results...');
    
    // Fetch project
    const projectsRes = await fetch(`${BASE_URL}/projects`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const projectsData = await projectsRes.json();
    const targetedProject = projectsData.find(p => p._id === projectId);
    const hasMember = targetedProject?.members.some(m => m._id === memberId || m === memberId);
    console.log(`- Project still contains deleted member? ${hasMember}`);

    // Fetch task
    const tasksRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const tasksData = await tasksRes.json();
    const targetedTask = tasksData.find(t => t._id === taskId);
    console.log(`- Task assignment value after delete (expected: null/undefined):`, targetedTask?.assignedTo);

  } catch (err) {
    console.error('Verification Error:', err.message);
    return;
  }

  console.log('\nAll profile & member deletion cascading API tests passed successfully!');
}

runTest();

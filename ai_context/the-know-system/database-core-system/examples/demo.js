/**
 * Universal Database System Demo
 * Demonstrates all core functionality of the database system
 */

const UniversalDatabaseManager = require('../core/universal-database-manager');
const path = require('path');

async function runDemo() {
  console.log(' Universal Database System Demo\n');
  
  // Initialize database manager
  const dbManager = new UniversalDatabaseManager({
    basePath: './demo-databases',
    projectName: 'demo-project'
  });
  
  try {
    // Initialize the system
    await dbManager.initialize();
    console.log('\n Initial System Statistics:');
    console.log(JSON.stringify(await dbManager.getSystemStats(), null, 2));
    
    // Demo 1: Create Projects
    console.log('\n Demo 1: Creating Projects');
    const project1 = await dbManager.create('projects', {
      name: 'E-commerce Website',
      description: 'Modern e-commerce platform with React frontend',
      project_type: 'web-application',
      metadata: JSON.stringify({
        tech_stack: ['React', 'Node.js', 'MongoDB'],
        timeline: '3 months'
      })
    });
    console.log(' Created project:', project1.name);
    
    const project2 = await dbManager.create('projects', {
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      project_type: 'mobile-application',
      metadata: JSON.stringify({
        tech_stack: ['React Native', 'Firebase'],
        timeline: '4 months'
      })
    });
    console.log(' Created project:', project2.name);
    
    // Demo 2: Create Templates
    console.log('\n Demo 2: Creating Templates');
    const template1 = await dbManager.create('templates', {
      name: 'API Endpoint Template',
      description: 'Standard REST API endpoint structure',
      template_type: 'code-template',
      category: 'backend',
      content: JSON.stringify({
        structure: 'Express.js route with validation',
        includes: ['error handling', 'authentication', 'logging']
      }),
      tags: 'api,rest,express,backend'
    });
    console.log(' Created template:', template1.name);
    
    // Demo 3: Create Tasks
    console.log('\n Demo 3: Creating Tasks');
    const task1 = await dbManager.create('tasks', {
      name: 'Setup Database Schema',
      description: 'Design and implement database schema for user management',
      project_id: project1.id,
      task_type: 'development',
      priority: 'high',
      assigned_to: 'developer-1'
    });
    console.log(' Created task:', task1.name);
    
    const task2 = await dbManager.create('tasks', {
      name: 'Create User Interface',
      description: 'Build responsive user interface components',
      project_id: project1.id,
      task_type: 'frontend',
      priority: 'medium',
      assigned_to: 'developer-2',
      dependencies: JSON.stringify([task1.id])
    });
    console.log(' Created task:', task2.name);
    
    // Demo 4: Create Reports
    console.log('\n Demo 4: Creating Reports');
    const report1 = await dbManager.create('reports', {
      name: 'Project Progress Report',
      description: 'Weekly progress summary for e-commerce project',
      report_type: 'progress',
      project_id: project1.id,
      template_id: template1.id,
      content: JSON.stringify({
        completed_tasks: 5,
        pending_tasks: 12,
        blockers: 1,
        next_milestones: ['Database completion', 'API development']
      }),
      generated_by: 'ai-assistant'
    });
    console.log(' Created report:', report1.name);
    
    // Demo 5: Create Users
    console.log('\n Demo 5: Creating Users');
    const user1 = await dbManager.create('users', {
      name: 'John Developer',
      description: 'Senior Full-Stack Developer',
      user_type: 'developer',
      profile_data: JSON.stringify({
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experience: '5 years',
        role: 'senior-developer'
      }),
      preferences: JSON.stringify({
        notification_frequency: 'daily',
        preferred_tech_stack: 'MERN'
      })
    });
    console.log(' Created user:', user1.name);
    
    // Demo 6: Read Operations
    console.log('\n Demo 6: Reading Data');
    
    const allProjects = await dbManager.read('projects');
    console.log(` Found ${allProjects.length} projects`);
    
    const highPriorityTasks = await dbManager.read('tasks', { priority: 'high' });
    console.log(` Found ${highPriorityTasks.length} high priority tasks`);
    
    const webProjects = await dbManager.read('projects', { project_type: 'web-application' });
    console.log(` Found ${webProjects.length} web applications`);
    
    // Demo 7: Update Operations
    console.log('\n Demo 7: Updating Data');
    
    const updatedTask = await dbManager.update('tasks', task1.id, {
      status: 'in-progress',
      description: 'Design and implement database schema for user management - Started development'
    });
    console.log(' Updated task status:', updatedTask.status);
    
    const updatedProject = await dbManager.update('projects', project1.id, {
      status: 'active',
      metadata: JSON.stringify({
        tech_stack: ['React', 'Node.js', 'MongoDB', 'Redis'],
        timeline: '3 months',
        progress: '25%'
      })
    });
    console.log(' Updated project progress');
    
    // Demo 8: Custom Queries
    console.log('\n Demo 8: Custom Queries');
    
    const recentProjects = await dbManager.query('projects', 
      'SELECT * FROM projects WHERE created_at > datetime("now", "-7 days") ORDER BY created_at DESC'
    );
    console.log(` Found ${recentProjects.length} projects created in last 7 days`);
    
    const tasksByProject = await dbManager.query('tasks',
      'SELECT project_id, COUNT(*) as task_count FROM tasks GROUP BY project_id'
    );
    console.log(' Tasks by project:', tasksByProject);
    
    // Demo 9: File Tracking
    console.log('\n Demo 9: File Tracking');
    
    const file1 = await dbManager.create('files', {
      name: 'user.model.js',
      description: 'User data model definition',
      file_path: '/src/models/user.model.js',
      file_type: 'javascript',
      project_id: project1.id,
      size: 2048,
      relationships: JSON.stringify({
        imports: ['mongoose', 'bcrypt'],
        exports: ['User'],
        used_by: ['user.controller.js', 'auth.middleware.js']
      })
    });
    console.log(' Tracked file:', file1.name);
    
    // Demo 10: Metadata Management
    console.log('\n Demo 10: Metadata Management');
    
    const metadata1 = await dbManager.create('metadata', {
      name: 'Project Configuration',
      description: 'Environment and deployment settings',
      entity_type: 'project',
      entity_id: project1.id,
      key_name: 'deployment_config',
      value_data: JSON.stringify({
        environment: 'production',
        server: 'aws-ec2',
        domain: 'myecommerce.com',
        ssl: true
      }),
      data_type: 'json'
    });
    console.log(' Added metadata:', metadata1.key_name);
    
    // Final Statistics
    console.log('\n Final System Statistics:');
    const finalStats = await dbManager.getSystemStats();
    console.log(JSON.stringify(finalStats, null, 2));
    
    // Demo Summary
    console.log('\n Demo Summary:');
    console.log(` Created ${finalStats.databases.projects.records} projects`);
    console.log(` Created ${finalStats.databases.templates.records} templates`);
    console.log(` Created ${finalStats.databases.tasks.records} tasks`);
    console.log(` Created ${finalStats.databases.reports.records} reports`);
    console.log(` Created ${finalStats.databases.users.records} users`);
    console.log(` Created ${finalStats.databases.files.records} files`);
    console.log(` Created ${finalStats.databases.metadata.records} metadata entries`);
    
    console.log('\n Universal Database System Demo Completed Successfully!');
    console.log(' The system is ready for integration into any project.');
    
  } catch (error) {
    console.error(' Demo failed:', error);
  } finally {
    await dbManager.close();
  }
}

// Run demo if called directly
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo };

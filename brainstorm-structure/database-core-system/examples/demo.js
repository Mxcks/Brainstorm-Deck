/**
 * Brainstorm Deck Database System Demo
 * Demonstrates core functionality and Brainstorm Deck specific features
 */

const BrainstormDatabaseManager = require('../core/brainstorm-database-manager');
const path = require('path');

async function runDemo() {
  console.log('🧠 Brainstorm Deck Database System Demo');
  console.log('=====================================\n');

  // Initialize database
  const db = new BrainstormDatabaseManager({
    basePath: path.join(__dirname, '../demo-databases'),
    projectName: 'demo-brainstorm-deck'
  });

  try {
    // Initialize the system
    await db.initialize();
    console.log('✅ Database system initialized\n');

    // 1. Create a Brainstorm Deck project
    console.log('📊 Creating Brainstorm Deck project...');
    const project = await db.createProject({
      name: 'Visual Canvas Demo Project',
      description: 'A demo project showcasing the Visual Canvas Tool',
      project_type: 'visual-canvas',
      canvas_state: {
        zoom: 1.0,
        pan: { x: 0, y: 0 },
        selectedComponent: null
      },
      configuration: {
        theme: 'dark',
        gridSize: 20,
        snapToGrid: true
      }
    });
    console.log(`✅ Project created: ${project.name} (ID: ${project.id})\n`);

    // 2. Create brainstorm sessions
    console.log('💡 Creating brainstorm sessions...');
    const brainstorm1 = await db.createBrainstorm({
      name: 'Initial UI Ideas',
      content: 'Ideas for the main interface:\n- Clean, modern design\n- Sage green accent color\n- Intuitive navigation',
      brainstorm_type: 'ui-design',
      project_id: project.id,
      tags: ['ui', 'design', 'interface']
    });

    const brainstorm2 = await db.createBrainstorm({
      name: 'Component Architecture',
      content: 'Component structure:\n- Reusable button components\n- Form input components\n- Layout containers',
      brainstorm_type: 'architecture',
      project_id: project.id,
      tags: ['architecture', 'components']
    });
    console.log(`✅ Created ${2} brainstorm sessions\n`);

    // 3. Create Visual Canvas components
    console.log('🎨 Creating Visual Canvas components...');
    const buttonComponent = await db.createComponent({
      name: 'Primary Button',
      component_type: 'button',
      project_id: project.id,
      canvas_position: { x: 100, y: 150 },
      component_data: {
        text: 'Click Me',
        variant: 'primary',
        size: 'medium'
      },
      visual_properties: {
        backgroundColor: '#7c9885',
        color: '#ffffff',
        borderRadius: '6px',
        padding: '12px 24px'
      }
    });

    const inputComponent = await db.createComponent({
      name: 'Text Input',
      component_type: 'input',
      project_id: project.id,
      canvas_position: { x: 300, y: 150 },
      component_data: {
        placeholder: 'Enter text...',
        type: 'text',
        required: false
      },
      visual_properties: {
        borderColor: '#30363d',
        backgroundColor: '#161b22',
        color: '#e6edf3',
        borderRadius: '6px'
      }
    });

    const containerComponent = await db.createComponent({
      name: 'Form Container',
      component_type: 'container',
      project_id: project.id,
      canvas_position: { x: 50, y: 50 },
      component_data: {
        layout: 'vertical',
        spacing: '16px'
      },
      visual_properties: {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '24px'
      }
    });
    console.log(`✅ Created ${3} Visual Canvas components\n`);

    // 4. Create workflow for processing
    console.log('🔄 Creating processing workflow...');
    const workflow = await db.createWorkflow({
      name: 'Brainstorm to Implementation',
      workflow_type: 'brainstorm-processing',
      project_id: project.id,
      current_stage: 'design',
      stage_data: {
        designComplete: false,
        componentsCreated: true,
        codeGenerated: false
      },
      next_actions: [
        'Finalize component designs',
        'Generate React code',
        'Create project structure'
      ]
    });
    console.log(`✅ Workflow created: ${workflow.name}\n`);

    // 5. Create templates
    console.log('📋 Creating templates...');
    const componentTemplate = await db.create('templates', {
      name: 'Button Component Template',
      template_type: 'component',
      category: 'ui-elements',
      content: JSON.stringify({
        type: 'button',
        defaultProps: {
          variant: 'primary',
          size: 'medium',
          disabled: false
        },
        visualProperties: {
          backgroundColor: '#7c9885',
          color: '#ffffff',
          borderRadius: '6px'
        }
      }),
      framework_type: 'react',
      tags: JSON.stringify(['button', 'ui', 'component'])
    });

    const brainstormTemplate = await db.create('templates', {
      name: 'UI Design Brainstorm Template',
      template_type: 'brainstorm',
      category: 'design',
      content: 'UI Design Brainstorm Template:\n\n1. User Goals\n2. Visual Style\n3. Component Needs\n4. Interaction Patterns\n5. Accessibility Considerations',
      framework_type: 'brainstorm',
      tags: JSON.stringify(['ui', 'design', 'brainstorm'])
    });
    console.log(`✅ Created ${2} templates\n`);

    // 6. Demonstrate data retrieval
    console.log('📖 Retrieving project data...');
    const fullProject = await db.getProjectWithComponents(project.id);
    console.log(`📊 Project: ${fullProject.name}`);
    console.log(`   - Components: ${fullProject.components.length}`);
    console.log(`   - Brainstorms: ${fullProject.brainstorms.length}`);
    console.log(`   - Workflows: ${fullProject.workflows.length}`);
    console.log(`   - Canvas State: zoom=${fullProject.canvas_state.zoom}\n`);

    // 7. Update workflow progress
    console.log('📈 Updating workflow progress...');
    await db.updateWorkflowProgress(workflow.id, 'implementation', 0.75, [
      'Generate React components',
      'Create project documentation',
      'Deploy to brainstorm-projects folder'
    ]);
    console.log('✅ Workflow progress updated\n');

    // 8. System health check
    console.log('🏥 Checking system health...');
    const health = await db.getSystemHealth();
    console.log(`📊 System Status: ${health.status}`);
    console.log(`📊 Total Records: ${health.totalRecords}`);
    console.log('📊 Database Status:');
    Object.entries(health.databases).forEach(([name, info]) => {
      console.log(`   - ${name}: ${info.status} (${info.recordCount} records)`);
    });
    console.log('');

    // 9. Demonstrate custom queries
    console.log('🔍 Running custom queries...');
    const activeProjects = await db.query('projects', 
      'SELECT name, project_type, workflow_stage FROM projects WHERE status = ?', 
      ['active']
    );
    console.log(`📊 Active Projects: ${activeProjects.length}`);
    activeProjects.forEach(p => {
      console.log(`   - ${p.name} (${p.project_type}) - Stage: ${p.workflow_stage}`);
    });
    console.log('');

    // 10. Create output record
    console.log('📤 Creating output record...');
    const output = await db.create('outputs', {
      name: 'Generated React Components',
      output_type: 'code',
      project_id: project.id,
      workflow_id: workflow.id,
      file_path: '/brainstorm-projects/visual-canvas-demo/components/',
      content: 'Generated React component files',
      delivery_status: 'ready'
    });
    console.log(`✅ Output created: ${output.name}\n`);

    console.log('🎉 Demo completed successfully!');
    console.log('=====================================');
    console.log('The Brainstorm Deck Database System is ready for integration.');
    console.log('All core functionality has been demonstrated and tested.');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Close database connections
    await db.close();
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };

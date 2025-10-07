# Brainstorm Deck Database System
> SQLite-based database management system for the Brainstorm Deck workflow

## 🧠 **Specialized for Brainstorm Deck**

This database system is specifically adapted from The Know's Universal Database Core System to support the Brainstorm Deck workflow: **INPUT → PROCESS → OUTPUT**.

## 📊 **Database Categories**

### **Core Categories (7 databases):**

1. **Projects** - Brainstorm projects and Visual Canvas projects
   - Project type, canvas state, workflow stage
   - Source brainstorm tracking, output paths
   - Configuration and metadata

2. **Brainstorms** - Individual brainstorm sessions and files
   - Brainstorm content and processing stage
   - Project relationships and file paths
   - Tags and categorization

3. **Components** - Visual Canvas components and their data
   - Component types and visual properties
   - Canvas positioning and relationships
   - Parent-child component hierarchies

4. **Templates** - Brainstorm templates and component templates
   - Template types and framework categories
   - Usage tracking and success ratings
   - Content and configuration data

5. **Workflows** - Processing workflows and their states
   - Workflow stages and completion tracking
   - Project relationships and next actions
   - Stage data and progress metrics

6. **Outputs** - Generated outputs and deliverables
   - Output types and delivery status
   - File paths and content storage
   - Project and workflow relationships

7. **Metadata** - System settings, user preferences, canvas states
   - Flexible key-value storage
   - Entity relationships and data types
   - Configuration and state management

## 🚀 **Quick Start**

### **Installation**
```bash
cd brainstorm-structure/database-core-system
npm install
```

### **Basic Usage**
```javascript
const BrainstormDatabaseManager = require('./core/brainstorm-database-manager');

// Initialize
const db = new BrainstormDatabaseManager({
  basePath: './databases',
  projectName: 'my-brainstorm-project'
});

await db.initialize();

// Create a project
const project = await db.createProject({
  name: 'My Brainstorm Project',
  description: 'A sample brainstorm project',
  project_type: 'visual-canvas',
  canvas_state: { zoom: 1.0, pan: { x: 0, y: 0 } }
});

// Create a brainstorm
const brainstorm = await db.createBrainstorm({
  name: 'Initial Ideas',
  content: 'My brainstorm content...',
  project_id: project.id,
  brainstorm_type: 'ideation'
});

// Create a component
const component = await db.createComponent({
  name: 'Button Component',
  component_type: 'button',
  project_id: project.id,
  canvas_position: { x: 100, y: 200 },
  component_data: { text: 'Click me', color: '#7c9885' }
});

// Get project with all related data
const fullProject = await db.getProjectWithComponents(project.id);

// Close connections
await db.close();
```

## 🔧 **Brainstorm Deck Integration**

### **Visual Canvas Tool Integration**
Replace localStorage with database persistence:

```javascript
// Old way (localStorage)
localStorage.setItem('visual-canvas-projects', JSON.stringify(projects));

// New way (database)
const db = new BrainstormDatabaseManager();
await db.initialize();
await db.createProject(projectData);
```

### **Workflow Management**
Track brainstorm processing through the system:

```javascript
// Create workflow for brainstorm processing
const workflow = await db.createWorkflow({
  name: 'Brainstorm to Project',
  workflow_type: 'brainstorm-processing',
  project_id: projectId,
  current_stage: 'analysis'
});

// Update progress
await db.updateWorkflowProgress(workflow.id, 'design', 0.5, [
  'Create component templates',
  'Generate project structure'
]);
```

## 🎯 **Key Features**

### **Brainstorm Deck Specific**
- **Project-Component Relationships** - Track Visual Canvas components within projects
- **Workflow Stage Tracking** - Monitor brainstorm processing stages
- **Canvas State Persistence** - Store and restore canvas positions and zoom
- **Template Management** - Organize brainstorm and component templates
- **Output Tracking** - Monitor generated deliverables and their status

### **Inherited from The Know**
- **Zero Configuration** - Works out of the box
- **SQLite Backend** - Fast, reliable, file-based storage
- **Full CRUD Operations** - Create, Read, Update, Delete
- **Custom Queries** - Raw SQL support for complex operations
- **Backup & Recovery** - Complete data protection

## 📈 **System Health**

Check database system status:
```bash
npm run health
```

Or programmatically:
```javascript
const health = await db.getSystemHealth();
console.log(health);
// {
//   status: 'healthy',
//   databases: { projects: { status: 'connected', recordCount: 5 }, ... },
//   totalRecords: 42,
//   lastCheck: '2025-01-28T...'
// }
```

## 🔄 **Migration from localStorage**

The system includes helpers to migrate existing Visual Canvas Tool data:

```javascript
// Migration helper (to be implemented)
const migrator = require('./tools/migrate-from-localstorage');
await migrator.migrateProjects(db);
await migrator.migrateSettings(db);
```

## 🎨 **Perfect for Brainstorm Deck**

This database system provides the robust foundation needed for:
- **Visual Canvas Tool** - Persistent project and component storage
- **Brainstorm Processing** - Track ideas through the workflow
- **Template Management** - Organize and reuse successful patterns
- **Output Generation** - Monitor deliverables and their status
- **Cross-Session Continuity** - Maintain state across app restarts

---

**Brainstorm Deck Database System - Powering the INPUT → PROCESS → OUTPUT workflow**

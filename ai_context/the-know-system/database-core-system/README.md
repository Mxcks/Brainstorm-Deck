# Universal Database Core System
> Portable, project-agnostic database management system with SQLite backend

##  **Complete Standalone Database System**

This is a fully portable database management system that can be dropped into any project to provide instant, robust data storage and management capabilities.

##  **What's Included**

### ** Core Database Engine**
- Universal database manager with SQLite backend
- 7 core database categories (projects, templates, reports, tasks, users, files, metadata)
- Full CRUD operations (Create, Read, Update, Delete)
- Custom query support
- Automatic schema generation

### ** Management Tools**
- **Backup System** - Complete database backup and restore
- **Migration Tools** - Data migration utilities
- **CLI Interface** - Command-line database operations
- **Demo System** - Comprehensive examples and testing

### ** Built-in Categories**
- **Projects** - Project management and tracking
- **Templates** - Reusable code and content templates
- **Reports** - Generated reports and analytics
- **Tasks** - Task management and dependencies
- **Users** - User profiles and preferences
- **Files** - File tracking and relationships
- **Metadata** - Flexible key-value storage

##  **Quick Start**

### **Installation**
```bash
# Install dependencies
npm install

# Run demo to see it in action
npm run demo

# Start the system
npm start
```

### **Basic Usage**
```javascript
const UniversalDatabaseManager = require('./core/universal-database-manager');

// Initialize
const db = new UniversalDatabaseManager({
  basePath: './my-databases',
  projectName: 'my-project'
});

await db.initialize();

// Create records
const project = await db.create('projects', {
  name: 'My Project',
  description: 'A sample project',
  project_type: 'web-application'
});

// Read records
const projects = await db.read('projects');
const webProjects = await db.read('projects', { project_type: 'web-application' });

// Update records
await db.update('projects', project.id, { status: 'active' });

// Custom queries
const results = await db.query('projects', 'SELECT * FROM projects WHERE status = ?', ['active']);

// Close connections
await db.close();
```

##  **Key Features**

### ** Zero Configuration**
- Works out of the box
- Automatic schema creation
- No external database server required
- SQLite file-based storage

### ** Portable & Lightweight**
- Single directory contains everything
- No external dependencies beyond npm packages
- Can be copied to any project
- Cross-platform compatibility

### ** Backup & Recovery**
```bash
# Create backup
node tools/backup.js create my-backup

# List backups
node tools/backup.js list

# Restore backup
node tools/backup.js restore my-backup ./restored-databases
```

### ** Flexible Schema**
- Standard fields for all categories
- Category-specific fields
- JSON metadata support
- Automatic indexing

### ** Advanced Querying**
- Simple filters: `{ status: 'active', type: 'web' }`
- Custom SQL queries
- Relationship tracking
- Full-text search capabilities

##  **Database Categories**

### **Projects**
Store and manage project information
- Project type, status, configuration
- Folder structure and dependencies
- Timeline and progress tracking

### **Templates**
Reusable templates and frameworks
- Code templates, document templates
- Usage tracking and ratings
- Category and tag organization

### **Reports**
Generated reports and analytics
- Progress reports, status updates
- AI-generated content
- Verification and approval workflow

### **Tasks**
Task management and tracking
- Priority levels, assignments
- Dependencies and relationships
- Progress and completion tracking

### **Users**
User profiles and preferences
- Profile data and preferences
- Behavior tracking
- Role and permission management

### **Files**
File tracking and relationships
- File paths and metadata
- Relationship mapping
- Change tracking and versioning

### **Metadata**
Flexible key-value storage
- Configuration settings
- Custom properties
- JSON data storage

##  **Tools & Utilities**

### **Backup System**
- Complete database backup
- Incremental backups
- Restore functionality
- Backup verification

### **Migration Tools**
- Data import/export
- Schema migration
- Format conversion
- Bulk operations

### **CLI Interface**
- Database operations from command line
- Batch processing
- Automated workflows
- System monitoring

##  **Perfect For**

- **Web Applications** - User data, content management
- **Desktop Apps** - Local data storage, settings
- **Mobile Apps** - Offline data, sync preparation
- **CLI Tools** - Configuration, state management
- **Prototypes** - Quick data storage without setup
- **Microservices** - Lightweight data layer

##  **Integration Examples**

### **Express.js API**
```javascript
const express = require('express');
const UniversalDatabaseManager = require('./database-core-system/core/universal-database-manager');

const app = express();
const db = new UniversalDatabaseManager();

app.get('/api/projects', async (req, res) => {
  const projects = await db.read('projects');
  res.json(projects);
});

app.post('/api/projects', async (req, res) => {
  const project = await db.create('projects', req.body);
  res.json(project);
});
```

### **React Frontend**
```javascript
import DatabaseService from './services/database-service';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    DatabaseService.getProjects().then(setProjects);
  }, []);
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

##  **Performance**

- **Fast SQLite backend** - Optimized for local operations
- **Indexed queries** - Automatic indexing on key fields
- **Connection pooling** - Efficient connection management
- **Memory efficient** - Minimal memory footprint

##  **Data Safety**

- **ACID compliance** - SQLite ACID transactions
- **Backup system** - Automated backup capabilities
- **Data validation** - Schema enforcement
- **Error handling** - Comprehensive error management

##  **Ready for Production**

This system is production-ready and includes:
- Error handling and logging
- Performance optimization
- Data validation
- Backup and recovery
- Comprehensive testing

---

**Universal Database Core System - Drop-in database solution for any project**

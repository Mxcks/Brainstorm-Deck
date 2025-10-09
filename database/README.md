#  Brainstorm-Deck Component Database

## Overview

This database system provides complete mapping of React components, imports, and dependencies for the Brainstorm-Deck project. It solves import mapping issues and enhances AI assistance by providing structured project context.

##  Files in this Directory

### Documentation
- **`README.md`** - This file, overview of the database system
- **`AI_USAGE_GUIDE.md`** - Comprehensive guide for AI assistants
- **`QUERY_EXAMPLES.md`** - SQL query examples and patterns
- **`SETUP_GUIDE.md`** - Installation and setup instructions

### Database Files (Created after initialization)
- **`brainstorm_deck.db`** - Main SQLite database file
- **`project_analysis.json`** - JSON analysis results
- **`init_database.sql`** - Database initialization script

##  Quick Start

### 1. Initialize Database
```bash
# From project root
sqlite3 database/brainstorm_deck.db < project_database_schema.sql
```

### 2. Populate with Data
```bash
# Scan project and populate database
node init_database.js full
```

### 3. Query Components
```bash
# Interactive SQL
sqlite3 database/brainstorm_deck.db
```

##  Key Features

### For Developers
- **Component Discovery** - Find all React components and their locations
- **Import Validation** - Check import paths before they break
- **Dependency Analysis** - Understand component relationships
- **Refactoring Safety** - Know impact of changes

### For AI Assistants
- **Complete Project Context** - Full understanding of component structure
- **Accurate Import Suggestions** - Correct import paths every time
- **Dependency Awareness** - Understand component relationships
- **Error Prevention** - Validate suggestions against actual project structure

##  Database Schema

### Core Tables
- **`projects`** - Project metadata and configuration
- **`files`** - All project files with metadata
- **`components`** - React component definitions
- **`imports`** - Import statements with line numbers
- **`dependencies`** - File-to-file relationships

### Analysis Tables
- **`component_usage`** - Component usage patterns
- **`external_packages`** - NPM package tracking
- **`metadata`** - Flexible key-value storage

### Views
- **`component_overview`** - Components with file information
- **`import_analysis`** - Import statements and sources
- **`dependency_graph`** - File dependency relationships

##  Common Queries

### Find a Component
```sql
SELECT component_name, file_path, component_type
FROM component_overview 
WHERE component_name = 'Button';
```

### Check Import Path
```sql
SELECT file_path FROM files 
WHERE file_path = 'src/components/Button.jsx';
```

### Analyze Dependencies
```sql
SELECT source_file, target_file, dependency_type
FROM dependency_graph 
WHERE target_file LIKE '%Button%';
```

##  Maintenance

### Update Database
```bash
# Rescan for changes
node init_database.js scan

# Full rebuild
node init_database.js full
```

### Health Check
```bash
sqlite3 database/brainstorm_deck.db "
  SELECT 'Files' as table_name, COUNT(*) as count FROM files
  UNION ALL
  SELECT 'Components', COUNT(*) FROM components;
"
```

##  AI Integration

### Database-First Approach
AI assistants should:
1. Query database before making suggestions
2. Validate import paths against actual files
3. Check dependencies before recommending changes
4. Use existing patterns for consistency

### Example AI Workflow
```javascript
// 1. Find component
const component = await db.get(
  "SELECT * FROM component_overview WHERE component_name = ?", 
  [userInput]
);

// 2. Get import pattern
const imports = await db.all(
  "SELECT import_statement FROM import_analysis WHERE source_path = ?",
  [component.file_path]
);

// 3. Suggest correct import
console.log(`Import: ${imports[0].import_statement}`);
```

##  Benefits

### Solves Import Issues
-  Prevents "Cannot resolve module" errors
-  Ensures consistent import patterns
-  Validates paths before suggesting
-  Maps component relationships

### Enhances AI Assistance
-  Complete project understanding
-  Accurate component suggestions
-  Correct import statements
-  Dependency-aware recommendations

##  Troubleshooting

### Database Issues
- **Locked database**: Check for open connections
- **Missing tables**: Re-run schema initialization
- **Outdated data**: Run full rescan

### Query Performance
- Use indexed columns for WHERE clauses
- Leverage pre-built views for complex queries
- Run ANALYZE periodically for optimization

##  Support

This database system is specifically designed to solve component import mapping issues in the Brainstorm-Deck project. It provides:

1. **Complete component inventory**
2. **Import relationship mapping**
3. **Dependency tracking**
4. **AI-ready context data**

For questions or issues, refer to the detailed documentation files in this directory.

##  Version History

- **v1.0** - Initial database schema and documentation
- **v1.1** - Added AI usage guides and query examples
- **v1.2** - Enhanced setup and maintenance documentation

---

**Next Steps**: Initialize the database and run your first component scan to populate it with your project structure.

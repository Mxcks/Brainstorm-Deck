#  Database Setup and Usage Instructions

## Quick Setup

### 1. Initialize Database
```bash
# Create the SQLite database
sqlite3 database/brainstorm_deck.db < project_database_schema.sql

# Verify tables were created
sqlite3 database/brainstorm_deck.db ".tables"
```

### 2. Populate with Project Data
```bash
# Scan project and populate database
node init_database.js full

# Check results
sqlite3 database/brainstorm_deck.db "SELECT COUNT(*) FROM files;"
```

### 3. Test Queries
```bash
# Interactive SQL session
sqlite3 database/brainstorm_deck.db

# Or run specific queries
sqlite3 database/brainstorm_deck.db "SELECT * FROM component_overview LIMIT 5;"
```

## Database Connection Examples

### Node.js
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/brainstorm_deck.db');

// Query components
db.all("SELECT * FROM component_overview", (err, rows) => {
  if (err) throw err;
  console.log('Components:', rows);
});

db.close();
```

### Python
```python
import sqlite3

conn = sqlite3.connect('database/brainstorm_deck.db')
cursor = conn.cursor()

# Query components
cursor.execute("SELECT * FROM component_overview")
components = cursor.fetchall()
print("Components:", components)

conn.close()
```

### Command Line
```bash
# Quick queries
sqlite3 database/brainstorm_deck.db "SELECT component_name FROM component_overview;"

# Interactive mode
sqlite3 database/brainstorm_deck.db
.mode column
.headers on
SELECT * FROM component_overview LIMIT 10;
.quit
```

## AI Integration Examples

### 1. Component Lookup Function
```javascript
async function findComponent(componentName) {
  const query = `
    SELECT component_name, file_path, component_type, export_type
    FROM component_overview 
    WHERE component_name = ?
  `;
  
  return new Promise((resolve, reject) => {
    db.get(query, [componentName], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Usage
const button = await findComponent('Button');
console.log(`Button component found at: ${button.file_path}`);
```

### 2. Import Validation Function
```javascript
async function validateImport(fromFile, importPath) {
  const query = `
    SELECT file_path FROM files 
    WHERE file_path = ? OR file_name = ?
  `;
  
  return new Promise((resolve, reject) => {
    db.get(query, [importPath, importPath], (err, row) => {
      if (err) reject(err);
      else resolve(!!row); // Returns true if file exists
    });
  });
}

// Usage
const isValid = await validateImport('src/App.jsx', 'src/components/Button.jsx');
console.log(`Import is valid: ${isValid}`);
```

### 3. Dependency Analysis Function
```javascript
async function getDependencies(filePath) {
  const query = `
    SELECT target_file, dependency_type
    FROM dependency_graph 
    WHERE source_file = ?
  `;
  
  return new Promise((resolve, reject) => {
    db.all(query, [filePath], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Usage
const deps = await getDependencies('src/App.jsx');
console.log('Dependencies:', deps);
```

## Maintenance Scripts

### Update Database
```bash
#!/bin/bash
# update_database.sh

echo " Updating component database..."

# Backup existing database
cp database/brainstorm_deck.db database/brainstorm_deck.db.backup

# Rescan project
node init_database.js scan

# Verify update
sqlite3 database/brainstorm_deck.db "
  SELECT 'Updated:' as status, datetime('now') as timestamp;
  SELECT 'Files:' as table_name, COUNT(*) as count FROM files;
  SELECT 'Components:' as table_name, COUNT(*) as count FROM components;
  SELECT 'Imports:' as table_name, COUNT(*) as count FROM imports;
"

echo " Database updated successfully"
```

### Health Check
```bash
#!/bin/bash
# check_database.sh

echo " Database Health Check"

sqlite3 database/brainstorm_deck.db "
  -- Check table counts
  SELECT 'Files' as table_name, COUNT(*) as count FROM files
  UNION ALL
  SELECT 'Components', COUNT(*) FROM components  
  UNION ALL
  SELECT 'Imports', COUNT(*) FROM imports
  UNION ALL
  SELECT 'Dependencies', COUNT(*) FROM dependencies;
  
  -- Check for issues
  SELECT 'Orphaned Components' as issue, COUNT(*) as count
  FROM components c
  LEFT JOIN files f ON c.file_id = f.id
  WHERE f.id IS NULL;
  
  SELECT 'Broken Imports' as issue, COUNT(*) as count
  FROM imports i
  LEFT JOIN files f ON i.source_path = f.file_path
  WHERE i.is_relative = 1 AND f.file_path IS NULL;
"
```

## AI Assistant Integration

### Database-First Approach
When an AI assistant receives a request:

1. **Query Database First**
   ```sql
   SELECT * FROM component_overview WHERE component_name LIKE '%UserInput%';
   ```

2. **Validate Suggestions**
   ```sql
   SELECT file_path FROM files WHERE file_path = 'suggested/path.jsx';
   ```

3. **Check Impact**
   ```sql
   SELECT COUNT(*) FROM dependency_graph WHERE target_file = 'file/to/modify.jsx';
   ```

4. **Provide Context**
   ```sql
   SELECT import_statement FROM import_analysis WHERE source_path LIKE '%Component%';
   ```

### Response Templates

#### Component Found
```
 Found component in database:
- Name: {component_name}
- Location: {file_path}
- Type: {component_type}
- Import: {suggested_import}
- Used in: {usage_count} files
```

#### Component Not Found
```
 Component not found in database.
 Similar components:
{list_of_similar_components}
 Suggestion: Check spelling or create new component
```

#### Import Validation
```
 Import validation:
 Target file exists: {file_path}
 Import path is correct: {import_statement}
 Usage pattern: Found in {usage_count} other files
```

## Troubleshooting

### Common Issues

#### Database Locked
```bash
# Check for locks
lsof database/brainstorm_deck.db

# Force unlock (use carefully)
sqlite3 database/brainstorm_deck.db ".timeout 30000"
```

#### Missing Tables
```bash
# Recreate schema
sqlite3 database/brainstorm_deck.db < project_database_schema.sql
```

#### Outdated Data
```bash
# Full refresh
rm database/brainstorm_deck.db
sqlite3 database/brainstorm_deck.db < project_database_schema.sql
node init_database.js full
```

### Performance Issues
```sql
-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM component_overview WHERE component_name = 'Button';

-- Rebuild indexes
REINDEX;

-- Update statistics
ANALYZE;
```

This setup guide ensures AI assistants can effectively use the component database for accurate project assistance.

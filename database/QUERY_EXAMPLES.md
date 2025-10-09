#  Database Query Examples for AI

## Quick Reference Queries

### Component Lookup
```sql
-- Find component by name
SELECT component_name, file_path, component_type, export_type
FROM component_overview 
WHERE component_name = 'Button';

-- Find all components in a directory
SELECT component_name, file_path
FROM component_overview 
WHERE file_path LIKE 'src/components/%';

-- Find components by type
SELECT component_name, file_path
FROM component_overview 
WHERE component_type = 'functional';
```

### Import Analysis
```sql
-- Get all imports for a file
SELECT import_statement, source_path, is_external
FROM import_analysis
WHERE file_path = 'src/App.jsx';

-- Find how a component is imported
SELECT DISTINCT import_statement, file_path
FROM import_analysis
WHERE source_path LIKE '%Button%';

-- Check external package usage
SELECT source_path, COUNT(*) as usage_count
FROM imports
WHERE is_external = 1
GROUP BY source_path
ORDER BY usage_count DESC;
```

### Dependency Tracking
```sql
-- What files depend on this component?
SELECT source_file, dependency_type
FROM dependency_graph
WHERE target_file LIKE '%Button.jsx';

-- What does this file depend on?
SELECT target_file, dependency_type
FROM dependency_graph
WHERE source_file = 'src/App.jsx';

-- Find potential circular dependencies
SELECT d1.source_file, d1.target_file
FROM dependency_graph d1
JOIN dependency_graph d2 
  ON d1.source_file = d2.target_file 
  AND d1.target_file = d2.source_file;
```

### Validation Queries
```sql
-- Check if import path exists
SELECT file_path FROM files 
WHERE file_path = 'src/components/Button.jsx';

-- Find broken relative imports
SELECT i.file_path, i.import_statement, i.source_path
FROM import_analysis i
LEFT JOIN files f ON i.source_path = f.file_path
WHERE i.is_relative = 1 AND f.file_path IS NULL;

-- Find unused exported components
SELECT c.component_name, f.file_path
FROM components c
JOIN files f ON c.file_id = f.id
WHERE c.export_type IN ('exported', 'default')
AND NOT EXISTS (
  SELECT 1 FROM imports i 
  WHERE i.source_path = f.file_path
);
```

## AI Workflow Examples

### 1. User asks: "How do I import the Button component?"

```sql
-- Step 1: Find the Button component
SELECT component_name, file_path, export_type
FROM component_overview 
WHERE component_name = 'Button';

-- Step 2: Check existing import patterns
SELECT DISTINCT import_statement, file_path as used_in
FROM import_analysis
WHERE source_path LIKE '%Button%'
LIMIT 5;
```

**AI Response Template:**
```
I found the Button component in the database:
- Location: `src/components/Button.jsx`
- Export type: default
- Import statement: `import Button from '../components/Button';`
- Used in 3 other files with this same pattern
```

### 2. User asks: "What components are available?"

```sql
-- Get all exported components
SELECT component_name, file_path, component_type
FROM component_overview 
WHERE export_type IN ('exported', 'default')
ORDER BY component_name;
```

### 3. User asks: "Why is my import not working?"

```sql
-- Check if the file exists
SELECT file_path FROM files 
WHERE file_path = 'user/provided/path.jsx';

-- If not found, suggest similar files
SELECT file_path, file_name
FROM files 
WHERE file_name LIKE '%ComponentName%'
OR file_path LIKE '%ComponentName%';
```

### 4. User wants to refactor a component

```sql
-- Check impact before refactoring
SELECT COUNT(*) as dependent_files,
       GROUP_CONCAT(source_file) as files
FROM dependency_graph 
WHERE target_file = 'src/components/OldComponent.jsx';
```

## Error Prevention Queries

### Before Suggesting File Moves
```sql
-- Check dependencies that would break
SELECT source_file, import_statement
FROM dependency_graph d
JOIN import_analysis i ON d.source_file = i.file_path
WHERE d.target_file = 'file/to/move.jsx';
```

### Before Suggesting Component Deletion
```sql
-- Check if component is used anywhere
SELECT file_path, import_statement
FROM import_analysis
WHERE source_path LIKE '%ComponentToDelete%';
```

### Before Suggesting Import Changes
```sql
-- Check current import patterns
SELECT import_statement, COUNT(*) as frequency
FROM imports
WHERE source_path = 'target/component/path.jsx'
GROUP BY import_statement
ORDER BY frequency DESC;
```

## Performance Optimization

### Use Indexes
The database includes indexes on:
- `files.project_id`
- `files.file_type` 
- `components.file_id`
- `imports.file_id`
- `imports.source_path`
- `dependencies.source_file_id`
- `dependencies.target_file_id`

### Efficient Queries
```sql
-- Good: Use indexed columns
SELECT * FROM component_overview WHERE component_name = 'Button';

-- Avoid: Full table scans
SELECT * FROM components WHERE description LIKE '%button%';

-- Good: Use views for complex joins
SELECT * FROM import_analysis WHERE file_name = 'App.jsx';
```

## Database Maintenance

### Check Database Health
```sql
-- Count records in each table
SELECT 'files' as table_name, COUNT(*) as count FROM files
UNION ALL
SELECT 'components', COUNT(*) FROM components
UNION ALL  
SELECT 'imports', COUNT(*) FROM imports
UNION ALL
SELECT 'dependencies', COUNT(*) FROM dependencies;

-- Check for orphaned records
SELECT 'orphaned_components' as issue, COUNT(*) as count
FROM components c
LEFT JOIN files f ON c.file_id = f.id
WHERE f.id IS NULL;
```

### Update Triggers
```sql
-- Update timestamps automatically
CREATE TRIGGER update_file_timestamp 
AFTER UPDATE ON files
BEGIN
  UPDATE files SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;
```

This reference guide helps AI assistants efficiently query the component database and provide accurate assistance.

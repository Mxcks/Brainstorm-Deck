#  AI Usage Guide for Brainstorm-Deck Component Database

## Overview for AI Assistants

This database contains a complete mapping of all React components, imports, and dependencies in the Brainstorm-Deck project. Use this data to provide accurate component suggestions, import statements, and dependency resolution.

##  Primary Use Cases

### 1. Component Discovery
When a user asks about components, query the database first:

```sql
-- Find all components
SELECT component_name, component_type, file_path, export_type 
FROM component_overview;

-- Find specific component
SELECT * FROM component_overview 
WHERE component_name LIKE '%ComponentName%';
```

### 2. Import Statement Generation
Always check existing imports before suggesting new ones:

```sql
-- Check how a component is typically imported
SELECT DISTINCT import_statement, source_path 
FROM imports 
WHERE imported_items LIKE '%ComponentName%';

-- Find relative import paths
SELECT file_path, import_statement, source_path
FROM import_analysis
WHERE source_path LIKE '%ComponentName%' AND is_relative = 1;
```

### 3. Dependency Validation
Before suggesting code changes, check dependencies:

```sql
-- Check what depends on a file
SELECT source_file, dependency_type 
FROM dependency_graph 
WHERE target_file LIKE '%filename%';

-- Find circular dependencies
SELECT * FROM dependency_graph 
WHERE source_file = target_file;
```

##  Database Tables Reference

### Core Tables

#### `files`
- Contains all project files with metadata
- Use for: Finding file locations, checking if files exist
- Key fields: `file_path`, `file_name`, `file_type`, `is_component`

#### `components` 
- All React components in the project
- Use for: Component discovery, type checking
- Key fields: `component_name`, `component_type`, `export_type`

#### `imports`
- Every import statement with details
- Use for: Import validation, dependency tracking
- Key fields: `import_statement`, `source_path`, `is_relative`, `imported_items`

#### `dependencies`
- File-to-file relationships
- Use for: Impact analysis, refactoring safety
- Key fields: `source_file_id`, `target_file_id`, `dependency_type`

### Analysis Tables

#### `component_usage`
- How components are used across files
- Use for: Usage patterns, prop analysis

#### `external_packages`
- NPM packages and their usage
- Use for: Package recommendations, version checking

##  Common AI Queries

### Finding Components
```sql
-- All functional components
SELECT component_name, file_path 
FROM component_overview 
WHERE component_type = 'functional';

-- Exported components only
SELECT component_name, file_path 
FROM component_overview 
WHERE export_type IN ('exported', 'default');
```

### Import Analysis
```sql
-- Most used external packages
SELECT source_path, COUNT(*) as usage_count
FROM imports 
WHERE is_external = 1 
GROUP BY source_path 
ORDER BY usage_count DESC;

-- Internal component imports
SELECT source_path, COUNT(*) as usage_count
FROM imports 
WHERE is_external = 0 AND source_path LIKE '%.jsx'
GROUP BY source_path 
ORDER BY usage_count DESC;
```

### Dependency Checking
```sql
-- Files that import a specific component
SELECT sf.file_path as importing_file, i.import_statement
FROM imports i
JOIN files sf ON i.file_id = sf.id
WHERE i.source_path LIKE '%ComponentName%';

-- Components with no dependencies (safe to modify)
SELECT c.component_name, f.file_path
FROM components c
JOIN files f ON c.file_id = f.id
LEFT JOIN dependencies d ON f.id = d.target_file_id
WHERE d.id IS NULL;
```

##  AI Best Practices

### 1. Always Query First
Before suggesting any component or import:
1. Check if the component exists in the database
2. Verify the correct import path
3. Check for existing usage patterns

### 2. Validate Import Paths
```sql
-- Check if an import path is valid
SELECT file_path FROM files 
WHERE file_path = 'suggested/import/path.jsx';

-- Find correct relative path between files
SELECT 
  source.file_path as from_file,
  target.file_path as to_file,
  i.source_path as import_path
FROM imports i
JOIN files source ON i.file_id = source.id
JOIN files target ON i.source_path = target.file_path
WHERE source.file_path = 'current/file.jsx';
```

### 3. Suggest Consistent Patterns
```sql
-- Find common import patterns for similar components
SELECT import_statement, COUNT(*) as frequency
FROM imports 
WHERE source_path LIKE '%Button%'
GROUP BY import_statement
ORDER BY frequency DESC;
```

### 4. Check for Breaking Changes
```sql
-- Before suggesting file moves/renames, check dependencies
SELECT COUNT(*) as dependent_files
FROM dependencies d
JOIN files f ON d.target_file_id = f.id
WHERE f.file_path = 'file/to/modify.jsx';
```

##  Error Prevention

### Common Issues to Check

#### Missing Imports
```sql
-- Components used but not imported
SELECT DISTINCT c.component_name, f.file_path
FROM components c
JOIN files f ON c.file_id = f.id
WHERE NOT EXISTS (
  SELECT 1 FROM imports i 
  WHERE i.source_path LIKE '%' || c.component_name || '%'
);
```

#### Circular Dependencies
```sql
-- Detect potential circular imports
SELECT d1.source_file_id, d1.target_file_id
FROM dependencies d1
JOIN dependencies d2 ON d1.source_file_id = d2.target_file_id 
  AND d1.target_file_id = d2.source_file_id;
```

#### Unused Components
```sql
-- Components that are defined but never imported
SELECT c.component_name, f.file_path
FROM components c
JOIN files f ON c.file_id = f.id
WHERE c.export_type = 'exported'
AND NOT EXISTS (
  SELECT 1 FROM imports i 
  WHERE i.source_path = f.file_path
);
```

##  Database Views for AI

Use these pre-built views for easier queries:

### `component_overview`
Complete component information with file details
```sql
SELECT * FROM component_overview 
WHERE component_name = 'SearchedComponent';
```

### `import_analysis` 
Import statements with source information
```sql
SELECT * FROM import_analysis 
WHERE file_name = 'App.jsx';
```

### `dependency_graph`
File dependency relationships
```sql
SELECT * FROM dependency_graph 
WHERE source_file LIKE '%ComponentFile%';
```

##  Keeping Data Current

### When to Suggest Database Updates
- After adding new components
- After modifying import statements
- After file moves or renames
- When import errors occur

### Update Commands
```bash
# Rescan project for changes
node init_database.js scan

# Full database rebuild
node init_database.js full
```

##  AI Response Templates

### Component Suggestion
```
Based on the database, I found the component you need:
- Component: `ComponentName`
- Location: `src/components/ComponentName.jsx`
- Import: `import ComponentName from './components/ComponentName';`
- Type: functional component
- Usage: Found in 3 other files
```

### Import Validation
```
I checked the database and found:
 Component exists at: `src/components/Button.jsx`
 Correct import: `import Button from '../components/Button';`
  Note: This component is used in 5 other files with the same import pattern
```

### Dependency Warning
```
  Database shows this change could affect:
- 3 files that import this component
- 2 files that depend on this file
- Suggested: Update imports in dependent files first
```

This database system ensures AI assistants provide accurate, consistent, and safe suggestions for the Brainstorm-Deck project.

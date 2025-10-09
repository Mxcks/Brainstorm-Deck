#  AI Context Summary - Brainstorm-Deck Component Database

## For AI Assistants: How to Use This Database

###  Purpose
This database solves component import mapping issues by providing complete project context. Always query this database before suggesting components or imports.

###  Quick Reference

#### Essential Queries
```sql
-- Find component
SELECT * FROM component_overview WHERE component_name = 'ComponentName';

-- Validate import path  
SELECT file_path FROM files WHERE file_path = 'suggested/path.jsx';

-- Check dependencies
SELECT source_file FROM dependency_graph WHERE target_file LIKE '%ComponentName%';
```

#### Database Tables
- **`component_overview`** - All components with file info (USE THIS FIRST)
- **`import_analysis`** - Import statements and patterns
- **`dependency_graph`** - File relationships
- **`files`** - All project files

###  AI Best Practices

#### ALWAYS Do This:
1. **Query database first** before suggesting any component
2. **Validate import paths** against actual files
3. **Check existing patterns** for consistency
4. **Verify dependencies** before recommending changes

#### NEVER Do This:
- Suggest imports without checking database
- Assume file locations without verification
- Ignore existing import patterns
- Recommend changes without dependency analysis

###  Response Templates

#### Component Found
```
 Found in database:
- Component: {component_name}
- Location: {file_path}  
- Import: {import_statement}
- Type: {component_type}
```

#### Component Not Found
```
 Not found in database
 Similar components: {similar_list}
 Suggestion: Check spelling or create new component
```

#### Import Validation
```
 Database check:
 File exists: {file_path}
 Import pattern: {import_statement}
 Used in {count} other files
```

###  Database Connection
```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database/brainstorm_deck.db');

// Query example
db.get("SELECT * FROM component_overview WHERE component_name = ?", 
       [componentName], callback);
```

###  Key Views to Use
- **`component_overview`** - Start here for component lookup
- **`import_analysis`** - For import statement patterns  
- **`dependency_graph`** - For impact analysis

###  Solving User's Import Issues

The user's problem: "when I add new ones it messes with my code"

**Solution**: Use this database to:
1. Find correct component locations
2. Generate accurate import statements
3. Check for dependency conflicts
4. Ensure consistent patterns

###  Documentation Files
- **`AI_USAGE_GUIDE.md`** - Detailed AI instructions
- **`QUERY_EXAMPLES.md`** - SQL query patterns
- **`SETUP_GUIDE.md`** - Database setup instructions
- **`README.md`** - Complete overview

###  Quick Start for AI
1. Connect to `database/brainstorm_deck.db`
2. Query `component_overview` for component lookup
3. Use `import_analysis` for import patterns
4. Check `dependency_graph` for relationships
5. Always validate suggestions against database

This database ensures accurate, consistent, and safe component suggestions for the Brainstorm-Deck project.

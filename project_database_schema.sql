-- Brainstorm-Deck Project Component Mapping Database Schema
-- Comprehensive tracking of all components, imports, and dependencies

-- ===== CORE PROJECT TABLES =====

-- Projects table - Main project information
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT,
    path TEXT NOT NULL,
    active_in_project BOOLEAN DEFAULT true,
    folder_structure TEXT, -- JSON
    dependencies TEXT, -- JSON
    configuration TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Files table - All project files with metadata
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- js, jsx, ts, tsx, css, json, etc.
    project_id TEXT,
    size INTEGER,
    checksum TEXT,
    is_component BOOLEAN DEFAULT false,
    is_entry_point BOOLEAN DEFAULT false,
    last_modified DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);

-- Components table - React/JS components
CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    component_name TEXT NOT NULL,
    component_type TEXT, -- functional, class, hook, utility
    export_type TEXT, -- default, named, both
    props_interface TEXT, -- JSON schema of props
    state_variables TEXT, -- JSON array of state variables
    hooks_used TEXT, -- JSON array of hooks
    description TEXT,
    complexity_score REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files (id)
);

-- Imports table - All import statements
CREATE TABLE IF NOT EXISTS imports (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    import_statement TEXT NOT NULL, -- Full import statement
    import_type TEXT, -- default, named, namespace, side-effect
    imported_items TEXT, -- JSON array of imported items
    source_path TEXT NOT NULL, -- What's being imported from
    is_relative BOOLEAN DEFAULT false,
    is_external BOOLEAN DEFAULT false, -- npm package vs local file
    line_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files (id)
);

-- Dependencies table - File-to-file relationships
CREATE TABLE IF NOT EXISTS dependencies (
    id TEXT PRIMARY KEY,
    source_file_id TEXT NOT NULL,
    target_file_id TEXT,
    dependency_type TEXT, -- import, export, reference
    import_statement TEXT,
    line_number INTEGER,
    is_relative BOOLEAN DEFAULT false,
    strength REAL DEFAULT 1.0, -- How critical this dependency is
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_file_id) REFERENCES files (id),
    FOREIGN KEY (target_file_id) REFERENCES files (id)
);

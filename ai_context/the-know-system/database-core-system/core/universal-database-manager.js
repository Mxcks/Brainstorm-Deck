/**
 * Universal Database Core System
 * Portable, project-agnostic database management system
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class UniversalDatabaseManager {
  constructor(options = {}) {
    this.basePath = options.basePath || './databases';
    this.projectName = options.projectName || 'universal-project';
    this.connections = new Map();
    this.schemas = new Map();
    this.isInitialized = false;
    
    // Core database categories (project-agnostic)
    this.coreCategories = [
      'projects',
      'templates', 
      'reports',
      'tasks',
      'users',
      'files',
      'metadata'
    ];
  }

  /**
   * Initialize the database system
   */
  async initialize() {
    try {
      console.log(' Initializing Universal Database System...');
      
      // Ensure base directory exists
      await fs.ensureDir(this.basePath);
      
      // Initialize core databases
      await this.initializeCoreCategories();
      
      this.isInitialized = true;
      console.log(' Universal Database System initialized successfully');
      
      return true;
    } catch (error) {
      console.error(' Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize core database categories
   */
  async initializeCoreCategories() {
    for (const category of this.coreCategories) {
      try {
        await this.createCategoryDatabase(category);
        console.log(` Database category initialized: ${category}`);
      } catch (error) {
        console.error(` Failed to initialize ${category}:`, error.message);
      }
    }
  }

  /**
   * Create a database for a specific category
   */
  async createCategoryDatabase(category) {
    const dbPath = path.join(this.basePath, `${category}.db`);
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Store connection
        this.connections.set(category, db);
        
        // Create standard schema for this category
        this.createStandardSchema(db, category)
          .then(() => resolve(db))
          .catch(reject);
      });
    });
  }

  /**
   * Create standard schema for a category
   */
  async createStandardSchema(db, category) {
    const schema = this.getSchemaForCategory(category);
    
    return new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) {
          reject(err);
        } else {
          this.schemas.set(category, schema);
          resolve();
        }
      });
    });
  }

  /**
   * Get schema definition for a category
   */
  getSchemaForCategory(category) {
    const baseFields = `
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      metadata TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    `;

    const categorySpecificFields = {
      projects: `
        project_type TEXT,
        path TEXT,
        active_in_project BOOLEAN DEFAULT false,
        folder_structure TEXT,
        dependencies TEXT,
        configuration TEXT
      `,
      templates: `
        template_type TEXT,
        category TEXT,
        content TEXT,
        usage_count INTEGER DEFAULT 0,
        success_rating REAL DEFAULT 0.0,
        tags TEXT
      `,
      reports: `
        report_type TEXT,
        project_id TEXT,
        template_id TEXT,
        content TEXT,
        verification_status TEXT DEFAULT 'pending',
        generated_by TEXT
      `,
      tasks: `
        project_id TEXT,
        task_type TEXT,
        priority TEXT DEFAULT 'medium',
        assigned_to TEXT,
        due_date DATETIME,
        completed BOOLEAN DEFAULT false,
        dependencies TEXT
      `,
      users: `
        user_type TEXT,
        profile_data TEXT,
        preferences TEXT,
        behavior_tracking BOOLEAN DEFAULT true,
        last_active DATETIME
      `,
      files: `
        file_path TEXT,
        file_type TEXT,
        project_id TEXT,
        size INTEGER,
        checksum TEXT,
        relationships TEXT
      `,
      metadata: `
        entity_type TEXT,
        entity_id TEXT,
        key_name TEXT,
        value_data TEXT,
        data_type TEXT DEFAULT 'string'
      `
    };

    const specificFields = categorySpecificFields[category] || '';
    
    return `
      CREATE TABLE IF NOT EXISTS ${category} (
        ${baseFields}${specificFields ? ',' + specificFields : ''}
      );
      
      CREATE INDEX IF NOT EXISTS idx_${category}_name ON ${category}(name);
      CREATE INDEX IF NOT EXISTS idx_${category}_status ON ${category}(status);
      CREATE INDEX IF NOT EXISTS idx_${category}_created ON ${category}(created_at);
    `;
  }

  /**
   * Get database connection for category
   */
  getConnection(category) {
    if (!this.connections.has(category)) {
      throw new Error(`Database connection not found for category: ${category}`);
    }
    return this.connections.get(category);
  }

  /**
   * Create a new record in any category
   */
  async create(category, data) {
    const db = this.getConnection(category);
    const id = data.id || this.generateId();
    
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO ${category} (id, ${fields}, updated_at)
        VALUES (?, ${placeholders}, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([id, ...values], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...data });
        }
      });
      
      stmt.finalize();
    });
  }

  /**
   * Read records from any category
   */
  async read(category, filters = {}) {
    const db = this.getConnection(category);
    
    let query = `SELECT * FROM ${category}`;
    const conditions = [];
    const values = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      conditions.push(`${key} = ?`);
      values.push(value);
    });
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY updated_at DESC`;
    
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Update records in any category
   */
  async update(category, id, data) {
    const db = this.getConnection(category);
    
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        UPDATE ${category} 
        SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...data, changes: this.changes });
        }
      });
      
      stmt.finalize();
    });
  }

  /**
   * Delete records from any category
   */
  async delete(category, id) {
    const db = this.getConnection(category);
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`DELETE FROM ${category} WHERE id = ?`);
      
      stmt.run([id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
      
      stmt.finalize();
    });
  }

  /**
   * Execute custom query
   */
  async query(category, sql, params = []) {
    const db = this.getConnection(category);
    
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const stats = {
      categories: this.coreCategories.length,
      connections: this.connections.size,
      databases: {}
    };
    
    for (const category of this.coreCategories) {
      try {
        const records = await this.read(category);
        stats.databases[category] = {
          records: records.length,
          status: 'active'
        };
      } catch (error) {
        stats.databases[category] = {
          records: 0,
          status: 'error',
          error: error.message
        };
      }
    }
    
    return stats;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Close all database connections
   */
  async close() {
    const promises = [];
    
    this.connections.forEach((db, category) => {
      promises.push(new Promise((resolve) => {
        db.close((err) => {
          if (err) {
            console.error(`Error closing ${category} database:`, err);
          }
          resolve();
        });
      }));
    });
    
    await Promise.all(promises);
    this.connections.clear();
    console.log(' All database connections closed');
  }

  /**
   * Backup entire system
   */
  async backup(backupPath) {
    const backupDir = path.join(backupPath, `backup-${Date.now()}`);
    await fs.ensureDir(backupDir);
    
    for (const category of this.coreCategories) {
      const sourcePath = path.join(this.basePath, `${category}.db`);
      const targetPath = path.join(backupDir, `${category}.db`);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }
    
    console.log(` Database backup created: ${backupDir}`);
    return backupDir;
  }
}

module.exports = UniversalDatabaseManager;

// If run directly, demonstrate the system
if (require.main === module) {
  (async () => {
    const dbManager = new UniversalDatabaseManager({
      basePath: './demo-databases',
      projectName: 'demo-project'
    });
    
    await dbManager.initialize();
    
    // Demo operations
    console.log('\n System Statistics:');
    const stats = await dbManager.getSystemStats();
    console.log(JSON.stringify(stats, null, 2));
    
    // Create sample project
    await dbManager.create('projects', {
      name: 'Sample Project',
      description: 'Demo project for testing',
      project_type: 'web-application'
    });
    
    // Read projects
    const projects = await dbManager.read('projects');
    console.log('\n Projects:', projects);
    
    await dbManager.close();
  })();
}

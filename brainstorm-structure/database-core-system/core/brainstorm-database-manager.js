/**
 * Brainstorm Deck Database Manager
 * Adapted from The Know's Universal Database Core System
 * Specialized for Brainstorm Deck workflow management
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class BrainstormDatabaseManager {
  constructor(options = {}) {
    this.basePath = options.basePath || './brainstorm-structure/database-core-system/databases';
    this.projectName = options.projectName || 'brainstorm-deck';
    this.connections = new Map();
    this.schemas = new Map();
    this.isInitialized = false;
    
    // Core database categories for Brainstorm Deck
    this.coreCategories = [
      'projects',      // Brainstorm projects and Visual Canvas projects
      'brainstorms',   // Individual brainstorm sessions and files
      'components',    // Visual Canvas components and their data
      'templates',     // Brainstorm templates and component templates
      'workflows',     // Processing workflows and their states
      'outputs',       // Generated outputs and deliverables
      'metadata'       // System settings, user preferences, canvas states
    ];
  }

  /**
   * Initialize the database system
   */
  async initialize() {
    try {
      console.log('🧠 Initializing Brainstorm Deck Database System...');
      
      // Ensure base directory exists
      await fs.ensureDir(this.basePath);
      
      // Initialize core databases
      await this.initializeCoreCategories();
      
      this.isInitialized = true;
      console.log('✅ Brainstorm Deck Database System initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
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
        console.log(`📊 Database category initialized: ${category}`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${category}:`, error.message);
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
        project_type TEXT DEFAULT 'brainstorm',
        canvas_state TEXT,
        workflow_stage TEXT DEFAULT 'brainstorming',
        source_brainstorm_id TEXT,
        output_path TEXT,
        configuration TEXT
      `,
      brainstorms: `
        brainstorm_type TEXT DEFAULT 'general',
        content TEXT,
        processing_stage TEXT DEFAULT 'raw',
        project_id TEXT,
        file_path TEXT,
        tags TEXT
      `,
      components: `
        component_type TEXT,
        project_id TEXT,
        canvas_position TEXT,
        component_data TEXT,
        visual_properties TEXT,
        parent_component_id TEXT
      `,
      templates: `
        template_type TEXT,
        category TEXT DEFAULT 'brainstorm',
        content TEXT,
        usage_count INTEGER DEFAULT 0,
        success_rating REAL DEFAULT 0.0,
        tags TEXT,
        framework_type TEXT
      `,
      workflows: `
        workflow_type TEXT,
        project_id TEXT,
        current_stage TEXT,
        stage_data TEXT,
        completion_percentage REAL DEFAULT 0.0,
        next_actions TEXT
      `,
      outputs: `
        output_type TEXT,
        project_id TEXT,
        workflow_id TEXT,
        file_path TEXT,
        content TEXT,
        delivery_status TEXT DEFAULT 'pending'
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
      ${category === 'components' ? 'CREATE INDEX IF NOT EXISTS idx_components_project ON components(project_id);' : ''}
      ${category === 'brainstorms' ? 'CREATE INDEX IF NOT EXISTS idx_brainstorms_project ON brainstorms(project_id);' : ''}
      ${category === 'workflows' ? 'CREATE INDEX IF NOT EXISTS idx_workflows_project ON workflows(project_id);' : ''}
      ${category === 'outputs' ? 'CREATE INDEX IF NOT EXISTS idx_outputs_project ON outputs(project_id);' : ''}
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
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
   * Execute custom SQL query
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
   * Get system health status
   */
  async getSystemHealth() {
    const health = {
      status: 'healthy',
      databases: {},
      totalRecords: 0,
      lastCheck: new Date().toISOString()
    };

    for (const category of this.coreCategories) {
      try {
        const records = await this.read(category);
        health.databases[category] = {
          status: 'connected',
          recordCount: records.length,
          lastRecord: records[0]?.updated_at || null
        };
        health.totalRecords += records.length;
      } catch (error) {
        health.databases[category] = {
          status: 'error',
          error: error.message
        };
        health.status = 'degraded';
      }
    }

    return health;
  }

  /**
   * Close all database connections
   */
  async close() {
    const promises = [];

    for (const [category, db] of this.connections) {
      promises.push(new Promise((resolve) => {
        db.close((err) => {
          if (err) {
            console.error(`Error closing ${category} database:`, err);
          }
          resolve();
        });
      }));
    }

    await Promise.all(promises);
    this.connections.clear();
    this.isInitialized = false;
    console.log('🔒 All database connections closed');
  }

  /**
   * Brainstorm Deck specific helper methods
   */

  // Project management helpers
  async createProject(projectData) {
    const project = {
      name: projectData.name,
      description: projectData.description || '',
      project_type: projectData.project_type || 'brainstorm',
      canvas_state: JSON.stringify(projectData.canvas_state || {}),
      workflow_stage: 'brainstorming',
      configuration: JSON.stringify(projectData.configuration || {})
    };

    return await this.create('projects', project);
  }

  async getProjectWithComponents(projectId) {
    const project = await this.read('projects', { id: projectId });
    if (project.length === 0) return null;

    const components = await this.read('components', { project_id: projectId });
    const brainstorms = await this.read('brainstorms', { project_id: projectId });
    const workflows = await this.read('workflows', { project_id: projectId });

    return {
      ...project[0],
      canvas_state: JSON.parse(project[0].canvas_state || '{}'),
      components,
      brainstorms,
      workflows
    };
  }

  // Component management helpers
  async createComponent(componentData) {
    const component = {
      name: componentData.name,
      description: componentData.description || '',
      component_type: componentData.component_type,
      project_id: componentData.project_id,
      canvas_position: JSON.stringify(componentData.canvas_position || { x: 0, y: 0 }),
      component_data: JSON.stringify(componentData.component_data || {}),
      visual_properties: JSON.stringify(componentData.visual_properties || {}),
      parent_component_id: componentData.parent_component_id || null
    };

    return await this.create('components', component);
  }

  async updateComponentPosition(componentId, position) {
    return await this.update('components', componentId, {
      canvas_position: JSON.stringify(position)
    });
  }

  // Brainstorm management helpers
  async createBrainstorm(brainstormData) {
    const brainstorm = {
      name: brainstormData.name,
      description: brainstormData.description || '',
      brainstorm_type: brainstormData.brainstorm_type || 'general',
      content: brainstormData.content || '',
      processing_stage: 'raw',
      project_id: brainstormData.project_id || null,
      file_path: brainstormData.file_path || null,
      tags: JSON.stringify(brainstormData.tags || [])
    };

    return await this.create('brainstorms', brainstorm);
  }

  // Workflow management helpers
  async createWorkflow(workflowData) {
    const workflow = {
      name: workflowData.name,
      description: workflowData.description || '',
      workflow_type: workflowData.workflow_type,
      project_id: workflowData.project_id,
      current_stage: workflowData.current_stage || 'initial',
      stage_data: JSON.stringify(workflowData.stage_data || {}),
      completion_percentage: 0.0,
      next_actions: JSON.stringify(workflowData.next_actions || [])
    };

    return await this.create('workflows', workflow);
  }

  async updateWorkflowProgress(workflowId, stage, percentage, nextActions = []) {
    return await this.update('workflows', workflowId, {
      current_stage: stage,
      completion_percentage: percentage,
      next_actions: JSON.stringify(nextActions)
    });
  }
}

module.exports = BrainstormDatabaseManager;

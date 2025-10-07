// Project Template Service
// Handles template selection, application, and management

const fs = require('fs');
const path = require('path');

class ProjectTemplateService {
  constructor(databaseService) {
    this.db = databaseService;
    this.templatesPath = path.join(__dirname, 'project-templates');
    this.coreTemplatesFile = path.join(this.templatesPath, 'core-templates.json');
  }

  async initialize() {
    try {
      // Ensure templates directory exists
      if (!fs.existsSync(this.templatesPath)) {
        fs.mkdirSync(this.templatesPath, { recursive: true });
      }

      // Load core templates into database
      await this.loadCoreTemplates();
      console.log('✅ Project Template Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Project Template Service:', error);
      throw error;
    }
  }

  async loadCoreTemplates() {
    if (!fs.existsSync(this.coreTemplatesFile)) {
      console.log('⚠️ Core templates file not found, skipping template loading');
      return;
    }

    try {
      const templatesData = JSON.parse(fs.readFileSync(this.coreTemplatesFile, 'utf8'));
      const templates = templatesData.templateLibrary.templates;

      for (const template of templates) {
        await this.saveTemplate(template);
      }

      console.log(`✅ Loaded ${templates.length} core project templates`);
    } catch (error) {
      console.error('❌ Failed to load core templates:', error);
    }
  }

  async saveTemplate(templateData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.db.prepare(`
        INSERT OR REPLACE INTO project_templates (
          id, name, category, description, difficulty, estimated_setup_time,
          framework, tech_stack, file_structure, workflow_patterns, 
          success_metrics, required_files, configuration_options,
          is_active, usage_count, success_rate, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run([
        templateData.id,
        templateData.name,
        templateData.category,
        templateData.description,
        templateData.difficulty,
        templateData.estimatedSetupTime,
        templateData.framework,
        JSON.stringify(templateData.techStack),
        JSON.stringify(templateData.fileStructure),
        JSON.stringify(templateData.workflowPatterns),
        JSON.stringify(templateData.successMetrics),
        JSON.stringify(templateData.requiredFiles),
        JSON.stringify(templateData.configurationOptions),
        true, // is_active
        templateData.usageCount || 0,
        templateData.successRate || 0.0
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: templateData.id, changes: this.changes });
        }
      });

      stmt.finalize();
    });
  }

  async getTemplates(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM project_templates WHERE is_active = 1';
      const params = [];

      // Add filters
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.difficulty) {
        query += ' AND difficulty = ?';
        params.push(filters.difficulty);
      }

      if (filters.framework) {
        query += ' AND framework = ?';
        params.push(filters.framework);
      }

      // Add ordering
      query += ' ORDER BY usage_count DESC, success_rate DESC, name ASC';

      this.db.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields
          const templates = rows.map(row => ({
            ...row,
            techStack: JSON.parse(row.tech_stack || '[]'),
            fileStructure: JSON.parse(row.file_structure || '{}'),
            workflowPatterns: JSON.parse(row.workflow_patterns || '{}'),
            successMetrics: JSON.parse(row.success_metrics || '{}'),
            requiredFiles: JSON.parse(row.required_files || '[]'),
            configurationOptions: JSON.parse(row.configuration_options || '{}')
          }));
          resolve(templates);
        }
      });
    });
  }

  async getTemplateById(templateId) {
    return new Promise((resolve, reject) => {
      this.db.db.get(
        'SELECT * FROM project_templates WHERE id = ? AND is_active = 1',
        [templateId],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            // Parse JSON fields
            const template = {
              ...row,
              techStack: JSON.parse(row.tech_stack || '[]'),
              fileStructure: JSON.parse(row.file_structure || '{}'),
              workflowPatterns: JSON.parse(row.workflow_patterns || '{}'),
              successMetrics: JSON.parse(row.success_metrics || '{}'),
              requiredFiles: JSON.parse(row.required_files || '[]'),
              configurationOptions: JSON.parse(row.configuration_options || '{}')
            };
            resolve(template);
          }
        }
      );
    });
  }

  async applyTemplateToProject(projectId, templateId, configuration = {}) {
    try {
      // Get template details
      const template = await this.getTemplateById(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Get project details
      const project = await this.db.getProjectById(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Record template application
      const applicationId = await this.recordTemplateApplication(
        projectId, 
        templateId, 
        configuration
      );

      // Apply template structure (this would create files/folders in real implementation)
      const applicationResult = await this.createProjectStructure(
        project.path, 
        template, 
        configuration
      );

      // Update template usage count
      await this.incrementTemplateUsage(templateId);

      console.log(`✅ Applied template ${template.name} to project ${project.name}`);
      
      return {
        applicationId,
        template,
        project,
        configuration,
        result: applicationResult
      };

    } catch (error) {
      console.error('❌ Failed to apply template:', error);
      throw error;
    }
  }

  async recordTemplateApplication(projectId, templateId, configuration) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.db.prepare(`
        INSERT INTO project_template_applications (
          project_id, template_id, configuration_used, is_active
        ) VALUES (?, ?, ?, ?)
      `);

      stmt.run([
        projectId,
        templateId,
        JSON.stringify(configuration),
        true
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });

      stmt.finalize();
    });
  }

  async createProjectStructure(projectPath, template, configuration) {
    // This is a simplified version - in real implementation would create actual files
    const structure = {
      created: [],
      modified: [],
      errors: []
    };

    try {
      // Create base directories from template file structure
      const fileStructure = template.fileStructure;
      
      for (const [folderName, folderContent] of Object.entries(fileStructure)) {
        const folderPath = path.join(projectPath, folderName);
        
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
          structure.created.push(folderName);
        }

        // If folderContent is an object, create subfolders
        if (typeof folderContent === 'object' && folderContent !== null) {
          for (const subFolder of Object.keys(folderContent)) {
            const subFolderPath = path.join(folderPath, subFolder);
            if (!fs.existsSync(subFolderPath)) {
              fs.mkdirSync(subFolderPath, { recursive: true });
              structure.created.push(`${folderName}/${subFolder}`);
            }
          }
        }
      }

      // Create required files (placeholder implementation)
      for (const fileName of template.requiredFiles) {
        const filePath = path.join(projectPath, fileName);
        if (!fs.existsSync(filePath)) {
          // Create placeholder file with basic content
          const content = this.generateFileContent(fileName, template);
          fs.writeFileSync(filePath, content, 'utf8');
          structure.created.push(fileName);
        }
      }

    } catch (error) {
      structure.errors.push(error.message);
    }

    return structure;
  }

  generateFileContent(fileName, template) {
    // Generate basic file content based on file type and template
    if (fileName === 'README.md') {
      return `# ${template.name}\n\n${template.description}\n\n## Tech Stack\n${template.techStack.map(tech => `- ${tech}`).join('\n')}\n\n## Getting Started\n\nThis project was created using the ${template.name} template.\n`;
    }
    
    if (fileName === 'package.json' && template.techStack.includes('node.js')) {
      return JSON.stringify({
        name: template.name.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        description: template.description,
        main: "index.js",
        scripts: {
          start: "node index.js"
        }
      }, null, 2);
    }

    return `// ${fileName}\n// Generated from ${template.name} template\n\n`;
  }

  async incrementTemplateUsage(templateId) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.db.prepare(`
        UPDATE project_templates 
        SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run([templateId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });

      stmt.finalize();
    });
  }

  async getTemplateCategories() {
    return new Promise((resolve, reject) => {
      this.db.db.all(
        'SELECT DISTINCT category FROM project_templates WHERE is_active = 1 ORDER BY category',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => row.category));
          }
        }
      );
    });
  }

  async getTemplateStats() {
    return new Promise((resolve, reject) => {
      this.db.db.get(`
        SELECT 
          COUNT(*) as total_templates,
          AVG(usage_count) as avg_usage,
          AVG(success_rate) as avg_success_rate,
          COUNT(DISTINCT category) as categories_count
        FROM project_templates 
        WHERE is_active = 1
      `, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = ProjectTemplateService;

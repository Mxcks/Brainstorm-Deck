#!/usr/bin/env node

/**
 * Database Query Tool for The Know Analysis Databases
 * Explore and query the 4 specialized databases created by the project analyzer
 */

const UniversalDatabaseManager = require('./database-core-system/core/universal-database-manager');

class DatabaseQueryTool {
  constructor() {
    this.databases = {
      'the-know-intelligence': null,
      'template-system': null,
      'database-core': null,
      'peanut-butter-user': null,
      'report-system': null
    };
  }

  /**
   * Initialize connections to all analysis databases
   */
  async initialize() {
    console.log('🔌 Connecting to analysis databases...\n');
    
    for (const [systemName, _] of Object.entries(this.databases)) {
      try {
        const dbManager = new UniversalDatabaseManager({
          basePath: `./analysis-databases/${systemName}`,
          projectName: systemName
        });
        
        await dbManager.initialize();
        this.databases[systemName] = dbManager;
        console.log(`   ✓ Connected to ${systemName}`);
      } catch (error) {
        console.log(`   ❌ Failed to connect to ${systemName}: ${error.message}`);
      }
    }
  }

  /**
   * Show overview of all databases
   */
  async showOverview() {
    console.log('\n📊 Database Overview\n');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      console.log(`🗄️  ${systemName.toUpperCase()}`);
      
      try {
        const stats = await db.getSystemStats();
        
        for (const [category, info] of Object.entries(stats.databases)) {
          console.log(`   ${category}: ${info.records} records`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`   Error getting stats: ${error.message}\n`);
      }
    }
  }

  /**
   * Show projects in each system
   */
  async showProjects() {
    console.log('📋 Projects in Each System\n');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      try {
        const projects = await db.read('projects');
        
        console.log(`🔹 ${systemName.toUpperCase()}`);
        for (const project of projects) {
          console.log(`   • ${project.name}`);
          console.log(`     Type: ${project.project_type}`);
          console.log(`     Status: ${project.status}`);
          if (project.metadata) {
            const meta = JSON.parse(project.metadata);
            if (meta.file_count) console.log(`     Files: ${meta.file_count}`);
          }
          console.log('');
        }
      } catch (error) {
        console.log(`   Error reading projects: ${error.message}\n`);
      }
    }
  }

  /**
   * Show templates in each system
   */
  async showTemplates() {
    console.log('📝 Templates in Each System\n');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      try {
        const templates = await db.read('templates');
        
        if (templates.length > 0) {
          console.log(`🔹 ${systemName.toUpperCase()}`);
          for (const template of templates) {
            console.log(`   • ${template.name}`);
            console.log(`     Type: ${template.template_type}`);
            console.log(`     Category: ${template.category || 'N/A'}`);
            if (template.tags) console.log(`     Tags: ${template.tags}`);
            console.log('');
          }
        }
      } catch (error) {
        console.log(`   Error reading templates: ${error.message}\n`);
      }
    }
  }

  /**
   * Show files by system
   */
  async showFiles() {
    console.log('📁 Files by System\n');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      try {
        const files = await db.read('files');
        
        if (files.length > 0) {
          console.log(`🔹 ${systemName.toUpperCase()} (${files.length} files)`);
          
          // Group by file type
          const filesByType = {};
          for (const file of files) {
            if (!filesByType[file.file_type]) filesByType[file.file_type] = [];
            filesByType[file.file_type].push(file);
          }
          
          for (const [type, typeFiles] of Object.entries(filesByType)) {
            console.log(`   ${type}: ${typeFiles.length} files`);
            for (const file of typeFiles.slice(0, 3)) { // Show first 3
              console.log(`     • ${file.name}`);
            }
            if (typeFiles.length > 3) {
              console.log(`     ... and ${typeFiles.length - 3} more`);
            }
          }
          console.log('');
        }
      } catch (error) {
        console.log(`   Error reading files: ${error.message}\n`);
      }
    }
  }

  /**
   * Show cross-system relationships
   */
  async showRelationships() {
    console.log('🔗 Cross-System Relationships\n');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      try {
        const metadata = await db.read('metadata', { key_name: 'cross_system_relationships' });
        
        if (metadata.length > 0) {
          console.log(`🔹 ${systemName.toUpperCase()}`);
          const relationships = JSON.parse(metadata[0].value_data);
          console.log(`   Integrates with: ${relationships.integrates_with.join(', ')}`);
          console.log(`   Analysis date: ${relationships.analysis_date}`);
          console.log(`   Total project files: ${relationships.total_files}`);
          console.log('');
        }
      } catch (error) {
        console.log(`   Error reading relationships: ${error.message}\n`);
      }
    }
  }

  /**
   * Show analysis reports
   */
  async showReports() {
    console.log('📊 Analysis Reports\n');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      try {
        const reports = await db.read('reports', { report_type: 'project-analysis' });
        
        if (reports.length > 0) {
          console.log(`🔹 ${systemName.toUpperCase()}`);
          for (const report of reports) {
            console.log(`   • ${report.name}`);
            console.log(`     Generated by: ${report.generated_by}`);
            console.log(`     Created: ${report.created_at}`);
            
            if (report.content) {
              const content = JSON.parse(report.content);
              console.log(`     Total files analyzed: ${content.total_files}`);
              console.log(`     Systems analyzed: ${content.systems_analyzed}`);
            }
            console.log('');
          }
        }
      } catch (error) {
        console.log(`   Error reading reports: ${error.message}\n`);
      }
    }
  }

  /**
   * Custom query interface
   */
  async customQuery(systemName, category, query, params = []) {
    if (!this.databases[systemName]) {
      console.log(`❌ System '${systemName}' not found`);
      return;
    }
    
    try {
      const results = await this.databases[systemName].query(category, query, params);
      console.log(`\n🔍 Query Results for ${systemName}/${category}:`);
      console.log(JSON.stringify(results, null, 2));
    } catch (error) {
      console.log(`❌ Query failed: ${error.message}`);
    }
  }

  /**
   * Close all database connections
   */
  async close() {
    for (const db of Object.values(this.databases)) {
      if (db) await db.close();
    }
  }

  /**
   * Interactive CLI
   */
  async runInteractive() {
    await this.initialize();
    
    console.log('🔍 The Know Database Query Tool');
    console.log('Available commands:');
    console.log('  overview  - Show database overview');
    console.log('  projects  - Show all projects');
    console.log('  templates - Show all templates');
    console.log('  files     - Show files by system');
    console.log('  relationships - Show cross-system relationships');
    console.log('  reports   - Show analysis reports');
    console.log('  all       - Show everything');
    console.log('');
    
    const command = process.argv[3] || 'all';
    
    switch (command) {
      case 'overview':
        await this.showOverview();
        break;
      case 'projects':
        await this.showProjects();
        break;
      case 'templates':
        await this.showTemplates();
        break;
      case 'files':
        await this.showFiles();
        break;
      case 'relationships':
        await this.showRelationships();
        break;
      case 'reports':
        await this.showReports();
        break;
      case 'all':
      default:
        await this.showOverview();
        await this.showProjects();
        await this.showTemplates();
        await this.showFiles();
        await this.showRelationships();
        await this.showReports();
        break;
    }
    
    await this.close();
  }

  /**
   * Static runner
   */
  static async run() {
    const tool = new DatabaseQueryTool();
    await tool.runInteractive();
  }
}

// Run if called directly
if (require.main === module) {
  DatabaseQueryTool.run().catch(console.error);
}

module.exports = DatabaseQueryTool;

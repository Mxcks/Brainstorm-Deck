#!/usr/bin/env node

/**
 * The Know Project Analyzer
 * Analyzes all files in The Know project and creates specialized databases for each system
 */

const UniversalDatabaseManager = require('./database-core-system/core/universal-database-manager');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class TheKnowProjectAnalyzer {
  constructor() {
    this.projectRoot = './';
    this.databases = {
      'the-know-intelligence': null,
      'template-system': null,
      'database-core': null,
      'peanut-butter-user': null,
      'report-system': null
    };
    this.analysisResults = {
      files: [],
      systems: {},
      relationships: [],
      metadata: {}
    };
  }

  /**
   * Main analysis function
   */
  async analyzeProject() {
    try {
      console.log('🔍 Starting The Know Project Analysis...\n');
      
      // Initialize databases for each system
      await this.initializeDatabases();
      
      // Scan all files in the project
      await this.scanProjectFiles();
      
      // Analyze each system
      await this.analyzeTheKnowIntelligence();
      await this.analyzeTemplateSystem();
      await this.analyzeDatabaseCore();
      await this.analyzePeanutButterUser();
      await this.analyzeReportSystem();
      
      // Create cross-system relationships
      await this.createSystemRelationships();
      
      // Generate analysis report
      await this.generateAnalysisReport();
      
      console.log('✅ The Know Project Analysis Complete!\n');
      console.log('📊 4 specialized databases created:');
      console.log('   - the-know-intelligence.db');
      console.log('   - template-system.db');
      console.log('   - database-core.db');
      console.log('   - peanut-butter-user.db');
      
      return this.analysisResults;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    } finally {
      await this.closeDatabases();
    }
  }

  /**
   * Initialize specialized databases for each system
   */
  async initializeDatabases() {
    console.log('🗄️  Initializing specialized databases...');
    
    for (const [systemName, _] of Object.entries(this.databases)) {
      const dbManager = new UniversalDatabaseManager({
        basePath: `./analysis-databases/${systemName}`,
        projectName: systemName
      });
      
      await dbManager.initialize();
      this.databases[systemName] = dbManager;
      console.log(`   ✓ ${systemName} database initialized`);
    }
  }

  /**
   * Scan all project files and categorize them
   */
  async scanProjectFiles() {
    console.log('\n📁 Scanning project files...');
    
    const files = await this.getAllFiles(this.projectRoot);
    
    for (const filePath of files) {
      if (this.shouldSkipFile(filePath)) continue;
      
      const fileInfo = await this.analyzeFile(filePath);
      this.analysisResults.files.push(fileInfo);
    }
    
    console.log(`   ✓ Analyzed ${this.analysisResults.files.length} files`);
  }

  /**
   * Get all files recursively
   */
  async getAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        if (!this.shouldSkipDirectory(item)) {
          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        }
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath) {
    const stat = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf8').catch(() => null);
    const ext = path.extname(filePath);
    
    const fileInfo = {
      path: filePath,
      name: path.basename(filePath),
      extension: ext,
      size: stat.size,
      created: stat.birthtime,
      modified: stat.mtime,
      system: this.categorizeFileBySystem(filePath),
      type: this.getFileType(filePath, content),
      content_preview: content ? content.substring(0, 500) : null,
      metadata: this.extractFileMetadata(filePath, content)
    };
    
    return fileInfo;
  }

  /**
   * Categorize file by system
   */
  categorizeFileBySystem(filePath) {
    if (filePath.includes('peanut-butter-user')) return 'peanut-butter-user';
    if (filePath.includes('templates/')) return 'template-system';
    if (filePath.includes('database-core-system')) return 'database-core';
    if (filePath.includes('report-system')) return 'report-system';
    if (filePath.includes('the_know') || filePath.includes('available_triggers') || filePath.includes('briefing')) {
      return 'the-know-intelligence';
    }
    return 'general';
  }

  /**
   * Get file type based on extension and content
   */
  getFileType(filePath, content) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.yaml' || ext === '.yml') return 'yaml-template';
    if (ext === '.md') return 'markdown-documentation';
    if (ext === '.json') return 'json-configuration';
    if (ext === '.js') return 'javascript-code';
    if (ext === '.db') return 'sqlite-database';
    
    if (content) {
      if (content.includes('template_metadata:')) return 'yaml-template';
      if (content.includes('# ') && content.includes('##')) return 'markdown-documentation';
      if (content.startsWith('{') && content.includes('"')) return 'json-configuration';
    }
    
    return 'unknown';
  }

  /**
   * Extract metadata from file content
   */
  extractFileMetadata(filePath, content) {
    const metadata = {};
    
    if (!content) return metadata;
    
    // Extract YAML template metadata
    if (content.includes('template_metadata:')) {
      try {
        const yamlData = yaml.load(content);
        if (yamlData.template_metadata) {
          metadata.template_id = yamlData.template_metadata.template_id;
          metadata.template_name = yamlData.template_metadata.template_name;
          metadata.template_type = yamlData.template_metadata.template_type;
          metadata.version = yamlData.template_metadata.version;
          metadata.tags = yamlData.template_metadata.tags;
        }
      } catch (error) {
        // Ignore YAML parsing errors
      }
    }
    
    // Extract markdown headers
    if (content.includes('# ')) {
      const headers = content.match(/^#+\s+(.+)$/gm);
      if (headers) {
        metadata.headers = headers.slice(0, 5); // First 5 headers
      }
    }
    
    // Extract JSON structure
    if (content.startsWith('{')) {
      try {
        const jsonData = JSON.parse(content);
        if (jsonData.system) metadata.system_info = jsonData.system;
        if (jsonData.user_profile) metadata.has_user_profile = true;
        if (jsonData.triggers) metadata.trigger_count = Object.keys(jsonData.triggers).length;
      } catch (error) {
        // Ignore JSON parsing errors
      }
    }
    
    return metadata;
  }

  /**
   * Analyze The Know Intelligence System
   */
  async analyzeTheKnowIntelligence() {
    console.log('\n🧠 Analyzing The Know Intelligence System...');
    
    const db = this.databases['the-know-intelligence'];
    const systemFiles = this.analysisResults.files.filter(f => f.system === 'the-know-intelligence');
    
    // Create project record for The Know Intelligence
    const project = await db.create('projects', {
      name: 'The Know Intelligence System',
      description: 'Sacred AI enhancement framework with transformative knowledge and capabilities',
      project_type: 'ai-enhancement-system',
      status: 'active',
      metadata: JSON.stringify({
        core_components: ['Sacred Intelligence Engine', 'Core Values Framework', 'Trigger System', 'Cross-conversation Continuity'],
        file_count: systemFiles.length
      })
    });
    
    // Store all system files
    for (const file of systemFiles) {
      await db.create('files', {
        name: file.name,
        description: `${file.type} file for The Know Intelligence System`,
        file_path: file.path,
        file_type: file.type,
        project_id: project.id,
        size: file.size,
        relationships: JSON.stringify(file.metadata)
      });
    }
    
    // Store triggers as templates
    if (systemFiles.find(f => f.name.includes('triggers'))) {
      await db.create('templates', {
        name: 'The Know Trigger System',
        description: 'Complete trigger system for AI enhancement',
        template_type: 'trigger-system',
        category: 'ai-enhancement',
        content: JSON.stringify({
          core_triggers: ['list core values', 'add core value', 'HEY YOU JUST MESSED UP', 'add that to the know'],
          system_triggers: ['update briefing script']
        })
      });
    }
    
    console.log(`   ✓ Stored ${systemFiles.length} files and components`);
  }

  /**
   * Analyze Template System
   */
  async analyzeTemplateSystem() {
    console.log('\n📋 Analyzing Template System...');
    
    const db = this.databases['template-system'];
    const systemFiles = this.analysisResults.files.filter(f => f.system === 'template-system');
    
    // Create project record for Template System
    const project = await db.create('projects', {
      name: 'Universal Template System',
      description: 'YAML-based framework system with 5 categories of templates',
      project_type: 'template-framework',
      status: 'active',
      metadata: JSON.stringify({
        categories: ['interaction-frameworks', 'learning-frameworks', 'optimization-frameworks', 'thinking-frameworks', 'project-frameworks'],
        file_count: systemFiles.length
      })
    });
    
    // Store each template as a template record
    for (const file of systemFiles) {
      if (file.type === 'yaml-template') {
        await db.create('templates', {
          name: file.metadata.template_name || file.name,
          description: `${file.metadata.template_type || 'Unknown'} template`,
          template_type: file.metadata.template_type || 'unknown',
          category: path.dirname(file.path).split('/').pop(),
          content: file.content_preview,
          tags: Array.isArray(file.metadata.tags) ? file.metadata.tags.join(',') : ''
        });
      }
      
      await db.create('files', {
        name: file.name,
        description: `Template system file: ${file.type}`,
        file_path: file.path,
        file_type: file.type,
        project_id: project.id,
        size: file.size,
        relationships: JSON.stringify(file.metadata)
      });
    }
    
    console.log(`   ✓ Stored ${systemFiles.length} files and templates`);
  }

  /**
   * Analyze Database Core System
   */
  async analyzeDatabaseCore() {
    console.log('\n🗃️  Analyzing Database Core System...');
    
    const db = this.databases['database-core'];
    const systemFiles = this.analysisResults.files.filter(f => f.system === 'database-core');
    
    // Create project record for Database Core
    const project = await db.create('projects', {
      name: 'Universal Database Core System',
      description: 'Portable, project-agnostic database management with SQLite backend',
      project_type: 'database-system',
      status: 'production-ready',
      metadata: JSON.stringify({
        core_categories: ['projects', 'templates', 'reports', 'tasks', 'users', 'files', 'metadata'],
        features: ['Full CRUD Operations', 'Backup & Restore', 'Custom Queries', 'Zero Configuration'],
        file_count: systemFiles.length
      })
    });
    
    // Store system files
    for (const file of systemFiles) {
      await db.create('files', {
        name: file.name,
        description: `Database core system file: ${file.type}`,
        file_path: file.path,
        file_type: file.type,
        project_id: project.id,
        size: file.size,
        relationships: JSON.stringify(file.metadata)
      });
    }
    
    console.log(`   ✓ Stored ${systemFiles.length} files and components`);
  }

  /**
   * Analyze Peanut Butter User System
   */
  async analyzePeanutButterUser() {
    console.log('\n🥜 Analyzing Peanut Butter User System...');
    
    const db = this.databases['peanut-butter-user'];
    const systemFiles = this.analysisResults.files.filter(f => f.system === 'peanut-butter-user');
    
    // Create project record for pB User System
    const project = await db.create('projects', {
      name: 'Peanut Butter User Personalization System',
      description: 'Complete user personalization framework with personality assessment and folder organization',
      project_type: 'user-personalization',
      status: 'active',
      metadata: JSON.stringify({
        components: ['3-Question Personality Assessment', 'User Folders', 'Handoff Instructions', 'User-Specific Triggers'],
        personality_types: ['Red (Results-Oriented)', 'Yellow (Creative & Social)', 'Green (Steady & Supportive)', 'Blue (Analytical & Thorough)'],
        file_count: systemFiles.length
      })
    });
    
    // Store user system files
    for (const file of systemFiles) {
      await db.create('files', {
        name: file.name,
        description: `pB user system file: ${file.type}`,
        file_path: file.path,
        file_type: file.type,
        project_id: project.id,
        size: file.size,
        relationships: JSON.stringify(file.metadata)
      });
    }
    
    // Create user profile template
    await db.create('templates', {
      name: 'pB User Profile Template',
      description: 'Complete user profile template with personality and preferences',
      template_type: 'user-profile',
      category: 'personalization',
      content: JSON.stringify({
        sections: ['Basic Information', 'Communication Style', 'Learning Style', 'Growth Orientation', 'Work Style Preferences'],
        personality_framework: '4-Type System (Red/Yellow/Green/Blue)'
      })
    });
    
    console.log(`   ✓ Stored ${systemFiles.length} files and components`);
  }

  /**
   * Analyze Report System
   */
  async analyzeReportSystem() {
    console.log('\n📊 Analyzing Report System...');

    const db = this.databases['report-system'];
    const systemFiles = this.analysisResults.files.filter(f => f.system === 'report-system');

    // Create project record for Report System
    const project = await db.create('projects', {
      name: 'Universal Report System',
      description: 'Comprehensive reporting and analytics framework for The Know ecosystem',
      project_type: 'reporting-system',
      status: 'active',
      metadata: JSON.stringify({
        components: ['Report Generator', 'Template Manager', 'Data Aggregator', 'Output Formatter'],
        report_types: ['System Health', 'Usage Analytics', 'Project Progress', 'Executive Summary'],
        output_formats: ['Markdown', 'HTML', 'JSON', 'CSV'],
        file_count: systemFiles.length
      })
    });

    // Store system files
    for (const file of systemFiles) {
      await db.create('files', {
        name: file.name,
        description: `Report system file: ${file.type}`,
        file_path: file.path,
        file_type: file.type,
        project_id: project.id,
        size: file.size,
        relationships: JSON.stringify(file.metadata)
      });
    }

    // Create report templates
    const reportTemplates = systemFiles.filter(f => f.type === 'yaml-template');
    for (const templateFile of reportTemplates) {
      await db.create('templates', {
        name: templateFile.metadata.template_name || templateFile.name,
        description: `Report template: ${templateFile.metadata.template_type || 'Unknown'}`,
        template_type: 'report-template',
        category: 'reporting',
        content: templateFile.content_preview
      });
    }

    console.log(`   ✓ Stored ${systemFiles.length} files and components`);
  }

  /**
   * Create relationships between systems
   */
  async createSystemRelationships() {
    console.log('\n🔗 Creating cross-system relationships...');
    
    // Store relationships in metadata for each system
    for (const [systemName, db] of Object.entries(this.databases)) {
      await db.create('metadata', {
        name: 'System Relationships',
        description: 'Connections to other systems in The Know project',
        entity_type: 'system',
        entity_id: systemName,
        key_name: 'cross_system_relationships',
        value_data: JSON.stringify({
          integrates_with: Object.keys(this.databases).filter(s => s !== systemName),
          analysis_date: new Date().toISOString(),
          total_files: this.analysisResults.files.length
        }),
        data_type: 'json'
      });
    }
    
    console.log('   ✓ Cross-system relationships established');
  }

  /**
   * Generate comprehensive analysis report
   */
  async generateAnalysisReport() {
    const report = {
      analysis_date: new Date().toISOString(),
      project_name: 'The Know - Complete AI Enhancement System',
      total_files: this.analysisResults.files.length,
      systems_analyzed: Object.keys(this.databases).length,
      file_breakdown: {},
      system_summary: {}
    };
    
    // Calculate file breakdown by system
    for (const system of Object.keys(this.databases)) {
      const systemFiles = this.analysisResults.files.filter(f => f.system === system);
      report.file_breakdown[system] = systemFiles.length;
    }
    
    // Save report to each database
    for (const [systemName, db] of Object.entries(this.databases)) {
      await db.create('reports', {
        name: 'The Know Project Analysis Report',
        description: 'Comprehensive analysis of The Know project structure and components',
        report_type: 'project-analysis',
        content: JSON.stringify(report),
        generated_by: 'the-know-project-analyzer'
      });
    }
    
    console.log('\n📊 Analysis Report Generated');
    console.log(`   Total Files: ${report.total_files}`);
    console.log(`   Systems: ${report.systems_analyzed}`);
    console.log('   File Distribution:');
    for (const [system, count] of Object.entries(report.file_breakdown)) {
      console.log(`     ${system}: ${count} files`);
    }
  }

  /**
   * Helper methods
   */
  shouldSkipFile(filePath) {
    const skipPatterns = [
      'node_modules',
      '.git',
      '.db',
      'backup',
      '.log'
    ];
    return skipPatterns.some(pattern => filePath.includes(pattern));
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'backups'];
    return skipDirs.includes(dirName);
  }

  async closeDatabases() {
    for (const db of Object.values(this.databases)) {
      if (db) await db.close();
    }
  }

  /**
   * CLI interface
   */
  static async run() {
    const analyzer = new TheKnowProjectAnalyzer();
    await analyzer.analyzeProject();
  }
}

// Run if called directly
if (require.main === module) {
  TheKnowProjectAnalyzer.run().catch(console.error);
}

module.exports = TheKnowProjectAnalyzer;

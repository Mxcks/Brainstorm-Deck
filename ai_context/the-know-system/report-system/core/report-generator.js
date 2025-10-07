/**
 * Report Generator - Core engine for generating reports across all systems
 */

const UniversalDatabaseManager = require('../../database-core-system/core/universal-database-manager');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class ReportGenerator {
  constructor(options = {}) {
    this.config = options.config || {};
    this.dataSources = {
      'the-know-intelligence': null,
      'template-system': null,
      'database-core': null,
      'peanut-butter-user': null,
      'report-system': null
    };
    this.templates = new Map();
    this.outputFormats = ['markdown', 'json', 'html', 'csv'];
  }

  /**
   * Initialize the report generator
   */
  async initialize() {
    console.log('📊 Initializing Report Generator...');
    
    // Connect to all data sources
    await this.connectDataSources();
    
    // Load report templates
    await this.loadTemplates();
    
    console.log('✅ Report Generator initialized successfully');
  }

  /**
   * Connect to all system databases
   */
  async connectDataSources() {
    for (const [systemName, _] of Object.entries(this.dataSources)) {
      try {
        const dbManager = new UniversalDatabaseManager({
          basePath: `./analysis-databases/${systemName}`,
          projectName: systemName
        });
        
        await dbManager.initialize();
        this.dataSources[systemName] = dbManager;
        console.log(`   ✓ Connected to ${systemName} database`);
      } catch (error) {
        console.log(`   ⚠️  Could not connect to ${systemName}: ${error.message}`);
      }
    }
  }

  /**
   * Load report templates
   */
  async loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates');
    
    if (await fs.pathExists(templatesDir)) {
      const templateFiles = await fs.readdir(templatesDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          try {
            const templatePath = path.join(templatesDir, file);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            const template = yaml.load(templateContent);
            
            const templateName = path.basename(file, path.extname(file));
            this.templates.set(templateName, template);
            console.log(`   ✓ Loaded template: ${templateName}`);
          } catch (error) {
            console.log(`   ⚠️  Failed to load template ${file}: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Generate a report
   */
  async generateReport(templateName, options = {}) {
    console.log(`📋 Generating report: ${templateName}`);
    
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Collect data from specified systems
    const data = await this.collectData(template, options);
    
    // Process data according to template
    const processedData = await this.processData(template, data, options);
    
    // Format output
    const report = await this.formatOutput(template, processedData, options);
    
    // Save report if requested
    if (options.save) {
      await this.saveReport(templateName, report, options);
    }
    
    console.log(`✅ Report '${templateName}' generated successfully`);
    return report;
  }

  /**
   * Collect data from systems based on template requirements
   */
  async collectData(template, options) {
    const data = {};
    const dataSources = template.data_sources || Object.keys(this.dataSources);
    
    for (const systemName of dataSources) {
      if (!this.dataSources[systemName]) continue;
      
      try {
        const db = this.dataSources[systemName];
        
        // Collect basic system stats
        data[systemName] = {
          stats: await db.getSystemStats(),
          projects: await db.read('projects'),
          templates: await db.read('templates'),
          files: await db.read('files'),
          reports: await db.read('reports'),
          metadata: await db.read('metadata')
        };
        
        // Apply any filters from options
        if (options.timeframe) {
          data[systemName] = this.filterByTimeframe(data[systemName], options.timeframe);
        }
        
      } catch (error) {
        console.log(`   ⚠️  Error collecting data from ${systemName}: ${error.message}`);
        data[systemName] = { error: error.message };
      }
    }
    
    return data;
  }

  /**
   * Process collected data according to template logic
   */
  async processData(template, data, options) {
    const processed = {
      metadata: {
        reportName: template.report_metadata?.name || 'Unknown Report',
        generatedAt: new Date().toISOString(),
        timeframe: options.timeframe || 'all-time',
        systems: Object.keys(data)
      },
      summary: {},
      details: {},
      insights: []
    };

    // Calculate summary statistics
    processed.summary = this.calculateSummaryStats(data);
    
    // Process each system's data
    for (const [systemName, systemData] of Object.entries(data)) {
      if (systemData.error) {
        processed.details[systemName] = { error: systemData.error };
        continue;
      }
      
      processed.details[systemName] = {
        projectCount: systemData.projects?.length || 0,
        templateCount: systemData.templates?.length || 0,
        fileCount: systemData.files?.length || 0,
        reportCount: systemData.reports?.length || 0,
        lastActivity: this.getLastActivity(systemData),
        healthStatus: this.assessSystemHealth(systemData)
      };
    }
    
    // Generate insights
    processed.insights = this.generateInsights(data, processed);
    
    return processed;
  }

  /**
   * Calculate summary statistics across all systems
   */
  calculateSummaryStats(data) {
    const summary = {
      totalSystems: 0,
      totalProjects: 0,
      totalTemplates: 0,
      totalFiles: 0,
      totalReports: 0,
      healthySystems: 0
    };
    
    for (const [systemName, systemData] of Object.entries(data)) {
      if (systemData.error) continue;
      
      summary.totalSystems++;
      summary.totalProjects += systemData.projects?.length || 0;
      summary.totalTemplates += systemData.templates?.length || 0;
      summary.totalFiles += systemData.files?.length || 0;
      summary.totalReports += systemData.reports?.length || 0;
      
      if (this.assessSystemHealth(systemData) === 'healthy') {
        summary.healthySystems++;
      }
    }
    
    summary.systemHealthPercentage = summary.totalSystems > 0 
      ? Math.round((summary.healthySystems / summary.totalSystems) * 100)
      : 0;
    
    return summary;
  }

  /**
   * Assess system health based on data
   */
  assessSystemHealth(systemData) {
    if (!systemData.stats) return 'unknown';
    
    const hasProjects = systemData.projects?.length > 0;
    const hasFiles = systemData.files?.length > 0;
    const hasRecentActivity = this.getLastActivity(systemData) !== 'No recent activity';
    
    if (hasProjects && hasFiles && hasRecentActivity) return 'healthy';
    if (hasProjects || hasFiles) return 'warning';
    return 'critical';
  }

  /**
   * Get last activity timestamp
   */
  getLastActivity(systemData) {
    const allItems = [
      ...(systemData.projects || []),
      ...(systemData.templates || []),
      ...(systemData.files || []),
      ...(systemData.reports || [])
    ];
    
    if (allItems.length === 0) return 'No recent activity';
    
    const latestItem = allItems.reduce((latest, item) => {
      const itemDate = new Date(item.created_at || item.updated_at || 0);
      const latestDate = new Date(latest.created_at || latest.updated_at || 0);
      return itemDate > latestDate ? item : latest;
    });
    
    return latestItem.created_at || latestItem.updated_at || 'Unknown';
  }

  /**
   * Generate insights from processed data
   */
  generateInsights(data, processed) {
    const insights = [];
    
    // System health insights
    if (processed.summary.systemHealthPercentage < 100) {
      insights.push({
        type: 'warning',
        title: 'System Health Alert',
        description: `${processed.summary.totalSystems - processed.summary.healthySystems} systems need attention`
      });
    }
    
    // Activity insights
    const activeSystems = Object.entries(processed.details)
      .filter(([_, details]) => details.healthStatus === 'healthy').length;
    
    if (activeSystems > 0) {
      insights.push({
        type: 'success',
        title: 'Active Development',
        description: `${activeSystems} systems showing healthy activity`
      });
    }
    
    // Template usage insights
    if (processed.summary.totalTemplates > 0) {
      insights.push({
        type: 'info',
        title: 'Template Ecosystem',
        description: `${processed.summary.totalTemplates} templates available across systems`
      });
    }
    
    return insights;
  }

  /**
   * Format output according to specified format
   */
  async formatOutput(template, data, options) {
    const format = options.format || 'markdown';
    
    switch (format) {
      case 'markdown':
        return this.formatMarkdown(template, data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'html':
        return this.formatHTML(template, data);
      case 'csv':
        return this.formatCSV(template, data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Format as Markdown
   */
  formatMarkdown(template, data) {
    const md = [];
    
    md.push(`# ${data.metadata.reportName}`);
    md.push(`**Generated**: ${data.metadata.generatedAt}`);
    md.push(`**Timeframe**: ${data.metadata.timeframe}`);
    md.push(`**Systems**: ${data.metadata.systems.join(', ')}`);
    md.push('');
    
    // Summary section
    md.push('## Summary');
    md.push(`- **Total Systems**: ${data.summary.totalSystems}`);
    md.push(`- **Total Projects**: ${data.summary.totalProjects}`);
    md.push(`- **Total Templates**: ${data.summary.totalTemplates}`);
    md.push(`- **Total Files**: ${data.summary.totalFiles}`);
    md.push(`- **System Health**: ${data.summary.systemHealthPercentage}%`);
    md.push('');
    
    // System details
    md.push('## System Details');
    for (const [systemName, details] of Object.entries(data.details)) {
      md.push(`### ${systemName.toUpperCase()}`);
      if (details.error) {
        md.push(`❌ **Error**: ${details.error}`);
      } else {
        md.push(`- **Status**: ${this.getHealthEmoji(details.healthStatus)} ${details.healthStatus}`);
        md.push(`- **Projects**: ${details.projectCount}`);
        md.push(`- **Templates**: ${details.templateCount}`);
        md.push(`- **Files**: ${details.fileCount}`);
        md.push(`- **Last Activity**: ${details.lastActivity}`);
      }
      md.push('');
    }
    
    // Insights
    if (data.insights.length > 0) {
      md.push('## Insights');
      for (const insight of data.insights) {
        const emoji = insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️';
        md.push(`${emoji} **${insight.title}**: ${insight.description}`);
      }
      md.push('');
    }
    
    return md.join('\n');
  }

  /**
   * Format as HTML
   */
  formatHTML(template, data) {
    // Basic HTML formatting - could be enhanced with CSS
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${data.metadata.reportName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .system { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; }
        .healthy { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .critical { border-left-color: #dc3545; }
    </style>
</head>
<body>
    <h1>${data.metadata.reportName}</h1>
    <p><strong>Generated:</strong> ${data.metadata.generatedAt}</p>
    <p><strong>Systems:</strong> ${data.metadata.systems.join(', ')}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <ul>
            <li>Total Systems: ${data.summary.totalSystems}</li>
            <li>Total Projects: ${data.summary.totalProjects}</li>
            <li>Total Templates: ${data.summary.totalTemplates}</li>
            <li>Total Files: ${data.summary.totalFiles}</li>
            <li>System Health: ${data.summary.systemHealthPercentage}%</li>
        </ul>
    </div>
    
    <h2>System Details</h2>
    ${Object.entries(data.details).map(([name, details]) => `
        <div class="system ${details.healthStatus}">
            <h3>${name.toUpperCase()}</h3>
            ${details.error ? `<p>Error: ${details.error}</p>` : `
                <ul>
                    <li>Status: ${details.healthStatus}</li>
                    <li>Projects: ${details.projectCount}</li>
                    <li>Templates: ${details.templateCount}</li>
                    <li>Files: ${details.fileCount}</li>
                </ul>
            `}
        </div>
    `).join('')}
</body>
</html>`;
  }

  /**
   * Format as CSV
   */
  formatCSV(template, data) {
    const rows = [
      ['System', 'Status', 'Projects', 'Templates', 'Files', 'Last Activity']
    ];

    for (const [systemName, details] of Object.entries(data.details)) {
      rows.push([
        systemName,
        details.healthStatus || 'error',
        details.projectCount || 0,
        details.templateCount || 0,
        details.fileCount || 0,
        details.lastActivity || 'Unknown'
      ]);
    }

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Save report to file
   */
  async saveReport(templateName, content, options) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = options.format || 'markdown';
    const extension = format === 'markdown' ? 'md' : format;
    const filename = `${templateName}-${timestamp}.${extension}`;
    const filepath = path.join('./reports', filename);
    
    await fs.ensureDir('./reports');
    await fs.writeFile(filepath, content);
    
    console.log(`📄 Report saved: ${filepath}`);
  }

  /**
   * Helper methods
   */
  getHealthEmoji(status) {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }

  filterByTimeframe(data, timeframe) {
    // Implementation for timeframe filtering
    // This would filter data based on created_at/updated_at timestamps
    return data;
  }

  /**
   * Close all database connections
   */
  async close() {
    for (const db of Object.values(this.dataSources)) {
      if (db) await db.close();
    }
  }
}

module.exports = ReportGenerator;

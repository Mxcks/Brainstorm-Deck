#!/usr/bin/env node

/**
 * Tool Management System
 * Ensures optimal tool selection, tracks usage, and evolves the toolkit
 */

const fs = require('fs-extra');
const path = require('path');

class ToolManagementSystem {
  constructor() {
    this.toolRegistry = new Map();
    this.usageStats = new Map();
    this.workflows = new Map();
    this.recommendations = [];
  }

  /**
   * Initialize tool management system
   */
  async initialize() {
    console.log('🛠️  Initializing Tool Management System...\n');
    
    await this.loadToolRegistry();
    await this.loadUsageStats();
    await this.loadWorkflows();
    
    console.log('✅ Tool Management System initialized');
  }

  /**
   * Load tool registry with all available tools
   */
  async loadToolRegistry() {
    const tools = [
      {
        name: 'project-analyzer',
        command: 'npm run analyze',
        purpose: 'Analyze entire project and create specialized databases',
        category: 'analysis',
        dependencies: ['database-core-system'],
        outputs: ['analysis-databases/', 'analysis reports'],
        frequency: 'on-demand',
        priority: 'high',
        prerequisites: ['project files exist'],
        effectiveness: 0.95
      },
      {
        name: 'database-query',
        command: 'npm run query-db',
        purpose: 'Query and explore database contents across all systems',
        category: 'exploration',
        dependencies: ['analysis-databases/'],
        outputs: ['database insights', 'system statistics'],
        frequency: 'frequent',
        priority: 'high',
        prerequisites: ['databases exist'],
        effectiveness: 0.90
      },
      {
        name: 'similarity-analyzer',
        command: 'npm run analyze-similarity',
        purpose: 'Find duplicate and similar files across project',
        category: 'optimization',
        dependencies: ['analysis-databases/'],
        outputs: ['similarity reports', 'duplicate lists'],
        frequency: 'periodic',
        priority: 'medium',
        prerequisites: ['databases populated'],
        effectiveness: 0.85
      },
      {
        name: 'duplicate-cleanup',
        command: 'npm run cleanup-duplicates',
        purpose: 'Interactive removal of duplicate files',
        category: 'maintenance',
        dependencies: ['similarity reports'],
        outputs: ['cleaned project', 'cleanup logs'],
        frequency: 'as-needed',
        priority: 'medium',
        prerequisites: ['similarity analysis complete'],
        effectiveness: 0.80
      },
      {
        name: 'enhanced-metrics',
        command: 'npm run enhanced-metrics',
        purpose: 'Deep analysis of code complexity and system relationships',
        category: 'analysis',
        dependencies: ['analysis-databases/'],
        outputs: ['complexity reports', 'relationship maps'],
        frequency: 'periodic',
        priority: 'medium',
        prerequisites: ['databases populated'],
        effectiveness: 0.75
      },
      {
        name: 'report-generator',
        command: 'npm run demo-reports',
        purpose: 'Generate system health and usage reports',
        category: 'reporting',
        dependencies: ['analysis-databases/'],
        outputs: ['system reports', 'health dashboards'],
        frequency: 'scheduled',
        priority: 'medium',
        prerequisites: ['databases populated'],
        effectiveness: 0.70
      },
      {
        name: 'briefing-updater',
        command: 'npm run update-briefing',
        purpose: 'Update AI briefing with latest project state',
        category: 'ai-enhancement',
        dependencies: ['project analysis'],
        outputs: ['updated briefing'],
        frequency: 'after-changes',
        priority: 'low',
        prerequisites: ['project analyzed'],
        effectiveness: 0.65
      }
    ];

    tools.forEach(tool => {
      this.toolRegistry.set(tool.name, tool);
    });

    console.log(`   ✓ Loaded ${tools.length} tools into registry`);
  }

  /**
   * Load usage statistics
   */
  async loadUsageStats() {
    try {
      const statsPath = './tool-usage-stats.json';
      if (await fs.pathExists(statsPath)) {
        const stats = JSON.parse(await fs.readFile(statsPath, 'utf8'));
        this.usageStats = new Map(Object.entries(stats));
        console.log('   ✓ Loaded usage statistics');
      } else {
        console.log('   ⚠️  No usage statistics found, starting fresh');
      }
    } catch (error) {
      console.log('   ⚠️  Error loading usage stats:', error.message);
    }
  }

  /**
   * Load workflow definitions
   */
  async loadWorkflows() {
    const workflows = [
      {
        name: 'initial-project-setup',
        description: 'Set up project analysis and databases for the first time',
        steps: [
          { tool: 'project-analyzer', required: true },
          { tool: 'database-query', required: false, purpose: 'verify setup' },
          { tool: 'similarity-analyzer', required: false, purpose: 'identify cleanup opportunities' }
        ],
        triggers: ['new project', 'major changes'],
        frequency: 'once'
      },
      {
        name: 'regular-maintenance',
        description: 'Regular project maintenance and optimization',
        steps: [
          { tool: 'project-analyzer', required: true, purpose: 'update databases' },
          { tool: 'similarity-analyzer', required: true, purpose: 'find new duplicates' },
          { tool: 'duplicate-cleanup', required: false, purpose: 'clean up duplicates' },
          { tool: 'enhanced-metrics', required: false, purpose: 'track complexity' }
        ],
        triggers: ['weekly schedule', 'significant changes'],
        frequency: 'weekly'
      },
      {
        name: 'deep-analysis',
        description: 'Comprehensive project analysis and optimization',
        steps: [
          { tool: 'project-analyzer', required: true },
          { tool: 'similarity-analyzer', required: true },
          { tool: 'enhanced-metrics', required: true },
          { tool: 'report-generator', required: true },
          { tool: 'duplicate-cleanup', required: false }
        ],
        triggers: ['monthly review', 'major refactoring'],
        frequency: 'monthly'
      },
      {
        name: 'quick-status-check',
        description: 'Quick overview of project status',
        steps: [
          { tool: 'database-query', required: true },
          { tool: 'similarity-summary', required: false }
        ],
        triggers: ['status request', 'daily standup'],
        frequency: 'daily'
      }
    ];

    workflows.forEach(workflow => {
      this.workflows.set(workflow.name, workflow);
    });

    console.log(`   ✓ Loaded ${workflows.length} workflow definitions`);
  }

  /**
   * Recommend optimal tools for a given task
   */
  recommendTools(task, context = {}) {
    console.log(`\n🎯 Recommending tools for: "${task}"\n`);

    const recommendations = [];

    // Analyze task keywords to determine intent
    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('analyze') || taskLower.includes('scan') || taskLower.includes('overview')) {
      recommendations.push({
        tool: 'project-analyzer',
        reason: 'Primary analysis tool for comprehensive project scanning',
        priority: 'high'
      });
    }

    if (taskLower.includes('duplicate') || taskLower.includes('similar') || taskLower.includes('cleanup')) {
      recommendations.push({
        tool: 'similarity-analyzer',
        reason: 'Detects duplicates and similar files',
        priority: 'high'
      });
      
      if (taskLower.includes('remove') || taskLower.includes('clean') || taskLower.includes('delete')) {
        recommendations.push({
          tool: 'duplicate-cleanup',
          reason: 'Interactive duplicate removal tool',
          priority: 'medium'
        });
      }
    }

    if (taskLower.includes('query') || taskLower.includes('explore') || taskLower.includes('search')) {
      recommendations.push({
        tool: 'database-query',
        reason: 'Explore and query database contents',
        priority: 'high'
      });
    }

    if (taskLower.includes('complexity') || taskLower.includes('metrics') || taskLower.includes('relationship')) {
      recommendations.push({
        tool: 'enhanced-metrics',
        reason: 'Deep analysis of code complexity and relationships',
        priority: 'medium'
      });
    }

    if (taskLower.includes('report') || taskLower.includes('status') || taskLower.includes('health')) {
      recommendations.push({
        tool: 'report-generator',
        reason: 'Generate comprehensive system reports',
        priority: 'medium'
      });
    }

    // If no specific recommendations, suggest workflow
    if (recommendations.length === 0) {
      recommendations.push({
        workflow: 'quick-status-check',
        reason: 'General purpose workflow for project overview',
        priority: 'medium'
      });
    }

    // Display recommendations
    recommendations.forEach((rec, index) => {
      if (rec.tool) {
        const tool = this.toolRegistry.get(rec.tool);
        console.log(`${index + 1}. 🛠️  ${tool.name}`);
        console.log(`   Command: ${tool.command}`);
        console.log(`   Purpose: ${tool.purpose}`);
        console.log(`   Reason: ${rec.reason}`);
        console.log(`   Priority: ${rec.priority}`);
      } else if (rec.workflow) {
        const workflow = this.workflows.get(rec.workflow);
        console.log(`${index + 1}. 🔄 ${workflow.name} (workflow)`);
        console.log(`   Description: ${workflow.description}`);
        console.log(`   Reason: ${rec.reason}`);
      }
      console.log('');
    });

    return recommendations;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowName, options = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    console.log(`🔄 Executing workflow: ${workflow.name}`);
    console.log(`📝 ${workflow.description}\n`);

    const results = [];

    for (const [index, step] of workflow.steps.entries()) {
      const tool = this.toolRegistry.get(step.tool);
      if (!tool) {
        console.log(`⚠️  Tool '${step.tool}' not found, skipping...`);
        continue;
      }

      console.log(`Step ${index + 1}/${workflow.steps.length}: ${tool.name}`);
      console.log(`Purpose: ${step.purpose || tool.purpose}`);

      if (step.required || options.executeAll) {
        console.log(`▶️  Executing: ${tool.command}`);
        // Here you would actually execute the command
        // For now, we'll simulate execution
        results.push({
          step: index + 1,
          tool: step.tool,
          status: 'simulated',
          command: tool.command
        });
      } else {
        console.log(`⏭️  Optional step, skipping (use --execute-all to run)`);
        results.push({
          step: index + 1,
          tool: step.tool,
          status: 'skipped',
          reason: 'optional'
        });
      }
      console.log('');
    }

    return results;
  }

  /**
   * Track tool usage
   */
  trackUsage(toolName, success = true, duration = 0) {
    if (!this.usageStats.has(toolName)) {
      this.usageStats.set(toolName, {
        totalUses: 0,
        successfulUses: 0,
        totalDuration: 0,
        lastUsed: null,
        averageDuration: 0
      });
    }

    const stats = this.usageStats.get(toolName);
    stats.totalUses++;
    if (success) stats.successfulUses++;
    stats.totalDuration += duration;
    stats.lastUsed = new Date().toISOString();
    stats.averageDuration = stats.totalDuration / stats.totalUses;

    this.usageStats.set(toolName, stats);
  }

  /**
   * Analyze tool effectiveness and suggest improvements
   */
  analyzeToolEffectiveness() {
    console.log('\n📊 Tool Effectiveness Analysis\n');

    const analysis = {
      mostUsed: null,
      leastUsed: null,
      mostEffective: null,
      needsImprovement: [],
      recommendations: []
    };

    // Find most and least used tools
    let maxUses = 0;
    let minUses = Infinity;

    for (const [toolName, stats] of this.usageStats) {
      if (stats.totalUses > maxUses) {
        maxUses = stats.totalUses;
        analysis.mostUsed = { tool: toolName, uses: stats.totalUses };
      }
      if (stats.totalUses < minUses) {
        minUses = stats.totalUses;
        analysis.leastUsed = { tool: toolName, uses: stats.totalUses };
      }

      // Check success rate
      const successRate = stats.successfulUses / stats.totalUses;
      if (successRate < 0.8) {
        analysis.needsImprovement.push({
          tool: toolName,
          successRate: Math.round(successRate * 100),
          issue: 'Low success rate'
        });
      }

      // Check if tool is unused
      if (stats.totalUses === 0) {
        analysis.needsImprovement.push({
          tool: toolName,
          issue: 'Never used - consider removal or better documentation'
        });
      }
    }

    // Generate recommendations
    if (analysis.needsImprovement.length > 0) {
      analysis.recommendations.push('Review and improve tools with low success rates');
    }

    if (analysis.leastUsed && analysis.leastUsed.uses < 2) {
      analysis.recommendations.push(`Consider better documentation or removal of underused tools`);
    }

    return analysis;
  }

  /**
   * Save usage statistics
   */
  async saveUsageStats() {
    const statsObject = Object.fromEntries(this.usageStats);
    await fs.writeFile('./tool-usage-stats.json', JSON.stringify(statsObject, null, 2));
    console.log('💾 Usage statistics saved');
  }

  /**
   * Generate tool management report
   */
  async generateReport() {
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        total_tools: this.toolRegistry.size,
        total_workflows: this.workflows.size
      },
      tool_registry: Array.from(this.toolRegistry.values()),
      workflows: Array.from(this.workflows.values()),
      usage_statistics: Object.fromEntries(this.usageStats),
      effectiveness_analysis: this.analyzeToolEffectiveness(),
      recommendations: this.generateToolRecommendations()
    };

    await fs.writeFile('./tool-management-report.json', JSON.stringify(report, null, 2));
    console.log('📊 Tool management report generated');

    return report;
  }

  /**
   * Generate tool recommendations for improvement
   */
  generateToolRecommendations() {
    return [
      'Regularly update tool effectiveness scores based on user feedback',
      'Add new tools when gaps are identified in workflows',
      'Remove or improve tools with consistently low success rates',
      'Create specialized workflows for common task patterns',
      'Implement automated tool selection based on context analysis'
    ];
  }

  /**
   * Interactive tool selection
   */
  async interactiveToolSelection(task) {
    console.log('🤖 Interactive Tool Selection\n');
    
    const recommendations = this.recommendTools(task);
    
    console.log('Would you like to:');
    console.log('1. Execute recommended tool/workflow');
    console.log('2. See all available tools');
    console.log('3. Create custom workflow');
    console.log('4. Exit');
    
    // In a real implementation, you'd use readline for user input
    return recommendations;
  }

  /**
   * Static runner
   */
  static async run(task = 'general analysis') {
    const tms = new ToolManagementSystem();
    await tms.initialize();
    
    const recommendations = tms.recommendTools(task);
    await tms.generateReport();
    
    return { tms, recommendations };
  }
}

// Run if called directly
if (require.main === module) {
  const task = process.argv[2] || 'analyze project';
  ToolManagementSystem.run(task).catch(console.error);
}

module.exports = ToolManagementSystem;

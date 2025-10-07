#!/usr/bin/env node

/**
 * Smart Workflow Executor
 * Intelligently selects and executes the optimal tools for any given task
 */

const { spawn } = require('child_process');
const ToolManagementSystem = require('./tool-management-system');
const fs = require('fs-extra');

class SmartWorkflowExecutor {
  constructor() {
    this.toolManager = new ToolManagementSystem();
    this.executionLog = [];
  }

  /**
   * Initialize the executor
   */
  async initialize() {
    console.log('🚀 Initializing Smart Workflow Executor...\n');
    await this.toolManager.initialize();
    console.log('✅ Smart Workflow Executor ready\n');
  }

  /**
   * Execute optimal workflow for a given task
   */
  async executeOptimalWorkflow(task, options = {}) {
    console.log(`🎯 Task: "${task}"`);
    console.log(`⚙️  Options: ${JSON.stringify(options)}\n`);

    // Get tool recommendations
    const recommendations = this.toolManager.recommendTools(task);
    
    if (recommendations.length === 0) {
      console.log('❌ No suitable tools found for this task');
      return;
    }

    // Execute recommended tools in order
    const results = [];
    
    for (const [index, recommendation] of recommendations.entries()) {
      if (recommendation.tool) {
        const result = await this.executeTool(recommendation.tool, options);
        results.push(result);
        
        // Track usage
        this.toolManager.trackUsage(
          recommendation.tool, 
          result.success, 
          result.duration
        );
        
        // Stop on failure unless force continue is enabled
        if (!result.success && !options.forceContinue) {
          console.log('❌ Stopping workflow due to tool failure');
          break;
        }
      } else if (recommendation.workflow) {
        const result = await this.executeWorkflow(recommendation.workflow, options);
        results.push(result);
      }
    }

    // Save execution log
    await this.saveExecutionLog(task, results);
    
    // Save updated usage statistics
    await this.toolManager.saveUsageStats();

    return results;
  }

  /**
   * Execute a specific tool
   */
  async executeTool(toolName, options = {}) {
    const tool = this.toolManager.toolRegistry.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool '${toolName}' not found` };
    }

    console.log(`🔧 Executing: ${tool.name}`);
    console.log(`📝 Purpose: ${tool.purpose}`);
    console.log(`⚡ Command: ${tool.command}`);

    // Check prerequisites
    const prerequisiteCheck = await this.checkPrerequisites(tool);
    if (!prerequisiteCheck.passed) {
      console.log(`⚠️  Prerequisites not met: ${prerequisiteCheck.reason}`);
      if (!options.skipPrerequisites) {
        return { 
          success: false, 
          error: `Prerequisites not met: ${prerequisiteCheck.reason}`,
          tool: toolName
        };
      }
    }

    const startTime = Date.now();
    
    try {
      // Execute the tool command
      const result = await this.runCommand(tool.command);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${tool.name} completed successfully (${duration}ms)\n`);
      
      return {
        success: true,
        tool: toolName,
        duration: duration,
        output: result.output,
        command: tool.command
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${tool.name} failed: ${error.message} (${duration}ms)\n`);
      
      return {
        success: false,
        tool: toolName,
        duration: duration,
        error: error.message,
        command: tool.command
      };
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowName, options = {}) {
    console.log(`🔄 Executing workflow: ${workflowName}`);
    
    const results = await this.toolManager.executeWorkflow(workflowName, {
      executeAll: options.executeAll || false
    });
    
    return {
      success: true,
      workflow: workflowName,
      steps: results
    };
  }

  /**
   * Check tool prerequisites
   */
  async checkPrerequisites(tool) {
    const checks = {
      'project-analyzer': async () => {
        // Check if project files exist
        const hasFiles = await fs.pathExists('./package.json');
        return { passed: hasFiles, reason: hasFiles ? '' : 'No package.json found' };
      },
      
      'similarity-analyzer': async () => {
        // Check if databases exist
        const hasDb = await fs.pathExists('./analysis-databases');
        return { passed: hasDb, reason: hasDb ? '' : 'No analysis databases found - run project analyzer first' };
      },
      
      'duplicate-cleanup': async () => {
        // Check if similarity report exists
        const hasReport = await fs.pathExists('./file-similarity-report.json');
        return { passed: hasReport, reason: hasReport ? '' : 'No similarity report found - run similarity analyzer first' };
      },
      
      'enhanced-metrics': async () => {
        // Check if databases exist
        const hasDb = await fs.pathExists('./analysis-databases');
        return { passed: hasDb, reason: hasDb ? '' : 'No analysis databases found - run project analyzer first' };
      },
      
      'database-query': async () => {
        // Check if databases exist
        const hasDb = await fs.pathExists('./analysis-databases');
        return { passed: hasDb, reason: hasDb ? '' : 'No analysis databases found - run project analyzer first' };
      }
    };

    const checkFunction = checks[tool.name];
    if (checkFunction) {
      return await checkFunction();
    }

    // Default: assume prerequisites are met
    return { passed: true, reason: '' };
  }

  /**
   * Run a command and return result
   */
  async runCommand(command) {
    return new Promise((resolve, reject) => {
      // Parse command (assumes npm run format)
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      const process = spawn(cmd, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ output, error });
        } else {
          reject(new Error(`Command failed with code ${code}: ${error}`));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Save execution log
   */
  async saveExecutionLog(task, results) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      task: task,
      results: results,
      summary: {
        total_tools: results.length,
        successful_tools: results.filter(r => r.success).length,
        total_duration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
      }
    };

    this.executionLog.push(logEntry);

    // Save to file
    await fs.writeFile('./workflow-execution-log.json', JSON.stringify(this.executionLog, null, 2));
    
    console.log('📝 Execution log saved');
  }

  /**
   * Get execution history
   */
  async getExecutionHistory() {
    try {
      if (await fs.pathExists('./workflow-execution-log.json')) {
        const log = await fs.readFile('./workflow-execution-log.json', 'utf8');
        this.executionLog = JSON.parse(log);
      }
    } catch (error) {
      console.log('⚠️  Could not load execution history:', error.message);
    }
    
    return this.executionLog;
  }

  /**
   * Interactive mode
   */
  async interactiveMode() {
    console.log('🤖 Smart Workflow Executor - Interactive Mode\n');
    
    // In a real implementation, you'd use readline for user input
    console.log('Available commands:');
    console.log('  analyze - Run project analysis');
    console.log('  optimize - Find and clean duplicates');
    console.log('  status - Quick project status');
    console.log('  deep - Comprehensive analysis');
    console.log('  custom <task> - Custom task analysis');
    
    // For demo, we'll run a sample task
    await this.executeOptimalWorkflow('analyze project for duplicates', {
      forceContinue: true
    });
  }

  /**
   * Static runner
   */
  static async run(task = null, options = {}) {
    const executor = new SmartWorkflowExecutor();
    await executor.initialize();
    
    if (task) {
      return await executor.executeOptimalWorkflow(task, options);
    } else {
      return await executor.interactiveMode();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const task = process.argv.slice(2).join(' ');
  const options = {
    forceContinue: process.argv.includes('--force-continue'),
    skipPrerequisites: process.argv.includes('--skip-prereq'),
    executeAll: process.argv.includes('--execute-all')
  };
  
  SmartWorkflowExecutor.run(task || null, options).catch(console.error);
}

module.exports = SmartWorkflowExecutor;

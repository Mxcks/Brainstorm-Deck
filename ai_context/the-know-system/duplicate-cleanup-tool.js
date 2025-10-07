#!/usr/bin/env node

/**
 * Duplicate Cleanup Tool
 * Helps identify and remove duplicate files based on similarity analysis
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

class DuplicateCleanupTool {
  constructor() {
    this.report = null;
    this.cleanupActions = [];
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Load similarity report
   */
  async loadReport() {
    try {
      const reportPath = './file-similarity-report.json';
      if (!await fs.pathExists(reportPath)) {
        throw new Error('Similarity report not found. Run "npm run analyze-similarity" first.');
      }
      
      const reportContent = await fs.readFile(reportPath, 'utf8');
      this.report = JSON.parse(reportContent);
      
      console.log('✅ Loaded similarity report');
      console.log(`📊 Found ${this.report.exact_duplicates.length} exact duplicate groups`);
      console.log(`📊 Found ${this.report.similar_files.length} similar file pairs`);
    } catch (error) {
      throw new Error(`Failed to load report: ${error.message}`);
    }
  }

  /**
   * Ask user a question
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Analyze duplicate groups and suggest cleanup actions
   */
  async analyzeDuplicateGroups() {
    console.log('\n🔍 Analyzing duplicate groups...\n');
    
    for (const [index, duplicate] of this.report.exact_duplicates.entries()) {
      console.log(`\n📁 Duplicate Group ${index + 1}/${this.report.exact_duplicates.length}`);
      console.log(`Files: ${duplicate.count}`);
      console.log(`Hash: ${duplicate.hash}`);
      
      // Show all files in the group
      console.log('Locations:');
      duplicate.files.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.full_path} (${file.system}) - ${file.size} bytes`);
      });
      
      // Suggest which file to keep
      const suggestion = this.suggestFileToKeep(duplicate.files);
      console.log(`\n💡 Suggestion: Keep file #${suggestion.index} (${suggestion.reason})`);
      
      // Ask user what to do
      const action = await this.askQuestion(
        '\nChoose action:\n' +
        '  k) Keep suggested file and delete others\n' +
        '  c) Choose different file to keep\n' +
        '  s) Skip this group\n' +
        '  q) Quit\n' +
        'Your choice: '
      );
      
      switch (action.toLowerCase()) {
        case 'k':
          this.addCleanupAction(duplicate, suggestion.index);
          break;
        case 'c':
          await this.chooseFileToKeep(duplicate);
          break;
        case 's':
          console.log('⏭️  Skipped');
          break;
        case 'q':
          console.log('👋 Exiting...');
          return false;
        default:
          console.log('❌ Invalid choice, skipping...');
      }
    }
    
    return true;
  }

  /**
   * Suggest which file to keep based on various criteria
   */
  suggestFileToKeep(files) {
    // Prefer files in specific systems over general
    const systemPriority = {
      'the-know-intelligence': 1,
      'template-system': 2,
      'database-core': 3,
      'peanut-butter-user': 4,
      'report-system': 5,
      'general': 6
    };
    
    // Sort by system priority, then by path length (shorter is better)
    const sorted = files
      .map((file, index) => ({
        ...file,
        originalIndex: index,
        systemPriority: systemPriority[file.system] || 999,
        pathLength: file.full_path.length
      }))
      .sort((a, b) => {
        if (a.systemPriority !== b.systemPriority) {
          return a.systemPriority - b.systemPriority;
        }
        return a.pathLength - b.pathLength;
      });
    
    const suggested = sorted[0];
    let reason = `Best system priority (${suggested.system})`;
    
    if (sorted.length > 1 && sorted[0].systemPriority === sorted[1].systemPriority) {
      reason += ' and shortest path';
    }
    
    return {
      index: suggested.originalIndex + 1,
      file: suggested,
      reason: reason
    };
  }

  /**
   * Let user choose which file to keep
   */
  async chooseFileToKeep(duplicate) {
    const choice = await this.askQuestion(
      `Enter the number of the file to keep (1-${duplicate.files.length}): `
    );
    
    const fileIndex = parseInt(choice) - 1;
    if (fileIndex >= 0 && fileIndex < duplicate.files.length) {
      this.addCleanupAction(duplicate, fileIndex + 1);
    } else {
      console.log('❌ Invalid choice, skipping...');
    }
  }

  /**
   * Add cleanup action
   */
  addCleanupAction(duplicate, keepIndex) {
    const keepFile = duplicate.files[keepIndex - 1];
    const deleteFiles = duplicate.files.filter((_, i) => i !== keepIndex - 1);
    
    this.cleanupActions.push({
      type: 'exact_duplicate',
      keep: keepFile,
      delete: deleteFiles,
      hash: duplicate.hash
    });
    
    console.log(`✅ Will keep: ${keepFile.full_path}`);
    console.log(`🗑️  Will delete ${deleteFiles.length} duplicate(s)`);
  }

  /**
   * Execute cleanup actions
   */
  async executeCleanup() {
    if (this.cleanupActions.length === 0) {
      console.log('\n📝 No cleanup actions to execute.');
      return;
    }
    
    console.log(`\n📋 Cleanup Summary:`);
    console.log(`Files to keep: ${this.cleanupActions.length}`);
    console.log(`Files to delete: ${this.cleanupActions.reduce((sum, action) => sum + action.delete.length, 0)}`);
    
    const confirm = await this.askQuestion('\nProceed with cleanup? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled');
      return;
    }
    
    console.log('\n🧹 Executing cleanup...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const action of this.cleanupActions) {
      for (const file of action.delete) {
        try {
          if (await fs.pathExists(file.full_path)) {
            await fs.remove(file.full_path);
            console.log(`✅ Deleted: ${file.full_path}`);
            deletedCount++;
          } else {
            console.log(`⚠️  File not found: ${file.full_path}`);
          }
        } catch (error) {
          console.log(`❌ Error deleting ${file.full_path}: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Cleanup Results:`);
    console.log(`✅ Files deleted: ${deletedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Save cleanup log
    const cleanupLog = {
      timestamp: new Date().toISOString(),
      actions: this.cleanupActions,
      results: {
        deleted: deletedCount,
        errors: errorCount
      }
    };
    
    await fs.writeFile('./cleanup-log.json', JSON.stringify(cleanupLog, null, 2));
    console.log('📝 Cleanup log saved to cleanup-log.json');
  }

  /**
   * Show cleanup preview
   */
  showCleanupPreview() {
    if (this.cleanupActions.length === 0) {
      console.log('\n📝 No cleanup actions planned.');
      return;
    }
    
    console.log('\n📋 Cleanup Preview:');
    
    for (const [index, action] of this.cleanupActions.entries()) {
      console.log(`\n${index + 1}. Keep: ${action.keep.full_path}`);
      console.log(`   Delete:`);
      action.delete.forEach(file => {
        console.log(`     - ${file.full_path}`);
      });
    }
  }

  /**
   * Generate cleanup script
   */
  async generateCleanupScript() {
    if (this.cleanupActions.length === 0) {
      console.log('\n📝 No cleanup actions to script.');
      return;
    }
    
    const scriptLines = [
      '#!/bin/bash',
      '# Duplicate File Cleanup Script',
      `# Generated: ${new Date().toISOString()}`,
      '',
      'echo "Starting duplicate file cleanup..."',
      ''
    ];
    
    for (const action of this.cleanupActions) {
      scriptLines.push(`# Keep: ${action.keep.full_path}`);
      for (const file of action.delete) {
        scriptLines.push(`rm "${file.full_path}"`);
      }
      scriptLines.push('');
    }
    
    scriptLines.push('echo "Cleanup complete!"');
    
    await fs.writeFile('./cleanup-duplicates.sh', scriptLines.join('\n'));
    console.log('📝 Cleanup script saved to cleanup-duplicates.sh');
  }

  /**
   * Close readline interface
   */
  close() {
    this.rl.close();
  }

  /**
   * Main cleanup process
   */
  async run() {
    try {
      console.log('🧹 Duplicate Cleanup Tool\n');
      
      await this.loadReport();
      
      if (this.report.exact_duplicates.length === 0) {
        console.log('🎉 No exact duplicates found!');
        return;
      }
      
      const shouldContinue = await this.analyzeDuplicateGroups();
      
      if (!shouldContinue) {
        this.close();
        return;
      }
      
      this.showCleanupPreview();
      
      const action = await this.askQuestion(
        '\nChoose final action:\n' +
        '  e) Execute cleanup now\n' +
        '  s) Generate cleanup script\n' +
        '  c) Cancel\n' +
        'Your choice: '
      );
      
      switch (action.toLowerCase()) {
        case 'e':
          await this.executeCleanup();
          break;
        case 's':
          await this.generateCleanupScript();
          break;
        case 'c':
          console.log('❌ Cleanup cancelled');
          break;
        default:
          console.log('❌ Invalid choice');
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.close();
    }
  }

  /**
   * Static runner
   */
  static async run() {
    const tool = new DuplicateCleanupTool();
    await tool.run();
  }
}

// Run if called directly
if (require.main === module) {
  DuplicateCleanupTool.run().catch(console.error);
}

module.exports = DuplicateCleanupTool;

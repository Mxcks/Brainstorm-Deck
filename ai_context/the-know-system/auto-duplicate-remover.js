#!/usr/bin/env node

/**
 * Automated Duplicate Remover
 * Automatically removes duplicates without user interaction
 */

const fs = require('fs-extra');
const path = require('path');

class AutoDuplicateRemover {
  constructor() {
    this.report = null;
    this.deletedFiles = [];
    this.errors = [];
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
    } catch (error) {
      throw new Error(`Failed to load report: ${error.message}`);
    }
  }

  /**
   * Automatically select which file to keep in each duplicate group
   */
  selectFileToKeep(duplicateGroup) {
    const files = duplicateGroup.files;
    
    // Priority system for which file to keep
    const systemPriority = {
      'the-know-intelligence': 1,
      'template-system': 2,
      'database-core': 3,
      'peanut-butter-user': 4,
      'report-system': 5,
      'general': 6
    };
    
    // Sort files by:
    // 1. System priority (lower number = higher priority)
    // 2. File size (larger = more likely to be complete)
    // 3. Path length (shorter = more likely to be in root/main location)
    const sortedFiles = files
      .map((file, index) => ({
        ...file,
        originalIndex: index,
        systemPriority: systemPriority[file.system] || 999,
        pathLength: file.full_path ? file.full_path.length : 999,
        fileSize: file.size || 0
      }))
      .sort((a, b) => {
        // First: system priority
        if (a.systemPriority !== b.systemPriority) {
          return a.systemPriority - b.systemPriority;
        }
        // Second: file size (larger first)
        if (a.fileSize !== b.fileSize) {
          return b.fileSize - a.fileSize;
        }
        // Third: path length (shorter first)
        return a.pathLength - b.pathLength;
      });
    
    const fileToKeep = sortedFiles[0];
    const filesToDelete = sortedFiles.slice(1);
    
    return {
      keep: fileToKeep,
      delete: filesToDelete,
      reason: `Best system (${fileToKeep.system}), largest size (${fileToKeep.fileSize} bytes)`
    };
  }

  /**
   * Remove duplicates automatically
   */
  async removeDuplicates() {
    console.log('\n🧹 Starting automated duplicate removal...\n');
    
    let totalDeleted = 0;
    let totalErrors = 0;
    let groupsProcessed = 0;
    
    for (const [index, duplicateGroup] of this.report.exact_duplicates.entries()) {
      console.log(`📁 Processing Group ${index + 1}/${this.report.exact_duplicates.length}`);
      
      const selection = this.selectFileToKeep(duplicateGroup);
      
      console.log(`   ✅ Keeping: ${selection.keep.full_path}`);
      console.log(`   🗑️  Deleting ${selection.delete.length} duplicates`);
      console.log(`   💡 Reason: ${selection.reason}`);
      
      // Delete the duplicate files
      for (const fileToDelete of selection.delete) {
        try {
          if (await fs.pathExists(fileToDelete.full_path)) {
            await fs.remove(fileToDelete.full_path);
            console.log(`      ✅ Deleted: ${fileToDelete.full_path}`);
            this.deletedFiles.push(fileToDelete.full_path);
            totalDeleted++;
          } else {
            console.log(`      ⚠️  File not found: ${fileToDelete.full_path}`);
          }
        } catch (error) {
          console.log(`      ❌ Error deleting ${fileToDelete.full_path}: ${error.message}`);
          this.errors.push({
            file: fileToDelete.full_path,
            error: error.message
          });
          totalErrors++;
        }
      }
      
      groupsProcessed++;
      console.log('');
    }
    
    console.log('📊 Cleanup Summary:');
    console.log(`   Groups processed: ${groupsProcessed}`);
    console.log(`   Files deleted: ${totalDeleted}`);
    console.log(`   Errors: ${totalErrors}`);
    
    return {
      groupsProcessed,
      filesDeleted: totalDeleted,
      errors: totalErrors
    };
  }

  /**
   * Clean up empty directories
   */
  async cleanupEmptyDirectories() {
    console.log('\n🧹 Cleaning up empty directories...');
    
    const emptyDirs = [];
    
    // Get all unique directory paths from deleted files
    const directories = [...new Set(
      this.deletedFiles.map(filePath => path.dirname(filePath))
    )];
    
    for (const dir of directories) {
      try {
        if (await fs.pathExists(dir)) {
          const contents = await fs.readdir(dir);
          if (contents.length === 0) {
            await fs.remove(dir);
            console.log(`   ✅ Removed empty directory: ${dir}`);
            emptyDirs.push(dir);
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Could not check directory ${dir}: ${error.message}`);
      }
    }
    
    console.log(`   📁 Removed ${emptyDirs.length} empty directories`);
    return emptyDirs;
  }

  /**
   * Generate cleanup log
   */
  async generateCleanupLog() {
    const log = {
      timestamp: new Date().toISOString(),
      summary: {
        duplicate_groups_processed: this.report.exact_duplicates.length,
        files_deleted: this.deletedFiles.length,
        errors: this.errors.length
      },
      deleted_files: this.deletedFiles,
      errors: this.errors,
      original_report: {
        total_files_analyzed: this.report.metadata.total_files_analyzed,
        exact_duplicates: this.report.metadata.exact_duplicates,
        similar_pairs: this.report.metadata.similar_pairs
      }
    };
    
    await fs.writeFile('./duplicate-cleanup-log.json', JSON.stringify(log, null, 2));
    console.log('📝 Cleanup log saved to duplicate-cleanup-log.json');
    
    return log;
  }

  /**
   * Main cleanup process
   */
  async run() {
    try {
      console.log('🚀 Automated Duplicate Remover\n');
      
      await this.loadReport();
      
      if (this.report.exact_duplicates.length === 0) {
        console.log('🎉 No exact duplicates found!');
        return;
      }
      
      console.log(`⚠️  About to delete ${this.report.exact_duplicates.reduce((sum, group) => sum + (group.count - 1), 0)} duplicate files`);
      console.log('⏱️  Starting in 3 seconds...\n');
      
      // Give a brief pause
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const results = await this.removeDuplicates();
      await this.cleanupEmptyDirectories();
      await this.generateCleanupLog();
      
      console.log('\n✅ Automated duplicate cleanup complete!');
      console.log(`📊 Deleted ${results.filesDeleted} duplicate files`);
      console.log(`❌ ${results.errors} errors occurred`);
      
      if (results.errors > 0) {
        console.log('⚠️  Check duplicate-cleanup-log.json for error details');
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      throw error;
    }
  }

  /**
   * Static runner
   */
  static async run() {
    const remover = new AutoDuplicateRemover();
    return await remover.run();
  }
}

// Run if called directly
if (require.main === module) {
  AutoDuplicateRemover.run().catch(console.error);
}

module.exports = AutoDuplicateRemover;

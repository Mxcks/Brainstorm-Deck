#!/usr/bin/env node

/**
 * File Similarity Summary Tool
 * Provides a concise summary of file similarity analysis results
 */

const fs = require('fs-extra');

class SimilaritySummary {
  constructor() {
    this.report = null;
  }

  /**
   * Load and summarize the similarity report
   */
  async loadAndSummarize() {
    try {
      const reportPath = './file-similarity-report.json';
      if (!await fs.pathExists(reportPath)) {
        throw new Error('Similarity report not found. Run "npm run analyze-similarity" first.');
      }
      
      const reportContent = await fs.readFile(reportPath, 'utf8');
      this.report = JSON.parse(reportContent);
      
      this.showSummary();
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Show concise summary
   */
  showSummary() {
    console.log('📊 File Similarity Analysis Summary\n');
    
    // Basic stats
    console.log('📈 Overview:');
    console.log(`   Total Files Analyzed: ${this.report.metadata.total_files_analyzed}`);
    console.log(`   Exact Duplicate Groups: ${this.report.metadata.exact_duplicates}`);
    console.log(`   Similar File Pairs: ${this.report.metadata.similar_pairs}`);
    console.log('');
    
    // Top duplicate groups
    console.log('🔥 Top Duplicate Issues:');
    const topDuplicates = this.report.exact_duplicates
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    topDuplicates.forEach((dup, index) => {
      const fileName = dup.files[0].name;
      const systems = [...new Set(dup.files.map(f => f.system))];
      console.log(`   ${index + 1}. ${fileName} - ${dup.count} copies across ${systems.join(', ')}`);
    });
    console.log('');
    
    // System breakdown
    console.log('🗂️  Duplicates by System:');
    const systemStats = {};
    
    this.report.exact_duplicates.forEach(dup => {
      dup.files.forEach(file => {
        if (!systemStats[file.system]) {
          systemStats[file.system] = { files: 0, groups: 0 };
        }
        systemStats[file.system].files++;
      });
    });
    
    this.report.exact_duplicates.forEach(dup => {
      const systems = [...new Set(dup.files.map(f => f.system))];
      systems.forEach(system => {
        if (systemStats[system]) {
          systemStats[system].groups++;
        }
      });
    });
    
    Object.entries(systemStats)
      .sort(([,a], [,b]) => b.files - a.files)
      .forEach(([system, stats]) => {
        console.log(`   ${system}: ${stats.files} duplicate files in ${stats.groups} groups`);
      });
    console.log('');
    
    // File type analysis
    console.log('📄 Most Duplicated File Types:');
    const typeStats = {};
    
    this.report.exact_duplicates.forEach(dup => {
      dup.files.forEach(file => {
        const type = file.file_type || 'unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
    });
    
    Object.entries(typeStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} duplicate files`);
      });
    console.log('');
    
    // Potential savings
    const totalDuplicateFiles = this.report.exact_duplicates.reduce((sum, dup) => sum + (dup.count - 1), 0);
    console.log('💾 Potential Cleanup Benefits:');
    console.log(`   Files that can be removed: ${totalDuplicateFiles}`);
    console.log(`   Storage reduction: Significant (exact duplicates)`);
    console.log(`   Maintenance reduction: Simplified project structure`);
    console.log('');
    
    // Quick recommendations
    console.log('🎯 Quick Recommendations:');
    console.log('   1. Run "npm run cleanup-duplicates" to interactively remove duplicates');
    console.log('   2. Focus on the-know-intelligence system (most duplicates)');
    console.log('   3. Review configuration files for consolidation opportunities');
    console.log('   4. Consider template creation for similar files');
    console.log('');
    
    // Next steps
    console.log('🚀 Next Steps:');
    console.log('   • npm run cleanup-duplicates  - Interactive duplicate removal');
    console.log('   • View file-similarity-report.md for detailed analysis');
    console.log('   • Update analysis-config.json to prevent future duplicates');
  }

  /**
   * Static runner
   */
  static async run() {
    const summary = new SimilaritySummary();
    await summary.loadAndSummarize();
  }
}

// Run if called directly
if (require.main === module) {
  SimilaritySummary.run().catch(console.error);
}

module.exports = SimilaritySummary;

#!/usr/bin/env node

/**
 * File Similarity Analyzer
 * Analyzes files for similarities and detects duplicates across The Know project
 */

const UniversalDatabaseManager = require('./database-core-system/core/universal-database-manager');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class FileSimilarityAnalyzer {
  constructor() {
    this.databases = {
      'the-know-intelligence': null,
      'template-system': null,
      'database-core': null,
      'peanut-butter-user': null,
      'report-system': null,
      'general': null
    };
    this.allFiles = [];
    this.duplicates = [];
    this.similarities = [];
  }

  /**
   * Initialize database connections
   */
  async initialize() {
    console.log('🔍 Initializing File Similarity Analyzer...\n');
    
    for (const [systemName, _] of Object.entries(this.databases)) {
      try {
        const dbManager = new UniversalDatabaseManager({
          basePath: `./analysis-databases/${systemName}`,
          projectName: systemName
        });
        
        await dbManager.initialize();
        this.databases[systemName] = dbManager;
        console.log(`   ✓ Connected to ${systemName} database`);
      } catch (error) {
        console.log(`   ⚠️  Could not connect to ${systemName}: ${error.message}`);
      }
    }
  }

  /**
   * Load all files from databases
   */
  async loadAllFiles() {
    console.log('\n📁 Loading all files from databases...');
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      try {
        const files = await db.read('files');
        for (const file of files) {
          this.allFiles.push({
            ...file,
            system: systemName,
            full_path: file.file_path,
            content: null // Will load on demand
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Error loading files from ${systemName}: ${error.message}`);
      }
    }
    
    console.log(`   ✓ Loaded ${this.allFiles.length} files from all systems`);
  }

  /**
   * Calculate file hash for exact duplicate detection
   */
  async calculateFileHash(filePath) {
    try {
      if (!await fs.pathExists(filePath)) return null;
      
      const content = await fs.readFile(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get file content for similarity analysis
   */
  async getFileContent(filePath) {
    try {
      if (!await fs.pathExists(filePath)) return '';
      
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      return '';
    }
  }

  /**
   * Calculate text similarity using Jaccard similarity
   */
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    // Normalize text
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
    };
    
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    if (normalized1 === normalized2) return 1.0;
    
    // Create word sets
    const words1 = new Set(normalized1.split(' '));
    const words2 = new Set(normalized2.split(' '));
    
    // Calculate Jaccard similarity
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Detect exact duplicates by file hash
   */
  async detectExactDuplicates() {
    console.log('\n🔍 Detecting exact duplicates...');
    
    const hashGroups = {};
    const processedFiles = [];
    
    for (const file of this.allFiles) {
      const hash = await this.calculateFileHash(file.full_path);
      if (!hash) continue;
      
      if (!hashGroups[hash]) {
        hashGroups[hash] = [];
      }
      
      hashGroups[hash].push(file);
      processedFiles.push({ ...file, hash });
    }
    
    // Find duplicate groups
    for (const [hash, files] of Object.entries(hashGroups)) {
      if (files.length > 1) {
        this.duplicates.push({
          type: 'exact',
          hash: hash,
          files: files,
          count: files.length,
          similarity: 1.0
        });
      }
    }
    
    console.log(`   ✓ Found ${this.duplicates.length} exact duplicate groups`);
    return processedFiles;
  }

  /**
   * Detect similar files by content analysis
   */
  async detectSimilarFiles(threshold = 0.7) {
    console.log(`\n🔍 Detecting similar files (threshold: ${threshold})...`);
    
    const fileContents = [];
    
    // Load content for all files
    for (const file of this.allFiles) {
      const content = await this.getFileContent(file.full_path);
      fileContents.push({
        ...file,
        content: content,
        wordCount: content.split(/\s+/).length
      });
    }
    
    // Compare each file with every other file
    for (let i = 0; i < fileContents.length; i++) {
      for (let j = i + 1; j < fileContents.length; j++) {
        const file1 = fileContents[i];
        const file2 = fileContents[j];
        
        // Skip if files are identical (already found as duplicates)
        if (file1.hash && file2.hash && file1.hash === file2.hash) continue;
        
        const similarity = this.calculateTextSimilarity(file1.content, file2.content);
        
        if (similarity >= threshold) {
          this.similarities.push({
            type: 'similar',
            file1: file1,
            file2: file2,
            similarity: similarity,
            reason: this.analyzeSimilarityReason(file1, file2, similarity)
          });
        }
      }
    }
    
    console.log(`   ✓ Found ${this.similarities.length} similar file pairs`);
  }

  /**
   * Analyze why files are similar
   */
  analyzeSimilarityReason(file1, file2, similarity) {
    const reasons = [];
    
    // Same file type
    if (file1.file_type === file2.file_type) {
      reasons.push(`Same file type (${file1.file_type})`);
    }
    
    // Same system
    if (file1.system === file2.system) {
      reasons.push(`Same system (${file1.system})`);
    }
    
    // Similar names
    const name1 = path.basename(file1.name, path.extname(file1.name));
    const name2 = path.basename(file2.name, path.extname(file2.name));
    if (name1.includes(name2) || name2.includes(name1)) {
      reasons.push('Similar file names');
    }
    
    // High similarity
    if (similarity > 0.9) {
      reasons.push('Very high content similarity');
    } else if (similarity > 0.8) {
      reasons.push('High content similarity');
    } else {
      reasons.push('Moderate content similarity');
    }
    
    return reasons;
  }

  /**
   * Generate similarity report
   */
  async generateReport() {
    console.log('\n📊 Generating similarity analysis report...');
    
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        total_files_analyzed: this.allFiles.length,
        exact_duplicates: this.duplicates.length,
        similar_pairs: this.similarities.length
      },
      exact_duplicates: this.duplicates,
      similar_files: this.similarities,
      summary: {
        systems_with_duplicates: [...new Set(this.duplicates.flatMap(d => d.files.map(f => f.system)))],
        most_duplicated_types: this.getMostDuplicatedTypes(),
        recommendations: this.generateRecommendations()
      }
    };
    
    // Save report as JSON
    await fs.writeFile('./file-similarity-report.json', JSON.stringify(report, null, 2));
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile('./file-similarity-report.md', markdownReport);
    
    console.log('   ✓ Reports saved:');
    console.log('     - file-similarity-report.json');
    console.log('     - file-similarity-report.md');
    
    return report;
  }

  /**
   * Get most duplicated file types
   */
  getMostDuplicatedTypes() {
    const typeCounts = {};
    
    for (const duplicate of this.duplicates) {
      for (const file of duplicate.files) {
        typeCounts[file.file_type] = (typeCounts[file.file_type] || 0) + 1;
      }
    }
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.duplicates.length > 0) {
      recommendations.push('Remove exact duplicate files to reduce storage and maintenance overhead');
      recommendations.push('Consolidate duplicate configuration files into a single source of truth');
    }
    
    if (this.similarities.length > 0) {
      recommendations.push('Review similar files to identify opportunities for template creation');
      recommendations.push('Consider refactoring similar code files to reduce duplication');
    }
    
    const systemsWithManyDuplicates = this.duplicates
      .flatMap(d => d.files.map(f => f.system))
      .reduce((acc, system) => {
        acc[system] = (acc[system] || 0) + 1;
        return acc;
      }, {});
    
    for (const [system, count] of Object.entries(systemsWithManyDuplicates)) {
      if (count > 3) {
        recommendations.push(`Review ${system} system for excessive duplication (${count} duplicate files)`);
      }
    }
    
    return recommendations;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    const md = [];
    
    md.push('# File Similarity Analysis Report');
    md.push(`**Generated**: ${report.metadata.generated_at}`);
    md.push(`**Total Files Analyzed**: ${report.metadata.total_files_analyzed}`);
    md.push('');
    
    // Summary
    md.push('## Summary');
    md.push(`- **Exact Duplicates**: ${report.metadata.exact_duplicates} groups`);
    md.push(`- **Similar File Pairs**: ${report.metadata.similar_pairs}`);
    md.push(`- **Systems with Duplicates**: ${report.summary.systems_with_duplicates.join(', ')}`);
    md.push('');
    
    // Exact Duplicates
    if (report.exact_duplicates.length > 0) {
      md.push('## Exact Duplicates');
      for (const [index, duplicate] of report.exact_duplicates.entries()) {
        md.push(`### Duplicate Group ${index + 1}`);
        md.push(`**Files**: ${duplicate.count}`);
        md.push(`**Hash**: \`${duplicate.hash}\``);
        md.push('**Locations**:');
        for (const file of duplicate.files) {
          md.push(`- \`${file.full_path}\` (${file.system})`);
        }
        md.push('');
      }
    }
    
    // Similar Files
    if (report.similar_files.length > 0) {
      md.push('## Similar Files');
      for (const [index, similar] of report.similar_files.entries()) {
        md.push(`### Similar Pair ${index + 1}`);
        md.push(`**Similarity**: ${(similar.similarity * 100).toFixed(1)}%`);
        md.push(`**File 1**: \`${similar.file1.full_path}\` (${similar.file1.system})`);
        md.push(`**File 2**: \`${similar.file2.full_path}\` (${similar.file2.system})`);
        md.push(`**Reasons**: ${similar.reason.join(', ')}`);
        md.push('');
      }
    }
    
    // Recommendations
    md.push('## Recommendations');
    for (const recommendation of report.summary.recommendations) {
      md.push(`- ${recommendation}`);
    }
    md.push('');
    
    return md.join('\n');
  }

  /**
   * Close database connections
   */
  async close() {
    for (const db of Object.values(this.databases)) {
      if (db) await db.close();
    }
  }

  /**
   * Main analysis method
   */
  async analyze() {
    try {
      await this.initialize();
      await this.loadAllFiles();
      await this.detectExactDuplicates();
      await this.detectSimilarFiles(0.7); // 70% similarity threshold
      const report = await this.generateReport();
      
      console.log('\n✅ File similarity analysis complete!');
      console.log(`📊 Found ${this.duplicates.length} exact duplicate groups`);
      console.log(`📊 Found ${this.similarities.length} similar file pairs`);
      
      return report;
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    } finally {
      await this.close();
    }
  }

  /**
   * Static runner
   */
  static async run() {
    const analyzer = new FileSimilarityAnalyzer();
    return await analyzer.analyze();
  }
}

// Run if called directly
if (require.main === module) {
  FileSimilarityAnalyzer.run().catch(console.error);
}

module.exports = FileSimilarityAnalyzer;

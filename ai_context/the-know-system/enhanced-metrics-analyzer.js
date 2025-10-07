#!/usr/bin/env node

/**
 * Enhanced Metrics Analyzer
 * Comprehensive metrics analysis beyond basic file similarity
 */

const UniversalDatabaseManager = require('./database-core-system/core/universal-database-manager');
const fs = require('fs-extra');
const path = require('path');

class EnhancedMetricsAnalyzer {
  constructor() {
    this.databases = {
      'the-know-intelligence': null,
      'template-system': null,
      'database-core': null,
      'peanut-butter-user': null,
      'report-system': null,
      'general': null
    };
    this.metrics = {
      content: {},
      complexity: {},
      relationships: {},
      quality: {},
      evolution: {}
    };
  }

  /**
   * Initialize database connections
   */
  async initialize() {
    console.log('📊 Initializing Enhanced Metrics Analyzer...\n');
    
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
   * Analyze content complexity metrics
   */
  async analyzeContentComplexity() {
    console.log('\n🧮 Analyzing Content Complexity...');
    
    const complexity = {
      codeComplexity: {},
      documentationDepth: {},
      configurationComplexity: {},
      templateComplexity: {}
    };
    
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      const files = await db.read('files');
      complexity.codeComplexity[systemName] = await this.analyzeCodeComplexity(files);
      complexity.documentationDepth[systemName] = await this.analyzeDocumentationDepth(files);
      complexity.configurationComplexity[systemName] = await this.analyzeConfigComplexity(files);
    }
    
    this.metrics.complexity = complexity;
    console.log(`   ✓ Analyzed complexity for ${Object.keys(this.databases).length} systems`);
  }

  /**
   * Analyze code complexity
   */
  async analyzeCodeComplexity(files) {
    const codeFiles = files.filter(f => f.file_type === 'javascript-code' || f.file_type === 'typescript-code');
    const complexity = {
      totalFiles: codeFiles.length,
      averageSize: 0,
      functionCount: 0,
      classCount: 0,
      complexityScore: 0
    };
    
    for (const file of codeFiles) {
      try {
        const content = await this.getFileContent(file.file_path);
        if (!content) continue;
        
        complexity.averageSize += content.length;
        complexity.functionCount += (content.match(/function\s+\w+|=>\s*{|\w+\s*\(/g) || []).length;
        complexity.classCount += (content.match(/class\s+\w+/g) || []).length;
        
        // Simple complexity score based on nesting and conditions
        const nestingLevel = this.calculateNestingLevel(content);
        const conditionals = (content.match(/if\s*\(|switch\s*\(|for\s*\(|while\s*\(/g) || []).length;
        complexity.complexityScore += nestingLevel + conditionals;
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    if (codeFiles.length > 0) {
      complexity.averageSize = Math.round(complexity.averageSize / codeFiles.length);
      complexity.complexityScore = Math.round(complexity.complexityScore / codeFiles.length);
    }
    
    return complexity;
  }

  /**
   * Calculate nesting level of code
   */
  calculateNestingLevel(content) {
    let maxNesting = 0;
    let currentNesting = 0;
    
    for (const char of content) {
      if (char === '{') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}') {
        currentNesting--;
      }
    }
    
    return maxNesting;
  }

  /**
   * Analyze documentation depth
   */
  async analyzeDocumentationDepth(files) {
    const docFiles = files.filter(f => f.file_type === 'markdown-documentation');
    const depth = {
      totalFiles: docFiles.length,
      averageLength: 0,
      headerLevels: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      linkCount: 0,
      codeBlockCount: 0,
      readabilityScore: 0
    };
    
    for (const file of docFiles) {
      try {
        const content = await this.getFileContent(file.file_path);
        if (!content) continue;
        
        depth.averageLength += content.length;
        
        // Count headers
        for (let i = 1; i <= 6; i++) {
          const headerRegex = new RegExp(`^#{${i}}\\s+`, 'gm');
          depth.headerLevels[`h${i}`] += (content.match(headerRegex) || []).length;
        }
        
        // Count links and code blocks
        depth.linkCount += (content.match(/\[.*?\]\(.*?\)/g) || []).length;
        depth.codeBlockCount += (content.match(/```[\s\S]*?```/g) || []).length;
        
        // Simple readability score (sentences per paragraph)
        const sentences = (content.match(/[.!?]+/g) || []).length;
        const paragraphs = content.split('\n\n').length;
        depth.readabilityScore += paragraphs > 0 ? sentences / paragraphs : 0;
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    if (docFiles.length > 0) {
      depth.averageLength = Math.round(depth.averageLength / docFiles.length);
      depth.readabilityScore = Math.round((depth.readabilityScore / docFiles.length) * 10) / 10;
    }
    
    return depth;
  }

  /**
   * Analyze configuration complexity
   */
  async analyzeConfigComplexity(files) {
    const configFiles = files.filter(f => f.file_type === 'json-configuration' || f.file_type === 'yaml-template');
    const complexity = {
      totalFiles: configFiles.length,
      averageKeys: 0,
      nestingDepth: 0,
      arrayCount: 0,
      duplicateKeys: 0
    };
    
    for (const file of configFiles) {
      try {
        const content = await this.getFileContent(file.file_path);
        if (!content) continue;
        
        if (file.file_type === 'json-configuration') {
          const parsed = JSON.parse(content);
          const analysis = this.analyzeObjectComplexity(parsed);
          complexity.averageKeys += analysis.keyCount;
          complexity.nestingDepth += analysis.depth;
          complexity.arrayCount += analysis.arrays;
        }
        
      } catch (error) {
        // Skip invalid JSON/YAML files
      }
    }
    
    if (configFiles.length > 0) {
      complexity.averageKeys = Math.round(complexity.averageKeys / configFiles.length);
      complexity.nestingDepth = Math.round(complexity.nestingDepth / configFiles.length);
    }
    
    return complexity;
  }

  /**
   * Analyze object complexity recursively
   */
  analyzeObjectComplexity(obj, depth = 0) {
    const analysis = { keyCount: 0, depth: depth, arrays: 0 };
    
    if (Array.isArray(obj)) {
      analysis.arrays++;
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          const subAnalysis = this.analyzeObjectComplexity(item, depth + 1);
          analysis.keyCount += subAnalysis.keyCount;
          analysis.depth = Math.max(analysis.depth, subAnalysis.depth);
          analysis.arrays += subAnalysis.arrays;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      analysis.keyCount = Object.keys(obj).length;
      for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
          const subAnalysis = this.analyzeObjectComplexity(value, depth + 1);
          analysis.keyCount += subAnalysis.keyCount;
          analysis.depth = Math.max(analysis.depth, subAnalysis.depth);
          analysis.arrays += subAnalysis.arrays;
        }
      }
    }
    
    return analysis;
  }

  /**
   * Analyze system relationships and dependencies
   */
  async analyzeSystemRelationships() {
    console.log('\n🔗 Analyzing System Relationships...');
    
    const relationships = {
      crossReferences: {},
      sharedPatterns: {},
      dependencyGraph: {},
      isolationScore: {}
    };
    
    // Analyze cross-references between systems
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (!db) continue;
      
      const files = await db.read('files');
      relationships.crossReferences[systemName] = await this.findCrossReferences(files, systemName);
      relationships.isolationScore[systemName] = this.calculateIsolationScore(files);
    }
    
    this.metrics.relationships = relationships;
    console.log(`   ✓ Analyzed relationships for ${Object.keys(this.databases).length} systems`);
  }

  /**
   * Find cross-references between systems
   */
  async findCrossReferences(files, currentSystem) {
    const references = {};
    const otherSystems = Object.keys(this.databases).filter(s => s !== currentSystem);
    
    for (const system of otherSystems) {
      references[system] = 0;
    }
    
    for (const file of files) {
      try {
        const content = await this.getFileContent(file.file_path);
        if (!content) continue;
        
        for (const system of otherSystems) {
          // Look for system name mentions
          const systemMentions = (content.match(new RegExp(system, 'gi')) || []).length;
          references[system] += systemMentions;
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return references;
  }

  /**
   * Calculate isolation score (how self-contained a system is)
   */
  calculateIsolationScore(files) {
    // Higher score = more isolated/self-contained
    const totalFiles = files.length;
    const internalReferences = files.filter(f => 
      f.file_path && f.file_path.includes(f.system)
    ).length;
    
    return totalFiles > 0 ? Math.round((internalReferences / totalFiles) * 100) : 0;
  }

  /**
   * Get file content helper
   */
  async getFileContent(filePath) {
    try {
      if (!await fs.pathExists(filePath)) return '';
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      return '';
    }
  }

  /**
   * Generate comprehensive metrics report
   */
  async generateReport() {
    console.log('\n📊 Generating Enhanced Metrics Report...');
    
    const report = {
      metadata: {
        generated_at: new Date().toISOString(),
        analyzer_version: '1.0.0',
        systems_analyzed: Object.keys(this.databases).length
      },
      complexity_metrics: this.metrics.complexity,
      relationship_metrics: this.metrics.relationships,
      summary: {
        most_complex_system: this.findMostComplexSystem(),
        most_isolated_system: this.findMostIsolatedSystem(),
        recommendations: this.generateAdvancedRecommendations()
      }
    };
    
    // Save reports
    await fs.writeFile('./enhanced-metrics-report.json', JSON.stringify(report, null, 2));
    
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile('./enhanced-metrics-report.md', markdownReport);
    
    console.log('   ✓ Enhanced metrics reports saved');
    return report;
  }

  /**
   * Find most complex system
   */
  findMostComplexSystem() {
    let maxComplexity = 0;
    let mostComplex = 'none';
    
    for (const [system, complexity] of Object.entries(this.metrics.complexity.codeComplexity)) {
      if (complexity.complexityScore > maxComplexity) {
        maxComplexity = complexity.complexityScore;
        mostComplex = system;
      }
    }
    
    return { system: mostComplex, score: maxComplexity };
  }

  /**
   * Find most isolated system
   */
  findMostIsolatedSystem() {
    let maxIsolation = 0;
    let mostIsolated = 'none';
    
    for (const [system, score] of Object.entries(this.metrics.relationships.isolationScore)) {
      if (score > maxIsolation) {
        maxIsolation = score;
        mostIsolated = system;
      }
    }
    
    return { system: mostIsolated, score: maxIsolation };
  }

  /**
   * Generate advanced recommendations
   */
  generateAdvancedRecommendations() {
    const recommendations = [];
    
    // Code complexity recommendations
    const complexSystems = Object.entries(this.metrics.complexity.codeComplexity)
      .filter(([_, complexity]) => complexity.complexityScore > 10);
    
    if (complexSystems.length > 0) {
      recommendations.push(`Refactor high-complexity systems: ${complexSystems.map(([s]) => s).join(', ')}`);
    }
    
    // Documentation recommendations
    const poorlyDocumented = Object.entries(this.metrics.complexity.documentationDepth)
      .filter(([_, depth]) => depth.totalFiles < 2);
    
    if (poorlyDocumented.length > 0) {
      recommendations.push(`Improve documentation for: ${poorlyDocumented.map(([s]) => s).join(', ')}`);
    }
    
    return recommendations;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    const md = [];
    
    md.push('# Enhanced Metrics Analysis Report');
    md.push(`**Generated**: ${report.metadata.generated_at}`);
    md.push(`**Systems Analyzed**: ${report.metadata.systems_analyzed}`);
    md.push('');
    
    md.push('## Complexity Analysis');
    md.push('### Code Complexity by System');
    for (const [system, complexity] of Object.entries(report.complexity_metrics.codeComplexity)) {
      md.push(`**${system}**:`);
      md.push(`- Files: ${complexity.totalFiles}`);
      md.push(`- Avg Size: ${complexity.averageSize} chars`);
      md.push(`- Functions: ${complexity.functionCount}`);
      md.push(`- Complexity Score: ${complexity.complexityScore}`);
      md.push('');
    }
    
    md.push('## Recommendations');
    for (const rec of report.summary.recommendations) {
      md.push(`- ${rec}`);
    }
    
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
      await this.analyzeContentComplexity();
      await this.analyzeSystemRelationships();
      const report = await this.generateReport();
      
      console.log('\n✅ Enhanced metrics analysis complete!');
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
    const analyzer = new EnhancedMetricsAnalyzer();
    return await analyzer.analyze();
  }
}

// Run if called directly
if (require.main === module) {
  EnhancedMetricsAnalyzer.run().catch(console.error);
}

module.exports = EnhancedMetricsAnalyzer;

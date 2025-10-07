#!/usr/bin/env node

/**
 * External Project Navigator
 * Specialized tool for analyzing and navigating challenging external repositories
 */

const UniversalDatabaseManager = require('./database-core-system/core/universal-database-manager');
const fs = require('fs-extra');
const path = require('path');

class ExternalProjectNavigator {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd();
    this.projectName = path.basename(this.projectPath);
    this.databases = {
      'project-overview': null,
      'core-systems': null,
      'legacy-code': null,
      'infrastructure': null,
      'documentation': null,
      'unknown': null
    };
    this.navigationPlan = {
      phases: [],
      priorities: [],
      risks: [],
      opportunities: []
    };
  }

  /**
   * Initialize navigation for external project
   */
  async initialize() {
    console.log(`🧭 Initializing External Project Navigator`);
    console.log(`📁 Project: ${this.projectName}`);
    console.log(`📍 Path: ${this.projectPath}\n`);

    // Initialize specialized databases
    for (const [systemName, _] of Object.entries(this.databases)) {
      const dbManager = new UniversalDatabaseManager({
        basePath: `${this.projectPath}/navigation-analysis/${systemName}`,
        projectName: `${this.projectName}-${systemName}`
      });
      
      await dbManager.initialize();
      this.databases[systemName] = dbManager;
      console.log(`   ✓ ${systemName} navigation database initialized`);
    }
  }

  /**
   * Perform comprehensive project analysis
   */
  async analyzeProject() {
    console.log('\n🔍 Analyzing External Project Structure...\n');

    // Phase 1: Discovery
    await this.discoverProjectStructure();
    
    // Phase 2: Categorization
    await this.categorizeComponents();
    
    // Phase 3: Complexity Analysis
    await this.analyzeComplexity();
    
    // Phase 4: Risk Assessment
    await this.assessRisks();
    
    // Phase 5: Navigation Planning
    await this.createNavigationPlan();
    
    // Phase 6: Generate Reports
    await this.generateNavigationReports();
  }

  /**
   * Discover project structure and components
   */
  async discoverProjectStructure() {
    console.log('📂 Phase 1: Discovering Project Structure...');
    
    const files = await this.getAllFiles(this.projectPath);
    const structure = {
      totalFiles: files.length,
      directories: new Set(),
      fileTypes: {},
      sizeDistribution: { small: 0, medium: 0, large: 0, huge: 0 },
      languages: new Set()
    };

    for (const filePath of files) {
      if (this.shouldSkipFile(filePath)) continue;
      
      const relativePath = path.relative(this.projectPath, filePath);
      const dir = path.dirname(relativePath);
      const ext = path.extname(filePath);
      
      structure.directories.add(dir);
      structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
      
      // Analyze file size
      try {
        const stat = await fs.stat(filePath);
        if (stat.size < 1000) structure.sizeDistribution.small++;
        else if (stat.size < 10000) structure.sizeDistribution.medium++;
        else if (stat.size < 100000) structure.sizeDistribution.large++;
        else structure.sizeDistribution.huge++;
        
        // Detect language
        const language = this.detectLanguage(ext);
        if (language) structure.languages.add(language);
      } catch (error) {
        // Skip files that can't be analyzed
      }
    }

    // Store discovery results
    const db = this.databases['project-overview'];
    await db.create('projects', {
      name: this.projectName,
      description: 'External project analysis',
      project_type: 'external-analysis',
      status: 'analyzing',
      metadata: JSON.stringify({
        discovery: {
          total_files: structure.totalFiles,
          directories: Array.from(structure.directories).length,
          file_types: structure.fileTypes,
          size_distribution: structure.sizeDistribution,
          languages: Array.from(structure.languages)
        }
      })
    });

    console.log(`   ✓ Discovered ${structure.totalFiles} files`);
    console.log(`   ✓ Found ${Array.from(structure.directories).length} directories`);
    console.log(`   ✓ Detected languages: ${Array.from(structure.languages).join(', ')}`);
  }

  /**
   * Categorize components by system type
   */
  async categorizeComponents() {
    console.log('\n🏷️  Phase 2: Categorizing Components...');
    
    const files = await this.getAllFiles(this.projectPath);
    const categories = {
      'core-systems': [],
      'legacy-code': [],
      'infrastructure': [],
      'documentation': [],
      'unknown': []
    };

    for (const filePath of files) {
      if (this.shouldSkipFile(filePath)) continue;
      
      const category = this.categorizeFile(filePath);
      const fileInfo = await this.analyzeFile(filePath);
      categories[category].push(fileInfo);
    }

    // Store categorized files in respective databases
    for (const [category, files] of Object.entries(categories)) {
      const db = this.databases[category];
      
      const project = await db.create('projects', {
        name: `${this.projectName} - ${category}`,
        description: `${category} components from external project`,
        project_type: category,
        status: 'active'
      });

      for (const file of files) {
        await db.create('files', {
          name: file.name,
          description: `${category} file: ${file.type}`,
          file_path: file.path,
          file_type: file.type,
          project_id: project.id,
          size: file.size,
          relationships: JSON.stringify(file.metadata)
        });
      }
      
      console.log(`   ✓ Categorized ${files.length} files as ${category}`);
    }
  }

  /**
   * Analyze complexity and technical debt
   */
  async analyzeComplexity() {
    console.log('\n🧮 Phase 3: Analyzing Complexity...');
    
    const complexityMetrics = {
      high_complexity_files: [],
      technical_debt_indicators: [],
      dependency_complexity: {},
      maintainability_scores: {}
    };

    // Analyze each system for complexity
    for (const [systemName, db] of Object.entries(this.databases)) {
      if (systemName === 'project-overview') continue;
      
      const files = await db.read('files');
      let systemComplexity = 0;
      
      for (const file of files) {
        const complexity = await this.calculateFileComplexity(file.file_path);
        systemComplexity += complexity.score;
        
        if (complexity.score > 15) {
          complexityMetrics.high_complexity_files.push({
            file: file.file_path,
            system: systemName,
            complexity: complexity.score,
            issues: complexity.issues
          });
        }
      }
      
      complexityMetrics.maintainability_scores[systemName] = {
        total_files: files.length,
        average_complexity: files.length > 0 ? systemComplexity / files.length : 0,
        maintainability: this.calculateMaintainabilityScore(systemComplexity, files.length)
      };
    }

    // Store complexity analysis
    const db = this.databases['project-overview'];
    await db.create('metadata', {
      name: 'Complexity Analysis',
      description: 'Project complexity and technical debt analysis',
      entity_type: 'project',
      entity_id: this.projectName,
      key_name: 'complexity_metrics',
      value_data: JSON.stringify(complexityMetrics),
      data_type: 'json'
    });

    console.log(`   ✓ Found ${complexityMetrics.high_complexity_files.length} high-complexity files`);
    console.log(`   ✓ Analyzed maintainability across ${Object.keys(complexityMetrics.maintainability_scores).length} systems`);
  }

  /**
   * Assess project risks and challenges
   */
  async assessRisks() {
    console.log('\n⚠️  Phase 4: Assessing Risks...');
    
    const risks = {
      high_risk_areas: [],
      dependency_risks: [],
      technical_debt_risks: [],
      knowledge_gaps: []
    };

    // Identify high-risk areas
    const complexityData = await this.databases['project-overview'].read('metadata', {
      key_name: 'complexity_metrics'
    });
    
    if (complexityData.length > 0) {
      const metrics = JSON.parse(complexityData[0].value_data);
      
      // High complexity = high risk
      risks.high_risk_areas = metrics.high_complexity_files.map(file => ({
        area: file.file,
        risk_level: file.complexity > 25 ? 'critical' : 'high',
        reason: `High complexity score: ${file.complexity}`,
        mitigation: 'Requires careful analysis and potential refactoring'
      }));
      
      // Systems with low maintainability = technical debt risk
      for (const [system, scores] of Object.entries(metrics.maintainability_scores)) {
        if (scores.maintainability < 0.6) {
          risks.technical_debt_risks.push({
            system: system,
            risk_level: scores.maintainability < 0.4 ? 'critical' : 'high',
            maintainability_score: scores.maintainability,
            recommendation: 'Priority candidate for refactoring'
          });
        }
      }
    }

    // Store risk assessment
    await this.databases['project-overview'].create('metadata', {
      name: 'Risk Assessment',
      description: 'Project risks and mitigation strategies',
      entity_type: 'project',
      entity_id: this.projectName,
      key_name: 'risk_assessment',
      value_data: JSON.stringify(risks),
      data_type: 'json'
    });

    console.log(`   ✓ Identified ${risks.high_risk_areas.length} high-risk areas`);
    console.log(`   ✓ Found ${risks.technical_debt_risks.length} technical debt risks`);
  }

  /**
   * Create strategic navigation plan
   */
  async createNavigationPlan() {
    console.log('\n🗺️  Phase 5: Creating Navigation Plan...');
    
    const plan = {
      recommended_approach: 'systematic-exploration',
      phases: [
        {
          phase: 1,
          name: 'Foundation Understanding',
          focus: 'documentation and infrastructure',
          duration: '1-2 days',
          goals: ['Understand project purpose', 'Identify key systems', 'Map dependencies']
        },
        {
          phase: 2,
          name: 'Core System Analysis',
          focus: 'core business logic and main workflows',
          duration: '3-5 days',
          goals: ['Understand core functionality', 'Map data flows', 'Identify integration points']
        },
        {
          phase: 3,
          name: 'Complex System Deep Dive',
          focus: 'high-complexity and legacy systems',
          duration: '5-10 days',
          goals: ['Understand complex algorithms', 'Identify refactoring opportunities', 'Document findings']
        }
      ],
      priority_order: [],
      risk_mitigation: []
    };

    // Generate priority order based on complexity and risk
    const systems = Object.keys(this.databases).filter(s => s !== 'project-overview');
    plan.priority_order = systems.sort((a, b) => {
      // Start with documentation, then infrastructure, then core, then legacy
      const priority = { 'documentation': 1, 'infrastructure': 2, 'core-systems': 3, 'legacy-code': 4, 'unknown': 5 };
      return (priority[a] || 5) - (priority[b] || 5);
    });

    // Store navigation plan
    await this.databases['project-overview'].create('metadata', {
      name: 'Navigation Plan',
      description: 'Strategic plan for exploring the external project',
      entity_type: 'project',
      entity_id: this.projectName,
      key_name: 'navigation_plan',
      value_data: JSON.stringify(plan),
      data_type: 'json'
    });

    this.navigationPlan = plan;
    console.log(`   ✓ Created ${plan.phases.length}-phase navigation plan`);
    console.log(`   ✓ Prioritized ${plan.priority_order.length} systems for exploration`);
  }

  /**
   * Generate comprehensive navigation reports
   */
  async generateNavigationReports() {
    console.log('\n📊 Phase 6: Generating Navigation Reports...');
    
    // Create executive summary
    const summary = await this.generateExecutiveSummary();
    
    // Create detailed system reports
    const systemReports = await this.generateSystemReports();
    
    // Create navigation guide
    const navigationGuide = await this.generateNavigationGuide();
    
    // Save reports
    await fs.writeFile(
      path.join(this.projectPath, 'PROJECT_NAVIGATION_SUMMARY.md'),
      summary
    );
    
    await fs.writeFile(
      path.join(this.projectPath, 'NAVIGATION_GUIDE.md'),
      navigationGuide
    );

    console.log('   ✓ Generated PROJECT_NAVIGATION_SUMMARY.md');
    console.log('   ✓ Generated NAVIGATION_GUIDE.md');
    console.log('   ✓ Created navigation databases for ongoing analysis');
  }

  // Helper methods
  async getAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        const subFiles = await this.getAllFiles(fullPath);
        files.push(...subFiles);
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  shouldSkipFile(filePath) {
    const skipPatterns = ['node_modules', '.git', '.db', 'backup', '.log', '.tmp'];
    return skipPatterns.some(pattern => filePath.includes(pattern));
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'backups', '.tmp', '.cache'];
    return skipDirs.includes(dirName);
  }

  categorizeFile(filePath) {
    const relativePath = path.relative(this.projectPath, filePath).toLowerCase();
    
    // Documentation
    if (relativePath.includes('doc') || relativePath.includes('readme') || filePath.endsWith('.md')) {
      return 'documentation';
    }
    
    // Infrastructure
    if (relativePath.includes('config') || relativePath.includes('deploy') || relativePath.includes('infra')) {
      return 'infrastructure';
    }
    
    // Legacy code indicators
    if (relativePath.includes('legacy') || relativePath.includes('old') || relativePath.includes('deprecated')) {
      return 'legacy-code';
    }
    
    // Core systems (main source code)
    if (relativePath.includes('src') || relativePath.includes('core') || relativePath.includes('main')) {
      return 'core-systems';
    }
    
    return 'unknown';
  }

  async analyzeFile(filePath) {
    try {
      const stat = await fs.stat(filePath);
      return {
        name: path.basename(filePath),
        path: path.relative(this.projectPath, filePath),
        size: stat.size,
        type: this.detectFileType(filePath),
        metadata: {}
      };
    } catch (error) {
      return null;
    }
  }

  detectFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.js': 'javascript', '.ts': 'typescript', '.py': 'python',
      '.java': 'java', '.cpp': 'cpp', '.c': 'c',
      '.md': 'markdown', '.txt': 'text', '.json': 'json',
      '.yaml': 'yaml', '.yml': 'yaml', '.xml': 'xml',
      '.html': 'html', '.css': 'css', '.sql': 'sql'
    };
    return typeMap[ext] || 'unknown';
  }

  detectLanguage(ext) {
    const langMap = {
      '.js': 'JavaScript', '.ts': 'TypeScript', '.py': 'Python',
      '.java': 'Java', '.cpp': 'C++', '.c': 'C',
      '.rb': 'Ruby', '.php': 'PHP', '.go': 'Go',
      '.rs': 'Rust', '.swift': 'Swift', '.kt': 'Kotlin'
    };
    return langMap[ext];
  }

  async calculateFileComplexity(filePath) {
    // Simplified complexity calculation
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n').length;
      const functions = (content.match(/function|def |class |interface /g) || []).length;
      const conditionals = (content.match(/if |switch |for |while /g) || []).length;
      
      const score = Math.round((lines / 10) + (functions * 2) + (conditionals * 1.5));
      
      return {
        score: score,
        issues: score > 20 ? ['High complexity', 'Consider refactoring'] : []
      };
    } catch (error) {
      return { score: 0, issues: [] };
    }
  }

  calculateMaintainabilityScore(totalComplexity, fileCount) {
    if (fileCount === 0) return 1;
    const avgComplexity = totalComplexity / fileCount;
    return Math.max(0, Math.min(1, (30 - avgComplexity) / 30));
  }

  async generateExecutiveSummary() {
    return `# ${this.projectName} - Navigation Summary\n\nGenerated: ${new Date().toISOString()}\n\n## Quick Overview\n- Project analyzed and categorized\n- Navigation databases created\n- Strategic exploration plan generated\n\n## Next Steps\n1. Review NAVIGATION_GUIDE.md\n2. Start with documentation system\n3. Follow recommended exploration phases\n`;
  }

  async generateSystemReports() {
    // Implementation for detailed system reports
    return {};
  }

  async generateNavigationGuide() {
    const phases = this.navigationPlan.phases || [];
    let guide = `# Navigation Guide for ${this.projectName}\n\n`;
    
    guide += `## Recommended Exploration Strategy\n\n`;
    
    phases.forEach((phase, index) => {
      guide += `### Phase ${phase.phase}: ${phase.name}\n`;
      guide += `**Duration**: ${phase.duration}\n`;
      guide += `**Focus**: ${phase.focus}\n\n`;
      guide += `**Goals**:\n`;
      phase.goals.forEach(goal => {
        guide += `- ${goal}\n`;
      });
      guide += `\n`;
    });
    
    return guide;
  }

  async close() {
    for (const db of Object.values(this.databases)) {
      if (db) await db.close();
    }
  }

  /**
   * Static runner
   */
  static async run(projectPath) {
    const navigator = new ExternalProjectNavigator(projectPath);
    try {
      await navigator.initialize();
      await navigator.analyzeProject();
      console.log('\n✅ External Project Navigation Analysis Complete!');
      console.log('📋 Check PROJECT_NAVIGATION_SUMMARY.md for overview');
      console.log('🗺️  Check NAVIGATION_GUIDE.md for exploration strategy');
    } catch (error) {
      console.error('❌ Navigation analysis failed:', error.message);
    } finally {
      await navigator.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const projectPath = process.argv[2] || process.cwd();
  ExternalProjectNavigator.run(projectPath).catch(console.error);
}

module.exports = ExternalProjectNavigator;

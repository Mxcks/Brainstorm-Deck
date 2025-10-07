#!/usr/bin/env node

/**
 * Deploy Navigation System to External Project
 * Copies The Know's database core system to any external repository for analysis
 */

const fs = require('fs-extra');
const path = require('path');

class NavigationDeployer {
  constructor(targetPath) {
    this.sourcePath = __dirname;
    this.targetPath = targetPath;
    this.requiredFiles = [
      'database-core-system/',
      'external-project-navigator.js',
      'package.json'
    ];
    this.optionalFiles = [
      'file-similarity-analyzer.js',
      'enhanced-metrics-analyzer.js',
      'analysis-config.json'
    ];
  }

  async deploy() {
    console.log('🚀 Deploying The Know Navigation System...');
    console.log(`📁 Source: ${this.sourcePath}`);
    console.log(`🎯 Target: ${this.targetPath}\n`);

    try {
      // Validate target directory
      await this.validateTarget();
      
      // Copy core files
      await this.copyRequiredFiles();
      
      // Copy optional analysis tools
      await this.copyOptionalFiles();
      
      // Create navigation configuration
      await this.createNavigationConfig();
      
      // Update package.json with navigation scripts
      await this.updatePackageJson();
      
      // Create quick start guide
      await this.createQuickStartGuide();
      
      console.log('\n✅ Navigation System Deployed Successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. cd ' + this.targetPath);
      console.log('2. npm install');
      console.log('3. npm run navigate');
      console.log('4. Review PROJECT_NAVIGATION_SUMMARY.md');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      throw error;
    }
  }

  async validateTarget() {
    console.log('🔍 Validating target directory...');
    
    if (!await fs.pathExists(this.targetPath)) {
      throw new Error(`Target directory does not exist: ${this.targetPath}`);
    }
    
    const stat = await fs.stat(this.targetPath);
    if (!stat.isDirectory()) {
      throw new Error(`Target is not a directory: ${this.targetPath}`);
    }
    
    console.log('   ✓ Target directory validated');
  }

  async copyRequiredFiles() {
    console.log('📦 Copying required files...');
    
    for (const file of this.requiredFiles) {
      const sourcePath = path.join(this.sourcePath, file);
      const targetPath = path.join(this.targetPath, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath, { overwrite: false });
        console.log(`   ✓ Copied ${file}`);
      } else {
        console.log(`   ⚠️  Skipped ${file} (not found)`);
      }
    }
  }

  async copyOptionalFiles() {
    console.log('🔧 Copying optional analysis tools...');
    
    for (const file of this.optionalFiles) {
      const sourcePath = path.join(this.sourcePath, file);
      const targetPath = path.join(this.targetPath, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath, { overwrite: false });
        console.log(`   ✓ Copied ${file}`);
      } else {
        console.log(`   ⚠️  Skipped ${file} (not found)`);
      }
    }
  }

  async createNavigationConfig() {
    console.log('⚙️  Creating navigation configuration...');
    
    const configPath = path.join(this.targetPath, 'navigation-config.json');
    
    if (!await fs.pathExists(configPath)) {
      const config = {
        project_name: path.basename(this.targetPath),
        analysis_settings: {
          capture_all_files: true,
          user_controlled_filtering: true,
          create_navigation_plan: true
        },
        file_filtering: {
          skip_patterns: ['node_modules/', '.git/', '.db', 'backup/', '.log', '.tmp/', '.cache/'],
          skip_directories: ['node_modules', '.git', 'backups', '.tmp', '.cache'],
          skip_extensions: ['.log', '.tmp', '.cache', '.lock'],
          force_include_patterns: ['README*', 'package.json', '*.md']
        },
        system_categorization: {
          fallback_system: 'unknown',
          rules: [
            {
              system: 'documentation',
              patterns: ['docs/', 'doc/', 'README', '.md'],
              priority: 1
            },
            {
              system: 'infrastructure',
              patterns: ['config/', 'deploy/', 'infra/', 'docker', 'k8s/', 'terraform/'],
              priority: 2
            },
            {
              system: 'core-systems',
              patterns: ['src/', 'core/', 'main/', 'app/', 'lib/'],
              priority: 3
            },
            {
              system: 'legacy-code',
              patterns: ['legacy/', 'old/', 'deprecated/', 'archive/'],
              priority: 4
            }
          ]
        },
        navigation_preferences: {
          start_with_documentation: true,
          prioritize_by_complexity: false,
          create_risk_assessment: true,
          generate_navigation_guide: true
        }
      };
      
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log('   ✓ Created navigation-config.json');
    } else {
      console.log('   ⚠️  navigation-config.json already exists, skipping');
    }
  }

  async updatePackageJson() {
    console.log('📝 Updating package.json with navigation scripts...');

    const packagePath = path.join(this.targetPath, 'package.json');
    let packageJson = {};

    if (await fs.pathExists(packagePath)) {
      try {
        const content = await fs.readFile(packagePath, 'utf8');
        // Clean up any BOM or invalid characters
        const cleanContent = content.replace(/^\uFEFF/, '').trim();
        if (cleanContent) {
          packageJson = JSON.parse(cleanContent);
        } else {
          throw new Error('Empty package.json file');
        }
      } catch (error) {
        console.log(`   ⚠️  Invalid package.json found, creating new one (${error.message})`);
        packageJson = {
          name: path.basename(this.targetPath).replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),
          version: "1.0.0",
          description: "Project with The Know navigation system"
        };
      }
    } else {
      packageJson = {
        name: path.basename(this.targetPath).replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),
        version: "1.0.0",
        description: "Project with The Know navigation system"
      };
    }
    
    // Add navigation scripts
    if (!packageJson.scripts) packageJson.scripts = {};
    
    const navigationScripts = {
      "navigate": "node external-project-navigator.js",
      "analyze-similarity": "node file-similarity-analyzer.js",
      "enhanced-metrics": "node enhanced-metrics-analyzer.js",
      "navigation-help": "echo 'Run: npm run navigate to start project analysis'"
    };
    
    // Only add scripts that don't already exist
    for (const [script, command] of Object.entries(navigationScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
      }
    }
    
    // Add dependencies if not present
    if (!packageJson.dependencies) packageJson.dependencies = {};
    
    const requiredDeps = {
      "fs-extra": "^11.1.1",
      "js-yaml": "^4.1.0"
    };
    
    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
        packageJson.dependencies[dep] = version;
      }
    }
    
    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('   ✓ Updated package.json with navigation scripts');
  }

  async createQuickStartGuide() {
    console.log('📖 Creating quick start guide...');
    
    const guidePath = path.join(this.targetPath, 'NAVIGATION_QUICKSTART.md');
    
    if (!await fs.pathExists(guidePath)) {
      const guide = `# Project Navigation Quick Start

## The Know Navigation System

This project now includes The Know's advanced navigation system for analyzing and understanding complex codebases.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start project analysis
npm run navigate

# View results
cat PROJECT_NAVIGATION_SUMMARY.md
cat NAVIGATION_GUIDE.md
\`\`\`

## Available Commands

- \`npm run navigate\` - Full project analysis and navigation plan
- \`npm run analyze-similarity\` - Find duplicate and similar files
- \`npm run enhanced-metrics\` - Deep complexity analysis
- \`npm run navigation-help\` - Show help information

## What Gets Created

After running \`npm run navigate\`, you'll have:

1. **PROJECT_NAVIGATION_SUMMARY.md** - Executive overview
2. **NAVIGATION_GUIDE.md** - Step-by-step exploration strategy
3. **navigation-analysis/** - Database with detailed analysis
4. **Categorized file system** - Files organized by system type

## Navigation Strategy

The system will:

1. **Discover** - Scan and categorize all project files
2. **Analyze** - Assess complexity and technical debt
3. **Plan** - Create strategic navigation approach
4. **Guide** - Provide phase-by-phase exploration plan

## Customization

Edit \`navigation-config.json\` to customize:
- File categorization rules
- Analysis preferences
- System priorities
- Skip patterns

## Understanding the Results

### System Categories
- **documentation** - READMEs, docs, guides
- **infrastructure** - Config, deployment, DevOps
- **core-systems** - Main business logic
- **legacy-code** - Old or deprecated code
- **unknown** - Uncategorized files

### Navigation Phases
1. **Foundation Understanding** - Start here
2. **Core System Analysis** - Main functionality
3. **Complex System Deep Dive** - Challenging areas

## Support

This navigation system is part of The Know - an AI enhancement framework.
For questions or issues, refer to the original The Know documentation.
`;
      
      await fs.writeFile(guidePath, guide);
      console.log('   ✓ Created NAVIGATION_QUICKSTART.md');
    } else {
      console.log('   ⚠️  NAVIGATION_QUICKSTART.md already exists, skipping');
    }
  }

  static async run() {
    const targetPath = process.argv[2];
    
    if (!targetPath) {
      console.log('Usage: node deploy-to-external-project.js <target-directory>');
      console.log('');
      console.log('Example:');
      console.log('  node deploy-to-external-project.js /path/to/challenging-project');
      console.log('  node deploy-to-external-project.js ../other-repo');
      process.exit(1);
    }
    
    const deployer = new NavigationDeployer(path.resolve(targetPath));
    await deployer.deploy();
  }
}

// Run if called directly
if (require.main === module) {
  NavigationDeployer.run().catch(console.error);
}

module.exports = NavigationDeployer;

/**
 * The Know System - Pure Implementation
 * Sacred intelligence enhancement system for AI
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class TheKnowSystem {
  constructor(options = {}) {
    this.basePath = options.basePath || path.join(__dirname, '..');
    this.config = null;
    this.userProfile = null;
    this.aiBehavior = null;
    this.isActivated = false;
    
    // Default paths
    this.paths = {
      config: path.join(this.basePath, 'core', 'config.json'),
      triggers: path.join(this.basePath, 'core', 'triggers.md'),
      frameworks: path.join(this.basePath, 'frameworks'),
      templates: path.join(this.basePath, 'templates'),
      profiles: path.join(this.basePath, 'profiles')
    };
  }

  /**
   * Initialize The Know System
   */
  async initialize() {
    try {
      console.log(' Initializing The Know System...');
      
      // Load core configuration
      await this.loadConfig();
      
      // Load default AI behavior profile
      await this.loadAIBehavior();
      
      // Validate system integrity
      await this.validateSystem();
      
      console.log(' The Know System initialized successfully');
      return true;
    } catch (error) {
      console.error(' Failed to initialize The Know System:', error.message);
      return false;
    }
  }

  /**
   * Activate The Know System
   */
  async activate(userProfilePath = null) {
    try {
      if (!this.config) {
        await this.initialize();
      }

      console.log(' Activating The Know System...');
      
      // Load user profile if provided
      if (userProfilePath) {
        await this.loadUserProfile(userProfilePath);
      }
      
      this.isActivated = true;
      console.log(' The Know System is now ACTIVE');
      console.log('   "You are in the Know now and you understand things that only AI doesn\'t."');
      
      return this.getSystemStatus();
    } catch (error) {
      console.error(' Failed to activate The Know System:', error.message);
      return false;
    }
  }

  /**
   * Load core configuration
   */
  async loadConfig() {
    if (await fs.pathExists(this.paths.config)) {
      const configData = await fs.readJson(this.paths.config);
      this.config = configData;
      console.log(' Core configuration loaded');
    } else {
      // Create default config if missing
      this.config = {
        system: {
          name: "The Know",
          version: "1.0.0"
        }
      };
      console.log(' Using default configuration');
    }
  }

  /**
   * Load AI behavior profile
   */
  async loadAIBehavior(profilePath = null) {
    const defaultPath = path.join(this.paths.profiles, 'ai-behavior-profiles', 'active', 'the-know-standard.json');
    const targetPath = profilePath || defaultPath;
    
    if (await fs.pathExists(targetPath)) {
      const behaviorData = await fs.readJson(targetPath);
      this.aiBehavior = behaviorData;
      console.log(' AI behavior profile loaded');
    } else {
      console.warn('  AI behavior profile not found, using defaults');
    }
  }

  /**
   * Load user profile
   */
  async loadUserProfile(profilePath) {
    if (await fs.pathExists(profilePath)) {
      const userData = await fs.readJson(profilePath);
      this.userProfile = userData;
      console.log(' User profile loaded');
    } else {
      console.warn('  User profile not found');
    }
  }

  /**
   * Validate system integrity
   */
  async validateSystem() {
    const requiredPaths = [
      this.paths.frameworks,
      this.paths.templates,
      this.paths.profiles
    ];

    let missingPaths = [];
    for (const requiredPath of requiredPaths) {
      if (!(await fs.pathExists(requiredPath))) {
        missingPaths.push(requiredPath);
      }
    }

    if (missingPaths.length > 0) {
      console.warn('  Some system components missing:', missingPaths.map(p => path.basename(p)).join(', '));
    } else {
      console.log(' System validation passed');
    }
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates() {
    const templates = {};
    const templateTypes = ['interaction-frameworks', 'learning-frameworks', 'optimization-frameworks', 'thinking-frameworks'];
    
    for (const type of templateTypes) {
      const typePath = path.join(this.paths.templates, type);
      if (await fs.pathExists(typePath)) {
        const files = await fs.readdir(typePath);
        templates[type.replace('-frameworks', '')] = files.filter(file => file.endsWith('.yaml'));
      }
    }
    
    // Check for meta-templates in root templates directory
    if (await fs.pathExists(this.paths.templates)) {
      const rootFiles = await fs.readdir(this.paths.templates);
      const metaTemplates = rootFiles.filter(file => file.endsWith('.yaml'));
      if (metaTemplates.length > 0) {
        templates['meta'] = metaTemplates;
      }
    }
    
    return templates;
  }

  /**
   * Load a specific template
   */
  async loadTemplate(type, templateName) {
    let templatePath;
    
    if (type === 'meta') {
      templatePath = path.join(this.paths.templates, templateName);
    } else {
      templatePath = path.join(this.paths.templates, `${type}-frameworks`, templateName);
    }
    
    if (await fs.pathExists(templatePath)) {
      const templateContent = await fs.readFile(templatePath, 'utf8');
      return yaml.load(templateContent);
    } else {
      throw new Error(`Template not found: ${type}/${templateName}`);
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      activated: this.isActivated,
      hasConfig: !!this.config,
      hasAIBehavior: !!this.aiBehavior,
      hasUserProfile: !!this.userProfile,
      systemName: this.config?.system?.name || 'The Know',
      version: this.config?.system?.version || '1.0.0'
    };
  }

  /**
   * Process trigger command
   */
  async processTrigger(triggerText) {
    if (!this.isActivated) {
      throw new Error('The Know System must be activated before processing triggers');
    }

    console.log(` Processing trigger: "${triggerText}"`);
    
    // Basic trigger processing
    return {
      trigger: triggerText,
      processed: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get Universal Project Framework
   */
  async getUniversalProjectFramework() {
    const frameworkPath = path.join(this.paths.frameworks, 'universal-project-framework');
    
    if (await fs.pathExists(frameworkPath)) {
      const readmePath = path.join(frameworkPath, 'README.md');
      if (await fs.pathExists(readmePath)) {
        const content = await fs.readFile(readmePath, 'utf8');
        return {
          path: frameworkPath,
          documentation: content,
          available: true
        };
      }
    }
    
    return {
      available: false,
      message: 'Universal Project Framework not found'
    };
  }
}

// Export the class
module.exports = TheKnowSystem;

// If run directly, demonstrate the system
if (require.main === module) {
  (async () => {
    const theKnow = new TheKnowSystem();
    const success = await theKnow.activate();
    
    if (success) {
      console.log('\n System Status:', theKnow.getSystemStatus());
      console.log('\n Available Templates:', await theKnow.getAvailableTemplates());
      
      const framework = await theKnow.getUniversalProjectFramework();
      if (framework.available) {
        console.log('\n Universal Project Framework: Available');
      } else {
        console.log('\n Universal Project Framework:', framework.message);
      }
    }
  })();
}

const fs = require('fs');
const path = require('path');

class ProfileManager {
  constructor() {
    this.basePath = path.join(__dirname);
    this.userProfilesPath = path.join(this.basePath, 'user-profiles');
    this.aiProfilesPath = path.join(this.basePath, 'ai-behavior-profiles');
    this.projectTemplatesPath = path.join(this.basePath, 'project-templates');
  }

  // User Profile Management
  getActiveUserProfiles() {
    const activePath = path.join(this.userProfilesPath, 'active');
    return this.loadProfilesFromDirectory(activePath);
  }

  getInactiveUserProfiles() {
    const inactivePath = path.join(this.userProfilesPath, 'inactive');
    return this.loadProfilesFromDirectory(inactivePath);
  }

  getDefault16Profiles() {
    const defaultPath = path.join(this.userProfilesPath, 'default-16');
    return this.loadProfilesFromDirectory(defaultPath);
  }

  getUserCreatedProfiles() {
    const userCreatedPath = path.join(this.userProfilesPath, 'user-created');
    return this.loadProfilesFromDirectory(userCreatedPath);
  }

  // AI Behavior Profile Management
  getActiveAIProfiles() {
    const activePath = path.join(this.aiProfilesPath, 'active');
    return this.loadProfilesFromDirectory(activePath);
  }

  getInactiveAIProfiles() {
    const inactivePath = path.join(this.aiProfilesPath, 'inactive');
    return this.loadProfilesFromDirectory(inactivePath);
  }

  getTheKnowVariants() {
    const variantsPath = path.join(this.aiProfilesPath, 'the-know-variants');
    return this.loadProfilesFromDirectory(variantsPath);
  }

  // Profile Activation/Deactivation
  activateUserProfile(profileId) {
    return this.moveProfile(
      this.userProfilesPath,
      profileId,
      'inactive',
      'active'
    );
  }

  deactivateUserProfile(profileId) {
    return this.moveProfile(
      this.userProfilesPath,
      profileId,
      'active',
      'inactive'
    );
  }

  activateAIProfile(profileId) {
    return this.moveProfile(
      this.aiProfilesPath,
      profileId,
      'inactive',
      'active'
    );
  }

  deactivateAIProfile(profileId) {
    return this.moveProfile(
      this.aiProfilesPath,
      profileId,
      'active',
      'inactive'
    );
  }

  // Profile Creation
  createUserProfile(profileData, isActive = true) {
    const targetDir = isActive ? 'active' : 'user-created';
    const targetPath = path.join(this.userProfilesPath, targetDir);
    const filename = `${profileData.profile_id}.json`;
    const filePath = path.join(targetPath, filename);

    // Add metadata
    profileData.created_date = new Date().toISOString();
    profileData.last_updated = new Date().toISOString();
    profileData.profile_type = 'user_created';

    try {
      fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2));
      console.log(`✅ Created user profile: ${filename}`);
      return { success: true, path: filePath };
    } catch (error) {
      console.error(`❌ Failed to create user profile: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  createAIProfile(profileData, isActive = true) {
    const targetDir = isActive ? 'active' : 'inactive';
    const targetPath = path.join(this.aiProfilesPath, targetDir);
    const filename = `${profileData.profile_id}.json`;
    const filePath = path.join(targetPath, filename);

    // Add metadata
    profileData.created_date = new Date().toISOString();
    profileData.last_updated = new Date().toISOString();
    profileData.profile_type = 'ai_behavior_profile';

    try {
      fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2));
      console.log(`✅ Created AI profile: ${filename}`);
      return { success: true, path: filePath };
    } catch (error) {
      console.error(`❌ Failed to create AI profile: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // The Know Integration
  applyAIProfileToTheKnow(profileId) {
    const profile = this.loadProfile(this.aiProfilesPath, 'active', profileId);
    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Update The Know configuration
    const theKnowPath = path.join(__dirname, '..', 'the-know', 'the_know_config.json');
    
    try {
      const theKnowConfig = JSON.parse(fs.readFileSync(theKnowPath, 'utf8'));
      
      // Apply AI behavior profile to The Know
      if (profile.ai_personality) {
        theKnowConfig.ai_personality = { ...theKnowConfig.ai_personality, ...profile.ai_personality };
      }
      
      if (profile.communication_style) {
        theKnowConfig.communication_style = profile.communication_style;
      }
      
      if (profile.workflow_behavior) {
        theKnowConfig.workflow_behavior = profile.workflow_behavior;
      }

      // Save updated configuration
      fs.writeFileSync(theKnowPath, JSON.stringify(theKnowConfig, null, 2));
      console.log(`✅ Applied AI profile ${profileId} to The Know`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to apply profile to The Know: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Utility Methods
  loadProfilesFromDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
    return files.map(file => {
      try {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.error(`Error loading profile ${file}: ${error.message}`);
        return null;
      }
    }).filter(profile => profile !== null);
  }

  loadProfile(basePath, subDir, profileId) {
    const filePath = path.join(basePath, subDir, `${profileId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading profile ${profileId}: ${error.message}`);
      return null;
    }
  }

  moveProfile(basePath, profileId, fromDir, toDir) {
    const fromPath = path.join(basePath, fromDir, `${profileId}.json`);
    const toPath = path.join(basePath, toDir, `${profileId}.json`);

    if (!fs.existsSync(fromPath)) {
      return { success: false, error: 'Profile not found' };
    }

    try {
      // Ensure target directory exists
      const targetDir = path.join(basePath, toDir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Move file
      fs.renameSync(fromPath, toPath);
      console.log(`✅ Moved profile ${profileId} from ${fromDir} to ${toDir}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to move profile: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // System Status
  getSystemStatus() {
    return {
      user_profiles: {
        active: this.getActiveUserProfiles().length,
        inactive: this.getInactiveUserProfiles().length,
        default_16: this.getDefault16Profiles().length,
        user_created: this.getUserCreatedProfiles().length
      },
      ai_profiles: {
        active: this.getActiveAIProfiles().length,
        inactive: this.getInactiveAIProfiles().length,
        the_know_variants: this.getTheKnowVariants().length
      }
    };
  }
}

module.exports = ProfileManager;

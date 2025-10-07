/**
 * Database Backup Utility
 * Creates backups of the entire database system
 */

const UniversalDatabaseManager = require('../core/universal-database-manager');
const path = require('path');
const fs = require('fs-extra');

class DatabaseBackup {
  constructor(options = {}) {
    this.dbManager = new UniversalDatabaseManager(options);
    this.backupBasePath = options.backupPath || './backups';
  }

  async createBackup(options = {}) {
    try {
      console.log(' Starting database backup...');
      
      await this.dbManager.initialize();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = options.name || `backup-${timestamp}`;
      const backupPath = path.join(this.backupBasePath, backupName);
      
      // Create backup directory
      await fs.ensureDir(backupPath);
      
      // Backup databases
      const backupDir = await this.dbManager.backup(this.backupBasePath);
      
      // Create backup manifest
      const manifest = await this.createBackupManifest(backupDir);
      await fs.writeJson(path.join(backupDir, 'manifest.json'), manifest, { spaces: 2 });
      
      console.log(` Backup completed: ${backupDir}`);
      console.log(` Backup manifest:`, manifest);
      
      await this.dbManager.close();
      return backupDir;
      
    } catch (error) {
      console.error(' Backup failed:', error);
      throw error;
    }
  }

  async createBackupManifest(backupDir) {
    const stats = await this.dbManager.getSystemStats();
    
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      backupPath: backupDir,
      statistics: stats,
      files: await this.getBackupFiles(backupDir)
    };
  }

  async getBackupFiles(backupDir) {
    const files = await fs.readdir(backupDir);
    const fileStats = {};
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stat = await fs.stat(filePath);
      fileStats[file] = {
        size: stat.size,
        modified: stat.mtime.toISOString()
      };
    }
    
    return fileStats;
  }

  async listBackups() {
    try {
      if (!(await fs.pathExists(this.backupBasePath))) {
        console.log(' No backups directory found');
        return [];
      }
      
      const backups = await fs.readdir(this.backupBasePath);
      const backupInfo = [];
      
      for (const backup of backups) {
        const backupPath = path.join(this.backupBasePath, backup);
        const manifestPath = path.join(backupPath, 'manifest.json');
        
        if (await fs.pathExists(manifestPath)) {
          const manifest = await fs.readJson(manifestPath);
          backupInfo.push({
            name: backup,
            path: backupPath,
            timestamp: manifest.timestamp,
            statistics: manifest.statistics
          });
        }
      }
      
      return backupInfo.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
    } catch (error) {
      console.error(' Failed to list backups:', error);
      return [];
    }
  }

  async restoreBackup(backupName, targetPath = './databases') {
    try {
      console.log(` Restoring backup: ${backupName}`);
      
      const backupPath = path.join(this.backupBasePath, backupName);
      
      if (!(await fs.pathExists(backupPath))) {
        throw new Error(`Backup not found: ${backupName}`);
      }
      
      // Ensure target directory exists
      await fs.ensureDir(targetPath);
      
      // Copy database files
      const files = await fs.readdir(backupPath);
      const dbFiles = files.filter(file => file.endsWith('.db'));
      
      for (const dbFile of dbFiles) {
        const sourcePath = path.join(backupPath, dbFile);
        const targetFilePath = path.join(targetPath, dbFile);
        
        await fs.copy(sourcePath, targetFilePath);
        console.log(` Restored: ${dbFile}`);
      }
      
      console.log(` Backup restored to: ${targetPath}`);
      return targetPath;
      
    } catch (error) {
      console.error(' Restore failed:', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const backup = new DatabaseBackup();
  
  (async () => {
    try {
      switch (command) {
        case 'create':
          const backupName = args[1];
          await backup.createBackup({ name: backupName });
          break;
          
        case 'list':
          const backups = await backup.listBackups();
          console.log('\n Available Backups:');
          backups.forEach(b => {
            console.log(`  ${b.name} - ${b.timestamp}`);
            console.log(`    Records: ${Object.values(b.statistics.databases).reduce((sum, db) => sum + db.records, 0)}`);
          });
          break;
          
        case 'restore':
          const restoreBackup = args[1];
          const targetPath = args[2];
          if (!restoreBackup) {
            console.error(' Usage: node backup.js restore <backup-name> [target-path]');
            process.exit(1);
          }
          await backup.restoreBackup(restoreBackup, targetPath);
          break;
          
        default:
          console.log(' Database Backup Utility');
          console.log('Usage:');
          console.log('  node backup.js create [backup-name]');
          console.log('  node backup.js list');
          console.log('  node backup.js restore <backup-name> [target-path]');
      }
    } catch (error) {
      console.error(' Operation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = DatabaseBackup;

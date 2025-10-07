import type { Project } from '../types'
import {
  AppSettings,
  ComponentTemplate,
  CanvasComponent,
  APIResponse,
  ServiceResponse
} from '../types'

// In a real app, this would interface with the file system or a database
// For development, we'll simulate file operations with localStorage and static imports

class DataService {
  private static instance: DataService
  private projects: Project[] = []
  private settings: any = null

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  // Load projects from our user-data folder (simulated)
  async loadProjects(): Promise<Project[]> {
    let staticProjects: Project[] = []
    let userProjects: Project[] = []

    // Load static sample projects from JSON file
    try {
      const response = await fetch('/user-data/projects.json')
      if (response.ok) {
        const projectsData = await response.json()
        staticProjects = projectsData.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          lastModified: new Date(p.lastModified)
        }))
      }
    } catch (error) {
      console.warn('Could not load static projects from file:', error)
    }

    // Load user-created projects from localStorage
    const savedProjects = localStorage.getItem('visual-canvas-projects')
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          lastModified: new Date(p.lastModified)
        }))
        userProjects = parsed
      } catch (error) {
        console.error('Failed to parse saved projects:', error)
      }
    }

    // Merge static and user projects, with user projects taking precedence for duplicates
    const allProjects = [...staticProjects]
    userProjects.forEach(userProject => {
      const existingIndex = allProjects.findIndex(p => p.id === userProject.id)
      if (existingIndex >= 0) {
        allProjects[existingIndex] = userProject // User version overrides static
      } else {
        allProjects.push(userProject) // Add new user project
      }
    })

    this.projects = allProjects
    return this.projects
  }

  // Save projects (in development, this saves to localStorage)
  async saveProjects(projects: Project[]): Promise<void> {
    this.projects = projects
    // In development, save to localStorage
    // In production, this would write to the user data directory
    localStorage.setItem('visual-canvas-projects', JSON.stringify(projects))
  }

  // Load user settings
  async loadSettings(): Promise<any> {
    if (this.settings) {
      return this.settings
    }

    try {
      const response = await fetch('/user-data/settings.json')
      if (response.ok) {
        this.settings = await response.json()
        return this.settings
      }
    } catch (error) {
      console.warn('Could not load settings from file:', error)
    }

    // Default settings if file not found
    this.settings = {
      user: {
        name: "User",
        preferences: {
          theme: "dark",
          autoSave: true,
          autoSaveInterval: 30000,
          gridSnap: true,
          gridSize: 20,
          showGrid: true
        }
      },
      canvas: {
        defaultZoom: 1.0,
        minZoom: 0.1,
        maxZoom: 3.0,
        panSensitivity: 1.0,
        zoomSensitivity: 0.1
      }
    }

    return this.settings
  }

  // Load component templates
  async loadTemplates(): Promise<any[]> {
    const templates = []
    
    try {
      // Load feature template
      const featureResponse = await fetch('/user-data/templates/feature-template.json')
      if (featureResponse.ok) {
        templates.push(await featureResponse.json())
      }

      // Load task template
      const taskResponse = await fetch('/user-data/templates/task-template.json')
      if (taskResponse.ok) {
        templates.push(await taskResponse.json())
      }
    } catch (error) {
      console.warn('Could not load templates:', error)
    }

    return templates
  }

  // Get a specific project by ID
  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id)
  }

  // Add a new project
  async addProject(project: Project): Promise<void> {
    this.projects.push(project)
    await this.saveProjects(this.projects)
  }

  // Update an existing project
  async updateProject(project: Project): Promise<void> {
    const index = this.projects.findIndex(p => p.id === project.id)
    if (index !== -1) {
      this.projects[index] = { ...project, lastModified: new Date() }
      await this.saveProjects(this.projects)
    }
  }

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    this.projects = this.projects.filter(p => p.id !== id)
    await this.saveProjects(this.projects)
  }

  // ============================================================================
  // ENHANCED API METHODS WITH RESPONSE TYPES
  // ============================================================================

  /**
   * Add project with API response
   */
  async addProjectWithResponse(project: Project): Promise<APIResponse<Project>> {
    try {
      await this.addProject(project)
      return {
        success: true,
        data: project,
        message: 'Project created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project'
      }
    }
  }

  /**
   * Update project with API response
   */
  async updateProjectWithResponse(project: Project): Promise<APIResponse<Project>> {
    try {
      await this.updateProject(project)
      return {
        success: true,
        data: project,
        message: 'Project updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project'
      }
    }
  }

  /**
   * Delete project with API response
   */
  async deleteProjectWithResponse(id: string): Promise<APIResponse<void>> {
    try {
      await this.deleteProject(id)
      return {
        success: true,
        message: 'Project deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project'
      }
    }
  }

  // ============================================================================
  // COMPONENT TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Save component templates
   */
  async saveComponentTemplates(templates: ComponentTemplate[]): Promise<void> {
    localStorage.setItem('visual-canvas-component-templates', JSON.stringify(templates))
  }

  /**
   * Load component templates with proper typing
   */
  async loadComponentTemplates(): Promise<ComponentTemplate[]> {
    try {
      const stored = localStorage.getItem('visual-canvas-component-templates')
      if (stored) {
        const templates = JSON.parse(stored)
        return templates.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load component templates:', error)
    }

    return this.getDefaultComponentTemplates()
  }

  /**
   * Get default component templates
   */
  private getDefaultComponentTemplates(): ComponentTemplate[] {
    return [
      {
        id: 'button-primary',
        name: 'Primary Button',
        description: 'A primary action button with sage green styling',
        category: 'ui-elements',
        type: 'button',
        defaultData: {
          text: 'Button',
          variant: 'primary',
          size: 'medium'
        },
        defaultVisualProperties: {
          backgroundColor: '#7c9885',
          color: '#ffffff',
          borderRadius: '6px',
          padding: { top: 12, right: 24, bottom: 12, left: 24 },
          fontSize: '14px',
          fontWeight: '500'
        },
        defaultSize: { width: 120, height: 40, minWidth: 60, minHeight: 30 },
        tags: ['button', 'primary', 'action'],
        usageCount: 0,
        rating: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'input-text',
        name: 'Text Input',
        description: 'A styled text input field',
        category: 'forms',
        type: 'input',
        defaultData: {
          placeholder: 'Enter text...',
          inputType: 'text'
        },
        defaultVisualProperties: {
          backgroundColor: '#161b22',
          color: '#e6edf3',
          borderColor: '#30363d',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '6px',
          padding: { top: 12, right: 16, bottom: 12, left: 16 },
          fontSize: '14px'
        },
        defaultSize: { width: 200, height: 40, minWidth: 100, minHeight: 30 },
        tags: ['input', 'text', 'form'],
        usageCount: 0,
        rating: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  // ============================================================================
  // SETTINGS MANAGEMENT WITH PROPER TYPING
  // ============================================================================

  /**
   * Load settings with proper typing
   */
  async loadAppSettings(): Promise<AppSettings> {
    const settings = await this.loadSettings()

    // Ensure the settings match our AppSettings interface
    return {
      user: {
        name: settings.user?.name || 'User',
        email: settings.user?.email,
        preferences: {
          theme: settings.user?.preferences?.theme || 'dark',
          language: settings.user?.preferences?.language || 'en',
          autoSave: settings.user?.preferences?.autoSave ?? true,
          autoSaveInterval: settings.user?.preferences?.autoSaveInterval || 30000,
          showGrid: settings.user?.preferences?.showGrid ?? true,
          snapToGrid: settings.user?.preferences?.snapToGrid ?? true,
          showRulers: settings.user?.preferences?.showRulers ?? false,
          showGuides: settings.user?.preferences?.showGuides ?? true
        }
      },
      canvas: {
        defaultZoom: settings.canvas?.defaultZoom || 1.0,
        minZoom: settings.canvas?.minZoom || 0.1,
        maxZoom: settings.canvas?.maxZoom || 3.0,
        panSensitivity: settings.canvas?.panSensitivity || 1.0,
        zoomSensitivity: settings.canvas?.zoomSensitivity || 0.1,
        gridSize: settings.canvas?.gridSize || 20,
        gridColor: settings.canvas?.gridColor || 'rgba(245, 245, 220, 0.1)'
      },
      editor: {
        showPropertyPanel: settings.editor?.showPropertyPanel ?? true,
        showComponentTree: settings.editor?.showComponentTree ?? true,
        showCodePreview: settings.editor?.showCodePreview ?? false,
        autoSelectOnCreate: settings.editor?.autoSelectOnCreate ?? true,
        duplicateOffset: settings.editor?.duplicateOffset || 20
      },
      export: {
        defaultFramework: settings.export?.defaultFramework || 'react',
        defaultStyling: settings.export?.defaultStyling || 'css',
        includeComments: settings.export?.includeComments ?? true,
        formatCode: settings.export?.formatCode ?? true,
        exportPath: settings.export?.exportPath || './generated-components'
      }
    }
  }

  /**
   * Save app settings
   */
  async saveAppSettings(settings: AppSettings): Promise<void> {
    // Convert to the format expected by the existing loadSettings method
    const settingsData = {
      user: settings.user,
      canvas: settings.canvas,
      editor: settings.editor,
      export: settings.export
    }

    localStorage.setItem('visual-canvas-app-settings', JSON.stringify(settingsData))
  }

  // ============================================================================
  // ENHANCED PROJECT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Load a single project by ID
   */
  async loadProject(id: string): Promise<Project | null> {
    const projects = await this.loadProjects()
    return projects.find(p => p.id === id) || null
  }

  /**
   * Save a single project
   */
  async saveProject(project: Project): Promise<void> {
    const projects = await this.loadProjects()
    const existingIndex = projects.findIndex(p => p.id === project.id)

    if (existingIndex >= 0) {
      projects[existingIndex] = project
    } else {
      projects.push(project)
    }

    await this.saveProjects(projects)
  }

  /**
   * Delete a project by ID
   */
  async deleteProject(id: string): Promise<void> {
    const projects = await this.loadProjects()
    const filteredProjects = projects.filter(p => p.id !== id)
    await this.saveProjects(filteredProjects)
  }

  /**
   * Save projects array to storage
   */
  private async saveProjects(projects: Project[]): Promise<void> {
    // Save user projects to localStorage (excluding static projects)
    const userProjects = projects.filter(p => !p.id.startsWith('static_'))
    localStorage.setItem('visual-canvas-projects', JSON.stringify(userProjects))
  }

  /**
   * Create backup of all data
   */
  async createBackup(): Promise<string> {
    const projects = await this.loadProjects()
    const settings = await this.loadAppSettings()
    const templates = await this.loadComponentTemplates()

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      projects,
      settings,
      templates
    }

    return JSON.stringify(backup, null, 2)
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupData: string): Promise<ServiceResponse<boolean>> {
    try {
      const backup = JSON.parse(backupData)

      // Validate backup structure
      if (!backup.projects || !backup.settings || !backup.templates) {
        return {
          success: false,
          error: 'Invalid backup format',
          timestamp: new Date()
        }
      }

      // Restore projects
      await this.saveProjects(backup.projects)

      // Restore settings
      await this.saveAppSettings(backup.settings)

      // Restore templates
      await this.saveComponentTemplates(backup.templates)

      return {
        success: true,
        data: true,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to restore backup: ${error}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    localStorage.removeItem('visual-canvas-projects')
    localStorage.removeItem('visual-canvas-app-settings')
    localStorage.removeItem('visual-canvas-component-templates')
    this.projects = []
    this.settings = null
  }
}

export default DataService

import type { Project } from '../App'

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
}

export default DataService

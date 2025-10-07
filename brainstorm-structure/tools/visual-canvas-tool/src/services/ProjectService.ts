/**
 * ProjectService - Handles all project management operations
 * Provides CRUD operations, project creation workflow, and state management
 */

import { v4 as uuidv4 } from 'uuid'
import { 
  Project, 
  ProjectCreateRequest, 
  ProjectUpdateRequest, 
  ProjectSearchFilters,
  ServiceResponse,
  ProjectStatus,
  CanvasState,
  ViewportState,
  GridSettings,
  ProjectSettings,
  ProjectMetadata
} from '../types'
import DataService from './dataService'

export class ProjectService {
  private static instance: ProjectService
  private dataService: DataService
  private projects: Map<string, Project> = new Map()
  private currentProject: Project | null = null

  private constructor() {
    this.dataService = DataService.getInstance()
    this.loadProjects()
  }

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService()
    }
    return ProjectService.instance
  }

  // ============================================================================
  // PROJECT CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new project
   */
  public async createProject(request: ProjectCreateRequest): Promise<ServiceResponse<Project>> {
    try {
      const project: Project = {
        id: uuidv4(),
        name: request.name,
        description: request.description || '',
        createdAt: new Date(),
        lastModified: new Date(),
        status: 'draft',
        version: '1.0.0',
        canvasState: this.createDefaultCanvasState(),
        settings: this.createDefaultProjectSettings(request.settings),
        metadata: this.createDefaultProjectMetadata()
      }

      // Save to storage
      await this.dataService.saveProject(project)
      
      // Add to local cache
      this.projects.set(project.id, project)

      return {
        success: true,
        data: project,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create project: ${error}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Get project by ID
   */
  public async getProject(id: string): Promise<ServiceResponse<Project>> {
    try {
      // Check local cache first
      if (this.projects.has(id)) {
        return {
          success: true,
          data: this.projects.get(id)!,
          timestamp: new Date()
        }
      }

      // Load from storage
      const project = await this.dataService.loadProject(id)
      if (project) {
        this.projects.set(id, project)
        return {
          success: true,
          data: project,
          timestamp: new Date()
        }
      }

      return {
        success: false,
        error: 'Project not found',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get project: ${error}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Update existing project
   */
  public async updateProject(request: ProjectUpdateRequest): Promise<ServiceResponse<Project>> {
    try {
      const existingProject = this.projects.get(request.id)
      if (!existingProject) {
        return {
          success: false,
          error: 'Project not found',
          timestamp: new Date()
        }
      }

      const updatedProject: Project = {
        ...existingProject,
        ...request,
        lastModified: new Date(),
        canvasState: request.canvasState ? 
          { ...existingProject.canvasState, ...request.canvasState } : 
          existingProject.canvasState,
        settings: request.settings ? 
          { ...existingProject.settings, ...request.settings } : 
          existingProject.settings,
        metadata: request.metadata ? 
          { ...existingProject.metadata, ...request.metadata } : 
          existingProject.metadata
      }

      // Save to storage
      await this.dataService.updateProject(updatedProject)
      
      // Update local cache
      this.projects.set(updatedProject.id, updatedProject)

      return {
        success: true,
        data: updatedProject,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update project: ${error}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Delete project
   */
  public async deleteProject(id: string): Promise<ServiceResponse<boolean>> {
    try {
      // Remove from storage
      await this.dataService.deleteProject(id)
      
      // Remove from local cache
      this.projects.delete(id)

      // Clear current project if it was deleted
      if (this.currentProject?.id === id) {
        this.currentProject = null
      }

      return {
        success: true,
        data: true,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete project: ${error}`,
        timestamp: new Date()
      }
    }
  }

  /**
   * Get all projects with optional filtering
   */
  public async getProjects(filters?: ProjectSearchFilters): Promise<ServiceResponse<Project[]>> {
    try {
      await this.loadProjects()
      
      let projects = Array.from(this.projects.values())

      // Apply filters
      if (filters) {
        projects = this.applyFilters(projects, filters)
      }

      return {
        success: true,
        data: projects,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get projects: ${error}`,
        timestamp: new Date()
      }
    }
  }

  // ============================================================================
  // PROJECT STATE MANAGEMENT
  // ============================================================================

  /**
   * Set current active project
   */
  public setCurrentProject(project: Project | null): void {
    this.currentProject = project
  }

  /**
   * Get current active project
   */
  public getCurrentProject(): Project | null {
    return this.currentProject
  }

  /**
   * Duplicate project
   */
  public async duplicateProject(id: string, newName?: string): Promise<ServiceResponse<Project>> {
    try {
      const originalProject = this.projects.get(id)
      if (!originalProject) {
        return {
          success: false,
          error: 'Original project not found',
          timestamp: new Date()
        }
      }

      const duplicatedProject: Project = {
        ...originalProject,
        id: uuidv4(),
        name: newName || `${originalProject.name} (Copy)`,
        createdAt: new Date(),
        lastModified: new Date(),
        status: 'draft'
      }

      // Save to storage
      await this.dataService.saveProject(duplicatedProject)
      
      // Add to local cache
      this.projects.set(duplicatedProject.id, duplicatedProject)

      return {
        success: true,
        data: duplicatedProject,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to duplicate project: ${error}`,
        timestamp: new Date()
      }
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async loadProjects(): Promise<void> {
    try {
      const projects = await this.dataService.loadProjects()
      this.projects.clear()
      projects.forEach(project => {
        this.projects.set(project.id, project)
      })
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  private createDefaultCanvasState(): CanvasState {
    return {
      viewport: {
        x: 0,
        y: 0,
        scale: 1
      },
      components: [],
      selectedComponentIds: [],
      gridSettings: {
        size: 20,
        visible: true,
        snapToGrid: true,
        color: '#30363d'
      },
      history: [],
      currentHistoryIndex: -1,
      clipboard: [],
      dragState: null
    }
  }

  private createDefaultProjectSettings(overrides?: Partial<ProjectSettings>): ProjectSettings {
    return {
      theme: 'dark',
      autoSave: true,
      autoSaveInterval: 30000,
      ...overrides
    }
  }

  private createDefaultProjectMetadata(): ProjectMetadata {
    return {
      tags: [],
      componentCount: 0,
      fileSize: 0,
      exportFormats: ['react', 'html']
    }
  }

  private applyFilters(projects: Project[], filters: ProjectSearchFilters): Project[] {
    let filtered = projects

    if (filters.status) {
      filtered = filtered.filter(p => filters.status!.includes(p.status))
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        filters.tags!.some(tag => p.metadata.tags.includes(tag))
      )
    }

    if (filters.category) {
      filtered = filtered.filter(p => p.metadata.category === filters.category)
    }

    if (filters.author) {
      filtered = filtered.filter(p => p.metadata.author === filters.author)
    }

    if (filters.dateRange) {
      filtered = filtered.filter(p => 
        p.createdAt >= filters.dateRange!.start && 
        p.createdAt <= filters.dateRange!.end
      )
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy!]
        const bVal = b[filters.sortBy!]
        const order = filters.sortOrder === 'desc' ? -1 : 1
        
        if (aVal < bVal) return -1 * order
        if (aVal > bVal) return 1 * order
        return 0
      })
    }

    return filtered
  }
}

export default ProjectService

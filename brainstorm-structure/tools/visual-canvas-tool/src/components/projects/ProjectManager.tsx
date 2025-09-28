import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Project } from '../../App'
import './ProjectManager.css'

interface ProjectManagerProps {
  projects: Project[]
  setProjects: (projects: Project[]) => void
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  setProjects,
  currentProject,
  setCurrentProject
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('visual-canvas-projects')
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          lastModified: new Date(p.lastModified)
        }))
        setProjects(parsed)
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }
  }, [setProjects])

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('visual-canvas-projects', JSON.stringify(projects))
    }
  }, [projects])

  const createProject = () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: uuidv4(),
      name: newProjectName.trim(),
      createdAt: new Date(),
      lastModified: new Date(),
      canvasState: {
        viewport: { x: 0, y: 0, scale: 1 },
        components: []
      }
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    setCurrentProject(newProject)
    setNewProjectName('')
    setIsCreating(false)
    setIsDropdownOpen(false)
  }

  const selectProject = (project: Project) => {
    setCurrentProject(project)
    setIsDropdownOpen(false)
  }

  const deleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId)
      setProjects(updatedProjects)
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createProject()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setNewProjectName('')
    }
  }

  return (
    <div className="project-manager">
      <div className="project-selector">
        <button 
          className="current-project-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {currentProject ? currentProject.name : 'Select Project'}
          <span className="dropdown-arrow">▼</span>
        </button>

        {isDropdownOpen && (
          <div className="project-dropdown">
            <div className="project-list">
              {projects.map(project => (
                <div 
                  key={project.id}
                  className={`project-item ${currentProject?.id === project.id ? 'active' : ''}`}
                  onClick={() => selectProject(project)}
                >
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-date">
                      Modified: {project.lastModified.toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    className="delete-button"
                    onClick={(e) => deleteProject(project.id, e)}
                    title="Delete project"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="project-actions">
              {isCreating ? (
                <div className="create-project-form">
                  <input
                    type="text"
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoFocus
                  />
                  <div className="form-buttons">
                    <button onClick={createProject} disabled={!newProjectName.trim()}>
                      Create
                    </button>
                    <button onClick={() => setIsCreating(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="new-project-button"
                  onClick={() => setIsCreating(true)}
                >
                  + New Project
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectManager

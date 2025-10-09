import { useState, useEffect } from 'react'
import './App.css'
import VisualCanvas from './components/VisualCanvas'
import LayerPanel from './components/LayerPanel'
import Switch from './components/Switch'
// import ThemeProvider from './styles/ThemeProvider'

// Simple types for now
interface Project {
  id: string
  name: string
  createdAt: Date
  lastModified: Date
  canvasState: {
    components: any[]
  }
}

// Project Selection Component
function ProjectSelector({
  projects,
  onSelectProject,
  onCreateProject,
  isLoading
}: {
  projects: Project[]
  onSelectProject: (project: Project) => void
  onCreateProject: (projectName: string) => void
  isLoading: boolean
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim())
      setNewProjectName('')
      setShowCreateForm(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="project-selector-overlay">
      <div className="project-selector-modal">
        <h2>Select a Project</h2>

        {projects.length > 0 && (
          <div className="existing-projects">
            <h3>Recent Projects</h3>
            <div className="project-list">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="project-item"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      {project.canvasState.components.length} components •
                      Modified {formatDate(project.lastModified)}
                    </div>
                  </div>
                  <div className="project-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="create-project-section">
          {!showCreateForm ? (
            <button
              className="create-project-btn"
              onClick={() => setShowCreateForm(true)}
              disabled={isLoading}
            >
              + Create New Project
            </button>
          ) : (
            <div className="create-form">
              <input
                type="text"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                autoFocus
              />
              <div className="form-buttons">
                <button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                  Create
                </button>
                <button onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple Sidebar Component
function SimpleSidebar({
  onCreateComponent,
  isCollapsed,
  onToggleCollapse
}: {
  onCreateComponent: (type: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="collapse-switch">
          <Switch
            checked={!isCollapsed}
            onChange={(checked) => onToggleCollapse()}
            id="sidebar-toggle"
          />
        </div>
        {!isCollapsed && <span>Component Library</span>}
      </div>
      
      {!isCollapsed && (
        <div className="sidebar-content">
          <div className="tool-section">
            <h3>Create Components</h3>
            <button onClick={() => onCreateComponent('button')}>🔘 Button</button>
            <button onClick={() => onCreateComponent('input')}>📝 Input</button>
            <button onClick={() => onCreateComponent('text')}>🔤 Text</button>
            <button onClick={() => onCreateComponent('container')}>📦 Container</button>
            <button onClick={() => onCreateComponent('switch')}>🔄 Switch</button>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isPanelsOpen, setIsPanelsOpen] = useState(false)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    // Load projects from localStorage
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
  }

  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem('visual-canvas-projects', JSON.stringify(updatedProjects))
    setProjects(updatedProjects)
  }

  const handleCreateProject = (projectName: string) => {
    // Create project with the name from the ProjectSelector form
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      createdAt: new Date(),
      lastModified: new Date(),
      canvasState: {
        components: []
      }
    }

    const updatedProjects = [...projects, newProject]
    saveProjects(updatedProjects)
    setCurrentProject(newProject)
    console.log('✅ Project created:', newProject)
  }

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    console.log('✅ Project selected:', project)
  }

  const handleCreateComponent = (type: string) => {
    console.log('Creating component:', type)

    if (!currentProject) {
      alert('Please create a project first!')
      return
    }

    const newComponent = {
      id: Date.now().toString(),
      type,
      name: `${type}_${Date.now()}`,
      position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 100 },
      zIndex: currentProject.canvasState.components.length // New components go to front
    }

    const updatedProject = {
      ...currentProject,
      canvasState: {
        components: [...currentProject.canvasState.components, newComponent]
      },
      lastModified: new Date()
    }

    // Update projects list and save
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
    saveProjects(updatedProjects)
    setCurrentProject(updatedProject)
    console.log(`✅ Created ${type} component:`, newComponent)
  }

  const handleComponentUpdate = (updatedComponent: any) => {
    if (!currentProject) return

    const updatedProject = {
      ...currentProject,
      canvasState: {
        components: currentProject.canvasState.components.map(c =>
          c.id === updatedComponent.id ? updatedComponent : c
        )
      },
      lastModified: new Date()
    }

    // Update projects list and save
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
    saveProjects(updatedProjects)
    setCurrentProject(updatedProject)
  }

  const handleComponentDelete = (componentId: string) => {
    if (!currentProject) return

    const updatedProject = {
      ...currentProject,
      canvasState: {
        components: currentProject.canvasState.components.filter(c => c.id !== componentId)
      },
      lastModified: new Date()
    }

    // Update projects list and save
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
    saveProjects(updatedProjects)
    setCurrentProject(updatedProject)
    console.log(`🗑️ Deleted component: ${componentId}`)
  }

  const handleComponentReorder = (componentId: string, newIndex: number) => {
    if (!currentProject) return

    const components = [...currentProject.canvasState.components]

    // Sort components by current zIndex to get proper order
    const sortedComponents = components.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))

    // Find the component being moved
    const componentIndex = sortedComponents.findIndex(c => c.id === componentId)
    if (componentIndex === -1) return

    // Remove component from current position
    const [movedComponent] = sortedComponents.splice(componentIndex, 1)

    // Insert at new position
    sortedComponents.splice(newIndex, 0, movedComponent)

    // Reassign zIndex values (highest index = front layer)
    const updatedComponents = sortedComponents.map((component, index) => ({
      ...component,
      zIndex: sortedComponents.length - 1 - index
    }))

    const updatedProject = {
      ...currentProject,
      canvasState: {
        components: updatedComponents
      },
      lastModified: new Date()
    }

    // Update projects list and save
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
    saveProjects(updatedProjects)
    setCurrentProject(updatedProject)
    console.log(`🔄 Reordered component ${componentId} to position ${newIndex}`)
  }

  const handleComponentResize = (componentId: string, newPosition: { x: number; y: number }, newSize: { width: number; height: number }) => {
    if (!currentProject) return

    const updatedProject = {
      ...currentProject,
      canvasState: {
        components: currentProject.canvasState.components.map(c =>
          c.id === componentId
            ? { ...c, position: newPosition, size: newSize }
            : c
        )
      },
      lastModified: new Date()
    }

    // Update projects list and save
    const updatedProjects = projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
    saveProjects(updatedProjects)
    setCurrentProject(updatedProject)
    console.log(`📏 Resized component ${componentId}:`, { position: newPosition, size: newSize })
  }

  return (
    <div className="app">
      {/* Show Project Selector if no project is selected */}
      {!currentProject && (
        <ProjectSelector
          projects={projects}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          isLoading={isLoading}
        />
      )}

      {/* Top Header - only show when project is selected */}
      {currentProject && (
        <div className="app-header">
          <h1>Visual Canvas Tool</h1>
          <div className="project-info">
            <span style={{ marginLeft: '2rem' }}>
              {currentProject.name} ({currentProject.canvasState.components.length} components)
            </span>
            <button
              className="change-project-btn"
              onClick={() => setCurrentProject(null)}
              style={{
                marginLeft: '1rem',
                padding: '4px 8px',
                fontSize: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Change Project
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar - only show when project is selected */}
      {currentProject && (
        <SimpleSidebar
          onCreateComponent={handleCreateComponent}
          isCollapsed={!isPanelsOpen}
          onToggleCollapse={() => setIsPanelsOpen(!isPanelsOpen)}
        />
      )}

      {/* Right Layer Panel - only show when project is selected */}
      {currentProject && (
        <LayerPanel
          isOpen={isPanelsOpen}
          components={currentProject.canvasState.components}
          selectedComponent={selectedComponent}
          onComponentSelect={setSelectedComponent}
          onComponentReorder={handleComponentReorder}
        />
      )}

      {/* Main Content Area - only show when project is selected */}
      {currentProject && (
        <div className={`app-content ${!isPanelsOpen ? 'sidebar-collapsed' : ''}`}>
          <VisualCanvas
            components={currentProject.canvasState.components}
            onComponentUpdate={handleComponentUpdate}
            onComponentDelete={handleComponentDelete}
            onComponentSelect={setSelectedComponent}
            selectedComponent={selectedComponent}
            onComponentResize={handleComponentResize}
          />
        </div>
      )}
    </div>
  )
}

export default App

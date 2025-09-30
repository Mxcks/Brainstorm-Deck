import { useState, useEffect } from 'react'
import ProjectManager from './components/projects/ProjectManager'
import Canvas from './components/canvas/Canvas'
import DataService from './services/dataService'
import './App.css'

export interface Project {
  id: string
  name: string
  createdAt: Date
  lastModified: Date
  canvasState: any // Will define this more specifically later
}

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  // Auto-select first project for testing (temporary)
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0])
    }
  }, [projects, currentProject])

  // Handle project updates from canvas
  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      const dataService = DataService.getInstance()
      await dataService.updateProject(updatedProject)
      setCurrentProject(updatedProject)

      // Update the projects list
      const updatedProjects = projects.map(p =>
        p.id === updatedProject.id ? updatedProject : p
      )
      setProjects(updatedProjects)
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Visual Canvas Tool</h1>
        <ProjectManager
          projects={projects}
          setProjects={setProjects}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
        />
      </div>

      <div className="app-content">
        {currentProject ? (
          <Canvas
            project={currentProject}
            onProjectUpdate={handleProjectUpdate}
          />
        ) : (
          <div className="welcome-screen">
            <h2>Welcome to Visual Canvas Tool</h2>
            <p>Create a new project or select an existing one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

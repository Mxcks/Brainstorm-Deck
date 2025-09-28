import { useState } from 'react'
import ProjectManager from './components/projects/ProjectManager'
import './App.css'

export interface Project {
  id: string
  name: string
  createdAt: Date
  lastModified: Date
  canvasState: any // Will define this more specifically later
}

export interface Project {
  id: string
  name: string
  createdAt: Date
  lastModified: Date
  canvasState: any
}

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  const createTestProject = () => {
    const newProject: Project = {
      id: '1',
      name: 'Test Project',
      createdAt: new Date(),
      lastModified: new Date(),
      canvasState: { viewport: { x: 0, y: 0, scale: 1 }, components: [] }
    }
    setCurrentProject(newProject)
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
          <div style={{ padding: '20px', color: 'white' }}>
            <h3>Project: {currentProject.name}</h3>
            <p>Canvas will be restored here</p>
          </div>
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

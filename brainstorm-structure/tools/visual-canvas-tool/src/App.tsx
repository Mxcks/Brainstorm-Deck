import { useState } from 'react'
import ProjectManager from './components/projects/ProjectManager'
import CanvasSpace from './components/canvas/CanvasSpace'
import './App.css'

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

  // Handle project updates from the canvas
  const handleProjectUpdate = (updatedProject: Project) => {
    // Update the current project
    setCurrentProject(updatedProject)

    // Update the project in the projects array
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    )
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
          <CanvasSpace
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

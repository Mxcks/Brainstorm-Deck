import { useState, useRef, useEffect } from 'react'
import type { Project } from '../../App'
import CanvasComponent from './CanvasComponent'
import './Canvas.css'

interface CanvasProps {
  project: Project
  onProjectUpdate: (project: Project) => void
}

interface ViewportState {
  x: number
  y: number
  scale: number
}

const Canvas: React.FC<CanvasProps> = ({ project, onProjectUpdate }) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<ViewportState>(
    project.canvasState.viewport || { x: 0, y: 0, scale: 1 }
  )
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    const zoomFactor = 0.1
    const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor
    const newScale = Math.max(0.1, Math.min(3.0, viewport.scale + delta))
    
    setViewport(prev => ({ ...prev, scale: newScale }))
  }

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      
      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Update project when viewport changes
  useEffect(() => {
    const updatedProject = {
      ...project,
      canvasState: {
        ...project.canvasState,
        viewport
      }
    }
    onProjectUpdate(updatedProject)
  }, [viewport, project, onProjectUpdate])

  // Handle component updates
  const handleComponentUpdate = (componentId: string, updates: any) => {
    const updatedComponents = project.canvasState.components.map((comp: any) =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    )
    
    const updatedProject = {
      ...project,
      canvasState: {
        ...project.canvasState,
        components: updatedComponents
      }
    }
    
    onProjectUpdate(updatedProject)
  }

  return (
    <div 
      ref={canvasRef}
      className="canvas-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="canvas-viewport"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid background */}
        <div className="canvas-grid" />
        
        {/* Render components */}
        {project.canvasState.components.map((component: any) => (
          <CanvasComponent
            key={component.id}
            component={component}
            onUpdate={(updates) => handleComponentUpdate(component.id, updates)}
          />
        ))}
      </div>
      
      {/* Canvas controls */}
      <div className="canvas-controls">
        <div className="zoom-info">
          {Math.round(viewport.scale * 100)}%
        </div>
        <button 
          onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
          className="reset-view-btn"
        >
          Reset View
        </button>
      </div>
    </div>
  )
}

export default Canvas

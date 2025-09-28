import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '../../App'
import CanvasGrid from './CanvasGrid'
import CanvasControls from './CanvasControls'
import ComponentInstance, { type ComponentData } from './ComponentInstance'
import ComponentPalette from './ComponentPalette'
import './CanvasSpace.css'

interface CanvasSpaceProps {
  project: Project
  onProjectUpdate: (project: Project) => void
}

interface ViewportState {
  x: number
  y: number
  scale: number
}

const CanvasSpace: React.FC<CanvasSpaceProps> = ({ project, onProjectUpdate }) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [components, setComponents] = useState<ComponentData[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // Load project canvas state on mount or project change
  useEffect(() => {
    if (project.canvasState) {
      setComponents(project.canvasState.components || [])
      if (project.canvasState.viewport) {
        setViewport(project.canvasState.viewport)
      }
    }
  }, [project])

  // Save canvas state to project when components or viewport change
  useEffect(() => {
    const updatedProject = {
      ...project,
      lastModified: new Date(),
      canvasState: {
        viewport,
        components
      }
    }
    onProjectUpdate(updatedProject)
  }, [components, viewport, project.id]) // Only depend on project.id to avoid infinite loops

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(3, viewport.scale * delta))

    // Zoom towards mouse position
    const scaleChange = newScale / viewport.scale
    const newX = viewport.x - (mouseX - viewport.x) * (scaleChange - 1)
    const newY = viewport.y - (mouseY - viewport.y) * (scaleChange - 1)

    setViewport({ x: newX, y: newY, scale: newScale })
  }, [viewport])

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y })
    }
  }, [viewport])

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setViewport(prev => ({ ...prev, x: newX, y: newY }))
    }
  }, [isDragging, dragStart])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Reset viewport to center
  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 })
  }, [])

  // Zoom functions
  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))
  }, [])

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }))
  }, [])

  // Component management functions
  const handleAddComponent = useCallback((component: ComponentData) => {
    setComponents(prev => [...prev, component])
    setSelectedComponent(component.id)
  }, [])

  const handleUpdateComponent = useCallback((updatedComponent: ComponentData) => {
    setComponents(prev =>
      prev.map(comp => comp.id === updatedComponent.id ? updatedComponent : comp)
    )
  }, [])

  const handleDeleteComponent = useCallback((componentId: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId))
    if (selectedComponent === componentId) {
      setSelectedComponent(null)
    }
  }, [selectedComponent])

  const handleSelectComponent = useCallback((componentId: string) => {
    setSelectedComponent(componentId)
  }, [])

  // Handle canvas click to deselect components
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedComponent(null)
    }
  }, [])

  // Export project data
  const handleExport = useCallback(() => {
    const exportData = {
      project: {
        name: project.name,
        id: project.id,
        createdAt: project.createdAt,
        lastModified: project.lastModified
      },
      canvas: {
        viewport,
        components: components.map(comp => ({
          ...comp,
          // Remove any internal state that shouldn't be exported
          id: comp.id,
          type: comp.type,
          name: comp.name,
          position: comp.position,
          size: comp.size,
          props: comp.props
        }))
      }
    }

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-export.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [project, viewport, components])

  return (
    <div className="canvas-space">
      <div 
        ref={canvasRef}
        className={`canvas-container ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <motion.div
          className="canvas-viewport"
          style={{
            x: viewport.x,
            y: viewport.y,
            scale: viewport.scale,
          }}
          transition={{ type: "tween", duration: 0 }}
        >
          <CanvasGrid scale={viewport.scale} />

          {/* Render components */}
          <div className="canvas-content">
            <div className="canvas-center-marker" />

            {components.map(component => (
              <ComponentInstance
                key={component.id}
                component={component}
                onUpdate={handleUpdateComponent}
                onDelete={handleDeleteComponent}
                isSelected={selectedComponent === component.id}
                onSelect={handleSelectComponent}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <ComponentPalette onAddComponent={handleAddComponent} />

      <CanvasControls
        viewport={viewport}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetViewport}
        onExport={handleExport}
        projectName={project.name}
      />
    </div>
  )
}

export default CanvasSpace

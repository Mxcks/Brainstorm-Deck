import { useState, useRef } from 'react'
import './CanvasComponent.css'

interface ComponentData {
  id: string
  type: string
  title: string
  description: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  status: string
  priority: string
}

interface CanvasComponentProps {
  component: ComponentData
  onUpdate: (updates: Partial<ComponentData>) => void
}

const CanvasComponent: React.FC<CanvasComponentProps> = ({ component, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(component.title)
  const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | undefined>(undefined)

  // Get component styling based on type and status
  const getComponentStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      cursor: isDragging ? 'grabbing' : 'grab'
    }

    return baseStyle
  }

  // Get CSS classes based on component properties
  const getComponentClasses = () => {
    const classes = ['canvas-component']
    classes.push(`component-type-${component.type}`)
    classes.push(`component-status-${component.status}`)
    classes.push(`component-priority-${component.priority}`)
    
    if (isSelected) classes.push('selected')
    if (isDragging) classes.push('dragging')
    
    return classes.join(' ')
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    if (e.altKey) return // Let Alt+click pass through for canvas panning

    e.stopPropagation()
    setIsSelected(true)
    setIsDragging(true)
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...component.position }
    }

    // Add global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      
      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY
      
      const newPosition = {
        x: dragRef.current.startPos.x + deltaX,
        y: dragRef.current.startPos.y + deltaY
      }
      
      onUpdate({ position: newPosition })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragRef.current = undefined
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle double click for editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditTitle(component.title)
  }

  // Handle title edit save
  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== component.title) {
      onUpdate({ title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  // Handle title edit cancel
  const handleTitleCancel = () => {
    setEditTitle(component.title)
    setIsEditing(false)
  }

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      handleTitleCancel()
    }
  }

  return (
    <div
      className={getComponentClasses()}
      style={getComponentStyle()}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        if (!e.altKey) {
          e.stopPropagation()
          setIsSelected(true)
        }
      }}
    >
      {/* Component header */}
      <div className="component-header">
        <div className="component-type-indicator">
          {component.type.charAt(0).toUpperCase()}
        </div>
        <div className="component-priority-indicator" />
      </div>

      {/* Component content */}
      <div className="component-content">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyPress}
            className="component-title-edit"
            autoFocus
          />
        ) : (
          <div className="component-title">{component.title}</div>
        )}
        
        <div className="component-description">
          {component.description}
        </div>
      </div>

      {/* Component footer */}
      <div className="component-footer">
        <div className="component-status">
          {component.status}
        </div>
      </div>

      {/* Selection handles */}
      {isSelected && (
        <div className="selection-handles">
          <div className="handle handle-nw" />
          <div className="handle handle-ne" />
          <div className="handle handle-sw" />
          <div className="handle handle-se" />
        </div>
      )}
    </div>
  )
}

export default CanvasComponent

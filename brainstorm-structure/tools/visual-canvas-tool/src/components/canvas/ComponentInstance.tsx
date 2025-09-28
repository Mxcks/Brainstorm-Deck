import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import './ComponentInstance.css'

export interface ComponentData {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  props: Record<string, any>
}

interface ComponentInstanceProps {
  component: ComponentData
  onUpdate: (component: ComponentData) => void
  onDelete: (id: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
}

const ComponentInstance: React.FC<ComponentInstanceProps> = ({
  component,
  onUpdate,
  onDelete,
  isSelected,
  onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const componentRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(component.id)
    
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({
        x: e.clientX - component.position.x,
        y: e.clientY - component.position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
      
      onUpdate({
        ...component,
        position: newPosition
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(component.id)
  }

  // Render different component types
  const renderComponent = () => {
    switch (component.type) {
      case 'button':
        return (
          <button className="demo-button" style={component.props.style}>
            {component.props.text || 'Button'}
          </button>
        )
      case 'text':
        return (
          <div className="demo-text" style={component.props.style}>
            {component.props.text || 'Text Component'}
          </div>
        )
      case 'card':
        return (
          <div className="demo-card" style={component.props.style}>
            <h3>{component.props.title || 'Card Title'}</h3>
            <p>{component.props.content || 'Card content goes here...'}</p>
          </div>
        )
      default:
        return (
          <div className="demo-placeholder">
            Unknown Component: {component.type}
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={componentRef}
      className={`component-instance ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="component-content">
        {renderComponent()}
      </div>
      
      {isSelected && (
        <div className="component-controls">
          <div className="component-label">{component.name}</div>
          <button 
            className="delete-button"
            onClick={handleDelete}
            title="Delete component"
          >
            ×
          </button>
        </div>
      )}
      
      {isSelected && (
        <div className="selection-border" />
      )}
    </motion.div>
  )
}

export default ComponentInstance

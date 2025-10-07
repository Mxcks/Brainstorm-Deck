import { useState } from 'react'
import './LayerPanel.css'

interface CanvasComponent {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
  data?: any
  zIndex?: number
}

interface LayerPanelProps {
  isOpen: boolean
  components: CanvasComponent[]
  selectedComponent: string | null
  onComponentSelect: (componentId: string) => void
  onComponentReorder: (componentId: string, newIndex: number) => void
}

// Component type icons
const getComponentIcon = (type: string) => {
  switch (type) {
    case 'button':
      return '🔘'
    case 'input':
      return '📝'
    case 'text':
      return '📄'
    case 'container':
      return '📦'
    default:
      return '⚪'
  }
}

export default function LayerPanel({ 
  isOpen, 
  components, 
  selectedComponent, 
  onComponentSelect, 
  onComponentReorder 
}: LayerPanelProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Sort components by zIndex (highest first = front layer)
  const sortedComponents = [...components].sort((a, b) => {
    const aIndex = a.zIndex ?? 0
    const bIndex = b.zIndex ?? 0
    return bIndex - aIndex // Descending order (front to back)
  })

  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    setDraggedItem(componentId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem) {
      onComponentReorder(draggedItem, dropIndex)
    }
    
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  return (
    <div className={`layer-panel ${isOpen ? 'open' : 'closed'}`}>
      <div className="layer-panel-header">
        <h3>Layers</h3>
        <span className="component-count">{components.length}</span>
      </div>
      
      <div className="layer-panel-content">
        {components.length === 0 ? (
          <div className="empty-state">
            <span>No Components Added</span>
          </div>
        ) : (
          <div className="layer-list">
            {sortedComponents.map((component, index) => (
              <div
                key={component.id}
                className={`layer-item ${selectedComponent === component.id ? 'selected' : ''} ${
                  draggedItem === component.id ? 'dragging' : ''
                } ${dragOverIndex === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, component.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => onComponentSelect(component.id)}
              >
                <div className="layer-item-content">
                  <span className="component-icon">
                    {getComponentIcon(component.type)}
                  </span>
                  <div className="component-info">
                    <span className="component-name">{component.name}</span>
                    <span className="component-type">{component.type}</span>
                  </div>
                  <div className="layer-controls">
                    <span className="layer-index">{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

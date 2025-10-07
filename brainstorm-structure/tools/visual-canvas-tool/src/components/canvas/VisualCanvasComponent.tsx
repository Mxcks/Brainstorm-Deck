/**
 * Visual Canvas Component
 * Enhanced draggable and resizable component for the Visual Canvas Tool
 */

import { useState, useRef, useEffect } from 'react'
import { CanvasComponent as CanvasComponentType, Position, Size, ResizeHandle } from '../../types'
import './VisualCanvasComponent.css'

interface VisualCanvasComponentProps {
  component: CanvasComponentType
  onUpdate: (updates: Partial<CanvasComponentType>) => void
  onSelect: (componentId: string) => void
  onDeselect: () => void
  isSelected: boolean
  canvasScale: number
}

const VisualCanvasComponent: React.FC<VisualCanvasComponentProps> = ({ 
  component, 
  onUpdate, 
  onSelect,
  onDeselect,
  isSelected,
  canvasScale
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [activeResizeHandle, setActiveResizeHandle] = useState<ResizeHandle | null>(null)
  
  const componentRef = useRef<HTMLDivElement>(null)

  // Handle component selection
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Check if clicking on a resize handle
    const resizeHandle = getResizeHandleFromEvent(e)
    if (resizeHandle && isSelected) {
      startResize(e, resizeHandle)
      return
    }

    // Select component and start drag
    onSelect(component.id)
    startDrag(e)
  }

  // Start dragging
  const startDrag = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - component.position.x * canvasScale,
      y: e.clientY - component.position.y * canvasScale
    })
  }

  // Start resizing
  const startResize = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation()
    setIsResizing(true)
    setActiveResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: component.size.width,
      height: component.size.height
    })
  }

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = (e.clientX - dragStart.x) / canvasScale
        const newY = (e.clientY - dragStart.y) / canvasScale
        
        onUpdate({
          position: { ...component.position, x: newX, y: newY }
        })
      } else if (isResizing && activeResizeHandle) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        
        const newSize = calculateNewSize(activeResizeHandle, deltaX, deltaY)
        const newPosition = calculateNewPosition(activeResizeHandle, deltaX, deltaY)
        
        onUpdate({
          size: newSize,
          position: newPosition
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setActiveResizeHandle(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, activeResizeHandle, component, canvasScale, onUpdate])

  // Calculate new size during resize
  const calculateNewSize = (handle: ResizeHandle, deltaX: number, deltaY: number): Size => {
    const scaledDeltaX = deltaX / canvasScale
    const scaledDeltaY = deltaY / canvasScale
    let newWidth = resizeStart.width
    let newHeight = resizeStart.height

    if (handle.includes('e')) newWidth = resizeStart.width + scaledDeltaX
    if (handle.includes('w')) newWidth = resizeStart.width - scaledDeltaX
    if (handle.includes('s')) newHeight = resizeStart.height + scaledDeltaY
    if (handle.includes('n')) newHeight = resizeStart.height - scaledDeltaY

    // Apply constraints
    newWidth = Math.max(component.size.minWidth || 20, newWidth)
    newHeight = Math.max(component.size.minHeight || 20, newHeight)
    
    if (component.size.maxWidth) newWidth = Math.min(component.size.maxWidth, newWidth)
    if (component.size.maxHeight) newHeight = Math.min(component.size.maxHeight, newHeight)

    return { ...component.size, width: newWidth, height: newHeight }
  }

  // Calculate new position during resize (for handles that move the component)
  const calculateNewPosition = (handle: ResizeHandle, deltaX: number, deltaY: number): Position => {
    const scaledDeltaX = deltaX / canvasScale
    const scaledDeltaY = deltaY / canvasScale
    let newX = component.position.x
    let newY = component.position.y

    if (handle.includes('w')) newX = component.position.x + scaledDeltaX
    if (handle.includes('n')) newY = component.position.y + scaledDeltaY

    return { ...component.position, x: newX, y: newY }
  }

  // Get resize handle from mouse event
  const getResizeHandleFromEvent = (e: React.MouseEvent): ResizeHandle | null => {
    if (!componentRef.current) return null
    
    const rect = componentRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const handleSize = 8
    const { width, height } = component.size

    // Check each resize handle
    const handles: { handle: ResizeHandle; x: number; y: number }[] = [
      { handle: 'nw', x: -handleSize/2, y: -handleSize/2 },
      { handle: 'n', x: width/2 - handleSize/2, y: -handleSize/2 },
      { handle: 'ne', x: width - handleSize/2, y: -handleSize/2 },
      { handle: 'w', x: -handleSize/2, y: height/2 - handleSize/2 },
      { handle: 'e', x: width - handleSize/2, y: height/2 - handleSize/2 },
      { handle: 'sw', x: -handleSize/2, y: height - handleSize/2 },
      { handle: 's', x: width/2 - handleSize/2, y: height - handleSize/2 },
      { handle: 'se', x: width - handleSize/2, y: height - handleSize/2 }
    ]

    for (const { handle, x: hx, y: hy } of handles) {
      if (x >= hx && x <= hx + handleSize && y >= hy && y <= hy + handleSize) {
        return handle
      }
    }

    return null
  }

  // Render component content based on type
  const renderComponentContent = () => {
    const { type, data, visualProperties } = component
    const style = {
      ...visualProperties,
      padding: visualProperties.padding ? 
        `${visualProperties.padding.top || 0}px ${visualProperties.padding.right || 0}px ${visualProperties.padding.bottom || 0}px ${visualProperties.padding.left || 0}px` : 
        undefined,
      width: '100%',
      height: '100%',
      border: 'none',
      outline: 'none',
      resize: 'none'
    }

    switch (type) {
      case 'button':
        return (
          <button 
            className="component-preview component-button" 
            style={style}
            disabled
          >
            {data.text || 'Button'}
          </button>
        )
      
      case 'input':
        return (
          <input 
            className="component-preview component-input"
            style={style}
            placeholder={data.placeholder || 'Input'}
            type={data.inputType || 'text'}
            readOnly
          />
        )
      
      case 'textarea':
        return (
          <textarea 
            className="component-preview component-textarea"
            style={style}
            placeholder={data.placeholder || 'Textarea'}
            readOnly
          />
        )
      
      case 'text':
        return (
          <div 
            className="component-preview component-text"
            style={style}
          >
            {data.text || 'Text Content'}
          </div>
        )
      
      case 'container':
        return (
          <div 
            className="component-preview component-container"
            style={{
              ...style,
              display: 'flex',
              flexDirection: data.layout === 'horizontal' ? 'row' : 'column',
              gap: `${data.gap || 0}px`,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="container-placeholder">Container</div>
          </div>
        )
      
      case 'form':
        return (
          <div 
            className="component-preview component-form"
            style={style}
          >
            <div className="form-placeholder">Form</div>
          </div>
        )
      
      case 'image':
        return (
          <div 
            className="component-preview component-image"
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#21262d',
              border: '2px dashed #30363d'
            }}
          >
            <span style={{ color: '#8b949e', fontSize: '14px' }}>🖼️ Image</span>
          </div>
        )
      
      case 'card':
        return (
          <div 
            className="component-preview component-card"
            style={style}
          >
            <div className="card-placeholder">Card Content</div>
          </div>
        )
      
      default:
        return (
          <div 
            className="component-preview component-default"
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {type}
          </div>
        )
    }
  }

  return (
    <div
      ref={componentRef}
      className={`visual-canvas-component ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
        zIndex: component.position.z || (isSelected ? 100 : 10)
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Component Content */}
      <div className="component-content">
        {renderComponentContent()}
      </div>

      {/* Selection Handles */}
      {isSelected && (
        <div className="selection-handles">
          {(['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as ResizeHandle[]).map(handle => (
            <div
              key={handle}
              className={`resize-handle resize-handle-${handle}`}
              style={{
                cursor: getResizeCursor(handle)
              }}
            />
          ))}
        </div>
      )}

      {/* Component Label */}
      {isSelected && (
        <div className="component-label">
          {component.name}
        </div>
      )}
    </div>
  )
}

// Get cursor style for resize handle
const getResizeCursor = (handle: ResizeHandle): string => {
  const cursors: Record<ResizeHandle, string> = {
    'nw': 'nw-resize',
    'n': 'n-resize',
    'ne': 'ne-resize',
    'w': 'w-resize',
    'e': 'e-resize',
    'sw': 'sw-resize',
    's': 's-resize',
    'se': 'se-resize'
  }
  return cursors[handle]
}

export default VisualCanvasComponent

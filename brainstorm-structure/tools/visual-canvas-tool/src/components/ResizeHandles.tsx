import { useState, useCallback } from 'react'
import './ResizeHandles.css'

interface ResizeHandlesProps {
  componentId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  onResize: (componentId: string, newPosition: { x: number; y: number }, newSize: { width: number; height: number }) => void
  isVisible: boolean
}

type ResizeHandle = 
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'  // Corner handles (diagonal)
  | 'top' | 'bottom' | 'left' | 'right'                        // Edge handles (single-axis)

interface ResizeState {
  isResizing: boolean
  handle: ResizeHandle | null
  startPosition: { x: number; y: number }
  startSize: { width: number; height: number }
  startComponentPosition: { x: number; y: number }
}

export default function ResizeHandles({ 
  componentId, 
  position, 
  size, 
  onResize, 
  isVisible 
}: ResizeHandlesProps) {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: null,
    startPosition: { x: 0, y: 0 },
    startSize: { width: 0, height: 0 },
    startComponentPosition: { x: 0, y: 0 }
  })

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault()
    e.stopPropagation()

    const startState = {
      isResizing: true,
      handle,
      startPosition: { x: e.clientX, y: e.clientY },
      startSize: { ...size },
      startComponentPosition: { ...position }
    }

    setResizeState(startState)

    // Add global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startState.startPosition.x
      const deltaY = e.clientY - startState.startPosition.y

      let newSize = { ...startState.startSize }
      let newPosition = { ...startState.startComponentPosition }

      // Minimum size constraints
      const minWidth = 20
      const minHeight = 20

      switch (handle) {
        case 'top-left':
          newSize.width = Math.max(minWidth, startState.startSize.width - deltaX)
          newSize.height = Math.max(minHeight, startState.startSize.height - deltaY)
          newPosition.x = startState.startComponentPosition.x + (startState.startSize.width - newSize.width)
          newPosition.y = startState.startComponentPosition.y + (startState.startSize.height - newSize.height)
          break
        case 'top-right':
          newSize.width = Math.max(minWidth, startState.startSize.width + deltaX)
          newSize.height = Math.max(minHeight, startState.startSize.height - deltaY)
          newPosition.y = startState.startComponentPosition.y + (startState.startSize.height - newSize.height)
          break
        case 'bottom-left':
          newSize.width = Math.max(minWidth, startState.startSize.width - deltaX)
          newSize.height = Math.max(minHeight, startState.startSize.height + deltaY)
          newPosition.x = startState.startComponentPosition.x + (startState.startSize.width - newSize.width)
          break
        case 'bottom-right':
          newSize.width = Math.max(minWidth, startState.startSize.width + deltaX)
          newSize.height = Math.max(minHeight, startState.startSize.height + deltaY)
          break
        case 'top':
          newSize.height = Math.max(minHeight, startState.startSize.height - deltaY)
          newPosition.y = startState.startComponentPosition.y + (startState.startSize.height - newSize.height)
          break
        case 'bottom':
          newSize.height = Math.max(minHeight, startState.startSize.height + deltaY)
          break
        case 'left':
          newSize.width = Math.max(minWidth, startState.startSize.width - deltaX)
          newPosition.x = startState.startComponentPosition.x + (startState.startSize.width - newSize.width)
          break
        case 'right':
          newSize.width = Math.max(minWidth, startState.startSize.width + deltaX)
          break
      }

      onResize(componentId, newPosition, newSize)
    }

    const handleMouseUp = () => {
      setResizeState(prev => ({ ...prev, isResizing: false, handle: null }))
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [componentId, position, size, onResize])

  if (!isVisible) return null

  const getCursor = (handle: ResizeHandle): string => {
    switch (handle) {
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize'
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize'
      case 'top':
      case 'bottom':
        return 'ns-resize'
      case 'left':
      case 'right':
        return 'ew-resize'
      default:
        return 'default'
    }
  }

  return (
    <div className="resize-handles-container">
      {/* Sage green resize box */}
      <div 
        className="resize-box"
        style={{
          position: 'absolute',
          left: -2,
          top: -2,
          width: size.width + 4,
          height: size.height + 4,
          border: '2px solid #7c9885',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* Corner handles (circles) - diagonal resize */}
      <div
        className="resize-handle corner-handle top-left"
        style={{ cursor: getCursor('top-left') }}
        onMouseDown={(e) => handleMouseDown(e, 'top-left')}
      />
      <div
        className="resize-handle corner-handle top-right"
        style={{ cursor: getCursor('top-right') }}
        onMouseDown={(e) => handleMouseDown(e, 'top-right')}
      />
      <div
        className="resize-handle corner-handle bottom-left"
        style={{ cursor: getCursor('bottom-left') }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
      />
      <div
        className="resize-handle corner-handle bottom-right"
        style={{ cursor: getCursor('bottom-right') }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
      />

      {/* Edge handles (rectangles) - single-axis resize */}
      <div
        className="resize-handle edge-handle top"
        style={{ cursor: getCursor('top') }}
        onMouseDown={(e) => handleMouseDown(e, 'top')}
      />
      <div
        className="resize-handle edge-handle bottom"
        style={{ cursor: getCursor('bottom') }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
      />
      <div
        className="resize-handle edge-handle left"
        style={{ cursor: getCursor('left') }}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />
      <div
        className="resize-handle edge-handle right"
        style={{ cursor: getCursor('right') }}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />
    </div>
  )
}

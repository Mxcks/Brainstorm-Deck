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

  // Calculate box dimensions with padding
  const boxPadding = 4 // 4px outside the component
  const boxWidth = size.width + (boxPadding * 2)
  const boxHeight = size.height + (boxPadding * 2)
  const boxLeft = position.x - boxPadding
  const boxTop = position.y - boxPadding

  return (
    <div
      className="resize-handles-container"
      style={{
        position: 'absolute',
        left: boxLeft,
        top: boxTop,
        width: boxWidth,
        height: boxHeight,
        pointerEvents: 'none',
        zIndex: 15
      }}
    >
      {/* Sage green resize box */}
      <div
        className="resize-box"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: boxWidth,
          height: boxHeight,
          border: '2px solid #7c9885',
          pointerEvents: 'none',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      />

      {/* Corner handles (circles) - positioned exactly on corners */}
      <div
        className="resize-handle corner-handle"
        style={{
          cursor: getCursor('top-left'),
          position: 'absolute',
          left: -4, // Half handle width to center on corner
          top: -4,
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'top-left')}
      />
      <div
        className="resize-handle corner-handle"
        style={{
          cursor: getCursor('top-right'),
          position: 'absolute',
          right: -4,
          top: -4,
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'top-right')}
      />
      <div
        className="resize-handle corner-handle"
        style={{
          cursor: getCursor('bottom-left'),
          position: 'absolute',
          left: -4,
          bottom: -4,
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
      />
      <div
        className="resize-handle corner-handle"
        style={{
          cursor: getCursor('bottom-right'),
          position: 'absolute',
          right: -4,
          bottom: -4,
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
      />

      {/* Edge handles (rectangles) - positioned exactly on edge midpoints */}
      <div
        className="resize-handle edge-handle edge-top"
        style={{
          cursor: getCursor('top'),
          position: 'absolute',
          left: '50%',
          top: -3, // Half handle height to center on edge
          transform: 'translateX(-50%)',
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'top')}
      />
      <div
        className="resize-handle edge-handle edge-bottom"
        style={{
          cursor: getCursor('bottom'),
          position: 'absolute',
          left: '50%',
          bottom: -3,
          transform: 'translateX(-50%)',
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
      />
      <div
        className="resize-handle edge-handle edge-left"
        style={{
          cursor: getCursor('left'),
          position: 'absolute',
          left: -3, // Half handle width to center on edge
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />
      <div
        className="resize-handle edge-handle edge-right"
        style={{
          cursor: getCursor('right'),
          position: 'absolute',
          right: -3,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />
    </div>
  )
}

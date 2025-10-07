import { useState, useRef, useEffect, useCallback } from 'react'
import './VisualCanvas.css'
import ResizeHandles from './ResizeHandles'

// Simple mock backend to prevent white screen issues
const mockBackendEngine = {
  handleAction: async (componentId: string, componentType: string, action: string, data?: any) => {
    console.log(`🎯 Mock Backend: ${componentId} (${componentType}) ${action}:`, data)
    return { success: true }
  },
  initializeComponent: (componentId: string, componentType: string, data: any) => {
    console.log(`🔧 Mock Backend: Initialize ${componentId} (${componentType})`)
  },
  cleanupComponent: (componentId: string, componentType: string) => {
    console.log(`🧹 Mock Backend: Cleanup ${componentId} (${componentType})`)
  }
}

interface CanvasComponent {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
  data?: any
  zIndex?: number
}

interface ViewportState {
  x: number
  y: number
  scale: number
}

interface DragState {
  isDragging: boolean
  dragType: 'viewport' | 'component'
  startPosition: { x: number; y: number }
  componentId?: string
  componentStartPosition?: { x: number; y: number }
}

type CanvasMode = 'design' | 'preview'

interface VisualCanvasProps {
  components: CanvasComponent[]
  onComponentUpdate?: (component: CanvasComponent) => void
  onComponentDelete?: (componentId: string) => void
  onComponentSelect?: (componentId: string | null) => void
  selectedComponent?: string | null
  onComponentResize?: (componentId: string, newPosition: { x: number; y: number }, newSize: { width: number; height: number }) => void
}

// Component renderer for different types
function ComponentRenderer({
  component,
  isVisible,
  isSelected,
  canvasMode,
  onMouseDown,
  onContextMenu,
  onComponentInteraction
}: {
  component: CanvasComponent
  isVisible: boolean
  isSelected: boolean
  canvasMode: CanvasMode
  onMouseDown: (e: React.MouseEvent, componentId: string) => void
  onContextMenu: (e: React.MouseEvent, componentId: string) => void
  onComponentInteraction: (componentId: string, action: string, data?: any) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  if (!isVisible) return null

  const defaultSizes = {
    button: { width: 120, height: 40 },
    input: { width: 200, height: 40 },
    text: { width: 150, height: 30 },
    container: { width: 300, height: 200 }
  }

  const size = component.size || defaultSizes[component.type as keyof typeof defaultSizes] || { width: 100, height: 40 }

  const componentStyle = {
    position: 'absolute' as const,
    left: component.position.x,
    top: component.position.y,
    width: size.width,
    height: size.height,
    border: canvasMode === 'design'
      ? (isSelected ? '2px solid var(--accent-primary)' : '2px solid transparent')
      : 'none',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '500',
    cursor: canvasMode === 'design' ? 'move' : 'default',
    userSelect: canvasMode === 'design' ? 'none' as const : 'auto' as const,
    transition: 'all 0.2s ease',
    // Only show selection border in design mode
    boxShadow: canvasMode === 'design' && isSelected ? '0 0 0 2px rgba(124, 152, 133, 0.3)' : 'none'
  }

  const getComponentContent = () => {
    const baseStyle = { ...componentStyle }
    
    switch (component.type) {
      case 'button':
        if (canvasMode === 'preview') {
          return (
            <button
              style={{
                position: 'absolute',
                left: component.position.x,
                top: component.position.y,
                width: size.width,
                height: size.height,
                background: isHovered ? '#6a8470' : 'var(--accent-primary)', // Darker on hover
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
                userSelect: 'none'
              }}
              onClick={() => onComponentInteraction(component.id, 'click', { text: component.data?.text || 'Button' })}
              onMouseEnter={() => {
                setIsHovered(true)
                onComponentInteraction(component.id, 'hover', { state: 'enter' })
              }}
              onMouseLeave={() => {
                setIsHovered(false)
                onComponentInteraction(component.id, 'hover', { state: 'leave' })
              }}
            >
              {component.data?.text || 'Button'}
            </button>
          )
        }
        return (
          <div style={{
            ...baseStyle,
            background: 'var(--accent-primary)',
            color: 'white'
          }}>
            {component.data?.text || 'Button'}
          </div>
        )
        
      case 'input':
        if (canvasMode === 'preview') {
          return (
            <input 
              style={{ 
                ...baseStyle, 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                paddingLeft: '12px',
                outline: 'none'
              }}
              placeholder={component.data?.placeholder || 'Input field...'}
              onChange={(e) => onComponentInteraction(component.id, 'input', { value: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          )
        }
        return (
          <div style={{ 
            ...baseStyle, 
            background: 'var(--bg-tertiary)', 
            color: 'var(--text-primary)',
            justifyContent: 'flex-start',
            paddingLeft: '12px'
          }}>
            {component.data?.placeholder || 'Input field...'}
          </div>
        )
        
      case 'text':
        return (
          <div style={{ 
            ...baseStyle, 
            background: 'transparent', 
            border: canvasMode === 'design' ? '2px dashed var(--accent-primary)' : 'none',
            color: 'var(--text-primary)',
            cursor: canvasMode === 'preview' ? 'text' : 'move'
          }}>
            {component.data?.text || 'Text content'}
          </div>
        )
        
      case 'container':
        return (
          <div style={{ 
            ...baseStyle, 
            background: 'var(--bg-secondary)', 
            border: canvasMode === 'design' ? '2px solid var(--border-primary)' : '1px solid var(--border-primary)',
            color: 'var(--text-secondary)'
          }}>
            {canvasMode === 'design' ? 'Container' : ''}
          </div>
        )
        
      default:
        return (
          <div style={{ 
            ...baseStyle, 
            background: 'var(--bg-tertiary)', 
            color: 'var(--text-primary)'
          }}>
            {component.type}
          </div>
        )
    }
  }

  return (
    <div 
      key={component.id}
      data-component-id={component.id}
      title={`${component.name} (${component.type})`}
      onMouseDown={canvasMode === 'design' ? (e) => onMouseDown(e, component.id) : undefined}
      onContextMenu={canvasMode === 'design' ? (e) => onContextMenu(e, component.id) : undefined}
      style={{ position: 'relative' }}
    >
      {getComponentContent()}
    </div>
  )
}

export default function VisualCanvas({ components, onComponentUpdate, onComponentDelete, onComponentSelect, selectedComponent, onComponentResize }: VisualCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 })
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('design')
  const [showZoomDropdown, setShowZoomDropdown] = useState(false)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: 'viewport',
    startPosition: { x: 0, y: 0 }
  })
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string } | null>(null)
  const [reorderSubmenu, setReorderSubmenu] = useState<boolean>(false)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false)

  // Calculate which components are visible in the viewport
  const getVisibleComponents = useCallback(() => {
    if (!canvasRef.current) return []

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const bufferDistance = 3 // 3 screen distances as requested
    
    const viewportBounds = {
      left: -viewport.x - (canvasRect.width * bufferDistance),
      right: -viewport.x + canvasRect.width * (1 + bufferDistance),
      top: -viewport.y - (canvasRect.height * bufferDistance),
      bottom: -viewport.y + canvasRect.height * (1 + bufferDistance)
    }

    // Sort components by zIndex (back to front for proper rendering order)
    const sortedComponents = [...components].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    return sortedComponents.map(component => {
      const defaultSizes = {
        button: { width: 120, height: 40 },
        input: { width: 200, height: 40 },
        text: { width: 150, height: 30 },
        container: { width: 300, height: 200 }
      }

      const size = component.size || defaultSizes[component.type as keyof typeof defaultSizes] || { width: 100, height: 40 }

      const isVisible = (
        component.position.x + size.width >= viewportBounds.left &&
        component.position.x <= viewportBounds.right &&
        component.position.y + size.height >= viewportBounds.top &&
        component.position.y <= viewportBounds.bottom
      )

      return { component, isVisible }
    })
  }, [components, viewport])

  // Handle mouse events for panning and component movement
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      // Clear selection if clicking on empty canvas (only in design mode)
      if (canvasMode === 'design') {
        onComponentSelect?.(null)
      }

      // Start viewport dragging only if Ctrl is held down
      if (e.ctrlKey) {
        setDragState({
          isDragging: true,
          dragType: 'viewport',
          startPosition: { x: e.clientX - viewport.x, y: e.clientY - viewport.y }
        })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.isDragging) {
      if (dragState.dragType === 'viewport') {
        setViewport(prev => ({
          ...prev,
          x: e.clientX - dragState.startPosition.x,
          y: e.clientY - dragState.startPosition.y
        }))
      } else if (dragState.dragType === 'component' && dragState.componentId && dragState.componentStartPosition) {
        // Calculate movement delta
        const deltaX = (e.clientX - dragState.startPosition.x) / viewport.scale
        const deltaY = (e.clientY - dragState.startPosition.y) / viewport.scale
        
        // Update component position
        const updatedComponent = components.find(c => c.id === dragState.componentId)
        if (updatedComponent) {
          const newComponent = {
            ...updatedComponent,
            position: {
              x: dragState.componentStartPosition.x + deltaX,
              y: dragState.componentStartPosition.y + deltaY
            }
          }
          onComponentUpdate?.(newComponent)
        }
      }
    }
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      dragType: 'viewport',
      startPosition: { x: 0, y: 0 }
    })
  }

  // Handle component mouse down for dragging
  const handleComponentMouseDown = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation() // Prevent canvas mouse down

    if (canvasMode === 'design' && e.button === 0) { // Left mouse button in design mode
      // Select the component
      onComponentSelect?.(componentId)

      // Start component dragging
      const component = components.find(c => c.id === componentId)
      if (component) {
        setDragState({
          isDragging: true,
          dragType: 'component',
          startPosition: { x: e.clientX, y: e.clientY },
          componentId: componentId,
          componentStartPosition: { x: component.position.x, y: component.position.y }
        })
      }
    } else if (canvasMode === 'preview') {
      // In preview mode, trigger component interaction instead of selection
      handleComponentInteraction(componentId, 'click', { event: e })
    }
  }

  // Handle component context menu
  const handleComponentContextMenu = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (canvasMode === 'design') {
      onComponentSelect?.(componentId)
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        componentId: componentId
      })
    }
  }

  // Handle component interactions in preview mode
  const handleComponentInteraction = async (componentId: string, action: string, data?: any) => {
    console.log(`🎯 Component ${componentId} ${action}:`, data)

    // Find the component to get its type
    const component = components.find(c => c.id === componentId)
    if (!component) {
      console.warn(`Component ${componentId} not found`)
      return
    }

    try {
      // Call the mock backend engine to handle the interaction
      const result = await mockBackendEngine.handleAction(componentId, component.type, action, data)
      console.log(`✅ Backend result:`, result)

      if (!result.success) {
        console.warn(`⚠️ Backend action failed:`, result.error)
      }
    } catch (error) {
      console.error(`❌ Backend interaction error:`, error)
    }
  }

  // Handle zoom changes
  const handleZoomChange = (newZoom: number, closeDropdown: boolean = false) => {
    setViewport(prev => ({ ...prev, scale: newZoom / 100 }))
    if (closeDropdown) {
      setShowZoomDropdown(false)
    }
    // Save zoom level to localStorage
    localStorage.setItem('canvas-zoom', newZoom.toString())
  }

  // Load saved zoom level on mount
  useEffect(() => {
    const savedZoom = localStorage.getItem('canvas-zoom')
    if (savedZoom) {
      const zoomValue = parseInt(savedZoom)
      if (zoomValue >= 10 && zoomValue <= 500) {
        setViewport(prev => ({ ...prev, scale: zoomValue / 100 }))
      }
    }
  }, [])

  // Initialize components in backend when they're loaded
  // Temporarily disabled to debug white screen
  // useEffect(() => {
  //   components.forEach(component => {
  //     backendEngine.initializeComponent(component.id, component.type, component.data || {})
  //   })
  //
  //   // Cleanup function to clean up components when they're removed
  //   return () => {
  //     components.forEach(component => {
  //       backendEngine.cleanupComponent(component.id, component.type)
  //     })
  //   }
  // }, [components])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (canvasMode === 'design' && selectedComponent && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        onComponentDelete?.(selectedComponent)
        onComponentSelect?.(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvasMode, selectedComponent, onComponentDelete, onComponentSelect])

  // Close context menu when clicking elsewhere (simplified)
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
      // Don't auto-close zoom dropdown to prevent conflicts
      // setShowZoomDropdown(false)
    }
    if (contextMenu) {
      window.addEventListener('click', handleClickOutside)
      return () => window.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  return (
    <div className="visual-canvas-container">
      <div className="canvas-controls">
        <button onClick={() => {
          setViewport({ x: 0, y: 0, scale: 1 })
          localStorage.setItem('canvas-zoom', '100')
        }} title="Reset View">
          🏠 Reset
        </button>
        <button onClick={() => console.log('Fit all')} title="Fit to Components">
          📐 Fit All
        </button>
        <button
          onClick={() => setShowHelpModal(true)}
          title="Component Development Guide"
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          📚 Dev Guide
        </button>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${canvasMode === 'design' ? 'active' : ''}`}
            onClick={() => setCanvasMode('design')}
            title="Design Mode - Move and edit components"
          >
            ✏️ Design
          </button>
          <button
            className={`mode-btn ${canvasMode === 'preview' ? 'active' : ''}`}
            onClick={() => {
              setCanvasMode('preview')
              onComponentSelect?.(null) // Clear selection when entering preview mode
            }}
            title="Preview Mode - Interact with components"
          >
            ▶️ Preview
          </button>
        </div>
        
        <div className="zoom-dropdown-container">
          <button
            className="zoom-indicator"
            onClick={(e) => {
              e.stopPropagation()
              setShowZoomDropdown(!showZoomDropdown)
            }}
            title="Change zoom level"
          >
            {Math.round(viewport.scale * 100)}% ▼
          </button>

          {showZoomDropdown && (
            <div className="zoom-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="zoom-slider-container">
                <label>Zoom: {Math.round(viewport.scale * 100)}%</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="2"
                  value={Math.round(viewport.scale * 100)}
                  onChange={(e) => handleZoomChange(parseInt(e.target.value), false)}
                  className="zoom-slider"
                />
                <div className="zoom-presets">
                  <button onClick={() => handleZoomChange(25, true)}>25%</button>
                  <button onClick={() => handleZoomChange(50, true)}>50%</button>
                  <button onClick={() => handleZoomChange(75, true)}>75%</button>
                  <button onClick={() => handleZoomChange(100, true)}>100%</button>
                  <button onClick={() => handleZoomChange(125, true)}>125%</button>
                  <button onClick={() => handleZoomChange(150, true)}>150%</button>
                  <button onClick={() => handleZoomChange(200, true)}>200%</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <span className="component-count">
          {components.length} components
        </span>
      </div>

      <div
        ref={canvasRef}
        className={`visual-canvas ${canvasMode}-mode`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: dragState.isDragging
            ? (dragState.dragType === 'viewport' ? 'grabbing' : 'move')
            : (canvasMode === 'design' ? 'default' : 'default')
        }}
      >
        <div
          className="canvas-content"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: '0 0'
          }}
        >
          <div className="canvas-grid" />
          
          {getVisibleComponents().map(({ component, isVisible }) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              isVisible={isVisible}
              isSelected={selectedComponent === component.id}
              canvasMode={canvasMode}
              onMouseDown={handleComponentMouseDown}
              onContextMenu={handleComponentContextMenu}
              onComponentInteraction={handleComponentInteraction}
            />
          ))}

          {/* Resize handles for selected component */}
          {canvasMode === 'design' && selectedComponent && onComponentResize && (() => {
            const selectedComp = components.find(c => c.id === selectedComponent)
            if (!selectedComp) return null

            const defaultSizes = {
              button: { width: 120, height: 40 },
              input: { width: 200, height: 40 },
              text: { width: 150, height: 30 },
              container: { width: 300, height: 200 }
            }

            const size = selectedComp.size || defaultSizes[selectedComp.type as keyof typeof defaultSizes] || { width: 100, height: 40 }

            return (
              <ResizeHandles
                key={`resize-${selectedComp.id}`}
                componentId={selectedComp.id}
                position={selectedComp.position}
                size={size}
                onResize={onComponentResize}
                isVisible={true}
              />
            )
          })()}
        </div>

        {/* Context Menu */}
        {contextMenu && canvasMode === 'design' && (
          <div
            className="context-menu"
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 1000
            }}
          >
            <button
              className="context-menu-item"
              onClick={() => {
                onComponentDelete?.(contextMenu.componentId)
                onComponentSelect?.(null)
                setContextMenu(null)
              }}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🗑️ Delete Component
            </button>
          </div>
        )}
      </div>

      <div className="mode-info">
        <span className={`mode-indicator ${canvasMode}`}>
          {canvasMode === 'design' ? '✏️ Design Mode' : '▶️ Preview Mode'}
        </span>
        <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {canvasMode === 'design'
            ? 'Click & drag components • Ctrl+drag to pan • Right-click to delete'
            : 'Interact with components as real UI elements'
          }
        </span>
      </div>

      {/* Component Development Help Modal */}
      {showHelpModal && (
        <div
          className="help-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="help-modal"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.5rem' }}>
                📚 Component Development Guide
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  🎯 Overview
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
                  The Visual Canvas Tool uses a modular architecture where components and their backend logic are separated.
                  This guide shows you how to add new interactive components to the system.
                </p>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  📁 File Structure
                </h3>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <div>📂 src/component-library/</div>
                  <div>&nbsp;&nbsp;📂 basic/</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;📄 YourComponent.tsx</div>
                  <div>&nbsp;&nbsp;📄 index.ts</div>
                  <div>&nbsp;&nbsp;📄 types.ts</div>
                  <div></div>
                  <div>📂 src/component-backend/</div>
                  <div>&nbsp;&nbsp;📂 handlers/</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;📄 YourComponentHandler.ts</div>
                  <div>&nbsp;&nbsp;📄 index.ts</div>
                  <div>&nbsp;&nbsp;📄 types.ts</div>
                </div>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  🔧 Step 1: Create Component Definition
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  Create a new file in <code style={{ background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '3px' }}>src/component-library/basic/YourComponent.tsx</code>:
                </p>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
{`import { ComponentDefinition } from '../types'

export const YourComponent: ComponentDefinition = {
  id: 'your-component',
  name: 'Your Component',
  category: 'basic',
  icon: '🎯',
  description: 'Your component description',
  defaultSize: { width: 120, height: 40 },
  defaultData: { text: 'Default' },
  hasBackend: true,
  backendActions: ['click', 'change'],
  render: ({ data, size, isPreview, onInteraction }) => (
    <div onClick={isPreview ? () => onInteraction?.('click') : undefined}>
      {data.text}
    </div>
  )
}`}
                </div>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  ⚙️ Step 2: Create Backend Handler
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  Create a new file in <code style={{ background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '3px' }}>src/component-backend/handlers/YourComponentHandler.ts</code>:
                </p>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
{`import { ComponentHandler } from '../types'

export const YourComponentHandler: ComponentHandler = {
  componentId: 'your-component',
  actions: {
    click: async (componentId, data, context) => {
      // Handle click action
      return { success: true, message: 'Clicked!' }
    }
  },
  initialize: (componentId, initialData) => ({
    // Initial state
    createdAt: Date.now()
  })
}`}
                </div>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  📝 Step 3: Register Components
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  Add your component to <code style={{ background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '3px' }}>src/component-library/index.ts</code>:
                </p>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
{`import { YourComponent } from './basic/YourComponent'

export const componentLibrary = [
  // ... existing components
  YourComponent
]`}
                </div>
                <p style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  Add your handler to <code style={{ background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '3px' }}>src/component-backend/index.ts</code>:
                </p>
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
{`import { YourComponentHandler } from './handlers/YourComponentHandler'
// Register in handlers array`}
                </div>
              </section>

              <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  🎯 Key Concepts
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>isPreview</strong>: Only attach event handlers when in Preview mode
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>onInteraction</strong>: Call this to trigger backend actions
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>data</strong>: Component configuration (text, colors, etc.)
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>size</strong>: Current component dimensions
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <strong>context</strong>: Access to stateManager and eventBus
                  </li>
                </ul>
              </section>

              <section>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  🚀 Testing Your Component
                </h3>
                <ol style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Add component to canvas in Design mode</li>
                  <li style={{ marginBottom: '0.5rem' }}>Switch to Preview mode</li>
                  <li style={{ marginBottom: '0.5rem' }}>Interact with your component</li>
                  <li style={{ marginBottom: '0.5rem' }}>Check browser console for backend logs</li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

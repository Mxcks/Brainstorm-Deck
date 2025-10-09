import { useState, useRef, useEffect, useCallback } from 'react'
import './VisualCanvas.css'
import { componentLibrary } from '../component-library'
import ResizeHandles from './ResizeHandles'
import { ComponentImporter } from '../services/ComponentImporter'
import Switch from './Switch'

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
  onComponentAdd?: (component: CanvasComponent) => void
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
  onComponentInteraction,
  localPosition,
  isCtrlHeld
}: {
  component: CanvasComponent
  isVisible: boolean
  isSelected: boolean
  canvasMode: CanvasMode
  onMouseDown: (e: React.MouseEvent, componentId: string) => void
  onContextMenu: (e: React.MouseEvent, componentId: string) => void
  onComponentInteraction: (componentId: string, action: string, data?: any) => void
  localPosition?: { x: number; y: number }
  isCtrlHeld?: boolean
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

  // Use local position if available (for smooth dragging), otherwise use component position
  const currentPosition = localPosition || component.position

  const componentStyle = {
    position: 'absolute' as const,
    left: currentPosition.x,
    top: currentPosition.y,
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
    cursor: canvasMode === 'design' ? (isCtrlHeld ? 'grab' : 'move') : 'default',
    userSelect: canvasMode === 'design' ? 'none' as const : 'auto' as const,
    transition: localPosition ? 'none' : 'all 0.2s ease', // Disable transition during drag
    // Only show selection border in design mode
    boxShadow: canvasMode === 'design' && isSelected ? '0 0 0 2px rgba(124, 152, 133, 0.3)' : 'none'
  }

  const getComponentContent = () => {
    // Try to get component definition from library first
    const componentDef = componentLibrary.getComponent(component.type)

    if (componentDef && componentDef.render) {
      // Use component library's render function
      return componentDef.render({
        data: component.data || {},
        size: size,
        isPreview: canvasMode === 'preview',
        onInteraction: (action: string, data?: any) => onComponentInteraction(component.id, action, data)
      })
    }

    // Fallback to hardcoded components for backwards compatibility
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

      case 'switch':
        return (
          <div style={{
            ...baseStyle,
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Switch />
          </div>
        )

      case 'imported':
        return (
          <div style={{
            ...baseStyle,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {component.data?.css && (
              <style dangerouslySetInnerHTML={{ __html: component.data.css }} />
            )}
            <div
              dangerouslySetInnerHTML={{
                __html: component.data?.html || '<div>Imported Component</div>'
              }}
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden'
              }}
            />
            {canvasMode === 'design' && (
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                pointerEvents: 'none'
              }}>
                {component.data?.name || 'Imported'}
              </div>
            )}
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

export default function VisualCanvas({ components, onComponentUpdate, onComponentDelete, onComponentSelect, onComponentAdd, selectedComponent, onComponentResize }: VisualCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 })
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('design')
  const [showZoomDropdown, setShowZoomDropdown] = useState(false)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: 'viewport',
    startPosition: { x: 0, y: 0 }
  })

  // Local component positions for smooth dragging
  const [localComponentPositions, setLocalComponentPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null)
  const [isCtrlHeld, setIsCtrlHeld] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; componentId: string } | null>(null)
  const [reorderSubmenu, setReorderSubmenu] = useState<boolean>(false)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false)
  const [showImportModal, setShowImportModal] = useState<boolean>(false)
  const [importUrl, setImportUrl] = useState<string>('')
  const [importLoading, setImportLoading] = useState<boolean>(false)
  const [textEditor, setTextEditor] = useState<{ componentId: string; property: string; value: string; x: number; y: number } | null>(null)

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

  // Handle component import
  const handleImportComponent = async () => {
    if (!importUrl.trim()) return

    setImportLoading(true)
    try {
      const result = await ComponentImporter.importFromUrl(importUrl)

      if (result.success && result.component) {
        // Create a new component from the imported data
        const newComponent: CanvasComponent = {
          id: `component-${Date.now()}`,
          type: 'imported',
          name: result.component.name || 'Imported Component',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 100 },
          data: {
            html: result.component.html,
            css: result.component.css,
            name: result.component.name,
            source: result.component.source,
            sourceUrl: result.component.sourceUrl
          },
          zIndex: Math.max(...components.map(c => c.zIndex || 0)) + 1
        }

        // Add to components
        onComponentAdd?.(newComponent)

        // Close modal and reset form
        setShowImportModal(false)
        setImportUrl('')

        console.log('✅ Component imported successfully:', result.component.name)
      } else {
        console.error('❌ Import failed:', result.error)
        alert(`Import failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Import error:', error)
      alert(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImportLoading(false)
    }
  }

  // Handle component mouse down for dragging
  const handleComponentMouseDown = (e: React.MouseEvent, componentId: string) => {
    if (canvasMode !== 'design') return

    e.preventDefault()
    e.stopPropagation()

    // If Ctrl is held, prioritize viewport panning over component selection
    if (e.ctrlKey || e.metaKey) {
      setDragState({
        isDragging: true,
        dragType: 'viewport',
        startPosition: { x: e.clientX - viewport.x, y: e.clientY - viewport.y }
      })
      return
    }

    // Select the component
    onComponentSelect?.(componentId)

    // Start component dragging
    const component = components.find(c => c.id === componentId)
    if (component) {
      setDraggedComponentId(componentId)
      setDragState({
        isDragging: true,
        dragType: 'component',
        startPosition: { x: e.clientX, y: e.clientY },
        componentId: componentId,
        componentStartPosition: component.position
      })

      // Initialize local position for smooth dragging
      setLocalComponentPositions(prev => ({
        ...prev,
        [componentId]: { ...component.position }
      }))
    }
  }

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

        // Update local position for smooth dragging (no parent re-render)
        const newPosition = {
          x: dragState.componentStartPosition.x + deltaX,
          y: dragState.componentStartPosition.y + deltaY
        }

        setLocalComponentPositions(prev => ({
          ...prev,
          [dragState.componentId!]: newPosition
        }))
      }
    }
  }

  const handleMouseUp = () => {
    // If we were dragging a component, commit the final position
    if (dragState.isDragging && dragState.dragType === 'component' && dragState.componentId) {
      const finalPosition = localComponentPositions[dragState.componentId]
      if (finalPosition) {
        const updatedComponent = components.find(c => c.id === dragState.componentId)
        if (updatedComponent) {
          const newComponent = {
            ...updatedComponent,
            position: finalPosition
          }
          onComponentUpdate?.(newComponent)
        }
      }

      // Clear local position after committing
      setLocalComponentPositions(prev => {
        const newPositions = { ...prev }
        delete newPositions[dragState.componentId!]
        return newPositions
      })
      setDraggedComponentId(null)
    }

    setDragState({
      isDragging: false,
      dragType: 'viewport',
      startPosition: { x: 0, y: 0 }
    })
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

  // Get editable text properties for a component
  const getEditableTextProperties = (component: CanvasComponent): Array<{ property: string; label: string; value: string }> => {
    const properties: Array<{ property: string; label: string; value: string }> = []

    if (!component.data) {
      return properties
    }

    switch (component.type) {
      case 'button':
        if ('text' in component.data) {
          properties.push({ property: 'text', label: 'Button Text', value: component.data.text || 'Button' })
        }
        break
      case 'input':
        if ('placeholder' in component.data) {
          properties.push({ property: 'placeholder', label: 'Placeholder', value: component.data.placeholder || 'Enter text...' })
        }
        if ('value' in component.data) {
          properties.push({ property: 'value', label: 'Value', value: component.data.value || '' })
        }
        break
      default:
        // For other components, look for common text properties
        if ('text' in component.data) {
          properties.push({ property: 'text', label: 'Text', value: component.data.text || 'Text' })
        }
        if ('label' in component.data) {
          properties.push({ property: 'label', label: 'Label', value: component.data.label || 'Label' })
        }
        break
    }

    return properties
  }

  // Start text editing
  const startTextEditing = (componentId: string, property: string, currentValue: string, x: number, y: number) => {
    console.log('Starting text editing:', { componentId, property, currentValue, x, y })
    setContextMenu(null) // Close context menu first
    setTextEditor({
      componentId,
      property,
      value: currentValue,
      x,
      y
    })
  }

  // Save text changes
  const saveTextChanges = () => {
    if (!textEditor) return

    const component = components.find(c => c.id === textEditor.componentId)
    if (component && onComponentUpdate) {
      console.log('Saving text changes:', {
        componentId: textEditor.componentId,
        property: textEditor.property,
        newValue: textEditor.value,
        oldData: component.data
      })

      const updatedComponent = {
        ...component,
        data: {
          ...component.data,
          [textEditor.property]: textEditor.value
        }
      }

      console.log('Updated component:', updatedComponent)
      onComponentUpdate(updatedComponent)
    }

    setTextEditor(null)
  }

  // Cancel text editing
  const cancelTextEditing = () => {
    setTextEditor(null)
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
      // Track Ctrl key state
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlHeld(true)
      }

      if (canvasMode === 'design' && selectedComponent && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        onComponentDelete?.(selectedComponent)
        onComponentSelect?.(null)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Track Ctrl key state
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlHeld(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [canvasMode, selectedComponent, onComponentDelete, onComponentSelect])

  // Close context menu and text editor when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside text editor
      if (textEditor) {
        const target = e.target as Element
        const textEditorElement = target.closest('[data-text-editor]')
        if (!textEditorElement) {
          cancelTextEditing()
        }
      }

      // Check if click is outside context menu
      if (contextMenu) {
        const target = e.target as Element
        const contextMenuElement = target.closest('.context-menu')
        if (!contextMenuElement) {
          setContextMenu(null)
        }
      }
    }

    if (contextMenu || textEditor) {
      window.addEventListener('click', handleClickOutside)
      return () => window.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu, textEditor])

  return (
    <div className="visual-canvas-container">
      <div className="canvas-controls">
        <button
          onClick={() => setShowHelpModal(true)}
          title="Component Development Guide"
        >
          📚 Dev Guide
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          title="Import Component from Website"
        >
          📥 Import
        </button>
        <button onClick={() => {
          setViewport({ x: 0, y: 0, scale: 1 })
          localStorage.setItem('canvas-zoom', '100')
        }} title="Reset View">
          🏠 Reset
        </button>
        <button onClick={() => {
          if (components.length === 0) return

          // Get actual canvas container size
          const canvasContainer = canvasRef.current
          if (!canvasContainer) return

          const containerRect = canvasContainer.getBoundingClientRect()
          const canvasWidth = containerRect.width
          const canvasHeight = containerRect.height

          // Calculate actual bounds of all components
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

          components.forEach(comp => {
            // Get component size with proper defaults
            const defaultSizes = {
              button: { width: 120, height: 40 },
              input: { width: 200, height: 40 },
              text: { width: 150, height: 30 },
              container: { width: 300, height: 200 },
              imported: { width: 200, height: 100 }
            }

            const size = comp.size || defaultSizes[comp.type as keyof typeof defaultSizes] || { width: 120, height: 40 }

            const left = comp.position.x
            const top = comp.position.y
            const right = left + size.width
            const bottom = top + size.height

            minX = Math.min(minX, left)
            minY = Math.min(minY, top)
            maxX = Math.max(maxX, right)
            maxY = Math.max(maxY, bottom)
          })

          // Add reasonable padding (10% of canvas size or minimum 50px)
          const paddingX = Math.max(50, canvasWidth * 0.1)
          const paddingY = Math.max(50, canvasHeight * 0.1)

          const contentWidth = maxX - minX
          const contentHeight = maxY - minY

          // Calculate scale to fit content with padding
          const availableWidth = canvasWidth - paddingX * 2
          const availableHeight = canvasHeight - paddingY * 2

          const scaleX = availableWidth / contentWidth
          const scaleY = availableHeight / contentHeight
          const scale = Math.min(scaleX, scaleY, 2) // Allow up to 200% zoom

          // Calculate center position of content
          const contentCenterX = (minX + maxX) / 2
          const contentCenterY = (minY + maxY) / 2

          // Calculate viewport position to center the content
          const viewportCenterX = canvasWidth / 2
          const viewportCenterY = canvasHeight / 2

          const offsetX = viewportCenterX / scale - contentCenterX
          const offsetY = viewportCenterY / scale - contentCenterY

          setViewport({ x: offsetX, y: offsetY, scale })
          localStorage.setItem('canvas-zoom', Math.round(scale * 100).toString())
        }} title="Fit to Components">
          📐 Fit All
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
              localPosition={localComponentPositions[component.id]}
              isCtrlHeld={isCtrlHeld}
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
        {contextMenu && canvasMode === 'design' && (() => {
          const component = components.find(c => c.id === contextMenu.componentId)
          const editableProperties = component ? getEditableTextProperties(component) : []

          return (
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
                zIndex: 1000,
                minWidth: '180px'
              }}
            >
              {/* Text editing options */}
              {editableProperties.map((prop) => (
                <button
                  key={prop.property}
                  className="context-menu-item"
                  onClick={() => {
                    startTextEditing(
                      contextMenu.componentId,
                      prop.property,
                      prop.value,
                      contextMenu.x,
                      contextMenu.y
                    )
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ✏️ Edit {prop.label}
                </button>
              ))}

              {/* Separator if there are text properties */}
              {editableProperties.length > 0 && (
                <div style={{
                  height: '1px',
                  background: 'var(--border-primary)',
                  margin: '0.5rem 0'
                }} />
              )}

              {/* Delete option */}
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
          )
        })()}

        {/* Inline Text Editor */}
        {textEditor && (
          <div
            data-text-editor
            style={{
              position: 'fixed',
              left: textEditor.x,
              top: textEditor.y,
              background: 'var(--bg-primary)',
              border: '2px solid var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 2000,
              minWidth: '200px'
            }}
          >
            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Edit {getEditableTextProperties(components.find(c => c.id === textEditor.componentId)!)
                .find(p => p.property === textEditor.property)?.label || textEditor.property}
            </div>
            <input
              type="text"
              value={textEditor.value}
              onChange={(e) => setTextEditor(prev => prev ? { ...prev, value: e.target.value } : null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveTextChanges()
                } else if (e.key === 'Escape') {
                  cancelTextEditing()
                }
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                marginBottom: '0.5rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelTextEditing}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveTextChanges}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
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

      {/* Import Modal */}
      {showImportModal && (
        <div
          className="import-modal-overlay"
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
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="import-modal"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>📥 Import Component</h2>
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
                Import components from popular websites like uiverse.io, CodePen, and more.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Component URL:
                </label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://uiverse.io/username/component-name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={handleImportComponent}
                  disabled={!importUrl || importLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: importUrl && !importLoading ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: importUrl && !importLoading ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: importUrl && !importLoading ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {importLoading ? '⏳ Importing...' : '📥 Import Component'}
                </button>

                <button
                  onClick={() => {
                    setImportUrl('')
                    setShowImportModal(false)
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                🌐 Supported Websites
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⬢ uiverse.io</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    CSS components and animations
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🖊️ CodePen</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Interactive demos and snippets
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🎨 CSS-Tricks</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Tutorials and examples
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

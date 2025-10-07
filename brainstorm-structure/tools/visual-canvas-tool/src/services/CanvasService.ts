/**
 * Canvas Service
 * Manages canvas operations, viewport, and canvas-level interactions
 */

import { 
  CanvasState, 
  ViewportState, 
  Position, 
  GridSettings,
  DragState,
  ResizeHandle,
  CanvasComponent
} from '../types'

class CanvasService {
  private static instance: CanvasService
  private canvasState: CanvasState
  private dragState: DragState | null = null
  private canvasElement: HTMLElement | null = null

  private constructor() {
    this.canvasState = this.getDefaultCanvasState()
  }

  static getInstance(): CanvasService {
    if (!CanvasService.instance) {
      CanvasService.instance = new CanvasService()
    }
    return CanvasService.instance
  }

  // ============================================================================
  // CANVAS STATE MANAGEMENT
  // ============================================================================

  /**
   * Initialize canvas with element reference
   */
  initialize(canvasElement: HTMLElement): void {
    this.canvasElement = canvasElement
  }

  /**
   * Get current canvas state
   */
  getCanvasState(): CanvasState {
    return { ...this.canvasState }
  }

  /**
   * Update canvas state
   */
  updateCanvasState(updates: Partial<CanvasState>): void {
    this.canvasState = { ...this.canvasState, ...updates }
  }

  /**
   * Reset canvas to default state
   */
  resetCanvas(): void {
    this.canvasState = this.getDefaultCanvasState()
    this.dragState = null
  }

  // ============================================================================
  // VIEWPORT MANAGEMENT
  // ============================================================================

  /**
   * Get current viewport state
   */
  getViewport(): ViewportState {
    return { ...this.canvasState.viewport }
  }

  /**
   * Update viewport
   */
  updateViewport(updates: Partial<ViewportState>): void {
    this.canvasState.viewport = { ...this.canvasState.viewport, ...updates }
  }

  /**
   * Pan viewport by delta
   */
  panViewport(deltaX: number, deltaY: number): void {
    this.canvasState.viewport.x += deltaX
    this.canvasState.viewport.y += deltaY
  }

  /**
   * Zoom viewport
   */
  zoomViewport(delta: number, centerPoint?: Position): void {
    const minZoom = 0.1
    const maxZoom = 3.0
    const newScale = Math.max(minZoom, Math.min(maxZoom, this.canvasState.viewport.scale + delta))
    
    if (centerPoint && this.canvasElement) {
      // Zoom towards the center point
      const rect = this.canvasElement.getBoundingClientRect()
      const centerX = centerPoint.x - rect.left
      const centerY = centerPoint.y - rect.top
      
      const scaleDiff = newScale - this.canvasState.viewport.scale
      this.canvasState.viewport.x -= (centerX * scaleDiff)
      this.canvasState.viewport.y -= (centerY * scaleDiff)
    }
    
    this.canvasState.viewport.scale = newScale
  }

  /**
   * Reset viewport to center and 100% zoom
   */
  resetViewport(): void {
    this.canvasState.viewport = { x: 0, y: 0, scale: 1 }
  }

  /**
   * Fit viewport to show all components
   */
  fitToComponents(): void {
    if (this.canvasState.components.length === 0) {
      this.resetViewport()
      return
    }

    // Calculate bounding box of all components
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    this.canvasState.components.forEach(component => {
      const { x, y } = component.position
      const { width, height } = component.size
      
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    })

    if (!this.canvasElement) return

    const rect = this.canvasElement.getBoundingClientRect()
    const padding = 50
    
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const availableWidth = rect.width - (padding * 2)
    const availableHeight = rect.height - (padding * 2)
    
    const scaleX = availableWidth / contentWidth
    const scaleY = availableHeight / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 100%
    
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    
    this.canvasState.viewport = {
      x: (rect.width / 2) - (centerX * scale),
      y: (rect.height / 2) - (centerY * scale),
      scale
    }
  }

  // ============================================================================
  // COORDINATE CONVERSION
  // ============================================================================

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenX: number, screenY: number): Position {
    if (!this.canvasElement) return { x: screenX, y: screenY }

    const rect = this.canvasElement.getBoundingClientRect()
    const { x: viewportX, y: viewportY, scale } = this.canvasState.viewport
    
    return {
      x: (screenX - rect.left - viewportX) / scale,
      y: (screenY - rect.top - viewportY) / scale
    }
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasX: number, canvasY: number): Position {
    if (!this.canvasElement) return { x: canvasX, y: canvasY }

    const rect = this.canvasElement.getBoundingClientRect()
    const { x: viewportX, y: viewportY, scale } = this.canvasState.viewport
    
    return {
      x: (canvasX * scale) + viewportX + rect.left,
      y: (canvasY * scale) + viewportY + rect.top
    }
  }

  // ============================================================================
  // GRID MANAGEMENT
  // ============================================================================

  /**
   * Get grid settings
   */
  getGridSettings(): GridSettings {
    return { ...this.canvasState.gridSettings }
  }

  /**
   * Update grid settings
   */
  updateGridSettings(updates: Partial<GridSettings>): void {
    this.canvasState.gridSettings = { ...this.canvasState.gridSettings, ...updates }
  }

  /**
   * Snap position to grid
   */
  snapToGrid(position: Position): Position {
    if (!this.canvasState.gridSettings.snapToGrid) return position

    const gridSize = this.canvasState.gridSettings.size
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
      z: position.z
    }
  }

  // ============================================================================
  // DRAG AND DROP MANAGEMENT
  // ============================================================================

  /**
   * Start drag operation
   */
  startDrag(
    dragType: 'component' | 'resize' | 'pan',
    startPosition: Position,
    targetComponentId?: string,
    resizeHandle?: ResizeHandle
  ): void {
    this.dragState = {
      isDragging: true,
      dragType,
      startPosition,
      currentPosition: startPosition,
      targetComponentId,
      resizeHandle
    }
  }

  /**
   * Update drag position
   */
  updateDrag(currentPosition: Position): void {
    if (!this.dragState) return
    this.dragState.currentPosition = currentPosition
  }

  /**
   * End drag operation
   */
  endDrag(): DragState | null {
    const finalDragState = this.dragState
    this.dragState = null
    return finalDragState
  }

  /**
   * Get current drag state
   */
  getDragState(): DragState | null {
    return this.dragState ? { ...this.dragState } : null
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragState?.isDragging || false
  }

  // ============================================================================
  // COMPONENT SELECTION
  // ============================================================================

  /**
   * Set selected component
   */
  setSelectedComponent(componentId: string | null): void {
    this.canvasState.selectedComponentId = componentId
  }

  /**
   * Get selected component ID
   */
  getSelectedComponentId(): string | null {
    return this.canvasState.selectedComponentId
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.canvasState.selectedComponentId = null
  }

  // ============================================================================
  // HIT TESTING
  // ============================================================================

  /**
   * Find component at position
   */
  getComponentAtPosition(position: Position): CanvasComponent | null {
    // Search from top to bottom (highest z-index first)
    const sortedComponents = [...this.canvasState.components].sort((a, b) => {
      const aZ = a.position.z || 0
      const bZ = b.position.z || 0
      return bZ - aZ
    })

    for (const component of sortedComponents) {
      if (this.isPositionInComponent(position, component)) {
        return component
      }
    }

    return null
  }

  /**
   * Check if position is within component bounds
   */
  private isPositionInComponent(position: Position, component: CanvasComponent): boolean {
    const { x: compX, y: compY } = component.position
    const { width, height } = component.size
    
    return position.x >= compX && 
           position.x <= compX + width && 
           position.y >= compY && 
           position.y <= compY + height
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get default canvas state
   */
  private getDefaultCanvasState(): CanvasState {
    return {
      viewport: { x: 0, y: 0, scale: 1 },
      components: [],
      selectedComponentId: null,
      gridSettings: {
        size: 20,
        visible: true,
        snapToGrid: true,
        color: 'rgba(245, 245, 220, 0.1)'
      }
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(point1: Position, point2: Position): number {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Get resize handle at position for component
   */
  getResizeHandleAtPosition(position: Position, component: CanvasComponent): ResizeHandle | null {
    const handleSize = 8
    const { x, y } = component.position
    const { width, height } = component.size
    
    const handles: { handle: ResizeHandle; x: number; y: number }[] = [
      { handle: 'nw', x: x - handleSize/2, y: y - handleSize/2 },
      { handle: 'n', x: x + width/2 - handleSize/2, y: y - handleSize/2 },
      { handle: 'ne', x: x + width - handleSize/2, y: y - handleSize/2 },
      { handle: 'w', x: x - handleSize/2, y: y + height/2 - handleSize/2 },
      { handle: 'e', x: x + width - handleSize/2, y: y + height/2 - handleSize/2 },
      { handle: 'sw', x: x - handleSize/2, y: y + height - handleSize/2 },
      { handle: 's', x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
      { handle: 'se', x: x + width - handleSize/2, y: y + height - handleSize/2 }
    ]
    
    for (const { handle, x: hx, y: hy } of handles) {
      if (position.x >= hx && position.x <= hx + handleSize &&
          position.y >= hy && position.y <= hy + handleSize) {
        return handle
      }
    }
    
    return null
  }
}

export default CanvasService

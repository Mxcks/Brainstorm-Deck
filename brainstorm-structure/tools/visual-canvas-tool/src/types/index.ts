/**
 * Type definitions for Visual Canvas Tool
 * Backend data models and interfaces
 */

// ============================================================================
// CORE PROJECT TYPES
// ============================================================================

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  lastModified: Date
  canvasState: CanvasState
  settings: ProjectSettings
  metadata: ProjectMetadata
  status: ProjectStatus
  version: string
}

export interface ProjectMetadata {
  tags: string[]
  category?: string
  author?: string
  lastEditedBy?: string
  componentCount: number
  fileSize: number
  exportFormats: string[]
}

export type ProjectStatus = 'draft' | 'active' | 'archived' | 'template'

export interface CanvasState {
  viewport: ViewportState
  components: CanvasComponent[]
  selectedComponentIds: string[]
  gridSettings: GridSettings
  history: CanvasHistoryEntry[]
  currentHistoryIndex: number
  clipboard: CanvasComponent[]
  dragState: DragState | null
}

export interface CanvasHistoryEntry {
  id: string
  timestamp: Date
  action: string
  components: CanvasComponent[]
  description: string
  viewport?: ViewportState
}

export interface ViewportState {
  x: number
  y: number
  scale: number
}

export interface GridSettings {
  size: number
  visible: boolean
  snapToGrid: boolean
  color: string
}

export interface ProjectSettings {
  theme: 'dark' | 'light'
  autoSave: boolean
  autoSaveInterval: number
}

// ============================================================================
// CANVAS COMPONENT TYPES
// ============================================================================

export interface CanvasComponent {
  id: string
  name: string
  type: ComponentType
  position: Position
  size: Size
  data: ComponentData
  visualProperties: VisualProperties
  parentId?: string
  children?: string[]
  isSelected?: boolean
  isLocked?: boolean
}

export type ComponentType = 
  | 'button' 
  | 'input' 
  | 'textarea'
  | 'form' 
  | 'container' 
  | 'text' 
  | 'image'
  | 'card'
  | 'modal'
  | 'dropdown'

export interface Position {
  x: number
  y: number
  z?: number // z-index for layering
}

export interface Size {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface ComponentData {
  // Common properties
  text?: string
  placeholder?: string
  value?: string
  disabled?: boolean
  required?: boolean
  
  // Button specific
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  
  // Input specific
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  
  // Container specific
  layout?: 'horizontal' | 'vertical' | 'grid'
  gap?: number
  padding?: Spacing
  
  // Form specific
  fields?: FormField[]
  
  // Custom properties
  customProps?: Record<string, any>
}

export interface FormField {
  id: string
  name: string
  type: string
  label: string
  required: boolean
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface VisualProperties {
  // Colors
  backgroundColor?: string
  color?: string
  borderColor?: string
  
  // Typography
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  
  // Spacing
  padding?: Spacing
  margin?: Spacing
  
  // Borders
  borderWidth?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderRadius?: string
  
  // Effects
  boxShadow?: string
  opacity?: number
  transform?: string
  
  // Layout
  display?: string
  flexDirection?: 'row' | 'column'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  
  // Custom CSS
  customCSS?: Record<string, string>
}

export interface Spacing {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface ComponentTemplate {
  id: string
  name: string
  description?: string
  category: TemplateCategory
  type: ComponentType
  defaultData: ComponentData
  defaultVisualProperties: VisualProperties
  defaultSize: Size
  tags: string[]
  usageCount: number
  rating: number
  createdAt: Date
  updatedAt: Date
}

export type TemplateCategory = 
  | 'ui-elements'
  | 'forms'
  | 'layout'
  | 'navigation'
  | 'data-display'
  | 'feedback'
  | 'custom'

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface Workflow {
  id: string
  name: string
  projectId: string
  type: WorkflowType
  currentStage: WorkflowStage
  stages: WorkflowStageData[]
  progress: number
  createdAt: Date
  updatedAt: Date
}

export type WorkflowType = 
  | 'component-creation'
  | 'project-export'
  | 'code-generation'
  | 'design-review'

export type WorkflowStage = 
  | 'design'
  | 'review'
  | 'generate'
  | 'test'
  | 'export'
  | 'complete'

export interface WorkflowStageData {
  stage: WorkflowStage
  name: string
  description: string
  completed: boolean
  data?: Record<string, any>
}

// ============================================================================
// CODE GENERATION TYPES
// ============================================================================

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'html'
  typescript: boolean
  styling: 'css' | 'scss' | 'styled-components' | 'tailwind'
  componentStructure: 'functional' | 'class'
  includeTests: boolean
  includeStorybook: boolean
}

export interface GeneratedCode {
  componentCode: string
  styleCode?: string
  testCode?: string
  storybookCode?: string
  dependencies: string[]
  imports: string[]
}

// ============================================================================
// USER INTERFACE TYPES
// ============================================================================

export interface UIState {
  activeView: 'canvas' | 'library' | 'settings' | 'help'
  sidebarCollapsed: boolean
  selectedTool: Tool | null
  isComponentGeneratorOpen: boolean
  isPropertyPanelOpen: boolean
  dragState: DragState | null
}

export type Tool = 
  | 'select'
  | 'pan'
  | 'component-creator'
  | 'text-editor'

export interface DragState {
  isDragging: boolean
  dragType: 'component' | 'resize' | 'pan'
  startPosition: Position
  currentPosition: Position
  targetComponentId?: string
  resizeHandle?: ResizeHandle
}

export type ResizeHandle = 
  | 'nw' | 'n' | 'ne'
  | 'w'  |     | 'e'
  | 'sw' | 's' | 'se'

// ============================================================================
// API TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface ComponentEvent {
  type: ComponentEventType
  componentId: string
  data?: any
  timestamp: Date
}

export type ComponentEventType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'selected'
  | 'deselected'
  | 'moved'
  | 'resized'
  | 'duplicated'

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface AppSettings {
  user: UserSettings
  canvas: CanvasSettings
  editor: EditorSettings
  export: ExportSettings
}

export interface UserSettings {
  name: string
  email?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  language: string
  autoSave: boolean
  autoSaveInterval: number
  showGrid: boolean
  snapToGrid: boolean
  showRulers: boolean
  showGuides: boolean
}

export interface CanvasSettings {
  defaultZoom: number
  minZoom: number
  maxZoom: number
  panSensitivity: number
  zoomSensitivity: number
  gridSize: number
  gridColor: string
}

export interface EditorSettings {
  showPropertyPanel: boolean
  showComponentTree: boolean
  showCodePreview: boolean
  autoSelectOnCreate: boolean
  duplicateOffset: number
}

export interface ExportSettings {
  defaultFramework: 'react' | 'vue' | 'angular' | 'html'
  defaultStyling: 'css' | 'scss' | 'styled-components' | 'tailwind'
  includeComments: boolean
  formatCode: boolean
  exportPath: string
}

// ============================================================================
// BACKEND SERVICE INTERFACES
// ============================================================================

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
}

export interface ProjectCreateRequest {
  name: string
  description?: string
  template?: string
  settings?: Partial<ProjectSettings>
}

export interface ProjectUpdateRequest {
  id: string
  name?: string
  description?: string
  canvasState?: Partial<CanvasState>
  settings?: Partial<ProjectSettings>
  metadata?: Partial<ProjectMetadata>
}

export interface ComponentCreateRequest {
  type: ComponentType
  position: Position
  size?: Size
  data?: Partial<ComponentData>
  visualProperties?: Partial<VisualProperties>
}

export interface ProjectSearchFilters {
  status?: ProjectStatus[]
  tags?: string[]
  category?: string
  author?: string
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy?: 'name' | 'createdAt' | 'lastModified' | 'componentCount'
  sortOrder?: 'asc' | 'desc'
}

export interface BackupOptions {
  includeHistory: boolean
  includeMetadata: boolean
  format: 'json' | 'zip'
  compression: boolean
}

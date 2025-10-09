import type { ReactNode } from 'react'

export interface ComponentSize {
  width: number
  height: number
}

export interface ComponentPosition {
  x: number
  y: number
}

export interface ComponentData {
  [key: string]: any
}

export interface ComponentRenderProps {
  data: ComponentData
  size: ComponentSize
  position?: ComponentPosition
  isPreview: boolean
  isSelected: boolean
  onInteraction?: (action: string, data?: any) => void
}

export interface ComponentDefinition {
  id: string
  name: string
  category: 'basic' | 'advanced' | 'custom'
  icon: string
  description: string
  defaultSize: ComponentSize
  defaultData: ComponentData
  render: (props: ComponentRenderProps) => ReactNode
  // Optional configuration
  resizable?: boolean
  minSize?: ComponentSize
  maxSize?: ComponentSize
  configurable?: boolean
  // Backend integration
  hasBackend?: boolean
  backendActions?: string[]
}

export interface ComponentCategory {
  id: string
  name: string
  icon: string
  components: ComponentDefinition[]
}

export interface ComponentLibrary {
  categories: ComponentCategory[]
  getComponent: (id: string) => ComponentDefinition | undefined
  getComponentsByCategory: (category: string) => ComponentDefinition[]
  registerComponent: (component: ComponentDefinition) => void
}

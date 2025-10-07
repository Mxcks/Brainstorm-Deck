/**
 * Component Service
 * Manages canvas components, templates, and component operations
 */

import { 
  CanvasComponent, 
  ComponentTemplate, 
  ComponentType, 
  Position, 
  Size,
  ComponentData,
  VisualProperties,
  GeneratedCode,
  CodeGenerationOptions
} from '../types'

class ComponentService {
  private static instance: ComponentService
  private components: Map<string, CanvasComponent> = new Map()
  private templates: Map<string, ComponentTemplate> = new Map()

  private constructor() {
    this.initializeDefaultTemplates()
  }

  static getInstance(): ComponentService {
    if (!ComponentService.instance) {
      ComponentService.instance = new ComponentService()
    }
    return ComponentService.instance
  }

  // ============================================================================
  // COMPONENT MANAGEMENT
  // ============================================================================

  /**
   * Create a new canvas component
   */
  createComponent(
    type: ComponentType,
    position: Position,
    templateId?: string
  ): CanvasComponent {
    const id = this.generateId()
    const template = templateId ? this.templates.get(templateId) : null
    
    const component: CanvasComponent = {
      id,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.slice(-4)}`,
      type,
      position,
      size: template?.defaultSize || this.getDefaultSize(type),
      data: template?.defaultData || this.getDefaultData(type),
      visualProperties: template?.defaultVisualProperties || this.getDefaultVisualProperties(type),
      isSelected: false,
      isLocked: false
    }

    this.components.set(id, component)
    return component
  }

  /**
   * Update component properties
   */
  updateComponent(id: string, updates: Partial<CanvasComponent>): CanvasComponent | null {
    const component = this.components.get(id)
    if (!component) return null

    const updatedComponent = { ...component, ...updates }
    this.components.set(id, updatedComponent)
    return updatedComponent
  }

  /**
   * Delete component
   */
  deleteComponent(id: string): boolean {
    return this.components.delete(id)
  }

  /**
   * Get component by ID
   */
  getComponent(id: string): CanvasComponent | null {
    return this.components.get(id) || null
  }

  /**
   * Get all components
   */
  getAllComponents(): CanvasComponent[] {
    return Array.from(this.components.values())
  }

  /**
   * Duplicate component
   */
  duplicateComponent(id: string, offset: Position = { x: 20, y: 20 }): CanvasComponent | null {
    const original = this.components.get(id)
    if (!original) return null

    const duplicate: CanvasComponent = {
      ...original,
      id: this.generateId(),
      name: `${original.name} Copy`,
      position: {
        x: original.position.x + offset.x,
        y: original.position.y + offset.y,
        z: original.position.z
      },
      isSelected: false
    }

    this.components.set(duplicate.id, duplicate)
    return duplicate
  }

  // ============================================================================
  // COMPONENT POSITIONING & SIZING
  // ============================================================================

  /**
   * Move component to new position
   */
  moveComponent(id: string, position: Position): boolean {
    const component = this.components.get(id)
    if (!component) return false

    component.position = { ...component.position, ...position }
    return true
  }

  /**
   * Resize component
   */
  resizeComponent(id: string, size: Size): boolean {
    const component = this.components.get(id)
    if (!component) return false

    // Apply size constraints
    const constrainedSize = this.applySizeConstraints(size, component.size)
    component.size = constrainedSize
    return true
  }

  /**
   * Apply size constraints
   */
  private applySizeConstraints(newSize: Size, currentSize: Size): Size {
    return {
      width: Math.max(newSize.minWidth || 20, Math.min(newSize.maxWidth || 2000, newSize.width)),
      height: Math.max(newSize.minHeight || 20, Math.min(newSize.maxHeight || 2000, newSize.height)),
      minWidth: currentSize.minWidth,
      minHeight: currentSize.minHeight,
      maxWidth: currentSize.maxWidth,
      maxHeight: currentSize.maxHeight
    }
  }

  // ============================================================================
  // COMPONENT SELECTION
  // ============================================================================

  /**
   * Select component
   */
  selectComponent(id: string): boolean {
    // Deselect all components first
    this.components.forEach(component => {
      component.isSelected = false
    })

    // Select the target component
    const component = this.components.get(id)
    if (!component) return false

    component.isSelected = true
    return true
  }

  /**
   * Deselect all components
   */
  deselectAllComponents(): void {
    this.components.forEach(component => {
      component.isSelected = false
    })
  }

  /**
   * Get selected component
   */
  getSelectedComponent(): CanvasComponent | null {
    for (const component of this.components.values()) {
      if (component.isSelected) return component
    }
    return null
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Create template from component
   */
  createTemplate(componentId: string, templateData: Partial<ComponentTemplate>): ComponentTemplate | null {
    const component = this.components.get(componentId)
    if (!component) return null

    const template: ComponentTemplate = {
      id: this.generateId(),
      name: templateData.name || `${component.type} Template`,
      description: templateData.description || '',
      category: templateData.category || 'custom',
      type: component.type,
      defaultData: { ...component.data },
      defaultVisualProperties: { ...component.visualProperties },
      defaultSize: { ...component.size },
      tags: templateData.tags || [],
      usageCount: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.templates.set(template.id, template)
    return template
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ComponentTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): ComponentTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category)
  }

  // ============================================================================
  // CODE GENERATION
  // ============================================================================

  /**
   * Generate code for component
   */
  generateComponentCode(componentId: string, options: CodeGenerationOptions): GeneratedCode | null {
    const component = this.components.get(componentId)
    if (!component) return null

    switch (options.framework) {
      case 'react':
        return this.generateReactCode(component, options)
      case 'vue':
        return this.generateVueCode(component, options)
      case 'html':
        return this.generateHTMLCode(component, options)
      default:
        throw new Error(`Unsupported framework: ${options.framework}`)
    }
  }

  /**
   * Generate React component code
   */
  private generateReactCode(component: CanvasComponent, options: CodeGenerationOptions): GeneratedCode {
    const componentName = this.toPascalCase(component.name)
    const props = this.generateReactProps(component)
    const styles = this.generateStyles(component, options.styling)

    const componentCode = `
import React from 'react'${options.styling === 'styled-components' ? `
import styled from 'styled-components'` : options.styling !== 'tailwind' ? `
import './${componentName}.${options.styling === 'scss' ? 'scss' : 'css'}'` : ''}

${options.typescript ? `interface ${componentName}Props {
  ${props.interface}
}

const ${componentName}: React.FC<${componentName}Props> = (${props.destructured}) => {` : `const ${componentName} = (${props.destructured}) => {`}
  return (
    ${this.generateJSX(component, options)}
  )
}

export default ${componentName}
    `.trim()

    return {
      componentCode,
      styleCode: options.styling !== 'styled-components' && options.styling !== 'tailwind' ? styles : undefined,
      dependencies: this.getRequiredDependencies(component, options),
      imports: this.getRequiredImports(component, options)
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    }).replace(/\s+/g, '')
  }

  private getDefaultSize(type: ComponentType): Size {
    const defaults: Record<ComponentType, Size> = {
      button: { width: 120, height: 40, minWidth: 60, minHeight: 30 },
      input: { width: 200, height: 40, minWidth: 100, minHeight: 30 },
      textarea: { width: 300, height: 120, minWidth: 150, minHeight: 60 },
      form: { width: 400, height: 300, minWidth: 200, minHeight: 150 },
      container: { width: 300, height: 200, minWidth: 100, minHeight: 100 },
      text: { width: 150, height: 30, minWidth: 50, minHeight: 20 },
      image: { width: 200, height: 150, minWidth: 50, minHeight: 50 },
      card: { width: 300, height: 200, minWidth: 150, minHeight: 100 },
      modal: { width: 500, height: 400, minWidth: 300, minHeight: 200 },
      dropdown: { width: 200, height: 40, minWidth: 100, minHeight: 30 }
    }
    return defaults[type]
  }

  private getDefaultData(type: ComponentType): ComponentData {
    const defaults: Record<ComponentType, ComponentData> = {
      button: { text: 'Button', variant: 'primary', size: 'medium' },
      input: { placeholder: 'Enter text...', inputType: 'text' },
      textarea: { placeholder: 'Enter text...', text: '' },
      form: { fields: [] },
      container: { layout: 'vertical', gap: 16 },
      text: { text: 'Text Content' },
      image: { text: 'Image' },
      card: { text: 'Card Content' },
      modal: { text: 'Modal Content' },
      dropdown: { text: 'Select option...' }
    }
    return defaults[type]
  }

  private getDefaultVisualProperties(type: ComponentType): VisualProperties {
    return {
      backgroundColor: type === 'button' ? '#7c9885' : '#161b22',
      color: '#e6edf3',
      borderColor: '#30363d',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      padding: { top: 12, right: 16, bottom: 12, left: 16 },
      fontSize: '14px',
      fontWeight: '400'
    }
  }

  private initializeDefaultTemplates(): void {
    // Initialize with some default templates
    // This would typically load from a configuration file or API
  }

  // Placeholder methods for code generation
  private generateReactProps(component: CanvasComponent): any { return {} }
  private generateStyles(component: CanvasComponent, styling: string): string { return '' }
  private generateJSX(component: CanvasComponent, options: CodeGenerationOptions): string { return '' }
  private generateVueCode(component: CanvasComponent, options: CodeGenerationOptions): GeneratedCode { return {} as GeneratedCode }
  private generateHTMLCode(component: CanvasComponent, options: CodeGenerationOptions): GeneratedCode { return {} as GeneratedCode }
  private getRequiredDependencies(component: CanvasComponent, options: CodeGenerationOptions): string[] { return [] }
  private getRequiredImports(component: CanvasComponent, options: CodeGenerationOptions): string[] { return [] }
}

export default ComponentService

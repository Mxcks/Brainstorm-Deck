import type { ComponentDefinition, ComponentLibrary, ComponentCategory } from './types'
import { ButtonComponent } from './basic/Button'
import { InputComponent } from './basic/Input'

// Component registry
const components: ComponentDefinition[] = [
  ButtonComponent,
  InputComponent
]

// Organize components by category
const categorizeComponents = (): ComponentCategory[] => {
  const categoryMap = new Map<string, ComponentDefinition[]>()

  components.forEach(component => {
    if (!categoryMap.has(component.category)) {
      categoryMap.set(component.category, [])
    }
    categoryMap.get(component.category)!.push(component)
  })

  const categories: ComponentCategory[] = []

  // Basic components
  if (categoryMap.has('basic')) {
    categories.push({
      id: 'basic',
      name: 'Basic',
      icon: '🔧',
      components: categoryMap.get('basic')!
    })
  }

  // Advanced components
  if (categoryMap.has('advanced')) {
    categories.push({
      id: 'advanced',
      name: 'Advanced',
      icon: '⚡',
      components: categoryMap.get('advanced')!
    })
  }

  // Custom components
  if (categoryMap.has('custom')) {
    categories.push({
      id: 'custom',
      name: 'Custom',
      icon: '🎨',
      components: categoryMap.get('custom')!
    })
  }

  return categories
}

// Component library implementation
export const componentLibrary: ComponentLibrary = {
  categories: categorizeComponents(),
  
  getComponent: (id: string) => {
    return components.find(component => component.id === id)
  },
  
  getComponentsByCategory: (category: string) => {
    return components.filter(component => component.category === category)
  },
  
  registerComponent: (component: ComponentDefinition) => {
    // Check if component already exists
    const existingIndex = components.findIndex(c => c.id === component.id)
    
    if (existingIndex >= 0) {
      // Replace existing component
      components[existingIndex] = component
      console.log(`🔄 Updated component: ${component.id}`)
    } else {
      // Add new component
      components.push(component)
      console.log(`➕ Registered new component: ${component.id}`)
    }
    
    // Refresh categories
    componentLibrary.categories = categorizeComponents()
  }
}

// Export individual components for direct import
export { ButtonComponent, InputComponent }

// Export types
export * from './types'

// Utility functions
export const getComponentIcon = (type: string): string => {
  const component = componentLibrary.getComponent(type)
  return component?.icon || '⚪'
}

export const getComponentName = (type: string): string => {
  const component = componentLibrary.getComponent(type)
  return component?.name || type
}

export const getDefaultSize = (type: string) => {
  const component = componentLibrary.getComponent(type)
  return component?.defaultSize || { width: 100, height: 40 }
}

export const getDefaultData = (type: string) => {
  const component = componentLibrary.getComponent(type)
  return component?.defaultData || {}
}

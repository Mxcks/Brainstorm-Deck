import { BackendEngine, BackendContext, ComponentRegistry, ComponentHandler, ActionResult } from './types'
import { EventBusImpl } from './services/EventBus'
import { StateManagerImpl } from './services/StateManager'
import { ButtonHandler } from './handlers/ButtonHandler'
import { InputHandler } from './handlers/InputHandler'

// Simple implementations for DataStore and ComponentRegistry
class DataStoreImpl {
  private data: Map<string, any> = new Map()

  set(key: string, value: any): void {
    this.data.set(key, value)
  }

  get(key: string): any {
    return this.data.get(key)
  }

  delete(key: string): void {
    this.data.delete(key)
  }

  clear(): void {
    this.data.clear()
  }

  has(key: string): boolean {
    return this.data.has(key)
  }
}

class ComponentRegistryImpl implements ComponentRegistry {
  private handlers: Map<string, ComponentHandler> = new Map()

  getHandler(componentId: string): ComponentHandler | undefined {
    return this.handlers.get(componentId)
  }

  registerHandler(handler: ComponentHandler): void {
    this.handlers.set(handler.componentId, handler)
    console.log(`🔧 Registered handler for component: ${handler.componentId}`)
  }

  getHandlers(): ComponentHandler[] {
    return Array.from(this.handlers.values())
  }
}

// Main Backend Engine
export class BackendEngineImpl implements BackendEngine {
  private context: BackendContext

  constructor() {
    const eventBus = new EventBusImpl()
    const stateManager = new StateManagerImpl()
    const dataStore = new DataStoreImpl()
    const componentRegistry = new ComponentRegistryImpl()

    this.context = {
      eventBus,
      stateManager,
      dataStore,
      componentRegistry
    }

    // Register default handlers
    this.registerDefaultHandlers()
  }

  private registerDefaultHandlers(): void {
    this.context.componentRegistry.registerHandler(ButtonHandler)
    this.context.componentRegistry.registerHandler(InputHandler)
  }

  async handleAction(
    componentId: string, 
    componentType: string, 
    action: string, 
    data: any
  ): Promise<ActionResult> {
    console.log(`🚀 Backend action: ${componentType}.${action} for ${componentId}`, data)

    const handler = this.context.componentRegistry.getHandler(componentType)
    
    if (!handler) {
      console.warn(`⚠️ No handler found for component type: ${componentType}`)
      return {
        success: false,
        error: `No handler registered for component type: ${componentType}`
      }
    }

    const actionHandler = handler.actions[action]
    
    if (!actionHandler) {
      console.warn(`⚠️ No action handler found for: ${componentType}.${action}`)
      return {
        success: false,
        error: `No action handler found for: ${componentType}.${action}`
      }
    }

    try {
      const result = await actionHandler(componentId, data, this.context)
      console.log(`✅ Action completed successfully:`, result)
      return result
    } catch (error) {
      console.error(`❌ Action failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  initializeComponent(componentId: string, componentType: string, initialData: any): void {
    const handler = this.context.componentRegistry.getHandler(componentType)
    
    if (handler && handler.initialize) {
      const initialState = handler.initialize(componentId, initialData)
      this.context.stateManager.updateComponent(componentId, initialState)
    }
  }

  cleanupComponent(componentId: string, componentType: string): void {
    const handler = this.context.componentRegistry.getHandler(componentType)
    
    if (handler && handler.cleanup) {
      handler.cleanup(componentId)
    }
    
    // Remove from state manager
    this.context.stateManager.removeComponent(componentId)
  }

  getContext(): BackendContext {
    return this.context
  }
}

// Export singleton instance
export const backendEngine = new BackendEngineImpl()

// Export types and classes for external use
export * from './types'
export { EventBusImpl, StateManagerImpl }

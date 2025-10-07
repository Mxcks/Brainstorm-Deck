import { StateManager, ComponentState } from '../types'

export class StateManagerImpl implements StateManager {
  private componentStates: Map<string, ComponentState> = new Map()
  private globalState: Map<string, any> = new Map()

  getState(componentId: string): ComponentState {
    return this.componentStates.get(componentId) || {}
  }

  updateComponent(componentId: string, updates: Partial<ComponentState>): void {
    const currentState = this.getState(componentId)
    const newState = { ...currentState, ...updates }
    this.componentStates.set(componentId, newState)
    
    console.log(`💾 Component state updated for ${componentId}:`, updates)
  }

  setGlobal(key: string, value: any): void {
    this.globalState.set(key, value)
    console.log(`💾 Global state updated: ${key} =`, value)
  }

  getGlobal(key: string): any {
    return this.globalState.get(key)
  }

  reset(): void {
    this.componentStates.clear()
    this.globalState.clear()
    console.log('💾 All state cleared')
  }

  // Utility methods
  getAllComponentStates(): Map<string, ComponentState> {
    return new Map(this.componentStates)
  }

  getAllGlobalState(): Map<string, any> {
    return new Map(this.globalState)
  }

  removeComponent(componentId: string): void {
    this.componentStates.delete(componentId)
    console.log(`💾 Component state removed for ${componentId}`)
  }

  hasComponent(componentId: string): boolean {
    return this.componentStates.has(componentId)
  }

  // Persistence methods (for future use)
  serialize(): string {
    return JSON.stringify({
      components: Object.fromEntries(this.componentStates),
      global: Object.fromEntries(this.globalState)
    })
  }

  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data)
      this.componentStates = new Map(Object.entries(parsed.components || {}))
      this.globalState = new Map(Object.entries(parsed.global || {}))
      console.log('💾 State deserialized successfully')
    } catch (error) {
      console.error('💾 Failed to deserialize state:', error)
    }
  }
}

import { EventBus, EventData } from '../types'

export class EventBusImpl implements EventBus {
  private listeners: Map<string, Set<(data: EventData) => void>> = new Map()

  emit(event: string, data: EventData): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
    
    // Log event for debugging
    console.log(`📡 Event emitted: ${event}`, data)
  }

  on(event: string, handler: (data: EventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    console.log(`📡 Event listener added for: ${event}`)
  }

  off(event: string, handler: (data: EventData) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(handler)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
    console.log(`📡 Event listener removed for: ${event}`)
  }

  once(event: string, handler: (data: EventData) => void): void {
    const onceHandler = (data: EventData) => {
      handler(data)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  // Utility methods
  getEventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0
  }

  clear(): void {
    this.listeners.clear()
    console.log('📡 All event listeners cleared')
  }
}

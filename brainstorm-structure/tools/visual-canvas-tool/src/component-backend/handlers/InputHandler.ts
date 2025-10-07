import { ComponentHandler, ActionResult } from '../types'

export const InputHandler: ComponentHandler = {
  componentId: 'input',
  
  actions: {
    change: async (componentId, data, context) => {
      console.log(`📝 Input ${componentId} changed:`, data.value)
      
      // Get current state
      const currentState = context.stateManager.getState(componentId)
      
      // Update component state
      context.stateManager.updateComponent(componentId, {
        value: data.value,
        lastChanged: Date.now(),
        changeCount: (currentState.changeCount || 0) + 1
      })
      
      // Emit change event for other components
      context.eventBus.emit('input:changed', {
        componentId,
        value: data.value,
        previousValue: currentState.value,
        timestamp: Date.now()
      })
      
      // Validate input if needed
      const isValid = data.value.length > 0
      
      return { 
        success: true, 
        message: `Input value updated to: "${data.value}"`,
        data: { 
          value: data.value, 
          isValid,
          length: data.value.length 
        }
      }
    },
    
    focus: async (componentId, data, context) => {
      console.log(`📝 Input ${componentId} focused`)
      
      // Update focus state
      context.stateManager.updateComponent(componentId, {
        isFocused: true,
        lastFocused: Date.now()
      })
      
      // Emit focus event
      context.eventBus.emit('input:focused', {
        componentId,
        timestamp: Date.now()
      })
      
      return { 
        success: true, 
        message: 'Input focused' 
      }
    },
    
    blur: async (componentId, data, context) => {
      console.log(`📝 Input ${componentId} blurred`)
      
      // Update focus state
      context.stateManager.updateComponent(componentId, {
        isFocused: false,
        lastBlurred: Date.now()
      })
      
      // Emit blur event
      context.eventBus.emit('input:blurred', {
        componentId,
        timestamp: Date.now()
      })
      
      return { 
        success: true, 
        message: 'Input blurred' 
      }
    },
    
    submit: async (componentId, data, context) => {
      console.log(`📝 Input ${componentId} submitted:`, data.value)
      
      const currentState = context.stateManager.getState(componentId)
      
      // Update submit state
      context.stateManager.updateComponent(componentId, {
        lastSubmitted: Date.now(),
        submitCount: (currentState.submitCount || 0) + 1
      })
      
      // Emit submit event
      context.eventBus.emit('input:submitted', {
        componentId,
        value: data.value,
        timestamp: Date.now()
      })
      
      return { 
        success: true, 
        message: `Input submitted with value: "${data.value}"`,
        data: { value: data.value }
      }
    }
  },
  
  initialize: (componentId, initialData) => {
    console.log(`📝 Initializing input ${componentId} with data:`, initialData)
    
    return {
      value: initialData.value || '',
      isFocused: false,
      changeCount: 0,
      submitCount: 0,
      createdAt: Date.now()
    }
  },
  
  cleanup: (componentId) => {
    console.log(`📝 Cleaning up input ${componentId}`)
    // Perform any necessary cleanup
  }
}

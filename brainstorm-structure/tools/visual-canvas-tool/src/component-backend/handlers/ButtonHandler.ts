import { ComponentHandler, ActionResult } from '../types'

export const ButtonHandler: ComponentHandler = {
  componentId: 'button',
  
  actions: {
    click: async (componentId, data, context) => {
      console.log(`🔘 Button ${componentId} clicked:`, data)
      
      // Get current state
      const currentState = context.stateManager.getState(componentId)
      const clickCount = (currentState.clickCount || 0) + 1
      
      // Update component state
      context.stateManager.updateComponent(componentId, {
        clickCount,
        lastClicked: Date.now(),
        lastClickData: data
      })
      
      // Emit event for other components to listen
      context.eventBus.emit('button:clicked', {
        componentId,
        text: data.text,
        clickCount,
        timestamp: Date.now()
      })
      
      // Log for debugging
      console.log(`Button clicked ${clickCount} times`)
      
      return { 
        success: true, 
        message: `Button "${data.text}" clicked successfully`,
        data: { clickCount }
      }
    },
    
    hover: async (componentId, data, context) => {
      console.log(`🔘 Button ${componentId} hovered:`, data.state)
      
      // Emit hover event
      context.eventBus.emit('button:hover', {
        componentId,
        state: data.state,
        timestamp: Date.now()
      })
      
      return { 
        success: true, 
        message: `Button hover ${data.state}` 
      }
    },
    
    focus: async (componentId, data, context) => {
      console.log(`🔘 Button ${componentId} focused`)
      
      // Update focus state
      context.stateManager.updateComponent(componentId, {
        isFocused: true,
        lastFocused: Date.now()
      })
      
      return { 
        success: true, 
        message: 'Button focused' 
      }
    }
  },
  
  initialize: (componentId, initialData) => {
    console.log(`🔘 Initializing button ${componentId} with data:`, initialData)
    
    return {
      clickCount: 0,
      isFocused: false,
      isHovered: false,
      createdAt: Date.now()
    }
  },
  
  cleanup: (componentId) => {
    console.log(`🔘 Cleaning up button ${componentId}`)
    // Perform any necessary cleanup
  }
}

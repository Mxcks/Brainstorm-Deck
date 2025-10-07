# Component Backend

This folder contains the backend logic and handlers for component interactions in Preview mode.

## 📁 Structure

```
component-backend/
├── README.md                 # This file
├── index.ts                  # Backend registry and main exports
├── types.ts                  # Backend type definitions
├── handlers/                 # Component interaction handlers
│   ├── ButtonHandler.ts
│   ├── InputHandler.ts
│   ├── CalculatorHandler.ts
│   └── [component-handlers]
├── services/                 # Shared backend services
│   ├── StateManager.ts
│   ├── EventBus.ts
│   └── DataStore.ts
└── utils/                    # Backend utilities
    ├── validation.ts
    └── helpers.ts
```

## 🎯 Backend Handler Requirements

Each component handler must implement:

1. **Action Handlers**: Functions for each component action
2. **State Management**: Component-specific state handling
3. **Event Emission**: Notify other components of changes
4. **Data Validation**: Validate interaction data

## 📝 Example Handler Structure

```typescript
// ButtonHandler.ts
import { ComponentHandler } from '../types'

export const ButtonHandler: ComponentHandler = {
  componentId: 'button',
  
  actions: {
    click: async (componentId, data, context) => {
      console.log(`Button ${componentId} clicked:`, data)
      
      // Emit event for other components
      context.eventBus.emit('button:clicked', {
        componentId,
        text: data.text,
        timestamp: Date.now()
      })
      
      // Update component state if needed
      context.stateManager.updateComponent(componentId, {
        lastClicked: Date.now()
      })
      
      return { success: true, message: 'Button clicked successfully' }
    },
    
    hover: async (componentId, data, context) => {
      console.log(`Button ${componentId} hovered:`, data.state)
      return { success: true }
    }
  },
  
  initialize: (componentId, initialData) => {
    console.log(`Initializing button ${componentId}`)
    return { clickCount: 0 }
  },
  
  cleanup: (componentId) => {
    console.log(`Cleaning up button ${componentId}`)
  }
}
```

## 🔧 Backend Context

Each handler receives a context object with:

- **eventBus**: For component communication
- **stateManager**: For persistent state management
- **dataStore**: For shared data access
- **componentRegistry**: Access to other components

## 🚀 Adding New Handlers

1. Create handler file in `handlers/` folder
2. Implement the `ComponentHandler` interface
3. Register in `index.ts`
4. Add corresponding component in `../component-library/`

## 📡 Event System

Components can communicate through the event bus:

```typescript
// Emit event
context.eventBus.emit('calculator:result', { value: 42 })

// Listen for events
context.eventBus.on('input:changed', (data) => {
  // Handle input change
})
```

## 💾 State Management

Persistent component state:

```typescript
// Get component state
const state = context.stateManager.getState(componentId)

// Update component state
context.stateManager.updateComponent(componentId, { value: newValue })

// Global state
context.stateManager.setGlobal('theme', 'dark')
```

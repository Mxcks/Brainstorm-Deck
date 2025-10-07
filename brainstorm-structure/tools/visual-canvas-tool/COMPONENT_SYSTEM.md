# Visual Canvas Tool - Component System

## 🎯 Overview

The Visual Canvas Tool now has a modular component system with separate **Component Library** and **Component Backend** folders for easy AI-assisted development.

## 📁 Folder Structure

```
src/
├── component-library/          # Visual components for the canvas
│   ├── README.md              # Component library documentation
│   ├── types.ts               # Component type definitions
│   ├── index.ts               # Main exports and registry
│   ├── basic/                 # Basic UI components
│   │   ├── Button.tsx         # Button component
│   │   ├── Input.tsx          # Input component
│   │   ├── Text.tsx           # Text component (future)
│   │   └── Container.tsx      # Container component (future)
│   ├── advanced/              # Advanced components
│   │   ├── Calculator.tsx     # Calculator component (future)
│   │   ├── Chart.tsx          # Chart component (future)
│   │   └── DataTable.tsx      # Data table component (future)
│   └── custom/                # User-created components
│       └── [custom-components]
│
├── component-backend/          # Backend logic for components
│   ├── README.md              # Backend documentation
│   ├── types.ts               # Backend type definitions
│   ├── index.ts               # Main backend engine
│   ├── handlers/              # Component interaction handlers
│   │   ├── ButtonHandler.ts   # Button backend logic
│   │   ├── InputHandler.ts    # Input backend logic
│   │   └── [component-handlers]
│   ├── services/              # Shared backend services
│   │   ├── EventBus.ts        # Component communication
│   │   ├── StateManager.ts    # State management
│   │   └── DataStore.ts       # Data storage
│   └── utils/                 # Backend utilities
│       └── [utility-files]
```

## 🚀 How It Works

### 1. **Component Library** (`src/component-library/`)
- Contains visual React components that appear in the left sidebar
- Each component exports a `ComponentDefinition` with metadata and render function
- Components are automatically categorized (basic, advanced, custom)
- Easy to add new components with proper TypeScript interfaces

### 2. **Component Backend** (`src/component-backend/`)
- Contains interaction logic for Preview mode
- Each component type has a corresponding handler
- Provides state management, event system, and data persistence
- Handles component actions (click, change, submit, etc.)

### 3. **Integration**
- Components in Design mode: Visual editing, moving, resizing
- Components in Preview mode: Real backend interactions
- No selection boxes in Preview mode - only actual functionality

## 🎨 Adding New Components (AI Instructions)

When asked to create a new component (e.g., "create a calculator component"):

### Step 1: Create Component Library File
```typescript
// src/component-library/advanced/Calculator.tsx
import { ComponentDefinition } from '../types'

export const CalculatorComponent: ComponentDefinition = {
  id: 'calculator',
  name: 'Calculator',
  category: 'advanced',
  icon: '🧮',
  description: 'Interactive calculator component',
  defaultSize: { width: 200, height: 300 },
  defaultData: { 
    display: '0',
    theme: 'default'
  },
  hasBackend: true,
  backendActions: ['number', 'operator', 'equals', 'clear'],
  render: ({ data, size, isPreview, onInteraction }) => (
    // Calculator JSX here
  )
}
```

### Step 2: Create Backend Handler
```typescript
// src/component-backend/handlers/CalculatorHandler.ts
import { ComponentHandler } from '../types'

export const CalculatorHandler: ComponentHandler = {
  componentId: 'calculator',
  actions: {
    number: async (componentId, data, context) => {
      // Handle number input
    },
    operator: async (componentId, data, context) => {
      // Handle operator input
    },
    equals: async (componentId, data, context) => {
      // Handle calculation
    },
    clear: async (componentId, data, context) => {
      // Handle clear
    }
  },
  initialize: (componentId, initialData) => ({
    display: '0',
    previousValue: null,
    operator: null,
    waitingForOperand: false
  })
}
```

### Step 3: Register Components
```typescript
// Add to src/component-library/index.ts
import { CalculatorComponent } from './advanced/Calculator'

// Add to components array
const components: ComponentDefinition[] = [
  ButtonComponent,
  InputComponent,
  CalculatorComponent  // Add here
]

// Add to src/component-backend/index.ts
import { CalculatorHandler } from './handlers/CalculatorHandler'

// Register in constructor
this.context.componentRegistry.registerHandler(CalculatorHandler)
```

## 🔧 Current Implementation Status

### ✅ **Completed**
- Component library structure and types
- Backend engine with event system and state management
- Button and Input components with full backend integration
- Preview mode interaction (no selection boxes)
- Proper folder organization for AI development

### 🎯 **Ready for AI Development**
- Calculator component creation
- Chart/graph components
- Data table components
- Form components
- Custom user components

## 📋 Example AI Prompts

**"Create a calculator component"**
- AI will create `Calculator.tsx` in `component-library/advanced/`
- AI will create `CalculatorHandler.ts` in `component-backend/handlers/`
- AI will register both components in the respective index files

**"Add a chart component with real-time data"**
- AI will create chart component with data visualization
- AI will create backend handler for data updates and real-time events
- AI will integrate with the event system for live updates

**"Create a todo list component"**
- AI will create interactive todo list UI
- AI will create backend for add/remove/complete actions
- AI will use state management for persistence

## 🎉 Benefits

1. **Modular**: Easy to add/remove components
2. **AI-Friendly**: Clear structure for AI development
3. **Type-Safe**: Full TypeScript support
4. **Scalable**: Separate concerns (UI vs Logic)
5. **Professional**: Industry-standard architecture
6. **Interactive**: Real backend functionality in Preview mode

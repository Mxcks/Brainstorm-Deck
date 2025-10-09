# Visual Canvas Tool - Component System Mapping

## Component Library Structure

### Current Components

#### 1. Button Component
**File**: `src/component-library/basic/Button.tsx`
**ID**: `button-default-v1`
**Category**: `basic`
**Icon**: `🔘`
**Default Size**: `{ width: 120, height: 40 }`
**Props Interface**:
```typescript
{
  text: string
  variant: 'primary' | 'secondary' | 'outline'
  size: 'small' | 'medium' | 'large'
  disabled: boolean
  onClick: () => void
}
```

#### 2. Input Component
**File**: `src/component-library/basic/Input.tsx`
**ID**: `input-default-v1`
**Category**: `basic`
**Icon**: `📝`
**Default Size**: `{ width: 200, height: 40 }`
**Props Interface**:
```typescript
{
  placeholder: string
  value: string
  type: 'text' | 'email' | 'password' | 'number'
  disabled: boolean
  onChange: (value: string) => void
}
```

### Component Registration System

#### Registry Location
**File**: `src/component-library/index.ts`
**Function**: `componentLibrary.registerComponent()`

#### Component Categories
1. **Basic** (`basic`): Fundamental UI elements
   - Icon: 🔧
   - Components: Button, Input

2. **Advanced** (`advanced`): Complex interactive components
   - Icon: ⚡
   - Components: (None currently registered)

3. **Custom** (`custom`): User-imported components
   - Icon: 🎨
   - Components: (Dynamically added via import system)

### Component Definition Interface

```typescript
interface ComponentDefinition {
  id: string                    // Unique identifier
  name: string                  // Display name
  category: string              // Category for organization
  icon: string                  // Emoji icon for UI
  description?: string          // Optional description
  defaultSize: {                // Default dimensions
    width: number
    height: number
  }
  defaultData: any              // Default props/data
  render: (props: {             // Render function
    data: any
    size: { width: number; height: number }
    isSelected: boolean
    canvasMode: 'design' | 'preview'
    onInteraction?: (action: string, data?: any) => void
  }) => JSX.Element
}
```

## Canvas Component System

### CanvasComponent Interface
```typescript
interface CanvasComponent {
  id: string                    // Unique instance ID
  type: string                  // Component type (matches ComponentDefinition.id)
  name: string                  // Instance name
  position: {                   // Canvas position
    x: number
    y: number
  }
  size: {                       // Component dimensions
    width: number
    height: number
  }
  data: any                     // Component-specific data/props
  zIndex: number                // Layer order
}
```

### Component Lifecycle

#### 1. Component Creation
**Trigger**: User clicks component button in sidebar
**Process**:
1. Get ComponentDefinition from library
2. Generate unique ID
3. Create CanvasComponent with default values
4. Add to canvas components array
5. Save to localStorage

#### 2. Component Rendering
**Location**: `ComponentRenderer` function in `VisualCanvas.tsx`
**Process**:
1. Check if component is visible in viewport
2. Get ComponentDefinition from library
3. Apply current position (local or committed)
4. Render with appropriate props and styling
5. Handle interaction events

#### 3. Component Interaction
**Design Mode**: Selection, dragging, context menus
**Preview Mode**: Full component functionality

### Component Import System

#### Import Sources
1. **uiverse.io**: CSS/HTML components
2. **Custom URLs**: User-provided component sources
3. **Code Paste**: Direct code input (future feature)

#### Import Process
**File**: `src/services/ComponentImporter.ts`
**Steps**:
1. Parse URL and extract component code
2. Analyze code structure (HTML, CSS, JS)
3. Generate React component wrapper
4. Create ComponentDefinition
5. Register in component library
6. Add to 'custom' category

#### Import Data Structure
```typescript
interface ImportResult {
  success: boolean
  component?: ComponentDefinition
  error?: string
  metadata?: {
    source: string
    extractedAt: Date
    codeSize: number
    dependencies: string[]
  }
}
```

## State Management

### Canvas State
**Location**: `VisualCanvas.tsx`
**Persistence**: localStorage
**Key States**:
- `components`: Array of CanvasComponent instances
- `viewport`: Canvas position and zoom
- `selectedComponent`: Currently selected component ID
- `canvasMode`: Design or Preview mode

### Project State
**Location**: `App.tsx`
**Persistence**: localStorage
**Structure**:
```typescript
interface Project {
  id: string
  name: string
  createdAt: Date
  lastModified: Date
  canvasState: {
    components: CanvasComponent[]
    viewport?: ViewportState
    settings?: any
  }
}
```

### Component Library State
**Location**: `component-library/index.ts`
**Persistence**: In-memory (rebuilt on app load)
**Dynamic Updates**: Components can be registered at runtime

## Performance Optimizations

### Viewport Culling
**Purpose**: Only render components visible in current viewport
**Implementation**: `getVisibleComponents()` function
**Benefits**: Improved performance with large numbers of components

### Drag Optimization
**Purpose**: Smooth component dragging without lag
**Implementation**: Local state for drag positions
**Process**:
1. Store drag positions in `localComponentPositions`
2. Update only local state during drag
3. Commit to main state on drag end
4. Disable CSS transitions during drag

### Component Memoization
**Purpose**: Prevent unnecessary re-renders
**Implementation**: React.memo and useCallback hooks
**Applied To**: ComponentRenderer and heavy computation functions

## Integration Points

### Backend Integration
**File**: `src/component-backend/index.ts`
**Purpose**: Handle component interactions in Preview mode
**Handlers**: Component-specific interaction handlers

### Data Services
**File**: `src/services/dataService.ts`
**Purpose**: Data persistence and project management
**Methods**:
- `loadProjects()`: Load all projects
- `saveProject()`: Save project state
- `loadSettings()`: Load user preferences
- `saveSettings()`: Save user preferences

### Theme System
**File**: `src/styles/theme.ts`
**Purpose**: Consistent styling across components
**Primary Color**: Sage Green (#7c9885)
**CSS Variables**: Used for dynamic theming

## Error Handling

### Component Loading Errors
- Fallback to default component rendering
- Error boundaries for component crashes
- Console logging for debugging

### Import Errors
- Validation of imported component code
- Sanitization of external content
- User feedback for failed imports

### State Persistence Errors
- localStorage availability checks
- Fallback to in-memory storage
- Data corruption recovery

## Future Enhancements

### Planned Features
1. Component versioning system
2. Component property panels
3. Advanced layout tools (grids, flexbox)
4. Component templates and presets
5. Export to various frameworks

### Architecture Improvements
1. Plugin system for custom components
2. Real-time collaboration features
3. Advanced state management (Redux/Zustand)
4. Component testing framework integration

# Visual Canvas Tool - Complete Architecture Documentation

## Overview

The Visual Canvas Tool is a React-based visual component editor that allows users to create, edit, and manage UI components on a canvas. It features drag-and-drop functionality, component libraries, import systems, real-time preview capabilities, and advanced text editing.

## Recent Updates (Latest Session)

### Right-Click Text Editing System

- **Context Menu Enhancement**: Dynamic text editing options based on component properties
- **Inline Text Editor**: Real-time text editing with keyboard shortcuts (Enter/Escape)
- **Component Data Integration**: Fixed component creation to include proper default data from component library
- **Smart Property Detection**: Automatic detection of editable text properties per component type
- **Click Outside Handling**: Proper event management for closing editors

### Performance & UX Improvements

- **Ctrl+Drag Override**: Viewport panning takes priority over component selection when Ctrl is held
- **Smooth Component Dragging**: Local state management for lag-free component movement
- **Menu System Fixes**: Fixed positioning and color consistency between left and right sidebars
- **Component Library Integration**: Proper use of getDefaultData() and getDefaultSize() functions

### Bug Fixes

- **White Screen Issue**: Fixed critical TypeScript compilation errors and import issues
  - Fixed malformed ResizeHandle union type in types/index.ts
  - Updated component library imports to use `import type` for type-only imports
  - Fixed Input component style conflicts (width/height overwriting)
  - Added missing `onComponentAdd` prop and handler for component import functionality
  - Fixed missing `name` property in imported components
- **Component Creation**: Components now properly include data and size properties from component library
- **Text Property Detection**: Improved logic for detecting editable text properties in components
- **TypeScript Compliance**: Fixed numerous type import issues for better build stability

## Core Architecture

### Main Application Structure

```
brainstorm-structure/tools/visual-canvas-tool/
├── src/
│   ├── components/           # Core UI components
│   │   ├── VisualCanvas.tsx  # Main canvas component
│   │   ├── LayerPanel.tsx    # Component layer management
│   │   └── Switch.tsx        # Toggle switch component
│   ├── component-library/    # Component definitions
│   │   ├── basic/           # Basic components (Button, Input)
│   │   ├── index.ts         # Component registry
│   │   └── types.ts         # Type definitions
│   ├── component-backend/    # Component interaction handlers
│   ├── services/            # Data services and utilities
│   │   ├── dataService.ts   # localStorage-based persistence
│   │   └── ProjectService.ts # Project management
│   └── styles/              # Styling and themes
├── package.json             # Dependencies and scripts
└── vite.config.ts          # Build configuration
```

### Key Components

#### 1. VisualCanvas.tsx (Main Canvas)

**Location**: `src/components/VisualCanvas.tsx`
**Purpose**: Primary canvas component for visual editing
**Key Features**:

- Viewport management with pan/zoom
- Component rendering and positioning
- Drag-and-drop functionality with optimized performance
- Design/Preview mode switching
- Context menus and component interaction
- Modal dialogs (Help, Import)

**State Management**:

- `viewport`: Canvas position and scale
- `canvasMode`: 'design' | 'preview'
- `dragState`: Component and viewport dragging
- `localComponentPositions`: Optimized drag positions
- `contextMenu`: Right-click menu state
- Modal states: `showHelpModal`, `showImportModal`

**Performance Optimizations**:

- Viewport culling (only renders visible components)
- Local state for smooth dragging (prevents re-renders)
- Disabled CSS transitions during drag operations

#### 2. Component Library System

**Location**: `src/component-library/`
**Purpose**: Manages available components and their definitions

**Structure**:

- `types.ts`: Core interfaces (ComponentDefinition, ComponentLibrary)
- `index.ts`: Component registry and categorization
- `basic/`: Basic component implementations (Button, Input)

**Component Definition Interface**:

```typescript
interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  defaultSize: { width: number; height: number };
  defaultData: any;
  render: (props: any) => JSX.Element;
}
```

#### 3. Data Persistence

**Location**: `src/services/dataService.ts`
**Storage Method**: localStorage (not database)
**Data Stored**:

- Projects and their canvas states
- Component configurations
- User settings and preferences
- Canvas zoom levels and viewport states

### Component Interaction System

#### Drag and Drop Implementation

**Optimized Performance Approach**:

1. **Mouse Down**: Initialize local position state
2. **Mouse Move**: Update only local positions (no parent re-renders)
3. **Mouse Up**: Commit final position to component data

**Key Functions**:

- `handleComponentMouseDown`: Start component drag
- `handleMouseMove`: Update positions during drag
- `handleMouseUp`: Commit final positions

#### Canvas Modes

1. **Design Mode**:

   - Components are selectable and draggable
   - Shows selection borders and resize handles
   - Context menus available
   - Components don't respond to interactions

2. **Preview Mode**:
   - Components are interactive
   - No selection or dragging
   - Full component functionality enabled

### Menu and UI Systems

#### Context Menus

**Implementation**: Fixed positioned div with click-outside detection
**Features**: Component deletion, reordering options
**Styling**: Sage green theme with hover effects

#### Modal Dialogs

1. **Help Modal**: Component development guide
2. **Import Modal**: Component import from external sources

#### Zoom System

**Implementation**: Dropdown with slider and preset values
**Range**: 10% to 500% zoom
**Persistence**: Saved to localStorage

### Component Import System

**Location**: `src/services/ComponentImporter.ts`
**Purpose**: Import components from external websites (uiverse.io, etc.)
**Process**:

1. Parse URL and extract component code
2. Generate component definition
3. Add to component library
4. Save to localStorage

### Styling and Theming

**Primary Color**: Sage Green (#7c9885)
**CSS Variables**: Used throughout for consistent theming
**Responsive Design**: Adapts to different screen sizes
**Component Styling**: Scoped CSS with unique IDs

## Current Issues and Limitations

### Known Menu Issues

1. Context menu positioning may need adjustment
2. Zoom dropdown click-outside detection conflicts
3. Modal overlay z-index management

### Performance Considerations

1. Large numbers of components may impact rendering
2. Viewport culling helps but could be optimized further
3. Component import parsing could be more robust

## Integration Points

### Database Integration (For AI Context)

- Component definitions and usage patterns
- Import history and source tracking
- Canvas state snapshots for analysis
- User interaction patterns

### Future Enhancements

1. Component versioning system
2. Collaborative editing features
3. Advanced component properties panel
4. Export to various formats (React, Vue, etc.)

## Development Workflow

### Adding New Components

1. Create component file in `src/component-library/basic/`
2. Define ComponentDefinition with proper interface
3. Register in `src/component-library/index.ts`
4. Add backend handler if interactive features needed

### Testing Components

1. Add component to canvas in Design Mode
2. Test dragging and positioning
3. Switch to Preview Mode for interaction testing
4. Verify persistence across page reloads

### Debugging

- Console logs for component interactions
- React DevTools for state inspection
- Network tab for import functionality
- Performance tab for drag optimization

## File Dependencies

### Critical Files

- `VisualCanvas.tsx`: Core functionality
- `component-library/index.ts`: Component registry
- `dataService.ts`: Data persistence
- `App.tsx`: Main application wrapper

### Configuration Files

- `package.json`: Dependencies (React 19, TypeScript, Vite)
- `vite.config.ts`: Build and dev server config
- `tsconfig.json`: TypeScript configuration

### Styling Files

- `App.css`: Global styles and layout
- `VisualCanvas.css`: Canvas-specific styles
- CSS variables for theming consistency

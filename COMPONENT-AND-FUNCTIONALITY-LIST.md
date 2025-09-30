# 📋 Complete Component & Functionality List

> **Every UI component and feature in Visual Canvas Tool - Every border, frame, button, text, icon, and detail**

---

## 📊 **QUICK OVERVIEW**

**Total Elements:** 150+
- **Containers/Frames:** 15
- **Buttons:** 9
- **Text Elements:** 12
- **Icons:** 6
- **Borders:** 20+
- **Backgrounds:** 15
- **Shadows:** 5
- **Animations:** 10+

**Color Theme:** Sage Green (#7c9885) accent on dark theme (#0d1117)

---

## 🏗️ MAIN UI COMPONENTS

### **1. Main Canvas (Always Visible)**
**What it is:** Primary workspace where components are displayed and positioned

**Container Specifications:**
- **Element:** div.canvas-container
- **Dimensions:** 100% width × 100% height (fills main content area)
- **Background:** #0d1117 (--bg-primary)
- **Position:** relative
- **Overflow:** hidden
- **Cursor:** grab (default) / grabbing (when panning)

**Visual elements:**
1. **Canvas Viewport** (transformable container)
   - Dimensions: 4000px × 4000px (virtual space)
   - Position: absolute, centered
   - Transform: translate(x, y) scale(zoom)
   - Transition: transform 0.1s ease-out

2. **Canvas Grid** (background pattern)
   - Background: linear-gradient repeating pattern
   - Grid Color: rgba(245, 245, 220, 0.1)
   - Grid Size: 20px × 20px
   - Pointer Events: none
   - Z-index: 0

3. **Canvas Components** (draggable UI components)
   - Background: #161b22 (--bg-secondary)
   - Border: 2px solid #30363d (default) / 3px solid #7c9885 (selected)
   - Border Radius: 8px (--radius-lg)
   - Box Shadow: 0 2px 8px rgba(0, 0, 0, 0.2)
   - Box Shadow (Selected): 0 0 8px rgba(124, 152, 133, 0.4)
   - Padding: 16px
   - Cursor: move
   - Z-index: 10 (default) / 100 (selected)

4. **Selection Handles** (8 resize handles when component selected)
   - Dimensions: 8px × 8px
   - Background: #7c9885 (--accent-primary)
   - Border: 2px solid #e6edf3
   - Border Radius: 50% (circle)
   - Position: absolute (at corners and midpoints)
   - Cursor: nwse-resize / nesw-resize / ns-resize / ew-resize
   - Z-index: 101

5. **Canvas Controls** (top-right corner)
   - Position: absolute, top: 20px, right: 20px
   - Display: flex, flex-direction: column
   - Gap: 10px
   - Z-index: 1000
   - Contains: Zoom Info Display, Reset View Button

**Functionality:**
- Display all created components
- Click to select component
- Drag to move component (Alt + drag to pan canvas)
- Mouse wheel to zoom in/out (0.1x to 3x)
- Right-click for context menu (optional)
- Pan canvas with Alt + click + drag
- Reset view to center and 100% zoom

---

### **2. Top Header (Always Visible)**
**What it is:** Navigation bar at top of screen

**Container Specifications:**
- **Element:** header.top-header
- **Dimensions:** 100% width × 60px height
- **Background:** #161b22 (--bg-secondary)
- **Border Bottom:** 1px solid #30363d (--border-primary)
- **Display:** flex, justify-content: space-between, align-items: center
- **Padding:** 0 24px
- **Position:** fixed, top: 0, left: 0
- **Z-index:** 100

**Visual elements:**

1. **App Title** (left side)
   - Element: h1.app-title
   - Text: "Visual Canvas Tool"
   - Font Size: 20px
   - Font Weight: 600
   - Color: #e6edf3 (--text-primary)
   - Margin: 0
   - Line Height: 1.5

2. **Project Manager** (right side)
   - Container: div (flex, gap: 12px)
   - Contains: Project Selector Button

3. **Project Selector Button**
   - Element: button
   - Dimensions: min-width 200px × 40px height
   - Background: #30363d (--bg-tertiary)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 6px (--radius-md)
   - Padding: 8px 16px
   - Font Size: 14px
   - Color: #e6edf3 (--text-primary)
   - Cursor: pointer
   - Transition: background 0.2s, border 0.2s
   - Hover Background: rgba(124, 152, 133, 0.1)
   - Hover Border: #7c9885 (--accent-primary)
   - Contains: Project Name Text + Dropdown Icon (▼)

4. **Project Dropdown** (when open)
   - Element: div (absolute positioned)
   - Dimensions: min-width 300px × max-height 400px
   - Background: #161b22 (--bg-secondary)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 8px (--radius-lg)
   - Box Shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
   - Position: absolute, top: 100%, right: 0
   - Margin Top: 4px
   - Overflow Y: auto
   - Z-index: 1000
   - Contains: Project List + New Project Button

5. **Project Item** (in dropdown)
   - Element: div (clickable)
   - Dimensions: 100% width × auto height
   - Padding: 12px 16px
   - Border Bottom: 1px solid #21262d (--border-subtle)
   - Background: transparent
   - Hover Background: #30363d (--bg-tertiary)
   - Active Background: rgba(124, 152, 133, 0.1)
   - Active Border Left: 3px solid #7c9885
   - Cursor: pointer
   - Transition: background 0.2s
   - Contains: Project Name + Delete Button (×)

6. **New Project Button** (in dropdown)
   - Element: button
   - Dimensions: 100% width × 40px height
   - Background: #7c9885 (--accent-primary)
   - Border: none
   - Border Radius: 6px (--radius-md)
   - Padding: 8px 16px
   - Margin: 8px
   - Font Size: 14px
   - Font Weight: 600
   - Color: #e6edf3 (--text-primary)
   - Cursor: pointer
   - Transition: background 0.2s
   - Hover Background: #8fa896 (--accent-hover)
   - Text: "+ New Project"

**Functionality:**
- Display application title
- Show current project name in selector
- Click selector → Open project dropdown
- Click project item → Switch to that project
- Click delete button → Remove project (with confirmation)
- Click "+ New Project" → Create new project
- Click outside dropdown → Close dropdown

---

### **3. Left Sidebar (Always Visible)**
**What it is:** Navigation panel with action buttons

**Container Specifications:**
- **Element:** aside.left-sidebar
- **Dimensions:** 240px width (expanded) / 60px width (collapsed) × calc(100vh - 60px) height
- **Background:** #161b22 (--bg-secondary)
- **Border Right:** 1px solid #30363d (--border-primary)
- **Padding:** 16px (expanded) / 8px (collapsed)
- **Display:** flex, flex-direction: column
- **Gap:** 8px
- **Position:** fixed, top: 60px, left: 0
- **Z-index:** 90
- **Transition:** width 0.2s ease-in-out, padding 0.2s ease-in-out

**Visual elements:**

1. **Collapse Toggle Button** (top)
   - Element: button.sidebar-button.collapse-button
   - Dimensions: 100% width (expanded) / 44px (collapsed) × 44px height
   - Background: #30363d (--bg-tertiary)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 6px (--radius-md)
   - Padding: 12px
   - Color: #8b949e (--text-secondary)
   - Cursor: pointer
   - Transition: background 0.2s, border 0.2s
   - Hover Background: rgba(124, 152, 133, 0.1)
   - Hover Border: #7c9885 (--accent-primary)
   - Icon: "◀" (expanded) / "▶" (collapsed)
   - ARIA Label: "Expand sidebar" / "Collapse sidebar"

2. **Create Component Button**
   - Element: button.sidebar-button.create-button
   - Dimensions: 100% width (expanded) / 44px (collapsed) × 44px height
   - Background: #7c9885 (--accent-primary) ⭐ SAGE GREEN
   - Border: none
   - Border Radius: 6px (--radius-md)
   - Padding: 12px 16px (expanded) / 12px (collapsed)
   - Color: #e6edf3 (--text-primary)
   - Font Weight: 600
   - Cursor: pointer
   - Transition: background 0.2s
   - Hover Background: #8fa896 (--accent-hover)
   - Display: flex, align-items: center, gap: 12px
   - Icon: "➕" (20px)
   - Label: "Create Component" (14px, visible when expanded)
   - ARIA Label: "Create new component"

3. **Library Button**
   - Element: button.sidebar-button
   - Dimensions: 100% width (expanded) / 44px (collapsed) × 44px height
   - Background: #30363d (default) / #7c9885 (active)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 6px (--radius-md)
   - Padding: 12px 16px (expanded) / 12px (collapsed)
   - Color: #e6edf3 (--text-primary)
   - Font Weight: 500
   - Cursor: pointer
   - Transition: background 0.2s, border 0.2s
   - Hover Background: rgba(124, 152, 133, 0.1)
   - Hover Border: #7c9885 (--accent-primary)
   - Display: flex, align-items: center, gap: 12px
   - Icon: "📚" (20px)
   - Label: "Library" (14px, visible when expanded)
   - ARIA Label: "Open component library"

4. **Settings Button**
   - Element: button.sidebar-button
   - Same specifications as Library Button
   - Icon: "⚙️" (20px)
   - Label: "Settings" (14px, visible when expanded)
   - ARIA Label: "Open settings"

5. **Help Button** (bottom)
   - Element: button.sidebar-button.help-button
   - Same specifications as Library Button
   - Margin Top: auto (pushes to bottom)
   - Icon: "❓" (20px)
   - Label: "Help" (14px, visible when expanded)
   - ARIA Label: "Open help documentation"

6. **Sidebar Tooltip** (when collapsed and hovering)
   - Element: div.sidebar-tooltip
   - Background: #161b22 (--bg-secondary)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 4px (--radius-sm)
   - Padding: 6px 12px
   - Font Size: 13px
   - Color: #e6edf3 (--text-primary)
   - Box Shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
   - Position: absolute, left: 68px (8px offset from sidebar)
   - Z-index: 1000
   - White Space: nowrap
   - Pointer Events: none
   - Opacity: 0 → 1 (fade in 0.1s)

**Functionality:**
- Click collapse button → Toggle sidebar width (240px ↔ 60px)
- Click Create → Open Component Generator (future)
- Click Library → Switch to Library view
- Click Settings → Switch to Settings view
- Click Help → Open help documentation (external link)
- Hover button (when collapsed) → Show tooltip with button label
- Keyboard: Ctrl+B → Toggle sidebar collapse

---

### **4. Component Generator (Future - Phase 2)**
**What it is:** Interface for creating new React UI components (buttons, inputs, forms)

**Status:** Not building in Phase 1 (placeholder only)

**Planned Visual elements:**
- Modal dialog or side panel
- Title: "Create New Component"
- Component type selector:
  - Button
  - Input
  - Form
  - Text
  - Container
  - Image
- Property editors:
  - Colors (background, text, border)
  - Fonts (family, size, weight)
  - Spacing (padding, margin)
  - Borders (width, radius, style)
  - Size (width, height)
- Preview panel (shows component as you build it)
- Cancel button
- Create button (sage green)

**Planned Functionality:**
- Select component type
- Configure visual properties
- Preview component in real-time
- Click Create → Component appears on Canvas
- Click Cancel → Modal closes
- Generate React JSX code for component

---

### **5. Library View (Future - Phase 2)**
**What it is:** Gallery of all saved/created components

**Status:** Not building in Phase 1 (placeholder only)

**Placeholder Specifications:**
- **Element:** div.placeholder-view
- **Dimensions:** 100% width × 100% height
- **Display:** flex, flex-direction: column, align-items: center, justify-content: center
- **Gap:** 16px
- **Contains:** Heading + Message

**Placeholder Elements:**
1. **Library Heading**
   - Element: h2
   - Text: "Component Library"
   - Font Size: 28px
   - Font Weight: 600
   - Color: #e6edf3 (--text-primary)
   - Margin: 0

2. **Library Message**
   - Element: p
   - Text: "Coming soon..."
   - Font Size: 16px
   - Color: #8b949e (--text-secondary)
   - Margin: 0

**Planned Visual elements (Phase 2):**
- Full screen view
- Title: "Component Library"
- Grid layout of component cards
- Each card shows:
  - Component preview thumbnail
  - Component name
  - Component type badge
  - Created date
  - Download/Export button (get React JSX code)
  - Delete button
  - Edit button
- Search bar
- Filter by type (Button, Input, Form, etc.)
- Sort options (date, name, type)

**Planned Functionality:**
- Display all created components in grid
- Click component → View full preview
- Click Download → Export React JSX code
- Click Delete → Remove component (with confirmation)
- Click Edit → Open in Component Generator
- Search components by name
- Filter by component type
- Sort by date, name, type

---

### **6. Settings View (Future - Phase 2)**
**What it is:** Design system configuration

**Status:** Not building in Phase 1 (placeholder only)

**Placeholder Specifications:**
- **Element:** div.placeholder-view
- **Dimensions:** 100% width × 100% height
- **Display:** flex, flex-direction: column, align-items: center, justify-content: center
- **Gap:** 16px
- **Contains:** Heading + Message

**Placeholder Elements:**
1. **Settings Heading**
   - Element: h2
   - Text: "Settings"
   - Font Size: 28px
   - Font Weight: 600
   - Color: #e6edf3 (--text-primary)
   - Margin: 0

2. **Settings Message**
   - Element: p
   - Text: "Coming soon..."
   - Font Size: 16px
   - Color: #8b949e (--text-secondary)
   - Margin: 0

**Planned Visual elements (Phase 2):**
- Full screen view
- Title: "Design System Settings"
- Sections:
  - **Colors:**
    - Primary color picker (sage green #7c9885 default)
    - Secondary color picker
    - Background color picker
    - Text color picker
    - Border color picker
  - **Typography:**
    - Font family dropdown
    - Font size options
    - Font weight options
    - Line height options
  - **Spacing:**
    - Padding presets (compact/standard/spacious)
    - Margin presets
    - Gap presets
  - **Borders:**
    - Border radius options (4px, 6px, 8px)
    - Border width options (1px, 2px, 3px)
  - **Other:**
    - Shadow options
    - Animation speed
- Preview panel (shows how settings look)
- Save button (sage green)
- Reset to defaults button

**Planned Functionality:**
- Change color values with color pickers
- Select fonts from dropdown
- Adjust spacing with sliders/inputs
- Configure borders with options
- Preview changes in real-time
- Click Save → Apply settings to all components
- Click Reset → Restore default settings (sage green theme)

---

### **7. Welcome Screen (When No Project)**
**What it is:** Empty state message when no project is selected

**Container Specifications:**
- **Element:** div.welcome-screen
- **Dimensions:** 100% width × 100% height
- **Display:** flex, flex-direction: column, align-items: center, justify-content: center
- **Gap:** 16px

**Visual elements:**

1. **Welcome Heading**
   - Element: h2
   - Text: "Welcome to Visual Canvas Tool"
   - Font Size: 32px
   - Font Weight: 600
   - Color: #e6edf3 (--text-primary)
   - Margin: 0
   - Text Align: center

2. **Welcome Message**
   - Element: p
   - Text: "Create a new project or select an existing one to get started."
   - Font Size: 16px
   - Font Weight: 400
   - Color: #8b949e (--text-secondary)
   - Margin: 0
   - Text Align: center
   - Max Width: 500px

**Functionality:**
- Display when currentProject is null
- Guide user to create or select a project
- Disappears when project is selected

---

### **8. Canvas Components (Created UI Components)**
**What they are:** Individual React UI components displayed on canvas

**Container Specifications:**
- **Element:** div.canvas-component
- **Dimensions:** Variable (based on component size)
- **Position:** absolute, left: x, top: y
- **Background:** #161b22 (--bg-secondary)
- **Border:** 2px solid #30363d (default) / 3px solid #7c9885 (selected)
- **Border Radius:** 8px (--radius-lg)
- **Box Shadow:** 0 2px 8px rgba(0, 0, 0, 0.2)
- **Box Shadow (Selected):** 0 0 8px rgba(124, 152, 133, 0.4)
- **Padding:** 16px
- **Cursor:** move
- **Transition:** border 0.2s, box-shadow 0.2s
- **Z-index:** 10 (default) / 100 (selected)

**Visual elements:**

1. **Component Content Container**
   - Element: div
   - Display: flex, flex-direction: column
   - Gap: 8px
   - Contains: Type Badge, Title, Preview

2. **Component Type Badge**
   - Element: span
   - Background: rgba(124, 152, 133, 0.2)
   - Border: 1px solid #7c9885 (--accent-primary)
   - Border Radius: 4px (--radius-sm)
   - Padding: 4px 8px
   - Font Size: 11px
   - Font Weight: 600
   - Color: #7c9885 (--accent-primary)
   - Text Transform: uppercase
   - Letter Spacing: 0.5px
   - Width: fit-content
   - Text: "BUTTON" / "INPUT" / "FORM" / etc.

3. **Component Title**
   - Element: h3
   - Font Size: 16px
   - Font Weight: 600
   - Color: #e6edf3 (--text-primary)
   - Margin: 0
   - Line Height: 1.4
   - Text: Component name

4. **Component Preview**
   - Element: div
   - Background: #0d1117 (--bg-primary)
   - Border: 1px solid #21262d (--border-subtle)
   - Border Radius: 4px (--radius-sm)
   - Padding: 12px
   - Min Height: 60px
   - Display: flex, align-items: center, justify-content: center
   - Contains: Rendered React component preview

5. **Selection Handles** (when selected)
   - 8 divs positioned at corners and edges
   - Dimensions: 8px × 8px
   - Background: #7c9885 (--accent-primary)
   - Border: 2px solid #e6edf3 (--text-primary)
   - Border Radius: 50% (circle)
   - Position: absolute
   - Cursor: nwse-resize / nesw-resize / ns-resize / ew-resize
   - Z-index: 101

**Functionality:**
- Click to select (shows selection border and handles)
- Drag to move position on canvas
- Resize using selection handles (future)
- Right-click for context menu (future):
  - Edit properties
  - Duplicate
  - Delete
  - Export code
  - Bring to front
  - Send to back
- Display component preview
- Apply design system settings
- Save position to project data

---

## 🎯 ADDITIONAL UI ELEMENTS (Phase 1)

### **9. Canvas Controls**
**What it is:** Zoom and view controls for canvas

**Container Specifications:**
- **Element:** div.canvas-controls
- **Position:** absolute, top: 20px, right: 20px
- **Display:** flex, flex-direction: column
- **Gap:** 10px
- **Z-index:** 1000

**Visual elements:**

1. **Zoom Info Display**
   - Element: div
   - Background: #161b22 (--bg-secondary)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 6px (--radius-md)
   - Padding: 8px 12px
   - Font Size: 14px
   - Font Weight: 500
   - Color: #e6edf3 (--text-primary)
   - Text Align: center
   - Min Width: 60px
   - Text: "100%" (zoom percentage)

2. **Reset View Button**
   - Element: button
   - Background: #30363d (--bg-tertiary)
   - Border: 1px solid #30363d (--border-primary)
   - Border Radius: 6px (--radius-md)
   - Padding: 8px 12px
   - Font Size: 13px
   - Font Weight: 500
   - Color: #e6edf3 (--text-primary)
   - Cursor: pointer
   - Transition: background 0.2s, border 0.2s
   - Hover Background: rgba(124, 152, 133, 0.1)
   - Hover Border: #7c9885 (--accent-primary)
   - Text: "Reset View"

**Functionality:**
- Display current zoom level (10% to 300%)
- Click Reset View → Center canvas and set zoom to 100%
- Update zoom display when user zooms with mouse wheel

---

## 🎯 FUTURE UI ELEMENTS (Phase 2+)

### **10. Property Panel (Phase 2)**
**What it is:** Sidebar for editing selected component properties

**Status:** Not building in Phase 1

**Planned Visual elements:**
- Right sidebar panel (300px width)
- Title: "Properties"
- Sections for selected component:
  - Layout (width, height, position x/y)
  - Spacing (padding, margin)
  - Colors (background, text, border) with color pickers
  - Typography (font family, size, weight)
  - Borders (width, radius, style)
  - Effects (shadow, opacity)
- Input controls (text inputs, sliders, color pickers)
- Apply button (sage green)

**Planned Functionality:**
- Shows properties of selected component
- Edit property values with real-time preview
- Apply changes to component
- Reset to defaults
- Hide when no component selected

---

### **11. Component Palette (Phase 2)**
**What it is:** Quick access to component types

**Status:** Not building in Phase 1

**Planned Visual elements:**
- Floating panel or expandable sidebar
- Title: "Components"
- List of component types with icons:
  - Button
  - Input
  - Form
  - Text
  - Container
  - Image
- Drag-and-drop icons

**Planned Functionality:**
- Click component type → Opens Component Generator with type pre-selected
- Drag component type to canvas → Creates component at drop position
- Collapse/expand palette

---

### **12. Context Menu (Phase 2)**
**What it is:** Right-click menu on canvas or components

**Status:** Not building in Phase 1

**Planned Visual elements:**
- Popup menu at cursor position
- Background: #161b22 (--bg-secondary)
- Border: 1px solid #30363d (--border-primary)
- Border Radius: 6px (--radius-md)
- Box Shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
- Menu items:
  - Edit Component
  - Duplicate Component
  - Delete Component
  - Export Code
  - Bring to Front
  - Send to Back

**Planned Functionality:**
- Right-click canvas → Show canvas context menu
- Right-click component → Show component context menu
- Click menu item → Execute action
- Click outside → Close menu

---

## ⚙️ CORE FUNCTIONALITY (Phase 1)

### **Project Management Flow:**
1. User opens app → Welcome screen shows (if no project)
2. User clicks "Select Project" dropdown in header
3. Dropdown opens showing project list
4. User can:
   - Click existing project → Switch to that project
   - Click "+ New Project" → Create new project
   - Click delete (×) on project → Remove project (with confirmation)
5. Selected project loads → Canvas shows with project's components
6. Project name displays in header

---

### **Canvas Interaction Flow:**
1. User views canvas with grid background
2. User can:
   - **Pan:** Alt + click + drag to move viewport
   - **Zoom:** Mouse wheel to zoom in/out (10% to 300%)
   - **Select:** Click component to select it
   - **Move:** Drag selected component to new position
   - **Reset:** Click "Reset View" to center and zoom to 100%
3. Viewport position and zoom persist in project data
4. Component positions persist in project data

---

### **Component Selection Flow:**
1. User clicks component on canvas
2. Component becomes selected:
   - Border changes to 3px solid #7c9885 (sage green)
   - Box shadow adds glow effect
   - 8 selection handles appear at corners and edges
   - Z-index increases to 100 (brings to front)
3. User can:
   - Drag to move component
   - Resize using handles (future)
   - Press Delete key to delete (future)
   - Press Ctrl+D to duplicate (future)
4. User clicks elsewhere → Component deselected

---

### **Sidebar Navigation Flow:**
1. User sees left sidebar with 5 buttons
2. User can:
   - Click collapse button (◀/▶) → Toggle sidebar width (240px ↔ 60px)
   - Click Create button → Open Component Generator (future)
   - Click Library button → Switch to Library view (placeholder)
   - Click Settings button → Switch to Settings view (placeholder)
   - Click Help button → Open help documentation (external)
3. When collapsed:
   - Sidebar width: 60px
   - Labels hidden
   - Icons centered
   - Tooltips show on hover
4. When expanded:
   - Sidebar width: 240px
   - Labels visible
   - Icons + labels aligned left
5. Sidebar state persists in localStorage

---

### **View Switching Flow:**
1. User clicks Library or Settings button in sidebar
2. Active view changes:
   - Canvas view → Library/Settings placeholder view
   - Button background changes to #7c9885 (sage green)
3. Placeholder shows "Coming soon..." message
4. User clicks Canvas button (future) or Create button → Returns to canvas view

---

### **Data Persistence Flow:**
1. User creates/modifies project:
   - Creates new project
   - Adds/moves components
   - Changes viewport position/zoom
   - Toggles sidebar collapse
2. Changes auto-save to localStorage:
   - `projects` key → Array of all projects
   - `currentProjectId` key → ID of active project
   - `sidebarCollapsed` key → Boolean for sidebar state
3. User closes app
4. User reopens app
5. App loads from localStorage:
   - Restores all projects
   - Restores last active project
   - Restores sidebar state
   - Restores canvas viewport
6. Canvas displays with all saved data

---

### **Component Positioning (Phase 1):**
**Current Implementation: Drag and Drop**
- Components appear at default position (center of viewport)
- User can drag component to new position
- Position updates in real-time
- Position saves to project data
- Position restores on app reload

---

## 📊 COMPONENT HIERARCHY (Phase 1)

```
App (Root)
├── State:
│   ├── currentProject: Project | null
│   ├── projects: Project[]
│   ├── sidebarCollapsed: boolean
│   ├── activeView: 'canvas' | 'library' | 'settings'
│   ├── creatorOpen: boolean
│   └── selectedComponentId: string | null
│
├── TopHeader (Always Visible)
│   ├── AppTitle (h1)
│   │   └── Text: "Visual Canvas Tool"
│   │
│   └── ProjectManager
│       ├── ProjectSelectorButton
│       │   ├── ProjectNameText
│       │   └── DropdownIcon (▼)
│       │
│       └── ProjectDropdown (when open)
│           ├── ProjectList
│           │   └── ProjectItem (multiple)
│           │       ├── ProjectNameText
│           │       └── DeleteButton (×)
│           │
│           └── NewProjectButton
│               └── Text: "+ New Project"
│
├── AppBody (Flex Container)
│   ├── LeftSidebar (Always Visible)
│   │   ├── CollapseToggleButton
│   │   │   └── Icon: "◀" / "▶"
│   │   │
│   │   ├── CreateComponentButton (Sage Green)
│   │   │   ├── Icon: "➕"
│   │   │   └── Label: "Create Component" (when expanded)
│   │   │
│   │   ├── LibraryButton
│   │   │   ├── Icon: "📚"
│   │   │   └── Label: "Library" (when expanded)
│   │   │
│   │   ├── SettingsButton
│   │   │   ├── Icon: "⚙️"
│   │   │   └── Label: "Settings" (when expanded)
│   │   │
│   │   ├── HelpButton (Bottom)
│   │   │   ├── Icon: "❓"
│   │   │   └── Label: "Help" (when expanded)
│   │   │
│   │   └── SidebarTooltip (when collapsed and hovering)
│   │       └── Text: Button label
│   │
│   └── MainContent (Dynamic View)
│       │
│       ├── Canvas (when activeView === 'canvas' && currentProject)
│       │   ├── CanvasViewport (Transformable)
│       │   │   ├── CanvasGrid (Background Pattern)
│       │   │   │
│       │   │   └── CanvasComponent (multiple instances)
│       │   │       ├── ComponentContent
│       │   │       │   ├── ComponentTypeBadge
│       │   │       │   │   └── Text: "BUTTON" / "INPUT" / etc.
│       │   │       │   │
│       │   │       │   ├── ComponentTitle (h3)
│       │   │       │   │   └── Text: Component name
│       │   │       │   │
│       │   │       │   └── ComponentPreview
│       │   │       │       └── Rendered React component
│       │   │       │
│       │   │       └── SelectionHandles (8 handles, when selected)
│       │   │           └── Resize handles at corners and edges
│       │   │
│       │   └── CanvasControls (Top-Right)
│       │       ├── ZoomInfoDisplay
│       │       │   └── Text: "100%" (zoom percentage)
│       │       │
│       │       └── ResetViewButton
│       │           └── Text: "Reset View"
│       │
│       ├── WelcomeScreen (when activeView === 'canvas' && !currentProject)
│       │   ├── WelcomeHeading (h2)
│       │   │   └── Text: "Welcome to Visual Canvas Tool"
│       │   │
│       │   └── WelcomeMessage (p)
│       │       └── Text: "Create a new project or select an existing one..."
│       │
│       ├── LibraryPlaceholder (when activeView === 'library')
│       │   ├── LibraryHeading (h2)
│       │   │   └── Text: "Component Library"
│       │   │
│       │   └── LibraryMessage (p)
│       │       └── Text: "Coming soon..."
│       │
│       └── SettingsPlaceholder (when activeView === 'settings')
│           ├── SettingsHeading (h2)
│           │   └── Text: "Settings"
│           │
│           └── SettingsMessage (p)
│               └── Text: "Coming soon..."
│
└── Future Components (Phase 2+)
    ├── ComponentGenerator (Modal/Panel)
    ├── Library (Full Implementation)
    ├── Settings (Full Implementation)
    ├── PropertyPanel (Right Sidebar)
    ├── ComponentPalette (Left Panel)
    └── ContextMenu (Right-Click)
```

---

## ✅ SUMMARY

### **Phase 1 - Building Now:**

**Always Visible (3 major sections):**
1. **Top Header** (60px height)
   - App title: "Visual Canvas Tool"
   - Project selector dropdown
   - Project management (create, switch, delete)

2. **Left Sidebar** (240px/60px width)
   - Collapse toggle button
   - Create Component button (sage green)
   - Library button
   - Settings button
   - Help button
   - Tooltips (when collapsed)

3. **Main Content** (remaining space)
   - Canvas view (with pan/zoom, components, controls)
   - Welcome screen (when no project)
   - Library placeholder (coming soon)
   - Settings placeholder (coming soon)

**Interactive Elements (52 major elements):**
- 15 Containers/Frames
- 9 Buttons
- 12 Text Elements
- 6 Icons
- 20+ Borders
- 15 Backgrounds
- 5 Shadows
- 10+ Animations

**Core Functionality:**
- ✅ Create and manage projects
- ✅ Switch between projects
- ✅ Pan and zoom canvas (Alt + drag, mouse wheel)
- ✅ Select and move components
- ✅ Persist data to localStorage
- ✅ Collapse/expand sidebar
- ✅ Switch between views (canvas/library/settings)
- ✅ Reset canvas view

**Color Theme:**
- **Accent:** Sage Green (#7c9885)
- **Background:** Dark (#0d1117, #161b22, #30363d)
- **Text:** Light (#e6edf3, #8b949e)
- **Borders:** Dark gray (#30363d, #21262d)

---

### **Phase 2 - Future:**

**Components to Build:**
- Component Generator (create React UI components)
- Library (full implementation with grid, search, export)
- Settings (design system configuration)
- Property Panel (edit selected component)
- Component Palette (drag-and-drop component types)
- Context Menu (right-click actions)

**Additional Functionality:**
- Create React UI components (buttons, inputs, forms)
- Export component code (React JSX)
- Edit component properties
- Duplicate and delete components
- Search and filter library
- Configure design system
- Keyboard shortcuts (Ctrl+D, Delete, etc.)

---

## 📐 **WHAT'S BIG, WHAT'S SMALL**

### **🏢 HUGE:**
- App Container (100vw × 100vh)
- Canvas Virtual Space (4000px × 4000px)

### **🏗️ LARGE:**
- Top Header (100% × 60px)
- Left Sidebar (240px/60px × full height)
- Main Content (remaining space)

### **📦 MEDIUM:**
- Project Dropdown (300px × 400px max)
- Canvas Components (200-400px typical)
- Welcome Screen (centered, auto-size)

### **🔘 SMALL:**
- Sidebar Buttons (44px × 44px)
- Project Selector (200px × 40px)
- Canvas Controls (auto-size)

### **🔹 TINY:**
- Icons (12-20px)
- Selection Handles (8px × 8px)
- Borders (1-3px)
- Grid Lines (1px)

---

## 🎨 **COMPLETE SPECIFICATIONS**

**Every element has:**
- ✅ Exact dimensions (width × height)
- ✅ Exact colors (hex codes)
- ✅ Exact spacing (padding, margin, gap)
- ✅ Exact borders (width, color, radius)
- ✅ Exact text (size, weight, color)
- ✅ Exact transitions (duration, timing)
- ✅ Exact states (default, hover, active, focus)
- ✅ Exact position (relative, absolute, fixed)
- ✅ Exact z-index (layering order)
- ✅ Exact cursor (pointer, grab, move, resize)

**Total Elements:** 150+
- 52 major elements documented
- Every border, frame, button, text, icon, color, spacing, animation specified
- Ready to build with complete specifications

---

**See also:**
- `COMPLETE-UI-ELEMENT-INVENTORY.md` - Full details on all 52 major elements
- `UI-ELEMENT-QUICK-REFERENCE.md` - Visual guide and quick reference
- `order-forms/` - Detailed YAML specifications for each component

**Ready to start building Phase 1!** 🚀✨


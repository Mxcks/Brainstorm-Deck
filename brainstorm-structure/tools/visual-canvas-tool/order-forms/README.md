# Visual Canvas Tool - UI Order Forms

> **Comprehensive UI component specifications for building the React UI Component Design Tool**

---

## 📋 **Overview**

This directory contains detailed YAML order forms for every UI component in the Visual Canvas Tool. Each order form provides complete specifications including:

- **Visual specifications** (colors, sizes, spacing, borders)
- **Functionality** (what it does, when, how)
- **State management** (what state it manages)
- **Props/parameters** (what data it receives)
- **Events/interactions** (click, hover, keyboard)
- **Integration points** (how it connects to other components)
- **Accessibility** (ARIA labels, keyboard navigation)
- **Implementation code structure** (TypeScript interfaces, component structure)

---

## 📁 **Order Forms**

### **Core UI Component Order Forms**

### **1. UI-MASTER-ORDER-FORM.yaml**
**Purpose:** Master UI layout and structure specification

**Contents:**
- Overall layout structure (grid layout with header + sidebar + canvas)
- Color scheme (sage green theme with dark background)
- Typography system
- Spacing and border radius tokens
- Component hierarchy
- Layout dimensions
- Global state management
- Data flow between components
- Responsive behavior
- Accessibility requirements
- Integration points
- Build order and implementation notes

**Key Specifications:**
- **Layout:** Grid with `"header header" / "sidebar canvas"`
- **Colors:** Sage green (#7c9885) accent, dark theme (#0d1117 background)
- **Header Height:** 60px
- **Sidebar Width:** 240px (expanded), 60px (collapsed)
- **Canvas:** Fills remaining space

---

### **2. UI-TOP-HEADER-ORDER-FORM.yaml**
**Purpose:** Top header with title and project selector

**Contents:**
- Visual specifications (60px height, dark background, sage green accents)
- Component structure (title + project selector)
- Props interface (currentProject, projects, callbacks)
- State management (no local state, all from parent)
- Functionality (display title, select/create/delete projects)
- Interactions (click, hover, keyboard)
- Child components (ProjectManager)
- Accessibility (ARIA labels, keyboard navigation)
- Responsive behavior (mobile/tablet/desktop)
- Integration with App and DataService
- Implementation code structure
- Testing requirements

**Key Specifications:**
- **Height:** 60px
- **Background:** var(--bg-secondary) #161b22
- **Border:** 1px solid var(--border-primary) #30363d
- **Layout:** Flexbox with space-between
- **Left:** Application title "Visual Canvas Tool"
- **Right:** ProjectManager dropdown

---

### **3. UI-LEFT-SIDEBAR-ORDER-FORM.yaml**
**Purpose:** Left sidebar navigation menu with collapsible functionality

**Contents:**
- Visual specifications (240px/60px width, dark background, sage green accents)
- Component structure (collapse toggle + navigation buttons)
- Button specifications (dimensions, styling, icons, labels)
- Props interface (collapsed, activeView, callbacks)
- State management (hoveredButton for tooltips)
- Functionality (collapse/expand, navigate views, create component)
- Interactions (click, hover, keyboard)
- Tooltip system (shown when collapsed)
- Accessibility (ARIA labels, keyboard shortcuts)
- Responsive behavior (mobile overlay, tablet/desktop fixed)
- Animation specifications (collapse/expand transitions)
- Integration with App and Canvas
- Implementation code structure

**Key Specifications:**
- **Width Expanded:** 240px
- **Width Collapsed:** 60px
- **Height:** calc(100vh - 60px)
- **Background:** var(--bg-secondary) #161b22
- **Border:** 1px solid var(--border-primary) #30363d
- **Buttons:**
  - Collapse Toggle (◀/▶)
  - Create Component (➕) - Sage green background
  - Library (📚)
  - Settings (⚙️)
  - Help (❓)
- **Transitions:** 0.2s ease-in-out for width changes

---

### **Detailed Specification Documents**

### **4. COMPONENT-HIERARCHY-DETAILED.yaml**
**Purpose:** Comprehensive component relationships, data flow, and communication patterns

**Contents:**
- Complete component tree (all components and their children)
- Data flow patterns (top-down props, callbacks, state lifting, derived state, event bubbling)
- Component communication patterns (sibling, parent-child, deep prop drilling)
- State update patterns (synchronous, asynchronous, batched, debounced)
- Component lifecycle interactions (mount, unmount, update sequences)
- Error boundaries and error handling
- Performance considerations (memoization, lazy loading, virtualization)

**Use Cases:**
- Understanding parent-child relationships
- Implementing data flow correctly
- Handling component communication
- Managing state updates
- Optimizing performance

---

### **5. STATE-MANAGEMENT-DETAILED.yaml**
**Purpose:** Comprehensive state structure, updates, persistence, and synchronization

**Contents:**
- Complete state structure (App-level state, Project state, Component state)
- State initialization (on mount, default values, validation)
- State update patterns (simple, complex, nested, optimistic)
- State persistence (localStorage, sessionStorage, future database)
- State synchronization (parent-child, multi-tab)
- State validation (on load, on update)
- State debugging (dev tools, snapshots)
- State migration (version management, migration strategies)

**Use Cases:**
- Understanding global state structure
- Implementing state updates correctly
- Persisting state to storage
- Synchronizing state across components
- Migrating state between versions

---

### **6. RESPONSIVE-BEHAVIOR-DETAILED.yaml**
**Purpose:** Comprehensive responsive design patterns and multi-device support

**Contents:**
- Breakpoint system (6 breakpoints from mobile to desktop large)
- Component responsive behavior (header, sidebar, canvas at each breakpoint)
- Touch vs mouse interactions (gestures, considerations, hybrid devices)
- Orientation changes (portrait to landscape, landscape to portrait)
- Use case scenarios (mobile user, tablet user, desktop user)

**Use Cases:**
- Implementing responsive layouts
- Supporting touch and mouse interactions
- Handling orientation changes
- Testing on different devices
- Progressive enhancement

---

### **7. ACCESSIBILITY-DETAILED.yaml**
**Purpose:** Comprehensive accessibility requirements and WCAG compliance

**Contents:**
- WCAG compliance levels (Level A and AA requirements)
- Keyboard navigation (global shortcuts, application shortcuts, canvas shortcuts, focus order)
- Screen reader support (ARIA labels, live regions, screen reader-only text)
- Visual accessibility (color contrast, focus indicators, reduced motion, font sizing)
- Motor disability support (large touch targets, click tolerance, drag alternatives)
- Cognitive accessibility (clear language, consistent design, error prevention, help)
- Use case scenarios (keyboard-only user, screen reader user, low vision user)

**Use Cases:**
- Implementing keyboard navigation
- Supporting screen readers
- Ensuring color contrast
- Supporting users with disabilities
- WCAG compliance testing

---

## 🎨 **Design System**

### **Color Palette**
```yaml
# Sage Green Theme (Dark Mode)
primary_accent: "#7c9885"      # Sage green
accent_hover: "#8fa896"        # Lighter sage green
accent_subtle: "rgba(124, 152, 133, 0.1)"

# Backgrounds
background_primary: "#0d1117"   # Darkest
background_secondary: "#161b22" # Medium dark
background_tertiary: "#30363d"  # Lightest dark

# Text
text_primary: "#e6edf3"        # Light
text_secondary: "#8b949e"      # Gray

# Borders
border_primary: "#30363d"
border_subtle: "#21262d"

# Canvas
canvas_color: "#f5f5dc"        # Beige
canvas_border: "rgba(245, 245, 220, 0.2)"
canvas_line: "rgba(245, 245, 220, 0.1)"
```

### **Typography**
```yaml
font_family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
font_size_xs: "12px"
font_size_sm: "14px"
font_size_base: "16px"
font_size_lg: "18px"
font_size_xl: "20px"
line_height: "1.5"
font_weight_normal: 400
font_weight_medium: 500
font_weight_semibold: 600
font_weight_bold: 700
```

### **Spacing**
```yaml
spacing_xs: "4px"
spacing_sm: "8px"
spacing_md: "16px"
spacing_lg: "24px"
spacing_xl: "32px"
```

### **Border Radius**
```yaml
radius_sm: "4px"
radius_md: "6px"
radius_lg: "8px"
```

### **Transitions**
```yaml
transition_base: "0.2s ease-in-out"
transition_fast: "0.1s ease-in-out"
transition_slow: "0.3s ease-in-out"
```

---

## 🏗️ **Component Hierarchy**

```
App (Root)
├── TopHeader
│   ├── Application Title (h1)
│   └── ProjectManager
│       ├── Project Selector Button
│       └── Project Dropdown
│           ├── Project List
│           │   └── Project Items
│           └── New Project Form
│
├── LeftSidebar
│   ├── Collapse Toggle Button
│   ├── Create Component Button
│   ├── Library Button
│   ├── Settings Button
│   └── Help Button
│
└── Canvas (Main Content Area)
    ├── Canvas Viewport
    │   ├── Canvas Grid
    │   └── Canvas Components
    └── Canvas Controls
        ├── Zoom Info
        └── Reset View Button
```

---

## 📊 **State Management**

### **Global State (App.tsx)**
```typescript
- currentProject: Project | null
- projects: Project[]
- sidebarCollapsed: boolean
- activeView: 'canvas' | 'library' | 'settings'
```

### **Data Flow**
```
DataService (localStorage)
    ↓
  App.tsx (global state)
    ↓
  ├── TopHeader (receives: currentProject, projects)
  ├── LeftSidebar (receives: collapsed, activeView)
  └── Canvas (receives: currentProject)
```

---

## 🎯 **Implementation Order**

### **Phase 1: Layout Structure**
1. ✅ Update App.tsx with grid layout
2. ✅ Create TopHeader component
3. ✅ Create LeftSidebar component
4. ✅ Update Canvas to work with new layout

### **Phase 2: Functionality**
5. ⏳ Implement sidebar collapse/expand
6. ⏳ Implement view switching (canvas/library/settings)
7. ⏳ Create Component Creator interface
8. ⏳ Create Library view
9. ⏳ Create Settings view

### **Phase 3: Polish**
10. ⏳ Add tooltips to collapsed sidebar
11. ⏳ Add keyboard shortcuts
12. ⏳ Add responsive behavior
13. ⏳ Add accessibility features
14. ⏳ Add animations and transitions

---

## 📝 **Usage Instructions**

### **For Developers:**

1. **Read the Master Order Form first** to understand overall structure
2. **Read individual component order forms** for detailed specifications
3. **Follow the implementation order** to build components in correct sequence
4. **Use CSS variables** defined in `src/index.css` for all styling
5. **Reference TypeScript interfaces** provided in each order form
6. **Implement accessibility features** as specified
7. **Test against requirements** listed in each order form

### **For AI Assistants:**

1. **Reference these order forms** when building components
2. **Follow specifications exactly** - colors, sizes, spacing, etc.
3. **Use provided TypeScript interfaces** for type safety
4. **Implement all interactions** as specified
5. **Include accessibility features** (ARIA labels, keyboard navigation)
6. **Test against requirements** before marking complete

---

## 🔗 **Related Documentation**

- **[README.md](../README.md)** - Main project documentation
- **[TOOL-PURPOSE-CLARIFICATION.md](../TOOL-PURPOSE-CLARIFICATION.md)** - Tool purpose and scope
- **[COMPONENT-CREATION-SPEC.md](../COMPONENT-CREATION-SPEC.md)** - Component creation interface spec
- **[PROJECT_ORDER_FORM.yaml](../PROJECT_ORDER_FORM.yaml)** - Project-level order form

---

## ✅ **Verification Checklist**

Before considering implementation complete, verify:

- [ ] All components match visual specifications exactly
- [ ] All colors use CSS variables (var(--variable-name))
- [ ] All spacing uses defined spacing tokens
- [ ] All border radius uses defined radius tokens
- [ ] All transitions use defined transition tokens
- [ ] All props interfaces match specifications
- [ ] All state management follows specified patterns
- [ ] All interactions work as specified
- [ ] All accessibility features implemented
- [ ] All keyboard shortcuts work
- [ ] All responsive behavior works
- [ ] All animations smooth and performant
- [ ] All tooltips show correctly
- [ ] All integration points connected
- [ ] All tests pass

---

## 📄 **Order Form Standards**

Each order form follows the YAML structure template standards and includes:

### **Layer 1: Identification & Metadata**
- Component ID, name, file locations
- Component type and classification
- Version and authorship

### **Layer 2: Visual Specifications**
- Dimensions (width, height, padding, margin)
- Layout (display, flex, grid)
- Colors (background, text, borders)
- Typography (font size, weight, family)
- Positioning (position, z-index)
- Transitions and animations

### **Layer 3: Component Structure**
- Sections and elements
- Child components
- Layout hierarchy

### **Layer 4: Props & Parameters**
- TypeScript interface
- Required/optional props
- Prop descriptions

### **Layer 5: State Management**
- Local state
- State flow (incoming/outgoing)
- State updates

### **Layer 6: Functionality**
- Primary functions
- Triggers and flows
- Business logic

### **Layer 7: Interactions & Events**
- Event handlers
- Visual feedback
- Results and side effects

### **Layer 8: Accessibility**
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### **Layer 9: Responsive Behavior**
- Breakpoints
- Mobile/tablet/desktop layouts
- Adaptive features

### **Layer 10: Integration Points**
- Parent/child relationships
- Data service connections
- External integrations

### **Layer 11: Implementation Structure**
- TypeScript interfaces
- Component code structure
- CSS classes

### **Layer 12: Testing Requirements**
- Unit tests
- Integration tests
- Visual tests

### **Layer 13: Implementation Notes**
- Existing code status
- Files to create/modify
- Dependencies
- Special considerations

---

**Last Updated:** 2025-09-30  
**Status:** Complete - Ready for implementation  
**Next Steps:** Begin Phase 1 implementation following build order


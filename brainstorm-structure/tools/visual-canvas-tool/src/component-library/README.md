# Component Library

This folder contains all the visual components that appear in the left sidebar menu of the Visual Canvas Tool.

## 📁 Structure

```
component-library/
├── README.md                 # This file
├── index.ts                  # Export all components
├── types.ts                  # Component type definitions
├── basic/                    # Basic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   └── Container.tsx
├── advanced/                 # Advanced components
│   ├── Calculator.tsx
│   ├── Chart.tsx
│   └── DataTable.tsx
└── custom/                   # Custom user components
    └── [user-created-components]
```

## 🎯 Component Requirements

Each component must export:

1. **Component Definition**: React component for rendering
2. **Metadata**: Information for the component library
3. **Default Props**: Default size, data, and configuration

## 📝 Example Component Structure

```typescript
// Button.tsx
import { ComponentDefinition } from '../types'

export const ButtonComponent: ComponentDefinition = {
  id: 'button',
  name: 'Button',
  category: 'basic',
  icon: '🔘',
  description: 'Interactive button component',
  defaultSize: { width: 120, height: 40 },
  defaultData: { 
    text: 'Button',
    variant: 'primary',
    disabled: false
  },
  render: ({ data, size, isPreview }) => (
    <button 
      style={{ 
        width: size.width, 
        height: size.height,
        ...getButtonStyles(data.variant)
      }}
      disabled={data.disabled}
      onClick={isPreview ? data.onClick : undefined}
    >
      {data.text}
    </button>
  )
}
```

## 🔧 Adding New Components

1. Create component file in appropriate category folder
2. Export component definition following the structure above
3. Add to `index.ts` exports
4. Create corresponding backend logic in `../component-backend/`

## 🎨 Component Categories

- **basic**: Button, Input, Text, Container, Image
- **advanced**: Calculator, Chart, DataTable, Form, Modal
- **custom**: User-created components

## 🚀 Usage

Components are automatically loaded into the left sidebar menu based on their category and metadata.

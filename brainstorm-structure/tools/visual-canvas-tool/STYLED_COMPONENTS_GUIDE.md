# Styled Components Guide for Visual Canvas Tool

## 🎨 Overview

Styled-components has been successfully integrated into your Visual Canvas Tool! This guide shows you how to use the pre-built components and create your own.

## 📦 What's Included

### 1. **Theme System** (`src/styles/theme.ts`)
- Matches your existing CSS variables
- Sage green color palette
- Typography, spacing, and border radius definitions
- TypeScript support with proper interfaces

### 2. **ThemeProvider** (`src/styles/ThemeProvider.tsx`)
- Wraps your entire app
- Provides theme access to all styled components
- Already integrated in `App.tsx`

### 3. **Pre-built Components** (`src/styles/StyledComponents.tsx`)
- `StyledButton` - Multiple variants and sizes
- `StyledInput` - Themed input fields
- `StyledCard` - Container component
- `ModalOverlay` & `ModalContent` - Modal components
- Typography components (`Heading`, `SubHeading`, `Text`)
- Layout components (`FlexRow`, `FlexColumn`, `Grid`)

## 🚀 Quick Start

### Using Pre-built Components

```tsx
import { StyledButton, StyledInput, StyledCard } from '../styles/StyledComponents'

function MyComponent() {
  return (
    <StyledCard>
      <StyledInput placeholder="Enter text..." />
      <StyledButton variant="primary" size="lg">
        Save Changes
      </StyledButton>
    </StyledCard>
  )
}
```

### Button Variants

```tsx
<StyledButton variant="primary">Primary</StyledButton>
<StyledButton variant="secondary">Secondary</StyledButton>
<StyledButton variant="tertiary">Tertiary</StyledButton>
<StyledButton variant="ghost">Ghost</StyledButton>
```

### Button Sizes

```tsx
<StyledButton size="sm">Small</StyledButton>
<StyledButton size="md">Medium (default)</StyledButton>
<StyledButton size="lg">Large</StyledButton>
```

## 🎯 Creating Custom Styled Components

### Basic Component

```tsx
import styled from 'styled-components'

const CustomDiv = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`
```

### Component with Props

```tsx
interface CustomButtonProps {
  isActive?: boolean
  size?: 'small' | 'large'
}

const CustomButton = styled.button<CustomButtonProps>`
  padding: ${({ size }) => size === 'large' ? '1rem 2rem' : '0.5rem 1rem'};
  background: ${({ isActive, theme }) => 
    isActive ? theme.colors.accent.primary : theme.colors.background.secondary
  };
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent.secondary};
  }
`
```

## 🎨 Theme Access

### In Styled Components

```tsx
const ThemedComponent = styled.div`
  color: ${({ theme }) => theme.colors.accent.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin: ${({ theme }) => theme.spacing.xl};
`
```

### In Regular Components (using useTheme hook)

```tsx
import { useTheme } from 'styled-components'

function MyComponent() {
  const theme = useTheme()
  
  return (
    <div style={{ color: theme.colors.accent.primary }}>
      Themed content
    </div>
  )
}
```

## 🔧 Integration Examples

### Replace Existing CSS Classes

**Before (CSS classes):**
```tsx
<button className="create-project-btn" onClick={handleCreate}>
  Create Project
</button>
```

**After (Styled Components):**
```tsx
<StyledButton variant="primary" fullWidth onClick={handleCreate}>
  Create Project
</StyledButton>
```

### Modal Replacement

**Before:**
```tsx
<div className="import-modal-overlay">
  <div className="import-modal">
    {/* content */}
  </div>
</div>
```

**After:**
```tsx
<ModalOverlay>
  <ModalContent>
    {/* content */}
  </ModalContent>
</ModalOverlay>
```

## 🎯 Best Practices

1. **Use Theme Variables**: Always use `theme.colors.accent.primary` instead of hardcoded colors
2. **Component Composition**: Build complex components from simpler ones
3. **Props for Variants**: Use props to control component appearance
4. **TypeScript**: Define proper interfaces for component props
5. **Performance**: Use `css` helper for conditional styles

## 📁 File Structure

```
src/
├── styles/
│   ├── theme.ts              # Theme definition
│   ├── ThemeProvider.tsx     # Theme provider wrapper
│   └── StyledComponents.tsx  # Pre-built components
├── components/
│   └── StyledExamples.tsx    # Usage examples
└── App.tsx                   # ThemeProvider integration
```

## 🎨 Color Palette (Sage Green Theme)

- **Primary**: `#7c9885` (Sage green)
- **Secondary**: `#6a8470` 
- **Tertiary**: `#5a7360`
- **Accent**: `#9bb5a3`
- **Background**: Dark theme (`#1f2937`, `#374151`, `#4b5563`)
- **Text**: Light colors (`#e5e7eb`, `#9ca3af`, `#6b7280`)

## 🚀 Next Steps

1. **Replace existing CSS classes** with styled components gradually
2. **Create component-specific styled components** for complex UI elements
3. **Use the theme system** for consistent styling across your app
4. **Build a component library** of reusable styled components

Your Visual Canvas Tool now has a powerful, type-safe styling system that maintains your beautiful sage green theme while providing better developer experience and component reusability!

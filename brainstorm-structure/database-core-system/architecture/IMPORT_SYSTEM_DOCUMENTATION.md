# Visual Canvas Tool - Import System Documentation

## Overview
The import system allows users to bring external components into the Visual Canvas Tool from various sources, primarily focusing on CSS/HTML components from websites like uiverse.io.

## Import System Architecture

### Core Files
1. **ComponentImporter.ts** (`src/services/ComponentImporter.ts`)
   - Main import logic and parsing
   - URL processing and content extraction
   - Component generation and validation

2. **VisualCanvas.tsx** (Import Modal)
   - User interface for import functionality
   - Import form and progress handling
   - Integration with component library

### Import Flow

#### 1. User Initiation
**Trigger**: User clicks "📥 Import" button in canvas controls
**UI**: Modal dialog opens with URL input field
**Supported Sources**:
- uiverse.io component URLs
- Direct HTML/CSS code URLs
- Custom component sources

#### 2. URL Processing
**Function**: `ComponentImporter.importFromUrl()`
**Process**:
1. Validate URL format and accessibility
2. Fetch content from source
3. Parse HTML structure and extract component code
4. Identify CSS styles and JavaScript functionality
5. Generate unique component ID and metadata

#### 3. Component Generation
**Process**:
1. Create React component wrapper
2. Sanitize and process CSS styles
3. Generate ComponentDefinition object
4. Set default size and properties
5. Create render function with proper styling

#### 4. Library Integration
**Process**:
1. Register component in component library
2. Add to 'custom' category
3. Update component registry
4. Persist to localStorage
5. Refresh UI to show new component

### Import Data Structures

#### ImportResult Interface
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
    originalUrl: string
  }
}
```

#### Generated Component Structure
```typescript
interface ImportedComponent extends ComponentDefinition {
  id: string                    // Generated unique ID
  name: string                  // Extracted or user-provided name
  category: 'custom'            // Always custom for imports
  icon: '🎨'                   // Default icon for imported components
  source: {
    url: string                 // Original source URL
    extractedAt: Date           // When component was imported
    type: 'uiverse' | 'custom'  // Source type
  }
  code: {
    html: string                // Original HTML structure
    css: string                 // Extracted CSS styles
    javascript?: string         // Any JavaScript functionality
  }
  defaultSize: {
    width: number               // Calculated from content
    height: number              // Calculated from content
  }
  render: (props) => JSX.Element // Generated render function
}
```

### Supported Import Sources

#### 1. Uiverse.io Components
**URL Pattern**: `https://uiverse.io/[username]/[component-name]`
**Content Type**: HTML + CSS components
**Extraction Method**:
1. Fetch page content
2. Parse HTML structure
3. Extract embedded CSS styles
4. Generate React component wrapper
5. Handle hover states and animations

**Example Process**:
```typescript
// Input URL: https://uiverse.io/alexruix/tidy-walrus-92
// Extracted HTML: <button class="btn">Click me</button>
// Extracted CSS: .btn { background: #7c9885; ... }
// Generated Component: React functional component with scoped styles
```

#### 2. Custom HTML/CSS Sources
**URL Pattern**: Any valid URL returning HTML content
**Content Type**: HTML documents with embedded or linked CSS
**Extraction Method**:
1. Fetch and parse HTML document
2. Extract relevant component sections
3. Process linked or embedded CSS
4. Generate component wrapper

### Component Code Processing

#### HTML Processing
1. **Sanitization**: Remove script tags and unsafe content
2. **Structure Analysis**: Identify main component elements
3. **Class Extraction**: Map CSS classes to component structure
4. **Attribute Processing**: Handle data attributes and properties

#### CSS Processing
1. **Style Extraction**: Get all relevant CSS rules
2. **Scoping**: Add unique component ID to prevent conflicts
3. **Variable Processing**: Convert CSS custom properties
4. **Animation Handling**: Preserve keyframes and transitions

#### JavaScript Processing (Future Feature)
1. **Event Handler Extraction**: Identify click, hover events
2. **State Management**: Convert to React state patterns
3. **Function Conversion**: Transform vanilla JS to React patterns

### Import Modal Implementation

#### Modal Structure
**Location**: `VisualCanvas.tsx` (lines 1075-1190)
**Features**:
- URL input field with validation
- Loading state with progress indicator
- Error handling and user feedback
- Cancel and import buttons

#### Modal State Management
```typescript
const [showImportModal, setShowImportModal] = useState(false)
const [importUrl, setImportUrl] = useState('')
const [importLoading, setImportLoading] = useState(false)
```

#### Import Process Handler
```typescript
const handleImportComponent = async () => {
  setImportLoading(true)
  try {
    const result = await ComponentImporter.importFromUrl(importUrl)
    if (result.success && result.component) {
      // Register component and update UI
      componentLibrary.registerComponent(result.component)
      // Add to canvas components if needed
      // Close modal and reset form
    } else {
      // Handle import failure
      alert(`Import failed: ${result.error}`)
    }
  } catch (error) {
    // Handle unexpected errors
  } finally {
    setImportLoading(false)
  }
}
```

### Error Handling

#### Common Import Errors
1. **Invalid URL**: URL format validation
2. **Network Errors**: Fetch failures, timeouts
3. **Parsing Errors**: Invalid HTML/CSS structure
4. **Content Errors**: No extractable component content
5. **Size Errors**: Component too large or complex

#### Error Recovery
1. **User Feedback**: Clear error messages in modal
2. **Retry Mechanism**: Allow users to try different URLs
3. **Fallback Options**: Suggest alternative import methods
4. **Logging**: Console logs for debugging

### Performance Considerations

#### Import Optimization
1. **Lazy Loading**: Components loaded only when needed
2. **Caching**: Store imported components for reuse
3. **Size Limits**: Prevent importing overly large components
4. **Timeout Handling**: Prevent hanging import operations

#### Memory Management
1. **Component Cleanup**: Remove unused imported components
2. **Style Scoping**: Prevent CSS conflicts and leaks
3. **Event Cleanup**: Proper event listener management

### Security Considerations

#### Content Sanitization
1. **Script Removal**: Strip all JavaScript from imported HTML
2. **URL Validation**: Ensure safe source URLs
3. **CSS Sanitization**: Remove potentially harmful CSS
4. **XSS Prevention**: Sanitize all user inputs

#### Source Validation
1. **Trusted Sources**: Whitelist known safe sources
2. **Content-Type Checking**: Verify response content types
3. **Size Limits**: Prevent importing malicious large files

### Future Enhancements

#### Planned Features
1. **Code Editor**: Allow manual editing of imported components
2. **Component Preview**: Preview before importing
3. **Batch Import**: Import multiple components at once
4. **Version Management**: Track component versions and updates
5. **Export Functionality**: Export components to other formats

#### Advanced Import Sources
1. **GitHub Repositories**: Import from GitHub component libraries
2. **NPM Packages**: Import from published component packages
3. **Figma Integration**: Import designs from Figma
4. **Sketch Integration**: Import from Sketch files

#### Enhanced Processing
1. **JavaScript Support**: Full JavaScript component import
2. **Framework Conversion**: Convert between React, Vue, Angular
3. **TypeScript Generation**: Generate TypeScript interfaces
4. **Documentation Extraction**: Extract component documentation

### Integration with Component Library

#### Registration Process
1. **Validation**: Ensure component meets requirements
2. **ID Generation**: Create unique component identifier
3. **Category Assignment**: Add to appropriate category
4. **Library Update**: Refresh component library state
5. **UI Refresh**: Update sidebar component list

#### Persistence
1. **localStorage**: Store imported components locally
2. **Project Association**: Link components to specific projects
3. **Export/Import**: Allow sharing of custom components
4. **Backup**: Maintain component backups

### Debugging and Monitoring

#### Debug Information
1. **Import Logs**: Detailed logging of import process
2. **Component Metadata**: Track source and import details
3. **Error Tracking**: Monitor import failure rates
4. **Performance Metrics**: Track import speed and success rates

#### Development Tools
1. **Console Logging**: Detailed import process logs
2. **Component Inspector**: View imported component details
3. **Source Viewer**: Examine original component source
4. **Style Inspector**: Debug CSS scoping and conflicts

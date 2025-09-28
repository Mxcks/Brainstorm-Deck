import { v4 as uuidv4 } from 'uuid'
import type { ComponentData } from './ComponentInstance'
import './ComponentPalette.css'

interface ComponentPaletteProps {
  onAddComponent: (component: ComponentData) => void
}

interface ComponentTemplate {
  type: string
  name: string
  icon: string
  defaultSize: { width: number; height: number }
  defaultProps: Record<string, any>
}

const componentTemplates: ComponentTemplate[] = [
  {
    type: 'button',
    name: 'Button',
    icon: '🔘',
    defaultSize: { width: 120, height: 40 },
    defaultProps: {
      text: 'Click me',
      style: {}
    }
  },
  {
    type: 'text',
    name: 'Text',
    icon: '📝',
    defaultSize: { width: 200, height: 40 },
    defaultProps: {
      text: 'Sample text',
      style: {}
    }
  },
  {
    type: 'card',
    name: 'Card',
    icon: '🃏',
    defaultSize: { width: 250, height: 150 },
    defaultProps: {
      title: 'Card Title',
      content: 'This is a sample card component with some content.',
      style: {}
    }
  }
]

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const handleAddComponent = (template: ComponentTemplate) => {
    const newComponent: ComponentData = {
      id: uuidv4(),
      type: template.type,
      name: `${template.name} ${Date.now()}`,
      position: { 
        x: Math.random() * 300 + 100, // Random position near center
        y: Math.random() * 200 + 100 
      },
      size: template.defaultSize,
      props: { ...template.defaultProps }
    }
    
    onAddComponent(newComponent)
  }

  return (
    <div className="component-palette">
      <div className="palette-header">
        <h3>Components</h3>
      </div>
      
      <div className="palette-grid">
        {componentTemplates.map((template) => (
          <button
            key={template.type}
            className="component-template"
            onClick={() => handleAddComponent(template)}
            title={`Add ${template.name}`}
          >
            <div className="template-icon">{template.icon}</div>
            <div className="template-name">{template.name}</div>
          </button>
        ))}
      </div>
      
      <div className="palette-footer">
        <div className="palette-hint">
          Click to add components to the canvas
        </div>
      </div>
    </div>
  )
}

export default ComponentPalette

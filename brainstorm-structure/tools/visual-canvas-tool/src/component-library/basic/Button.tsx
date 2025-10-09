import type { ComponentDefinition } from '../types'

const getButtonStyles = (variant: string, disabled: boolean) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const variants = {
    primary: {
      background: '#7c9885',
      color: 'white',
      boxShadow: '0 2px 4px rgba(124, 152, 133, 0.3)'
    },
    secondary: {
      background: '#f5f5f5',
      color: '#333',
      border: '1px solid #ddd'
    },
    danger: {
      background: '#dc3545',
      color: 'white',
      boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)'
    }
  }

  return {
    ...baseStyles,
    ...variants[variant as keyof typeof variants] || variants.primary
  }
}

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
  resizable: true,
  minSize: { width: 60, height: 30 },
  maxSize: { width: 300, height: 80 },
  hasBackend: true,
  backendActions: ['click', 'hover', 'focus'],
  render: ({ data, size, isPreview, onInteraction }) => (
    <button 
      style={{ 
        width: size.width, 
        height: size.height,
        ...getButtonStyles(data.variant || 'primary', data.disabled || false)
      }}
      disabled={data.disabled}
      onClick={isPreview ? () => onInteraction?.('click', { text: data.text }) : undefined}
      onMouseEnter={isPreview ? () => onInteraction?.('hover', { state: 'enter' }) : undefined}
      onMouseLeave={isPreview ? () => onInteraction?.('hover', { state: 'leave' }) : undefined}
    >
      {data.text || 'Button'}
    </button>
  )
}

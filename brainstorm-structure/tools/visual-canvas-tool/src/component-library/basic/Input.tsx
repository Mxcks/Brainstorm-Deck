import { ComponentDefinition } from '../types'

const getInputStyles = (variant: string) => {
  const baseStyles = {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box' as const
  }

  const variants = {
    default: {
      borderColor: '#ddd',
      '&:focus': {
        borderColor: '#7c9885'
      }
    },
    error: {
      borderColor: '#dc3545',
      '&:focus': {
        borderColor: '#dc3545'
      }
    },
    success: {
      borderColor: '#28a745',
      '&:focus': {
        borderColor: '#28a745'
      }
    }
  }

  return {
    ...baseStyles,
    ...variants[variant as keyof typeof variants] || variants.default
  }
}

export const InputComponent: ComponentDefinition = {
  id: 'input',
  name: 'Input',
  category: 'basic',
  icon: '📝',
  description: 'Text input field component',
  defaultSize: { width: 200, height: 40 },
  defaultData: { 
    placeholder: 'Enter text...',
    value: '',
    type: 'text',
    variant: 'default',
    disabled: false
  },
  resizable: true,
  minSize: { width: 100, height: 30 },
  maxSize: { width: 500, height: 60 },
  hasBackend: true,
  backendActions: ['change', 'focus', 'blur', 'submit'],
  render: ({ data, size, isPreview, onInteraction }) => (
    <input
      type={data.type || 'text'}
      placeholder={data.placeholder || 'Enter text...'}
      value={data.value || ''}
      disabled={data.disabled}
      style={{ 
        width: size.width, 
        height: size.height,
        ...getInputStyles(data.variant || 'default')
      }}
      onChange={isPreview ? (e) => onInteraction?.('change', { value: e.target.value }) : undefined}
      onFocus={isPreview ? () => onInteraction?.('focus') : undefined}
      onBlur={isPreview ? () => onInteraction?.('blur') : undefined}
      onKeyDown={isPreview ? (e) => {
        if (e.key === 'Enter') {
          onInteraction?.('submit', { value: data.value })
        }
      } : undefined}
    />
  )
}

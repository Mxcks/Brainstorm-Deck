/**
 * Left Sidebar Navigation Component
 * Collapsible sidebar with Create, Library, Settings, and Help buttons
 */

import { useState } from 'react'
import './Sidebar.css'

interface SidebarProps {
  activeView: 'canvas' | 'library' | 'settings' | 'help'
  onViewChange: (view: 'canvas' | 'library' | 'settings' | 'help') => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)

  const navigationItems = [
    {
      id: 'create',
      label: 'Create',
      icon: '⊞',
      hasSubmenu: true,
      submenu: [
        { id: 'button', label: 'Button', icon: '🔘' },
        { id: 'input', label: 'Input', icon: '📝' },
        { id: 'textarea', label: 'Textarea', icon: '📄' },
        { id: 'form', label: 'Form', icon: '📋' },
        { id: 'container', label: 'Container', icon: '📦' },
        { id: 'text', label: 'Text', icon: '🔤' },
        { id: 'image', label: 'Image', icon: '🖼️' },
        { id: 'card', label: 'Card', icon: '🃏' }
      ]
    },
    {
      id: 'library',
      label: 'Library',
      icon: '📚',
      view: 'library' as const
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      view: 'settings' as const
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      view: 'help' as const
    }
  ]

  const handleItemClick = (item: any) => {
    if (item.hasSubmenu) {
      setIsCreateMenuOpen(!isCreateMenuOpen)
    } else if (item.view) {
      onViewChange(item.view)
      setIsCreateMenuOpen(false)
    }
  }

  const handleCreateComponent = (componentType: string) => {
    // This will be connected to the component creation logic
    console.log('Creating component:', componentType)
    setIsCreateMenuOpen(false)
    
    // Dispatch custom event for component creation
    const event = new CustomEvent('createComponent', {
      detail: { type: componentType }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button 
          className="collapse-button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
        {!isCollapsed && (
          <h2 className="sidebar-title">Tools</h2>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <div key={item.id} className="nav-item-container">
            <button
              className={`nav-item ${activeView === item.view ? 'active' : ''} ${
                item.id === 'create' && isCreateMenuOpen ? 'submenu-open' : ''
              }`}
              onClick={() => handleItemClick(item)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.hasSubmenu && (
                    <span className={`submenu-arrow ${isCreateMenuOpen ? 'open' : ''}`}>
                      ▼
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Create Component Submenu */}
            {item.id === 'create' && isCreateMenuOpen && !isCollapsed && (
              <div className="submenu">
                <div className="submenu-header">
                  <span className="submenu-title">Create Component</span>
                </div>
                <div className="submenu-items">
                  {item.submenu?.map((subItem) => (
                    <button
                      key={subItem.id}
                      className="submenu-item"
                      onClick={() => handleCreateComponent(subItem.id)}
                      title={`Create ${subItem.label}`}
                    >
                      <span className="submenu-icon">{subItem.icon}</span>
                      <span className="submenu-label">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <div className="app-name">Visual Canvas</div>
            <div className="app-version">v1.0.0</div>
          </div>
        </div>
      )}

      {/* Collapsed Create Menu */}
      {isCollapsed && isCreateMenuOpen && (
        <div className="collapsed-create-menu">
          <div className="collapsed-menu-header">
            <span>Create Component</span>
            <button 
              className="close-menu"
              onClick={() => setIsCreateMenuOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="collapsed-menu-items">
            {navigationItems[0].submenu?.map((subItem) => (
              <button
                key={subItem.id}
                className="collapsed-menu-item"
                onClick={() => handleCreateComponent(subItem.id)}
                title={`Create ${subItem.label}`}
              >
                <span className="item-icon">{subItem.icon}</span>
                <span className="item-label">{subItem.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar

/**
 * Component Importer Service
 * Handles importing components from various websites
 */

export interface ImportedComponent {
  id: string
  name: string
  html: string
  css: string
  category: 'basic' | 'advanced' | 'custom'
  source: string
  sourceUrl: string
  description?: string
  tags?: string[]
}

export interface ImportResult {
  success: boolean
  component?: ImportedComponent
  error?: string
}

export class ComponentImporter {
  
  /**
   * Import component from URL
   */
  static async importFromUrl(url: string): Promise<ImportResult> {
    try {
      // Determine the source website
      const source = this.detectSource(url)
      
      switch (source) {
        case 'uiverse':
          return await this.importFromUiverse(url)
        case 'codepen':
          return await this.importFromCodePen(url)
        case 'css-tricks':
          return await this.importFromCssTricks(url)
        default:
          return await this.importGeneric(url)
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to import component: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Detect source website from URL
   */
  private static detectSource(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase()
    
    if (hostname.includes('uiverse.io')) return 'uiverse'
    if (hostname.includes('codepen.io')) return 'codepen'
    if (hostname.includes('css-tricks.com')) return 'css-tricks'
    
    return 'generic'
  }

  /**
   * Import from uiverse.io
   */
  private static async importFromUiverse(url: string): Promise<ImportResult> {
    try {
      // For now, we'll use a CORS proxy or direct fetch
      // In production, you'd want your own backend to handle this
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      
      if (!data.contents) {
        throw new Error('Failed to fetch component data')
      }

      // Parse the HTML content
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')
      
      // Extract component name from URL or page title
      const urlParts = url.split('/')
      const componentId = urlParts[urlParts.length - 1] || 'imported-component'
      const componentName = this.generateComponentName(componentId)

      // Try to extract HTML and CSS from the page
      const htmlContent = this.extractHtmlFromUiverse(doc)
      const cssContent = this.extractCssFromUiverse(doc)

      if (!htmlContent && !cssContent) {
        throw new Error('Could not extract component code from the page')
      }

      return {
        success: true,
        component: {
          id: `imported-${Date.now()}`,
          name: componentName,
          html: htmlContent || '<div>Imported Component</div>',
          css: cssContent || '',
          category: 'custom',
          source: 'uiverse.io',
          sourceUrl: url,
          description: `Imported from ${url}`,
          tags: ['imported', 'uiverse']
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to import from uiverse.io: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Import from CodePen
   */
  private static async importFromCodePen(url: string): Promise<ImportResult> {
    // CodePen has an API, but for now we'll return a placeholder
    return {
      success: false,
      error: 'CodePen import not yet implemented. Coming soon!'
    }
  }

  /**
   * Import from CSS-Tricks
   */
  private static async importFromCssTricks(url: string): Promise<ImportResult> {
    return {
      success: false,
      error: 'CSS-Tricks import not yet implemented. Coming soon!'
    }
  }

  /**
   * Generic import for other websites
   */
  private static async importGeneric(url: string): Promise<ImportResult> {
    return {
      success: false,
      error: 'Generic website import not yet implemented. Please use supported websites like uiverse.io'
    }
  }

  /**
   * Extract HTML content from uiverse.io page
   */
  private static extractHtmlFromUiverse(doc: Document): string {
    // Look for common selectors where HTML code might be stored
    const codeBlocks = doc.querySelectorAll('code, pre, .code, .html-code, [data-language="html"]')
    
    for (const block of codeBlocks) {
      const content = block.textContent?.trim()
      if (content && content.includes('<') && content.includes('>')) {
        return content
      }
    }

    // Fallback: look for any element that might contain HTML
    const possibleHtml = doc.querySelector('.component-html, .html-content, .source-html')
    return possibleHtml?.textContent?.trim() || ''
  }

  /**
   * Extract CSS content from uiverse.io page
   */
  private static extractCssFromUiverse(doc: Document): string {
    // Look for CSS code blocks
    const codeBlocks = doc.querySelectorAll('code, pre, .code, .css-code, [data-language="css"], style')
    
    for (const block of codeBlocks) {
      const content = block.textContent?.trim()
      if (content && (content.includes('{') || content.includes('.'))) {
        return content
      }
    }

    // Fallback: look for any element that might contain CSS
    const possibleCss = doc.querySelector('.component-css, .css-content, .source-css')
    return possibleCss?.textContent?.trim() || ''
  }

  /**
   * Generate a readable component name from ID
   */
  private static generateComponentName(id: string): string {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Convert HTML/CSS to React component
   */
  static htmlCssToReact(html: string, css: string): string {
    // Basic conversion - in a real implementation, you'd want more sophisticated parsing
    let reactCode = html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/style="([^"]*)"/g, (match, styles) => {
        // Convert inline styles to React style objects
        const styleObj = styles
          .split(';')
          .filter(Boolean)
          .map((style: string) => {
            const [prop, value] = style.split(':').map((s: string) => s.trim())
            const camelProp = prop.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())
            return `${camelProp}: '${value}'`
          })
          .join(', ')
        return `style={{${styleObj}}}`
      })

    return `
import React from 'react'

const ImportedComponent = () => {
  return (
    <>
      <style>{\`${css}\`}</style>
      ${reactCode}
    </>
  )
}

export default ImportedComponent
    `.trim()
  }
}

import { DefaultTheme } from 'styled-components'

// Define the theme interface
export interface Theme {
  colors: {
    primary: string
    secondary: string
    tertiary: string
    accent: {
      primary: string
      secondary: string
      tertiary: string
    }
    text: {
      primary: string
      secondary: string
      tertiary: string
      inverse: string
    }
    border: {
      primary: string
      hover: string
    }
    background: {
      primary: string
      secondary: string
      tertiary: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
}

// Main theme object that matches your existing CSS variables
export const theme: Theme = {
  colors: {
    primary: '#7c9885', // Sage green
    secondary: '#6a8470',
    tertiary: '#5a7360',
    accent: {
      primary: '#7c9885', // var(--accent-primary)
      secondary: '#6a8470', // var(--accent-secondary)
      tertiary: '#9bb5a3', // var(--accent-tertiary)
    },
    text: {
      primary: '#e5e7eb', // var(--text-primary)
      secondary: '#9ca3af', // var(--text-secondary)
      tertiary: '#6b7280', // var(--text-tertiary)
      inverse: '#ffffff', // var(--text-inverse)
    },
    border: {
      primary: '#374151', // var(--border-primary)
      hover: '#4b5563', // var(--border-hover)
    },
    background: {
      primary: '#1f2937', // var(--bg-primary)
      secondary: '#374151', // var(--bg-secondary)
      tertiary: '#4b5563', // var(--bg-tertiary)
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },
  borderRadius: {
    sm: '4px', // var(--radius-sm)
    md: '6px', // var(--radius-md)
    lg: '8px', // var(--radius-lg)
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
}

// Extend the DefaultTheme interface
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export default theme

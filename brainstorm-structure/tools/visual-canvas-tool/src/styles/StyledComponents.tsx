import styled, { css } from 'styled-components'

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
}

// Styled Button Component
export const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  outline: none;

  /* Size variants */
  ${({ size = 'md' }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          gap: 0.25rem;
        `
      case 'lg':
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
          gap: 0.5rem;
        `
      default:
        return css`
          padding: 0.625rem 1rem;
          font-size: 1rem;
          gap: 0.375rem;
        `
    }
  }}

  /* Color variants */
  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background: ${theme.colors.background.secondary};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border.primary};

          &:hover:not(:disabled) {
            background: ${theme.colors.border.hover};
            border-color: ${theme.colors.accent.primary};
          }
        `
      case 'tertiary':
        return css`
          background: ${theme.colors.background.tertiary};
          color: ${theme.colors.text.primary};
          border: 1px solid ${theme.colors.border.primary};

          &:hover:not(:disabled) {
            background: ${theme.colors.border.hover};
            border-color: ${theme.colors.accent.primary};
          }
        `
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.secondary};
          border: 1px solid transparent;

          &:hover:not(:disabled) {
            background: ${theme.colors.background.secondary};
            color: ${theme.colors.text.primary};
          }
        `
      default: // primary
        return css`
          background: ${theme.colors.accent.primary};
          color: ${theme.colors.text.inverse};
          border: 1px solid ${theme.colors.accent.primary};

          &:hover:not(:disabled) {
            background: ${theme.colors.accent.secondary};
            border-color: ${theme.colors.accent.secondary};
          }
        `
    }
  }}

  /* Full width */
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Focus state */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 2px;
  }
`

// Styled Input Component
export const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.primary}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// Styled Card Component
export const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`

// Styled Modal Overlay
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`

// Styled Modal Content
export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`

// Styled Text Components
export const Heading = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const SubHeading = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accent.primary};
`

export const Text = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`

// Styled Flex Components
export const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

// Styled Grid Component
export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: ${({ gap, theme }) => gap || theme.spacing.md};
`

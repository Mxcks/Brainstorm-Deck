import { useMemo } from 'react'
import './CanvasGrid.css'

interface CanvasGridProps {
  scale: number
}

const CanvasGrid: React.FC<CanvasGridProps> = ({ scale }) => {
  const gridSize = useMemo(() => {
    // Adjust grid size based on zoom level
    const baseSize = 50
    if (scale < 0.5) return baseSize * 4
    if (scale < 1) return baseSize * 2
    if (scale > 2) return baseSize / 2
    return baseSize
  }, [scale])

  const opacity = useMemo(() => {
    // Fade grid at extreme zoom levels
    if (scale < 0.3) return 0.1
    if (scale < 0.5) return 0.2
    if (scale > 2.5) return 0.1
    return 0.3
  }, [scale])

  const gridStyle = useMemo(() => ({
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, ${opacity}) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, ${opacity}) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  }), [gridSize, opacity])

  return (
    <div 
      className="canvas-grid"
      style={gridStyle}
    />
  )
}

export default CanvasGrid

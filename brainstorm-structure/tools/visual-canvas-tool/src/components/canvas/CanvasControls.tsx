import './CanvasControls.css'

interface ViewportState {
  x: number
  y: number
  scale: number
}

interface CanvasControlsProps {
  viewport: ViewportState
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onExport: () => void
  projectName: string
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  viewport,
  onZoomIn,
  onZoomOut,
  onReset,
  onExport,
  projectName
}) => {
  const zoomPercentage = Math.round(viewport.scale * 100)

  return (
    <div className="canvas-controls">
      <div className="canvas-info">
        <div className="project-name">{projectName}</div>
        <div className="viewport-info">
          <span>Zoom: {zoomPercentage}%</span>
          <span>X: {Math.round(viewport.x)}</span>
          <span>Y: {Math.round(viewport.y)}</span>
        </div>
      </div>

      <div className="canvas-controls-buttons">
        <button 
          className="control-button"
          onClick={onZoomIn}
          title="Zoom In"
        >
          +
        </button>
        
        <button 
          className="control-button zoom-display"
          onClick={onReset}
          title="Reset View"
        >
          {zoomPercentage}%
        </button>
        
        <button 
          className="control-button"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          −
        </button>

        <button
          className="control-button export-button"
          onClick={onExport}
          title="Export Project"
        >
          📤
        </button>
      </div>
    </div>
  )
}

export default CanvasControls

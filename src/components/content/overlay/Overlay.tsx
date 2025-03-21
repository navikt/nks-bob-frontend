import { FC } from "react"
import "./Overlay.css"

interface OverlayProps {
  isVisible: boolean
  onClose?: () => void
}

const Overlay: FC<OverlayProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  return (
    <div
      className='black-overlay fixed inset-0 z-40 transition-opacity'
      onClick={onClose}
      role='presentation'
    />
  )
}

export default Overlay

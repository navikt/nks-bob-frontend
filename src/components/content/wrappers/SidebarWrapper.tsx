import { HStack } from "@navikt/ds-react"
import { ReactNode, useEffect, useRef, useState } from "react"

interface SidebarWrapperProps {
  children: ReactNode | ((width: number) => ReactNode)
  isOpen: boolean
  onClose: () => void
  storageKey?: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
}

export const SidebarWrapper = ({
  children,
  isOpen,
  onClose,
  storageKey = "sidebar-width",
  defaultWidth = 320,
  minWidth = 250,
  maxWidth = 600,
  className = "",
}: SidebarWrapperProps) => {
  const [width, setWidth] = useState(() => {
    if (storageKey) {
      const savedWidth = localStorage.getItem(storageKey)
      return savedWidth ? parseInt(savedWidth, 10) : defaultWidth
    }
    return defaultWidth
  })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle resize events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"

      if (storageKey) {
        localStorage.setItem(storageKey, width.toString())
      }
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = "none"
      document.body.style.cursor = "ew-resize"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, width, minWidth, maxWidth, storageKey])

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  return (
    <HStack
      className={`pointer-events-none fixed right-0 h-full items-center ${className}`}
    >
      <div
        className={`group pointer-events-auto flex h-full w-2 cursor-ew-resize items-center justify-center bg-ax-border-neutral-subtle transition-colors duration-200 hover:bg-ax-border-accent active:bg-ax-border-accent ${isOpen ? "opacity-100" : "opacity-0"}`}
        ref={resizeRef}
        onMouseDown={startResizing}
        style={{ zIndex: 105 }}
      >
        <div className='h-10 w-0.5 bg-ax-border-neutral transition-colors duration-200 group-hover:bg-ax-border-accent group-active:bg-ax-border-accent'></div>
      </div>
      <div
        className='pointer-events-auto relative mt-1 h-full overflow-y-auto border-l border-ax-border-neutral-subtle bg-ax-bg-default'
        style={{
          width: isOpen ? `${width}px` : "0px"
        }}
      >
        {typeof children === 'function' ? children(width) : children}
      </div>
    </HStack>
  )
}

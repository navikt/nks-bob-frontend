import { Box } from "@navikt/ds-react"
import React, { useRef, useState } from "react"

interface HoverCardProps {
  children: React.ReactNode
  content: React.ReactNode
}

export const HoverCard = ({ children, content }: HoverCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, maxHeight: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  const handleMouseEnter = (_e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom - 8 - 20 // 8px offset + 20px margin

      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
        maxHeight: Math.max(200, spaceBelow), // Minimum 200px height
      })
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleCardMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {isOpen && (
        <div
          ref={cardRef}
          className="fixed z-50 max-w-xl"
          style={{
            left: position.x,
            top: position.y,
            transform: "translateX(-50%)",
            maxHeight: position.maxHeight,
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <Box
            background="surface-default"
            padding="4"
            borderRadius="medium"
            borderColor="border-subtle"
            borderWidth="1"
            shadow="medium"
            className="overflow-y-auto"
            style={{ maxHeight: "inherit" }}
          >
            {content}
          </Box>
        </div>
      )}
    </>
  )
}
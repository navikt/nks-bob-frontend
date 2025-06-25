import { Box } from "@navikt/ds-react"
import React, { useRef, useState } from "react"

interface HoverCardProps {
  children: React.ReactNode
  content: React.ReactNode
}

export const HoverCard = ({ children, content }: HoverCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    maxHeight: 0,
    showAbove: false,
    width: 0,
  })
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
      const viewportWidth = window.innerWidth
      const padding = 20 // Padding from viewport edges
      const gap = 8 // Gap between trigger and card

      const spaceBelow = viewportHeight - rect.bottom - gap - padding
      const spaceAbove = rect.top - gap - padding
      const minRequiredHeight = 150 // Minimum space needed to show card

      // Determine if we should show above or below
      const showAbove =
        spaceBelow < minRequiredHeight && spaceAbove > spaceBelow

      let maxHeight: number
      let yPosition: number

      if (showAbove) {
        maxHeight = Math.max(minRequiredHeight, Math.min(600, spaceAbove))
        yPosition = rect.top - gap
      } else {
        maxHeight = Math.max(minRequiredHeight, Math.min(600, spaceBelow))
        yPosition = rect.bottom + gap
      }

      // Calculate width: chat content width (48rem = 768px) minus 16px, or viewport width minus 16px on narrow screens
      const maxChatWidth = 768 // 48rem in pixels
      const desiredWidth = maxChatWidth - 16
      const width = Math.min(desiredWidth, viewportWidth - 16)

      // Calculate horizontal position to keep card within viewport
      let xPosition = rect.left + rect.width / 2
      const halfWidth = width / 2
      const leftBound = 8 // Minimum distance from left edge
      const rightBound = viewportWidth - 8 // Maximum distance from right edge

      // Adjust x position if card would overflow viewport
      if (xPosition - halfWidth < leftBound) {
        xPosition = leftBound + halfWidth
      } else if (xPosition + halfWidth > rightBound) {
        xPosition = rightBound - halfWidth
      }

      setPosition({
        x: xPosition,
        y: yPosition,
        maxHeight,
        showAbove,
        width,
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
          className='fixed z-50'
          style={{
            left: position.x,
            top: position.showAbove ? undefined : position.y,
            bottom: position.showAbove
              ? `${window.innerHeight - position.y}px`
              : undefined,
            transform: "translateX(-50%)",
            maxHeight: position.maxHeight,
            width: position.width,
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <Box
            padding='4'
            borderRadius='medium'
            borderWidth='1'
            shadow='medium'
            className='overflow-y-auto border-border-default bg-surface-default'
            style={{ maxHeight: "inherit" }}
          >
            {content}
          </Box>
        </div>
      )}
    </>
  )
}

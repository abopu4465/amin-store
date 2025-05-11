"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useCrossPlatform } from "@/hooks/use-cross-platform"

interface CrossPlatformButtonProps extends ButtonProps {
  onTap?: () => void
}

export const CrossPlatformButton = React.forwardRef<HTMLButtonElement, CrossPlatformButtonProps>(
  ({ onTap, onClick, className, children, ...props }, ref) => {
    const { isTouchDevice, os } = useCrossPlatform()

    // Combined handler for both click and touch events
    const handleInteraction = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent double firing on touch devices
      if (e.type === "click" && isTouchDevice) {
        const lastTouchEnd = (window as any).lastTouchEnd || 0
        const now = Date.now()
        if (now - lastTouchEnd < 500) {
          e.preventDefault()
          return
        }
      }

      // Call the appropriate handler
      if (onTap) onTap()
      if (onClick) onClick(e)
    }

    // Additional styles for different platforms
    const getAdditionalStyles = () => {
      let styles = ""

      // Larger touch targets for mobile
      if (isTouchDevice) {
        styles += " min-h-[44px] "
      }

      // Android-specific adjustments
      if (os === "android") {
        styles += " active:opacity-70 "
      }

      return styles
    }

    return (
      <Button
        ref={ref}
        className={`${getAdditionalStyles()} ${className || ""}`}
        onClick={handleInteraction}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

CrossPlatformButton.displayName = "CrossPlatformButton"

/**
 * Utility functions for handling touch events across different platforms
 */

// Detect if the device supports touch events
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

// Fix for the 300ms delay on touch devices
export const fixTouchDelay = (): void => {
  if (typeof document === "undefined") return

  // Only apply if not already present
  if (!document.body.style.touchAction) {
    document.body.style.touchAction = "manipulation"
  }
}

// Prevent double tap zoom on touch devices
export const preventDoubleTapZoom = (element: HTMLElement): void => {
  if (!isTouchDevice()) return

  let lastTap = 0
  element.addEventListener("touchend", (e) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTap
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault()
    }
    lastTap = currentTime
  })
}

// Add active state for touch devices that don't support :active
export const addActiveTouchState = (element: HTMLElement): (() => void) => {
  if (!isTouchDevice()) return () => {}

  const touchStartHandler = () => {
    element.classList.add("active-touch")
  }

  const touchEndHandler = () => {
    element.classList.remove("active-touch")
  }

  element.addEventListener("touchstart", touchStartHandler)
  element.addEventListener("touchend", touchEndHandler)
  element.addEventListener("touchcancel", touchEndHandler)

  // Return cleanup function
  return () => {
    element.removeEventListener("touchstart", touchStartHandler)
    element.removeEventListener("touchend", touchEndHandler)
    element.removeEventListener("touchcancel", touchEndHandler)
  }
}

// Fix for iOS hover state issues
export const fixIOSHoverState = (): void => {
  if (typeof document === "undefined") return

  // Check if iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  if (isIOS) {
    // Add class to body to target in CSS
    document.body.classList.add("ios-device")
  }
}

"use client"

import { useEffect } from "react"
import { fixTouchDelay, fixIOSHoverState } from "@/lib/utils/touch-events"

export function CrossPlatformFixes() {
  useEffect(() => {
    // Apply fixes when component mounts
    fixTouchDelay()
    fixIOSHoverState()

    // Add passive event listeners for better scrolling performance
    const supportsPassive = (() => {
      let passive = false
      try {
        const options = Object.defineProperty({}, "passive", {
          get: () => {
            passive = true
            return true
          },
        })
        window.addEventListener("testPassive", null as any, options)
        window.removeEventListener("testPassive", null as any, options)
      } catch (e) {}
      return passive
    })()

    if (supportsPassive) {
      document.addEventListener("touchstart", () => {}, { passive: true })
      document.addEventListener("touchmove", () => {}, { passive: true })
    }

    // Fix for vh units on mobile browsers
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVhProperty()
    window.addEventListener("resize", setVhProperty)

    return () => {
      window.removeEventListener("resize", setVhProperty)
    }
  }, [])

  return null
}

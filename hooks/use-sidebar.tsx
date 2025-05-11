"use client"

import { useState, useEffect } from "react"

interface UseSidebarOptions {
  defaultCollapsed?: boolean
  localStorageKey?: string
}

export function useSidebar(options: UseSidebarOptions = {}) {
  const { defaultCollapsed = false, localStorageKey = "sidebarCollapsed" } = options

  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Set mounted state
    setIsMounted(true)

    // Initial check
    checkMobile()

    // Set up listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Initialize sidebar state
  useEffect(() => {
    if (!isMounted) return

    // Check if there's a saved preference for desktop
    try {
      const savedCollapsedState = localStorage.getItem(localStorageKey)
      if (savedCollapsedState) {
        setIsCollapsed(savedCollapsedState === "true")
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }

    // Always start with closed sidebar on mobile
    if (isMobile) {
      setIsOpen(false)
    }
  }, [isMounted, isMobile, localStorageKey])

  // Toggle sidebar collapse state (desktop only)
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)

    // Save preference
    if (isMounted) {
      try {
        localStorage.setItem(localStorageKey, String(newState))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }
  }

  // Toggle sidebar open state (mobile only)
  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return {
    isOpen,
    setIsOpen,
    isCollapsed,
    setIsCollapsed,
    isMobile,
    isMounted,
    toggleCollapse,
    toggleOpen,
  }
}

"use client"

import { useEffect, useState } from "react"

type DeviceType = "mobile" | "tablet" | "desktop" | "unknown"
type OSType = "ios" | "android" | "windows" | "macos" | "linux" | "unknown"
type BrowserType = "chrome" | "firefox" | "safari" | "edge" | "opera" | "unknown"

interface PlatformInfo {
  deviceType: DeviceType
  os: OSType
  browser: BrowserType
  isTouchDevice: boolean
}

export function useCrossPlatform(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    deviceType: "unknown",
    os: "unknown",
    browser: "unknown",
    isTouchDevice: false,
  })

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    // Detect device type
    const detectDeviceType = (): DeviceType => {
      const width = window.innerWidth
      if (width < 768) return "mobile"
      if (width < 1024) return "tablet"
      return "desktop"
    }

    // Detect OS
    const detectOS = (): OSType => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod/.test(userAgent)) return "ios"
      if (/android/.test(userAgent)) return "android"
      if (/win/.test(userAgent)) return "windows"
      if (/mac/.test(userAgent)) return "macos"
      if (/linux/.test(userAgent)) return "linux"
      return "unknown"
    }

    // Detect browser
    const detectBrowser = (): BrowserType => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      if (/edg/.test(userAgent)) return "edge"
      if (/chrome/.test(userAgent) && !/chromium/.test(userAgent)) return "chrome"
      if (/firefox/.test(userAgent)) return "firefox"
      if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return "safari"
      if (/opr/.test(userAgent)) return "opera"
      return "unknown"
    }

    // Detect touch device
    const detectTouchDevice = (): boolean => {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0
    }

    // Set platform info
    setPlatformInfo({
      deviceType: detectDeviceType(),
      os: detectOS(),
      browser: detectBrowser(),
      isTouchDevice: detectTouchDevice(),
    })

    // Update device type on resize
    const handleResize = () => {
      setPlatformInfo((prev) => ({
        ...prev,
        deviceType: detectDeviceType(),
      }))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return platformInfo
}

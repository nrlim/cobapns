"use client"

import { useEffect } from "react"

/**
 * Registers the COBA PNS Service Worker for PWA offline support.
 * Should be included in the root layout or a top-level client component.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return
    }

    let refreshing = false
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        console.log("[COBA PNS] SW registered:", registration.scope)

        // Check for updates silently
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // A new version is available; force update and reload
              console.log("[COBA PNS] New SW version available. Auto-updating...")
              newWorker.postMessage({ type: "SKIP_WAITING" })
            }
          })
        })
      } catch (err) {
        console.warn("[COBA PNS] SW registration failed:", err)
      }
    }

    if (document.readyState === "complete") {
      registerSW()
    } else {
      window.addEventListener("load", registerSW)
    }
  }, [])

  return null
}

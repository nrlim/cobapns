"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { X, Download, Share, Plus } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

type Platform = "ios" | "android-chrome" | "desktop-chrome" | null

// ── Constants ─────────────────────────────────────────────────────────────────
const DISMISS_STORAGE_KEY = "cobapns-install-dismissed-until"
const DISMISS_DURATION_DAYS = 7
const isDev = process.env.NODE_ENV === "development"

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null
  const ua = navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isInStandaloneMode =
    "standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true
  if (isIos && !isInStandaloneMode) return "ios"
  if (/android/i.test(ua)) return "android-chrome"
  return "desktop-chrome"
}

function isDismissed(): boolean {
  try {
    const until = localStorage.getItem(DISMISS_STORAGE_KEY)
    if (!until) return false
    return Date.now() < parseInt(until, 10)
  } catch {
    return false
  }
}

function saveDismissed() {
  try {
    const until = Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_STORAGE_KEY, String(until))
  } catch {
    // localStorage may be blocked in private mode
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GlobalInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform, setPlatform] = useState<Platform>(null)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showIOSSteps, setShowIOSSteps] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // Detect if already installed as PWA
  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
    ) {
      setIsInstalled(true)
    }
  }, [])

  // Listen for beforeinstallprompt (Chrome/Android)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // Decide whether to show
  useEffect(() => {
    if (isInstalled) return
    if (isDismissed()) return

    const detected = detectPlatform()
    setPlatform(detected)

    // ── DEV MODE: always show so the prompt can be previewed ──────────
    if (isDev) {
      const timer = setTimeout(() => {
        setVisible(true)
        requestAnimationFrame(() => setAnimating(true))
      }, 1500)
      return () => clearTimeout(timer)
    }

    // Show after a short delay so it doesn't block initial render
    const timer = setTimeout(() => {
      if (detected === "ios" || detected === "android-chrome" || deferredPrompt) {
        setVisible(true)
        // Trigger slide-in animation
        requestAnimationFrame(() => setAnimating(true))
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [deferredPrompt, isInstalled])

  // Also show for desktop Chrome once deferredPrompt is available
  useEffect(() => {
    if (isInstalled || isDismissed() || !deferredPrompt) return
    if (platform === "desktop-chrome") {
      setVisible(true)
      requestAnimationFrame(() => setAnimating(true))
    }
  }, [deferredPrompt, platform, isInstalled])

  const handleDismiss = useCallback(() => {
    setAnimating(false)
    setTimeout(() => {
      setVisible(false)
      saveDismissed()
    }, 350)
  }, [])

  const handleInstall = useCallback(async () => {
    if (platform === "ios") {
      setShowIOSSteps(true)
      return
    }
    // In dev there's no deferredPrompt — show iOS-style steps as a preview
    if (!deferredPrompt) {
      setShowIOSSteps(true)
      return
    }
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      handleDismiss()
    }
  }, [deferredPrompt, platform, handleDismiss])

  if (!visible) return null

  return (
    <>
      {/* ── Overlay for iOS instructions ── */}
      {showIOSSteps && (
        <div
          className="cobapns-pwa-overlay"
          onClick={() => setShowIOSSteps(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="cobapns-pwa-ios-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="cobapns-pwa-close"
              onClick={() => setShowIOSSteps(false)}
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
            <div className="cobapns-pwa-ios-header">
              <Image
                src="/icon-cpns.png"
                alt="COBA PNS"
                width={48}
                height={48}
                className="cobapns-pwa-logo"
              />
              <div>
                <p className="cobapns-pwa-ios-title">Instal di iPhone / iPad</p>
                <p className="cobapns-pwa-ios-sub">3 langkah mudah</p>
              </div>
            </div>
            <ol className="cobapns-pwa-ios-steps">
              <li>
                <span className="cobapns-pwa-step-num">1</span>
                <span>
                  Ketuk ikon{" "}
                  <span className="cobapns-pwa-step-icon">
                    <Share size={14} />
                  </span>{" "}
                  <strong>Bagikan</strong> di Safari
                </span>
              </li>
              <li>
                <span className="cobapns-pwa-step-num">2</span>
                <span>
                  Pilih{" "}
                  <span className="cobapns-pwa-step-icon">
                    <Plus size={14} />
                  </span>{" "}
                  <strong>Tambah ke Layar Utama</strong>
                </span>
              </li>
              <li>
                <span className="cobapns-pwa-step-num">3</span>
                <span>
                  Ketuk <strong>Tambah</strong> — selesai! 🎉
                </span>
              </li>
            </ol>
            <button
              className="cobapns-pwa-btn-primary"
              onClick={() => setShowIOSSteps(false)}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Install Banner ── */}
      <div
        className={`cobapns-pwa-banner ${animating ? "cobapns-pwa-banner--visible" : ""}`}
        role="complementary"
        aria-label="Install COBA PNS"
        id="cobapns-install-prompt"
      >
        <button
          className="cobapns-pwa-close"
          onClick={handleDismiss}
          aria-label="Tutup"
        >
          <X size={14} />
        </button>

        <div className="cobapns-pwa-content">
          <Image
            src="/icon-cpns.png"
            alt="COBA PNS"
            width={44}
            height={44}
            className="cobapns-pwa-logo"
          />
          <div className="cobapns-pwa-text">
            <p className="cobapns-pwa-headline">Latihan Lebih Cepat di HP!</p>
            <p className="cobapns-pwa-desc">
              Install COBA PNS di layar utama Anda untuk akses instan ke Tryout
              dan Materi kapan saja.
            </p>
          </div>
        </div>

        <div className="cobapns-pwa-actions">
          <button
            className="cobapns-pwa-btn-ghost"
            onClick={handleDismiss}
          >
            Nanti Saja
          </button>
          <button
            className="cobapns-pwa-btn-primary"
            onClick={handleInstall}
          >
            <Download size={14} />
            Install Sekarang
          </button>
        </div>
      </div>
    </>
  )
}

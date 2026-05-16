"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react"

import { getStudentNotificationsAction, markAllNotificationsReadAction, markNotificationReadAction } from "@/app/actions/notifications"
import { getFirebaseRealtimeDatabaseUrl } from "@/lib/firebase-client"

type StudentNotification = {
  id: string
  title: string
  message: string
  ctaLabel: string | null
  ctaUrl: string | null
  createdAt: Date
  read: boolean
}

type RealtimeNotification = {
  id?: string
  title?: string
  message?: string
  ctaLabel?: string | null
  ctaUrl?: string | null
  createdAt?: string
}

const READ_STORAGE_KEY = "cobapns-read-notifications"

function getLocalReadIds() {
  if (typeof window === "undefined") return new Set<string>()
  try {
    return new Set(JSON.parse(window.localStorage.getItem(READ_STORAGE_KEY) ?? "[]") as string[])
  } catch {
    return new Set<string>()
  }
}

function saveLocalReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)))
}

function mergeReadState(items: StudentNotification[], current: StudentNotification[]) {
  const localReadIds = getLocalReadIds()
  const currentReadState = new Map(current.map((item) => [item.id, item.read]))

  return items
    .map((item) => ({
      ...item,
      read: localReadIds.has(item.id) || currentReadState.get(item.id) || item.read,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

function normalizeRealtimeNotifications(value: unknown, current: StudentNotification[]) {
  if (!value || typeof value !== "object") return []

  const items = Object.entries(value as Record<string, RealtimeNotification>).map(([key, item]) => ({
    id: item.id ?? key,
    title: item.title ?? "Notifikasi",
    message: item.message ?? "",
    ctaLabel: item.ctaLabel ?? null,
    ctaUrl: item.ctaUrl ?? null,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    read: false,
  }))

  return mergeReadState(items, current)
}

function formatRelative(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} hari lalu`
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notifications, setNotifications] = useState<StudentNotification[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError("")
    const result = await getStudentNotificationsAction()
    if (result.success) {
      setNotifications((current) => mergeReadState(result.notifications, current))
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (open) void fetchNotifications()
  }, [fetchNotifications, open])

  useEffect(() => {
    const databaseUrl = getFirebaseRealtimeDatabaseUrl()
    if (!databaseUrl) return

    fetch(`${databaseUrl}/notifications.json`)
      .then((response) => response.json())
      .then((data: unknown) => {
        setNotifications((current) => normalizeRealtimeNotifications(data, current))
        setError("")
        setLoading(false)
      })
      .catch(() => {})

    const stream = new EventSource(`${databaseUrl}/notifications.json`)
    const handleRealtimeEvent = (event: Event) => {
      const messageEvent = event as MessageEvent<string>
      if (!messageEvent.data) return
      const payload = JSON.parse(messageEvent.data) as { path?: string; data?: unknown }
      if (payload.data === undefined) return

      setNotifications((current) => {
        if (!payload.path || payload.path === "/") return normalizeRealtimeNotifications(payload.data, current)

        const id = payload.path.replace(/^\//, "").split("/")[0]
        if (!id) return current
        if (payload.data === null) return current.filter((item) => item.id !== id)

        const merged: Record<string, RealtimeNotification> = Object.fromEntries(
          current.map((item) => [item.id, { ...item, createdAt: item.createdAt.toISOString() }]),
        )
        merged[id] = { ...(merged[id] ?? {}), ...(payload.data as RealtimeNotification), id }
        return normalizeRealtimeNotifications(merged, current)
      })
      setError("")
      setLoading(false)
    }

    stream.addEventListener("put", handleRealtimeEvent)
    stream.addEventListener("patch", handleRealtimeEvent)
    stream.onmessage = handleRealtimeEvent
    stream.onerror = () => {
      setError("Gagal terhubung ke Firebase Realtime Database.")
      setLoading(false)
      stream.close()
    }

    return () => {
      stream.removeEventListener("put", handleRealtimeEvent)
      stream.removeEventListener("patch", handleRealtimeEvent)
      stream.close()
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markOne = async (id: string) => {
    const localReadIds = getLocalReadIds()
    localReadIds.add(id)
    saveLocalReadIds(localReadIds)
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item))
    await markNotificationReadAction(id)
  }

  const markAll = async () => {
    const localReadIds = getLocalReadIds()
    notifications.forEach((item) => localReadIds.add(item.id))
    saveLocalReadIds(localReadIds)
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    await markAllNotificationsReadAction()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
        aria-label="Buka notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">Notifikasi</p>
              <p className="text-[11px] font-medium text-slate-500">Info terbaru dari admin COBA PNS</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:underline">
                <CheckCheck className="w-3.5 h-3.5" /> Tandai semua
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {loading && (
              <div className="py-10 flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
            {!loading && error && (
              <div className="px-6 py-10 text-center">
                <Bell className="w-8 h-8 mx-auto text-red-200 mb-2" />
                <p className="text-sm font-bold text-red-600">{error}</p>
                <p className="text-xs text-slate-400 mt-1">Pastikan tabel notifikasi sudah dimigrasikan.</p>
              </div>
            )}
            {!loading && !error && notifications.length === 0 && (
              <div className="px-6 py-10 text-center">
                <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                <p className="text-sm font-bold text-slate-500">Belum ada notifikasi</p>
                <p className="text-xs text-slate-400 mt-1">Pengumuman admin akan tampil di sini.</p>
              </div>
            )}
            {!loading && !error && notifications.map((item) => (
              <div key={item.id} className={`px-4 py-3 ${item.read ? "bg-white" : "bg-blue-50/50"}`}>
                <button onClick={() => markOne(item.id)} className="w-full text-left">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.read ? "bg-slate-200" : "bg-brand-blue"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-slate-900 leading-snug">{item.title}</p>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatRelative(item.createdAt)}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed mt-1">{item.message}</p>
                    </div>
                  </div>
                </button>
                {item.ctaUrl && item.ctaLabel && (
                  <Link
                    href={item.ctaUrl}
                    onClick={() => markOne(item.id)}
                    className="ml-5 mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-[11px] font-black text-brand-blue hover:bg-blue-50 transition-colors"
                  >
                    {item.ctaLabel} <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

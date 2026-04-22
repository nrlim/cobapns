"use client"

import { useEffect } from "react"

export function ConsoleEasterEgg() {
  useEffect(() => {
    // Guard against repeated execution in React StrictMode
    const KEY = "__cobapns_console_shown__"
    const w = window as unknown as Record<string, unknown>
    if (w[KEY]) return
    w[KEY] = true

    const style = "color: #0D9488; font-size: 14px; font-weight: bold;"
    const dimStyle = "color: #94a3b8; font-size: 12px;"

    const lines = [
      "    ██████╗ ██████╗ ██████╗  █████╗     ██████╗ ███╗   ██╗███████╗",
      "   ██╔════╝██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗████╗  ██║██╔════╝",
      "   ██║     ██║   ██║██████╔╝███████║    ██████╔╝██╔██╗ ██║███████╗",
      "   ██║     ██║   ██║██╔══██╗██╔══██║    ██╔═══╝ ██║╚██╗██║╚════██║",
      "   ╚██████╗╚██████╔╝██████╔╝██║  ██║    ██║     ██║ ╚████║███████║",
      "    ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═══╝╚══════╝",
    ]

    console.log(
      "%cSelamat datang di konsol developer COBA PNS.\n\nKami mengapresiasi rasa ingin tahu Anda terhadap platform kami.\nSistem ini diawasi dan dilindungi secara ketat untuk menjamin\nkeamanan data dan integritas ujian seluruh peserta.\n\nJika Anda seorang Security Researcher dan menemukan potensi\nkerentanan, harap laporkan secara bertanggung jawab melalui:\n\n  \u2709\uFE0F  security@cobapns.com\n\nSalam Profesional,\nTim Engineering COBA PNS",
      style
    )
    // Log each line individually to guarantee proper rendering without join encoding issues
    lines.forEach(line => console.log("%c" + line, dimStyle))
  }, [])

  return null
}

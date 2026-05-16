"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, Download, X, Loader2, Layout, LayoutGrid, LayoutTemplate, CheckCircle2, XCircle, Trophy } from "lucide-react"
import { toPng, toBlob } from "html-to-image"


interface ScoreShareModalProps {
  data: {
    userName: string
    examTitle: string
    totalScore: number
    scoreTWK: number
    scoreTIU: number
    scoreTKP: number
    overallPass: boolean
  }
}

type Format = "story" | "square" | "wide"

const FORMATS = {
  story: { width: 360, height: 640, name: "Story (9:16)", icon: Layout },
  square: { width: 400, height: 400, name: "Square (1:1)", icon: LayoutGrid },
  wide: { width: 600, height: 337.5, name: "Wide (16:9)", icon: LayoutTemplate },
}

export function ScoreShareModal({ data }: ScoreShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<Format>("story")
  const [isExporting, setIsExporting] = useState(false)
  const [scale, setScale] = useState(1)

  const containerRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)

  // Calculate scale to fit preview in container
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      const currentFormat = FORMATS[format]
      
      // Allow 32px padding (16px each side)
      const padding = 32
      const scaleX = (width - padding) / currentFormat.width
      const scaleY = (height - padding) / currentFormat.height
      
      setScale(Math.min(scaleX, scaleY, 1))
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isOpen, format])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const handleExport = async (action: "download" | "share") => {
    if (!captureRef.current) return
    
    try {
      setIsExporting(true)
      
      const fileName = `coba-pns-score-${data.userName.replace(/\s+/g, '-').toLowerCase()}.png`

      if (action === "download") {
        const dataUrl = await toPng(captureRef.current, {
          quality: 1,
          pixelRatio: 3, 
          cacheBust: true,
        })
        const link = document.createElement("a")
        link.download = fileName
        link.href = dataUrl
        link.click()
      } else if (action === "share") {
        const blob = await toBlob(captureRef.current, {
          quality: 1,
          pixelRatio: 3, 
          cacheBust: true,
        })
        
        if (!blob) throw new Error("Gagal membuat gambar")
        
        const file = new File([blob], fileName, { type: "image/png" })
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Skor ${data.examTitle} - ${data.userName}`,
            text: `Saya baru saja menyelesaikan ${data.examTitle} di COBA PNS!`,
            files: [file]
          })
        } else {
          // Fallback to download if Web Share API doesn't support files
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.download = fileName
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error("Failed to export image:", error)
      alert("Gagal mengekspor gambar. Silakan coba lagi.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold text-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            <Share2 className="w-4 h-4" />
          </div>
          Pamerkan Skormu
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900">Bagikan Hasil</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Pilih format untuk social media</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              
              {/* Left/Top: Preview Container */}
              <div 
                ref={containerRef}
                className="flex-1 bg-slate-50 flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-100 min-h-[300px]"
              >
                <div className="absolute inset-0 dot-grid opacity-50" />
                
                {/* The actual exportable node */}
                <div 
                  style={{
                    width: FORMATS[format].width,
                    height: FORMATS[format].height,
                    transform: `scale(${scale})`,
                    transformOrigin: "center",
                  }}
                  className="relative z-10 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden transition-all duration-300 bg-white"
                >
                  <div ref={captureRef} className="w-full h-full bg-white relative">
                    <ScoreTemplate data={data} format={format} />
                  </div>
                </div>
              </div>

              {/* Right/Bottom: Controls */}
              <div className="w-full md:w-64 p-6 flex flex-col bg-white overflow-y-auto">
                <div className="space-y-6 flex-1">
                  
                  {/* Format Selection */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Format Gambar</h4>
                    <div className="space-y-2">
                      {(Object.entries(FORMATS) as [Format, typeof FORMATS["story"]][]).map(([key, f]) => {
                        const Icon = f.icon
                        const isActive = format === key
                        return (
                          <button
                            key={key}
                            onClick={() => setFormat(key)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${
                              isActive 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                            {f.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                </div>

                {/* Export Actions */}
                <div className="mt-6 space-y-3">
                  {typeof navigator !== "undefined" && !!navigator.canShare && (
                    <button
                      onClick={() => handleExport("share")}
                      disabled={isExporting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1E73BE] hover:bg-[#0F4FA8] text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-70"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                      Bagikan Langsung
                    </button>
                  )}
                  <button
                    onClick={() => handleExport("download")}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors disabled:opacity-70"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Download className="w-4 h-4" />}
                    Download PNG
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* --- Creative Score Templates --- */

function ScoreTemplate({ data, format }: { data: ScoreShareModalProps["data"], format: Format }) {
  const { userName, examTitle, totalScore, scoreTWK, scoreTIU, scoreTKP, overallPass } = data

  const BLUE      = "#1E73BE"
  const BLUE_DEEP = "#0F4FA8"
  const GREEN     = "#2DBE60"
  const GREEN_DIM = "#1A9B4B"

  const tagline = "Latihan Hari Ini, Lolos Besok"

  // Reusable dot-grid decoration (html-to-image safe — no CSS filters)
  const Deco = () => (
    <>
      <div style={{ position:"absolute", top:-90, right:-90, width:260, height:260, borderRadius:"50%", border:"32px solid rgba(255,255,255,0.08)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-80, left:-80, width:220, height:220, borderRadius:"50%", border:"20px solid rgba(45,190,96,0.15)", pointerEvents:"none" }} />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 7 }).map((_, c) => (
          <div key={`${r}-${c}`} style={{ position:"absolute", top: 48 + r*48, left: 24 + c*48, width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
        ))
      )}
    </>
  )

  /* ============================================================
     STORY  9:16  — single clean layout, no stacked cards
  ============================================================ */
  if (format === "story") {
    return (
      <div style={{
        width:"100%", height:"100%", position:"relative", overflow:"hidden",
        background: overallPass
          ? `linear-gradient(160deg, ${BLUE_DEEP} 0%, ${BLUE} 55%, ${GREEN_DIM} 100%)`
          : `linear-gradient(160deg, ${BLUE_DEEP} 0%, #172040 100%)`,
        fontFamily:"system-ui,-apple-system,sans-serif",
        display:"flex", flexDirection:"column",
      }}>
        <Deco />

        {/* Top bar — logo directly on gradient (no white box) */}
        <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"28px 26px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dashboard.png" alt="COBA PNS"
            style={{ height:38, width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)" }} />
          <span style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:20, padding:"5px 14px", color:"#fff", fontSize:10, fontWeight:800, letterSpacing:"0.14em" }}>
            SKD CPNS
          </span>
        </div>

        {/* Center hero */}
        <div style={{ position:"relative", zIndex:10, flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px" }}>

          {/* exam title */}
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8, textAlign:"center" }}>
            Hasil Try Out
          </p>
          <h2 style={{ color:"#fff", fontSize:21, fontWeight:900, textAlign:"center", lineHeight:1.25, letterSpacing:"-0.02em", margin:"0 0 36px" }}>
            {examTitle}
          </h2>

          {/* Score — full width, no card box */}
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:2, textAlign:"center" }}>
            Skor Total
          </p>
          <div style={{
            fontSize:108, fontWeight:900, lineHeight:1, letterSpacing:"-0.05em", color:"#fff", textAlign:"center",
            textShadow: overallPass ? `0 0 48px ${GREEN}` : "none",
          }}>
            {totalScore}
          </div>
          {/* Accent line under score */}
          <div style={{ width:72, height:4, borderRadius:4, margin:"14px 0 36px", background: overallPass ? GREEN : "rgba(255,255,255,0.3)" }} />

          {/* Status */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background: overallPass ? "rgba(45,190,96,0.18)" : "rgba(239,68,68,0.18)",
            border: `1.5px solid ${overallPass ? "rgba(45,190,96,0.45)" : "rgba(239,68,68,0.45)"}`,
            borderRadius:30, padding:"8px 20px", marginBottom:40,
          }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background: overallPass ? GREEN : "#ef4444" }} />
            <span style={{ fontSize:11, fontWeight:900, letterSpacing:"0.1em", color: overallPass ? "#4ade80" : "#fca5a5" }}>
              {overallPass ? "LULUS PASSING GRADE 🎉" : "TETAP SEMANGAT 💪"}
            </span>
          </div>

          {/* Sub-scores — inline, no separate cards */}
          <div style={{ display:"flex", alignItems:"center", gap:0, width:"100%" }}>
            {[
              { l:"TWK", s:scoreTWK, c:"#93c5fd" },
              { l:"TIU", s:scoreTIU, c:"#c4b5fd" },
              { l:"TKP", s:scoreTKP, c: overallPass ? "#86efac" : "#fdba74" },
            ].map((item, i) => (
              <div key={item.l} style={{ flex:1, textAlign:"center", padding:"0 4px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                <p style={{ color:item.c, fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:5 }}>{item.l}</p>
                <p style={{ color:"#fff", fontSize:32, fontWeight:900, lineHeight:1, letterSpacing:"-0.03em" }}>{item.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — on gradient, always readable */}
        <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 26px 28px", gap:3 }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>
            {tagline}
          </p>
          <p style={{ color:"#fff", fontSize:13, fontWeight:900, letterSpacing:"0.14em", textTransform:"uppercase" }}>
            COBAPNS.COM
          </p>
        </div>
      </div>
    )
  }

  /* ============================================================
     SQUARE  1:1  — editorial split, minimal framing
  ============================================================ */
  if (format === "square") {
    return (
      <div style={{
        width:"100%", height:"100%", position:"relative", overflow:"hidden",
        background: overallPass
          ? `linear-gradient(135deg, ${BLUE_DEEP} 0%, ${BLUE} 60%, ${GREEN_DIM} 100%)`
          : `linear-gradient(135deg, ${BLUE_DEEP} 0%, #172040 100%)`,
        fontFamily:"system-ui,-apple-system,sans-serif",
        display:"flex", flexDirection:"column", padding:"26px 28px",
      }}>
        <Deco />

        {/* Top row */}
        <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dashboard.png" alt="COBA PNS"
            style={{ height:30, width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)" }} />
          <div style={{
            background: overallPass ? "rgba(45,190,96,0.18)" : "rgba(239,68,68,0.18)",
            border: `1px solid ${overallPass ? "rgba(45,190,96,0.4)" : "rgba(239,68,68,0.4)"}`,
            borderRadius:20, padding:"5px 14px",
          }}>
            <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.1em", color: overallPass ? "#4ade80" : "#fca5a5" }}>
              {overallPass ? "✓ LULUS" : "✕ BELUM LULUS"}
            </span>
          </div>
        </div>

        {/* Middle: two column layout */}
        <div style={{ position:"relative", zIndex:10, flex:1, display:"flex", alignItems:"center", gap:24 }}>

          {/* Left: text info */}
          <div style={{ flex:1 }}>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:7 }}>
              Hasil Try Out
            </p>
            <h2 style={{ color:"#fff", fontSize:19, fontWeight:900, lineHeight:1.25, letterSpacing:"-0.02em", margin:"0 0 6px" }}>
              {examTitle}
            </h2>
            <p style={{ color: overallPass ? "#86efac" : "rgba(255,255,255,0.55)", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:24 }}>
              {userName}
            </p>

            {/* Sub-scores inline */}
            <div style={{ display:"flex", gap:0 }}>
              {[
                { l:"TWK", s:scoreTWK, c:"#93c5fd" },
                { l:"TIU", s:scoreTIU, c:"#c4b5fd" },
                { l:"TKP", s:scoreTKP, c: overallPass ? "#86efac" : "#fdba74" },
              ].map((item, i) => (
                <div key={item.l} style={{ flex:1, textAlign:"center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                  <p style={{ color:item.c, fontSize:9, fontWeight:900, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:4 }}>{item.l}</p>
                  <p style={{ color:"#fff", fontSize:24, fontWeight:900, lineHeight:1 }}>{item.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: score circle */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{
              width:120, height:120,
              borderRadius:"50%",
              border: `2.5px solid ${overallPass ? "rgba(45,190,96,0.5)" : "rgba(255,255,255,0.2)"}`,
              background:"rgba(255,255,255,0.08)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              boxShadow: overallPass ? `0 0 40px rgba(45,190,96,0.3)` : "none",
            }}>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:8, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:2 }}>TOTAL</p>
              <p style={{ color:"#fff", fontSize:44, fontWeight:900, lineHeight:1, letterSpacing:"-0.04em" }}>{totalScore}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:18, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            {tagline}
          </p>
          <p style={{ color:"#fff", fontSize:11, fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase" }}>
            COBAPNS.COM
          </p>
        </div>
      </div>
    )
  }

  /* ============================================================
     WIDE  16:9  — horizontal, score as the hero on the right
  ============================================================ */
  return (
    <div style={{
      width:"100%", height:"100%", position:"relative", overflow:"hidden",
      background: overallPass
        ? `linear-gradient(135deg, ${BLUE_DEEP} 0%, ${BLUE} 55%, ${GREEN_DIM} 100%)`
        : `linear-gradient(135deg, ${BLUE_DEEP} 0%, #172040 100%)`,
      fontFamily:"system-ui,-apple-system,sans-serif",
      display:"flex", alignItems:"stretch", padding:"28px 32px", gap:28,
    }}>
      <Deco />

      {/* Left col: brand + exam info */}
      <div style={{ position:"relative", zIndex:10, flex:1.5, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dashboard.png" alt="COBA PNS"
            style={{ height:32, width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)", marginBottom:22 }} />
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>Hasil Try Out</p>
          <h2 style={{ color:"#fff", fontSize:22, fontWeight:900, lineHeight:1.2, letterSpacing:"-0.02em", margin:"0 0 5px" }}>{examTitle}</h2>
          <p style={{ color: overallPass ? "#86efac" : "rgba(255,255,255,0.55)", fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>{userName}</p>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background: overallPass ? "rgba(45,190,96,0.18)" : "rgba(239,68,68,0.18)",
            border: `1.5px solid ${overallPass ? "rgba(45,190,96,0.45)" : "rgba(239,68,68,0.4)"}`,
            borderRadius:30, padding:"6px 18px",
          }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: overallPass ? GREEN : "#ef4444" }} />
            <span style={{ fontSize:10, fontWeight:900, letterSpacing:"0.1em", color: overallPass ? "#4ade80" : "#fca5a5" }}>
              {overallPass ? "LULUS PASSING GRADE" : "BELUM LULUS"}
            </span>
          </div>
        </div>
        <div>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>{tagline}</p>
          <p style={{ color:"#fff", fontSize:12, fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:2 }}>COBAPNS.COM</p>
        </div>
      </div>

      {/* Center col: sub-scores inline (no cards) */}
      <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", justifyContent:"center", gap:0, alignSelf:"center" }}>
        {[
          { l:"TWK", s:scoreTWK, c:"#93c5fd" },
          { l:"TIU", s:scoreTIU, c:"#c4b5fd" },
          { l:"TKP", s:scoreTKP, c: overallPass ? "#86efac" : "#fdba74" },
        ].map((item, i) => (
          <div key={item.l} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
            <span style={{ color:item.c, fontSize:10, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", minWidth:32 }}>{item.l}</span>
            <span style={{ color:"#fff", fontSize:28, fontWeight:900, lineHeight:1, letterSpacing:"-0.02em", minWidth:52 }}>{item.s}</span>
          </div>
        ))}
      </div>

      {/* Right col: big score circle */}
      <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", paddingLeft:8 }}>
        <div style={{
          width:148, height:148, borderRadius:"50%",
          border: `2.5px solid ${overallPass ? "rgba(45,190,96,0.5)" : "rgba(255,255,255,0.2)"}`,
          background:"rgba(255,255,255,0.08)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          boxShadow: overallPass ? `0 0 48px rgba(45,190,96,0.35)` : "0 0 32px rgba(0,0,0,0.2)",
        }}>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:8, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:2 }}>SKOR</p>
          <p style={{ color:"#fff", fontSize:50, fontWeight:900, lineHeight:1, letterSpacing:"-0.04em" }}>{totalScore}</p>
        </div>
      </div>
    </div>
  )
}
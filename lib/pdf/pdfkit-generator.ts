/**
 * COBA PNS — Professional PDF Report Generator (Redesigned)
 * Clean, information-rich layout with modern design language.
 * Pure Node.js / PDFKit — no React reconciler conflicts.
 */

// Use require() for CJS module — avoids ES module default-export wrapping issues
// with Next.js serverExternalPackages
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require("pdfkit");
import { Writable } from "stream";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  teal:      "#1E73BE",
  tealDark:  "#0F4FA8",
  tealDeep:  "#0F4FA8",
  tealLight: "#2A8BD6",
  tealFaint: "#e0eeff",
  white:     "#FFFFFF",
  slate900:  "#0F172A",
  slate800:  "#1E293B",
  slate600:  "#475569",
  slate400:  "#94A3B8",
  slate200:  "#E2E8F0",
  slate50:   "#F8FAFC",
  green:     "#16A34A",
  greenLight:"#DCFCE7",
  red:       "#DC2626",
  redLight:  "#FEE2E2",
  amber:     "#D97706",
  amberLight:"#FEF3C7",
  indigo:    "#4F46E5",
  indigoLight:"#EEF2FF",
};

// A4 points
const W = 595.28;
const H = 841.89;
const M = 36; // margin
const IW = W - M * 2; // inner width

// ─── Utilities ────────────────────────────────────────────────────────────────
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function fill(doc: typeof PDFDocument, hex: string) { doc.fillColor(rgb(hex)); return doc; }
function stroke(doc: typeof PDFDocument, hex: string) { doc.strokeColor(rgb(hex)); return doc; }

function rRect(doc: typeof PDFDocument, x: number, y: number, w: number, h: number, r: number, fillHex: string, strokeHex?: string) {
  doc.roundedRect(x, y, w, h, r);
  if (strokeHex) doc.fillAndStroke(rgb(fillHex), rgb(strokeHex));
  else           doc.fill(rgb(fillHex));
}

function bar(doc: typeof PDFDocument, x: number, y: number, w: number, h: number, pct: number, color: string) {
  rRect(doc, x, y, w, h, h / 2, C.slate200);
  if (pct > 0) rRect(doc, x, y, Math.max(h, (pct / 100) * w), h, h / 2, color);
}

function dateFmt(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

function hr(doc: typeof PDFDocument, y: number, color = C.slate200) {
  stroke(doc, color);
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.5).stroke();
}

function sectionHead(doc: typeof PDFDocument, text: string, y: number) {
  fill(doc, C.tealDeep);
  doc
    .fontSize(7)
    .font("Helvetica-Bold")
    .text(text.toUpperCase(), M, y, { characterSpacing: 1.4, width: IW });
  hr(doc, y + 14, C.tealLight);
  return y + 22;
}

function kv(doc: typeof PDFDocument, label: string, value: string, x: number, y: number, w: number) {
  fill(doc, C.slate400);
  doc.fontSize(6.5).font("Helvetica").text(label.toUpperCase(), x, y, { width: w, characterSpacing: 0.8 });
  fill(doc, C.slate800);
  doc.fontSize(9).font("Helvetica-Bold").text(value, x, y + 9, { width: w });
}

function badge(doc: typeof PDFDocument, x: number, y: number, text: string, bgHex: string, textHex: string) {
  const tw  = doc.fontSize(7).widthOfString(text) + 16;
  rRect(doc, x, y, tw, 14, 3, bgHex);
  fill(doc, textHex);
  doc.fontSize(7).font("Helvetica-Bold").text(text, x, y + 3.5, { width: tw, align: "center" });
  return tw;
}

export function streamToBuffer(doc: typeof PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); cb(); },
    });
    sink.on("finish", () => resolve(Buffer.concat(chunks)));
    sink.on("error", reject);
    doc.pipe(sink);
  });
}

// ─── SHARED HEADER ────────────────────────────────────────────────────────────
function drawPageHeader(doc: typeof PDFDocument, opts: any) {
  const { badge: badgeText, title, subtitle, userName, reportLabel, date, color = C.teal } = opts;
  const hh = 108;

  rRect(doc, 0, 0, W, hh, 0, color);

  fill(doc, C.tealDark);
  doc.rect(0, hh - 4, W, 4).fill();

  fill(doc, C.white);
  doc.fillOpacity(0.18).roundedRect(M, 14, 160, 13, 3).fill().fillOpacity(1);
  fill(doc, C.white);
  doc.fontSize(6.5).font("Helvetica-Bold")
     .text(badgeText.toUpperCase(), M + 8, 17.5, { width: 148, characterSpacing: 1 });

  fill(doc, C.white);
  doc.fontSize(19).font("Helvetica-Bold").text(title, M, 32, { width: 320 });

  fill(doc, C.white);
  doc.fillOpacity(0.72).fontSize(8).font("Helvetica").text(subtitle, M, 56, { width: 320 });
  doc.fillOpacity(1);

  const rx = W - M - 148;
  fill(doc, C.white);
  doc.fillOpacity(0.55).fontSize(6.5).font("Helvetica").text("DISIAPKAN UNTUK", rx, 16, { width: 148, align: "right" });
  doc.fillOpacity(1).fontSize(9.5).font("Helvetica-Bold").text(userName, rx, 26, { width: 148, align: "right" });

  fill(doc, C.white);
  doc.fillOpacity(0.55).fontSize(6.5).font("Helvetica").text("JENIS LAPORAN", rx, 46, { width: 148, align: "right" });
  doc.fillOpacity(1).fontSize(8).font("Helvetica-Bold").text(reportLabel, rx, 56, { width: 148, align: "right" });

  fill(doc, C.white);
  doc.fillOpacity(0.55).fontSize(6.5).font("Helvetica").text("DIBUAT PADA", rx, 72, { width: 148, align: "right" });
  doc.fillOpacity(1).fontSize(8).font("Helvetica-Bold").text(date, rx, 82, { width: 148, align: "right" });

  fill(doc, C.slate200);
  doc.fontSize(6.5).font("Helvetica")
     .text("Dokumen Resmi COBA PNS  ·  Rahasia & Tidak Untuk Disebarluaskan", 0, H - 22, { width: W, align: "center" });

  return hh + 8;
}

// ─── TRYOUT PDF ───────────────────────────────────────────────────────────────
export interface TryoutReportData {
  userName: string
  tier: "ELITE" | "MASTER"
  examTitle: string
  submittedAt: string
  scoreTWK: number; scoreTIU: number; scoreTKP: number; totalScore: number
  passTWK: boolean; passTIU: boolean; passTKP: boolean; overallPass: boolean
  passingTWK: number; passingTIU: number; passingTKP: number
  narrative: { headline: string; details: string[]; recommendation: string }
  examHistory?: Array<{
    examTitle: string; submittedAt: string; totalScore: number; overallPass: boolean
  }>
}

export async function generateTryoutPDF(data: TryoutReportData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });
  const buf = streamToBuffer(doc);

  let y = drawPageHeader(doc, {
    badge:       "Laporan Hasil Try Out SKD",
    title:       "Try Out Report",
    subtitle:    "Simulasi Computer Assisted Test — Standar Ambang Batas BKN",
    userName:    data.userName,
    reportLabel: data.tier === "MASTER" ? "Comprehensive Analysis" : "Summary Report",
    date:        dateFmt(new Date().toISOString()),
  });

  y = sectionHead(doc, "Informasi Ujian", y);
  rRect(doc, M, y, IW, 44, 6, C.slate50, C.slate200);

  kv(doc, "Nama Try Out", data.examTitle, M + 10, y + 6, 230);
  kv(doc, "Dikerjakan", dateFmt(data.submittedAt), M + 256, y + 6, 160);

  const passText = data.overallPass ? "LULUS SKD" : "BELUM LULUS";
  const passBg   = data.overallPass ? C.greenLight : C.redLight;
  const passTx   = data.overallPass ? C.green : C.red;
  
  // Align precisely to the right edge of the card (IW - margin)
  fill(doc, C.slate400); 
  doc.fontSize(6.5).font("Helvetica").text("STATUS KELULUSAN", M, y + 8, { width: IW - 10, align: "right" });
  
  const bw2 = doc.fontSize(7).widthOfString(passText) + 16;
  badge(doc, M + IW - bw2 - 10, y + 18, passText, passBg, passTx);
  y += 60;

  y = sectionHead(doc, "Ringkasan Nilai", y);

  const CW = (IW - 9) / 4;
  const cards = [
    { label: "TOTAL SKOR",  value: data.totalScore, sub: "TWK + TIU + TKP", hex: C.teal,  pass: null },
    { label: "TWK",         value: data.scoreTWK,   sub: `min. ${data.passingTWK}`,         hex: data.passTWK ? C.green : C.red, pass: data.passTWK },
    { label: "TIU",         value: data.scoreTIU,   sub: `min. ${data.passingTIU}`,         hex: data.passTIU ? C.green : C.red, pass: data.passTIU },
    { label: "TKP",         value: data.scoreTKP,   sub: `min. ${data.passingTKP}`,         hex: data.passTKP ? C.green : C.red, pass: data.passTKP },
  ];

  cards.forEach((c, i) => {
    const cx = M + i * (CW + 3);
    const cardH = 76; // increased height to avoid badge overlap
    rRect(doc, cx, y, CW, cardH, 6, C.white, C.slate200);
    rRect(doc, cx, y, CW, 4, 0, c.hex);
    
    fill(doc, C.slate400);
    doc.fontSize(7).font("Helvetica").text(c.label, cx + 6, y + 12, { width: CW - 12, align: "center" });
    
    fill(doc, c.hex);
    doc.fontSize(24).font("Helvetica-Bold").text(String(c.value), cx + 6, y + 26, { width: CW - 12, align: "center" });
    
    if (c.pass !== null) {
      fill(doc, C.slate400);
      doc.fontSize(7).font("Helvetica").text(c.sub, cx + 6, y + 46, { width: CW - 12, align: "center" });
      
      const bText = c.pass ? "LULUS" : "GAGAL";
      const bBg   = c.pass ? C.greenLight : C.redLight;
      const bTx   = c.pass ? C.green : C.red;
      const bw    = doc.fontSize(7).widthOfString(bText) + 16;
      rRect(doc, cx + (CW - bw) / 2, y + 56, bw, 13, 3, bBg);
      fill(doc, bTx);
      doc.fontSize(7).font("Helvetica-Bold").text(bText, cx + (CW - bw) / 2, y + 59.5, { width: bw, align: "center" });
    } else {
      // Total Skor card has no badge, so center the sub text lower
      fill(doc, C.slate400);
      doc.fontSize(7).font("Helvetica").text(c.sub, cx + 6, y + 52, { width: CW - 12, align: "center" });
    }
  });
  y += 92;

  y = sectionHead(doc, "Perbandingan Nilai dengan Ambang Batas", y);
  rRect(doc, M, y, IW, 82, 6, C.slate50, C.slate200);

  const barData = [
    { label: "TWK", score: data.scoreTWK, passing: data.passingTWK, max: 150,  pass: data.passTWK },
    { label: "TIU", score: data.scoreTIU, passing: data.passingTIU, max: 175,  pass: data.passTIU },
    { label: "TKP", score: data.scoreTKP, passing: data.passingTKP, max: 225,  pass: data.passTKP },
  ];

  barData.forEach((b, i) => {
    const by       = y + 12 + i * 22;
    const barColor = b.pass ? C.green : C.red;
    const barW     = IW - 130;
    const barX     = M + 42;

    fill(doc, C.slate800);
    doc.fontSize(8).font("Helvetica-Bold").text(b.label, M + 8, by + 1, { width: 32 });
    fill(doc, C.slate400);
    doc.fontSize(7).font("Helvetica").text(`${b.score} / ${b.max}`, M + 8, by + 11, { width: 32 });
    bar(doc, barX, by + 3, barW, 9, (b.score / b.max) * 100, barColor);

    const markerX = barX + (b.passing / b.max) * barW;
    stroke(doc, C.slate800);
    doc.moveTo(markerX, by).lineTo(markerX, by + 15).lineWidth(1.2).stroke();
    fill(doc, C.slate600);
    doc.fontSize(6).font("Helvetica").text(`min ${b.passing}`, markerX - 10, by - 7, { width: 36 });

    badge(doc, M + IW - 72, by, b.pass ? "LULUS" : "GAGAL", b.pass ? C.greenLight : C.redLight, b.pass ? C.green : C.red);
  });
  y += 98;

  y = sectionHead(doc, "Analisis & Rekomendasi", y);

  // Dynamic height calculation
  let currentY = y + 10;
  const headlineH = doc.fontSize(9.5).font("Helvetica-Bold").heightOfString(data.narrative.headline, { width: IW - 24 });
  currentY += headlineH + 6; // Move past headline

  // Sum heights of all bullet points
  data.narrative.details.forEach(d => {
    const dHeight = doc.fontSize(8).font("Helvetica").heightOfString(d, { width: IW - 36 });
    currentY += dHeight + 6;
  });

  currentY += 16; // hr spacing
  const recH = doc.fontSize(8).font("Helvetica").heightOfString(data.narrative.recommendation, { width: IW - 24 });
  currentY += recH + 16;

  const narH = currentY - y; // Total dynamic height

  rRect(doc, M, y, IW, narH, 6, C.tealFaint, C.tealLight);
  fill(doc, C.tealDeep);
  doc.fontSize(9.5).font("Helvetica-Bold").text(data.narrative.headline, M + 12, y + 10, { width: IW - 24 });
  
  let ny = y + 10 + headlineH + 6;
  data.narrative.details.forEach(d => {
    fill(doc, C.teal); doc.fontSize(9).font("Helvetica-Bold").text("-", M + 12, ny);
    fill(doc, C.slate800); doc.fontSize(8).font("Helvetica").text(d, M + 24, ny, { width: IW - 36 });
    const dH2 = doc.heightOfString(d, { width: IW - 36 });
    ny += dH2 + 6;
  });

  hr(doc, ny + 4, C.tealLight);
  fill(doc, C.tealDeep);
  doc.fontSize(7.5).font("Helvetica-Bold").text("Saran:", M + 12, ny + 10);
  fill(doc, C.slate800);
  doc.fontSize(8).font("Helvetica").text(data.narrative.recommendation, M + 12, ny + 22, { width: IW - 24 });
  
  y += narH + 14;

  if (data.tier === "MASTER" && (data.examHistory?.length || 0) > 0) {
    if (y > H - 200) { doc.addPage(); y = M; }
    y = sectionHead(doc, "Riwayat Try Out — 10 Terakhir", y);

    rRect(doc, M, y, IW, 20, 4, C.tealDeep);
    fill(doc, C.white);
    doc.fontSize(7.5).font("Helvetica-Bold")
       .text("NAMA TRY OUT",  M + 8,          y + 6, { width: IW * 0.46 })
       .text("TANGGAL",       M + IW * 0.51,  y + 6, { width: IW * 0.20, align: "center" })
       .text("SKOR",          M + IW * 0.74,  y + 6, { width: IW * 0.12, align: "right" })
       .text("STATUS",        M + IW * 0.88,  y + 6, { width: IW * 0.12, align: "center" });
    y += 22;

    data.examHistory?.slice(0, 10).forEach((row, i) => {
      if (i % 2 === 0) rRect(doc, M, y, IW, 18, 0, C.white);
      else             rRect(doc, M, y, IW, 18, 0, C.slate50);
      hr(doc, y + 18);
      fill(doc, C.slate800);
      doc.fontSize(7.5).font("Helvetica-Bold").text(row.examTitle, M + 8, y + 5, { width: IW * 0.45, ellipsis: true });
      fill(doc, C.slate600);
      doc.fontSize(7).font("Helvetica").text(dateFmt(row.submittedAt), M + IW * 0.51, y + 5, { width: IW * 0.20, align: "center" });
      fill(doc, C.slate800);
      doc.fontSize(8).font("Helvetica-Bold").text(String(row.totalScore), M + IW * 0.74, y + 5, { width: IW * 0.12, align: "right" });
      badge(doc, M + IW * 0.88 + (IW * 0.12 - 40) / 2, y + 2,
        row.overallPass ? "LULUS" : "GAGAL",
        row.overallPass ? C.greenLight : C.redLight,
        row.overallPass ? C.green : C.red);
      y += 18;
    });
    y += 10;
  }

  hr(doc, y + 4);
  fill(doc, C.slate400);
  doc.fontSize(7).font("Helvetica").text(
    "Laporan dihasilkan otomatis oleh sistem COBA PNS. Hasil bersifat indikatif dan tidak menggantikan proses seleksi resmi PNS/BKN.",
    M, y + 10, { width: IW, align: "center" }
  );

  doc.end();
  return buf;
}

// ─── IQ PDF ───────────────────────────────────────────────────────────────────
export interface IQReportData {
  userName: string
  totalIQ: number
  interpretation: string
  iqBandAdvice: string
  verbalRaw: number; numericRaw: number; logicRaw: number; spatialRaw: number
  verbalTime: number; numericTime: number; logicTime: number; spatialTime: number
  completedAt: string
}

export async function generateIQPDF(data: IQReportData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const buf = streamToBuffer(doc);

  let y = drawPageHeader(doc, {
    badge:       "Laporan Profil Kognitif & Kecerdasan",
    title:       "Cognitive Intelligence Report",
    subtitle:    "Tes Kecerdasan Multi-Dimensi — Standar Psikometri Internasional (Mean 100, SD 15)",
    userName:    data.userName,
    reportLabel: "Master Cognitive Analysis",
    date:        dateFmt(new Date().toISOString()),
  });

  y = sectionHead(doc, "Skor IQ Terstandarisasi", y);

  const cx = M + 58, cy = y + 52;
  fill(doc, C.teal); doc.circle(cx, cy, 46).fill();
  fill(doc, C.white);
  doc.fontSize(30).font("Helvetica-Bold").text(String(data.totalIQ), cx - 46, cy - 20, { width: 92, align: "center" });
  doc.fontSize(8).font("Helvetica").fillOpacity(0.8).text("IQ SCORE", cx - 46, cy + 14, { width: 92, align: "center" });
  doc.fillOpacity(1);

  const tx = M + 118;
  fill(doc, C.teal);
  doc.fontSize(16).font("Helvetica-Bold").text(data.interpretation, tx, y + 6, { width: 200 });
  fill(doc, C.slate800);
  doc.fontSize(8).font("Helvetica").text(data.iqBandAdvice, tx, y + 28, { width: 220, lineGap: 2.5 });
  fill(doc, C.slate400);
  doc.fontSize(7).font("Helvetica").text("Norma: Mean = 100 · SD = 15 · Populasi Nasional", tx, y + 68, { width: 220 });

  const IQ_SCALE = [
    { min: 130, label: "Sangat Superior",    color: "#14B8A6" },
    { min: 120, label: "Superior",           color: "#1E73BE" },
    { min: 110, label: "Di Atas Rata-rata",  color: "#0F4FA8" },
    { min: 90,  label: "Rata-rata",          color: "#64748B" },
    { min: 80,  label: "Di Bawah Rata-rata", color: "#94A3B8" },
    { min: 0,   label: "Perlu Peningkatan",  color: "#CBD5E1" },
  ];

  const sx = W - M - 130;
  IQ_SCALE.forEach((band, i) => {
    const isActive = band.label === data.interpretation;
    const by = y + 4 + i * 15;
    rRect(doc, sx, by, 128, 13, 3, isActive ? C.teal : C.slate50);
    if (isActive) {
      fill(doc, C.white);
      doc.fontSize(7.5).font("Helvetica-Bold").text(`${band.min}+  ${band.label}`, sx + 8, by + 3, { width: 112 });
    } else {
      fill(doc, C.slate400);
      doc.fontSize(7).font("Helvetica").text(`${band.min}+  ${band.label}`, sx + 8, by + 3, { width: 112 });
    }
  });
  y += 108;

  y = sectionHead(doc, "Detail Skor Per Sub-Tes", y);

  const subTests = [
    { label: "Verbal",   raw: data.verbalRaw,  total: 15, time: data.verbalTime  },
    { label: "Numerik",  raw: data.numericRaw, total: 12, time: data.numericTime },
    { label: "Logika",   raw: data.logicRaw,   total: 14, time: data.logicTime   },
    { label: "Spasial",  raw: data.spatialRaw, total: 12, time: data.spatialTime },
  ];

  const scw = (IW - 9) / 4;
  subTests.forEach((st, i) => {
    const pct      = Math.round((st.raw / st.total) * 100);
    const barColor = pct >= 75 ? C.green : pct >= 50 ? C.amber : C.red;
    const cx2      = M + i * (scw + 3);

    rRect(doc, cx2, y, scw, 72, 6, C.white, C.slate200);
    rRect(doc, cx2, y, scw, 3, 0, barColor);
    fill(doc, C.slate600);
    doc.fontSize(7.5).font("Helvetica-Bold").text(st.label.toUpperCase(), cx2 + 6, y + 8, { width: scw - 12, align: "center", characterSpacing: 0.8 });
    fill(doc, barColor);
    doc.fontSize(22).font("Helvetica-Bold").text(String(st.raw), cx2 + 6, y + 18, { width: scw - 12, align: "center" });
    fill(doc, C.slate400);
    doc.fontSize(8).font("Helvetica").text(`/ ${st.total}`, cx2 + 6, y + 42, { width: scw - 12, align: "center" });
    bar(doc, cx2 + 8, y + 54, scw - 16, 7, pct, barColor);
    fill(doc, barColor);
    doc.fontSize(7).font("Helvetica-Bold").text(`${pct}%`, cx2 + 6, y + 63, { width: scw - 12, align: "center" });
  });
  y += 88;

  rRect(doc, M, y, IW, 30, 6, C.slate50, C.slate200);
  fill(doc, C.slate400);
  doc.fontSize(7).font("Helvetica-Bold").text("WAKTU PENGERJAAN", M + 8, y + 5, { characterSpacing: 0.8 });
  subTests.forEach((st, i) => {
    const tx2 = M + 8 + i * (IW / 4);
    const mins  = Math.floor(st.time / 60);
    const secs  = st.time % 60;
    fill(doc, C.slate600);
    doc.fontSize(7).font("Helvetica").text(st.label, tx2, y + 16, { width: IW / 4 - 8 });
    fill(doc, C.slate800);
    doc.fontSize(8).font("Helvetica-Bold").text(`${mins}m ${secs}s`, tx2 + 40, y + 16, { width: 50 });
  });
  y += 44;

  y = sectionHead(doc, "Analisis Profil Kognitif", y);

  const narratives = subTests.map(st => {
    const pct = (st.raw / st.total) * 100;
    const lvl = pct >= 85 ? { label: "Sangat Baik",             icon: "●" }
              : pct >= 65 ? { label: "Cukup Baik",              icon: "○" }
              :             { label: "Perlu Perhatian Khusus",   icon: "△" };
    const advice = pct >= 85
      ? `Lanjutkan dengan latihan soal tingkat lanjut untuk mempertahankan keunggulan.`
      : pct >= 65
      ? `Latihan rutin 20–30 menit/hari akan meningkatkan performa secara signifikan.`
      : `Intensifkan latihan mendasar. Gunakan fitur Drill Mode di platform COBA PNS.`;
    return { label: st.label, level: lvl, advice };
  });

  const narBoxH = narratives.length * 28 + 16;
  rRect(doc, M, y, IW, narBoxH, 6, C.tealFaint, C.tealLight);

  narratives.forEach((n, i) => {
    const ny = y + 10 + i * 28;
    fill(doc, C.teal);
    doc.fontSize(8.5).font("Helvetica-Bold").text(n.level.icon, M + 10, ny);
    fill(doc, C.tealDeep);
    doc.fontSize(8.5).font("Helvetica-Bold").text(n.label, M + 22, ny, { width: 70 });
    const lLvl = n.level.label;
    const lBg  = lLvl === "Sangat Baik" ? C.greenLight : lLvl === "Cukup Baik" ? C.amberLight : C.redLight;
    const lTx  = lLvl === "Sangat Baik" ? C.green : lLvl === "Cukup Baik" ? C.amber : C.red;
    badge(doc, M + 98, ny - 1, lLvl, lBg, lTx);
    fill(doc, C.slate600);
    doc.fontSize(7.5).font("Helvetica").text(n.advice, M + 22, ny + 13, { width: IW - 34 });
  });
  y += narBoxH + 12;

  hr(doc, y);
  fill(doc, C.slate400);
  doc.fontSize(7).font("Helvetica").text(
    "Skor IQ bersifat indikatif berdasarkan tes internal platform COBA PNS dan tidak setara dengan tes psikologi klinis resmi.",
    M, y + 8, { width: IW, align: "center" }
  );

  doc.end();
  return buf;
}

// ─── PSYCHOLOGY PDF ───────────────────────────────────────────────────────────
export interface PsychReportData {
  userName: string
  personalityType: string
  personalityTagline: string
  personalityDescription: string
  strengths: string[]
  growthAreas: string[]
  openness: number; conscientiousness: number; extraversion: number
  agreeableness: number; neuroticism: number
  integrity: number; stressResilience: number; teamwork: number
  careerPositions: string[]
  careerInstansi: string[]
  careerRationale: string
  iqScore?: number
  iqInterpretation?: string
  completedAt: string
}

export async function generatePsychometricPDF(data: PsychReportData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const buf = streamToBuffer(doc);

  let y = drawPageHeader(doc, {
    badge:       "Laporan Psikometri & Pemetaan Karir PNS",
    title:       "Psychometric Full Profile",
    subtitle:    "Tes Kepribadian Big Five + Dimensi ASN & Career Mapping",
    userName:    data.userName,
    reportLabel: "Master Full Profile",
    date:        dateFmt(new Date().toISOString()),
  });

  y = sectionHead(doc, "Tipe Kepribadian", y);

  const heroH = 78;
  rRect(doc, M, y, IW, heroH, 8, C.tealFaint, C.tealLight);
  rRect(doc, M + 8, y + 8, 84, heroH - 16, 6, C.teal);

  fill(doc, C.white);
  doc.fontSize(20).font("Helvetica-Bold").text(data.personalityType, M + 8, y + 20, { width: 84, align: "center" });
  doc.fillOpacity(0.75).fontSize(7).font("Helvetica").text("TIPE", M + 8, y + 44, { width: 84, align: "center" });
  doc.fillOpacity(1);

  fill(doc, C.tealDeep);
  doc.fontSize(13.5).font("Helvetica-Bold").text(data.personalityTagline, M + 102, y + 8, { width: IW - 116 });
  fill(doc, C.slate800);
  doc.fontSize(8).font("Helvetica").text(data.personalityDescription, M + 102, y + 28, { width: IW - 116, lineGap: 2 });

  if (data.iqScore) {
    rRect(doc, M + 102, y + 62, 180, 10, 3, C.tealLight);
    fill(doc, C.tealDeep);
    doc.fontSize(7).font("Helvetica-Bold")
       .text(`Skor IQ: ${data.iqScore}  (${data.iqInterpretation ?? "—"})`, M + 106, y + 64, { width: 172 });
  }
  y += heroH + 14;

  y = sectionHead(doc, "Profil Kepribadian Big Five", y);

  const bigFive = [
    { label: "Keterbukaan (Openness)",           value: Math.round(data.openness),              desc: "Keinginan belajar & pengalaman baru" },
    { label: "Kedisiplinan (Conscientiousness)",  value: Math.round(data.conscientiousness),     desc: "Keteraturan, keandalan, dan kontrol diri" },
    { label: "Ekstraversi (Extraversion)",        value: Math.round(data.extraversion),          desc: "Energi sosial dan keterbukaan" },
    { label: "Keramahan (Agreeableness)",         value: Math.round(data.agreeableness),         desc: "Empati, kooperatif, dan kepercayaan" },
    { label: "Stabilitas Emosi",                  value: Math.round(100 - data.neuroticism),     desc: "Ketenangan & ketahanan emosional" },
  ];

  const bfH = bigFive.length * 26 + 14;
  rRect(doc, M, y, IW, bfH, 6, C.white, C.slate200);

  bigFive.forEach((d, i) => {
    const by = y + 10 + i * 26;
    const barColor = d.value >= 70 ? C.teal : d.value >= 45 ? C.amber : C.red;

    fill(doc, C.slate800);
    doc.fontSize(8).font("Helvetica-Bold").text(d.label, M + 10, by, { width: 186 });
    fill(doc, C.slate400);
    doc.fontSize(6.5).font("Helvetica").text(d.desc, M + 10, by + 10, { width: 186 });
    bar(doc, M + 204, by + 2, IW - 248, 9, d.value, barColor);
    fill(doc, barColor);
    doc.fontSize(8.5).font("Helvetica-Bold").text(`${d.value}%`, M + IW - 38, by + 1, { width: 36, align: "right" });
  });
  y += bfH + 14;

  y = sectionHead(doc, "Dimensi Kompetensi Khusus ASN", y);

  const asn = [
    { label: "INTEGRITAS",      value: Math.round(data.integrity),        desc: "Kejujuran, akuntabilitas, dan kesesuaian nilai." },
    { label: "KETAHANAN STRES", value: Math.round(data.stressResilience), desc: "Kemampuan tetap efektif di bawah tekanan." },
    { label: "KERJA TIM",       value: Math.round(data.teamwork),         desc: "Kolaborasi, koordinasi, dan kontribusi tim." },
  ];

  const acw = (IW - 8) / 3;
  asn.forEach((d, i) => {
    const ax  = M + i * (acw + 4);
    const col = d.value >= 70 ? C.green : d.value >= 50 ? C.amber : C.red;
    const bgc = d.value >= 70 ? C.greenLight : d.value >= 50 ? C.amberLight : C.redLight;

    rRect(doc, ax, y, acw, 60, 6, bgc);
    fill(doc, col);
    doc.fontSize(7).font("Helvetica-Bold").text(d.label, ax + 8, y + 8, { width: acw - 16, align: "center", characterSpacing: 1 });
    doc.fontSize(26).font("Helvetica-Bold").text(`${d.value}%`, ax + 4, y + 18, { width: acw - 8, align: "center" });
    fill(doc, C.slate600);
    doc.fontSize(6.5).font("Helvetica").text(d.desc, ax + 6, y + 48, { width: acw - 12, align: "center" });
  });
  y += 76;

  const colW = (IW - 8) / 2;
  const strH = Math.max(data.strengths.length, data.growthAreas.length) * 20 + 28;

  y = sectionHead(doc, "Keunggulan & Area Pengembangan", y);
  rRect(doc, M, y, colW, strH, 6, C.white, C.slate200);
  fill(doc, C.green);
  doc.fontSize(7.5).font("Helvetica-Bold").text("✓ KEUNGGULAN UTAMA", M + 8, y + 8, { characterSpacing: 0.8 });
  data.strengths.forEach((s, i) => {
    fill(doc, C.green); doc.fontSize(8).font("Helvetica-Bold").text("✓", M + 10, y + 22 + i * 20);
    fill(doc, C.slate800); doc.fontSize(8).font("Helvetica").text(s, M + 22, y + 22 + i * 20, { width: colW - 30 });
  });

  const gx = M + colW + 8;
  rRect(doc, gx, y, colW, strH, 6, C.white, C.slate200);
  fill(doc, C.amber);
  doc.fontSize(7.5).font("Helvetica-Bold").text("→ AREA PENGEMBANGAN", gx + 8, y + 8, { characterSpacing: 0.8 });
  data.growthAreas.forEach((g, i) => {
    fill(doc, C.amber); doc.fontSize(8).font("Helvetica-Bold").text("→", gx + 10, y + 22 + i * 20);
    fill(doc, C.slate800); doc.fontSize(8).font("Helvetica").text(g, gx + 24, y + 22 + i * 20, { width: colW - 32 });
  });
  y += strH + 12;

  doc.addPage();

  rRect(doc, 0, 0, W, 64, 0, C.tealDeep);
  fill(doc, C.white);
  doc.fontSize(16).font("Helvetica-Bold").text("Career Mapping Report", M, 16);
  doc.fillOpacity(0.7).fontSize(8).font("Helvetica").text("Rekomendasi Jabatan & Instansi PNS", M, 38);
  doc.fillOpacity(1).fontSize(8.5).font("Helvetica-Bold").text(data.userName, W - M - 160, 36, { width: 160, align: "right" });
  fill(doc, C.slate200);
  doc.fontSize(6.5).font("Helvetica").text("Dokumen Resmi COBA PNS  ·  Rahasia", 0, H - 22, { width: W, align: "center" });

  y = 76;

  y = sectionHead(doc, "Metodologi Rekomendasi", y);
  rRect(doc, M, y, IW, 36, 6, C.slate50, C.slate200);
  fill(doc, C.slate800);
  doc.fontSize(8.5).font("Helvetica").text(data.careerRationale, M + 12, y + 10, { width: IW - 24, lineGap: 2 });
  y += 50;

  y = sectionHead(doc, "Formasi Jabatan yang Direkomendasikan", y);

  rRect(doc, M, y, IW, 20, 4, C.tealDeep);
  fill(doc, C.white);
  doc.fontSize(7.5).font("Helvetica-Bold")
     .text("NO",     M + 8,         y + 6, { width: 22 })
     .text("JABATAN", M + 36,       y + 6, { width: IW * 0.55 })
     .text("KATEGORI",M + IW * 0.72,y + 6, { width: IW * 0.28 });
  y += 22;

  data.careerPositions.forEach((pos, i) => {
    rRect(doc, M, y, IW, 20, 0, i % 2 === 0 ? C.white : C.slate50);
    hr(doc, y + 20);
    fill(doc, C.slate400); doc.fontSize(8).font("Helvetica").text(`${i + 1}.`, M + 8, y + 6, { width: 22 });
    fill(doc, C.slate800); doc.fontSize(8).font("Helvetica-Bold").text(pos, M + 36, y + 6, { width: IW * 0.55 });
    fill(doc, C.slate600); doc.fontSize(7.5).font("Helvetica").text("Teknis / Administrasi", M + IW * 0.72, y + 6, { width: IW * 0.28 });
    y += 20;
  });
  y += 16;

  y = sectionHead(doc, "Instansi yang Direkomendasikan", y);

  let tagX = M, tagY = y;
  data.careerInstansi.forEach(inst => {
    const tw = doc.fontSize(8.5).widthOfString(inst) + 22;
    if (tagX + tw > W - M) { tagX = M; tagY += 24; }
    rRect(doc, tagX, tagY, tw, 18, 4, C.tealFaint, C.tealLight);
    fill(doc, C.tealDeep);
    doc.fontSize(8.5).font("Helvetica-Bold").text(inst, tagX + 11, tagY + 4.5, { width: tw - 22 });
    tagX += tw + 8;
  });
  y = tagY + 32;

  y = sectionHead(doc, "Langkah Persiapan yang Disarankan", y);

  const steps = [
    { n: "01", text: "Pelajari materi SKB sesuai jabatan yang dituju menggunakan fitur Learning Hub COBA PNS." },
    { n: "02", text: "Tingkatkan dimensi kepribadian yang masih berkembang melalui refleksi dan latihan harian." },
    { n: "03", text: "Ikuti Try Out intensif secara konsisten untuk meningkatkan skor SKD." },
    { n: "04", text: "Pantau pengumuman PNS resmi di sscasn.bkn.go.id dan cermati formasi yang sesuai profil Anda." },
  ];

  const stepH = steps.length * 28 + 14;
  rRect(doc, M, y, IW, stepH, 6, C.tealFaint, C.tealLight);
  steps.forEach((s, i) => {
    const sy = y + 10 + i * 28;
    rRect(doc, M + 10, sy, 22, 18, 4, C.teal);
    fill(doc, C.white);
    doc.fontSize(8).font("Helvetica-Bold").text(s.n, M + 10, sy + 5, { width: 22, align: "center" });
    fill(doc, C.slate800);
    doc.fontSize(8.5).font("Helvetica").text(s.text, M + 40, sy + 5, { width: IW - 52, lineGap: 1.5 });
  });
  y += stepH + 14;

  hr(doc, y);
  fill(doc, C.slate400);
  doc.fontSize(7).font("Helvetica").text(
    "Rekomendasi jabatan & instansi bersifat indikatif. COBA PNS tidak menjamin ketersediaan formasi atau kelulusan dalam seleksi resmi.",
    M, y + 8, { width: IW, align: "center" }
  );

  doc.end();
  return buf;
}

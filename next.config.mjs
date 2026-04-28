/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  transpilePackages: ["recharts"],
  serverExternalPackages: ["pdfkit"],

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "**.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "**.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },

  async headers() {
    // ─── Content Security Policy ───────────────────────────────────────────────
    // Designed for Next.js + YouTube (nocookie) + Unsplash + Google Fonts.
    // 'unsafe-inline' is required for Next.js JSON-LD scripts (dangerouslySetInnerHTML).
    const csp = [
      "default-src 'self'",
      // Scripts: self + Next.js inline hydration + analytics (add yours here)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + Google Fonts inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Unsplash + Google user content + YouTube thumbnails + data URIs
      "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://*.ytimg.com https://i.pravatar.cc",
      // Iframes: only YouTube Privacy-Enhanced Mode
      "frame-src 'self' https://www.youtube-nocookie.com",
      // Connections: self + your API base + Midtrans
      "connect-src 'self' https://cobapns.com https://*.cobapns.com https://api.midtrans.com https://app.midtrans.com",
      // Media: self only
      "media-src 'self'",
      // Objects: none
      "object-src 'none'",
      // Base URI: restrict to self to prevent base-tag injection
      "base-uri 'self'",
      // Form actions: self only
      "form-action 'self'",
      // Frame ancestors: prevent clickjacking
      "frame-ancestors 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // ── Existing headers ──────────────────────────────────────────────
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          // ── NEW: HTTP Strict Transport Security (HSTS) ────────────────────
          // max-age=31536000 = 1 year. Enables full HSTS score in PageSpeed.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // ── NEW: Cross-Origin-Opener-Policy (COOP) ────────────────────────
          // Isolates browsing context to prevent Spectre attacks.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // ── NEW: Cross-Origin-Resource-Policy (CORP) ─────────────────────
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          // ── NEW: Permissions Policy ───────────────────────────────────────
          // Disable features not used by this app.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()" },
          // ── NEW: Content Security Policy ──────────────────────────────────
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // Cache static assets for 1 year
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache Next.js static chunks for 1 year
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

};

export default nextConfig;

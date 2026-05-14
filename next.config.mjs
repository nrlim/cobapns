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
      // Scripts: self + Next.js inline hydration + analytics + Midtrans
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.midtrans.com https://app.sandbox.midtrans.com",
      // Styles: self + Google Fonts inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Unsplash + Google user content + YouTube thumbnails + data URIs
      "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://*.ytimg.com https://i.pravatar.cc",
      // Iframes: self + YouTube Privacy-Enhanced Mode + Midtrans Snap
      "frame-src 'self' https://www.youtube-nocookie.com https://app.midtrans.com https://app.sandbox.midtrans.com",
      // Connections: self + your API base + Midtrans
      "connect-src 'self' https://cobapns.com https://*.cobapns.com https://api.midtrans.com https://app.midtrans.com https://api.sandbox.midtrans.com https://app.sandbox.midtrans.com",
      // Media: self only
      "media-src 'self'",
      // Objects: none
      "object-src 'none'",
      // Base URI: restrict to self to prevent base-tag injection
      "base-uri 'self'",
      // Form actions: self only
      "form-action 'self'",
      // NOTE: frame-ancestors intentionally omitted — adding 'self' would block
      // Instagram IAB, Facebook IAB, TikTok WebView, and other social media browsers
      // from rendering the page when users click links in those apps.
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // ── Existing headers ──────────────────────────────────────────────
          { key: "X-Content-Type-Options",  value: "nosniff" },
          // NOTE: X-Frame-Options SAMEORIGIN removed — it blocks Instagram IAB, Facebook
          // WebView, TikTok WebView, and other social media in-app browsers from rendering.
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          // ── HTTP Strict Transport Security (HSTS) ────────────────────────────
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // ── Cross-Origin-Opener-Policy (COOP) ───────────────────────────────
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // ── Cross-Origin-Resource-Policy (CORP) ─────────────────────────────
          // cross-origin allows social media WebViews to load our JS/CSS resources
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          // ── Permissions Policy ───────────────────────────────────────────────
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=()" },
          // ── Content Security Policy ──────────────────────────────────────────
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // ── Strategy: HTML pages MUST revalidate on every request ────────────────
        // This ensures users ALWAYS get the latest HTML after a deploy.
        // "no-cache" doesn't mean "never cache" — it means "always ask the server
        // if there's a newer version before using the cached copy" (via ETag/Last-Modified).
        // This is the correct solution for the "user sees old broken page after deploy" problem.
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf|otf)).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, must-revalidate",
          },
        ],
      },
      {
        // ── Strategy: Static assets = cache 1 year, immutable ────────────────────
        // Safe because Next.js gives every file a content hash in its filename.
        // When we deploy, the filename CHANGES, so browsers auto-bust the cache.
        // Example: app-abc123.js → app-def456.js on next deploy.
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Public images/fonts — also safe to cache long-term
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // ── Auth & Dashboard pages: additionally mark as private ──────────────────
        // "private" tells CDNs/proxies NOT to cache these pages (only browser can).
        // "no-store" for dashboard is stronger — don't even write to disk cache.
        source: "/(login|register)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, must-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/(dashboard|admin)(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },

};

export default nextConfig;

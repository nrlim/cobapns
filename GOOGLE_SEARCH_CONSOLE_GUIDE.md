# Panduan Lengkap Setup Google Search Console (GSC)

Google Search Console adalah alat gratis dari Google yang membantu Anda memantau, mempertahankan, dan memecahkan masalah kehadiran situs Anda di hasil Pencarian Google. Berikut adalah langkah-langkah detail untuk menghubungkan **COBA PNS** ke GSC.

---

## 1. Masuk ke Google Search Console
1. Buka [Google Search Console](https://search.google.com/search-console/about).
2. Login menggunakan akun Google (Gmail) yang akan digunakan untuk mengelola website.

## 2. Tambahkan Properti Baru
Setelah login, Anda akan melihat dua pilihan untuk menambahkan properti:

### A. Domain (Direkomendasikan)
*   **Input:** `cobapns.com`
*   **Kelebihan:** Mencakup semua subdomain (www, non-www, m, dll) dan semua protokol (http, https).
*   **Verifikasi:** Memerlukan akses ke DNS provider (seperti Cloudflare, Niagahoster, atau IDCloudHost).

### B. Awalan URL (URL Prefix)
*   **Input:** `https://cobapns.com`
*   **Kelebihan:** Lebih mudah diverifikasi dengan banyak metode (upload file HTML, meta tag, Google Analytics).
*   **Verifikasi:** Hanya mencakup URL yang diawali dengan protokol tersebut.

---

## 3. Metode Verifikasi

### Metode 1: Lewat DNS (Untuk tipe "Domain")
1. Pilih tipe **Domain**.
2. Google akan memberikan kode TXT (contoh: `google-site-verification=xxxx`).
3. Masuk ke panel kontrol domain Anda (misal: Cloudflare).
4. Tambahkan record DNS baru:
   *   **Type:** `TXT`
   *   **Name:** `@` atau kosong.
   *   **Content:** Tempelkan kode dari Google tadi.
5. Tunggu beberapa menit, lalu klik **Verifikasi** di GSC.

### Metode 2: HTML Tag (Untuk tipe "Awalan URL")
Jika Anda tidak bisa akses DNS, gunakan metode ini:
1. Pilih tipe **Awalan URL**.
2. Pilih metode **Tag HTML**.
3. Copy kode meta tag yang diberikan (contoh: `<meta name="google-site-verification" content="xxxx" />`).
4. Buka file `app/layout.tsx` di project ini.
5. Tempelkan kode tersebut di dalam tag `<head>`.
6. Deploy website, lalu klik **Verifikasi** di GSC.

---

## 4. Submit Sitemap
Setelah berhasil verifikasi, hal pertama yang harus dilakukan adalah memberitahu Google daftar halaman website Anda.
1. Di menu kiri GSC, klik **Sitemaps**.
2. Di kolom "Tambahkan sitemap baru", ketik: `sitemap.xml`
3. Klik **Kirim**.
4. Google akan mulai memproses antrean indexing website Anda.

---

## 5. Minta Indexing Manual (Opsional tapi Disarankan)
Jika Anda baru saja mengupdate halaman (seperti saat kita mengupdate SEO tadi), Anda bisa mempercepat indexing:
1. Di kolom pencarian bagian atas GSC, masukkan URL utama: `https://cobapns.com`.
2. Klik **Minta Pengindeksan** (Request Indexing).
3. Google akan memprioritaskan halaman tersebut untuk segera di-crawl.

---

## 6. Tips Agar Cepat Ranking #1
*   **Pantau Core Web Vitals:** Pastikan skor performa website tetap hijau (cepat diakses).
*   **Cek Mobile Usability:** Google sangat mengutamakan website yang nyaman dibuka di HP.
*   **Backlink:** Bagikan link website Anda ke media sosial atau blog lain untuk meningkatkan otoritas domain.
*   **Konten Berkualitas:** Pastikan deskripsi di dalam website relevan dengan apa yang dicari orang (misal: "Latihan Soal CPNS 2024").

---

**Butuh bantuan lebih lanjut?**
Silakan tanya saya jika ada kendala saat melakukan langkah-langkah di atas!

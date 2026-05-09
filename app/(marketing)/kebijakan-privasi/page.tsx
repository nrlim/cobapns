import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | COBA PNS",
  description: "Kebijakan Privasi COBA PNS",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="pt-24 pb-20 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter mb-8">Kebijakan Privasi COBA PNS</h1>
        
        <div className="prose prose-lg dark:prose-invert text-on-surface-variant">
          <p>
            Kepercayaan Anda adalah prioritas kami. Kebijakan Privasi ini menjelaskan bagaimana COBA PNS mengumpulkan, menggunakan, dan melindungi data pribadi Anda.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">1. Data yang Kami Kumpulkan</h2>
          <p className="mb-4">
            Kami mengumpulkan data yang Anda berikan secara langsung, seperti:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Informasi Identitas:</strong> Nama lengkap, alamat email, dan nomor telepon.</li>
            <li><strong>Informasi Akademik:</strong> Minat instansi atau formasi untuk personalisasi simulasi ujian.</li>
            <li><strong>Data Penggunaan:</strong> Riwayat pengerjaan soal, skor tryout, dan durasi belajar untuk analisis progress.</li>
          </ul>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">2. Penggunaan Data</h2>
          <p className="mb-4">
            Data Anda digunakan untuk:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Menyediakan fitur Diagnostic Modules (menyesuaikan materi berdasarkan kelemahan Anda).</li>
            <li>Mengirimkan notifikasi pembaruan materi atau info lowongan PNS terbaru.</li>
            <li>Memproses transaksi pembayaran paket layanan secara aman.</li>
          </ul>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">3. Perlindungan Data (Sistem Keamanan)</h2>
          <p>
            Kami menggunakan enkripsi tingkat tinggi dan standar keamanan server terkini untuk melindungi data Anda dari akses yang tidak sah. Kami berkomitmen untuk tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga manapun untuk tujuan pemasaran.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">4. Integrasi Pihak Ketiga</h2>
          <p>
            COBA PNS menggunakan layanan pihak ketiga yang terpercaya untuk pemrosesan pembayaran (Payment Gateway) dan pengiriman email (SMTP). Pihak-pihak ini hanya memiliki akses ke data Anda sejauh yang diperlukan untuk menjalankan fungsinya.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">5. Hak Pengguna</h2>
          <p>
            Anda berhak untuk mengakses, memperbarui, atau meminta penghapusan data akun Anda melalui pengaturan profil di dashboard COBA PNS.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">6. Kontak Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi tim dukungan kami melalui menu bantuan di platform COBA PNS.
          </p>
        </div>
      </div>
    </div>
  );
}

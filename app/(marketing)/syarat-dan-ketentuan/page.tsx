import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan | COBA PNS",
  description: "Syarat dan Ketentuan Layanan COBA PNS",
};

export default function SyaratDanKetentuanPage() {
  return (
    <div className="pt-24 pb-20 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter mb-8">Syarat dan Ketentuan Layanan COBA PNS</h1>
        
        <div className="prose prose-lg dark:prose-invert text-on-surface-variant">
          <p>
            Selamat datang di COBA PNS. Sebelum menggunakan layanan kami, harap baca Syarat dan Ketentuan ini dengan saksama. Dengan mengakses atau menggunakan platform COBA PNS, Anda setuju untuk terikat oleh ketentuan di bawah ini.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">1. Definisi Layanan</h2>
          <p>
            COBA PNS adalah platform digital yang menyediakan fasilitas belajar mandiri, latihan soal (Tryout), dan materi persiapan seleksi calon aparatur sipil negara. Layanan ini dikelola secara profesional untuk membantu persiapan ujian Anda.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">2. Akun Pengguna</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Anda wajib memberikan informasi yang akurat dan lengkap saat melakukan pendaftaran.</li>
            <li>Keamanan akun dan kata sandi sepenuhnya menjadi tanggung jawab pengguna.</li>
            <li>Satu akun COBA PNS hanya boleh digunakan oleh satu pengguna. Penggunaan satu akun secara bersama-sama atau aktivitas berbagi akun dapat mengakibatkan penangguhan layanan secara permanen tanpa pengembalian dana.</li>
          </ul>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">3. Hak Kekayaan Intelektual (Eksklusivitas Konten)</h2>
          <p className="mb-4">
            Berbeda dengan platform lain, COBA PNS menekankan pada orisinalitas konten:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Semua materi, soal ujian, video, dan grafis di platform COBA PNS adalah milik eksklusif kami atau pemberi lisensi kami.</li>
            <li>Pengguna dilarang keras menyalin, menyebarluaskan, atau menjual kembali konten COBA PNS tanpa izin tertulis. Tindakan pembajakan akan ditindak tegas melalui jalur hukum.</li>
          </ul>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">4. Transaksi dan Pengembalian Dana</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pembelian paket (Elite atau Master) bersifat final.</li>
            <li>Kami tidak menyediakan kebijakan pengembalian dana (refund) setelah akses materi atau tryout diberikan, kecuali terjadi kendala teknis dari sisi kami yang mengakibatkan layanan tidak dapat diakses sama sekali dalam jangka waktu lama.</li>
          </ul>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">5. Batasan Tanggung Jawab</h2>
          <p>
            COBA PNS merupakan sarana pendukung belajar. Kami tidak memberikan jaminan kelulusan mutlak dalam ujian PNS yang sesungguhnya karena hasil akhir sepenuhnya bergantung pada usaha, kemampuan, dan strategi masing-masing individu.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mt-10 mb-4">6. Perubahan Ketentuan</h2>
          <p>
            Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui dashboard pengguna atau email resmi COBA PNS.
          </p>
        </div>
      </div>
    </div>
  );
}

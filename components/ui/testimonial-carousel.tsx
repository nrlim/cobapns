"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  quote: string;
  image: string;
  bgColor: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Andi Setiawan",
    role: "Lulus CPNS Kemenkumham",
    quote: "Sumpah, tryoutnya mirip banget sama CAT aslinya! Sempet deg-degan tapi karena sering latihan di COBACPNS jadi lancar pas hari H.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-blue-100"
  },
  {
    id: 2,
    name: "Siti Aminah",
    role: "Lulus CPNS Pemprov Jatim",
    quote: "Materinya gampang dipahami. Fitur analisanya bantu aku banget tau kelemahanku di TIU. Alhamdulilah akhirnya bisa tembus passing grade tinggi.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-green-100"
  },
  {
    id: 3,
    name: "Rizky Pratama",
    role: "Lulus CPNS Kemenag",
    quote: "Belajar jadi ngga bosen. Pembahasannya lengkap banget step-by-step. Terimakasih COBACPNS udah jadi teman belajar setahun terakhir.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-yellow-100"
  },
  {
    id: 4,
    name: "Dewi Lestari",
    role: "Lulus CPNS BKN",
    quote: "Paling suka sama simulasi waktunya. Bener-bener melatih mental buat ngerjain soal dengan cepat dan tepat. Recommended banget!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-red-100"
  },
  {
    id: 5,
    name: "Bagas Mulyadi",
    role: "Lulus CPNS Pemkot Bandung",
    quote: "Awalnya ragu, tapi setelah coba paket Elite, nilaiku naik drastis. Grafik performa bener-bener ngebantu buat tau kelemahan di TKP.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-indigo-100"
  },
  {
    id: 6,
    name: "Putri Anjani",
    role: "Lulus CPNS Kemenkeu",
    quote: "Soal-soalnya up-to-date banget! Banyak materi dari COBACPNS yang keluar persis saat tes asli. Sangat membantu persiapan aku.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-pink-100"
  },
  {
    id: 7,
    name: "Hendra Wijaya",
    role: "Lulus CPNS Kemenhub",
    quote: "Sistem ranking nasional bikin makin semangat belajar. Setiap kali TO, pengen banget ngejar posisi di atas. Seru dan kompetitif!",
    image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-orange-100"
  },
  {
    id: 8,
    name: "Ayu Puspita",
    role: "Lulus CPNS Pemprov Jateng",
    quote: "E-book strateginya juara. Tips dan trik jawab TWK bener-bener membuka wawasan yang selama ini aku bingung cara memahaminya.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-teal-100"
  },
  {
    id: 9,
    name: "Dika Pratama",
    role: "Lulus CPNS Mahkamah Agung",
    quote: "Gak rugi ambil Master Strategy. Video lesson-nya gampang dipahami buat orang awam kaya aku. Sekarang aku bangga pakai seragam!",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    bgColor: "bg-gray-200"
  }
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
        
        if (isEnd) {
          // Reset to beginning
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll to next item (approx 340px + gap)
          const scrollAmount = clientWidth > 640 ? 364 : clientWidth * 0.85; 
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000); // 4 seconds interval

    return () => clearInterval(interval);
  }, []);

  // Update active index based on scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    
    // Estimate active index based on scroll position
    const cardWidth = clientWidth > 640 ? 364 : clientWidth * 0.85;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, testimonials.length - 1));
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const cardWidth = clientWidth > 640 ? 364 : clientWidth * 0.85;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  return (
    <div className="w-full">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {testimonials.map((testi) => (
          <div key={testi.id} className="w-[85vw] sm:w-[300px] md:w-[340px] snap-center shrink-0 bg-surface-container-lowest p-8 rounded-3xl shadow border border-outline-variant/10 relative flex flex-col justify-between h-full">
            <div>
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 ${testi.bgColor} rounded-full flex items-center justify-center overflow-hidden`}>
                  <Image src={testi.image} alt={testi.name} width={56} height={56} className="object-cover" unoptimized />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{testi.name}</h4>
                  <p className="text-xs text-green-600 font-medium">{testi.role}</p>
                </div>
              </div>
              <p className="text-on-secondary-container italic">
                &quot;{testi.quote}&quot;
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bullets */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeIndex === idx 
                ? "bg-primary w-6" 
                : "bg-surface-container-highest hover:bg-primary/50"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

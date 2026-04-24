"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Quote, Star } from "lucide-react";

export type DynamicTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string | null;
  tags: string[];
  rating: number;
};

export function TestimonialCarousel({ testimonials }: { testimonials: DynamicTestimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scrollTo = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const { clientWidth, scrollWidth } = scrollRef.current;
    
    // Exact card width calculation based on CSS (340px width + 24px gap = 364px)
    const cardWidth = clientWidth > 640 ? 364 : clientWidth * 0.85;
    
    // If the entire track fits in the container, we don't strictly need to scroll
    // but we can still update the bullet point.
    if (scrollWidth <= clientWidth) {
      setActiveIndex(index);
      return;
    }

    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (testimonials.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % testimonials.length;
        scrollTo(next);
        return next;
      });
    }, 3500); // 3.5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, isHovered, scrollTo]);

  // Sync scroll manually if user swipes
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    if (scrollWidth <= clientWidth) return;
    
    const cardWidth = clientWidth > 640 ? 364 : clientWidth * 0.85;
    const index = Math.round(scrollLeft / cardWidth);
    
    // Update bullet to match manual swipe position
    if (index >= 0 && index < testimonials.length) {
      setActiveIndex(index);
    }
  };

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div 
      className="w-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {testimonials.map((testi, idx) => {
          const isActive = idx === activeIndex;
          return (
          <div 
            key={testi.id} 
            className={`w-[85vw] sm:w-[300px] md:w-[340px] snap-center shrink-0 p-8 rounded-3xl relative flex flex-col justify-between h-full transition-all duration-500 ease-out border
              ${isActive 
                ? "bg-white shadow-2xl shadow-slate-200/50 border-[#1E73BE]/20 scale-100 opacity-100 z-10" 
                : "bg-slate-50 shadow-sm border-slate-200/60 scale-90 opacity-50 z-0 hover:opacity-80 hover:scale-95"
              }
            `}
          >
            <div>
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[#1E73BE]/10" />
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden font-bold text-slate-500`}>
                  {testi.image ? (
                    <Image src={testi.image} alt={testi.name} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className="text-xl">{testi.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{testi.name}</h4>
                  <p className="text-xs text-[#2DBE60] font-medium">{testi.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testi.rating ? "fill-[#2DBE60] text-[#2DBE60]" : "fill-slate-200 text-slate-200"}`} 
                  />
                ))}
              </div>
              <p className="text-on-secondary-container italic mb-4 line-clamp-4">
                &quot;{testi.quote}&quot;
              </p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {testi.tags?.map((t, i) => (
                  <span key={i} className="text-[10px] font-bold bg-[#2DBE60]/10 text-[#2DBE60] px-2 py-1 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Pagination Bullets */}
      <div className="flex justify-center gap-2 mt-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeIndex === idx 
                ? "bg-[#1E73BE] w-6" 
                : "bg-slate-200 hover:bg-[#1E73BE]/50"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

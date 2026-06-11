import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { getActiveHeroSlides, getSiteSettings } from "@/lib/queries";
import { useLang, pickField } from "@/lib/i18n";

export default function HeroCarousel() {
  const { lang } = useLang();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: slides = [] } = useQuery({
    queryKey: ["hero_slides"],
    queryFn: getActiveHeroSlides,
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["site_settings"],
    queryFn: getSiteSettings,
  });

  const intervalSec = Math.max(2, parseInt(settings.hero_interval || "5", 10) || 5);
  const count = slides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % Math.max(1, count)), [count]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + Math.max(1, count)) % Math.max(1, count)), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(next, intervalSec * 1000);
    return () => clearInterval(t);
  }, [paused, count, intervalSec, next]);

  // 슬라이드 인덱스가 범위를 벗어나면 보정 (슬라이드 삭제 시)
  useEffect(() => {
    if (current >= count && count > 0) setCurrent(0);
  }, [count, current]);

  if (count === 0) return null;

  const slide = slides[Math.min(current, count - 1)];

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Slide images (cross-fade) */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: `url('${s.image_url}')`, opacity: i === Math.min(current, count - 1) ? 1 : 0 }}
        />
      ))}
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20 pt-40">
        {/* Controls */}
        {count > 1 && (
          <div className="flex items-center gap-3 mb-8 text-white/90">
            <button
              onClick={prev}
              className="p-1.5 hover:bg-white/15 rounded-full transition-colors"
              aria-label="Previous slide"
              data-testid="hero-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPaused(!paused)}
              className="p-1.5 hover:bg-white/15 rounded-full transition-colors"
              aria-label={paused ? "Play" : "Pause"}
              data-testid="hero-pause"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={next}
              className="p-1.5 hover:bg-white/15 rounded-full transition-colors"
              aria-label="Next slide"
              data-testid="hero-next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-sm tracking-widest ml-1" data-testid="hero-index">
              {Math.min(current, count - 1) + 1} / {count}
            </span>
          </div>
        )}

        {/* Text */}
        <div key={slide.id} className="page-enter max-w-4xl">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight whitespace-pre-line"
            data-testid="text-hero-title"
          >
            {pickField(slide, "headline", lang)}
          </h1>
          <div className="space-y-2">
            {pickField(slide, "sub_lines", lang).split("\n").map((line, i) =>
              line.trim() ? (
                <p key={i} className="text-base sm:text-lg text-white/90 leading-relaxed">
                  {line.trim()}
                </p>
              ) : null
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

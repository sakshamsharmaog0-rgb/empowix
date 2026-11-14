import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const totalScrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // Show button after scrolling approximately 350px down
      if (currentScrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate smooth percentage for the ambient progress ring
      if (totalScrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalScrollHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  // SVG circular progress calculation
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
    >
      <div className="relative group">
        {/* Tooltip */}
        <div
          role="tooltip"
          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-neutral-950/95 text-neutral-200 text-[10px] font-semibold tracking-wider uppercase rounded-md border border-neutral-800 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap translate-y-1 group-hover:translate-y-0"
        >
          Back to top
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-950 rotate-45 border-r border-b border-neutral-800" />
        </div>

        {/* Circular Button */}
        <button
          onClick={scrollToTop}
          type="button"
          aria-label="Back to top"
          className="relative w-12 h-12 rounded-full bg-neutral-950/90 backdrop-blur-md text-neutral-300 hover:text-white border border-neutral-700/80 hover:border-amber-400 shadow-xl hover:shadow-amber-500/10 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          {/* Subtle Progress Ring SVG */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-neutral-800"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-amber-400 transition-[stroke-dashoffset] duration-150 ease-out"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Upward Arrow Icon */}
          <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 text-neutral-300 group-hover:text-amber-400" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Heart,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Instagram,
  Facebook,
  Globe,
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { AssetImage } from './AssetImage';

interface HeroProps {
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

// 4 Signature Color Themes exactly mirroring the Pinterest reference video transitions:
// Reference 1: Obsidian Charcoal Black -> Reference 2: Radiant Amber Orange -> Reference 3: Cool Platinum Silver -> Reference 4: Crimson Carmine Red
interface ThemeConfig {
  id: string;
  productId: string;
  name: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  taglineFloor: string;
  bgGradient: string;
  ambientGlow: string;
  accentColor: string;
  accentHex: string;
  sizes: string[];
}

const HERO_THEMES: ThemeConfig[] = [
  {
    id: 'theme-obsidian',
    productId: 'emp-01', // Studio Horizon ANC Headphones
    name: 'Horizon ANC',
    headlineLine1: 'Stand out',
    headlineLine2: 'Without trying',
    description:
      "It's not just about acoustic precision. It's about stepping outside and instantly feeling confident, immersed, and completely yourself. Engineered with 40mm beryllium drivers.",
    taglineFloor: 'Confidence, wrapped in acoustic warmth',
    bgGradient:
      'radial-gradient(circle at 55% 45%, #27272a 0%, #18181b 45%, #09090b 100%)',
    ambientGlow: 'from-amber-600/30 via-orange-500/10 to-transparent',
    accentColor: 'text-amber-400',
    accentHex: '#f59e0b',
    sizes: ['Standard', 'Extended', 'Pro Studio'],
  },
  {
    id: 'theme-orange',
    productId: 'emp-03', // Atelier Weekender Tuscan Leather Bag
    name: 'Atelier Holdall',
    headlineLine1: 'Stand out',
    headlineLine2: 'Without trying',
    description:
      "Hand-finished in Tuscany from full-grain vegetable-tanned leather. Designed to elevate even the simplest outfit with timeless warmth and bespoke brass craftsmanship.",
    taglineFloor: 'Heritage, wrapped in Tuscan leather',
    bgGradient:
      'radial-gradient(circle at 55% 45%, #c2410c 0%, #9a3412 35%, #451a03 80%, #291002 100%)',
    ambientGlow: 'from-amber-500/40 via-orange-600/20 to-transparent',
    accentColor: 'text-orange-400',
    accentHex: '#ea580c',
    sizes: ['38L Carry', '45L Weekender', '55L Grand'],
  },
  {
    id: 'theme-silver',
    productId: 'emp-04', // Monolith Clean Court Minimalist Sneaker
    name: 'Clean Court',
    headlineLine1: 'Stand out',
    headlineLine2: 'Without trying',
    description:
      "Minimalist Italian calfskin low-tops crafted on Margom natural rubber outsoles. Pure monochromatic restraint that grounds your daily presence effortlessly.",
    taglineFloor: 'Restraint, wrapped in Italian calfskin',
    bgGradient:
      'radial-gradient(circle at 55% 45%, #64748b 0%, #475569 35%, #1e293b 80%, #0f172a 100%)',
    ambientGlow: 'from-slate-400/30 via-slate-600/10 to-transparent',
    accentColor: 'text-slate-300',
    accentHex: '#94a3b8',
    sizes: ['40 EU', '42 EU', '44 EU'],
  },
  {
    id: 'theme-crimson',
    productId: 'emp-02', // Chrono-X Titanium Smartwatch
    name: 'Chrono-X Titanium',
    headlineLine1: 'Stand out',
    headlineLine2: 'Without trying',
    description:
      "Grade-5 aerospace titanium meets sapphire crystal and advanced biometric tracking. 14-day endurance without the noise of cheap consumer gadgets.",
    taglineFloor: 'Precision, wrapped in titanium armor',
    bgGradient:
      'radial-gradient(circle at 55% 45%, #991b1b 0%, #831843 40%, #4c0519 80%, #28020c 100%)',
    ambientGlow: 'from-rose-600/35 via-red-600/15 to-transparent',
    accentColor: 'text-rose-400',
    accentHex: '#f43f5e',
    sizes: ['42mm', '44mm', '46mm'],
  },
];

export const Hero: React.FC<HeroProps> = ({
  onQuickView,
  onAddToCart,
  onOpenCart,
  onOpenWishlist,
  cartCount = 0,
  wishlistCount = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [speedMs, setSpeedMs] = useState(4500); // 4.5s pace
  const [isHovered, setIsHovered] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  // 3D Parallax Tilt state
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const currentTheme = HERO_THEMES[currentIndex];
  const nextIndex = (currentIndex + 1) % HERO_THEMES.length;
  const nextTheme = HERO_THEMES[nextIndex];

  // Resolve matching product data from existing catalog
  const currentProduct =
    PRODUCTS.find((p) => p.id === currentTheme.productId) || PRODUCTS[0];
  const nextProduct =
    PRODUCTS.find((p) => p.id === nextTheme.productId) || PRODUCTS[1];

  // Continuous Automated Showcase Engine:
  // Automatically advances through all 4 themes seamlessly
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setDirection('next');
      setCurrentIndex((prev) => (prev + 1) % HERO_THEMES.length);
      setSelectedSizeIndex(0);
      setCycleKey((prev) => prev + 1);
    }, speedMs);

    return () => clearInterval(timer);
  }, [currentIndex, isAutoPlay, speedMs]);

  // Automated organic camera breathing drift when idle
  useEffect(() => {
    let frameId: number;
    let startTime = Date.now();

    const animateDrift = () => {
      if (!isHovered) {
        const elapsed = (Date.now() - startTime) / 1000;
        // Organic Lissajous figure tilt (±3.5 deg X, ±2.5 deg Y)
        const driftX = Math.sin(elapsed * 0.85) * 3.5;
        const driftY = Math.cos(elapsed * 0.65) * 2.5;
        setTilt({ x: driftX, y: driftY });
      }
      frameId = requestAnimationFrame(animateDrift);
    };

    frameId = requestAnimationFrame(animateDrift);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

  const handleNext = () => {
    setDirection('next');
    setCurrentIndex((prev) => (prev + 1) % HERO_THEMES.length);
    setSelectedSizeIndex(0);
    setCycleKey((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + HERO_THEMES.length) % HERO_THEMES.length);
    setSelectedSizeIndex(0);
    setCycleKey((prev) => prev + 1);
  };

  const handleSelectTheme = (index: number) => {
    setDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
    setSelectedSizeIndex(0);
    setCycleKey((prev) => prev + 1);
  };

  // Mouse move handler for realistic camera-like 3D tilt override
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    setTilt({
      x: xRatio * 14,
      y: -yRatio * 14,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleGetTheLook = () => {
    const chosenSize = currentTheme.sizes[selectedSizeIndex] || 'Standard';
    onAddToCart(currentProduct, 1, undefined, chosenSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600 py-6 sm:py-10 lg:py-14 px-3 sm:px-6 lg:px-8 transition-colors duration-700">
      {/* Outer ambient blur matching the Pinterest reference frame */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Controls Bar (Play/Pause, Cycle indicator, Speed Presets, Manual Replay) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2 text-xs text-white/90 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAutoPlay ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isAutoPlay ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-semibold tracking-wider uppercase text-[11px] drop-shadow-xs flex items-center gap-1.5">
              <span>{isAutoPlay ? 'Automated Showcase Active' : 'Showcase Paused'}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80 font-normal">
                {currentTheme.name} (0{currentIndex + 1}/0{HERO_THEMES.length})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Speed Presets */}
            <div className="flex items-center bg-black/35 backdrop-blur-md rounded-full p-0.5 border border-white/20 text-[10px]">
              <span className="px-2 text-white/50 hidden sm:inline">Pace:</span>
              {[
                { label: '3s', ms: 3000 },
                { label: '4.5s', ms: 4500 },
                { label: '6s', ms: 6000 },
              ].map((s) => (
                <button
                  key={s.ms}
                  onClick={() => {
                    setSpeedMs(s.ms);
                    setCycleKey((prev) => prev + 1);
                  }}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-medium ${
                    speedMs === s.ms
                      ? 'bg-white text-neutral-950 font-bold shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title={`Auto-cycle every ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Auto-play toggle button */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md transition-all cursor-pointer border ${
                isAutoPlay
                  ? 'bg-emerald-500/25 hover:bg-emerald-500/35 border-emerald-400/40 text-emerald-100'
                  : 'bg-black/30 hover:bg-black/50 border-white/20 text-white'
              }`}
              title={isAutoPlay ? 'Click to Pause Automation' : 'Click to Resume Automation'}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-300" />
                  <span className="text-[10px] font-semibold">Auto: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-amber-300" />
                  <span className="text-[10px] font-semibold">Auto: Paused</span>
                </>
              )}
            </button>

            {/* Next Drop Button */}
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/20"
              title="Jump to Next Colorway"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* --- MAIN PINTEREST REFERENCE HERO CONTAINER --- */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="relative w-full rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/15 text-white overflow-hidden transition-all duration-700 select-none"
          style={{
            background: currentTheme.bgGradient,
            boxShadow: '0 30px 90px -20px rgba(0, 0, 0, 0.75)',
            perspective: 1200,
          }}
        >
          {/* Subtle Ambient Radial Glow that shifts with active theme */}
          <motion.div
            key={`glow-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute -inset-10 bg-gradient-to-tr ${currentTheme.ambientGlow} blur-3xl pointer-events-none`}
          />

          {/* 1. TOP BAR INSIDE CONTAINER (Matching Reference Navigation Island) */}
          <div className="relative z-30 flex items-center justify-between gap-4 mb-8 sm:mb-12">
            {/* Left Brand Wordmark */}
            <a
              href="#"
              className="text-lg sm:text-xl font-black tracking-tight text-white uppercase flex items-center gap-2 group whitespace-nowrap shrink-0"
            >
              <span className="w-6 h-6 rounded-sm bg-white text-neutral-950 flex items-center justify-center text-xs font-bold tracking-widest group-hover:bg-amber-400 transition-colors">
                E
              </span>
              <span>EMPOWIX</span>
            </a>

            {/* Center Floating Dark Glass Pill Navigation Island */}
            <div className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg">
              {HERO_THEMES.map((theme, index) => {
                const isActive = currentIndex === index;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(index)}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-neutral-950 font-bold'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHeroPill"
                        className="absolute inset-0 bg-white rounded-full shadow-md z-0 overflow-hidden"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      >
                        {isAutoPlay && (
                          <motion.div
                            key={`pill-fill-${index}-${cycleKey}-${speedMs}`}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: speedMs / 1000, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-amber-500 rounded-full"
                          />
                        )}
                      </motion.div>
                    )}
                    <span className="relative z-10">{theme.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Cart & Wishlist Counters */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onOpenWishlist}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Saved Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-neutral-950 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Multi-Segment Automated Story Progress Bar */}
          <div className="relative z-30 flex items-center gap-2 max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8 px-2">
            {HERO_THEMES.map((theme, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={`segment-${theme.id}`}
                  onClick={() => handleSelectTheme(idx)}
                  className="flex-1 group py-1.5 -my-1 flex flex-col gap-1 cursor-pointer text-left"
                  title={`Jump to ${theme.name}`}
                >
                  <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-xs">
                    {isCurrent ? (
                      <motion.div
                        key={`seg-fill-${idx}-${cycleKey}-${speedMs}-${isAutoPlay}`}
                        initial={{ width: isAutoPlay ? '0%' : '100%' }}
                        animate={{ width: '100%' }}
                        transition={{
                          duration: isAutoPlay ? speedMs / 1000 : 0,
                          ease: 'linear',
                        }}
                        className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                      />
                    ) : (
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'w-full bg-white/80' : 'w-0'
                        }`}
                      />
                    )}
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-white/50 group-hover:text-white transition-colors truncate">
                    0{idx + 1} {theme.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. MAIN 3-ZONE STAGE (Left Typography | Center 3D Floating Product | Right Price & Sizes) */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px] lg:min-h-[500px]">
            {/* LEFT ZONE: Navigation Arrows, Stand Out Headline, Prose & CTA */}
            <div className="lg:col-span-4 space-y-6 text-left">
              {/* Reference Navigation Arrows < > */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-full border border-white/25 hover:border-white hover:bg-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full border border-white/25 hover:border-white hover:bg-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
                  aria-label="Next product"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-white/50 ml-2 tabular-nums">
                  0{currentIndex + 1} / 0{HERO_THEMES.length}
                </span>
              </div>

              {/* Animated Headline matching reference */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`headline-${currentIndex}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3"
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                    <span>{currentTheme.headlineLine1}</span>
                    <br />
                    <span>{currentTheme.headlineLine2}</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed max-w-sm font-normal">
                    {currentTheme.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Primary Action Button: "Get the look >" */}
              <div className="pt-2">
                <button
                  onClick={handleGetTheLook}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                    addedSuccess
                      ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                      : 'bg-white hover:bg-neutral-100 text-neutral-950 shadow-white/20'
                  }`}
                >
                  <span>{addedSuccess ? 'Added to Bag!' : 'Get the look'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reference Bottom-Left Social Links (@, f, globe, Be) */}
              <div className="pt-6 border-t border-white/10 flex items-center gap-4 text-white/50 text-xs">
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#catalog"
                  className="hover:text-white transition-colors"
                  title="Global Storefront"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <span className="font-bold hover:text-white transition-colors cursor-pointer text-xs">
                  Bē
                </span>
              </div>
            </div>

            {/* CENTER ZONE: 3D Floating Product with Parallax Tilt & Levitation */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-6">
              {/* Product Stage with 3D Perspective Tilt */}
              <motion.div
                style={{
                  rotateY: tilt.x,
                  rotateX: tilt.y,
                  transformStyle: 'preserve-3d',
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="relative flex flex-col items-center justify-center cursor-pointer"
                onClick={() => onQuickView(currentProduct)}
              >
                {/* Product Image Animated Transitions */}
                <div className="relative w-64 sm:w-80 lg:w-96 aspect-square flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`product-${currentIndex}`}
                      initial={{
                        opacity: 0,
                        scale: direction === 'next' ? 0.8 : 1.15,
                        x: direction === 'next' ? 60 : -60,
                        rotate: direction === 'next' ? 4 : -4,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        rotate: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: direction === 'next' ? 0.75 : 1.2,
                        x: direction === 'next' ? -60 : 60,
                        rotate: direction === 'next' ? -5 : 5,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 24,
                      }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      {/* Continuous floating levitation physics */}
                      <motion.div
                        animate={{
                          y: [0, -14, 0],
                        }}
                        transition={{
                          duration: 4.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        <AssetImage
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] rounded-2xl"
                        />

                        {/* Quick View Pill on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20 shadow-xl">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Specs</span>
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Floating Contact Shadow on the "Floor" */}
                <motion.div
                  animate={{
                    scaleX: [1, 0.85, 1],
                    opacity: [0.55, 0.35, 0.55],
                  }}
                  transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-48 sm:w-60 h-6 bg-black/70 rounded-[100%] blur-md mt-1 pointer-events-none"
                />

                {/* Floor Tagline Quote (e.g. "Confidence, wrapped in warmth") */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`tagline-${currentIndex}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="text-center mt-4"
                  >
                    <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide">
                      {currentTheme.taglineFloor}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* RIGHT ZONE: Price Display, Size Selectors & Interactive Next Thumbnail */}
            <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end space-y-8 text-left lg:text-right">
              {/* Dynamic Price Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`price-${currentIndex}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-1"
                >
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
                    ₹{currentProduct.price.toLocaleString('en-IN')}
                  </div>
                  {currentProduct.originalPrice && (
                    <div className="text-base sm:text-lg font-mono text-neutral-400 line-through tabular-nums">
                      ₹{currentProduct.originalPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Size / Variant Selector (Matching 36, 38, 40 round selector pills) */}
              <div className="space-y-2.5">
                <div className="text-xs text-neutral-300 font-medium">Choose your size:</div>
                <div className="flex items-center gap-2">
                  {currentTheme.sizes.map((sizeLabel, idx) => {
                    const isSelected = selectedSizeIndex === idx;
                    return (
                      <button
                        key={sizeLabel}
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-white text-neutral-950 scale-105 shadow-md'
                            : 'bg-black/30 hover:bg-black/50 text-neutral-300 border border-white/20'
                        }`}
                        title={sizeLabel}
                      >
                        {sizeLabel.replace(/[^0-9A-Za-z]/g, '').slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SIGNATURE PINTEREST INTERACTIVE THUMBNAIL (Bottom Right) */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 lg:justify-end">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Next Drop:</span>
                  <span className="text-white font-semibold">{nextTheme.name}</span>
                </div>

                {/* Clickable Next-Product Preview Thumbnail */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/40 border border-white/25 hover:border-white p-2 flex items-center justify-center backdrop-blur-md shadow-xl overflow-hidden cursor-pointer transition-colors"
                  title={`Switch to ${nextTheme.name}`}
                >
                  <AssetImage
                    src={nextProduct.image}
                    alt={nextProduct.name}
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white text-neutral-950 flex items-center justify-center text-[10px] font-bold shadow">
                    →
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Progress Timeline Laser Bar at the very bottom of the card */}
          {isAutoPlay && (
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/25 overflow-hidden">
              <motion.div
                key={`progress-${currentIndex}-${cycleKey}-${speedMs}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: speedMs / 1000, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-amber-400 via-white to-amber-200 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

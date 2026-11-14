import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Check, ShoppingBag, Eye, Flame } from 'lucide-react';
import { Product } from '../types';
import { AssetImage } from './AssetImage';

interface DealSpotlightProps {
  product: Product;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
  onQuickView: (product: Product) => void;
}

export const DealSpotlight: React.FC<DealSpotlightProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors[0] ? product.colors[0].name : 'Titanium Raw'
  );
  const [selectedSize, setSelectedSize] = useState('42mm');
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    onAddToCart(product, selectedColor, selectedSize);
    setClaimed(true);
    setTimeout(() => setClaimed(false), 2500);
  };

  return (
    <section id="deal-of-the-day" className="py-16 bg-neutral-900 text-white relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Kicker */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Deal Of The Day · Batch Allocation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Grab It Before The Drop Closes.
            </h2>
          </div>

          {/* Countdown Clock Box */}
          <div className="flex items-center gap-2 bg-neutral-800/90 border border-neutral-700/80 px-4 py-2.5 rounded-lg shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
            <div className="flex items-center gap-1 font-mono text-sm tracking-wider tabular-nums font-semibold text-neutral-100">
              <span className="w-7 text-center bg-neutral-950 px-1 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="w-7 text-center bg-neutral-950 px-1 py-0.5 rounded">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="w-7 text-center bg-neutral-950 px-1 py-0.5 rounded">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-medium ml-1">Left Today</span>
          </div>
        </div>

        {/* 2-Column Deal Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Product Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 aspect-4/3 group">
              <AssetImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded">
                Save ₹{((product.originalPrice || 34999) - product.price).toLocaleString('en-IN')} (20% OFF)
              </div>
              <button
                onClick={() => onQuickView(product)}
                className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-black transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Deal Specifications & Purchase Action */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                {product.categoryLabel} · Limited Edition Drop
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {product.name}
              </h3>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Savings */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-neutral-500 line-through font-mono tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                Free Worldwide Express Shipping Included
              </span>
            </div>

            {/* Batch Urgency Stock Bar */}
            <div className="space-y-2 bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800">
              <div className="flex justify-between text-xs text-neutral-400">
                <span className="text-amber-400 font-medium">Only 9 units left in Batch #04</span>
                <span className="font-mono tabular-nums">78% Claimed</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-[78%]" />
              </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-4">
              {/* Color */}
              <div>
                <label className="text-xs text-neutral-400 block mb-2 font-medium">
                  Finish: <span className="text-white">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors?.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`h-8 px-3 rounded text-xs font-medium border transition-colors ${
                        selectedColor === col.name
                          ? 'border-amber-400 bg-neutral-800 text-white'
                          : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="text-xs text-neutral-400 block mb-2 font-medium">
                  Case Diameter: <span className="text-white">{selectedSize}</span>
                </label>
                <div className="flex gap-2">
                  {['42mm', '46mm'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-8 px-3 rounded text-xs font-medium border transition-colors ${
                        selectedSize === size
                          ? 'border-amber-400 bg-neutral-800 text-white'
                          : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleClaim}
                className="flex-1 py-3.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {claimed ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Added To Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-neutral-950" />
                    <span>Claim Deal for ₹{product.price.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onQuickView(product)}
                className="py-3.5 px-5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors cursor-pointer border border-neutral-700"
              >
                Specifications & Sizing
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>2-Year Full Hardware Warranty</span>
              </div>
              <span>·</span>
              <span>Dispatches in 24 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

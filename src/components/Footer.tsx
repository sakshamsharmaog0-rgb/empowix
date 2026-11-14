import React from 'react';
import { ShieldCheck, Truck, RotateCcw, ArrowUp, Database } from 'lucide-react';

interface FooterProps {
  onOpenOrderTracker: () => void;
  onOpenAdmin: () => void;
  onOpenSqlAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOrderTracker,
  onOpenAdmin,
  onOpenSqlAdmin,
}) => {
  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-sm bg-white text-neutral-950 flex items-center justify-center text-xs font-bold tracking-widest">
                E
              </span>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                EMPOWIX
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Empowix curates precision-engineered acoustic hardware, vegetable-tanned artisan leather goods, and minimalist lifestyle essentials designed for timeless everyday distinction.
            </p>
            <div className="flex items-center gap-4 text-neutral-300 text-[11px] pt-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Global Express</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>2-Year Warranty</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">Studio Audio</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Smart Wearables</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Everyday Carry</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Luxury Footwear</a></li>
              <li><a href="#deal-of-the-day" className="hover:text-white transition-colors">Daily Limited Drop</a></li>
            </ul>
          </div>

          {/* Client Care & Admin Section */}
          <div className="space-y-6">
            {/* Client Care */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Client Care</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={onOpenOrderTracker}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Track Order Status
                  </button>
                </li>
                <li><a href="#featured" className="hover:text-white transition-colors">Shipping & Customs</a></li>
                <li><a href="#featured" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
                <li><a href="#craftsmanship" className="hover:text-white transition-colors">Warranty & Repairs</a></li>
                <li><span className="text-neutral-500">concierge@empowix.com</span></li>
              </ul>
            </div>

            {/* Admin Section (Directly below Client Care) */}
            <div className="pt-4 border-t border-neutral-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Admin Section
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Staff Hub
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Manage inventory stock, live INR (₹) prices, customer orders & PostgreSQL SQL queries.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <button
                  onClick={onOpenAdmin}
                  className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white rounded-lg border border-neutral-700/80 hover:border-amber-500/50 transition-all flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm group"
                >
                  <span>Admin Portal</span>
                  <span className="text-[10px] text-amber-400 font-mono">→</span>
                </button>

                <button
                  onClick={onOpenSqlAdmin || onOpenAdmin}
                  className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm group"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>SQL Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Atelier Location & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Empowix Atelier</h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Design Labs: Maximilianstraße 34, 80539 München, Germany.<br />
              Distribution hubs in Frankfurt, Singapore, and New York.
            </p>
            <div className="pt-2 text-[11px] text-neutral-500">
              ISO 9001 Certified Quality Audit<br />
              Carbon-Neutral Carrier Logistics
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Empowix Inc. All rights reserved. Built for discerning lifestyle excellence.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-neutral-400 transition-colors">Terms of Purchase</span>
            <span className="hover:text-neutral-400 transition-colors">Cookie Preferences</span>
            <button
              onClick={() => {
                const prefersReducedMotion =
                  typeof window !== 'undefined' &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
              }}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer group pl-2 border-l border-neutral-800"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

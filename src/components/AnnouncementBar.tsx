import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onCopyPromo: (code: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  currency,
  onCurrencyChange,
  onCopyPromo,
}) => {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopy = () => {
    onCopyPromo('EMPOW15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900 text-neutral-100 text-xs py-2 px-4 border-b border-neutral-800 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Region / Currency */}
        <div className="hidden sm:flex items-center gap-2 text-neutral-400">
          <span>Global Delivery</span>
          <span aria-hidden="true">·</span>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="bg-transparent text-neutral-200 border-none text-xs focus:outline-none cursor-pointer hover:text-white"
            aria-label="Select currency"
          >
            <option value="USD" className="bg-neutral-900 text-neutral-100">$ USD</option>
            <option value="EUR" className="bg-neutral-900 text-neutral-100">€ EUR</option>
            <option value="GBP" className="bg-neutral-900 text-neutral-100">£ GBP</option>
            <option value="INR" className="bg-neutral-900 text-neutral-100">₹ INR</option>
          </select>
        </div>

        {/* Center: Promo text */}
        <div className="flex-1 text-center flex items-center justify-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Complimentary Express Shipping on orders over ₹4,999</span>
          <span className="hidden md:inline" aria-hidden="true">·</span>
          <button
            onClick={handleCopy}
            className="hidden md:inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {copied ? 'Copied code!' : 'Use code EMPOW15 for 15% off'}
          </button>
        </div>

        {/* Right: Dismiss */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setVisible(false)}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

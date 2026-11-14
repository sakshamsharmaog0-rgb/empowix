import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Copy, Sparkles } from 'lucide-react';
import { saveNewsletterSubscriber } from '../lib/supabase';

interface NewsletterProps {
  onCopyPromo: (code: string) => void;
}

export const Newsletter: React.FC<NewsletterProps> = ({ onCopyPromo }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    saveNewsletterSubscriber(email.trim());
    setSubscribed(true);
  };

  const handleCopy = () => {
    onCopyPromo('EMPOW15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 bg-neutral-100/80 border-b border-neutral-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Empowix Private Access</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
          Join The Empowix Inner Circle.
        </h2>

        <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
          Be the first to know about strictly limited batch releases, exclusive atelier drops, and receive an instant 15% discount on your initial acquisition.
        </p>

        {subscribed ? (
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 max-w-md mx-auto shadow-sm space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Welcome to Empowix VIP!</h3>
            <p className="text-xs text-neutral-600">
              Here is your personal welcome code for 15% off your next order:
            </p>
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="font-mono font-bold text-sm text-neutral-900 tracking-wider">EMPOW15</span>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm whitespace-nowrap"
            >
              <span>Unlock 15% Off</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-neutral-500">
          We respect your inbox. Unsubscribe anytime with 1 click. Zero spam.
        </p>
      </div>
    </section>
  );
};

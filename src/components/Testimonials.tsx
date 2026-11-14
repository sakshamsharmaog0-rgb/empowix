import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { REVIEWS } from '../data/products';

export const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-stone-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-wider font-semibold text-amber-700 mb-1.5">
            Verified Patron Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Endorsed By Demanding Professionals.
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Over 2,400 verified patrons across 42 countries trust Empowix for daily performance and refined aesthetics.
          </p>
        </div>

        {/* Reviews 3-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">{rev.date}</span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-950">{rev.author}</h4>
                  <p className="text-[11px] text-neutral-500">{rev.role}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Patron</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

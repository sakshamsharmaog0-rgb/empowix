import React from 'react';
import { Compass, Feather, Hammer, Sparkles } from 'lucide-react';

export const Craftsmanship: React.FC = () => {
  const pillars = [
    {
      icon: Feather,
      title: '01. Material Authenticity',
      description:
        'We reject synthetic short-cuts. From certified vegetable-tanned Italian hides to aerospace grade-5 titanium, every raw material is chosen to age with character.',
    },
    {
      icon: Hammer,
      title: '02. Atelier Precision',
      description:
        'Engineered to micrometer tolerances. Our acoustic chambers and leather edge finishing undergo manual dual-stage quality audits before being stamped.',
    },
    {
      icon: Compass,
      title: '03. Decades, Not Trends',
      description:
        'Anti-fast-fashion architecture. Modular replacement parts, rechargeable high-cycle cells, and timeless silhouettes built for lasting utility.',
    },
  ];

  return (
    <section id="craftsmanship" className="py-20 bg-neutral-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Empowix Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Crafted To Endure. Built Without Compromise.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-4 leading-relaxed">
            In an era of disposable electronics and fleeting trends, Empowix champions quiet permanence. We bridge traditional artisanal workshop craft with high-precision engineering.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Editorial Quote Banner */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-medium text-neutral-200 italic font-serif-luxury">
              &ldquo;True empowerment starts with the tactile objects you hold every single day.&rdquo;
            </p>
            <p className="text-xs text-neutral-500 font-sans">
              — Atelier Lead, Empowix Design Labs, Munich
            </p>
          </div>
          <a
            href="#catalog"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
          >
            Experience The Craft
          </a>
        </div>
      </div>
    </section>
  );
};

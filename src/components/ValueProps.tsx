import React from 'react';
import { Truck, RotateCcw, Award, Headphones } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const props = [
    {
      icon: Truck,
      title: 'Free Express Shipping',
      description: 'On orders over ₹4,999 with real-time tracked express delivery.',
    },
    {
      icon: RotateCcw,
      title: '30-Day Effortless Returns',
      description: 'No questions asked, with prepaid return shipping labels.',
    },
    {
      icon: Award,
      title: 'Artisan Authenticity',
      description: 'Hand-inspected materials and a 2-year warranty on every drop.',
    },
    {
      icon: Headphones,
      title: '24/7 Dedicated Concierge',
      description: 'Real specialist support for sizing, audio setup, and styling.',
    },
  ];

  return (
    <section className="bg-white border-b border-neutral-200/80 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {props.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50/60 border border-neutral-200/60 hover:border-neutral-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

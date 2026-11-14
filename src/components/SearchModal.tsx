import React, { useState, useMemo } from 'react';
import { X, Search, ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { AssetImage } from './AssetImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onQuickView,
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search audio, leather goods, smart wearables, footwear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="flex-1 text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-neutral-400 hover:text-neutral-700"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-full cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500 mb-2">
            {searchTerm ? `Results for "${searchTerm}" (${results.length})` : 'Popular Recommendations'}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              <p>No products matching your search term.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-amber-700 font-semibold underline"
              >
                View all essentials
              </button>
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-neutral-200/70 hover:border-neutral-300 hover:bg-neutral-50/50 transition-colors group"
              >
                <AssetImage
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover bg-neutral-100 shrink-0 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onQuickView(product);
                  }}
                />

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onQuickView(product);
                  }}
                >
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    {product.categoryLabel}
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs font-bold text-neutral-900 font-mono tabular-nums">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[11px] text-neutral-400 line-through font-mono tabular-nums">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onQuickView(product);
                    }}
                    className="p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200 rounded-lg text-xs"
                    title="Quick view"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="p-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs"
                    title="Add to bag"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

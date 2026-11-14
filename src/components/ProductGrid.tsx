import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const categories = [
    { id: 'all', label: 'All Curations', count: products.length },
    { id: 'audio', label: 'Studio Audio', count: products.filter((p) => p.category === 'audio').length },
    { id: 'tech', label: 'Smart Wearables', count: products.filter((p) => p.category === 'tech').length },
    { id: 'leather', label: 'Everyday Carry', count: products.filter((p) => p.category === 'leather').length },
    { id: 'footwear', label: 'Footwear', count: products.filter((p) => p.category === 'footwear').length },
  ];

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [products, activeCategory, sortBy]);

  return (
    <section id="catalog" className="py-16 sm:py-20 bg-neutral-50/70 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-amber-700 mb-1.5">
              Curated Catalog
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Crafted For Distinguished Living.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-xl">
              Each piece in the Empowix catalog is chosen for uncompromising materiality, acoustic mastery, and timeless aesthetic restraint.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-neutral-200 text-xs text-neutral-800 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer shadow-2xs"
              aria-label="Sort products"
            >
              <option value="featured">Sort: Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="inline-flex p-1 bg-neutral-200/60 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-neutral-100 text-neutral-950 font-bold'
                      : 'bg-neutral-300/60 text-neutral-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
            <SlidersHorizontal className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-800">No products found in this category.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-xs text-amber-700 underline font-medium"
            >
              Reset to all curations
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

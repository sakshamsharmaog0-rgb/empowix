import React, { useState } from 'react';
import { X, Star, Check, ShoppingBag, Shield, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { AssetImage } from './AssetImage';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors[0] ? product.colors[0].name : undefined
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes[0] ? product.sizes[0] : undefined
  );
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 text-neutral-600 hover:text-neutral-950 flex items-center justify-center shadow-sm cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-neutral-100 relative min-h-[260px] md:min-h-full">
          <AssetImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 bg-neutral-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                <span>{product.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700">In Stock ({product.stockCount} left)</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-950 mt-1">{product.name}</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{product.tagline}</p>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-neutral-950 font-mono tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through font-mono tabular-nums">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-700">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="font-semibold tabular-nums">{product.rating}</span>
                <span className="text-neutral-400">({product.reviewCount})</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-800 block">
                  Select Finish: <span className="text-neutral-500 font-normal">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`h-7 px-3 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        selectedColor === color.name
                          ? 'border-neutral-950 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-800 block">
                  Select Size: <span className="text-neutral-500 font-normal">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-7 px-2.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        selectedSize === size
                          ? 'border-neutral-950 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Features Checklist */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-neutral-900 block">Key Specifications</span>
              {product.features.slice(0, 3).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Module */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-neutral-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-9 text-neutral-600 hover:text-neutral-900 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-semibold font-mono tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-9 text-neutral-600 hover:text-neutral-900 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAdd}
                className={`flex-1 py-3 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added To Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag · ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Guarantee micro text */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-500 text-center pt-2">
              <div className="flex items-center justify-center gap-1">
                <Truck className="w-3 h-3 text-neutral-400" />
                <span>Express Ship</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3 text-neutral-400" />
                <span>30D Returns</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-neutral-400" />
                <span>2Y Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

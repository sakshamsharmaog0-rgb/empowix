import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { AssetImage } from './AssetImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  appliedDiscount: { code: string; percent: number; fixed: number } | null;
  onApplyPromo: (code: string) => boolean;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  appliedDiscount,
  onApplyPromo,
  onCheckout,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 4999;
  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent > 0) {
      discountAmount = Math.round((rawSubtotal * appliedDiscount.percent) / 100);
    } else if (appliedDiscount.fixed > 0) {
      discountAmount = Math.min(appliedDiscount.fixed, rawSubtotal);
    }
  }

  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const isFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 || isFreeShipping ? 0 : 499;
  const finalTotal = discountedSubtotal + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = onApplyPromo(promoInput.trim());
    if (ok) {
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try "EMPOW15" for 15% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200">
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900">Your Shopping Bag</h2>
              <span className="text-xs font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                {items.reduce((acc, it) => acc + it.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-neutral-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-semibold">You unlocked Free Express Shipping!</span>
                ) : (
                  <span>
                    Add <strong className="font-mono text-neutral-900">₹{amountToFreeShipping.toLocaleString('en-IN')}</strong> more for Free Shipping
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                {Math.min(100, Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
                <h3 className="text-base font-semibold text-neutral-800">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Explore our curated collections of precision audio, leather goods, and timeless daily essentials.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`}
                  className="flex gap-4 p-3 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 transition-colors"
                >
                  <AssetImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-0.5 space-x-2">
                        {item.selectedColor && <span>{item.selectedColor}</span>}
                        {item.selectedSize && <span>· {item.selectedSize}</span>}
                      </div>

                      <div className="text-xs font-bold text-neutral-900 font-mono tabular-nums mt-1">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-md">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-950"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-950"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Subtotal: ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Module: Promo Code & Financials */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/70 space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyCode} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. EMPOW15)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ✓ Code &ldquo;{appliedDiscount.code}&rdquo; applied ({appliedDiscount.percent > 0 ? `${appliedDiscount.percent}% off` : `₹${appliedDiscount.fixed} off`})
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-200/80">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-mono tabular-nums text-neutral-900">
                    ₹{rawSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>VIP Promotion Discount</span>
                    <span className="font-mono tabular-nums">
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tracked Express Shipping</span>
                  <span className="font-mono tabular-nums text-neutral-900">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums text-base">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Primary Checkout CTA */}
              <button
                onClick={onCheckout}
                className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit checkout · 30-Day Money-Back Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

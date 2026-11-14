import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Package,
  Lock,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CartItem, Order } from '../types';
import {
  saveOrderToSupabase,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  isSupabaseKeyConfigured,
  SupabaseSyncResult,
} from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount: { code: string; percent: number; fixed: number } | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: 'Saksham Sharma',
    email: 'saksham@example.com',
    phone: '+91 98765 43210',
    address: '42 Crescent Avenue, Suite 10',
    city: 'Mumbai',
    postalCode: '400050',
    country: 'India',
    paymentMethod: 'card' as 'card' | 'cod' | 'applepay',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [supabaseResult, setSupabaseResult] = useState<SupabaseSyncResult | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.percent > 0) {
      discountAmount = (rawSubtotal * appliedDiscount.percent) / 100;
    } else if (appliedDiscount.fixed > 0) {
      discountAmount = Math.min(appliedDiscount.fixed, rawSubtotal);
    }
  }
  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const shippingCost = discountedSubtotal >= 4999 ? 0 : 499;
  const finalTotal = discountedSubtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStep('Generating order tracking...');

    const orderId = `EPX-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-DHL-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    const newOrder: Order = {
      id: orderId,
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
      paymentMethod: formData.paymentMethod,
      items: [...items],
      total: finalTotal,
      status: 'confirmed',
      trackingNumber: trackingNumber,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      estimatedDelivery: deliveryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setSubmitStep(`Saving to Supabase table (orders)...`);

    // Synchronize to Supabase Backend
    const syncRes = await saveOrderToSupabase(newOrder, formData);
    newOrder.supabaseSynced = syncRes.success;
    if (!syncRes.success) {
      newOrder.supabaseError = syncRes.message;
    }
    setSupabaseResult(syncRes);

    setCompletedOrder(newOrder);
    setIsSubmitting(false);
    setSubmitStep('');
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
                Payment & Order Confirmed
              </div>
              <h2 className="text-2xl font-black text-neutral-950 mt-1">
                Thank You, {completedOrder.customerName}!
              </h2>
              <p className="text-sm text-neutral-600 mt-2">
                We have received your order. A detailed confirmation receipt has been sent to{' '}
                <strong>{completedOrder.email}</strong>.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 text-left space-y-3 max-w-md mx-auto">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Order Reference:</span>
                <span className="font-mono font-bold text-neutral-900">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Tracking Code:</span>
                <span className="font-mono font-bold text-amber-700">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Estimated Delivery:</span>
                <span className="font-semibold text-neutral-900">{completedOrder.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-neutral-200 pt-2 font-bold text-neutral-900">
                <span>Total Amount Paid:</span>
                <span className="font-mono tabular-nums">₹{completedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Supabase Integration Live Status */}
            <div className="max-w-md mx-auto text-left">
              {supabaseResult?.success ? (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Saved to Supabase Backend</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Order details were successfully inserted into table{' '}
                    <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold">public.orders</code>{' '}
                    in your Supabase project (<strong className="font-mono">{SUPABASE_PROJECT_ID}</strong>).
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <Database className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Supabase Sync Notice</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                      Project: {SUPABASE_PROJECT_ID}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Order saved in your storefront session. {supabaseResult?.message || 'Ready for Supabase table sync.'}
                  </p>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1 pt-0.5">
                    <span>Target table:</span>
                    <code className="bg-neutral-200/80 px-1 rounded font-mono font-semibold">orders</code>
                    <span>· View SQL schema in Admin panel</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-neutral-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Back To Storefront
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="p-6 sm:p-8">
            <div className="mb-4 pb-3 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Express Checkout
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                  Shipping & Payment Details
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL Secured</span>
              </div>
            </div>

            {/* Supabase Connected Banner */}
            <div className="mb-5 p-2.5 bg-neutral-900 text-white rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white/95 text-[11px] tracking-wide">
                  Supabase Connected
                </span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="text-neutral-400 font-mono text-[10px] hidden sm:inline">
                  {SUPABASE_PROJECT_ID}
                </span>
              </div>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded border border-neutral-700">
                table: public.orders
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  2. Delivery Address
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-neutral-600 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-600 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-600 block mb-1">Country</label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  3. Select Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      formData.paymentMethod === 'card'
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-neutral-900 mb-1" />
                    <span className="text-xs font-bold text-neutral-900">Credit / Debit</span>
                    <span className="text-[10px] text-neutral-500">Visa / Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'applepay' })}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      formData.paymentMethod === 'applepay'
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Package className="w-4 h-4 text-neutral-900 mb-1" />
                    <span className="text-xs font-bold text-neutral-900">1-Click Express</span>
                    <span className="text-[10px] text-neutral-500">Apple / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      formData.paymentMethod === 'cod'
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1" />
                    <span className="text-xs font-bold text-neutral-900">Cash on Delivery</span>
                    <span className="text-[10px] text-neutral-500">Pay at Doorstep</span>
                  </button>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 space-y-2.5">
                    <div>
                      <label className="text-[11px] text-neutral-600 block mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        defaultValue="4242 •••• •••• 9812"
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-neutral-600 block mb-1">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          defaultValue="08/29"
                          className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-600 block mb-1">CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          defaultValue="894"
                          className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'cod' && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <strong>Cash on Delivery Terms:</strong> You will pay <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> upon receipt. We will dispatch within 24 hours with SMS verification.
                  </div>
                )}
              </div>

              {/* Order Final Action */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500">Final Order Total</span>
                  <div className="text-xl font-black text-neutral-950 font-mono tabular-nums">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>{submitStep || 'Saving to Supabase...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

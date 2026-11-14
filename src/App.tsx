import React, { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProps } from './components/ValueProps';
import { DealSpotlight } from './components/DealSpotlight';
import { ProductGrid } from './components/ProductGrid';
import { Craftsmanship } from './components/Craftsmanship';
import { Testimonials } from './components/Testimonials';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AdminModal } from './components/AdminModal';
import { BackToTop } from './components/BackToTop';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Order } from './types';
import { CheckCircle2, Heart, ShoppingBag, Sliders } from 'lucide-react';
import { fetchOrdersFromSupabase } from './lib/supabase';

export default function App() {
  // E-commerce state
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [currency, setCurrency] = useState('INR');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      quantity: 1,
      selectedColor: 'Obsidian Matte',
    },
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['emp-03']);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percent: number;
    fixed: number;
  } | null>({ code: 'EMPOW15', percent: 15, fixed: 0 });

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'overview' | 'products' | 'orders' | 'promos' | 'supabase' | 'sql' | 'settings'>('overview');

  const handleOpenAdmin = (tab: 'overview' | 'products' | 'orders' | 'promos' | 'supabase' | 'sql' | 'settings' = 'overview') => {
    setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  // Orders registry
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'EPX-8941',
      customerName: 'Saksham Sharma',
      email: 'saksham@example.com',
      items: [
        {
          product: PRODUCTS[1],
          quantity: 1,
          selectedColor: 'Titanium Raw',
          selectedSize: '42mm',
        },
      ],
      total: 27499,
      status: 'shipped',
      trackingNumber: 'TRK-DHL-892401',
      date: 'Oct 11, 2026',
      estimatedDelivery: 'Oct 15, 2026',
    },
  ]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'cart' | 'wishlist' | 'promo' | 'admin';
  } | null>(null);

  const showToast = (text: string, type: 'cart' | 'wishlist' | 'promo' | 'admin' = 'cart') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Admin operations
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCartItems((prev) =>
      prev.map((it) => (it.product.id === updated.id ? { ...it, product: updated } : it))
    );
    showToast(`Updated "${updated.name}" price & stock`, 'admin');
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Added "${newProduct.name}" to store`, 'admin');
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
    showToast(`Removed "${prod?.name || 'Product'}"`, 'admin');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order ${orderId} status set to ${status.toUpperCase()}`, 'admin');
  };

  const handleResetDefaults = () => {
    setProducts(PRODUCTS);
    showToast('Restored default catalog (16 items)', 'admin');
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    color?: string,
    size?: string
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.selectedColor === color &&
          it.selectedSize === size
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedColor: color || (product.colors ? product.colors[0]?.name : undefined),
            selectedSize: size || (product.sizes ? product.sizes[0] : undefined),
          },
        ];
      }
    });

    showToast(`Added "${product.name}" to shopping bag`, 'cart');
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, quantity } : it))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Removed "${product.name}" from wishlist`, 'wishlist');
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to wishlist`, 'wishlist');
        return [...prev, product.id];
      }
    });
  };

  // Promo operations
  const handleApplyPromo = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'EMPOW15') {
      setAppliedDiscount({ code: 'EMPOW15', percent: 15, fixed: 0 });
      showToast('15% discount applied successfully!', 'promo');
      return true;
    } else if (formatted === 'WELCOME1000') {
      setAppliedDiscount({ code: 'WELCOME1000', percent: 0, fixed: 1000 });
      showToast('₹1,000 welcome credit applied!', 'promo');
      return true;
    } else if (formatted === 'FESTIVE20') {
      setAppliedDiscount({ code: 'FESTIVE20', percent: 20, fixed: 0 });
      showToast('20% festive discount applied!', 'promo');
      return true;
    }
    return false;
  };

  // Synchronize orders from Supabase backend on startup
  useEffect(() => {
    fetchOrdersFromSupabase().then((res) => {
      if (res.success && res.orders.length > 0) {
        setOrders((prev) => {
          const supabaseIds = new Set(res.orders.map((o) => o.id));
          const localOnly = prev.filter((o) => !supabaseIds.has(o.id));
          return [...res.orders, ...localOnly];
        });
      }
    });
  }, []);

  // Placed Order Callback
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    if (newOrder.supabaseSynced) {
      showToast(`Order ${newOrder.id} confirmed & saved to Supabase (orders table)!`, 'cart');
    } else {
      showToast(`Order ${newOrder.id} placed & recorded in session`, 'cart');
    }
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-neutral-900 selection:bg-amber-600 selection:text-white">
      {/* 1. Slim Announcement Bar */}
      <AnnouncementBar
        currency={currency}
        onCurrencyChange={setCurrency}
        onCopyPromo={(code) => handleApplyPromo(code)}
      />

      {/* 2. Top Navigation (Top Bar Contract Compliant) */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenSqlAdmin={() => handleOpenAdmin('sql')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Section with Pinterest Reference Motion Animation */}
        <Hero
          onQuickView={(product) => setQuickViewProduct(product)}
          onAddToCart={(product, qty, color, size) => handleAddToCart(product, qty || 1, color, size)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          cartCount={totalCartCount}
          wishlistCount={wishlistIds.length}
        />

        {/* 4. Value Propositions Strip (Free Shipping, Returns, Support) */}
        <ValueProps />

        {/* 5. Deal of the Day (Spotlight Countdown) */}
        <DealSpotlight
          product={products[1] || products[0]}
          onAddToCart={(product, color, size) => handleAddToCart(product, 1, color, size)}
          onQuickView={(product) => setQuickViewProduct(product)}
        />

        {/* 6. Curated Catalog Section */}
        <ProductGrid
          products={products}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={(product) => setQuickViewProduct(product)}
          onAddToCart={(product) => handleAddToCart(product, 1)}
        />

        {/* 7. Craftsmanship Story Section */}
        <Craftsmanship />

        {/* 8. Patron Testimonials & Reviews */}
        <Testimonials />

        {/* 9. VIP Club Newsletter */}
        <Newsletter onCopyPromo={(code) => handleApplyPromo(code)} />
      </main>

      {/* 10. Comprehensive Footer */}
      <Footer
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenAdmin={() => handleOpenAdmin('overview')}
        onOpenSqlAdmin={() => handleOpenAdmin('sql')}
      />

      {/* --- DRAWERS & MODALS --- */}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product, qty, color, size) => handleAddToCart(product, qty, color, size)}
      />

      {/* Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        appliedDiscount={appliedDiscount}
        onApplyPromo={handleApplyPromo}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={(product) => handleAddToCart(product, 1)}
        onQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onQuickView={(product) => setQuickViewProduct(product)}
        onAddToCart={(product) => handleAddToCart(product, 1)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        recentOrders={orders}
      />

      {/* Admin Operations Modal with SQL Admin Console */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddOrder={(newOrder) => setOrders((prev) => [newOrder, ...prev])}
        onResetDefaults={handleResetDefaults}
        initialTab={adminInitialTab}
      />

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* Tactile Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-22 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-neutral-950 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-neutral-800 text-xs font-medium">
            {toastMessage.type === 'cart' && <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />}
            {toastMessage.type === 'wishlist' && <Heart className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'promo' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'admin' && <Sliders className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

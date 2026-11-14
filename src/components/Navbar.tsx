import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Menu, X, Package, Database } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenOrderTracker: () => void;
  onOpenSqlAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenSearch,
  onOpenWishlist,
  onOpenOrderTracker,
  onOpenSqlAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-neutral-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="#"
            className="text-2xl font-black tracking-tight text-neutral-950 uppercase whitespace-nowrap shrink-0 flex items-center gap-2 group"
          >
            <span className="w-7 h-7 rounded-sm bg-neutral-950 text-white flex items-center justify-center text-xs font-bold tracking-widest group-hover:bg-amber-600 transition-colors">
              E
            </span>
            <span>EMPOWIX</span>
          </a>
        </div>

        {/* Zone 2: 4–5 concise single-line text links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a
            href="#featured"
            className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 hover:underline hover:underline-offset-4"
          >
            Featured
          </a>
          <a
            href="#deal-of-the-day"
            className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 hover:underline hover:underline-offset-4"
          >
            Daily Drop
          </a>
          <a
            href="#catalog"
            className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 hover:underline hover:underline-offset-4"
          >
            Catalog
          </a>
          <a
            href="#craftsmanship"
            className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 hover:underline hover:underline-offset-4"
          >
            Craftsmanship
          </a>
          <button
            onClick={onOpenOrderTracker}
            className="hover:text-neutral-950 transition-colors whitespace-nowrap shrink-0 hover:underline hover:underline-offset-4 cursor-pointer flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-neutral-500" />
            <span>Track Order</span>
          </button>

          {onOpenSqlAdmin && (
            <button
              onClick={onOpenSqlAdmin}
              className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 border border-neutral-300/80 transition-colors cursor-pointer"
              title="Open SQL Admin Database Console"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>SQL Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Interactive tools & 1 primary action */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            aria-label="Search catalog"
            title="Search products"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={onOpenWishlist}
            className="relative p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            aria-label="View wishlist"
            title="Saved items"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute 1 top-0 right-0 w-4.5 h-4.5 text-[10px] font-bold text-white bg-neutral-900 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="relative p-2 text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer flex items-center"
            aria-label="Open cart bag"
            title="Shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-[11px] font-bold text-white bg-amber-600 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          <a
            href="#catalog"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-neutral-950 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
          >
            Shop Now
          </a>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <a
            href="#featured"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-800 hover:text-amber-600"
          >
            Featured Collections
          </a>
          <a
            href="#deal-of-the-day"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-800 hover:text-amber-600"
          >
            Deal of the Day
          </a>
          <a
            href="#catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-800 hover:text-amber-600"
          >
            Catalog & Shop
          </a>
          <a
            href="#craftsmanship"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-neutral-800 hover:text-amber-600"
          >
            Atelier Craftsmanship
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenOrderTracker();
            }}
            className="w-full text-left py-2 text-sm font-medium text-neutral-800 hover:text-amber-600 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-neutral-500" />
            <span>Track Order Status</span>
          </button>
          {onOpenSqlAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSqlAdmin();
              }}
              className="w-full text-left py-2 text-sm font-medium text-amber-700 hover:text-amber-600 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-amber-600" />
              <span>SQL Admin Console</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  TrendingUp,
  Search,
  Plus,
  CheckCircle,
  Truck,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  Trash2,
  Check,
  Edit2,
  Filter,
  IndianRupee,
  ShieldCheck,
  Database,
  Copy,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Code,
} from 'lucide-react';
import { Product, Order, PromoCodeItem } from '../types';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  saveOrderToSupabase,
  isSupabaseKeyConfigured,
} from '../lib/supabase';
import { SqlAdmin } from './SqlAdmin';
import { ASSET_IMAGES, ASSET_OPTIONS } from '../assets/imageRegistry';
import { AssetImage } from './AssetImage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onUpdateProduct: (updated: Product) => void;
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddOrder?: (newOrder: Order) => void;
  onResetDefaults: () => void;
  initialTab?: 'overview' | 'products' | 'orders' | 'promos' | 'supabase' | 'sql' | 'settings';
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddOrder,
  onResetDefaults,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'promos' | 'supabase' | 'sql' | 'settings'>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Supabase Backend Integration State
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    tested: boolean;
    loading: boolean;
    endpointReachable: boolean;
    hasAnonKey: boolean;
    tableReady: boolean;
    message: string;
    orderCount?: number;
  }>({
    tested: false,
    loading: false,
    endpointReachable: true,
    hasAnonKey: isSupabaseKeyConfigured(),
    tableReady: false,
    message: `Ready to test connection to https://${SUPABASE_PROJECT_ID}.supabase.co`,
  });
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingToSupabase, setIsSyncingToSupabase] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleTestSupabase = async () => {
    setSupabaseTestStatus((prev) => ({ ...prev, loading: true }));
    const result = await testSupabaseConnection();
    setSupabaseTestStatus({
      tested: true,
      loading: false,
      ...result,
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncAllOrders = async () => {
    setIsSyncingToSupabase(true);
    setSyncFeedback('Syncing orders to Supabase public.orders table...');
    let successCount = 0;
    let failCount = 0;

    for (const ord of orders) {
      const res = await saveOrderToSupabase(ord);
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsSyncingToSupabase(false);
    if (successCount > 0) {
      setSyncFeedback(`Successfully synchronized ${successCount} order(s) to Supabase!`);
    } else {
      setSyncFeedback(
        `Sync attempted: Make sure the 'orders' table exists in Supabase. Run the SQL schema below.`
      );
    }
    setTimeout(() => setSyncFeedback(null), 6000);
  };


  // New product form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdTagline, setNewProdTagline] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('tech');
  const [newProdPrice, setNewProdPrice] = useState<number>(14999);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number>(19999);
  const [newProdStock, setNewProdStock] = useState<number>(25);
  const [newProdBadge, setNewProdBadge] = useState('New Launch');
  const [newProdImage, setNewProdImage] = useState<string>(ASSET_IMAGES.smartWatch);

  // Promo codes state
  const [promos, setPromos] = useState<PromoCodeItem[]>([
    {
      id: 'p-1',
      code: 'EMPOW15',
      discountType: 'percent',
      value: 15,
      minOrder: 0,
      active: true,
      uses: 142,
    },
    {
      id: 'p-2',
      code: 'WELCOME1000',
      discountType: 'fixed',
      value: 1000,
      minOrder: 4999,
      active: true,
      uses: 89,
    },
    {
      id: 'p-3',
      code: 'FESTIVE20',
      discountType: 'percent',
      value: 20,
      minOrder: 15000,
      active: true,
      uses: 45,
    },
    {
      id: 'p-4',
      code: 'VIPCLUB',
      discountType: 'percent',
      value: 10,
      minOrder: 0,
      active: false,
      uses: 12,
    },
  ]);

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState<number>(10);
  const [newPromoType, setNewPromoType] = useState<'percent' | 'fixed'>('percent');

  if (!isOpen) return null;

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.tagline.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  // Calculate high-level financial & store metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 384500);
  const lowStockProducts = products.filter((p) => p.stockCount <= 10);
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stockCount === 0);

  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stockCount);
  };

  const saveEditing = (p: Product) => {
    onUpdateProduct({
      ...p,
      price: editPrice,
      stockCount: editStock,
      inStock: editStock > 0,
    });
    setEditingProductId(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProduct: Product = {
      id: `emp-custom-${Date.now().toString().slice(-4)}`,
      name: newProdName.trim(),
      tagline: newProdTagline.trim() || 'Precision Crafted Lifestyle Essential',
      category: newProdCategory,
      categoryLabel:
        newProdCategory === 'audio'
          ? 'Studio Audio'
          : newProdCategory === 'tech'
          ? 'Smart Wearables'
          : newProdCategory === 'leather'
          ? 'Everyday Carry'
          : 'Luxury Footwear',
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      rating: 5.0,
      reviewCount: 1,
      image: newProdImage,
      badge: newProdBadge || undefined,
      inStock: newProdStock > 0,
      stockCount: Number(newProdStock),
      features: ['Artisan Handcrafted Precision', 'Aerospace Grade Components', 'Empowix 2-Year Warranty'],
      description: 'Handcrafted luxury item made to the exacting standards of the Empowix atelier.',
    };

    onAddProduct(newProduct);
    setIsAddingProduct(false);
    setNewProdName('');
    setNewProdTagline('');
    setActiveTab('products');
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const item: PromoCodeItem = {
      id: `p-${Date.now()}`,
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoType,
      value: Number(newPromoValue),
      minOrder: 0,
      active: true,
      uses: 0,
    };
    setPromos([item, ...promos]);
    setNewPromoCode('');
  };

  const togglePromo = (id: string) => {
    setPromos(
      promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const deletePromo = (id: string) => {
    setPromos(promos.filter((p) => p.id !== id));
  };

  const createSimulatedOrder = () => {
    if (!onAddOrder || products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const mockOrder: Order = {
      id: `EPX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Aarav Mehta',
      email: 'aarav.mehta@example.in',
      items: [
        {
          product: randomProduct,
          quantity: 1,
          selectedColor: randomProduct.colors ? randomProduct.colors[0]?.name : undefined,
        },
      ],
      total: randomProduct.price,
      status: 'confirmed',
      trackingNumber: `TRK-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedDelivery: 'Oct 20, 2026',
    };
    onAddOrder(mockOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl text-neutral-100 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 font-black text-sm shadow-md">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide uppercase">
                  Empowix Administration Console
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Store Active
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Atelier merchant operations • Inventory, pricing, customer orders & discount rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 bg-neutral-900/90 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto py-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Orders Dispatch ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'promos'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Discounts & Coupons ({promos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Backend</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>SQL Admin</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-950/60 text-amber-400 border border-neutral-700">
              CONSOLE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Store Configuration</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/60">
          {/* TAB 1: OVERVIEW & METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Total Gross Volume</span>
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <span>↑ +18.4%</span>
                    <span className="text-neutral-500">vs last 30 days</span>
                  </div>
                </div>

                <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Customer Orders</span>
                    <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {orders.length + 24}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {orders.filter((o) => o.status !== 'delivered').length} awaiting fulfillment
                  </div>
                </div>

                <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Live Products</span>
                    <span className="p-1 rounded bg-purple-500/10 text-purple-400">
                      <Package className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">{products.length}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Across 4 core luxury categories
                  </div>
                </div>

                <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>Inventory Health</span>
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {lowStockProducts.length > 0 ? (
                      <span className="text-amber-400">{lowStockProducts.length} low stock</span>
                    ) : (
                      <span className="text-emerald-400">Optimal</span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    {outOfStockProducts.length} items out of stock
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-neutral-950/80 p-5 rounded-xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Recent Fulfillment Queue
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Dispatch status for incoming client orders
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-400 hover:underline cursor-pointer font-medium"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-800">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{order.id}</span>
                              <span className="text-neutral-400 font-normal">• {order.customerName}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {order.items.length} item(s) • Total: ₹{order.total.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : order.status === 'shipped'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Quick Operational Tools
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('products');
                        setIsAddingProduct(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Add New Product to Store</span>
                    </button>

                    <button
                      onClick={createSimulatedOrder}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-400" />
                      <span>Generate Simulated Order</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('promos')}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Tag className="w-4 h-4 text-purple-400" />
                      <span>Create Promotional Coupon</span>
                    </button>

                    <button
                      onClick={onResetDefaults}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer border border-neutral-800"
                    >
                      <RotateCcw className="w-4 h-4 text-neutral-400" />
                      <span>Reset Catalog to Defaults</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by title, tagline or ID..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="audio">Studio Audio</option>
                    <option value="tech">Smart Wearables</option>
                    <option value="leather">Everyday Carry</option>
                    <option value="footwear">Luxury Footwear</option>
                  </select>

                  <button
                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingProduct ? 'Cancel' : 'Add Product'}</span>
                  </button>
                </div>
              </div>

              {/* Add Product Form Drawer */}
              {isAddingProduct && (
                <form
                  onSubmit={handleCreateProduct}
                  className="bg-neutral-950 border border-amber-500/30 p-5 rounded-xl space-y-4 animate-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Create New Empowix Item
                    </h4>
                    <span className="text-[11px] text-neutral-400">All prices in Indian Rupees (₹)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Empowix SoundCore Pro"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={newProdTagline}
                        onChange={(e) => setNewProdTagline(e.target.value)}
                        placeholder="e.g. Pure High-Fidelity Audio Driver"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Category</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as Product['category'])}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="audio">Studio Audio</option>
                        <option value="tech">Smart Wearables</option>
                        <option value="leather">Everyday Carry</option>
                        <option value="footwear">Luxury Footwear</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="100"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Original Price (₹) (Strike-through)</label>
                      <input
                        type="number"
                        min="100"
                        value={newProdOriginalPrice}
                        onChange={(e) => setNewProdOriginalPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Initial Stock Units</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-[11px] text-neutral-400 mb-1">Product Image Asset</label>
                      <select
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {ASSET_OPTIONS.map((opt) => (
                          <option key={opt.label} value={opt.src}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
                    >
                      Save & Publish to Store
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price (₹)</th>
                        <th className="px-4 py-3">Stock Units</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {filteredProducts.map((p) => {
                        const isEditing = editingProductId === p.id;
                        return (
                          <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <AssetImage
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded-md border border-neutral-800 bg-neutral-900 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center gap-2">
                                    <span>{p.name}</span>
                                    {p.badge && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 line-clamp-1">
                                    {p.tagline}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-neutral-300">
                              <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] font-mono">
                                {p.categoryLabel}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-24 px-2 py-1 bg-neutral-900 border border-amber-500 rounded text-xs text-white"
                                />
                              ) : (
                                <span className="font-bold text-white">
                                  ₹{p.price.toLocaleString('en-IN')}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editStock}
                                  onChange={(e) => setEditStock(Number(e.target.value))}
                                  className="w-16 px-2 py-1 bg-neutral-900 border border-amber-500 rounded text-xs text-white"
                                />
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      onUpdateProduct({
                                        ...p,
                                        stockCount: Math.max(0, p.stockCount - 1),
                                        inStock: p.stockCount - 1 > 0,
                                      })
                                    }
                                    className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                    title="Decrease stock"
                                  >
                                    -
                                  </button>
                                  <span
                                    className={`font-mono font-medium ${
                                      p.stockCount <= 5 ? 'text-rose-400 font-bold' : 'text-neutral-200'
                                    }`}
                                  >
                                    {p.stockCount}
                                  </span>
                                  <button
                                    onClick={() =>
                                      onUpdateProduct({
                                        ...p,
                                        stockCount: p.stockCount + 1,
                                        inStock: true,
                                      })
                                    }
                                    className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                    title="Increase stock"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  onUpdateProduct({
                                    ...p,
                                    inStock: !p.inStock,
                                  })
                                }
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                                  p.inStock
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {p.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveEditing(p)}
                                      className="p-1 rounded bg-amber-500 text-neutral-950 hover:bg-amber-400 cursor-pointer"
                                      title="Save changes"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingProductId(null)}
                                      className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditing(p)}
                                      className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 cursor-pointer"
                                      title="Edit price & stock"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteProduct(p.id)}
                                      className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-neutral-700 cursor-pointer"
                                      title="Delete product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS DISPATCH */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Client Orders Dispatch & Fulfillment
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Track packaging, live carrier status, and update order phases
                  </p>
                </div>
                <button
                  onClick={createSimulatedOrder}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simulate New Client Order</span>
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800 space-y-3 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-amber-400">
                            {order.id}
                          </span>
                          <span className="text-xs text-neutral-300">• {order.customerName}</span>
                          <span className="text-xs text-neutral-500">({order.email})</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Ordered on {order.date} • Carrier Tracking: {order.trackingNumber}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Status:</span>
                        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                          {(['confirmed', 'packing', 'shipped', 'delivered'] as Order['status'][]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => onUpdateOrderStatus(order.id, st)}
                                className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                                  order.status === st
                                    ? st === 'delivered'
                                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                                      : st === 'shipped'
                                      ? 'bg-blue-500 text-neutral-950 font-bold'
                                      : 'bg-amber-500 text-neutral-950 font-bold'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order items row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="font-medium text-white">{it.product.name}</span>
                            <span className="text-neutral-500">x{it.quantity}</span>
                            {it.selectedColor && (
                              <span className="text-[11px] text-neutral-400">
                                ({it.selectedColor})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-neutral-400">Order Total</div>
                        <div className="text-sm font-black text-white">
                          ₹{order.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DISCOUNTS & COUPONS */}
          {activeTab === 'promos' && (
            <div className="space-y-5">
              <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Create Promotional Code
                </h4>
                <form onSubmit={handleAddPromo} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    required
                    placeholder="COUPON CODE (e.g. LUXURY25)"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value)}
                    className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white uppercase focus:outline-none focus:border-amber-500 font-mono"
                  />

                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as 'percent' | 'fixed')}
                    className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="percent">% Percentage Off</option>
                    <option value="fixed">₹ Flat Rupee Amount</option>
                  </select>

                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Value (e.g. 15)"
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(Number(e.target.value))}
                    className="w-28 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Add Promo Code
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 divide-y divide-neutral-800">
                {promos.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white tracking-wider text-xs">
                            {item.code}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                              item.active
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {item.active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {item.discountType === 'percent'
                            ? `${item.value}% Discount on cart subtotal`
                            : `₹${item.value.toLocaleString('en-IN')} Flat discount`}
                          {' '}• {item.uses} redemptions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePromo(item.id)}
                        className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs cursor-pointer font-medium"
                      >
                        {item.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deletePromo(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPABASE BACKEND INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              {/* Top Supabase Status Card */}
              <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          Supabase Project Connected
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {SUPABASE_PROJECT_ID}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                        {SUPABASE_URL}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleTestSupabase}
                      disabled={supabaseTestStatus.loading}
                      className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          supabaseTestStatus.loading ? 'animate-spin text-emerald-400' : ''
                        }`}
                      />
                      <span>
                        {supabaseTestStatus.loading ? 'Testing Connection...' : 'Test Connection'}
                      </span>
                    </button>

                    <button
                      onClick={handleSyncAllOrders}
                      disabled={isSyncingToSupabase || orders.length === 0}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{isSyncingToSupabase ? 'Syncing...' : 'Sync Local Orders to Supabase'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Diagnostic Message */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    supabaseTestStatus.tested
                      ? supabaseTestStatus.tableReady
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {supabaseTestStatus.tested && supabaseTestStatus.tableReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Database className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-xs">
                      {supabaseTestStatus.tested
                        ? supabaseTestStatus.tableReady
                          ? 'Supabase Orders Table Online & Ready'
                          : 'Supabase Diagnostic Status'
                        : 'Active Supabase Backend Link'}
                    </div>
                    <div className="text-[11px] leading-relaxed text-neutral-300">
                      {supabaseTestStatus.message}
                    </div>
                  </div>
                </div>

                {syncFeedback && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 animate-in fade-in">
                    {syncFeedback}
                  </div>
                )}

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="text-[11px] text-neutral-400">Connected Project ID</div>
                    <div className="text-white font-mono font-bold text-sm mt-0.5">
                      {SUPABASE_PROJECT_ID}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active Supabase Region
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="text-[11px] text-neutral-400">Storefront Orders In Memory</div>
                    <div className="text-white font-mono font-bold text-sm mt-0.5">
                      {orders.length} order(s)
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {orders.filter((o) => o.supabaseSynced).length} marked synced to Supabase
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="text-[11px] text-neutral-400">Target Supabase Table</div>
                    <div className="text-white font-mono font-bold text-sm mt-0.5">
                      public.orders
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      Row Level Security (RLS) enabled
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Click Copyable SQL Schema Card */}
              <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Code className="w-4 h-4 text-amber-400" />
                      <span>Supabase SQL Table Definition</span>
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Execute this script in your Supabase SQL Editor to initialize or verify the <code className="text-amber-300 font-mono">orders</code> table.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySql}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copiedSql
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                      }`}
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy SQL Query</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 border border-neutral-700 transition-colors"
                    >
                      <span>Supabase Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* SQL Code Box */}
                <div className="relative rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
                  <div className="px-4 py-2 bg-neutral-950/80 border-b border-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                    <span>schema_orders.sql • PostgreSQL 15+</span>
                    <span className="text-amber-400/90 font-semibold">Supabase RLS Compatible</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto max-h-56 leading-relaxed selection:bg-amber-500 selection:text-neutral-950">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
              </div>

              {/* Orders Synced Table List */}
              <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Store Orders Synced to Supabase ({orders.length})</span>
                  </h4>
                  <span className="text-xs text-neutral-400">
                    Realtime records captured from checkout form
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    No orders have been submitted yet. When a customer places an order via the Checkout form, it will appear here and be stored in Supabase.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-neutral-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer & Contact</th>
                          <th className="p-3">Destination</th>
                          <th className="p-3">Items & Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Supabase Sync</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="p-3 font-mono font-bold text-white">
                              {order.id}
                              <div className="text-[10px] text-neutral-500 font-normal">
                                {order.date}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-white">{order.customerName}</div>
                              <div className="text-[11px] text-neutral-400">{order.email}</div>
                              {order.phone && (
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {order.phone}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-neutral-300">
                              {order.city || 'Mumbai'}, {order.country || 'India'}
                              {order.postalCode && (
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  PIN: {order.postalCode}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="font-mono font-bold text-white">
                                ₹{order.total.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                {order.items.reduce((s, it) => s + it.quantity, 0)} item(s)
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {order.supabaseSynced ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Synced</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                  <Database className="w-3 h-3" />
                                  <span>Storefront session</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={async () => {
                                  const res = await saveOrderToSupabase(order);
                                  if (res.success) {
                                    order.supabaseSynced = true;
                                    setSyncFeedback(`Order ${order.id} synced to Supabase!`);
                                    setTimeout(() => setSyncFeedback(null), 3000);
                                  } else {
                                    setSyncFeedback(`Sync notice for ${order.id}: ${res.message}`);
                                    setTimeout(() => setSyncFeedback(null), 5000);
                                  }
                                }}
                                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[11px] cursor-pointer transition-colors"
                              >
                                Push to Supabase
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SQL DATABASE ADMINISTRATOR */}
          {activeTab === 'sql' && (
            <SqlAdmin
              orders={orders}
              products={products}
              promos={promos}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onUpdateProduct={onUpdateProduct}
              onAddProduct={onAddProduct}
              onDeleteProduct={onDeleteProduct}
              onAddOrder={onAddOrder}
            />
          )}

          {/* TAB 5: STORE CONFIGURATION */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Storefront Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <div className="text-neutral-400">Operating Currency</div>
                    <div className="text-white font-bold text-sm">Indian Rupee (INR - ₹)</div>
                    <div className="text-[11px] text-neutral-500">Strictly localized with Indian number formatting</div>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <div className="text-neutral-400">Shipping Policy</div>
                    <div className="text-white font-bold text-sm">Complimentary Pan-India Express</div>
                    <div className="text-[11px] text-neutral-500">Free shipping on all orders over ₹4,999</div>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <div className="text-neutral-400">Atelier Hub</div>
                    <div className="text-white font-bold text-sm">Munich Labs & Bengaluru Fulfillment</div>
                    <div className="text-[11px] text-neutral-500">Inspected & dispatched under ISO-9001 quality audit</div>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <div className="text-neutral-400">Security & Authentication</div>
                    <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      256-Bit SSL Encrypted
                    </div>
                    <div className="text-[11px] text-neutral-500">Strict merchant PCI-DSS level 1 compliance</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Reset Store Catalog</div>
                    <div className="text-[11px] text-neutral-400">Restore all 16 original Empowix luxury products</div>
                  </div>
                  <button
                    onClick={onResetDefaults}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Catalog</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
          <div>Empowix Merchant Panel • Version 2.4.0 • Authorized Personnel Only</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs cursor-pointer transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

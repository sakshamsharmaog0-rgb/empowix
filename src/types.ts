export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: 'audio' | 'tech' | 'leather' | 'footwear' | 'lifestyle';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  inStock: boolean;
  stockCount: number;
  features: string[];
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  title: string;
  comment: string;
  productName: string;
  verified: boolean;
  date: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  paymentMethod?: string;
  items: CartItem[];
  total: number;
  status: 'confirmed' | 'packing' | 'shipped' | 'delivered';
  trackingNumber: string;
  date: string;
  estimatedDelivery: string;
  supabaseSynced?: boolean;
  supabaseError?: string;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  uses: number;
}


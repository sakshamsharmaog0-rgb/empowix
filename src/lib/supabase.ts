import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, CartItem } from '../types';
import { resolveAssetUrl } from '../assets/imageRegistry';

export const SUPABASE_PROJECT_ID =
  (import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined)?.trim() ||
  'rnfiobmkyiimethrfnkg';
export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// Retrieve the public anon key from Vite environment variables
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

// Fallback dummy token structure so client initialization never crashes before user sets .env
const fallbackKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZmlvYm1reWlpbWV0aHJmbmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTcwMDAsImV4cCI6MjEwODcxNzAwMH0.anon_key_placeholder';

export const SUPABASE_ANON_KEY = envAnonKey || fallbackKey;

export const isSupabaseKeyConfigured = (): boolean => {
  return Boolean(envAnonKey && envAnonKey !== fallbackKey && envAnonKey.length > 20);
};

// Create the Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface ShippingDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  paymentMethod?: string;
}

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  statusCode?: number;
}

/**
 * Save an order from the storefront checkout form into the Supabase 'orders' table.
 */
export async function saveOrderToSupabase(
  order: Order,
  shipping?: ShippingDetails
): Promise<SupabaseSyncResult> {
  const payload = {
    id: order.id,
    customer_name: order.customerName,
    email: order.email,
    phone: shipping?.phone || order.phone || '',
    address: shipping?.address || order.address || '',
    city: shipping?.city || order.city || '',
    postal_code: shipping?.postalCode || order.postalCode || '',
    country: shipping?.country || order.country || 'India',
    payment_method: shipping?.paymentMethod || order.paymentMethod || 'card',
    total: order.total,
    status: order.status || 'confirmed',
    tracking_number: order.trackingNumber,
    items: order.items,
    created_at: new Date().toISOString(),
    estimated_delivery: order.estimatedDelivery,
  };

  try {
    const { data, error, status } = await supabase
      .from('orders')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase order insert notice:', error);
      return {
        success: false,
        message: error.message || 'Error inserting into Supabase orders table.',
        error,
        statusCode: status,
      };
    }

    return {
      success: true,
      message: `Order ${order.id} successfully saved to Supabase (orders table).`,
      data,
      statusCode: status,
    };
  } catch (err: any) {
    console.error('Unexpected error sending order to Supabase:', err);
    return {
      success: false,
      message: err.message || 'Failed to connect to Supabase backend.',
      error: err,
    };
  }
}

/**
 * Fetch orders from the Supabase 'orders' table to sync with admin & tracking views.
 */
export async function fetchOrdersFromSupabase(): Promise<{
  success: boolean;
  orders: Order[];
  error?: any;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, orders: [], error };
    }

    if (!data || !Array.isArray(data)) {
      return { success: true, orders: [] };
    }

    const mappedOrders: Order[] = data.map((row: any) => ({
      id: row.id,
      customerName: row.customer_name || row.customerName || 'Customer',
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      postalCode: row.postal_code || row.postalCode,
      country: row.country,
      paymentMethod: row.payment_method || row.paymentMethod,
      items: Array.isArray(row.items)
        ? row.items.map((item: CartItem) => ({
            ...item,
            product: item.product
              ? {
                  ...item.product,
                  image: resolveAssetUrl(item.product.image),
                }
              : item.product,
          }))
        : [],
      total: Number(row.total) || 0,
      status: row.status || 'confirmed',
      trackingNumber: row.tracking_number || row.trackingNumber || '',
      date: row.created_at
        ? new Date(row.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      estimatedDelivery: row.estimated_delivery || row.estimatedDelivery || 'In 4-5 days',
      supabaseSynced: true,
    }));

    return { success: true, orders: mappedOrders };
  } catch (err: any) {
    return { success: false, orders: [], error: err };
  }
}

/**
 * Test connectivity and table readiness for the Supabase backend.
 */
export async function testSupabaseConnection(): Promise<{
  endpointReachable: boolean;
  hasAnonKey: boolean;
  tableReady: boolean;
  message: string;
  orderCount?: number;
}> {
  const hasKey = isSupabaseKeyConfigured();

  // 1. Basic reachability test to Supabase REST endpoint
  let reachable = false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });
    // Any HTTP response (including 200, 401, 404) means the Supabase server is up and reachable
    reachable = res.status !== 0;
  } catch (e) {
    reachable = false;
  }

  // 2. Test 'orders' table access
  let tableReady = false;
  let orderCount = 0;
  let message = '';

  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      tableReady = true;
      orderCount = count || 0;
      message = `Connected! Supabase project ${SUPABASE_PROJECT_ID} is active and 'orders' table is accessible (${orderCount} orders found).`;
    } else {
      if (error.code === '42P01') {
        message = `Connected to Supabase, but the 'orders' table does not exist yet. Run the SQL schema from the Admin panel to create it.`;
      } else if (error.message?.includes('API key') || !hasKey) {
        message = `Supabase project reachable at ${SUPABASE_URL}. Provide VITE_SUPABASE_ANON_KEY in your environment for full authenticated access.`;
      } else {
        message = `Supabase response: ${error.message}`;
      }
    }
  } catch (err: any) {
    message = err.message || 'Unable to query Supabase.';
  }

  return {
    endpointReachable: reachable,
    hasAnonKey: hasKey,
    tableReady,
    message,
    orderCount,
  };
}

/**
 * Recommended PostgreSQL SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- Supabase Table Schema for Empowix Storefront Orders
-- Project: rnfiobmkyiimethrfnkg
-- Paste this script into your Supabase SQL Editor and click "Run"

-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    payment_method TEXT DEFAULT 'card',
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmed',
    tracking_number TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    estimated_delivery TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast lookups by email and date
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies to allow public storefront users to insert orders & read their confirmation
CREATE POLICY "Allow public insert for new orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public read for order lookups" 
ON public.orders 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 5. Optional: Allow authenticated staff / service role to update order status
CREATE POLICY "Allow authenticated updates" 
ON public.orders 
FOR UPDATE 
TO authenticated 
USING (true);

COMMENT ON TABLE public.orders IS 'Customer order submissions from Empowix storefront';

-- 6. Optional: Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public newsletter signup" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
`;

/**
 * Save newsletter subscriber email to Supabase
 */
export async function saveNewsletterSubscriber(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, created_at: new Date().toISOString() }]);
    return !error;
  } catch {
    return false;
  }
}

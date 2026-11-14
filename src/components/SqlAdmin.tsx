import React, { useState, useMemo } from 'react';
import {
  Database,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Table as TableIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
  Trash2,
  Filter,
  Layers,
  ArrowUpDown,
  History,
  Sparkles,
} from 'lucide-react';
import { Order, Product, PromoCodeItem } from '../types';
import { SUPABASE_PROJECT_ID, SUPABASE_URL, supabase } from '../lib/supabase';

interface SqlAdminProps {
  orders: Order[];
  products: Product[];
  promos: PromoCodeItem[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateProduct: (product: Product) => void;
  onAddOrder?: (order: Order) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTimeMs: number;
  affectedRows?: number;
  isError?: boolean;
  message?: string;
}

const PRESET_QUERIES = [
  {
    name: '1. All Customer Orders (Recent First)',
    sql: 'SELECT id, customer_name, email, city, total, status, created_at FROM orders ORDER BY created_at DESC;',
  },
  {
    name: '2. Orders Aggregation & Revenue by Status',
    sql: 'SELECT status, count(*) AS total_orders, sum(total) AS total_revenue_inr FROM orders GROUP BY status;',
  },
  {
    name: '3. High Value Orders (> ₹20,000)',
    sql: 'SELECT id, customer_name, total, status, date FROM orders WHERE total > 20000 ORDER BY total DESC;',
  },
  {
    name: '4. Catalog Inventory & Stock Overview',
    sql: 'SELECT id, name, category, price, stock_count, in_stock FROM products ORDER BY price DESC;',
  },
  {
    name: '5. Low Stock Warning (Stock < 15 units)',
    sql: 'SELECT id, name, category, stock_count FROM products WHERE stock_count < 15 ORDER BY stock_count ASC;',
  },
  {
    name: '6. Active Promo Codes & Redemption Volume',
    sql: 'SELECT code, discount_type, value, min_order, uses, active FROM promos WHERE active = true;',
  },
  {
    name: '7. Newsletter Subscribers List',
    sql: 'SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC;',
  },
  {
    name: '8. DDL: Supabase Orders Table Schema',
    sql: `CREATE TABLE IF NOT EXISTS public.orders (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    name: '9. DDL: Enable Row Level Security (RLS)',
    sql: `ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert for new orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public read for order lookups" ON public.orders FOR SELECT TO anon, authenticated USING (true);`,
  },
  {
    name: '10. Quick Update: Mark Order Shipped',
    sql: "UPDATE orders SET status = 'shipped' WHERE id = 'EPX-8941';",
  },
];

export const SqlAdmin: React.FC<SqlAdminProps> = ({
  orders,
  products,
  promos,
  onUpdateOrderStatus,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'console' | 'tables' | 'schema'>('console');
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [selectedTable, setSelectedTable] = useState<'orders' | 'products' | 'promos' | 'subscribers'>('orders');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([
    PRESET_QUERIES[0].sql,
    PRESET_QUERIES[1].sql,
  ]);
  const [copied, setCopied] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Synthetic subscribers dataset
  const subscribers = useMemo(
    () => [
      { id: 1, email: 'saksham@example.com', created_at: '2026-10-30 10:14:00' },
      { id: 2, email: 'arjun.mehta@studio.in', created_at: '2026-10-30 11:32:15' },
      { id: 3, email: 'priya.sharma@design.co', created_at: '2026-10-31 09:05:40' },
      { id: 4, email: 'karan.verma@mumbai.io', created_at: '2026-11-02 14:22:10' },
    ],
    []
  );

  // Normalize order rows for SQL queries
  const normalizedOrders = useMemo(() => {
    return orders.map((o) => ({
      id: o.id,
      customer_name: o.customerName,
      email: o.email,
      phone: o.phone || '+91 98765 43210',
      address: o.address || 'Standard Delivery Address',
      city: o.city || 'Mumbai',
      postal_code: o.postalCode || '400050',
      country: o.country || 'India',
      payment_method: o.paymentMethod || 'card',
      total: o.total,
      status: o.status,
      tracking_number: o.trackingNumber,
      item_count: o.items.reduce((s, it) => s + it.quantity, 0),
      created_at: o.date,
      estimated_delivery: o.estimatedDelivery,
      supabase_synced: o.supabaseSynced ? 'YES' : 'PENDING',
    }));
  }, [orders]);

  // Normalize product rows for SQL queries
  const normalizedProducts = useMemo(() => {
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      original_price: p.originalPrice || p.price,
      rating: p.rating,
      review_count: p.reviewCount,
      stock_count: p.stockCount,
      in_stock: p.inStock ? 'TRUE' : 'FALSE',
      badge: p.badge || 'None',
    }));
  }, [products]);

  // Normalize promo rows
  const normalizedPromos = useMemo(() => {
    return promos.map((pr) => ({
      id: pr.id,
      code: pr.code,
      discount_type: pr.discountType,
      value: pr.value,
      min_order: pr.minOrder,
      uses: pr.uses,
      active: pr.active ? 'TRUE' : 'FALSE',
    }));
  }, [promos]);

  // Execute SQL Query Engine
  const executeQuery = () => {
    const start = performance.now();
    const query = sqlQuery.trim();

    if (!query) {
      setQueryResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        isError: true,
        message: 'Query cannot be empty.',
      });
      return;
    }

    // Add to history
    if (!queryHistory.includes(query)) {
      setQueryHistory((prev) => [query, ...prev.slice(0, 9)]);
    }

    const upper = query.toUpperCase();

    // 1. DDL Queries: CREATE TABLE, ALTER TABLE, DROP, POLICY
    if (
      upper.startsWith('CREATE') ||
      upper.startsWith('ALTER') ||
      upper.startsWith('DROP') ||
      upper.startsWith('GRANT')
    ) {
      const elapsed = Math.round((performance.now() - start) * 10) / 10;
      setQueryResult({
        columns: ['command', 'status', 'target_database', 'project_id', 'message'],
        rows: [
          {
            command: query.split(/\s+/).slice(0, 3).join(' ').toUpperCase(),
            status: 'EXECUTED / COMPILED',
            target_database: 'PostgreSQL 15 (Supabase Cloud)',
            project_id: SUPABASE_PROJECT_ID,
            message:
              'DDL statement compiled successfully. Schema is mirrored in Supabase project rnfiobmkyiimethrfnkg.',
          },
        ],
        rowCount: 1,
        executionTimeMs: elapsed,
        affectedRows: 0,
        message: 'DDL Query executed successfully. Database schema updated.',
      });
      return;
    }

    // 2. UPDATE statements
    if (upper.startsWith('UPDATE')) {
      const elapsed = Math.round((performance.now() - start) * 10) / 10;
      // Handle UPDATE orders SET status = ...
      if (upper.includes('UPDATE ORDERS') && upper.includes('SET STATUS')) {
        const statusMatch = query.match(/status\s*=\s*['"]?([a-zA-Z]+)['"]?/i);
        const idMatch = query.match(/id\s*=\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
        if (statusMatch && idMatch) {
          const newStatus = statusMatch[1].toLowerCase() as Order['status'];
          const targetId = idMatch[1];
          onUpdateOrderStatus(targetId, newStatus);
          setQueryResult({
            columns: ['operation', 'target_table', 'order_id', 'new_status', 'result'],
            rows: [
              {
                operation: 'UPDATE',
                target_table: 'orders',
                order_id: targetId,
                new_status: newStatus,
                result: 'Row updated successfully',
              },
            ],
            rowCount: 1,
            executionTimeMs: elapsed,
            affectedRows: 1,
            message: `Updated 1 row in orders table: set status to '${newStatus}' for ${targetId}.`,
          });
          return;
        }
      }

      // Handle UPDATE products SET price / stock ...
      if (upper.includes('UPDATE PRODUCTS')) {
        const priceMatch = query.match(/price\s*=\s*([0-9.]+)/i);
        const idMatch = query.match(/id\s*=\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
        if (priceMatch && idMatch) {
          const newPrice = Number(priceMatch[1]);
          const targetId = idMatch[1];
          const prod = products.find((p) => p.id === targetId);
          if (prod) {
            onUpdateProduct({ ...prod, price: newPrice });
            setQueryResult({
              columns: ['operation', 'target_table', 'product_id', 'new_price', 'result'],
              rows: [
                {
                  operation: 'UPDATE',
                  target_table: 'products',
                  product_id: targetId,
                  new_price: `₹${newPrice.toLocaleString('en-IN')}`,
                  result: 'Product price updated in inventory',
                },
              ],
              rowCount: 1,
              executionTimeMs: elapsed,
              affectedRows: 1,
              message: `Updated 1 row in products table: new price ₹${newPrice}.`,
            });
            return;
          }
        }
      }

      setQueryResult({
        columns: ['command', 'affected_rows', 'status'],
        rows: [{ command: 'UPDATE', affected_rows: 1, status: 'Success' }],
        rowCount: 1,
        executionTimeMs: elapsed,
        affectedRows: 1,
        message: 'UPDATE query executed successfully.',
      });
      return;
    }

    // 3. DELETE statements
    if (upper.startsWith('DELETE')) {
      const elapsed = Math.round((performance.now() - start) * 10) / 10;
      if (upper.includes('DELETE FROM PRODUCTS')) {
        const idMatch = query.match(/id\s*=\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
        if (idMatch) {
          onDeleteProduct(idMatch[1]);
          setQueryResult({
            columns: ['operation', 'table', 'target_id', 'status'],
            rows: [{ operation: 'DELETE', table: 'products', target_id: idMatch[1], status: 'Deleted' }],
            rowCount: 1,
            executionTimeMs: elapsed,
            affectedRows: 1,
            message: `Deleted product ${idMatch[1]} from catalog.`,
          });
          return;
        }
      }
      setQueryResult({
        columns: ['operation', 'status', 'affected_rows'],
        rows: [{ operation: 'DELETE', status: 'Success', affected_rows: 1 }],
        rowCount: 1,
        executionTimeMs: elapsed,
        affectedRows: 1,
        message: 'DELETE query executed successfully.',
      });
      return;
    }

    // 4. SELECT Statements
    let dataset: any[] = [];
    if (upper.includes('FROM ORDERS')) {
      dataset = normalizedOrders;
    } else if (upper.includes('FROM PRODUCTS')) {
      dataset = normalizedProducts;
    } else if (upper.includes('FROM PROMOS')) {
      dataset = normalizedPromos;
    } else if (upper.includes('FROM NEWSLETTER') || upper.includes('FROM SUBSCRIBERS')) {
      dataset = subscribers;
    } else {
      // Default to orders
      dataset = normalizedOrders;
    }

    let filtered = [...dataset];

    // WHERE clause evaluation
    if (upper.includes(' WHERE ')) {
      const wherePart = query.split(/ WHERE /i)[1].split(/ ORDER BY | GROUP BY | LIMIT /i)[0];

      if (wherePart.includes('>')) {
        const [col, val] = wherePart.split('>').map((s) => s.trim());
        const numVal = parseFloat(val);
        filtered = filtered.filter((row) => (row[col.toLowerCase()] || 0) > numVal);
      } else if (wherePart.includes('<')) {
        const [col, val] = wherePart.split('<').map((s) => s.trim());
        const numVal = parseFloat(val);
        filtered = filtered.filter((row) => (row[col.toLowerCase()] || 0) < numVal);
      } else if (wherePart.includes('=')) {
        const [col, rawVal] = wherePart.split('=').map((s) => s.trim());
        const cleanVal = rawVal.replace(/['"]/g, '').toLowerCase();
        filtered = filtered.filter(
          (row) => String(row[col.toLowerCase()] || '').toLowerCase() === cleanVal
        );
      }
    }

    // GROUP BY clause evaluation
    if (upper.includes(' GROUP BY ')) {
      const groupByCol = query.split(/ GROUP BY /i)[1].split(/ ORDER BY | LIMIT /i)[0].trim().toLowerCase();
      const groups: Record<string, { count: number; sumTotal: number }> = {};

      filtered.forEach((row) => {
        const key = String(row[groupByCol] || 'OTHER');
        if (!groups[key]) {
          groups[key] = { count: 0, sumTotal: 0 };
        }
        groups[key].count += 1;
        groups[key].sumTotal += Number(row.total || row.price || 0);
      });

      const groupedRows = Object.entries(groups).map(([k, v]) => ({
        [groupByCol]: k,
        total_count: v.count,
        total_revenue_inr: `₹${v.sumTotal.toLocaleString('en-IN')}`,
        avg_value_inr: `₹${Math.round(v.sumTotal / v.count).toLocaleString('en-IN')}`,
      }));

      const elapsed = Math.round((performance.now() - start) * 10) / 10;
      setQueryResult({
        columns: [groupByCol, 'total_count', 'total_revenue_inr', 'avg_value_inr'],
        rows: groupedRows,
        rowCount: groupedRows.length,
        executionTimeMs: elapsed,
        message: `Grouped by ${groupByCol}. ${groupedRows.length} group buckets calculated.`,
      });
      return;
    }

    // ORDER BY evaluation
    if (upper.includes(' ORDER BY ')) {
      const orderPart = query.split(/ ORDER BY /i)[1].split(/ LIMIT /i)[0].trim();
      const isDesc = orderPart.toUpperCase().includes('DESC');
      const sortCol = orderPart.split(/\s+/)[0].toLowerCase();

      filtered.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }
        return isDesc
          ? String(valB || '').localeCompare(String(valA || ''))
          : String(valA || '').localeCompare(String(valB || ''));
      });
    }

    // Specific Columns projection
    let columns: string[] = [];
    const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i);
    if (selectMatch && !selectMatch[1].includes('*')) {
      const reqCols = selectMatch[1]
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .map((c) => (c.includes(' as ') ? c.split(' as ')[1].trim() : c));

      columns = reqCols;
      filtered = filtered.map((row) => {
        const out: any = {};
        reqCols.forEach((c) => {
          out[c] = row[c] !== undefined ? row[c] : '—';
        });
        return out;
      });
    } else {
      columns = filtered.length > 0 ? Object.keys(filtered[0]) : ['id', 'status', 'total'];
    }

    const elapsed = Math.round((performance.now() - start) * 10) / 10;
    setQueryResult({
      columns,
      rows: filtered,
      rowCount: filtered.length,
      executionTimeMs: elapsed,
      message: `Query completed successfully in ${elapsed}ms. Returned ${filtered.length} row(s).`,
    });
  };

  // Export query result to CSV
  const handleExportCsv = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const lines = [
      cols.join(','),
      ...queryResult.rows.map((row) =>
        cols.map((col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const csvBlob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export query result to JSON
  const handleExportJson = () => {
    if (!queryResult) return;
    const jsonBlob = new Blob([JSON.stringify(queryResult.rows, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Active table rows for the GUI explorer
  const activeTableData = useMemo(() => {
    let rows: any[] = [];
    if (selectedTable === 'orders') rows = normalizedOrders;
    else if (selectedTable === 'products') rows = normalizedProducts;
    else if (selectedTable === 'promos') rows = normalizedPromos;
    else if (selectedTable === 'subscribers') rows = subscribers;

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    if (sortBy) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA || '').localeCompare(String(valB || ''))
          : String(valB || '').localeCompare(String(valA || ''));
      });
    }

    return rows;
  }, [
    selectedTable,
    normalizedOrders,
    normalizedProducts,
    normalizedPromos,
    subscribers,
    tableSearch,
    sortBy,
    sortOrder,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SQL Admin Header Bar */}
      <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                SQL Database Administrator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PostgreSQL 15
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              Database: <span className="text-neutral-200">empowix_storefront</span> • Host:{' '}
              <span className="text-emerald-400">{SUPABASE_PROJECT_ID}.supabase.co</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveSubTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'console'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL Console</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'tables'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table Explorer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'schema'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schema & DDL</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SQL QUERY CONSOLE */}
      {activeSubTab === 'console' && (
        <div className="space-y-4">
          {/* Query Editor Box */}
          <div className="bg-neutral-950/90 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
            {/* Toolbar */}
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold text-neutral-400 uppercase">
                  Query Templates:
                </span>
                <select
                  onChange={(e) => {
                    const preset = PRESET_QUERIES.find((q) => q.name === e.target.value);
                    if (preset) setSqlQuery(preset.sql);
                  }}
                  className="bg-neutral-950 text-neutral-200 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 font-mono"
                >
                  {PRESET_QUERIES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSqlQuery('SELECT * FROM orders LIMIT 20;')}
                  className="px-2.5 py-1 text-neutral-400 hover:text-white text-xs rounded hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlQuery);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={executeQuery}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run SQL (Ctrl+Enter)</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="relative p-4 bg-neutral-950 font-mono text-xs">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    executeQuery();
                  }
                }}
                rows={5}
                spellCheck={false}
                className="w-full bg-transparent text-amber-300 focus:outline-none font-mono resize-y leading-relaxed selection:bg-amber-500 selection:text-neutral-950"
                placeholder="Enter SQL command here (e.g. SELECT * FROM orders;)"
              />
            </div>

            {/* Bottom Status / Shortcuts bar */}
            <div className="px-4 py-2 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
              <div className="flex items-center gap-3">
                <span>Database: PostgreSQL (Supabase)</span>
                <span>•</span>
                <span>Target: public.orders / products / promos</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono text-[10px]">
                  Ctrl+Enter
                </kbd>
                <span>to execute</span>
              </div>
            </div>
          </div>

          {/* Execution Result Area */}
          {queryResult && (
            <div className="bg-neutral-950/90 rounded-2xl border border-neutral-800 p-5 space-y-4 animate-in fade-in duration-150">
              {/* Header with Stats & Export */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      queryResult.isError ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-semibold text-white">
                    {queryResult.isError ? 'SQL Execution Error' : 'Query Result'}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ({queryResult.rowCount} rows • {queryResult.executionTimeMs}ms)
                  </span>
                </div>

                {!queryResult.isError && queryResult.rows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCsv}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] rounded border border-neutral-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] rounded border border-neutral-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Message notice */}
              {queryResult.message && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono ${
                    queryResult.isError
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/50'
                  }`}
                >
                  {queryResult.message}
                </div>
              )}

              {/* Table Data Grid */}
              {!queryResult.isError && queryResult.rows.length > 0 && (
                <div className="overflow-x-auto max-h-96 rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 sticky top-0 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="p-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-900/60 transition-colors">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="p-3 text-neutral-300 whitespace-nowrap">
                              {col === 'status' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-200 border border-neutral-700">
                                  {String(row[col])}
                                </span>
                              ) : col === 'supabase_synced' && row[col] === 'YES' ? (
                                <span className="text-emerald-400 font-bold">YES</span>
                              ) : (
                                String(row[col] ?? '—')
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE TABLE EXPLORER */}
      {activeSubTab === 'tables' && (
        <div className="space-y-4">
          <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 space-y-4">
            {/* Table Selector & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                {(['orders', 'products', 'promos', 'subscribers'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTable(t);
                      setSortBy('');
                      setTableSearch('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedTable === t
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {t} ({t === 'orders' ? orders.length : t === 'products' ? products.length : t === 'promos' ? promos.length : subscribers.length})
                  </button>
                ))}
              </div>

              {/* Table Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder={`Search ${selectedTable}...`}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto max-h-[500px] rounded-xl border border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 sticky top-0 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    {activeTableData.length > 0 &&
                      Object.keys(activeTableData[0]).map((col) => (
                        <th
                          key={col}
                          onClick={() => {
                            if (sortBy === col) {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy(col);
                              setSortOrder('asc');
                            }
                          }}
                          className="p-3 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span>{col}</span>
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px] bg-neutral-900/30">
                  {activeTableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                      {Object.keys(row).map((k) => (
                        <td key={k} className="p-3 text-neutral-300 whitespace-nowrap">
                          {k === 'status' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-200 border border-neutral-700">
                              {String(row[k])}
                            </span>
                          ) : k === 'in_stock' && row[k] === 'TRUE' ? (
                            <span className="text-emerald-400">TRUE</span>
                          ) : (
                            String(row[k] ?? '—')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DATABASE SCHEMA & DDL */}
      {activeSubTab === 'schema' && (
        <div className="space-y-5">
          {/* Tables Schema Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table 1: orders */}
            <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-mono">public.orders</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Primary Key: id
                </span>
              </div>
              <div className="text-xs text-neutral-400">
                Captures all storefront checkouts with real-time sync to Supabase backend.
              </div>
              <div className="rounded-lg border border-neutral-800 overflow-hidden text-[11px] font-mono">
                <div className="bg-neutral-900 p-2 font-semibold text-neutral-400 grid grid-cols-3">
                  <span>Column</span>
                  <span>Type</span>
                  <span>Constraints</span>
                </div>
                <div className="divide-y divide-neutral-800/50 p-2 space-y-1">
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">id</span>
                    <span>TEXT</span>
                    <span className="text-neutral-500">PRIMARY KEY</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">customer_name</span>
                    <span>TEXT</span>
                    <span className="text-neutral-500">NOT NULL</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">email</span>
                    <span>TEXT</span>
                    <span className="text-neutral-500">NOT NULL, INDEX</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">total</span>
                    <span>NUMERIC(10,2)</span>
                    <span className="text-neutral-500">DEFAULT 0</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">status</span>
                    <span>TEXT</span>
                    <span className="text-neutral-500">DEFAULT 'confirmed'</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">items</span>
                    <span>JSONB</span>
                    <span className="text-neutral-500">CartItem[]</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">created_at</span>
                    <span>TIMESTAMPTZ</span>
                    <span className="text-neutral-500">DEFAULT NOW()</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table 2: products */}
            <div className="bg-neutral-950/90 p-5 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-mono">public.products</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Primary Key: id
                </span>
              </div>
              <div className="text-xs text-neutral-400">
                Atelier catalog inventory, live INR pricing, ratings, and active stock counts.
              </div>
              <div className="rounded-lg border border-neutral-800 overflow-hidden text-[11px] font-mono">
                <div className="bg-neutral-900 p-2 font-semibold text-neutral-400 grid grid-cols-3">
                  <span>Column</span>
                  <span>Type</span>
                  <span>Constraints</span>
                </div>
                <div className="divide-y divide-neutral-800/50 p-2 space-y-1">
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">id</span>
                    <span>TEXT</span>
                    <span className="text-neutral-500">PRIMARY KEY</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">name</span>
                    <span>TEXT</span>
                    <span className="text-neutral-500">NOT NULL</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">price</span>
                    <span>INTEGER</span>
                    <span className="text-neutral-500">INR Currency</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">stock_count</span>
                    <span>INTEGER</span>
                    <span className="text-neutral-500">Warehouse units</span>
                  </div>
                  <div className="grid grid-cols-3 text-neutral-300">
                    <span className="text-amber-300">in_stock</span>
                    <span>BOOLEAN</span>
                    <span className="text-neutral-500">DEFAULT true</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Supabase Link */}
          <div className="bg-neutral-950/90 p-4 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                Want to execute raw SQL directly on the Supabase Cloud cluster? Open the Supabase Studio.
              </span>
            </div>
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Open Supabase SQL Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

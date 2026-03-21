import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

const SIZES = ["S", "M", "L", "XL"];
const COLORS = ["Negro", "Blanco"];
const LOW_STOCK_THRESHOLD = 2;
const ORDER_STATUSES = {
  pagada: { label: "Pagada", icon: "check-circle", color: "#4a8c5c", bg: "#4a8c5c20" },
  porEntregar: { label: "Pagada × Entregar", icon: "package", color: "#C9A227", bg: "#C9A22720" },
  apartada: { label: "Apartada", icon: "lock", color: "#8B6914", bg: "#8B691420" },
};

// ─── LOGO SVG ──────────────────────────────────────────────
const Logo = ({ size = 36 }) => (
  <img src="/logo.png" alt="TT" style={{ height: size, width: "auto", objectFit: "contain" }} />
);

const Icon = ({ name, size = 22 }) => {
  const s = { width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    cart: <svg {...s} viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    box: <svg {...s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    chart: <svg {...s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    tag: <svg {...s} viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    minus: <svg {...s} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    plus: <svg {...s} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg {...s} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    check: <svg {...s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    "check-circle": <svg {...s} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    x: <svg {...s} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    search: <svg {...s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    rugby: <svg {...s} viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-30 12 12)"/><path d="M7 7l10 10M8.5 12l7-3M8.5 12l3 7"/></svg>,
    dollar: <svg {...s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    alert: <svg {...s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    clock: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    user: <svg {...s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    package: <svg {...s} viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    lock: <svg {...s} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    cash: <svg {...s} viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>,
    stripe: <svg {...s} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    male: <svg {...s} viewBox="0 0 24 24"><circle cx="10" cy="14" r="5"/><line x1="19" y1="5" x2="13.6" y2="10.4"/><line x1="19" y1="5" x2="15" y2="5"/><line x1="19" y1="5" x2="19" y2="9"/></svg>,
    female: <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><line x1="12" y1="13" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>,
    mail: <svg {...s} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>,
    phone: <svg {...s} viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    mappin: <svg {...s} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    note: <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    refresh: <svg {...s} viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    wifi: <svg {...s} viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    "wifi-off": <svg {...s} viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    archive: <svg {...s} viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    chevDown: <svg {...s} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>,
    chevUp: <svg {...s} viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>,
  };
  return icons[name] || null;
};

// ─── MOBILE HOOK ───────────────────────────────────────────
function useIsMobile() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w < 768;
}

const inputStyle = { width: "100%", padding: "8px 10px", background: "#F5F0E10A", border: "1px solid #F5F0E120", borderRadius: 8, color: "#F5F0E1", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600 };

// ─── MAIN APP ──────────────────────────────────────────────
export default function TercerTiempoPOS() {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [cuts, setCuts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [couponsDB, setCouponsDB] = useState([]);
  const [sales, setSales] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [view, setView] = useState("pos");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saleComplete, setSaleComplete] = useState(false);
  const [invFilter, setInvFilter] = useState("all");
  const [invGender, setInvGender] = useState("all");
  const [manualDiscount, setManualDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [orderStatus, setOrderStatus] = useState("pagada");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [showSaleDetail, setShowSaleDetail] = useState(null);
  const [salesFilter, setSalesFilter] = useState("all");
  const [posGender, setPosGender] = useState("hombre");
  const [showLegacy, setShowLegacy] = useState(false);

  // ─── LOAD DATA ───────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setSyncing(true);
      const [pRes, cRes, iRes, cpRes, sRes] = await Promise.all([
        supabase.from("products").select("*").order("id"),
        supabase.from("cuts").select("*"),
        supabase.from("inventory").select("*"),
        supabase.from("coupons").select("*").eq("active", true),
        supabase.from("sales").select("*, sale_items(*)").order("created_at", { ascending: false }).limit(100),
      ]);
      if (pRes.error) throw pRes.error;
      setProducts(pRes.data || []);
      setCuts(cRes.data || []);
      const invMap = {};
      (iRes.data || []).forEach(r => { invMap[`${r.product_id}|${r.cut_id}|${r.size}|${r.color}`] = r.stock; });
      setInventory(invMap);
      setCouponsDB(cpRes.data || []);
      const salesMapped = (sRes.data || []).map(s => ({
        id: s.id, date: s.created_at, customer: s.customer_name || "Sin nombre", email: s.customer_email, phone: s.customer_phone, address: s.customer_address, notes: s.notes,
        subtotal: parseFloat(s.subtotal), discount: parseFloat(s.discount), total: parseFloat(s.total),
        coupon: s.coupon_code, payment: s.payment_method, status: s.status,
        items: (s.sale_items || []).map(si => ({
          productId: si.product_id, name: (pRes.data || []).find(p => p.id === si.product_id)?.name || "?",
          cut: (cRes.data || []).find(c => c.id === si.cut_id)?.label || si.cut_id,
          cutId: si.cut_id, size: si.size, color: si.color, price: parseFloat(si.price), qty: si.qty, isApartada: si.is_apartada,
        })),
      }));
      setSales(salesMapped);
      setDbReady(true); setDbError(null);
    } catch (err) { setDbError(err.message); }
    finally { setSyncing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── COMPUTED ────────────────────────────────────────────
  const activeProducts = useMemo(() => products.filter(p => p.active !== false && !p.is_legacy), [products]);
  const legacyProducts = useMemo(() => products.filter(p => p.is_legacy), [products]);
  const activeCuts = useMemo(() => cuts.filter(c => !c.is_legacy), [cuts]);
  const legacyCuts = useMemo(() => cuts.filter(c => c.is_legacy), [cuts]);

  const cartSubtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const discountAmount = useMemo(() => {
    if (appliedCoupon) return appliedCoupon.type === "percent" ? Math.round(cartSubtotal * appliedCoupon.value / 100) : appliedCoupon.value;
    if (manualDiscount) { const d = parseInt(manualDiscount); return isNaN(d) ? 0 : d; }
    return 0;
  }, [cartSubtotal, appliedCoupon, manualDiscount]);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const hasApartadaItems = useMemo(() => cart.some(i => i.isApartada), [cart]);
  const effectiveStatus = hasApartadaItems ? "apartada" : orderStatus;
  const availableStatuses = hasApartadaItems ? ["apartada"] : ["pagada", "porEntregar"];

  const todaySales = useMemo(() => { const t = new Date().toDateString(); return sales.filter(s => new Date(s.date).toDateString() === t); }, [sales]);
  const totalRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const totalItems = todaySales.reduce((s, x) => s + x.items.reduce((a, i) => a + i.qty, 0), 0);
  const lowStockItems = useMemo(() => Object.entries(inventory).filter(([, q]) => q > 0 && q <= LOW_STOCK_THRESHOLD).length, [inventory]);
  const pendingOrders = useMemo(() => sales.filter(s => s.status === "porEntregar" || s.status === "apartada").length, [sales]);

  // ─── CART ACTIONS ────────────────────────────────────────
  const addToCart = useCallback((product, cut, size, color) => {
    const key = `${product.id}|${cut.id}|${size}|${color}`;
    const stock = inventory[key] || 0;
    if (stock <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) { if (ex.qty >= stock) return prev; return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i); }
      return [...prev, { key, productId: product.id, name: product.name, cut: cut.label, cutId: cut.id, size, color, price: parseFloat(cut.price), qty: 1, maxStock: stock, isApartada: false }];
    });
    if (isMobile) setShowCart(true);
  }, [inventory, isMobile]);

  const addApartadaToCart = useCallback((product, cut, size, color) => {
    const key = `${product.id}|${cut.id}|${size}|${color}`;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, productId: product.id, name: product.name, cut: cut.label, cutId: cut.id, size, color, price: parseFloat(cut.price), qty: 1, maxStock: 999, isApartada: true }];
    });
    if (isMobile) setShowCart(true);
  }, [isMobile]);

  const updateCartQty = useCallback((key, delta) => {
    setCart(prev => prev.map(i => { if (i.key !== key) return i; const n = i.qty + delta; if (n <= 0) return null; if (!i.isApartada && n > i.maxStock) return i; return { ...i, qty: n }; }).filter(Boolean));
  }, []);
  const removeFromCart = useCallback((key) => setCart(prev => prev.filter(i => i.key !== key)), []);

  const applyCoupon = useCallback(() => {
    const code = couponCode.trim().toUpperCase();
    const found = couponsDB.find(c => c.code.toUpperCase() === code);
    if (found) { setAppliedCoupon({ type: found.type, value: parseFloat(found.value), code: found.code, label: found.label }); setCouponError(""); setManualDiscount(""); }
    else { setCouponError("Cupón no válido"); setAppliedCoupon(null); }
  }, [couponCode, couponsDB]);

  const canCompleteSale = useMemo(() => {
    if (cart.length === 0) return false;
    if (hasApartadaItems) return customerName.trim() && customerEmail.trim() && customerPhone.trim() && customerAddress.trim();
    return true;
  }, [cart, customerName, customerEmail, customerPhone, customerAddress, hasApartadaItems]);

  const completeSale = useCallback(async () => {
    if (!canCompleteSale) return;
    setSyncing(true);
    try {
      let customerId = null;
      const email = customerEmail.trim() || null;
      if (email) {
        const { data: ex } = await supabase.from("customers").select("id").eq("email", email).maybeSingle();
        if (ex) { customerId = ex.id; }
        else {
          const { data: nc, error: ce } = await supabase.from("customers").insert({ name: customerName.trim() || null, email, phone: customerPhone.trim() || null, address: customerAddress.trim() || null }).select("id").single();
          if (ce) throw ce; customerId = nc.id;
        }
      } else if (customerName.trim()) {
        const { data: nc } = await supabase.from("customers").insert({ name: customerName.trim(), phone: customerPhone.trim() || null, address: customerAddress.trim() || null }).select("id").single();
        if (nc) customerId = nc.id;
      }
      const { data: sd, error: se } = await supabase.from("sales").insert({
        customer_id: customerId, customer_name: customerName.trim() || "Sin nombre", customer_email: email,
        customer_phone: customerPhone.trim() || null, customer_address: customerAddress.trim() || null,
        subtotal: cartSubtotal, discount: discountAmount, total: cartTotal,
        coupon_code: appliedCoupon?.code || null, payment_method: paymentMethod, status: effectiveStatus, notes: saleNotes.trim() || null,
      }).select("id").single();
      if (se) throw se;
      const items = cart.map(item => ({ sale_id: sd.id, product_id: item.productId, cut_id: item.cutId, size: item.size, color: item.color, price: item.price, qty: item.qty, is_apartada: item.isApartada }));
      const { error: ie } = await supabase.from("sale_items").insert(items);
      if (ie) throw ie;
      setCart([]); setCouponCode(""); setAppliedCoupon(null); setManualDiscount("");
      setCustomerName(""); setCustomerEmail(""); setCustomerPhone(""); setCustomerAddress(""); setSaleNotes("");
      setOrderStatus("pagada"); setShowCart(false); setSaleComplete(true); setTimeout(() => setSaleComplete(false), 2500);
      await loadData();
    } catch (err) { alert("Error: " + err.message); }
    finally { setSyncing(false); }
  }, [canCompleteSale, cart, cartSubtotal, discountAmount, cartTotal, appliedCoupon, paymentMethod, effectiveStatus, customerName, customerEmail, customerPhone, customerAddress, saleNotes, loadData]);

  const updateSaleStatus = useCallback(async (saleId, ns) => {
    const { error } = await supabase.from("sales").update({ status: ns }).eq("id", saleId);
    if (!error) setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: ns } : s));
  }, []);

  const adjustInventory = useCallback(async (key, delta) => {
    const [pid, cutId, size, color] = key.split("|");
    const cur = inventory[key] || 0;
    const ns = Math.max(0, cur + delta);
    setInventory(prev => ({ ...prev, [key]: ns }));
    const { error } = await supabase.from("inventory").update({ stock: ns }).eq("product_id", parseInt(pid)).eq("cut_id", cutId).eq("size", size).eq("color", color);
    if (error) setInventory(prev => ({ ...prev, [key]: cur }));
  }, [inventory]);

  const filteredProducts = useMemo(() => {
    const list = showLegacy ? legacyProducts : activeProducts;
    if (!searchTerm) return list;
    const t = searchTerm.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(t) || p.tag.toLowerCase().includes(t));
  }, [searchTerm, activeProducts, legacyProducts, showLegacy]);

  const currentCuts = showLegacy ? legacyCuts : activeCuts;
  const getStock = (pid, cutId, size, color) => inventory[`${pid}|${cutId}|${size}|${color}`] || 0;
  const fmt = (n) => `$${Number(n).toLocaleString("es-MX")}`;
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  // ─── LOADING ─────────────────────────────────────────────
  if (!dbReady && !dbError) return (
    <div style={{ fontFamily: "'Rajdhani', sans-serif", background: "#0D1B0F", color: "#F5F0E1", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Logo size={80} />
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: "#C9A227" }}>TERCER TIEMPO</div>
      <div style={{ fontSize: 14, opacity: 0.5, letterSpacing: 2 }}>CONECTANDO...</div>
      <div style={{ width: 40, height: 40, border: "3px solid #C9A22733", borderTop: "3px solid #C9A227", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (dbError) return (
    <div style={{ fontFamily: "'Rajdhani', sans-serif", background: "#0D1B0F", color: "#F5F0E1", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ color: "#8B0000" }}><Icon name="wifi-off" size={48} /></div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#8B0000", letterSpacing: 2 }}>ERROR DE CONEXIÓN</div>
      <div style={{ fontSize: 13, opacity: 0.6, textAlign: "center", maxWidth: 400 }}>{dbError}</div>
      <button onClick={loadData} style={{ background: "#C9A227", color: "#0D1B0F", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, cursor: "pointer" }}>REINTENTAR</button>
    </div>
  );

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Rajdhani', 'Segoe UI', sans-serif", background: "#0D1B0F", color: "#F5F0E1", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontSize: isMobile ? 14 : 15 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* TOP BAR */}
      <div style={{ background: "linear-gradient(135deg, #1A472A 0%, #0D1B0F 100%)", borderBottom: "2px solid #C9A227", padding: isMobile ? "8px 10px" : "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 6 : 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={isMobile ? 28 : 36} />
          {!isMobile && <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 3, color: "#C9A227", lineHeight: 1 }}>TERCER TIEMPO</div>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#F5F0E199", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              SISTEMA DE VENTAS {syncing ? <span style={{ color: "#C9A227" }}><Icon name="refresh" size={8} /></span> : <span style={{ color: "#4a8c5c" }}><Icon name="wifi" size={8} /></span>}
            </div>
          </div>}
        </div>
        <div style={{ display: "flex", gap: isMobile ? 4 : 8 }}>
          {[
            { id: "pos", icon: "cart", label: "Venta", badge: cart.length > 0 ? cart.length : null, badgeBg: "#8B0000" },
            { id: "orders", icon: "clock", label: "Pedidos", badge: pendingOrders > 0 ? pendingOrders : null, badgeBg: "#C9A227" },
            { id: "inv", icon: "box", label: "Inventario" },
            { id: "dash", icon: "chart", label: "Dashboard" },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setView(tab.id); if (tab.id !== "pos") setShowCart(false); if (tab.id === "inv" || tab.id === "dash") loadData(); }} style={{
              background: view === tab.id ? "#C9A227" : "transparent", color: view === tab.id ? "#0D1B0F" : "#F5F0E1",
              border: view === tab.id ? "none" : "1px solid #F5F0E133", borderRadius: 10,
              padding: isMobile ? "6px 10px" : "8px 16px",
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: isMobile ? 11 : 13, textTransform: "uppercase",
              letterSpacing: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: isMobile ? 3 : 6,
            }}>
              <Icon name={tab.icon} size={isMobile ? 14 : 16} /> {isMobile ? "" : tab.label}
              {tab.badge && <span style={{ background: tab.badgeBg, color: tab.badgeBg === "#C9A227" ? "#0D1B0F" : "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>{tab.badge}</span>}
            </button>
          ))}
        </div>
        {!isMobile && <div style={{ textAlign: "right", fontSize: 12, opacity: 0.6 }}>
          <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div>{todaySales.length} ventas · {pendingOrders} pendientes</div>
        </div>}
      </div>

      {/* TOAST */}
      {saleComplete && (
        <div style={{ position: "fixed", top: isMobile ? 60 : 80, left: "50%", transform: "translateX(-50%)", background: "#1A472A", border: "2px solid #C9A227", borderRadius: 16, padding: "14px 28px", zIndex: 999, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", animation: "slideDown 0.3s ease" }}>
          <div style={{ background: "#C9A227", borderRadius: 99, padding: 5, color: "#0D1B0F" }}><Icon name="check" size={20} /></div>
          <div><div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>VENTA REGISTRADA</div></div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {view === "pos" && <POSView {...{ products: filteredProducts, cuts: currentCuts, allCuts: cuts, searchTerm, setSearchTerm, selectedProduct, setSelectedProduct, cart, addToCart, addApartadaToCart, updateCartQty, removeFromCart, getStock, cartSubtotal, cartTotal, discountAmount, couponCode, setCouponCode, applyCoupon, appliedCoupon, setAppliedCoupon, couponError, setCouponError, manualDiscount, setManualDiscount, paymentMethod, setPaymentMethod, orderStatus, setOrderStatus, effectiveStatus, availableStatuses, hasApartadaItems, customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone, customerAddress, setCustomerAddress, saleNotes, setSaleNotes, completeSale, canCompleteSale, fmt, posGender, setPosGender, syncing, isMobile, showCart, setShowCart, showLegacy, setShowLegacy, legacyProducts }} />}
        {view === "orders" && <OrdersView {...{ sales, updateSaleStatus, salesFilter, setSalesFilter, fmt, fmtTime, isMobile }} />}
        {view === "inv" && <InventoryView {...{ inventory, adjustInventory, invFilter, setInvFilter, invGender, setInvGender, fmt, cuts: activeCuts, products: activeProducts, isMobile }} />}
        {view === "dash" && <DashboardView {...{ todaySales, sales, totalRevenue, totalItems, fmt, fmtTime, showSaleDetail, setShowSaleDetail, isMobile }} />}
      </div>

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #C9A22744; border-radius: 3px; }
        input:focus, textarea:focus { outline: 2px solid #C9A227; outline-offset: -2px; }
        [style*="overflow: auto"], [style*="overflow:auto"] { -webkit-overflow-scrolling: touch; }
        * { -webkit-overflow-scrolling: touch; }
      `}</style>
    </div>
  );
}

// ─── POS VIEW ──────────────────────────────────────────────
function POSView({ products, cuts, allCuts, searchTerm, setSearchTerm, selectedProduct, setSelectedProduct, cart, addToCart, addApartadaToCart, updateCartQty, removeFromCart, getStock, cartSubtotal, cartTotal, discountAmount, couponCode, setCouponCode, applyCoupon, appliedCoupon, setAppliedCoupon, couponError, setCouponError, manualDiscount, setManualDiscount, paymentMethod, setPaymentMethod, orderStatus, setOrderStatus, effectiveStatus, availableStatuses, hasApartadaItems, customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone, customerAddress, setCustomerAddress, saleNotes, setSaleNotes, completeSale, canCompleteSale, fmt, posGender, setPosGender, syncing, isMobile, showCart, setShowCart, showLegacy, setShowLegacy, legacyProducts }) {
  const tagColors = { HERO: "#C9A227", MASCOTA: "#4a8c5c", HUMOR: "#8B0000", LIFESTYLE: "#3a6b8c", "CLÁSICA": "#666", TANK: "#8B5E34", LEGACY: "#555" };
  const cutsForGender = cuts.filter(c => c.gender === posGender);

  const cartPanel = (
    <div style={{ display: "flex", flexDirection: "column", background: "#0D1B0F", height: "100%", width: "100%" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #F5F0E110" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {isMobile && <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", color: "#F5F0E1", cursor: "pointer", padding: 4 }}><Icon name="chevDown" size={20} /></button>}
          <Icon name="cart" size={18} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2 }}>CARRITO</span>
          {hasApartadaItems && <span style={{ background: "#8B691440", border: "1px solid #8B691466", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#8B6914", display: "flex", alignItems: "center", gap: 3 }}><Icon name="lock" size={10} /> APARTADO</span>}
          <span style={{ fontSize: 12, opacity: 0.4, marginLeft: "auto" }}>{cart.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: hasApartadaItems ? "#8B6914" : "#F5F0E144", flexShrink: 0 }}><Icon name="user" size={14} /></span><input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={hasApartadaItems ? "Nombre *" : "Nombre"} style={inputStyle} /></div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: hasApartadaItems ? "#8B6914" : "#F5F0E144", flexShrink: 0 }}><Icon name="mail" size={14} /></span><input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder={hasApartadaItems ? "Email *" : "Email"} type="email" style={inputStyle} /></div>
          </div>
          {hasApartadaItems && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, animation: "fadeIn 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: "#8B6914", flexShrink: 0 }}><Icon name="phone" size={14} /></span><input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Teléfono *" style={inputStyle} /></div>
              <div style={{ display: "flex", alignItems: "start", gap: 5 }}><span style={{ color: "#8B6914", flexShrink: 0, marginTop: 8 }}><Icon name="mappin" size={14} /></span><textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Dirección *" rows={2} style={{ ...inputStyle, resize: "none" }} /></div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "start", gap: 5 }}><span style={{ color: "#F5F0E144", flexShrink: 0, marginTop: 8 }}><Icon name="note" size={14} /></span><textarea value={saleNotes} onChange={e => setSaleNotes(e.target.value)} placeholder="Notas" rows={1} style={{ ...inputStyle, resize: "none", fontSize: 13 }} /></div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, opacity: 0.3 }}><Icon name="rugby" size={36} /><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, marginTop: 10 }}>SIN PRODUCTOS</div></div>
        ) : cart.map(item => (
          <div key={item.key} style={{ background: item.isApartada ? "#8B691415" : "#F5F0E108", borderRadius: 12, padding: 12, marginBottom: 8, border: item.isApartada ? "1px solid #8B691433" : "1px solid #F5F0E110" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>{item.name}{item.isApartada && <span style={{ background: "#8B691440", borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 800, color: "#8B6914" }}>APARTADO</span>}</div>
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>{item.cut} · {item.size} · <span style={{ width: 8, height: 8, borderRadius: 99, background: item.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133", display: "inline-block" }} /> {item.color}</div>
              </div>
              <button onClick={() => removeFromCart(item.key)} style={{ background: "none", border: "none", color: "#8B0000", cursor: "pointer", padding: 4, opacity: 0.6 }}><Icon name="trash" size={16} /></button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", background: "#F5F0E10F", borderRadius: 8 }}>
                <button onClick={() => updateCartQty(item.key, -1)} style={{ background: "none", border: "none", color: "#F5F0E1", cursor: "pointer", padding: "6px 12px" }}><Icon name="minus" size={14} /></button>
                <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => updateCartQty(item.key, 1)} style={{ background: "none", border: "none", color: "#F5F0E1", cursor: "pointer", padding: "6px 12px", opacity: !item.isApartada && item.qty >= item.maxStock ? 0.3 : 1 }}><Icon name="plus" size={14} /></button>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: item.isApartada ? "#8B6914" : "#C9A227" }}>{fmt(item.price * item.qty)}</div>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div style={{ borderTop: "2px solid #C9A227", padding: 14, background: "#1A472A15" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            {Object.entries(ORDER_STATUSES).filter(([k]) => availableStatuses.includes(k)).map(([key, st]) => (
              <button key={key} onClick={() => !hasApartadaItems && setOrderStatus(key)} style={{
                flex: 1, padding: "5px 2px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: hasApartadaItems ? "default" : "pointer", fontFamily: "'Rajdhani', sans-serif", textAlign: "center",
                background: (hasApartadaItems ? key === "apartada" : orderStatus === key) ? st.bg : "transparent",
                color: (hasApartadaItems ? key === "apartada" : orderStatus === key) ? st.color : "#F5F0E155",
                border: (hasApartadaItems ? key === "apartada" : orderStatus === key) ? `2px solid ${st.color}` : "1px solid #F5F0E120",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}><Icon name={st.icon} size={16} /><div style={{ lineHeight: 1.1 }}>{st.label}</div></button>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            {!appliedCoupon ? (
              <div style={{ display: "flex", gap: 6 }}>
                <input value={couponCode} onChange={e => { setCouponCode(e.target.value); setCouponError(""); }} placeholder="Cupón" style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
                <button onClick={applyCoupon} style={{ background: "#C9A227", color: "#0D1B0F", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>OK</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#C9A22715", padding: "6px 10px", borderRadius: 8 }}>
                <Icon name="tag" size={14} /><span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{appliedCoupon.code}</span>
                <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", color: "#8B0000", cursor: "pointer" }}><Icon name="x" size={14} /></button>
              </div>
            )}
            {couponError && <div style={{ color: "#8B0000", fontSize: 11, marginTop: 3, fontWeight: 700 }}>{couponError}</div>}
            {!appliedCoupon && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><span style={{ fontSize: 11, opacity: 0.5 }}>Desc $</span><input value={manualDiscount} onChange={e => setManualDiscount(e.target.value.replace(/\D/g, ""))} placeholder="0" style={{ width: 60, ...inputStyle, textAlign: "right", padding: "3px 8px" }} /></div>}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[["efectivo","cash","Efectivo"],["stripe","stripe","Stripe"]].map(([m,ic,l]) => (
              <button key={m} onClick={() => setPaymentMethod(m)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif",
                background: paymentMethod === m ? (m === "stripe" ? "#635BFF" : "#C9A227") : "transparent",
                color: paymentMethod === m ? "#fff" : "#F5F0E1", border: paymentMethod === m ? "none" : "1px solid #F5F0E120",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}><Icon name={ic} size={16} /> {l}</button>
            ))}
          </div>
          <div style={{ fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.6 }}><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
            {discountAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#C9A227" }}><span>Desc.</span><span>-{fmt(discountAmount)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, marginTop: 4, color: "#C9A227" }}><span>TOTAL</span><span>{fmt(cartTotal)}</span></div>
          </div>
          <button onClick={completeSale} disabled={!canCompleteSale || syncing} style={{
            width: "100%", padding: "14px 0", marginTop: 10, opacity: canCompleteSale && !syncing ? 1 : 0.4,
            background: `linear-gradient(135deg, ${ORDER_STATUSES[effectiveStatus].color}, ${ORDER_STATUSES[effectiveStatus].color}cc)`,
            border: "none", borderRadius: 12, color: effectiveStatus === "pagada" ? "#fff" : "#0D1B0F",
            cursor: canCompleteSale && !syncing ? "pointer" : "not-allowed",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Icon name={syncing ? "refresh" : ORDER_STATUSES[effectiveStatus].icon} size={20} />
            {syncing ? "GUARDANDO..." : effectiveStatus === "pagada" ? "COBRAR" : effectiveStatus === "porEntregar" ? "REGISTRAR" : "APARTAR"} {fmt(cartTotal)}
          </button>
          {!canCompleteSale && hasApartadaItems && <div style={{ fontSize: 10, color: "#8B6914", marginTop: 6, textAlign: "center", fontWeight: 600 }}>Completa todos los campos para apartar</div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
      {/* LEFT: Products */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: isMobile ? "none" : "1px solid #F5F0E115" }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #F5F0E110", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 150 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}><Icon name="search" size={16} /></div>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." style={{ ...inputStyle, paddingLeft: 36, fontSize: 14 }} />
          </div>
          <div style={{ display: "flex", background: "#F5F0E10A", borderRadius: 8, overflow: "hidden", border: "1px solid #F5F0E120" }}>
            {[["hombre", "male", "H"], ["mujer", "female", "M"]].map(([g, ic, label]) => (
              <button key={g} onClick={() => setPosGender(g)} style={{
                padding: "6px 12px", border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12,
                background: posGender === g ? (g === "hombre" ? "#3a6b8c" : "#8B4566") : "transparent",
                color: posGender === g ? "#fff" : "#F5F0E166", display: "flex", alignItems: "center", gap: 4,
              }}><Icon name={ic} size={13} /> {isMobile ? label : (g === "hombre" ? "Hombre" : "Mujer")}</button>
            ))}
          </div>
          {/* Legacy toggle */}
          {legacyProducts.length > 0 && (
            <button onClick={() => setShowLegacy(!showLegacy)} style={{
              padding: "6px 12px", borderRadius: 8, border: showLegacy ? "2px solid #555" : "1px solid #F5F0E120",
              background: showLegacy ? "#55555533" : "transparent", color: showLegacy ? "#aaa" : "#F5F0E144",
              cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 11,
              display: "flex", alignItems: "center", gap: 4, letterSpacing: 1,
            }}><Icon name="archive" size={13} /> {isMobile ? "" : "LEGACY"}</button>
          )}
        </div>

        {showLegacy && <div style={{ background: "#55555520", padding: "6px 12px", borderBottom: "1px solid #55555533", fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="archive" size={12} /> Productos temporales/legacy de ventas anteriores
        </div>}

        {/* Single scrollable container for products + variants */}
        <div style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch", padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(200px, 1fr))", gap: isMobile ? 8 : 12, alignContent: "start" }}>
          {products.map(p => (
            <button key={p.id} onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}
              style={{
                background: selectedProduct?.id === p.id ? "linear-gradient(135deg, #1A472A, #2a6b3a)" : "#F5F0E108",
                border: selectedProduct?.id === p.id ? "2px solid #C9A227" : "1px solid #F5F0E115",
                borderRadius: 14, padding: isMobile ? "14px 12px" : "18px 16px", cursor: "pointer", textAlign: "left",
                color: "#F5F0E1", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6,
                minHeight: isMobile ? 90 : 110,
              }}>
              <span style={{ background: tagColors[p.tag] || "#666", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Rajdhani', sans-serif", color: p.tag === "HERO" ? "#0D1B0F" : "#fff", alignSelf: "flex-start" }}>{p.tag}</span>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 17 : 20, letterSpacing: 1, lineHeight: 1.1, marginTop: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: "auto" }}>{cutsForGender.length} corte{cutsForGender.length > 1 ? "s" : ""} · desde {fmt(Math.min(...(cutsForGender.length ? cutsForGender.map(c => c.price) : [0])))}</div>
            </button>
          ))}
          </div>

          {/* Variant Selector - inside same scroll */}
          {selectedProduct && (
            <VariantPanel {...{ selectedProduct, cutsForGender, getStock, addToCart, addApartadaToCart, fmt, isMobile, posGender }} />
          )}
        </div>
      </div>

      {/* RIGHT: Cart - Desktop */}
      {!isMobile && <div style={{ width: 370, display: "flex", flexDirection: "column" }}>{cartPanel}</div>}

      {/* MOBILE: Cart overlay */}
      {isMobile && showCart && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, top: 0, zIndex: 50, background: "#0D1B0F", animation: "slideUp 0.25s ease", display: "flex", flexDirection: "column" }}>
          {cartPanel}
        </div>
      )}

      {/* MOBILE: Cart FAB */}
      {isMobile && !showCart && cart.length > 0 && (
        <button onClick={() => setShowCart(true)} style={{
          position: "absolute", bottom: 20, right: 16, zIndex: 40,
          background: "#C9A227", border: "none", borderRadius: 99, width: 60, height: 60, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)", color: "#0D1B0F",
        }}>
          <Icon name="cart" size={22} />
          <span style={{ fontSize: 10, fontWeight: 800 }}>{cart.length}</span>
        </button>
      )}
    </div>
  );
}

// ─── VARIANT PANEL (auto-scrolls into view) ────────────────
function VariantPanel({ selectedProduct, cutsForGender, getStock, addToCart, addApartadaToCart, fmt, isMobile, posGender }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedProduct?.id]);

  return (
    <div ref={ref} style={{ borderTop: "2px solid #C9A227", background: "linear-gradient(180deg, #1A472A, #0D1B0F)", padding: isMobile ? 12 : 16, marginTop: 12, borderRadius: 14, animation: "fadeIn 0.2s ease" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 18 : 22, letterSpacing: 2, marginBottom: 12 }}>
        {selectedProduct.name}<span style={{ fontSize: 12, opacity: 0.5, fontFamily: "'Rajdhani', sans-serif", marginLeft: 8 }}>— {posGender === "hombre" ? "Hombre" : "Mujer"}</span>
      </div>
      {cutsForGender.map(cut => (
        <div key={cut.id} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #F5F0E110", paddingBottom: 4, display: "flex", justifyContent: "space-between" }}>
            <span>{cut.label}</span><span style={{ color: "#C9A227" }}>{fmt(cut.price)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${isMobile ? 4 : COLORS.length * SIZES.length}, minmax(60px, 1fr))`, gap: 5 }}>
            {SIZES.map(size => COLORS.map(color => {
              const stock = getStock(selectedProduct.id, cut.id, size, color);
              const isLow = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
              const isOut = stock <= 0;
              return (
                <button key={`${size}-${color}`} onClick={() => isOut ? addApartadaToCart(selectedProduct, cut, size, color) : addToCart(selectedProduct, cut, size, color)}
                  style={{ background: isOut ? "#8B691420" : color === "Negro" ? "#18181b" : "#F5F0E112", border: isOut ? "2px dashed #8B691466" : isLow ? "2px solid #C9A22788" : "1px solid #F5F0E125", borderRadius: 10, padding: "6px 4px", cursor: "pointer", color: "#F5F0E1", opacity: isOut ? 0.7 : 1, textAlign: "center", fontFamily: "'Rajdhani', sans-serif", position: "relative" }}>
                  <div style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: 99, background: color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E144" }} />
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{size}</div>
                  <div style={{ fontSize: 9, opacity: 0.6 }}>{color}</div>
                  {isOut ? <div style={{ fontSize: 8, fontWeight: 800, color: "#8B6914", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}><Icon name="lock" size={7} /> APARTAR</div>
                    : <div style={{ fontSize: 9, fontWeight: 800, color: isLow ? "#C9A227" : "#4a8c5c" }}>{stock}</div>}
                </button>
              );
            }))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ORDERS VIEW ───────────────────────────────────────────
function OrdersView({ sales, updateSaleStatus, salesFilter, setSalesFilter, fmt, fmtTime, isMobile }) {
  const filtered = useMemo(() => salesFilter === "all" ? sales : sales.filter(s => s.status === salesFilter), [sales, salesFilter]);
  const counts = useMemo(() => ({ all: sales.length, pagada: sales.filter(s => s.status === "pagada").length, porEntregar: sales.filter(s => s.status === "porEntregar").length, apartada: sales.filter(s => s.status === "apartada").length }), [sales]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 6, padding: "12px", borderBottom: "1px solid #F5F0E110", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "Todos", icon: "box", color: "#F5F0E1" },
          { key: "pagada", label: isMobile ? "" : "Pagadas", icon: "check-circle", color: "#4a8c5c" },
          { key: "porEntregar", label: isMobile ? "" : "Por Entregar", icon: "package", color: "#C9A227" },
          { key: "apartada", label: isMobile ? "" : "Apartadas", icon: "lock", color: "#8B6914" },
        ].map(f => (
          <button key={f.key} onClick={() => setSalesFilter(f.key)} style={{
            background: salesFilter === f.key ? f.color + "22" : "transparent", color: salesFilter === f.key ? f.color : "#F5F0E155",
            border: salesFilter === f.key ? `2px solid ${f.color}` : "1px solid #F5F0E120", borderRadius: 10, padding: "8px 14px",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", display: "flex", alignItems: "center", gap: 6,
          }}><Icon name={f.icon} size={14} /> {f.label} <span style={{ background: f.color + "33", padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>{counts[f.key]}</span></button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: isMobile ? 10 : 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, opacity: 0.3 }}><Icon name="clock" size={48} /><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, marginTop: 12 }}>SIN PEDIDOS</div></div>
        ) : filtered.map(sale => {
          const st = ORDER_STATUSES[sale.status];
          return (
            <div key={sale.id} style={{ background: "#F5F0E108", border: `1px solid ${st.color}33`, borderRadius: 14, padding: isMobile ? 12 : 16, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ background: st.bg, border: `1px solid ${st.color}44`, borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: st.color }}><Icon name={st.icon} size={16} /></span>
                  {!isMobile && <span style={{ fontWeight: 700, fontSize: 11, color: st.color, textTransform: "uppercase", letterSpacing: 1 }}>{st.label}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 17 : 20, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}><Icon name="user" size={14} /> {sale.customer}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    {sale.email && <span><Icon name="mail" size={9} /> {sale.email}</span>}
                    <span>· {new Date(sale.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · {fmtTime(sale.date)}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 22 : 26, color: "#C9A227" }}>{fmt(sale.total)}</div>
              </div>
              {sale.phone && (
                <div style={{ background: "#8B691415", border: "1px solid #8B691433", borderRadius: 8, padding: "6px 10px", marginBottom: 10, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: "#8B6914", display: "flex", alignItems: "center", gap: 3 }}><Icon name="phone" size={11} /> {sale.phone}</span>
                  <span style={{ color: "#8B6914", display: "flex", alignItems: "start", gap: 3, flex: 1 }}><Icon name="mappin" size={11} /> {sale.address}</span>
                </div>
              )}
              {sale.notes && <div style={{ background: "#F5F0E108", borderRadius: 8, padding: "5px 10px", marginBottom: 10, fontSize: 12, opacity: 0.7, display: "flex", gap: 4 }}><Icon name="note" size={11} /> {sale.notes}</div>}
              <div style={{ background: "#F5F0E105", borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>
                {sale.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: idx < sale.items.length - 1 ? "1px solid #F5F0E108" : "none", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: item.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133", display: "inline-block", flexShrink: 0 }} />
                      {item.name} · {item.cut} · {item.size} x{item.qty}
                      {item.isApartada && <span style={{ background: "#8B691440", borderRadius: 3, padding: "0 4px", fontSize: 9, fontWeight: 800, color: "#8B6914" }}>APT</span>}
                    </span>
                    <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              {sale.status !== "pagada" && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {sale.status === "porEntregar" && <button onClick={() => updateSaleStatus(sale.id, "pagada")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#4a8c5c", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="check-circle" size={16} /> ENTREGADO</button>}
                  {sale.status === "apartada" && (
                    <>
                      <button onClick={() => updateSaleStatus(sale.id, "porEntregar")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#C9A227", color: "#0D1B0F", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="package" size={16} /> YA PAGÓ</button>
                      <button onClick={() => updateSaleStatus(sale.id, "pagada")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#4a8c5c", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon name="check-circle" size={16} /> COMPLETADA</button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── INVENTORY VIEW ────────────────────────────────────────
function InventoryView({ inventory, adjustInventory, invFilter, setInvFilter, invGender, setInvGender, fmt, cuts, products, isMobile }) {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const genderCuts = invGender === "all" ? cuts : cuts.filter(c => c.gender === invGender);
  const getProductStock = (pid) => Object.entries(inventory).filter(([k]) => k.startsWith(`${pid}|`) && (invGender === "all" || genderCuts.some(c => k.includes(c.id)))).reduce((s, [, q]) => s + q, 0);
  const totalStock = products.reduce((s, p) => s + getProductStock(p.id), 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8, padding: "12px", borderBottom: "1px solid #F5F0E110" }}>
        {[
          { label: "Total", value: totalStock, icon: "box", color: "#C9A227" },
          { label: "Stock bajo", value: Object.entries(inventory).filter(([k, q]) => (invGender === "all" || genderCuts.some(c => k.includes(c.id))) && q > 0 && q <= LOW_STOCK_THRESHOLD).length, icon: "alert", color: "#C9A227" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#F5F0E108", borderRadius: 12, padding: "10px 12px", border: "1px solid #F5F0E110" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}><span style={{ color: s.color }}><Icon name={s.icon} size={12} /></span><span style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, textTransform: "uppercase" }}>{s.label}</span></div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ key: "all", label: "Todos" }, { key: "low", label: "Bajo" }, { key: "out", label: "Agotados" }].map(f => (
            <button key={f.key} onClick={() => setInvFilter(f.key)} style={{ background: invFilter === f.key ? "#C9A227" : "transparent", color: invFilter === f.key ? "#0D1B0F" : "#F5F0E1", border: invFilter === f.key ? "none" : "1px solid #F5F0E120", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", background: "#F5F0E10A", borderRadius: 8, overflow: "hidden", border: "1px solid #F5F0E120" }}>
          {[["all", "Todos"], ["hombre", "H"], ["mujer", "M"]].map(([g, label]) => (
            <button key={g} onClick={() => setInvGender(g)} style={{ padding: "5px 12px", border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 11, background: invGender === g ? (g === "hombre" ? "#3a6b8c" : g === "mujer" ? "#8B4566" : "#C9A227") : "transparent", color: invGender === g ? "#fff" : "#F5F0E166" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 12px 12px" }}>
        {products.map(product => {
          const totalPcs = getProductStock(product.id);
          const variants = Object.entries(inventory).filter(([k]) => k.startsWith(`${product.id}|`) && (invGender === "all" || genderCuts.some(c => k.includes(c.id))))
            .map(([key, qty]) => { const p = key.split("|"); const cut = cuts.find(c => c.id === p[1]); return { key, qty, cutLabel: cut?.label || p[1], size: p[2], color: p[3] }; })
            .filter(v => { if (invFilter === "low") return v.qty > 0 && v.qty <= LOW_STOCK_THRESHOLD; if (invFilter === "out") return v.qty === 0; return true; });
          if (invFilter !== "all" && variants.length === 0) return null;
          const byCut = {}; variants.forEach(v => { if (!byCut[v.cutLabel]) byCut[v.cutLabel] = []; byCut[v.cutLabel].push(v); });
          return (
            <div key={product.id} style={{ marginBottom: 8 }}>
              <button onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                style={{ width: "100%", background: "#F5F0E108", border: "1px solid #F5F0E115", borderRadius: expandedProduct === product.id ? "12px 12px 0 0" : 12, padding: "12px 14px", cursor: "pointer", color: "#F5F0E1", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: "#0D1B0F", background: "#C9A227", width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{product.id}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div></div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: totalPcs <= LOW_STOCK_THRESHOLD * genderCuts.length ? "#C9A227" : "#F5F0E1" }}>{totalPcs}</div>
                <Icon name={expandedProduct === product.id ? "chevUp" : "chevDown"} size={14} />
              </button>
              {expandedProduct === product.id && (
                <div style={{ background: "#F5F0E105", border: "1px solid #F5F0E115", borderTop: "none", borderRadius: "0 0 12px 12px", padding: 10 }}>
                  {Object.entries(byCut).map(([cutLabel, items]) => (
                    <div key={cutLabel} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, borderBottom: "1px solid #F5F0E110", paddingBottom: 3 }}>{cutLabel}</div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(110px, 1fr))", gap: 5 }}>
                        {items.map(v => (
                          <div key={v.key} style={{ background: v.qty === 0 ? "#8B000015" : v.qty <= LOW_STOCK_THRESHOLD ? "#C9A22715" : "#F5F0E108", border: `1px solid ${v.qty === 0 ? "#8B000033" : v.qty <= LOW_STOCK_THRESHOLD ? "#C9A22733" : "#F5F0E115"}`, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                              <span style={{ width: 7, height: 7, borderRadius: 99, background: v.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133" }} /> {v.size} · {v.color}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
                              <button onClick={() => adjustInventory(v.key, -1)} style={{ background: "#F5F0E110", border: "none", borderRadius: 6, color: "#F5F0E1", cursor: "pointer", padding: "5px 10px" }}><Icon name="minus" size={12} /></button>
                              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, minWidth: 28, color: v.qty === 0 ? "#8B0000" : v.qty <= LOW_STOCK_THRESHOLD ? "#C9A227" : "#F5F0E1" }}>{v.qty}</span>
                              <button onClick={() => adjustInventory(v.key, 1)} style={{ background: "#F5F0E110", border: "none", borderRadius: 6, color: "#F5F0E1", cursor: "pointer", padding: "5px 10px" }}><Icon name="plus" size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW ────────────────────────────────────────
function DashboardView({ todaySales, sales, totalRevenue, totalItems, fmt, fmtTime, showSaleDetail, setShowSaleDetail, isMobile }) {
  const avgTicket = todaySales.length > 0 ? Math.round(totalRevenue / todaySales.length) : 0;
  const byStatus = {}; todaySales.forEach(s => { byStatus[s.status] = (byStatus[s.status] || 0) + 1; });
  const uniqueEmails = new Set(sales.map(s => s.email?.toLowerCase()).filter(Boolean));

  return (
    <div style={{ flex: 1, overflow: "auto", padding: isMobile ? 10 : 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Ventas hoy", value: todaySales.length, icon: "cart", color: "#C9A227" },
          { label: "Ingreso", value: fmt(totalRevenue), icon: "dollar", color: "#4a8c5c" },
          { label: "Piezas", value: totalItems, icon: "box", color: "#F5F0E1" },
          { label: "Ticket prom.", value: fmt(avgTicket), icon: "tag", color: "#C9A227" },
          { label: "Contactos", value: uniqueEmails.size, icon: "mail", color: "#3a6b8c" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "#F5F0E108", borderRadius: 14, padding: "14px 12px", border: "1px solid #F5F0E110" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}><span style={{ color: kpi.color }}><Icon name={kpi.icon} size={14} /></span><span style={{ fontSize: 9, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{kpi.label}</span></div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 24 : 30, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#F5F0E108", borderRadius: 14, padding: 16, border: "1px solid #F5F0E110" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, marginBottom: 10, color: "#C9A227" }}>POR STATUS</div>
          {Object.entries(ORDER_STATUSES).map(([key, st]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F5F0E108" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: st.color }}><Icon name={st.icon} size={14} /></span><span style={{ fontWeight: 600, fontSize: 13 }}>{st.label}</span></div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: st.color }}>{byStatus[key] || 0}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#F5F0E108", borderRadius: 14, padding: 16, border: "1px solid #F5F0E110" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, marginBottom: 10, color: "#C9A227" }}>VENTAS RECIENTES</div>
          {sales.length === 0 ? <div style={{ textAlign: "center", padding: 20, opacity: 0.3 }}><Icon name="clock" size={28} /></div> :
            sales.slice(0, 8).map(sale => { const st = ORDER_STATUSES[sale.status]; return (
              <button key={sale.id} onClick={() => setShowSaleDetail(showSaleDetail === sale.id ? null : sale.id)} style={{ width: "100%", background: showSaleDetail === sale.id ? "#F5F0E10F" : "transparent", border: "none", borderBottom: "1px solid #F5F0E110", padding: "8px 0", cursor: "pointer", color: "#F5F0E1", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: st.color }}><Icon name={st.icon} size={14} /></span>
                  <span style={{ fontSize: 11, opacity: 0.4, minWidth: 40 }}>{fmtTime(sale.date)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sale.customer}</div></div>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#C9A227" }}>{fmt(sale.total)}</span>
                </div>
                {showSaleDetail === sale.id && (
                  <div style={{ marginTop: 6, padding: "6px 10px", background: "#F5F0E108", borderRadius: 8, marginLeft: 30 }}>
                    {sale.items.map((item, idx) => <div key={idx} style={{ fontSize: 11, padding: "1px 0" }}>{item.name} · {item.cut} · {item.size} x{item.qty} — {fmt(item.price * item.qty)}</div>)}
                  </div>
                )}
              </button>
            ); })}
        </div>
      </div>
    </div>
  );
}

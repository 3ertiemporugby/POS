import { useState, useCallback, useMemo } from "react";

const PRODUCTS = [
  { id: 1, name: "Primero Jugamos...", tag: "HERO" },
  { id: 2, name: "Ajolote Corriendo", tag: "MASCOTA" },
  { id: 3, name: "Ajolote Parado", tag: "MASCOTA" },
  { id: 4, name: "Nuestras Bolas", tag: "HUMOR" },
  { id: 5, name: "Es Cosa de Rugby", tag: "LIFESTYLE" },
  { id: 6, name: "Los Sábados Son De...", tag: "LIFESTYLE" },
  { id: 7, name: "Básica Logo", tag: "CLÁSICA" },
  { id: 8, name: "Modo Rugby ON", tag: "TANK" },
];

const CUTS = [
  { id: "h-regular", label: "H Regular Premium", shortLabel: "H Regular", gender: "hombre", price: 550 },
  { id: "h-oversize", label: "H Oversize Premium", shortLabel: "H Oversize", gender: "hombre", price: 550 },
  { id: "m-ajustado", label: "M Ajustado", shortLabel: "M Ajustado", gender: "mujer", price: 349 },
  { id: "m-oversize", label: "M Oversize", shortLabel: "M Oversize", gender: "mujer", price: 550 },
];

const SIZES = ["S", "M", "L", "XL"];
const COLORS = ["Negro", "Blanco"];
const LOW_STOCK_THRESHOLD = 2;

const ORDER_STATUSES = {
  pagada: { label: "Pagada", icon: "check-circle", color: "#4a8c5c", bg: "#4a8c5c20" },
  porEntregar: { label: "Pagada × Entregar", icon: "package", color: "#C9A227", bg: "#C9A22720" },
  apartada: { label: "Apartada", icon: "lock", color: "#8B6914", bg: "#8B691420" },
};

const COUPONS = {
  "ENPERSONA": { type: "fixed", value: 0, label: "Entrega en persona" },
  "PRIMER15": { type: "percent", value: 15, label: "15% primera compra" },
  "EQUIPO10": { type: "percent", value: 10, label: "10% descuento equipo" },
  "AMIGO50": { type: "fixed", value: 50, label: "$50 desc. referido" },
};

function generateInventory() {
  const inv = {};
  PRODUCTS.forEach(p => {
    CUTS.forEach(cut => {
      SIZES.forEach(s => {
        COLORS.forEach(c => {
          inv[`${p.id}|${cut.id}|${s}|${c}`] = Math.floor(Math.random() * 6);
        });
      });
    });
  });
  return inv;
}

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
  };
  return icons[name] || null;
};

export default function TercerTiempoPOS() {
  const [view, setView] = useState("pos");
  const [inventory, setInventory] = useState(generateInventory);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
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
  const outOfStock = useMemo(() => Object.entries(inventory).filter(([, q]) => q === 0).length, [inventory]);
  const pendingOrders = useMemo(() => sales.filter(s => s.status === "porEntregar" || s.status === "apartada").length, [sales]);

  const addToCart = useCallback((product, cut, size, color) => {
    const key = `${product.id}|${cut.id}|${size}|${color}`;
    const stock = inventory[key] || 0;
    if (stock <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) { if (ex.qty >= stock) return prev; return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i); }
      return [...prev, { key, productId: product.id, name: product.name, cut: cut.label, cutId: cut.id, size, color, price: cut.price, qty: 1, maxStock: stock, isApartada: false }];
    });
  }, [inventory]);

  const addApartadaToCart = useCallback((product, cut, size, color) => {
    const key = `${product.id}|${cut.id}|${size}|${color}`;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, productId: product.id, name: product.name, cut: cut.label, cutId: cut.id, size, color, price: cut.price, qty: 1, maxStock: 999, isApartada: true }];
    });
  }, []);

  const updateCartQty = useCallback((key, delta) => {
    setCart(prev => prev.map(i => { if (i.key !== key) return i; const n = i.qty + delta; if (n <= 0) return null; if (!i.isApartada && n > i.maxStock) return i; return { ...i, qty: n }; }).filter(Boolean));
  }, []);
  const removeFromCart = useCallback((key) => setCart(prev => prev.filter(i => i.key !== key)), []);

  const applyCoupon = useCallback(() => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) { setAppliedCoupon({ ...COUPONS[code], code }); setCouponError(""); setManualDiscount(""); }
    else { setCouponError("Cupón no válido"); setAppliedCoupon(null); }
  }, [couponCode]);

  const canCompleteSale = useMemo(() => {
    if (cart.length === 0) return false;
    // Only apartadas require all fields
    if (hasApartadaItems) {
      return customerName.trim() && customerEmail.trim() && customerPhone.trim() && customerAddress.trim();
    }
    return true; // Normal sales: everything optional
  }, [cart, customerName, customerEmail, customerPhone, customerAddress, hasApartadaItems]);

  const completeSale = useCallback(() => {
    if (!canCompleteSale) return;
    setSales(prev => [{
      id: Date.now(), date: new Date().toISOString(),
      customer: customerName.trim() || "Sin nombre",
      email: customerEmail.trim() || null,
      phone: customerPhone.trim() || null,
      address: customerAddress.trim() || null,
      notes: saleNotes.trim() || null,
      items: [...cart], subtotal: cartSubtotal, discount: discountAmount, total: cartTotal,
      coupon: appliedCoupon?.code || null, payment: paymentMethod, status: effectiveStatus,
    }, ...prev]);
    setInventory(prev => { const next = { ...prev }; cart.forEach(item => { if (!item.isApartada) next[item.key] = Math.max(0, (next[item.key] || 0) - item.qty); }); return next; });
    setCart([]); setCouponCode(""); setAppliedCoupon(null); setManualDiscount("");
    setCustomerName(""); setCustomerEmail(""); setCustomerPhone(""); setCustomerAddress(""); setSaleNotes("");
    setOrderStatus("pagada"); setSaleComplete(true); setTimeout(() => setSaleComplete(false), 2500);
  }, [canCompleteSale, cart, cartSubtotal, discountAmount, cartTotal, appliedCoupon, paymentMethod, effectiveStatus, customerName, customerEmail, customerPhone, customerAddress, saleNotes, hasApartadaItems]);

  const updateSaleStatus = useCallback((saleId, ns) => setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: ns } : s)), []);
  const filteredProducts = useMemo(() => { if (!searchTerm) return PRODUCTS; const t = searchTerm.toLowerCase(); return PRODUCTS.filter(p => p.name.toLowerCase().includes(t) || p.tag.toLowerCase().includes(t)); }, [searchTerm]);
  const getStock = (pid, cutId, size, color) => inventory[`${pid}|${cutId}|${size}|${color}`] || 0;
  const adjustInventory = (key, delta) => setInventory(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) }));
  const fmt = (n) => `$${n.toLocaleString("es-MX")}`;
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ fontFamily: "'Rajdhani', 'Segoe UI', sans-serif", background: "#0D1B0F", color: "#F5F0E1", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontSize: 15 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "linear-gradient(135deg, #1A472A 0%, #0D1B0F 100%)", borderBottom: "2px solid #C9A227", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3, color: "#C9A227", lineHeight: 1 }}>TERCER TIEMPO</div>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#F5F0E199", fontWeight: 700 }}>SISTEMA DE VENTAS</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "pos", icon: "cart", label: "Venta", badge: cart.length > 0 ? cart.length : null, badgeBg: "#8B0000" },
            { id: "orders", icon: "clock", label: "Pedidos", badge: pendingOrders > 0 ? pendingOrders : null, badgeBg: "#C9A227" },
            { id: "inv", icon: "box", label: "Inventario", badge: lowStockItems > 0 ? lowStockItems : null, badgeBg: "#C9A227" },
            { id: "dash", icon: "chart", label: "Dashboard" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              background: view === tab.id ? "#C9A227" : "transparent", color: view === tab.id ? "#0D1B0F" : "#F5F0E1",
              border: view === tab.id ? "none" : "1px solid #F5F0E133", borderRadius: 10, padding: "8px 16px",
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, textTransform: "uppercase",
              letterSpacing: 1.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name={tab.icon} size={16} /> {tab.label}
              {tab.badge && <span style={{ background: tab.badgeBg, color: tab.badgeBg === "#C9A227" ? "#0D1B0F" : "#fff", borderRadius: 99, fontSize: 11, fontWeight: 800, padding: "1px 7px", marginLeft: 2 }}>{tab.badge}</span>}
            </button>
          ))}
        </div>
        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.6 }}>
          <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div>{todaySales.length} ventas · {pendingOrders} pendientes</div>
        </div>
      </div>

      {saleComplete && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: "#1A472A", border: "2px solid #C9A227", borderRadius: 16, padding: "16px 32px", zIndex: 999, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", animation: "slideDown 0.3s ease" }}>
          <div style={{ background: "#C9A227", borderRadius: 99, padding: 6, color: "#0D1B0F" }}><Icon name="check" size={24} /></div>
          <div><div style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>VENTA REGISTRADA</div><div style={{ fontSize: 12, opacity: 0.7 }}>Inventario actualizado</div></div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {view === "pos" && <POSView {...{ filteredProducts, searchTerm, setSearchTerm, selectedProduct, setSelectedProduct, cart, addToCart, addApartadaToCart, updateCartQty, removeFromCart, getStock, cartSubtotal, cartTotal, discountAmount, couponCode, setCouponCode, applyCoupon, appliedCoupon, setAppliedCoupon, couponError, setCouponError, manualDiscount, setManualDiscount, paymentMethod, setPaymentMethod, orderStatus, setOrderStatus, effectiveStatus, availableStatuses, hasApartadaItems, customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone, customerAddress, setCustomerAddress, saleNotes, setSaleNotes, completeSale, canCompleteSale, fmt, posGender, setPosGender }} />}
        {view === "orders" && <OrdersView {...{ sales, updateSaleStatus, salesFilter, setSalesFilter, fmt, fmtTime }} />}
        {view === "inv" && <InventoryView {...{ inventory, adjustInventory, invFilter, setInvFilter, invGender, setInvGender, fmt }} />}
        {view === "dash" && <DashboardView {...{ todaySales, sales, totalRevenue, totalItems, fmt, fmtTime, showSaleDetail, setShowSaleDetail }} />}
      </div>

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #C9A22744; border-radius: 3px; }
        input:focus, textarea:focus { outline: 2px solid #C9A227; outline-offset: -2px; }
      `}</style>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "7px 10px", background: "#F5F0E10A", border: "1px solid #F5F0E120", borderRadius: 8, color: "#F5F0E1", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600 };

// ─── POS VIEW ──────────────────────────────────────────────────────────
function POSView({ filteredProducts, searchTerm, setSearchTerm, selectedProduct, setSelectedProduct, cart, addToCart, addApartadaToCart, updateCartQty, removeFromCart, getStock, cartSubtotal, cartTotal, discountAmount, couponCode, setCouponCode, applyCoupon, appliedCoupon, setAppliedCoupon, couponError, setCouponError, manualDiscount, setManualDiscount, paymentMethod, setPaymentMethod, orderStatus, setOrderStatus, effectiveStatus, availableStatuses, hasApartadaItems, customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone, customerAddress, setCustomerAddress, saleNotes, setSaleNotes, completeSale, canCompleteSale, fmt, posGender, setPosGender }) {
  const tagColors = { HERO: "#C9A227", MASCOTA: "#4a8c5c", HUMOR: "#8B0000", LIFESTYLE: "#3a6b8c", CLÁSICA: "#666", TANK: "#8B5E34" };
  const cutsForGender = CUTS.filter(c => c.gender === posGender);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #F5F0E115" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #F5F0E110", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}><Icon name="search" size={18} /></div>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar diseño..." style={{ ...inputStyle, paddingLeft: 40, fontSize: 15 }} />
          </div>
          <div style={{ display: "flex", background: "#F5F0E10A", borderRadius: 10, overflow: "hidden", border: "1px solid #F5F0E120" }}>
            {[["hombre", "male", "Hombre"], ["mujer", "female", "Mujer"]].map(([g, ic, label]) => (
              <button key={g} onClick={() => setPosGender(g)} style={{
                padding: "8px 16px", border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13,
                background: posGender === g ? (g === "hombre" ? "#3a6b8c" : "#8B4566") : "transparent",
                color: posGender === g ? "#fff" : "#F5F0E166", display: "flex", alignItems: "center", gap: 5, letterSpacing: 1,
              }}><Icon name={ic} size={14} /> {label}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, alignContent: "start" }}>
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}
              style={{ background: selectedProduct?.id === p.id ? "linear-gradient(135deg, #1A472A, #2a6b3a)" : "#F5F0E108", border: selectedProduct?.id === p.id ? "2px solid #C9A227" : "1px solid #F5F0E115", borderRadius: 14, padding: "16px 14px", cursor: "pointer", textAlign: "left", color: "#F5F0E1", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ background: tagColors[p.tag] || "#666", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Rajdhani', sans-serif", color: p.tag === "HERO" ? "#0D1B0F" : "#fff" }}>{p.tag}</span>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 1, lineHeight: 1.1, marginTop: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: "auto" }}>{cutsForGender.length} corte{cutsForGender.length > 1 ? "s" : ""} · desde {fmt(Math.min(...cutsForGender.map(c => c.price)))}</div>
            </button>
          ))}
        </div>

        {selectedProduct && (
          <div style={{ borderTop: "2px solid #C9A227", background: "linear-gradient(180deg, #1A472A, #0D1B0F)", padding: 16, animation: "fadeIn 0.2s ease", maxHeight: "45vh", overflow: "auto" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 12 }}>
              {selectedProduct.name}
              <span style={{ fontSize: 12, opacity: 0.5, fontFamily: "'Rajdhani', sans-serif", marginLeft: 8 }}>— {posGender === "hombre" ? "Hombre" : "Mujer"}</span>
            </div>
            {cutsForGender.map(cut => (
              <div key={cut.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #F5F0E110", paddingBottom: 4, display: "flex", justifyContent: "space-between" }}>
                  <span>{cut.label}</span><span style={{ color: "#C9A227" }}>{fmt(cut.price)}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLORS.length * SIZES.length}, minmax(70px, 1fr))`, gap: 5 }}>
                  {SIZES.map(size => COLORS.map(color => {
                    const stock = getStock(selectedProduct.id, cut.id, size, color);
                    const isLow = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
                    const isOut = stock <= 0;
                    return (
                      <button key={`${size}-${color}`}
                        onClick={() => isOut ? addApartadaToCart(selectedProduct, cut, size, color) : addToCart(selectedProduct, cut, size, color)}
                        style={{
                          background: isOut ? "#8B691420" : color === "Negro" ? "#18181b" : "#F5F0E112",
                          border: isOut ? "2px dashed #8B691466" : isLow ? "2px solid #C9A22788" : "1px solid #F5F0E125",
                          borderRadius: 10, padding: "6px 4px", cursor: "pointer",
                          color: "#F5F0E1", opacity: isOut ? 0.7 : 1, textAlign: "center",
                          fontFamily: "'Rajdhani', sans-serif", position: "relative", transition: "all 0.15s",
                        }}>
                        <div style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: 99, background: color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E144" }} />
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{size}</div>
                        <div style={{ fontSize: 9, opacity: 0.6 }}>{color}</div>
                        {isOut ? (
                          <div style={{ fontSize: 8, fontWeight: 800, color: "#8B6914", marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                            <Icon name="lock" size={8} /> APARTAR
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, fontWeight: 800, color: isLow ? "#C9A227" : "#4a8c5c" }}>{stock} pzas</div>
                        )}
                      </button>
                    );
                  }))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CART */}
      <div style={{ width: 370, display: "flex", flexDirection: "column", background: "#0D1B0F" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #F5F0E110" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="cart" size={18} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2 }}>CARRITO</span>
            {hasApartadaItems && <span style={{ background: "#8B691440", border: "1px solid #8B691466", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#8B6914", display: "flex", alignItems: "center", gap: 3 }}><Icon name="lock" size={10} /> APARTADO</span>}
            <span style={{ fontSize: 12, opacity: 0.4, marginLeft: "auto" }}>{cart.length} art.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: hasApartadaItems ? "#8B6914" : "#F5F0E144", flexShrink: 0 }}><Icon name="user" size={14} /></span>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={hasApartadaItems ? "Nombre *" : "Nombre"} style={inputStyle} />
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: hasApartadaItems ? "#8B6914" : "#F5F0E144", flexShrink: 0 }}><Icon name="mail" size={14} /></span>
                <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder={hasApartadaItems ? "Email *" : "Email"} type="email" style={inputStyle} />
              </div>
            </div>
            {hasApartadaItems && (
              <div style={{ animation: "fadeIn 0.2s ease", display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#8B6914", flexShrink: 0 }}><Icon name="phone" size={14} /></span>
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Teléfono *" style={inputStyle} />
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 5 }}>
                  <span style={{ color: "#8B6914", flexShrink: 0, marginTop: 8 }}><Icon name="mappin" size={14} /></span>
                  <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Dirección de envío *" rows={2} style={{ ...inputStyle, resize: "none", lineHeight: 1.4 }} />
                </div>
              </div>
            )}
            {/* Notes - always visible */}
            <div style={{ display: "flex", alignItems: "start", gap: 5 }}>
              <span style={{ color: "#F5F0E144", flexShrink: 0, marginTop: 8 }}><Icon name="note" size={14} /></span>
              <textarea value={saleNotes} onChange={e => setSaleNotes(e.target.value)} placeholder="Notas (opcional)" rows={1} style={{ ...inputStyle, resize: "none", lineHeight: 1.4, fontSize: 13 }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, opacity: 0.3 }}>
              <Icon name="rugby" size={40} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, marginTop: 12 }}>SIN PRODUCTOS</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Selecciona un diseño</div>
            </div>
          ) : cart.map(item => (
            <div key={item.key} style={{ background: item.isApartada ? "#8B691415" : "#F5F0E108", borderRadius: 12, padding: 12, marginBottom: 8, border: item.isApartada ? "1px solid #8B691433" : "1px solid #F5F0E110", animation: "fadeIn 0.15s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 6 }}>
                    {item.name}
                    {item.isApartada && <span style={{ background: "#8B691440", borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 800, color: "#8B6914", display: "flex", alignItems: "center", gap: 2 }}><Icon name="lock" size={8} /> APARTADO</span>}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    {item.cut} · {item.size} · <span style={{ width: 8, height: 8, borderRadius: 99, background: item.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133", display: "inline-block" }} /> {item.color}
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.key)} style={{ background: "none", border: "none", color: "#8B0000", cursor: "pointer", padding: 4, opacity: 0.6 }}><Icon name="trash" size={16} /></button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", background: "#F5F0E10F", borderRadius: 8 }}>
                  <button onClick={() => updateCartQty(item.key, -1)} style={{ background: "none", border: "none", color: "#F5F0E1", cursor: "pointer", padding: "4px 10px" }}><Icon name="minus" size={14} /></button>
                  <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.key, 1)} style={{ background: "none", border: "none", color: "#F5F0E1", cursor: "pointer", padding: "4px 10px", opacity: !item.isApartada && item.qty >= item.maxStock ? 0.3 : 1 }}><Icon name="plus" size={14} /></button>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: item.isApartada ? "#8B6914" : "#C9A227" }}>{fmt(item.price * item.qty)}</div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: "2px solid #C9A227", padding: 14, background: "#1A472A15", overflow: "auto", maxHeight: "45vh" }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Status</div>
              <div style={{ display: "flex", gap: 5 }}>
                {Object.entries(ORDER_STATUSES).filter(([key]) => availableStatuses.includes(key)).map(([key, st]) => (
                  <button key={key} onClick={() => !hasApartadaItems && setOrderStatus(key)} style={{
                    flex: 1, padding: "6px 2px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: hasApartadaItems ? "default" : "pointer", fontFamily: "'Rajdhani', sans-serif", textAlign: "center",
                    background: (hasApartadaItems ? key === "apartada" : orderStatus === key) ? st.bg : "transparent",
                    color: (hasApartadaItems ? key === "apartada" : orderStatus === key) ? st.color : "#F5F0E155",
                    border: (hasApartadaItems ? key === "apartada" : orderStatus === key) ? `2px solid ${st.color}` : "1px solid #F5F0E120",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}><span><Icon name={st.icon} size={18} /></span><div style={{ lineHeight: 1.1 }}>{st.label}</div></button>
                ))}
              </div>
              {hasApartadaItems && <div style={{ fontSize: 10, color: "#8B6914", marginTop: 4, fontWeight: 600 }}>Productos agotados en carrito — se registra como apartado</div>}
            </div>
            <div style={{ marginBottom: 8 }}>
              {!appliedCoupon ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={couponCode} onChange={e => { setCouponCode(e.target.value); setCouponError(""); }} placeholder="Cupón" style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
                  <button onClick={applyCoupon} style={{ background: "#C9A227", color: "#0D1B0F", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>APLICAR</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#C9A22715", padding: "6px 10px", borderRadius: 8 }}>
                  <Icon name="tag" size={14} /><span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{appliedCoupon.code}: {appliedCoupon.label}</span>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ background: "none", border: "none", color: "#8B0000", cursor: "pointer", padding: 2 }}><Icon name="x" size={14} /></button>
                </div>
              )}
              {couponError && <div style={{ color: "#8B0000", fontSize: 11, marginTop: 3, fontWeight: 700 }}>{couponError}</div>}
              {!appliedCoupon && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>Desc. manual $</span>
                  <input value={manualDiscount} onChange={e => setManualDiscount(e.target.value.replace(/\D/g, ""))} placeholder="0"
                    style={{ width: 65, padding: "3px 8px", background: "#F5F0E10A", border: "1px solid #F5F0E120", borderRadius: 6, color: "#F5F0E1", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, textAlign: "right" }} />
                </div>
              )}
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
              {discountAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#C9A227" }}><span>Descuento</span><span>-{fmt(discountAmount)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, marginTop: 4, color: "#C9A227" }}><span>TOTAL</span><span>{fmt(cartTotal)}</span></div>
            </div>
            <button onClick={completeSale} disabled={!canCompleteSale} style={{
              width: "100%", padding: "14px 0", marginTop: 10, opacity: canCompleteSale ? 1 : 0.4,
              background: `linear-gradient(135deg, ${ORDER_STATUSES[effectiveStatus].color}, ${ORDER_STATUSES[effectiveStatus].color}cc)`,
              border: "none", borderRadius: 12, color: effectiveStatus === "pagada" ? "#fff" : "#0D1B0F",
              cursor: canCompleteSale ? "pointer" : "not-allowed",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3,
              boxShadow: canCompleteSale ? `0 4px 20px ${ORDER_STATUSES[effectiveStatus].color}44` : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Icon name={ORDER_STATUSES[effectiveStatus].icon} size={22} />
              {effectiveStatus === "pagada" ? "COBRAR" : effectiveStatus === "porEntregar" ? "REGISTRAR" : "APARTAR"} {fmt(cartTotal)}
            </button>
            {!canCompleteSale && hasApartadaItems && (
              <div style={{ fontSize: 10, color: "#8B6914", marginTop: 6, textAlign: "center", fontWeight: 600 }}>Completa nombre, email, teléfono y dirección para apartar</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDERS VIEW ───────────────────────────────────────────────────────
function OrdersView({ sales, updateSaleStatus, salesFilter, setSalesFilter, fmt, fmtTime }) {
  const filtered = useMemo(() => salesFilter === "all" ? sales : sales.filter(s => s.status === salesFilter), [sales, salesFilter]);
  const counts = useMemo(() => ({ all: sales.length, pagada: sales.filter(s => s.status === "pagada").length, porEntregar: sales.filter(s => s.status === "porEntregar").length, apartada: sales.filter(s => s.status === "apartada").length }), [sales]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 8, padding: "14px 16px", borderBottom: "1px solid #F5F0E110", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "Todos", icon: "box", color: "#F5F0E1" },
          { key: "pagada", label: "Pagadas", icon: "check-circle", color: "#4a8c5c" },
          { key: "porEntregar", label: "Por Entregar", icon: "package", color: "#C9A227" },
          { key: "apartada", label: "Apartadas", icon: "lock", color: "#8B6914" },
        ].map(f => (
          <button key={f.key} onClick={() => setSalesFilter(f.key)} style={{
            background: salesFilter === f.key ? f.color + "22" : "transparent", color: salesFilter === f.key ? f.color : "#F5F0E155",
            border: salesFilter === f.key ? `2px solid ${f.color}` : "1px solid #F5F0E120", borderRadius: 10, padding: "8px 16px",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", display: "flex", alignItems: "center", gap: 6,
          }}><Icon name={f.icon} size={14} /> {f.label} <span style={{ background: f.color + "33", padding: "1px 8px", borderRadius: 99, fontSize: 12, fontWeight: 800 }}>{counts[f.key]}</span></button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, opacity: 0.3 }}><Icon name="clock" size={48} /><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, marginTop: 12 }}>SIN PEDIDOS</div></div>
        ) : filtered.map(sale => {
          const st = ORDER_STATUSES[sale.status];
          return (
            <div key={sale.id} style={{ background: "#F5F0E108", border: `1px solid ${st.color}33`, borderRadius: 14, padding: 16, marginBottom: 10, animation: "fadeIn 0.15s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ background: st.bg, border: `1px solid ${st.color}44`, borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: st.color }}><Icon name={st.icon} size={18} /></span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: st.color, textTransform: "uppercase", letterSpacing: 1 }}>{st.label}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}><Icon name="user" size={16} /> {sale.customer}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {sale.email && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="mail" size={10} /> {sale.email}</span>}
                    <span>· {new Date(sale.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · {fmtTime(sale.date)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>· <Icon name={sale.payment === "stripe" ? "stripe" : "cash"} size={10} /> {sale.payment === "stripe" ? "Stripe" : "Efectivo"}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#C9A227" }}>{fmt(sale.total)}</div>
              </div>

              {sale.phone && (
                <div style={{ background: "#8B691415", border: "1px solid #8B691433", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8B6914" }}><Icon name="phone" size={12} /> {sale.phone}</span>
                  <span style={{ display: "flex", alignItems: "start", gap: 4, color: "#8B6914", flex: 1 }}><span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="mappin" size={12} /></span> {sale.address}</span>
                </div>
              )}

              {sale.notes && (
                <div style={{ background: "#F5F0E108", border: "1px solid #F5F0E115", borderRadius: 8, padding: "6px 12px", marginBottom: 10, fontSize: 12, display: "flex", alignItems: "start", gap: 6, opacity: 0.7 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="note" size={12} /></span>
                  <span>{sale.notes}</span>
                </div>
              )}

              <div style={{ background: "#F5F0E105", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                {sale.items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: idx < sale.items.length - 1 ? "1px solid #F5F0E108" : "none" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: item.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133", display: "inline-block", flexShrink: 0 }} />
                      {item.name} · {item.cut} · {item.size} · {item.color} x{item.qty}
                      {item.isApartada && <span style={{ background: "#8B691440", borderRadius: 3, padding: "0px 4px", fontSize: 9, fontWeight: 800, color: "#8B6914", marginLeft: 4 }}>APARTADO</span>}
                    </span>
                    <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                {sale.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#C9A227", borderTop: "1px solid #F5F0E110", marginTop: 4, paddingTop: 4 }}><span>Desc. {sale.coupon && `(${sale.coupon})`}</span><span>-{fmt(sale.discount)}</span></div>}
              </div>
              {sale.status !== "pagada" && (
                <div style={{ display: "flex", gap: 8 }}>
                  {sale.status === "porEntregar" && <button onClick={() => updateSaleStatus(sale.id, "pagada")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#4a8c5c", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="check-circle" size={18} /> MARCAR ENTREGADO</button>}
                  {sale.status === "apartada" && (
                    <>
                      <button onClick={() => updateSaleStatus(sale.id, "porEntregar")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#C9A227", color: "#0D1B0F", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="package" size={18} /> YA PAGÓ</button>
                      <button onClick={() => updateSaleStatus(sale.id, "pagada")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#4a8c5c", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="check-circle" size={18} /> COMPLETADA</button>
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

// ─── INVENTORY VIEW ────────────────────────────────────────────────────
function InventoryView({ inventory, adjustInventory, invFilter, setInvFilter, invGender, setInvGender, fmt }) {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const genderCuts = invGender === "all" ? CUTS : CUTS.filter(c => c.gender === invGender);
  const getProductStock = (pid) => Object.entries(inventory).filter(([k]) => k.startsWith(`${pid}|`) && (invGender === "all" || genderCuts.some(c => k.includes(c.id)))).reduce((s, [, q]) => s + q, 0);
  const getProductValue = (pid) => Object.entries(inventory).filter(([k]) => k.startsWith(`${pid}|`) && (invGender === "all" || genderCuts.some(c => k.includes(c.id)))).reduce((s, [k, q]) => { const cut = CUTS.find(c => k.includes(c.id)); return s + (cut ? cut.price * q : 0); }, 0);
  const totalStock = PRODUCTS.reduce((s, p) => s + getProductStock(p.id), 0);
  const totalValue = PRODUCTS.reduce((s, p) => s + getProductValue(p.id), 0);
  const filteredLow = Object.entries(inventory).filter(([k, q]) => (invGender === "all" || genderCuts.some(c => k.includes(c.id))) && q > 0 && q <= LOW_STOCK_THRESHOLD).length;
  const filteredOut = Object.entries(inventory).filter(([k, q]) => (invGender === "all" || genderCuts.some(c => k.includes(c.id))) && q === 0).length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderBottom: "1px solid #F5F0E110" }}>
        {[
          { label: "Total piezas", value: totalStock, icon: "box", color: "#C9A227" },
          { label: "Valor inventario", value: fmt(totalValue), icon: "dollar", color: "#4a8c5c" },
          { label: "Stock bajo", value: filteredLow, icon: "alert", color: "#C9A227" },
          { label: "Agotados", value: filteredOut, icon: "x", color: "#8B0000" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: "#F5F0E108", borderRadius: 12, padding: "12px 14px", border: "1px solid #F5F0E110" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ color: s.color }}><Icon name={s.icon} size={14} /></span><span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</span></div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 16px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ key: "all", label: "Todos" }, { key: "low", label: "Stock bajo" }, { key: "out", label: "Agotados" }].map(f => (
            <button key={f.key} onClick={() => setInvFilter(f.key)} style={{ background: invFilter === f.key ? "#C9A227" : "transparent", color: invFilter === f.key ? "#0D1B0F" : "#F5F0E1", border: invFilter === f.key ? "none" : "1px solid #F5F0E120", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", background: "#F5F0E10A", borderRadius: 8, overflow: "hidden", border: "1px solid #F5F0E120" }}>
          {[["all", "Todos"], ["hombre", "Hombre"], ["mujer", "Mujer"]].map(([g, label]) => (
            <button key={g} onClick={() => setInvGender(g)} style={{
              padding: "6px 14px", border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12,
              background: invGender === g ? (g === "hombre" ? "#3a6b8c" : g === "mujer" ? "#8B4566" : "#C9A227") : "transparent",
              color: invGender === g ? "#fff" : "#F5F0E166",
            }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 16px 16px" }}>
        {PRODUCTS.map(product => {
          const totalPcs = getProductStock(product.id);
          const variants = Object.entries(inventory).filter(([k]) => k.startsWith(`${product.id}|`) && (invGender === "all" || genderCuts.some(c => k.includes(c.id))))
            .map(([key, qty]) => { const p = key.split("|"); const cut = CUTS.find(c => c.id === p[1]); return { key, qty, cutLabel: cut?.label || p[1], size: p[2], color: p[3] }; })
            .filter(v => { if (invFilter === "low") return v.qty > 0 && v.qty <= LOW_STOCK_THRESHOLD; if (invFilter === "out") return v.qty === 0; return true; });
          if (invFilter !== "all" && variants.length === 0) return null;
          const byCut = {}; variants.forEach(v => { if (!byCut[v.cutLabel]) byCut[v.cutLabel] = []; byCut[v.cutLabel].push(v); });
          return (
            <div key={product.id} style={{ marginBottom: 8 }}>
              <button onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                style={{ width: "100%", background: "#F5F0E108", border: "1px solid #F5F0E115", borderRadius: expandedProduct === product.id ? "12px 12px 0 0" : 12, padding: "14px 16px", cursor: "pointer", color: "#F5F0E1", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: "#0D1B0F", background: "#C9A227", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{product.id}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{product.name}</div><div style={{ fontSize: 11, opacity: 0.4 }}>{genderCuts.map(c => c.shortLabel).join(" · ")}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: totalPcs <= LOW_STOCK_THRESHOLD * genderCuts.length ? "#C9A227" : "#F5F0E1" }}>{totalPcs}</div><div style={{ fontSize: 10, opacity: 0.4 }}>piezas</div></div>
              </button>
              {expandedProduct === product.id && (
                <div style={{ background: "#F5F0E105", border: "1px solid #F5F0E115", borderTop: "none", borderRadius: "0 0 12px 12px", padding: 12 }}>
                  {Object.entries(byCut).map(([cutLabel, items]) => (
                    <div key={cutLabel} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, borderBottom: "1px solid #F5F0E110", paddingBottom: 4 }}>{cutLabel}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6 }}>
                        {items.map(v => (
                          <div key={v.key} style={{ background: v.qty === 0 ? "#8B000015" : v.qty <= LOW_STOCK_THRESHOLD ? "#C9A22715" : "#F5F0E108", border: `1px solid ${v.qty === 0 ? "#8B000033" : v.qty <= LOW_STOCK_THRESHOLD ? "#C9A22733" : "#F5F0E115"}`, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 99, background: v.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133" }} /> {v.size} · {v.color}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
                              <button onClick={() => adjustInventory(v.key, -1)} style={{ background: "#F5F0E110", border: "none", borderRadius: 6, color: "#F5F0E1", cursor: "pointer", padding: "4px 8px" }}><Icon name="minus" size={12} /></button>
                              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, minWidth: 28, color: v.qty === 0 ? "#8B0000" : v.qty <= LOW_STOCK_THRESHOLD ? "#C9A227" : "#F5F0E1" }}>{v.qty}</span>
                              <button onClick={() => adjustInventory(v.key, 1)} style={{ background: "#F5F0E110", border: "none", borderRadius: 6, color: "#F5F0E1", cursor: "pointer", padding: "4px 8px" }}><Icon name="plus" size={12} /></button>
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

// ─── DASHBOARD VIEW ────────────────────────────────────────────────────
function DashboardView({ todaySales, sales, totalRevenue, totalItems, fmt, fmtTime, showSaleDetail, setShowSaleDetail }) {
  const avgTicket = todaySales.length > 0 ? Math.round(totalRevenue / todaySales.length) : 0;
  const productCounts = {}; todaySales.forEach(s => s.items.forEach(i => { productCounts[i.name] = (productCounts[i.name] || 0) + i.qty; }));
  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const byPayment = {}; todaySales.forEach(s => { byPayment[s.payment] = (byPayment[s.payment] || 0) + s.total; });
  const byStatus = {}; todaySales.forEach(s => { byStatus[s.status] = (byStatus[s.status] || 0) + 1; });
  const uniqueEmails = new Set(sales.map(s => s.email?.toLowerCase()).filter(Boolean));

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Ventas hoy", value: todaySales.length, icon: "cart", color: "#C9A227" },
          { label: "Ingreso", value: fmt(totalRevenue), icon: "dollar", color: "#4a8c5c" },
          { label: "Piezas", value: totalItems, icon: "box", color: "#F5F0E1" },
          { label: "Ticket prom.", value: fmt(avgTicket), icon: "tag", color: "#C9A227" },
          { label: "Contactos", value: uniqueEmails.size, icon: "mail", color: "#3a6b8c" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "#F5F0E108", borderRadius: 14, padding: "16px 14px", border: "1px solid #F5F0E110" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><span style={{ color: kpi.color }}><Icon name={kpi.icon} size={16} /></span><span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{kpi.label}</span></div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#F5F0E108", borderRadius: 14, padding: 16, border: "1px solid #F5F0E110" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 12, color: "#C9A227" }}>POR STATUS</div>
          {Object.entries(ORDER_STATUSES).map(([key, st]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F5F0E108" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: st.color }}><Icon name={st.icon} size={16} /></span><span style={{ fontWeight: 600, fontSize: 13 }}>{st.label}</span></div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: st.color }}>{byStatus[key] || 0}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#F5F0E108", borderRadius: 14, padding: 16, border: "1px solid #F5F0E110" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 12, color: "#C9A227" }}>TOP PRODUCTOS</div>
          {topProducts.length === 0 ? <div style={{ textAlign: "center", padding: 20, opacity: 0.3, fontSize: 13 }}>Sin datos</div> :
            topProducts.map(([name, qty], i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < topProducts.length - 1 ? "1px solid #F5F0E110" : "none" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#0D1B0F", background: i === 0 ? "#C9A227" : "#F5F0E120", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{name}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#C9A227" }}>{qty}</div>
              </div>
          ))}
        </div>
        <div style={{ background: "#F5F0E108", borderRadius: 14, padding: 16, border: "1px solid #F5F0E110" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 12, color: "#C9A227" }}>MÉTODO PAGO</div>
          {Object.entries(byPayment).length === 0 ? <div style={{ textAlign: "center", padding: 20, opacity: 0.3, fontSize: 13 }}>Sin datos</div> :
            Object.entries(byPayment).map(([m, total]) => { const pct = totalRevenue > 0 ? Math.round(total / totalRevenue * 100) : 0; return (
              <div key={m} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Icon name={m === "stripe" ? "stripe" : "cash"} size={14} /> {m === "stripe" ? "Stripe" : "Efectivo"}</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#C9A227" }}>{fmt(total)}</span>
                </div>
                <div style={{ background: "#F5F0E110", borderRadius: 4, height: 6, overflow: "hidden" }}><div style={{ background: m === "stripe" ? "#635BFF" : "#C9A227", width: `${pct}%`, height: "100%", borderRadius: 4 }} /></div>
              </div>
          ); })}
        </div>
      </div>
      <div style={{ background: "#F5F0E108", borderRadius: 14, padding: 16, border: "1px solid #F5F0E110" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 12, color: "#C9A227" }}>VENTAS RECIENTES</div>
        {sales.length === 0 ? <div style={{ textAlign: "center", padding: 30, opacity: 0.3 }}><Icon name="clock" size={32} /><div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, marginTop: 8 }}>SIN VENTAS AÚN</div></div> :
          sales.slice(0, 12).map(sale => { const st = ORDER_STATUSES[sale.status]; return (
            <button key={sale.id} onClick={() => setShowSaleDetail(showSaleDetail === sale.id ? null : sale.id)} style={{ width: "100%", background: showSaleDetail === sale.id ? "#F5F0E10F" : "transparent", border: "none", borderBottom: "1px solid #F5F0E110", padding: "10px 0", cursor: "pointer", color: "#F5F0E1", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: st.color }}><Icon name={st.icon} size={16} /></span>
                <span style={{ fontSize: 12, opacity: 0.4, minWidth: 45 }}>{fmtTime(sale.date)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><Icon name="user" size={12} /> {sale.customer}</div>
                  <div style={{ fontSize: 11, opacity: 0.4 }}>{sale.email || "Sin email"}{sale.notes ? ` · ${sale.notes.substring(0, 30)}${sale.notes.length > 30 ? "..." : ""}` : ""}</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#C9A227" }}>{fmt(sale.total)}</div>
              </div>
              {showSaleDetail === sale.id && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#F5F0E108", borderRadius: 8, marginLeft: 40 }}>
                  {sale.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 99, background: item.color === "Negro" ? "#333" : "#F5F0E1", border: "1px solid #F5F0E133", display: "inline-block" }} />
                        {item.name} · {item.cut} · {item.size} · {item.color} x{item.qty}
                        {item.isApartada && <span style={{ fontSize: 9, color: "#8B6914", fontWeight: 800 }}>APARTADO</span>}
                      </span>
                      <span>{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                  {sale.notes && <div style={{ fontSize: 11, opacity: 0.5, borderTop: "1px solid #F5F0E110", marginTop: 4, paddingTop: 4, display: "flex", alignItems: "start", gap: 4 }}><Icon name="note" size={10} /> {sale.notes}</div>}
                </div>
              )}
            </button>
        ); })}
      </div>
    </div>
  );
}

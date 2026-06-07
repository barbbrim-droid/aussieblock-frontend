import { useState, useEffect, useRef } from "react";
import { Truck, MapPin, Clock, ChevronLeft, CheckCircle2, Circle, Plus, FileText, Bell, User, List, Building2, Send, CreditCard, ChevronRight, Phone, Download, LogOut, Loader2, RefreshCw, Inbox, Navigation, Activity, Package, KeyRound, Search, X, CalendarPlus, Trash2, CalendarDays, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun, CloudFog, Wind, Moon, CloudMoon, Droplets, Calculator } from "lucide-react";
import { login, getMe, getOrders, getOrder, getBilling, getInvoicePayLink, getTrucks, setOrderStatus, assignTruck, getCustomers, setCustomerLogin, removeCustomerLogin, createOrder, deleteOrder, editOrder, requestOrder, addTruck, deleteTruck, getSmsEnabled, textInvite, setCustomerCod, codFromAging, chargeOrder, getOrderPaymentStatus, logout, isLoggedIn } from "./api";

// ── Aussieblock brand ────────────────────────────────────────────────
const ORANGE = "#e7732a";
const ORANGE_HOT = "#FB7013";
const NAVY = "#1e2939";
const NAVY_DEEP = "#161d27";
const GREEN = "#27c08a";

const FONT = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap');
/* Render native date/time pickers in dark mode so the calendar/clock icons show
   up light on the dark fields. (No invert filter — it would cancel this out.) */
input[type="date"], input[type="time"] { color-scheme: dark; min-width: 0; max-width: 100%; width: 100%; box-sizing: border-box; -webkit-appearance: none; appearance: none; }
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator { opacity: 1; cursor: pointer; }
/* Lock the page to the viewport so only inner areas scroll — no full-page
   rubber-band/bounce on phones. Pin the body and size it to the *small* viewport
   (100svh) so the bottom tab bar stays above the mobile browser toolbar. */
html, body, #root { height: 100%; }
html { overflow: hidden; }
body { margin: 0; position: fixed; inset: 0; overflow: hidden; overscroll-behavior: none; touch-action: manipulation; -webkit-text-size-adjust: 100%; }
`;

// ── Kangaroo brand mark (stand-in until official asset is embedded) ──
function Roo({ size = 32, variant = "tile" }) {
  // Exact Aussieblock vector paths extracted from the official logo PDF.
  const TILE = "M98.76 54.72 L526.70 54.72 C528.14 54.72 529.57 54.79 531.00 54.93 C532.43 55.07 533.85 55.28 535.26 55.56 C536.67 55.84 538.06 56.19 539.44 56.61 C540.82 57.03 542.17 57.51 543.50 58.06 C544.82 58.61 546.12 59.23 547.39 59.90 C548.66 60.58 549.89 61.32 551.08 62.12 C552.28 62.92 553.43 63.77 554.54 64.69 C555.65 65.60 556.72 66.56 557.73 67.58 C558.75 68.60 559.72 69.66 560.63 70.77 C561.54 71.89 562.39 73.04 563.19 74.24 C563.99 75.43 564.73 76.66 565.41 77.93 C566.08 79.20 566.70 80.50 567.25 81.83 C567.80 83.16 568.28 84.51 568.70 85.89 C569.12 87.26 569.47 88.66 569.75 90.07 C570.03 91.48 570.24 92.90 570.38 94.33 C570.52 95.76 570.59 97.20 570.59 98.64 L570.59 384.11 C570.59 385.54 570.52 386.98 570.38 388.41 C570.24 389.84 570.03 391.26 569.75 392.67 C569.47 394.08 569.12 395.48 568.70 396.85 C568.28 398.23 567.80 399.58 567.25 400.91 C566.70 402.24 566.08 403.54 565.41 404.81 C564.73 406.08 563.99 407.31 563.19 408.51 C562.39 409.70 561.54 410.86 560.63 411.97 C559.72 413.08 558.75 414.14 557.73 415.16 C556.72 416.18 555.65 417.14 554.54 418.06 C553.43 418.97 552.28 419.82 551.08 420.62 C549.89 421.42 548.66 422.16 547.39 422.84 C546.12 423.52 544.82 424.13 543.50 424.68 C542.17 425.23 540.82 425.72 539.44 426.13 C538.06 426.55 536.67 426.90 535.26 427.18 C533.85 427.46 532.43 427.67 531.00 427.81 C529.57 427.95 528.14 428.02 526.70 428.02 L98.76 428.02 C97.32 428.02 95.89 427.95 94.46 427.81 C93.03 427.67 91.61 427.46 90.20 427.18 C88.79 426.90 87.40 426.55 86.02 426.13 C84.64 425.72 83.29 425.23 81.96 424.68 C80.64 424.13 79.34 423.52 78.07 422.84 C76.80 422.16 75.57 421.42 74.38 420.62 C73.18 419.82 72.03 418.97 70.92 418.06 C69.81 417.14 68.74 416.18 67.73 415.16 C66.71 414.14 65.75 413.08 64.83 411.97 C63.92 410.86 63.07 409.70 62.27 408.51 C61.47 407.31 60.73 406.08 60.05 404.81 C59.38 403.54 58.76 402.24 58.21 400.91 C57.66 399.58 57.18 398.23 56.76 396.85 C56.34 395.48 55.99 394.08 55.71 392.67 C55.43 391.26 55.22 389.84 55.08 388.41 C54.94 386.98 54.87 385.54 54.87 384.11 L54.87 98.64 C54.87 97.20 54.94 95.76 55.08 94.33 C55.22 92.90 55.43 91.48 55.71 90.07 C55.99 88.66 56.34 87.26 56.76 85.89 C57.18 84.51 57.66 83.16 58.21 81.83 C58.76 80.50 59.38 79.20 60.05 77.93 C60.73 76.66 61.47 75.43 62.27 74.24 C63.07 73.04 63.92 71.89 64.83 70.77 C65.75 69.66 66.71 68.60 67.73 67.58 C68.74 66.56 69.81 65.60 70.92 64.69 C72.03 63.77 73.18 62.92 74.38 62.12 C75.57 61.32 76.80 60.58 78.07 59.90 C79.34 59.23 80.64 58.61 81.96 58.06 C83.29 57.51 84.64 57.03 86.02 56.61 C87.40 56.19 88.79 55.84 90.20 55.56 C91.61 55.28 93.03 55.07 94.46 54.93 C95.89 54.79 97.32 54.72 98.76 54.72 Z";
  const ROO = "M458.01 178.78 L443.12 167.86 L439.48 161.24 L427.90 154.95 C425.59 153.96 423.27 153.63 420.96 153.96 L420.30 148.00 C419.97 145.68 418.97 143.37 417.32 142.04 L413.02 138.07 C412.03 137.08 410.37 136.75 409.05 137.41 L408.39 137.74 C408.06 138.07 407.40 138.40 407.07 138.73 C405.74 138.07 403.76 138.07 402.77 139.06 L402.10 139.40 C400.78 140.39 400.12 142.37 400.78 144.03 L404.09 152.97 C405.08 155.61 407.40 157.93 410.04 159.26 L411.37 159.92 C411.37 159.92 411.37 160.25 411.03 160.25 L401.11 183.09 C398.13 188.05 392.84 191.36 386.56 191.36 L384.90 191.36 L356.12 191.36 C307.17 191.36 267.14 231.08 267.14 280.40 L267.14 299.60 C267.14 318.46 251.93 333.36 233.40 333.36 L172.21 337.00 C167.91 337.00 164.60 340.31 164.60 344.61 L232.74 344.61 L244.65 344.61 C266.48 344.61 285.67 330.71 292.28 309.86 L298.24 291.65 C304.85 297.28 313.45 300.59 322.71 300.59 C324.70 300.59 326.68 300.59 328.67 300.26 L331.65 304.56 L331.65 317.47 L326.02 338.32 C325.36 341.30 327.68 344.28 330.98 344.28 L399.46 344.28 C399.46 342.63 398.80 341.30 397.80 340.31 L407.07 340.31 C407.07 338.65 406.40 337.33 405.41 336.34 C404.42 335.34 402.77 334.68 401.11 334.68 L395.82 334.68 L392.18 331.37 L356.45 331.37 C353.81 331.37 351.82 329.39 351.82 326.74 L351.82 298.60 L366.38 259.22 L388.87 246.31 L395.82 263.85 L395.82 291.32 C399.46 291.32 402.43 289.00 403.43 285.69 C406.73 284.70 409.38 281.72 409.38 278.08 L409.38 241.01 C409.38 238.36 409.71 235.71 410.04 233.07 C421.29 223.47 427.91 209.57 427.91 194.34 L427.91 192.69 C427.91 190.70 429.56 189.04 431.54 189.04 L441.14 189.04 L449.74 191.36 C451.72 192.02 453.71 191.03 454.70 189.38 L457.68 189.38 L459.33 185.73 C460.65 183.42 459.99 180.44 458.01 178.78 Z";
  const ar = 517 / 374; // tile aspect ratio
  if (variant === "mark") {
    // kangaroo silhouette only (no tile); fills with currentColor
    return (
      <svg width={size} height={size} viewBox="160 134 305 215" style={{ display: "block" }} fill="currentColor">
        <path d={ROO} />
      </svg>
    );
  }
  // full tile logo
  return (
    <svg height={size} width={size * ar} viewBox="54 54 517 374" style={{ display: "block" }}>
      <path d={TILE} fill="#222730" />
      <path d={ROO} fill="#FD7014" />
    </svg>
  );
}

// ── Display config (labels / colors / helpers — not data) ────────────
const STATUS_META = {
  requested: { label: "Requested", color: "#6aa9ff" },   // customer-placed, awaiting confirm
  scheduled: { label: "Scheduled", color: "#7c8794" },
  batched: { label: "Batched", color: ORANGE },
  enroute: { label: "En route", color: ORANGE_HOT },
  onsite: { label: "On site", color: GREEN },
  complete: { label: "Complete", color: GREEN },
};
const STAGES = ["Batched", "En route", "On site", "Pouring", "Complete"];
// The delivery stages staff can set from the dispatch board, in order. Mirrors
// ORDER_STATUSES in the backend — keep the two in sync.
const ORDER_STATUSES = ["requested", "scheduled", "batched", "enroute", "onsite", "complete"];
// Options for the customer order form. Edit to match what you sell.
const MIXES = ["3000 PSI", "3500 PSI", "4000 PSI", "4500 PSI", "5000 PSI"];
const BUILD_TAG = "build Jun7-v29";   // bump on each deploy to verify clients aren't cached
const RECOMMENDED_MIX = "3500 PSI";
const TXDOT_MIXES = ["TxDOT Class A", "TxDOT Class B", "TxDOT Class C"];
const PRECAST_MIXES = ["Precast"];
const SLUMPS = ["0\"", "1\"", "2\"", "3\"", "4\"", "5\"", "6\"", "7\""];
const ADMIXTURES = ["Set Control", "Accelerant", "Fiber", "Color"];
const SET_TIMES = ["30 min", "1 hr", "1.5 hr", "2 hr", "3 hr", "4 hr"];
const USES = ["Slab", "Flatwork", "Driveway", "Sidewalk", "Curbs", "Footings", "Foundation", "Patio", "Walls", "Precast", "Other"];
// When set (build-time), the job-site field uses Google Places for accurate
// addresses; otherwise it falls back to the free OpenStreetMap source.
const GOOGLE_PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY || "";

const INV_STATUS = {
  paid: { label: "Paid", color: GREEN },
  due: { label: "Due", color: ORANGE },
  overdue: { label: "Past due", color: "#ef5350" },
};
const usd = (n) => (n ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

// "3m ago" style label. The backend sends naive UTC (datetime.utcnow), so mark
// it as UTC before parsing — otherwise the browser reads it as local time and
// shows an offset the size of your timezone.
function timeAgo(iso) {
  if (!iso) return "";
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  const t = new Date(hasTz ? iso : iso + "Z").getTime();
  const secs = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const C = { cond: "'Barlow Condensed', sans-serif", body: "Barlow, sans-serif" };

function bez(p0, p1, p2, t) {
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  return { x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.scheduled;
  return (
    <span style={{ background: m.color + "22", color: m.color, fontFamily: C.body }} className="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
      {m.label}
    </span>
  );
}

// Compact past/completed order row: tap the left to view it, or "Again" to
// reorder it in one tap. (Separate buttons, not nested.)
function PastOrderRow({ o, onOpen, onReorder }) {
  return (
    <div className="flex items-stretch gap-2 mb-2.5">
      <button onClick={() => onOpen(o)} className="flex-1 min-w-0 text-left rounded-2xl p-3 transition-transform active:scale-[0.98]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-xs font-bold tracking-wider">{o.id}</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-white/55 text-xs">{formatOrderDate(o.when)}</span>
        </div>
        <div style={{ fontFamily: C.cond }} className="text-white text-base font-semibold leading-tight mt-0.5 truncate">{o.project || o.site}</div>
        <div className="text-white/45 text-xs mt-0.5 truncate">{o.mix} · {o.qty}</div>
      </button>
      <button onClick={() => onReorder(o)} title="Order this again" className="shrink-0 rounded-2xl px-3 flex flex-col items-center justify-center gap-0.5 font-bold active:scale-95 transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
        <Plus size={16} /><span className="text-[11px]">Again</span>
      </button>
    </div>
  );
}

function OrderCard({ o, onOpen, showCustomer }) {
  return (
    <button onClick={() => onOpen(o)} className="w-full text-left rounded-2xl p-4 mb-3 transition-transform active:scale-[0.98]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{o.id}</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Clock size={12} /> {[formatOrderDate(o.when), o.time].filter(Boolean).join(" · ")}</span>
            {o.truck && o.truck !== "—" && (<><span className="text-white/40 text-xs">·</span><span className="text-white/60 text-xs flex items-center gap-1"><Truck size={12} /> {o.truck}</span></>)}
          </div>
          <div style={{ fontFamily: C.cond }} className="text-white text-lg font-semibold leading-tight mt-1 truncate">{o.project || o.site}</div>
          {o.project && <div className="text-white/45 text-xs mt-0.5 truncate flex items-center gap-1"><MapPin size={12} /> {o.site}</div>}
          <div className="text-white/50 text-sm mt-0.5">{showCustomer ? o.customer + " · " : ""}{o.mix}</div>
          {orderExtras(o) && <div className="text-white/40 text-xs mt-0.5 truncate">{orderExtras(o)}</div>}
          {o.use_for && <div className="text-white/40 text-xs mt-0.5 truncate">For: {o.use_for}</div>}
          {o.notes && <div className="text-white/40 text-xs mt-0.5 truncate">Note: {o.notes}</div>}
          {o.prepay_required && (
            <div className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: o.prepaid ? "rgba(39,192,138,0.15)" : "rgba(231,115,42,0.15)", color: o.prepaid ? GREEN : ORANGE, fontFamily: C.body }}>
              <CreditCard size={11} /> {o.prepaid ? "Paid" : "Payment due before delivery"}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div style={{ color: ORANGE, fontFamily: C.cond }} className="text-2xl font-bold leading-none">{o.qty}</div>
          <div className="mt-2"><StatusPill status={o.status} /></div>
        </div>
      </div>
    </button>
  );
}

function TrackMap({ progress }) {
  const plant = { x: 40, y: 210 };
  const ctrl = { x: 150, y: 30 };
  const site = { x: 280, y: 150 };
  const truck = bez(plant, ctrl, site, progress);
  const atSite = progress > 0.92;
  return (
    <svg viewBox="0 0 320 240" className="w-full rounded-2xl" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
      {Array.from({ length: 8 }).map((_, i) => <line key={"v" + i} x1={i * 45} y1="0" x2={i * 45} y2="240" stroke="rgba(255,255,255,0.04)" />)}
      {Array.from({ length: 6 }).map((_, i) => <line key={"h" + i} x1="0" y1={i * 45} x2="320" y2={i * 45} stroke="rgba(255,255,255,0.04)" />)}

      {/* geofences (One Step GPS) */}
      <circle cx={plant.x} cy={plant.y} r="26" fill="none" stroke="rgba(231,115,42,0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx={site.x} cy={site.y} r="26" fill="none" stroke={atSite ? GREEN : "rgba(39,192,138,0.4)"} strokeWidth="1.5" strokeDasharray="3 4" />
      {atSite && <circle cx={site.x} cy={site.y} r="26" fill="rgba(39,192,138,0.12)" />}

      <path d={`M${plant.x},${plant.y} Q${ctrl.x},${ctrl.y} ${site.x},${site.y}`} fill="none" stroke="rgba(231,115,42,0.25)" strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" />
      <path d={`M${plant.x},${plant.y} Q${ctrl.x},${ctrl.y} ${site.x},${site.y}`} fill="none" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 - 400 * progress} />

      <g><circle cx={plant.x} cy={plant.y} r="9" fill={NAVY} stroke={ORANGE} strokeWidth="2" /><text x={plant.x} y={plant.y + 30} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" fontFamily="Barlow">PLANT</text></g>
      <g><rect x={site.x - 7} y={site.y - 7} width="14" height="14" rx="3" fill={ORANGE_HOT} /><text x={site.x} y={site.y + 30} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" fontFamily="Barlow">SITE</text></g>

      <g transform={`translate(${truck.x},${truck.y})`}>
        <circle r="15" fill={ORANGE} opacity="0.25"><animate attributeName="r" values="13;19;13" dur="1.8s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" /></circle>
        <g transform={`rotate(${truck.ang})`}><circle r="12" fill="#fff" /><Truck x={-6.5} y={-6.5} width={13} height={13} color={NAVY} /></g>
      </g>
    </svg>
  );
}

function Timeline({ stageIdx }) {
  return (
    <div className="mt-4">
      {STAGES.map((s, i) => {
        const done = i < stageIdx, active = i === stageIdx;
        return (
          <div key={s} className="flex items-center gap-3 mb-2.5 last:mb-0">
            {done ? <CheckCircle2 size={20} color={GREEN} /> : active ? (
              <div className="relative"><Circle size={20} color={ORANGE} /><div className="absolute inset-0 m-auto w-2 h-2 rounded-full" style={{ background: ORANGE }} /></div>
            ) : <Circle size={20} color="rgba(255,255,255,0.2)" />}
            <span className="text-sm" style={{ color: done ? "rgba(255,255,255,0.55)" : active ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: active ? 600 : 400, fontFamily: C.body }}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

function TrackScreen({ order, onBack, onChanged }) {
  const [progress, setProgress] = useState(order.progress || 0.05);
  const [pos, setPos] = useState(order.truck_position || null);   // live truck position for the map
  const [payErr, setPayErr] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showReorder, setShowReorder] = useState(false);   // "Order again" — new order pre-filled from this one
  const editable = ["requested", "scheduled"].includes(order.status);
  const cancelOrder = async () => {
    if (!window.confirm(`Cancel order ${order.id}? This can't be undone.`)) return;
    try { await deleteOrder(order.id); onChanged && onChanged(); onBack(); }
    catch (e) { alert(e.message); }
  };

  // COD: open the QuickBooks pay link for this order (fetched live).
  const payCod = async () => {
    const w = window.open("", "_blank");
    setPayErr("");
    try {
      const r = await getOrderPaymentStatus(order.id);
      if (r.link) { if (w) w.location = r.link; else window.location.href = r.link; }
      else { if (w) w.close(); setPayErr(r.prepaid ? "This order is already paid." : "Payment link isn't ready yet — Aussieblock is setting it up."); }
    } catch (e) { if (w) w.close(); setPayErr(e.message); }
  };

  // LIVE: poll the backend for this order's real progress every few seconds.
  // The backend's GPS poller advances it (mock movement now, real One Step GPS
  // later), so the map + ETA reflect actual backend state — not a local animation.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const fresh = await getOrder(order.id);
        if (alive && fresh && typeof fresh.progress === "number") setProgress(fresh.progress);
        if (alive && fresh && fresh.truck_position) setPos(fresh.truck_position);
      } catch { /* ignore transient errors; keep last value */ }
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => { alive = false; clearInterval(iv); };
  }, [order.id]);

  const etaMin = Math.max(0, Math.round((1 - progress) * 22));
  // Drive the status pill + timeline from the order's REAL status, so a scheduled
  // or requested order doesn't look like it's already en route.
  const STATUS_STAGE = { batched: 0, enroute: 1, onsite: 2, complete: 4 };
  const isLive = ["batched", "enroute", "onsite", "complete"].includes(order.status);
  const stageIdx = STATUS_STAGE[order.status] ?? -1;

  // Open a printable delivery ticket for this order in a new tab.
  const openTicket = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const dateLine = [formatOrderDate(order.when), order.time].filter(Boolean).join(" · ");
    const statusLbl = (STATUS_META[order.status] || STATUS_META.scheduled).label;
    const row = (l, v) => (v ? `<div class="row"><span class="lab">${l}</span><span class="val">${v}</span></div>` : "");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Delivery Ticket ${order.id}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#161d27;margin:24px;}h1{color:#e7732a;margin:0;font-size:22px;letter-spacing:.5px;}
.muted{color:#667;font-size:13px;}.tk{font-size:20px;font-weight:bold;margin-top:4px;}
.grid{margin-top:18px;border-top:2px solid #161d27;}.row{display:flex;justify-content:space-between;gap:16px;padding:10px 2px;border-bottom:1px solid #e2e6ea;}
.lab{color:#667;font-size:12px;text-transform:uppercase;letter-spacing:.05em;}.val{font-weight:600;text-align:right;}
button{background:#e7732a;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer;margin-top:22px;}@media print{button{display:none;}}</style></head>
<body><h1>AUSSIEBLOCK READY MIX</h1><div class="muted">Delivery Ticket</div><div class="tk">${order.id}</div>
<div class="grid">
${row("Status", statusLbl)}
${row("Scheduled", dateLine || "—")}
${row("Customer", order.customer)}
${row("Project", order.project)}
${row("Job site", order.site)}
${row("For", order.use_for)}
${row("Product", order.mix)}
${row("Slump", order.slump)}
${row("Admixtures", order.admixtures)}
${row("Quantity", order.qty)}
${row("Truck", order.truck && order.truck !== "—" ? order.truck : "")}
${row("Notes", order.notes)}
</div>
<button onclick="window.print()">Print / Save as PDF</button>
<div class="muted" style="margin-top:22px;">Aussieblock office &middot; 325-213-5315</div></body></html>`);
    w.document.close();
  };

  return (
    <div className="px-4 pb-6 pt-2">
      <button onClick={onBack} className="flex items-center gap-1 text-white/60 text-sm mb-3 active:opacity-60"><ChevronLeft size={18} /> Back</button>
      <div className="flex items-baseline justify-between">
        <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{order.id}</span>
        <StatusPill status={order.status} />
      </div>
      <h2 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight mt-1">{order.project || order.site}</h2>
      {order.project && <p className="text-white/50 text-sm flex items-center gap-1"><MapPin size={13} /> {order.site}</p>}
      <p className="text-white/50 text-sm">{order.mix} · {order.qty}</p>
      {orderExtras(order) && <p className="text-white/40 text-xs mt-0.5">{orderExtras(order)}</p>}

      {order.prepay_required && !order.prepaid && (
        <div className="rounded-2xl p-4 mt-3" style={{ background: "rgba(231,115,42,0.12)", border: `1px solid ${ORANGE}` }}>
          <div className="text-white font-bold text-sm" style={{ fontFamily: C.cond }}>Payment required before delivery</div>
          <div className="text-white/55 text-xs mt-0.5" style={{ fontFamily: C.body }}>This is a COD order — pay now to get your delivery scheduled.</div>
          <button onClick={payCod} className="w-full mt-2.5 rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98]" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}><CreditCard size={16} /> Pay now</button>
          {payErr && <div className="text-xs mt-1.5" style={{ color: "#ff8a85", fontFamily: C.body }}>{payErr}</div>}
        </div>
      )}
      {order.prepay_required && order.prepaid && (
        <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: GREEN, fontFamily: C.body }}><CheckCircle2 size={14} /> Payment received — your delivery is confirmed</div>
      )}

      {isLive ? (
        <>
          <div className="mt-4"><GoogleTrackMap site={order.site} truckPosition={pos} truckLabel={order.truck} progress={progress} /></div>
          {progress > 0.92 && <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: GREEN, fontFamily: C.body }}><MapPin size={13} /> Truck entered site geofence — proof of delivery logged</div>}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-2xl p-4" style={{ background: NAVY }}><div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wide"><Clock size={13} /> ETA</div><div style={{ color: ORANGE, fontFamily: C.cond }} className="text-3xl font-bold mt-1">{progress >= 1 ? "Arrived" : `${etaMin} min`}</div></div>
            <div className="rounded-2xl p-4" style={{ background: NAVY }}><div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wide"><Truck size={13} /> Vehicle</div><div style={{ fontFamily: C.cond }} className="text-white text-3xl font-bold mt-1">{order.truck}</div></div>
          </div>
          <div className="rounded-2xl p-4 mt-3" style={{ background: NAVY }}><div className="text-white/50 text-xs uppercase tracking-wide">Delivery progress</div><Timeline stageIdx={stageIdx} /></div>
        </>
      ) : (
        <div className="rounded-2xl p-6 mt-4 text-center" style={{ background: NAVY }}>
          <Clock size={30} color={ORANGE} className="mx-auto mb-2" />
          <div className="text-white text-lg font-bold" style={{ fontFamily: C.cond }}>{order.status === "requested" ? "Awaiting confirmation" : "Scheduled"}</div>
          <div className="text-white/55 text-sm mt-1" style={{ fontFamily: C.body }}>
            {order.status === "requested"
              ? "Aussieblock will confirm this delivery shortly."
              : `Scheduled for ${[formatOrderDate(order.when), order.time].filter(Boolean).join(" · ") || "a date to be confirmed"}.`}
          </div>
          <div className="text-white/40 text-xs mt-2" style={{ fontFamily: C.body }}>Live truck tracking appears here once your delivery is on its way.</div>
        </div>
      )}
      {editable && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => setShowEdit(true)} className="rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-white active:scale-95 transition-transform" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><FileText size={16} /> Modify</button>
          <button onClick={cancelOrder} className="rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}><X size={16} /> Cancel</button>
        </div>
      )}

      <button onClick={() => setShowReorder(true)} className="w-full mt-3 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}><Plus size={18} /> Order again</button>

      <div className="mt-3">
        {isLive ? (
          <button onClick={openTicket} className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform text-white" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><FileText size={18} /> Ticket</button>
        ) : (
          <div className="text-center text-white/35 text-xs py-2" style={{ fontFamily: C.body }}>Delivery ticket will be available once the load is batched.</div>
        )}
      </div>

      {showEdit && <EditOrderModal order={order} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); onChanged && onChanged(); onBack(); }} />}
      {showReorder && <OrderConcreteModal initial={order} onClose={() => setShowReorder(false)} onPlaced={() => { setShowReorder(false); onChanged && onChanged(); onBack(); }} />}
    </div>
  );
}

// Build a readable address from a Photon (OpenStreetMap) result.
function addrString(p) {
  const line1 = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
  const line2 = [p.city || p.county, p.state, p.postcode].filter(Boolean).join(", ");
  return [line1, line2].filter(Boolean).join(", ");
}

// Job-site input with as-you-type address suggestions (free, no API key — Photon /
// OpenStreetMap, biased to the San Angelo plant). Click a suggestion to fill it in.
function AddressInput({ value, onChange, placeholder, inCls, inSt, wrapClass = "" }) {
  const [sugs, setSugs] = useState([]);
  const [open, setOpen] = useState(false);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const q = (value || "").trim();
    // Suggestions only when Google Places is configured. The free OpenStreetMap
    // source returned inaccurate addresses, so without a key this is a plain text
    // field (no wrong suggestions) until the Google key is added.
    if (!GOOGLE_PLACES_KEY || q.length < 4) { setSugs([]); return; }
    const t = setTimeout(async () => {
      try {
        const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Goog-Api-Key": GOOGLE_PLACES_KEY },
          body: JSON.stringify({
            input: q,
            includedRegionCodes: ["us"],
            locationRestriction: { rectangle: { low: { latitude: 29.27, longitude: -103.0 }, high: { latitude: 33.61, longitude: -97.91 } } },
          }),
        });
        const d = await resp.json();
        setSugs((d.suggestions || []).map((s) => s.placePrediction?.text?.text).filter(Boolean));
        setOpen(true);
      } catch { setSugs([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  const pick = (s) => { skip.current = true; onChange(s); setSugs([]); setOpen(false); };

  return (
    <div className={"relative " + wrapClass}>
      <input value={value} onChange={(e) => { onChange(e.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={placeholder} autoComplete="off" className={inCls} style={inSt} />
      {open && sugs.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg overflow-hidden max-h-44 overflow-y-auto shadow-xl" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)" }}>
          {sugs.map((s, i) => (
            <button key={i} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(s)} className="w-full text-left px-3 py-2 text-sm text-white border-b border-white/5 active:bg-white/10 flex items-start gap-2" style={{ fontFamily: C.body }}>
              <MapPin size={13} className="mt-0.5 shrink-0 text-white/40" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Shared concrete-spec fields (mix, use, qty, slump, admixtures + the detail
// inputs and short-load fee). Used by BOTH the customer order form and the staff
// "New order" form so they stay identical. Returns the fields JSX plus helpers.
// Reconstruct spec state from an existing order (for the edit form), or defaults.
function parseSpec(o = {}) {
  const mix = o.mix || RECOMMENDED_MIX;
  const qty = String(o.qty || "").replace(/[^\d.]/g, "");
  const slump = o.slump || "5\"";
  const uf = o.use_for || "";
  const useFor = !uf ? "" : (USES.includes(uf) ? uf : "Other");
  const useOther = useFor === "Other" ? uf : "";
  const admix = []; let extraSet = "1 hr", fiberExtra = "", colorDetail = "";
  String(o.admixtures || "").split(",").map((s) => s.trim()).filter(Boolean).forEach((p) => {
    if (p.startsWith("Set Control")) { admix.push("Set Control"); const m = p.match(/\+\s*(.+)/); if (m) extraSet = m[1].trim(); }
    else if (p.startsWith("Fiber")) { admix.push("Fiber"); const m = p.match(/([\d.]+)\s*lbs/); if (m) { const t = parseFloat(m[1]); if (t > 3) fiberExtra = String(t - 3); } }
    else if (p.startsWith("Color")) { admix.push("Color"); const m = p.match(/Color:\s*(.+)/); if (m) colorDetail = m[1].trim(); }
    else if (p === "Accelerant") admix.push("Accelerant");
  });
  return { mix, qty, slump, useFor, useOther, admix, extraSet, fiberExtra, colorDetail, project: o.project || "" };
}

function useConcreteSpec(initial) {
  const p = parseSpec(initial);
  const [mix, setMix] = useState(p.mix);
  const [useFor, setUseFor] = useState(p.useFor);
  const [useOther, setUseOther] = useState(p.useOther);
  const [qty, setQty] = useState(p.qty);
  const [slump, setSlump] = useState(p.slump);
  const [admix, setAdmix] = useState(p.admix);
  const [extraSet, setExtraSet] = useState(p.extraSet);
  const [fiberExtra, setFiberExtra] = useState(p.fiberExtra);
  const [colorDetail, setColorDetail] = useState(p.colorDetail);
  const [project, setProject] = useState(p.project);
  const [acceptShort, setAcceptShort] = useState(!!initial);   // editing → fee already accepted

  const OPPOSITE = { Accelerant: "Set Control", "Set Control": "Accelerant" };
  const toggleAdmix = (a) => setAdmix((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur.filter((x) => x !== OPPOSITE[a]), a]));
  const shortLoad = parseFloat(qty) > 0 && parseFloat(qty) < 5;
  const valid = !!(mix && qty.trim() && (!shortLoad || acceptShort));
  const shortNote = shortLoad ? "Short load fee $200 (accepted)" : "";
  const build = () => ({
    mix,
    qty: qty.trim() ? `${qty.trim()} CY` : "",
    slump,
    use_for: useFor === "Other" ? useOther.trim() : useFor,
    admixtures: admix.map((a) => {
      if (a === "Color" && colorDetail.trim()) return `Color: ${colorDetail.trim()}`;
      if (a === "Set Control" && extraSet) return `Set Control: +${extraSet}`;
      if (a === "Fiber") { const x = parseFloat(fiberExtra); return x > 0 ? `Fiber: ${3 + x} lbs/yd` : "Fiber: 3 lbs/yd"; }
      return a;
    }),
    project: project.trim(),
  });

  const inCls = "w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const lbl = "text-white/50 text-xs uppercase tracking-wide mb-1 block";

  const fields = (
    <>
      <label className={lbl}>Project (optional)</label>
      <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Project or job name / reference" className={inCls + " mb-3"} style={inSt} />

      <label className={lbl}>Mix</label>
      <select value={mix} onChange={(e) => setMix(e.target.value)} className={inCls + " mb-3"} style={inSt}>
        <optgroup label="Strength (PSI)">
          {MIXES.map((m) => <option key={m} value={m}>{m === RECOMMENDED_MIX ? `${m} (recommended)` : m}</option>)}
        </optgroup>
        <optgroup label="TxDOT mix design">
          {TXDOT_MIXES.map((m) => <option key={m} value={m}>{m}</option>)}
        </optgroup>
        <optgroup label="Precast">
          {PRECAST_MIXES.map((m) => <option key={m} value={m}>{m}</option>)}
        </optgroup>
      </select>

      <label className={lbl}>What's it for?</label>
      <select value={useFor} onChange={(e) => setUseFor(e.target.value)} className={inCls + (useFor === "Other" ? "" : " mb-3")} style={inSt}>
        <option value="">Select… (optional)</option>
        {USES.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
      {useFor === "Other" && <input value={useOther} onChange={(e) => setUseOther(e.target.value)} placeholder="Describe what it's for" className={inCls + " mt-2 mb-3"} style={inSt} />}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={lbl}>Quantity</label>
          <div className="flex items-center rounded-lg" style={inSt}>
            <input type="number" min="0" step="0.5" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 10" className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <span className="px-3 text-white/55 text-sm">CY</span>
          </div>
        </div>
        <div>
          <label className={lbl}>Slump</label>
          <select value={slump} onChange={(e) => setSlump(e.target.value)} className={inCls} style={inSt}>
            {SLUMPS.map((sl) => <option key={sl} value={sl}>{sl}</option>)}
          </select>
        </div>
      </div>

      {shortLoad && (
        <label className="flex items-start gap-2 rounded-lg p-2.5 mb-3 cursor-pointer" style={{ background: "rgba(231,115,42,0.12)", border: `1px solid ${ORANGE}` }}>
          <input type="checkbox" checked={acceptShort} onChange={(e) => setAcceptShort(e.target.checked)} className="mt-0.5" />
          <span className="text-xs text-white" style={{ fontFamily: C.body }}>Orders under 5 yd³ carry a <b>$200 short load fee</b>. Accepted.</span>
        </label>
      )}

      <label className={lbl}>Admixtures (optional)</label>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {ADMIXTURES.map((a) => {
          const on = admix.includes(a);
          return (
            <button key={a} type="button" onClick={() => toggleAdmix(a)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm active:scale-[0.98] transition-transform"
              style={{ background: on ? ORANGE + "22" : NAVY_DEEP, border: `1px solid ${on ? ORANGE : "rgba(255,255,255,0.12)"}`, color: "#fff", fontFamily: C.body }}>
              {on ? <CheckCircle2 size={15} color={ORANGE} /> : <Circle size={15} className="text-white/30" />} {a}
            </button>
          );
        })}
      </div>
      {admix.includes("Set Control") && (
        <div className="mb-3">
          <label className={lbl}>Additional set time</label>
          <select value={extraSet} onChange={(e) => setExtraSet(e.target.value)} className={inCls} style={inSt}>
            {SET_TIMES.map((t) => <option key={t} value={t}>+{t}</option>)}
          </select>
        </div>
      )}
      {admix.includes("Fiber") && (
        <div className="mb-3">
          <label className={lbl}>Fiber — extra lbs/yd (standard is 3)</label>
          <div className="flex items-center rounded-lg" style={inSt}>
            <input type="number" min="0" step="0.5" value={fiberExtra} onChange={(e) => setFiberExtra(e.target.value)} placeholder="0 (just the standard 3)" className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <span className="px-3 text-white/55 text-sm">lbs/yd</span>
          </div>
        </div>
      )}
      {admix.includes("Color") && (
        <input value={colorDetail} onChange={(e) => setColorDetail(e.target.value)} placeholder="Which color? (e.g. Davis Tan #677)" className={inCls + " mb-3"} style={inSt} />
      )}
    </>
  );

  return { fields, valid, shortNote, build };
}

// Customer-facing: place a concrete order from the app. Lands as "requested" for
// staff to confirm.
function OrderConcreteModal({ onClose, onPlaced, initial }) {
  const spec = useConcreteSpec(initial);
  // Date is always left for the customer to choose; everything else can be
  // pre-filled from a past order ("Order again"). The estimator passes only
  // { qty } as `initial`, so site/time/notes just stay empty there.
  const [date, setDate] = useState("");
  const [time, setTime] = useState(/^\d{2}:\d{2}/.test(initial?.time || "") ? initial.time : "");
  const [site, setSite] = useState(initial?.site || "");
  const [notes, setNotes] = useState(String(initial?.notes || "").replace(/\s*—?\s*Short load fee \$200 \(accepted\)\s*/i, "").trim());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const canSubmit = spec.valid && date >= localToday() && site.trim() && !busy;
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let finalNotes = notes.trim();
      if (spec.shortNote) finalNotes = (finalNotes ? finalNotes + " — " : "") + spec.shortNote;
      await requestOrder({ site: site.trim(), scheduled_for: date, time, notes: finalNotes, ...spec.build() });
      setDone(true);
      onPlaced && onPlaced();
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  const inCls = "w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const lbl = "text-white/50 text-xs uppercase tracking-wide mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Plus size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Order Concrete</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>

        {done ? (
          <div className="p-6 text-center" style={{ fontFamily: C.body }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: GREEN + "22" }}><CheckCircle2 size={30} color={GREEN} /></div>
            <div className="text-white text-lg font-bold" style={{ fontFamily: C.cond }}>Order requested</div>
            <div className="text-white/55 text-sm mt-1">Aussieblock will confirm your delivery and you'll see it update here.</div>
            <button onClick={onClose} className="mt-5 w-full rounded-xl py-2.5 font-bold" style={{ background: ORANGE, color: NAVY_DEEP }}>Done</button>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
            {spec.fields}

            <label className={lbl}>Job site</label>
            <AddressInput value={site} onChange={setSite} placeholder="Type address or business name" inCls={inCls} inSt={inSt} wrapClass="mb-3" />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="min-w-0"><label className={lbl}>Date</label><input type="date" min={localToday()} value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }} className={inCls} style={inSt} /></div>
              <div className="min-w-0"><label className={lbl}>Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inCls} style={inSt} /></div>
            </div>
            {date && date < localToday() && (
              <div className="rounded-lg px-3 py-2 mb-3 text-xs font-semibold" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85", fontFamily: C.body }}>Delivery date can’t be in the past — pick today or later.</div>
            )}

            <label className={lbl}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="e.g. pump truck needed, call on arrival" className={inCls + " mb-3 resize-none"} style={inSt} />

            {err && <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}

            <button onClick={submit} disabled={!canSubmit} className="w-full rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Request delivery
            </button>
            <div className="text-white/35 text-[11px] mt-2 text-center">Aussieblock confirms every order before it's scheduled.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Modify an existing order (customer or staff), reusing the shared spec fields
// pre-filled from the order. Saves via PATCH.
function EditOrderModal({ order, onClose, onSaved }) {
  const spec = useConcreteSpec(order);
  const [date, setDate] = useState(/^\d{4}-\d{2}-\d{2}$/.test(order.when || "") ? order.when : "");
  const [time, setTime] = useState(/^\d{2}:\d{2}/.test(order.time || "") ? order.time : "");
  const [site, setSite] = useState(order.site || "");
  const [notes, setNotes] = useState(String(order.notes || "").replace(/\s*—?\s*Short load fee \$200 \(accepted\)\s*/i, "").trim());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inCls = "w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const lbl = "text-white/50 text-xs uppercase tracking-wide mb-1 block";

  const canSubmit = spec.valid && date >= localToday() && site.trim() && !busy;
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let finalNotes = notes.trim();
      if (spec.shortNote) finalNotes = (finalNotes ? finalNotes + " — " : "") + spec.shortNote;
      const o = await editOrder(order.id, { site: site.trim(), scheduled_for: date, time, notes: finalNotes, ...spec.build() });
      onSaved(o);
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><FileText size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Modify order {order.id}</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {spec.fields}
          <label className={lbl}>Job site</label>
          <AddressInput value={site} onChange={setSite} placeholder="Type address or business name" inCls={inCls} inSt={inSt} wrapClass="mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="min-w-0"><label className={lbl}>Date</label><input type="date" min={localToday()} value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }} className={inCls} style={inSt} /></div>
            <div className="min-w-0"><label className={lbl}>Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inCls} style={inSt} /></div>
          </div>
          <label className={lbl}>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="e.g. pump truck needed, call on arrival" className={inCls + " mb-3 resize-none"} style={inSt} />
          {err && <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}
          <button onClick={submit} disabled={!canSubmit} className="w-full rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Concrete volume shapes — calc() returns cubic FEET from the entered dimensions.
const CALC_SHAPES = [
  { key: "Slab", fields: [["Length", "ft"], ["Width", "ft"], ["Thickness", "in"]], calc: (v) => v[0] * v[1] * (v[2] / 12) },
  { key: "Wall", fields: [["Length", "ft"], ["Height", "ft"], ["Thickness", "in"]], calc: (v) => v[0] * v[1] * (v[2] / 12) },
  { key: "Footing", fields: [["Length", "ft"], ["Width", "in"], ["Depth", "in"]], calc: (v) => v[0] * (v[1] / 12) * (v[2] / 12) },
  { key: "Column", fields: [["Diameter", "in"], ["Height", "ft"]], calc: (v) => Math.PI * Math.pow((v[0] / 2) / 12, 2) * v[1] },
];

// Customer concrete estimator — enter dimensions, get cubic yards, then order it.
function CalculatorScreen({ onPlaced }) {
  const [shapeKey, setShapeKey] = useState("Slab");
  const [vals, setVals] = useState({});
  const [waste, setWaste] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const shape = CALC_SHAPES.find((s) => s.key === shapeKey);

  const nums = shape.fields.map(([label]) => parseFloat(vals[label]));
  const valid = nums.every((n) => n > 0);
  const cubicFt = valid ? shape.calc(nums) : 0;
  const cy = cubicFt / 27;
  const orderCy = valid ? Math.ceil((waste ? cy * 1.1 : cy) * 4) / 4 : 0;   // round up to 1/4 yd

  const inCls = "w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const lbl = "text-white/50 text-xs uppercase tracking-wide mb-1 block";

  return (
    <div className="px-4 pb-6 pt-2">
      <h2 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight">Concrete Estimator</h2>
      <p className="text-white/45 text-sm mb-4" style={{ fontFamily: C.body }}>Enter your dimensions to estimate how many cubic yards you need.</p>

      {/* shape */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {CALC_SHAPES.map((s) => {
          const on = s.key === shapeKey;
          return (
            <button key={s.key} onClick={() => { setShapeKey(s.key); setVals({}); }} className="rounded-lg py-2 text-sm font-semibold active:scale-95 transition-transform"
              style={{ background: on ? ORANGE + "22" : NAVY, border: `1px solid ${on ? ORANGE : "rgba(255,255,255,0.12)"}`, color: on ? ORANGE : "#fff", fontFamily: C.body }}>{s.key}</button>
          );
        })}
      </div>

      {/* dimensions */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {shape.fields.map(([label, unit]) => (
          <div key={label}>
            <label className={lbl}>{label}</label>
            <div className="flex items-center rounded-lg" style={inSt}>
              <input type="number" min="0" step="any" value={vals[label] || ""} onChange={(e) => setVals((v) => ({ ...v, [label]: e.target.value }))} placeholder="0" className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
              <span className="px-3 text-white/55 text-sm">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={waste} onChange={(e) => setWaste(e.target.checked)} />
        <span className="text-white/70 text-sm" style={{ fontFamily: C.body }}>Add 10% for waste & spillage (recommended)</span>
      </label>

      {/* result */}
      <div className="rounded-2xl p-4 text-center mb-4" style={{ background: NAVY, border: `1px solid ${valid ? ORANGE : "rgba(255,255,255,0.1)"}` }}>
        {valid ? (
          <>
            <div style={{ color: ORANGE, fontFamily: C.cond }} className="text-4xl font-bold leading-none">{orderCy} <span className="text-xl">CY</span></div>
            <div className="text-white/60 text-xs mt-1" style={{ fontFamily: C.body }}>recommended order{waste ? " · incl. 10% waste" : ""}</div>
            <div className="text-white/35 text-[11px] mt-1" style={{ fontFamily: C.body }}>exact volume {cy.toFixed(2)} yd³ ({cubicFt.toFixed(1)} ft³)</div>
            {orderCy > 0 && orderCy < 5 && (
              <div className="mt-2 text-[11px] rounded-lg px-2 py-1.5" style={{ background: "rgba(231,115,42,0.12)", color: ORANGE, fontFamily: C.body }}>Orders under 5 yd³ carry a $200 short-load fee.</div>
            )}
          </>
        ) : (
          <div className="text-white/40 text-sm py-3" style={{ fontFamily: C.body }}>Enter all dimensions to see your estimate.</div>
        )}
      </div>

      <button onClick={() => setShowOrder(true)} disabled={!valid} className="w-full rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
        <Plus size={18} /> Order {valid ? `${orderCy} CY` : "this Concrete"}
      </button>
      <div className="text-white/35 text-[11px] mt-2 text-center" style={{ fontFamily: C.body }}>Estimate only — confirm coverage with your crew.</div>

      {showOrder && <OrderConcreteModal initial={{ qty: `${orderCy} CY` }} onClose={() => setShowOrder(false)} onPlaced={() => { setShowOrder(false); onPlaced && onPlaced(); }} />}
    </div>
  );
}

function OrdersScreen({ orders, account, onOpen, onPlaced }) {
  const [showOrder, setShowOrder] = useState(false);
  const [reorder, setReorder] = useState(null);   // a past order to "Order again"
  const todayKey = localToday();
  const requested = orders.filter((o) => o.status === "requested");
  // Completed orders go to their own "Past orders" history (most recent first),
  // so they don't clutter the live lists but stay easy to reorder.
  const completed = orders.filter((o) => o.status === "complete").slice().sort((a, b) => String(b.when).localeCompare(String(a.when)));
  const active = orders.filter((o) => o.status !== "requested" && o.status !== "complete");
  const todayO = active.filter((o) => orderDay(o.when, todayKey) === "today");
  const upcomingO = active.filter((o) => orderDay(o.when, todayKey) === "upcoming");
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const hdr = "text-white/50 text-xs font-semibold uppercase tracking-widest mb-2";
  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-white/45 text-sm" style={{ fontFamily: C.body }}>Welcome back</div>
          <h1 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight">{account?.company || "Your account"}</h1>
          <p className="text-white/40 text-sm mt-0.5">{todayLabel}</p>
        </div>
        <Bell size={20} className="text-white/60 mt-1" />
      </div>

      <button onClick={() => setShowOrder(true)} className="w-full rounded-2xl py-3.5 mb-5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
        <Plus size={18} /> Order Concrete
      </button>

      <h2 style={{ fontFamily: C.cond }} className="text-white text-lg font-bold mb-2">My Orders</h2>
      {orders.length === 0 && <div className="text-white/40 text-sm py-8 text-center" style={{ fontFamily: C.body }}>No orders yet. Tap “Order Concrete” to request a delivery.</div>}

      {requested.length > 0 && <div className={hdr} style={{ color: "#6aa9ff" }}>Pending confirmation</div>}
      {requested.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)}

      {todayO.length > 0 && <div className={hdr + " mt-5"}>Today</div>}
      {todayO.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)}

      {upcomingO.length > 0 && <div className={hdr + " mt-5"}>Upcoming</div>}
      {upcomingO.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)}

      {completed.length > 0 && <div className={hdr + " mt-5"}>Past orders · tap “Again” to reorder</div>}
      {completed.map((o) => <PastOrderRow key={o.id} o={o} onOpen={onOpen} onReorder={setReorder} />)}

      {showOrder && <OrderConcreteModal onClose={() => setShowOrder(false)} onPlaced={onPlaced} />}
      {reorder && <OrderConcreteModal initial={reorder} onClose={() => setReorder(null)} onPlaced={() => { setReorder(null); onPlaced && onPlaced(); }} />}
    </div>
  );
}

function AccountScreen({ account, customerId }) {
  // Track which invoice (if any) we're fetching a pay link for, plus any error.
  const [paying, setPaying] = useState(null);
  const [payErr, setPayErr] = useState("");

  if (!account) {
    return <div className="px-4 pt-10 text-center text-white/50" style={{ fontFamily: C.body }}>No billing account is linked to this login.</div>;
  }
  const invoices = account.invoices || [];
  const outstanding = account.balance ?? 0;
  const pastDue = account.pastDue ?? 0;
  const available = account.available ?? 0;
  const creditLimit = account.creditLimit ?? 0;
  const creditUsed = creditLimit ? Math.min(1, outstanding / creditLimit) : 0;

  // "Make a payment" opens QuickBooks' hosted pay page for a specific invoice
  // (overdue first, otherwise the first open one). We open a blank tab *inside*
  // the click so the browser doesn't block it, then point it at the link once
  // the backend returns it.
  const payTarget = invoices.find((i) => i.status === "overdue") || invoices.find((i) => i.status !== "paid");
  const payInvoice = async (number) => {
    if (customerId == null) return;
    setPayErr("");
    setPaying(number);
    const win = window.open("", "_blank");
    try {
      const { link } = await getInvoicePayLink(customerId, number);
      if (win) win.location = link; else window.location.href = link;
    } catch (e) {
      if (win) win.close();
      setPayErr(e.message || "Couldn’t open payment link.");
    } finally {
      setPaying(null);
    }
  };

  // Open a clean, printable account statement in a new tab (customer can save as
  // PDF or print). Built from the same balance + invoice data shown on screen.
  const openStatement = () => {
    const w = window.open("", "_blank");
    if (!w) { setPayErr("Allow pop-ups to open your statement."); return; }
    const stDate = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const total = invoices.reduce((s, i) => s + (i.amount || 0), 0);
    const rows = invoices.map((i) => {
      const lbl = (INV_STATUS[i.status] || INV_STATUS.due).label;
      return `<tr><td>${i.id}</td><td>${i.date || ""}</td><td>${i.order || ""}</td><td>${lbl}</td><td class="r">${usd(i.amount)}</td></tr>`;
    }).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Statement — ${account.company}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#161d27;margin:24px;}h1{color:#e7732a;margin:0;font-size:22px;letter-spacing:.5px;}
.muted{color:#667;font-size:13px;}.sum{display:flex;gap:30px;background:#f6f7f9;border-radius:10px;padding:14px 16px;margin-top:18px;}
.lab{color:#667;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}.big{font-size:20px;font-weight:bold;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin-top:18px;font-size:13px;}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #e2e6ea;}
th{color:#667;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}.r{text-align:right;}.pastdue{color:#c62828;}
button{background:#e7732a;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer;margin-top:22px;}@media print{button{display:none;}}</style></head>
<body><h1>AUSSIEBLOCK READY MIX</h1><div class="muted">Account Statement &middot; ${stDate}</div>
<div style="margin-top:14px;"><strong>${account.company}</strong><div class="muted">Account ${account.acctNo || ""} &middot; Terms ${account.terms || ""}</div></div>
<div class="sum"><div><div class="lab">Current balance</div><div class="big">${usd(account.balance)}</div></div>
${account.pastDue > 0 ? `<div><div class="lab pastdue">Past due</div><div class="big pastdue">${usd(account.pastDue)}</div></div>` : ""}</div>
<table><thead><tr><th>Invoice</th><th>Date</th><th>Order</th><th>Status</th><th class="r">Amount</th></tr></thead>
<tbody>${rows || `<tr><td colspan="5" class="muted">No invoices on file.</td></tr>`}</tbody>
<tfoot><tr><td colspan="4" class="r"><strong>Total</strong></td><td class="r"><strong>${usd(total)}</strong></td></tr></tfoot></table>
<button onclick="window.print()">Print / Save as PDF</button>
<div class="muted" style="margin-top:22px;">Questions? Aussieblock office &middot; 325-213-5315</div></body></html>`);
    w.document.close();
  };

  return (
    <div className="px-4 pb-6 pt-2">
      <h1 style={{ fontFamily: C.cond }} className="text-white text-3xl font-bold mb-4">Account</h1>

      {/* customer identity */}
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: NAVY }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE }}>
          <Building2 size={24} color={NAVY_DEEP} />
        </div>
        <div className="min-w-0">
          <div style={{ fontFamily: C.cond }} className="text-white text-xl font-bold leading-tight truncate">{account.company}</div>
          <div className="text-white/50 text-sm">Account {account.acctNo} · Terms {account.terms}</div>
        </div>
      </div>

      {/* balance hero */}
      <div className="rounded-2xl p-5 mt-3 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_HOT} 100%)` }}>
        <div className="absolute -right-6 -bottom-8 opacity-10"><Roo size={120} variant="mark" /></div>
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: NAVY_DEEP, opacity: 0.7, fontFamily: C.body }}>Current balance</div>
        <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-4xl font-bold mt-1">{usd(outstanding)}</div>
        {pastDue > 0 && (
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full" style={{ background: "rgba(22,29,39,0.85)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ef5350" }} />
            <span className="text-xs font-semibold" style={{ color: "#ff8a85", fontFamily: C.body }}>{usd(pastDue)} past due</span>
          </div>
        )}
        <button
          onClick={() => payTarget && payInvoice(payTarget.id)}
          disabled={!payTarget || paying != null}
          className="w-full mt-4 rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
          style={{ background: NAVY_DEEP, color: "#fff", fontFamily: C.body }}
        >
          <CreditCard size={18} color={ORANGE} />
          {paying != null ? "Opening QuickBooks…" : payTarget ? "Make a payment" : "No balance due"}
        </button>
        {payErr && (
          <div className="mt-2 text-xs rounded-lg px-3 py-2" style={{ background: "rgba(22,29,39,0.85)", color: "#ff8a85", fontFamily: C.body }}>
            {payErr}
          </div>
        )}
      </div>

      {/* credit line — only shown when a real credit limit is set (avoids a
          misleading negative "available" when no limit is configured) */}
      {creditLimit > 0 && (
      <div className="rounded-2xl p-4 mt-3" style={{ background: NAVY }}>
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs uppercase tracking-wide" style={{ fontFamily: C.body }}>Available credit</span>
          <span className="text-white/40 text-xs" style={{ fontFamily: C.body }}>Limit {usd(creditLimit)}</span>
        </div>
        <div style={{ color: GREEN, fontFamily: C.cond }} className="text-2xl font-bold mt-1">{usd(available)}</div>
        <div className="h-2 rounded-full mt-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full" style={{ width: `${creditUsed * 100}%`, background: creditUsed > 0.85 ? "#ef5350" : ORANGE }} />
        </div>
      </div>
      )}

      {/* invoices */}
      <div className="flex items-center justify-between mt-5 mb-2">
        <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Invoices</span>
        <button onClick={openStatement} className="flex items-center gap-1 text-xs active:opacity-60" style={{ color: ORANGE, fontFamily: C.body }}><Download size={12} /> Statement</button>
      </div>
      {invoices.map((inv) => {
        const m = INV_STATUS[inv.status] || INV_STATUS.due;
        const isOpen = inv.status !== "paid";   // paid invoices aren't payable
        const isPaying = paying === inv.id;
        return (
          <button
            key={inv.id}
            onClick={() => isOpen && payInvoice(inv.id)}
            disabled={!isOpen || (paying != null && !isPaying)}
            title={isOpen ? "Pay this invoice" : undefined}
            className="w-full text-left rounded-2xl p-4 mb-2.5 flex items-center justify-between active:scale-[0.98] transition-transform disabled:active:scale-100"
            style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span style={{ color: "#fff", fontFamily: C.cond }} className="text-base font-bold">{inv.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide" style={{ background: m.color + "22", color: m.color, fontFamily: C.body }}>{m.label}</span>
              </div>
              <div className="text-white/45 text-xs mt-0.5">{inv.date} · Order {inv.order}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span style={{ color: "#fff", fontFamily: C.cond }} className="text-lg font-bold">{usd(inv.amount)}</span>
              {isOpen ? (
                isPaying
                  ? <span className="text-[10px] font-semibold" style={{ color: ORANGE, fontFamily: C.body }}>Opening…</span>
                  : <span className="text-[10px] font-semibold uppercase tracking-wide flex items-center gap-0.5" style={{ color: ORANGE, fontFamily: C.body }}>Pay <ChevronRight size={14} /></span>
              ) : (
                <ChevronRight size={16} className="text-white/15" />
              )}
            </div>
          </button>
        );
      })}

      {/* support */}
      <div className="rounded-2xl p-4 mt-3 flex items-center gap-3" style={{ background: NAVY }}>
        <Phone size={18} color={ORANGE} />
        <div className="min-w-0">
          <div className="text-white/45 text-xs uppercase tracking-wide" style={{ fontFamily: C.body }}>Billing questions</div>
          <div className="text-white text-sm" style={{ fontFamily: C.body }}>Aussieblock office · 325-213-5315</div>
        </div>
      </div>
    </div>
  );
}

// ── Login screen (new — sits in front of everything) ─────────────────
function LoginScreen({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(email.trim(), password);
      const m = await getMe();
      onLoggedIn(m);
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#0c1117" }}>
      <style>{FONT}</style>
      <div className="w-full max-w-sm rounded-[2.2rem] overflow-hidden shadow-2xl" style={{ background: NAVY_DEEP, fontFamily: C.body, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="px-5 pt-5 pb-5 flex items-center gap-2.5" style={{ background: ORANGE }}>
          <Roo size={34} />
          <div className="leading-none">
            <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-xl font-bold tracking-tight">AUSSIEBLOCK</div>
            <div style={{ color: NAVY_DEEP, fontFamily: C.body }} className="text-[11px] font-semibold opacity-70 -mt-0.5">Ready Mix · Delivery Tracking</div>
          </div>
        </div>

        <form onSubmit={submit} className="px-5 py-6">
          <h1 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold">Sign in</h1>
          <p className="text-white/45 text-sm mb-5" style={{ fontFamily: C.body }}>Access your orders, tracking, and account.</p>

          <label className="block text-white/50 text-xs uppercase tracking-wide mb-1" style={{ fontFamily: C.body }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required
            className="w-full rounded-xl px-3 py-3 mb-4 text-white outline-none" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />

          <label className="block text-white/50 text-xs uppercase tracking-wide mb-1" style={{ fontFamily: C.body }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
            className="w-full rounded-xl px-3 py-3 text-white outline-none" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />

          {err && <div className="mt-4 rounded-xl px-3 py-2.5 text-sm" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>{err}</div>}

          <button type="submit" disabled={busy} className="w-full mt-5 rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : null} {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Splash({ label = "Loading…" }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4" style={{ background: "#0c1117" }}>
      <style>{FONT}</style>
      <Roo size={48} />
      <div className="flex items-center gap-2 text-white/60" style={{ fontFamily: C.body }}>
        <Loader2 size={16} className="animate-spin" /> {label}
      </div>
    </div>
  );
}

// ── Office / dispatch dashboard (staff logins land here) ─────────────
// The other end of the plus-load loop: customers tap "Request plus load" in
// the app, and those requests show up here for the office to action. Polls the
// backend every few seconds so new requests appear without a manual reload.
function PlusLoadCard({ r, onHandle, busy }) {
  return (
    <div className="rounded-2xl p-4 mb-3 flex items-start justify-between gap-4" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ background: ORANGE + "22", color: ORANGE, fontFamily: C.body }}>
            <Plus size={12} /> Plus load
          </span>
          <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{r.order_ref || `Order #${r.order_id}`}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/50 text-xs">{timeAgo(r.at)}</span>
        </div>
        <div style={{ fontFamily: C.cond }} className="text-white text-lg font-semibold leading-tight mt-1 truncate">{r.customer || "Unknown customer"}</div>
        <div className="text-white/50 text-sm mt-0.5 flex items-center gap-3 flex-wrap">
          {r.site && <span className="flex items-center gap-1"><MapPin size={13} /> {r.site}</span>}
          {r.time && <span className="flex items-center gap-1"><Clock size={13} /> {r.time}</span>}
        </div>
        {r.note && <div className="text-white/70 text-sm mt-2 rounded-lg px-3 py-2" style={{ background: NAVY_DEEP, fontFamily: C.body }}>“{r.note}”</div>}
      </div>
      <button onClick={() => onHandle(r.id)} disabled={busy} className="shrink-0 rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold active:scale-95 transition-transform disabled:opacity-60" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Mark handled
      </button>
    </div>
  );
}

// Aussieblock plant (San Angelo, TX). Mirrors PLANT_LAT/PLANT_LNG in the
// backend config — the origin the mock GPS orbits trucks around. The fleet map
// below is schematic (a fixed window around the plant), not a street map; swap
// in a real basemap once the One Step GPS key is live and positions are real.
const PLANT = { lat: 31.523310, lng: -100.394094 };   // yard: 2951 E FM 2105, San Angelo, TX (exact pin)
const MAP_CENTER = { lat: 31.4638, lng: -100.4370 };   // San Angelo — initial map center
const MAP_RADIUS_MI = 30;                              // initial view ~30-mile radius
const MAP_SPAN = 0.025;   // degrees shown each way from the plant (~2.7 km)

// Project a lat/lng into the SVG viewBox (W×H) with padding. Longitude → x
// (east = right), latitude → y (north = up, so we flip because SVG y grows down).
function projectToMap(lat, lng, W, H, pad) {
  const x = pad + ((lng - (PLANT.lng - MAP_SPAN)) / (2 * MAP_SPAN)) * (W - 2 * pad);
  const y = pad + (((PLANT.lat + MAP_SPAN) - lat) / (2 * MAP_SPAN)) * (H - 2 * pad);
  return { x, y };
}

function FleetMap({ trucks }) {
  const W = 460, H = 300, pad = 26;
  const located = trucks.filter((t) => t.lat != null && t.lng != null);
  const plant = projectToMap(PLANT.lat, PLANT.lng, W, H, pad);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* grid */}
        {Array.from({ length: Math.ceil(W / 46) + 1 }).map((_, i) => <line key={"v" + i} x1={i * 46} y1="0" x2={i * 46} y2={H} stroke="rgba(255,255,255,0.04)" />)}
        {Array.from({ length: Math.ceil(H / 46) + 1 }).map((_, i) => <line key={"h" + i} x1="0" y1={i * 46} x2={W} y2={i * 46} stroke="rgba(255,255,255,0.04)" />)}

        {/* plant + geofence */}
        <circle cx={plant.x} cy={plant.y} r="30" fill="none" stroke="rgba(231,115,42,0.3)" strokeWidth="1.5" strokeDasharray="3 4" />
        <circle cx={plant.x} cy={plant.y} r="9" fill={NAVY} stroke={ORANGE} strokeWidth="2" />
        <text x={plant.x} y={plant.y + 32} fill="rgba(255,255,255,0.55)" fontSize="10" textAnchor="middle" fontFamily="Barlow">PLANT</text>

        {/* trucks */}
        {located.map((t, i) => {
          const p = projectToMap(t.lat, t.lng, W, H, pad);
          const stale = isStale(t.updated_at);
          const color = stale ? "#7c8794" : ORANGE_HOT;
          return (
            <g key={t.device || t.label || i} transform={`translate(${p.x},${p.y})`}>
              {!stale && <circle r="13" fill={ORANGE} opacity="0.25"><animate attributeName="r" values="11;17;11" dur="1.8s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" /></circle>}
              <g transform={`rotate(${t.heading || 0})`}><circle r="11" fill="#fff" /><Navigation x={-6} y={-6} width={12} height={12} color={color} fill={color} /></g>
              <text x="0" y="26" fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="600">{t.label}</text>
            </g>
          );
        })}
      </svg>
      {located.length === 0 && (
        <div className="text-white/40 text-sm text-center py-3" style={{ fontFamily: C.body }}>No truck positions yet.</div>
      )}
    </div>
  );
}

// A position older than ~45s means the poller hasn't refreshed it recently.
function isStale(updatedAt) {
  if (!updatedAt) return true;
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(updatedAt);
  const t = new Date(hasTz ? updatedAt : updatedAt + "Z").getTime();
  return (Date.now() - t) / 1000 > 45;
}

// Dark Google Maps style so the real map matches the dispatch UI.
const MAP_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1b2430" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1b2430" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9aa7b5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a3543" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#b9c4d0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#13202b" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

// Load the Google Maps JS API once (reuses the Places key).
let _gmapsPromise = null;
function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (!GOOGLE_PLACES_KEY) return Promise.reject(new Error("no key"));
  if (!_gmapsPromise) {
    _gmapsPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_KEY}&v=weekly`;
      s.async = true;
      s.onload = () => (window.google?.maps ? resolve(window.google.maps) : reject(new Error("maps not ready")));
      s.onerror = () => reject(new Error("maps failed to load"));
      document.head.appendChild(s);
    });
  }
  return _gmapsPromise;
}

// Real Google map of the fleet. Falls back to the stylized SVG map if Maps JS
// isn't available (no key, or the Maps JavaScript API isn't enabled yet).
function GoogleFleetMap({ trucks }) {
  const elRef = useRef(null), mapRef = useRef(null), markersRef = useRef([]);
  const trucksRef = useRef(trucks); trucksRef.current = trucks;
  const [failed, setFailed] = useState(false);

  const drawTrucks = (maps) => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = trucksRef.current
      .filter((t) => t.lat != null && t.lng != null)
      .map((t) => new maps.Marker({
        position: { lat: t.lat, lng: t.lng }, map: mapRef.current, title: t.label,
        icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 5.5, rotation: t.heading || 0,
                fillColor: isStale(t.updated_at) ? "#7c8794" : "#ff7a3d", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 1.5 },
        label: { text: t.label, color: "#fff", fontSize: "10px", fontWeight: "600" },
      }));
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !elRef.current || mapRef.current) return;
      mapRef.current = new maps.Map(elRef.current, {
        center: MAP_CENTER, zoom: 11,   // San Angelo, ~15-mile radius
        mapTypeId: maps.MapTypeId.ROADMAP,   // normal map (toggle to satellite via control)
        disableDefaultUI: true, zoomControl: true, mapTypeControl: true,
        styles: MAP_DARK_STYLE,
      });
      new maps.Marker({
        position: { lat: PLANT.lat, lng: PLANT.lng }, map: mapRef.current, title: "Yard — 2951 E FM 2105, San Angelo",
        icon: { path: maps.SymbolPath.CIRCLE, scale: 7, fillColor: ORANGE, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
        label: { text: "Yard", color: "#e7732a", fontSize: "11px", fontWeight: "700" },
      });
      drawTrucks(maps);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const maps = window.google?.maps;
    if (maps && mapRef.current) drawTrucks(maps);
  }, [trucks]);

  if (failed || !GOOGLE_PLACES_KEY) return <FleetMap trucks={trucks} />;
  return <div ref={elRef} className="w-full h-full rounded-2xl" style={{ minHeight: 340, background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }} />;
}

// Real Google map for the CUSTOMER track screen: the yard, the live delivery
// truck (with heading), and the destination job site (geocoded from its address).
// Same dark Google map the dispatch board uses; falls back to the schematic
// TrackMap if Maps JS isn't available (no key / API not enabled).
function GoogleTrackMap({ site, truckPosition, truckLabel, progress }) {
  const elRef = useRef(null), mapRef = useRef(null);
  const truckMarkerRef = useRef(null), siteLatLngRef = useRef(null);
  const posRef = useRef(truckPosition); posRef.current = truckPosition;
  const [failed, setFailed] = useState(false);

  const truckIcon = (maps) => ({
    path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6,
    rotation: posRef.current?.heading || 0,
    fillColor: "#ff7a3d", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 1.5,
  });

  const drawTruck = (maps) => {
    const p = posRef.current;
    if (!mapRef.current || !p || p.lat == null) return;
    const pos = { lat: p.lat, lng: p.lng };
    if (!truckMarkerRef.current) {
      truckMarkerRef.current = new maps.Marker({
        position: pos, map: mapRef.current, title: truckLabel || "Truck", zIndex: 999,
        icon: truckIcon(maps),
        label: { text: truckLabel || "Truck", color: "#fff", fontSize: "10px", fontWeight: "600" },
      });
    } else {
      truckMarkerRef.current.setPosition(pos);
      truckMarkerRef.current.setIcon(truckIcon(maps));
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !elRef.current || mapRef.current) return;
      mapRef.current = new maps.Map(elRef.current, {
        center: PLANT, zoom: 12, mapTypeId: maps.MapTypeId.ROADMAP,
        disableDefaultUI: true, zoomControl: true, styles: MAP_DARK_STYLE,
      });
      new maps.Marker({   // yard
        position: { lat: PLANT.lat, lng: PLANT.lng }, map: mapRef.current, title: "Yard",
        icon: { path: maps.SymbolPath.CIRCLE, scale: 6, fillColor: ORANGE, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
        label: { text: "Yard", color: "#e7732a", fontSize: "10px", fontWeight: "700" },
      });
      drawTruck(maps);
      // Geocode the job site so the customer sees their destination (best-effort:
      // if the Geocoding API isn't enabled it just shows yard + truck).
      if (site) {
        try {
          new maps.Geocoder().geocode({ address: site }, (res, status) => {
            if (cancelled || status !== "OK" || !res?.[0] || !mapRef.current) return;
            const loc = res[0].geometry.location;
            siteLatLngRef.current = loc;
            new maps.Marker({
              position: loc, map: mapRef.current, title: site,
              icon: { path: maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 0 },   // hide arrow, use label pin below
            });
            new maps.Marker({
              position: loc, map: mapRef.current, title: site,
              icon: { path: maps.SymbolPath.CIRCLE, scale: 6, fillColor: "#ff4d4d", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
              label: { text: "Site", color: "#ff7a7a", fontSize: "10px", fontWeight: "700" },
            });
            const b = new maps.LatLngBounds();
            b.extend({ lat: PLANT.lat, lng: PLANT.lng }); b.extend(loc);
            if (posRef.current?.lat != null) b.extend({ lat: posRef.current.lat, lng: posRef.current.lng });
            mapRef.current.fitBounds(b, 50);
          });
        } catch { /* geocoder unavailable — keep yard + truck */ }
      }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  // Move the truck marker live as new positions arrive (no re-fit, so the
  // customer can pan/zoom without the map jumping).
  useEffect(() => {
    const maps = window.google?.maps;
    if (maps && mapRef.current) drawTruck(maps);
  }, [truckPosition?.lat, truckPosition?.lng, truckPosition?.heading]);

  if (failed || !GOOGLE_PLACES_KEY) return <TrackMap progress={progress} />;
  return <div ref={elRef} className="w-full rounded-2xl" style={{ height: 240, background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }} />;
}

// Pick a clean vector icon + accent color from a forecast's text.
function wxIcon(text = "", day = true) {
  const t = text.toLowerCase();
  if (/thunder|tstorm|t-storm/.test(t)) return { Icon: CloudLightning, color: "#facc15" };
  if (/snow|sleet|ice|flurr|wintry/.test(t)) return { Icon: CloudSnow, color: "#bae6fd" };
  if (/rain|shower|drizzle/.test(t)) return { Icon: CloudRain, color: "#60a5fa" };
  if (/fog|haze|mist|smoke/.test(t)) return { Icon: CloudFog, color: "#94a3b8" };
  if (/wind|breez/.test(t)) return { Icon: Wind, color: "#94a3b8" };
  if (/(sunny|clear)/.test(t) && !/partly|mostly cloudy/.test(t)) return day ? { Icon: Sun, color: "#fbbf24" } : { Icon: Moon, color: "#cbd5e1" };
  if (/partly|mostly sunny|few|scattered/.test(t)) return day ? { Icon: CloudSun, color: "#fbbf24" } : { Icon: CloudMoon, color: "#cbd5e1" };
  if (/cloud|overcast/.test(t)) return { Icon: Cloud, color: "#94a3b8" };
  return { Icon: Cloud, color: "#94a3b8" };
}

// Current conditions + multi-day forecast for San Angelo (National Weather
// Service — free, no key). Clean bar at the bottom of the dispatch board.
function WeatherBar() {
  const [wx, setWx] = useState(null);   // { tempF, text, day, days:[{name,hi,lo,text,day}] }
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const pt = await fetch(`https://api.weather.gov/points/${MAP_CENTER.lat},${MAP_CENTER.lng}`).then((r) => r.json());
        const [fc, obs] = await Promise.all([
          fetch(pt.properties.forecast).then((r) => r.json()),
          // Real current conditions from the nearest station's latest observation.
          (async () => {
            try {
              const sts = await fetch(pt.properties.observationStations).then((r) => r.json());
              const st = sts.observationStations?.[0];
              return st ? await fetch(`${st}/observations/latest`).then((r) => r.json()) : null;
            } catch { return null; }
          })(),
        ]);
        const periods = fc.properties.periods || [];
        // Build day cards: each daytime period + the following night for the low.
        const days = [];
        for (let i = 0; i < periods.length && days.length < 5; i++) {
          const p = periods[i];
          if (!p.isDaytime) continue;
          const night = periods[i + 1] && !periods[i + 1].isDaytime ? periods[i + 1] : null;
          days.push({ name: p.name, hi: p.temperature, lo: night ? night.temperature : null, text: p.shortForecast, day: true });
        }
        const op = obs?.properties;
        const curF = op && op.temperature?.value != null ? Math.round(op.temperature.value * 9 / 5 + 32) : null;
        if (alive) setWx({
          tempF: curF != null ? curF : periods[0]?.temperature,
          text: (curF != null && op.textDescription) ? op.textDescription : periods[0]?.shortForecast,
          day: periods[0]?.isDaytime ?? true,
          days,
        });
      } catch { /* leave hidden */ }
    };
    load();
    const id = setInterval(load, 30 * 60 * 1000);   // refresh every 30 min
    return () => { alive = false; clearInterval(id); };
  }, []);
  if (!wx) return null;
  const cur = wxIcon(wx.text, wx.day);
  const shortDay = (n) => (/^(today|tonight|this)/i.test(n) ? "Today" : n.split(" ")[0].slice(0, 3));
  return (
    <div className="shrink-0 flex items-center rounded-2xl px-4 py-2.5" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* current */}
      <div className="flex items-center gap-3 pr-5 mr-4 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <cur.Icon size={38} color={cur.color} strokeWidth={1.75} />
        <div>
          <div className="flex items-start gap-0.5">
            <span className="text-white text-3xl font-bold leading-none" style={{ fontFamily: C.cond }}>{wx.tempF}</span>
            <span className="text-white/50 text-sm font-semibold mt-0.5">°F</span>
          </div>
          <div className="text-white/55 text-xs mt-1" style={{ fontFamily: C.body }}>{wx.text}</div>
        </div>
        <div className="ml-1 self-end">
          <div className="text-white/35 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>San Angelo</div>
        </div>
      </div>
      {/* forecast */}
      <div className="flex items-center gap-5 overflow-x-auto">
        {wx.days.map((d) => {
          const ic = wxIcon(d.text, true);
          return (
            <div key={d.name} className="flex flex-col items-center shrink-0" title={d.text}>
              <span className="text-white/45 text-[11px] font-semibold mb-1" style={{ fontFamily: C.body }}>{shortDay(d.name)}</span>
              <ic.Icon size={22} color={ic.color} strokeWidth={1.75} />
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-white text-sm font-bold" style={{ fontFamily: C.cond }}>{d.hi}°</span>
                {d.lo != null && <span className="text-white/40 text-xs" style={{ fontFamily: C.cond }}>{d.lo}°</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// COD controls shown on a prepay-required order row: set the load total, create
// the QuickBooks pay link, send it, and check whether it's been paid.
function CodControls({ o }) {
  const [amount, setAmount] = useState(o.prepay_amount ? String(o.prepay_amount) : "");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [paid, setPaid] = useState(!!o.prepaid);

  if (paid) return <div className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: GREEN, fontFamily: C.body }}><CheckCircle2 size={13} /> Prepaid — cleared for dispatch</div>;

  const charge = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await chargeOrder(o.ref, parseFloat(amount));
      if (r.link) { setLink(r.link); setMsg("Pay link ready — send it to the customer."); }
      else { setMsg(`Invoice #${r.doc_number} created in QuickBooks (no email on file for a link). Collect payment there — unlocks when paid.`); }
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };
  const check = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await getOrderPaymentStatus(o.ref);
      if (r.prepaid) setPaid(true);
      else { setMsg(`Not paid yet${r.balance != null ? ` — balance ${usd(r.balance)}` : ""}.`); if (r.link) setLink(r.link); }
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="mt-2 rounded-lg p-2.5" style={{ background: "rgba(106,169,255,0.1)", border: "1px solid rgba(106,169,255,0.4)" }}>
      <div className="text-xs font-semibold mb-1.5" style={{ color: "#6aa9ff", fontFamily: C.body }}>COD — payment required before dispatch</div>
      <div className="flex gap-2">
        <div className="flex items-center rounded-lg flex-1" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }}>
          <span className="pl-2 text-white/50 text-sm">$</span>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="load total" className="w-full bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/30" style={{ fontFamily: C.body }} />
        </div>
        <button onClick={charge} disabled={busy || !amount} className="rounded-lg px-3 text-sm font-bold active:scale-95 disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>{o.prepay_amount ? "Update" : "Create"} link</button>
      </div>
      {link && (
        <div className="flex gap-2 mt-2">
          <a href={link} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-lg py-1.5 text-xs font-semibold" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>Open pay link</a>
          <button onClick={() => { navigator.clipboard?.writeText(link); setMsg("Link copied."); }} className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white active:scale-95" style={{ border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>Copy link</button>
        </div>
      )}
      <button onClick={check} disabled={busy} className="w-full mt-2 text-xs font-semibold py-1 active:opacity-70" style={{ color: "#6aa9ff", fontFamily: C.body }}>{busy ? "…" : "Check if paid"}</button>
      {msg && <div className="text-[11px] mt-1 text-white/60" style={{ fontFamily: C.body }}>{msg}</div>}
    </div>
  );
}

function OrderRow({ o, trucks, onStatus, onAssign, onCancel, onEdited, onCreated }) {
  const pct = Math.round((o.progress || 0) * 100);
  // Staff controls drive the backend, which can reject a move (e.g. setting a
  // load-carrying stage with no truck → 409). Track per-row busy/error so one
  // row's failed change doesn't block the others or the live polling.
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showEdit, setShowEdit] = useState(false);   // staff "Edit order" modal
  const [showReorder, setShowReorder] = useState(false);   // "Order again" — new order pre-filled from this one

  // The selects are *controlled* by o.status / o.truck (server truth). On a
  // rejected change the parent state never updates, so the select snaps back to
  // its previous value on its own — we just surface why.
  const run = async (fn, value) => {
    setBusy(true); setErr("");
    try { await fn(o.ref, value); }
    catch (e) { setErr(e.message || "Change rejected"); }
    finally { setBusy(false); }
  };

  const cancel = async () => {
    if (!window.confirm(`Cancel order ${o.ref} for ${o.customer}? This removes it from the board.`)) return;
    setBusy(true); setErr("");
    try { await onCancel(o.ref); }   // parent drops the row on success
    catch (e) { setErr(e.message || "Could not cancel"); setBusy(false); }
  };

  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: o.status === "requested" ? ORANGE + "1f" : NAVY, border: `1px solid ${o.status === "requested" ? ORANGE : "rgba(255,255,255,0.06)"}`, borderLeft: o.status === "requested" ? `4px solid ${ORANGE}` : (o.prepay_required ? "3px solid #6aa9ff" : undefined) }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{o.ref}</span>
            {o.prepay_required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: o.prepaid ? GREEN + "22" : "#6aa9ff22", color: o.prepaid ? GREEN : "#6aa9ff", fontFamily: C.body }}>{o.prepaid ? "COD · PAID" : "COD · UNPAID"}</span>}
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Clock size={12} /> {[formatOrderDate(o.when), o.time].filter(Boolean).join(" · ")}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Truck size={12} /> {o.truck}</span>
          </div>
          <div style={{ fontFamily: C.cond }} className="text-white text-lg font-semibold leading-tight mt-1 truncate">{o.project || o.site}</div>
          {o.project && <div className="text-white/45 text-xs mt-0.5 truncate flex items-center gap-1"><MapPin size={12} /> {o.site}</div>}
          <div className="text-white/50 text-sm mt-0.5 truncate">{o.customer} · {o.mix}</div>
          {orderExtras(o) && <div className="text-white/40 text-xs mt-0.5 truncate">{orderExtras(o)}</div>}
          {o.use_for && <div className="text-white/40 text-xs mt-0.5 truncate">For: {o.use_for}</div>}
          {o.notes && <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#6aa9ff" }}><FileText size={11} /> {o.notes}</div>}
        </div>
        <div className="text-right shrink-0">
          <div style={{ color: ORANGE, fontFamily: C.cond }} className="text-2xl font-bold leading-none">{o.qty}</div>
          <div className="mt-2"><StatusPill status={o.status} /></div>
        </div>
      </div>
      {/* progress bar — only meaningful once a truck is rolling */}
      {(o.status === "enroute" || o.status === "batched" || o.status === "onsite") && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: o.status === "onsite" ? GREEN : ORANGE }} />
          </div>
          <div className="text-white/35 text-[11px] mt-1" style={{ fontFamily: C.body }}>{o.status === "onsite" ? "On site" : `${pct}% to site`}</div>
        </div>
      )}

      {/* staff controls — set the delivery stage and put a truck on the job */}
      <div className="mt-3 pt-3 grid grid-cols-2 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Status</span>
          <select
            value={o.status} disabled={busy}
            onChange={(e) => run(onStatus, e.target.value)}
            className="rounded-lg px-2 py-1.5 text-sm outline-none disabled:opacity-50 cursor-pointer"
            style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
          >
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Truck</span>
          <select
            value={o.truck} disabled={busy}
            onChange={(e) => run(onAssign, e.target.value)}
            className="rounded-lg px-2 py-1.5 text-sm outline-none disabled:opacity-50 cursor-pointer"
            style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
          >
            <option value="—">Unassigned</option>
            {trucks.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
        </label>
      </div>
      {o.prepay_required && <CodControls o={o} />}
      {err && (
        <div className="mt-2 rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>
          {err}
        </div>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={() => setShowReorder(true)} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: NAVY_DEEP, background: ORANGE, fontFamily: C.body }}>
          <Plus size={12} /> Order again
        </button>
        <button onClick={() => setShowEdit(true)} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "#fff", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>
          <FileText size={12} /> Edit order
        </button>
        <button onClick={cancel} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "#ff8a85", background: "rgba(239,83,80,0.1)", fontFamily: C.body }}>
          <X size={12} /> Cancel order
        </button>
      </div>
      {showEdit && (
        <EditOrderModal
          order={{ ...o, id: o.ref }}
          onClose={() => setShowEdit(false)}
          onSaved={(u) => { setShowEdit(false); onEdited && onEdited(u); }}
        />
      )}
      {showReorder && (
        <NewOrderModal
          trucks={trucks}
          initial={o}
          onClose={() => setShowReorder(false)}
          onCreated={(no) => { setShowReorder(false); onCreated && onCreated(no); }}
        />
      )}
    </div>
  );
}

// Header status pill. Pulses green while data is actually flowing; if the last
// refresh failed (backend unreachable) it goes gray + "OFFLINE" so you can tell.
function LivePill({ live = true }) {
  const color = live ? GREEN : "#7c8794";
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: NAVY_DEEP, color, fontFamily: C.body }}>
      <span className="relative flex h-2 w-2">
        {live && <span className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping" style={{ background: GREEN }} />}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
      </span>
      {live ? "LIVE" : "OFFLINE"}
    </span>
  );
}

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "22" }}>
        <Icon size={20} color={accent} />
      </div>
      <div className="min-w-0">
        <div style={{ color: "#fff", fontFamily: C.cond }} className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-white/45 text-xs uppercase tracking-wide mt-1" style={{ fontFamily: C.body }}>{label}</div>
      </div>
    </div>
  );
}

// `fill` makes the panel fill its column height with an internally scrolling
// body — used by the single-screen dispatch dashboard so the page never scrolls.
function Panel({ title, icon: Icon, count, children, fill = false }) {
  return (
    <div className={"rounded-2xl p-4" + (fill ? " flex flex-col min-h-0 h-full" : "")} style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Icon size={16} color={ORANGE} />
        <h2 style={{ fontFamily: C.cond }} className="text-white text-lg font-bold">{title}</h2>
        {count != null && <span className="text-white/40 text-sm" style={{ fontFamily: C.body }}>({count})</span>}
      </div>
      {fill ? <div className="overflow-y-auto min-h-0 flex-1 -mr-1 pr-1">{children}</div> : children}
    </div>
  );
}

// Turn a free-form contact string into a textable number, or null if it has no
// usable phone (e.g. it's an email). US-centric: 10 digits -> +1, 11 with a
// leading 1 -> +1.
function toSmsNumber(contact) {
  const d = (contact || "").replace(/\D/g, "");
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d[0] === "1") return "+" + d;
  if (d.length >= 7) return "+" + d;
  return null;
}

// Staff tool: create or reset the login a customer uses to see their own orders
// & billing, then text them an invite. Lives in the dispatch board's right column.
function CustomerLogins({ orders = [], trucks = [], onReordered }) {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState(null);        // selected customer id
  const [reorder, setReorder] = useState(null);   // a past order to "Order again" for this customer
  const [emailVal, setEmailVal] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);        // { ok, text }
  const [invite, setInvite] = useState(null);  // { id, name, phone, sms, text } after create
  const [copied, setCopied] = useState(false);
  const [smsAuto, setSmsAuto] = useState(false);   // app can send texts itself (Twilio)
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [codOnly, setCodOnly] = useState(false);   // filter list to COD customers

  const load = async () => {
    try { setCustomers(await getCustomers()); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  useEffect(() => { load(); getSmsEnabled().then((r) => setSmsAuto(!!r.enabled)).catch(() => {}); }, []);

  const sendText = async () => {
    setSending(true);
    try {
      const r = await textInvite(invite.id, invite.text);
      setSent(true);
      setMsg({ ok: true, text: `Text sent to ${r.customer} (${r.to}).` });
    } catch (e) {
      setMsg({ ok: false, text: `Couldn't send: ${e.message}` });
    } finally {
      setSending(false);
    }
  };

  const pick = (c) => {
    setSel(c.id);
    setEmailVal(c.login_email || "");
    setPw("");
    setMsg(null);
    setInvite(null);
    setCopied(false);
    setSent(false);
  };

  const submit = async () => {
    const cust = customers.find((c) => c.id === sel);
    const password = pw;
    setBusy(true); setMsg(null);
    try {
      const r = await setCustomerLogin(sel, emailVal.trim(), password);
      const appUrl = window.location.origin;
      const text = `Hi ${cust.name}, Aussieblock now has an app to track your concrete deliveries and pay invoices online. Open ${appUrl} and sign in — email: ${r.email}, password: ${password}. Questions? Call 325-213-5315.`;
      setInvite({ id: cust.id, name: cust.name, phone: cust.contact, sms: toSmsNumber(cust.contact), text });
      setSent(false);
      setMsg({ ok: true, text: `Login ${r.action} for ${cust.name}. Send the invite below 👇` });
      setPw("");
      await load();   // refresh the "has login" badges
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove the login for ${selCust.name}? They won't be able to sign in until you create a new one.`)) return;
    setBusy(true); setMsg(null);
    try {
      await removeCustomerLogin(sel);
      setMsg({ ok: true, text: `Login removed for ${selCust.name}.` });
      setEmailVal(""); setPw("");
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const toggleCod = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await setCustomerCod(sel, !selCust.cod);
      await load();
      setMsg({ ok: true, text: `COD ${r.cod ? "ON" : "off"} for ${r.customer}.` });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const runAging = async () => {
    if (!window.confirm("Flag every customer with an unpaid balance 30+ days old as COD?")) return;
    setBusy(true); setMsg(null);
    try {
      const r = await codFromAging(30);
      await load();
      setMsg({ ok: true, text: r.newly_flagged.length ? `Flagged ${r.newly_flagged.length} new COD customer(s) (30+ day balances).` : "No new customers to flag — all 30+ day balances are already COD." });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const f = filter.trim().toLowerCase();
  const codCount = customers.filter((c) => c.cod).length;
  const shown = customers
    .filter((c) => (f ? c.name.toLowerCase().includes(f) : true))
    .filter((c) => (codOnly ? c.cod : true))
    .sort((a, b) => a.name.localeCompare(b.name));
  const selCust = customers.find((c) => c.id === sel);
  // The selected customer's completed orders (most recent first), for reordering.
  const selPast = selCust
    ? orders.filter((o) => o.status === "complete" && o.customer === selCust.name).slice().sort((a, b) => String(b.when).localeCompare(String(a.when)))
    : [];

  return (
    <Panel title="Customers" icon={KeyRound} count={`${codCount} COD`}>
      {/* search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
        <Search size={14} className="text-white/40" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search customers…"
          className="bg-transparent outline-none text-sm text-white w-full placeholder:text-white/30"
          style={{ fontFamily: C.body }}
        />
      </div>
      {/* COD filter */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setCodOnly(false)} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: codOnly ? NAVY : "#6aa9ff22", color: codOnly ? "rgba(255,255,255,0.5)" : "#6aa9ff", border: `1px solid ${codOnly ? "rgba(255,255,255,0.12)" : "#6aa9ff"}`, fontFamily: C.body }}>All</button>
        <button onClick={() => setCodOnly(true)} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: codOnly ? "#6aa9ff22" : NAVY, color: codOnly ? "#6aa9ff" : "rgba(255,255,255,0.5)", border: `1px solid ${codOnly ? "#6aa9ff" : "rgba(255,255,255,0.12)"}`, fontFamily: C.body }}>COD only ({codCount})</button>
        <button onClick={runAging} disabled={busy} className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full active:scale-95 disabled:opacity-50" style={{ background: "#6aa9ff22", color: "#6aa9ff", border: "1px solid #6aa9ff", fontFamily: C.body }}>Auto-COD 30+ day balances</button>
      </div>

      {/* customer list */}
      <div className="max-h-[55vh] overflow-y-auto pr-1 -mr-1">
        {shown.length === 0 ? (
          <div className="text-white/40 text-sm py-6 text-center" style={{ fontFamily: C.body }}>No customers match.</div>
        ) : shown.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c)}
            className="w-full text-left rounded-lg px-3 py-2 mb-1 flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: sel === c.id ? ORANGE + "22" : (c.cod ? "#6aa9ff14" : NAVY), border: `1px solid ${sel === c.id ? ORANGE : (c.cod ? "#6aa9ff55" : "rgba(255,255,255,0.06)")}` }}
          >
            <span className="text-white text-sm truncate" style={{ fontFamily: C.body }}>{c.name}</span>
            <span className="flex items-center gap-1 shrink-0">
              {c.cod && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#6aa9ff22", color: "#6aa9ff" }}>COD</span>}
              {c.login_email
                ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: GREEN + "22", color: GREEN }}><CheckCircle2 size={10} /> Login</span>
                : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>No login</span>}
            </span>
          </button>
        ))}
      </div>

      {/* create / reset form */}
      {selCust && (
        <div className="rounded-xl p-3 mt-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>
            {selCust.login_email ? "Reset login for " : "Create login for "}{selCust.name}
          </div>
          <button onClick={toggleCod} disabled={busy} className="w-full mb-2 rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] disabled:opacity-50" style={{ background: selCust.cod ? "#6aa9ff22" : NAVY_DEEP, border: `1px solid ${selCust.cod ? "#6aa9ff" : "rgba(255,255,255,0.12)"}`, color: selCust.cod ? "#6aa9ff" : "#fff", fontFamily: C.body }}>
            {selCust.cod ? <CheckCircle2 size={15} /> : <Circle size={15} className="text-white/30" />} COD — pay before delivery
          </button>
          <input
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            placeholder="customer email"
            autoComplete="off"
            className="w-full rounded-lg px-3 py-2 mb-2 text-sm text-white outline-none placeholder:text-white/30"
            style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
          />
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="password (min 6 characters)"
            autoComplete="new-password"
            className="w-full rounded-lg px-3 py-2 mb-2 text-sm text-white outline-none placeholder:text-white/30"
            style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
          />
          <button
            onClick={submit}
            disabled={busy || !emailVal.trim() || pw.length < 6}
            className="w-full rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            {selCust.login_email ? "Reset password" : "Create login"}
          </button>
          {selCust.login_email && (
            <button
              onClick={remove}
              disabled={busy}
              className="w-full mt-2 rounded-lg py-2 text-xs font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
              style={{ background: "transparent", color: "#ff8a85", border: "1px solid rgba(239,83,80,0.4)", fontFamily: C.body }}
            >
              Remove login
            </button>
          )}
        </div>
      )}

      {/* selected customer's past orders → one-tap reorder */}
      {selCust && (
        <div className="rounded-xl p-3 mt-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>Past orders — {selCust.name}</div>
          {selPast.length === 0 ? (
            <div className="text-white/35 text-xs py-1" style={{ fontFamily: C.body }}>No completed orders yet.</div>
          ) : selPast.map((o) => (
            <div key={o.ref} className="flex items-stretch gap-2 mb-1.5">
              <div className="flex-1 min-w-0 rounded-lg px-3 py-2" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{o.project || o.site}</div>
                <div className="text-white/45 text-xs truncate" style={{ fontFamily: C.body }}>{formatOrderDate(o.when)} · {o.mix} · {o.qty}</div>
              </div>
              <button onClick={() => setReorder(o)} title="Order this again" className="shrink-0 rounded-lg px-3 flex items-center gap-1 text-xs font-bold active:scale-95 transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}><Plus size={13} /> Again</button>
            </div>
          ))}
        </div>
      )}

      {reorder && (
        <NewOrderModal
          trucks={trucks}
          initial={reorder}
          onClose={() => setReorder(null)}
          onCreated={(no) => { setReorder(null); setMsg({ ok: true, text: `New order ${no.ref} created for ${no.customer}.` }); onReordered && onReordered(no); }}
        />
      )}

      {msg && (
        <div className="rounded-lg px-3 py-2 mt-2 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85", fontFamily: C.body }}>
          {msg.text}
        </div>
      )}

      {invite && (
        <div className="rounded-xl p-3 mt-2" style={{ background: NAVY, border: `1px solid ${ORANGE}` }}>
          <div className="text-white text-sm font-semibold" style={{ fontFamily: C.cond }}>Send the invite to {invite.name}</div>
          <div className="text-white/45 text-xs mb-2" style={{ fontFamily: C.body }}>Phone on file: {invite.phone || "none"}</div>
          <div className="flex gap-2">
            {smsAuto ? (
              // App sends it itself (Twilio configured).
              invite.sms ? (
                <button onClick={sendText} disabled={sending || sent} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                  {sending ? <Loader2 size={14} className="animate-spin" /> : sent ? <CheckCircle2 size={14} /> : <Send size={14} />} {sent ? "Sent" : sending ? "Sending…" : "Send text"}
                </button>
              ) : (
                <div className="flex-1 rounded-lg py-2 text-center text-xs text-white/40" style={{ fontFamily: C.body }}>No phone on file</div>
              )
            ) : (
              // Fallback: open the staff phone's messaging app.
              invite.sms ? (
                <a href={`sms:${invite.sms}?body=${encodeURIComponent(invite.text)}`} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                  <Send size={14} /> Text invite
                </a>
              ) : (
                <div className="flex-1 rounded-lg py-2 text-center text-xs text-white/40" style={{ fontFamily: C.body }}>No phone on file</div>
              )
            )}
            <button onClick={() => { navigator.clipboard?.writeText(invite.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-semibold active:scale-[0.98] transition-transform" style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
              {copied ? <CheckCircle2 size={14} color={GREEN} /> : <Download size={14} />} {copied ? "Copied" : "Copy text"}
            </button>
          </div>
          <div className="text-white/35 text-[11px] mt-2" style={{ fontFamily: C.body }}>{smsAuto ? "\"Send text\" texts the customer automatically from your business number." : "\"Text invite\" opens your phone's messaging app with the message ready — just hit send."}</div>
        </div>
      )}
    </Panel>
  );
}

// Staff modal: add/remove the trucks in the fleet. The GPS device id is optional
// (fill it in later, paired with a One Step GPS API key, to enable live tracking).
function ManageTrucksModal({ onClose, onChanged }) {
  const [trucks, setTrucks] = useState([]);
  const [label, setLabel] = useState("");
  const [device, setDevice] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try { setTrucks(await getTrucks()); } catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await addTruck(label.trim(), device.trim(), notes.trim());
      setMsg({ ok: true, text: `Truck ${r.action}: ${r.label}` });
      setLabel(""); setDevice(""); setNotes("");
      await load(); onChanged && onChanged();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };

  const remove = async (lbl) => {
    if (!window.confirm(`Remove ${lbl}? It will be taken off any orders it's on.`)) return;
    setBusy(true); setMsg(null);
    try { await deleteTruck(lbl); await load(); onChanged && onChanged(); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };

  const inCls = "w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const existing = trucks.find((t) => t.label.trim().toLowerCase() === label.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Truck size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Manage trucks</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {/* current fleet */}
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Your fleet ({trucks.length}) — tap a truck to edit</div>
          {trucks.length === 0 ? (
            <div className="text-white/40 text-sm py-4 text-center mb-3" style={{ background: NAVY, borderRadius: 12 }}>No trucks yet — add your first below.</div>
          ) : (
            <div className="mb-4">
              {trucks.map((t) => (
                <div key={t.label} className="flex items-center justify-between rounded-lg px-3 py-2 mb-1.5" style={{ background: NAVY, border: `1px solid ${existing && existing.label === t.label ? ORANGE : "rgba(255,255,255,0.06)"}` }}>
                  <button onClick={() => { setLabel(t.label); setDevice(t.device || ""); setNotes(t.notes || ""); }} className="min-w-0 flex-1 text-left">
                    <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{t.label}</div>
                    <div className="text-white/40 text-xs truncate">{t.device ? `GPS: ${t.device}` : "No GPS device"}</div>
                    {t.notes && <div className="text-white/55 text-xs truncate mt-0.5 flex items-center gap-1"><FileText size={11} /> {t.notes}</div>}
                  </button>
                  <button onClick={() => remove(t.label)} disabled={busy} title="Remove truck" className="p-1.5 rounded-lg shrink-0 ml-2 active:scale-90 disabled:opacity-50" style={{ background: "rgba(239,83,80,0.12)" }}>
                    <Trash2 size={15} color="#ff8a85" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* add / edit form */}
          <div className="rounded-xl p-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>{existing ? `Edit ${existing.label}` : "Add a truck"}</div>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Truck name (e.g. RTS 4554)" className={inCls + " mb-2"} style={inSt} />
            <input value={device} onChange={(e) => setDevice(e.target.value)} placeholder="GPS device ID (optional)" className={inCls + " mb-2"} style={inSt} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (driver, capacity, maintenance…)" className={inCls + " mb-1 resize-none"} style={inSt} />
            <p className="text-white/35 text-xs mb-2">Tap a truck above to edit it. GPS ID optional — add it later to turn on live tracking.</p>
            <button onClick={add} disabled={busy || !label.trim()} className="w-full rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {existing ? "Update truck" : "Add truck"}
            </button>
          </div>

          {msg && (
            <div className="rounded-lg px-3 py-2 mt-3 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85" }}>{msg.text}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Staff modal: month calendar for delivery planning. Each day cell shows the
// total yards scheduled; clicking a day lists that day's orders (with controls).
// Staff "Past orders" history modal — completed orders, most recent first, each
// a full OrderRow so staff can review and one-tap "Order again".
function PastOrdersModal({ orders, trucks, onStatus, onAssign, onCancel, onEdited, onCreated, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Inbox size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Past orders ({orders.length})</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ fontFamily: C.body }}>
          {orders.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center">No completed orders yet.</div>
          ) : (
            orders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={onStatus} onAssign={onAssign} onCancel={onCancel} onEdited={onEdited} onCreated={onCreated} />)
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarModal({ orders, trucks, onStatus, onAssign, onCancel, onEdited, onCreated, onClose }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const todayKey = localToday();
  const [selected, setSelected] = useState(todayKey);

  const active = orders.filter((o) => o.status !== "complete");
  const byDay = {};
  for (const o of active) (byDay[o.when] ||= []).push(o);
  const yardsFor = (key) => (byDay[key] || []).reduce((s, o) => s + parseYards(o.qty), 0);

  const pad = (n) => String(n).padStart(2, "0");
  const monthPrefix = `${ym.y}-${pad(ym.m + 1)}`;
  const keyOf = (d) => `${monthPrefix}-${pad(d)}`;
  const firstDow = new Date(ym.y, ym.m, 1).getDay();          // 0 = Sunday
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(ym.y, ym.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthYards = active.filter((o) => (o.when || "").startsWith(monthPrefix)).reduce((s, o) => s + parseYards(o.qty), 0);
  const shiftMonth = (delta) => setYm(({ y, m }) => { const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const selOrders = byDay[selected] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden max-h-[94vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><CalendarDays size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Delivery calendar</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {/* month nav + month total */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => shiftMonth(-1)} title="Previous month" className="p-1.5 rounded-lg active:scale-90" style={{ background: NAVY }}><ChevronLeft size={16} color="#fff" /></button>
              <div style={{ fontFamily: C.cond }} className="text-white text-lg sm:text-xl font-bold text-center" >{monthLabel}</div>
              <button onClick={() => shiftMonth(1)} title="Next month" className="p-1.5 rounded-lg active:scale-90" style={{ background: NAVY }}><ChevronRight size={16} color="#fff" /></button>
              <button onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })} className="ml-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95" style={{ background: NAVY, color: ORANGE }}>Today</button>
            </div>
            <div className="text-right shrink-0">
              <span className="text-white/45 text-xs">Month total </span>
              <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-lg font-bold">{fmtYards(monthYards)} CY</span>
            </div>
          </div>
          {/* weekday row */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="text-center text-white/40 text-[11px] uppercase tracking-wide py-1">{d}</div>)}
          </div>
          {/* day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const key = keyOf(d);
              const y = yardsFor(key);
              const isToday = key === todayKey;
              const isSel = key === selected;
              return (
                <button key={i} onClick={() => setSelected(key)} className="aspect-square rounded-lg p-1 flex flex-col items-center active:scale-95 transition-transform overflow-hidden"
                  style={{ background: isSel ? ORANGE + "26" : NAVY, border: `1px solid ${isSel ? ORANGE : isToday ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.05)"}` }}>
                  <span className="text-xs font-semibold self-start px-0.5" style={{ color: isToday ? ORANGE : "#fff", fontFamily: C.body }}>{d}</span>
                  {y > 0 && (
                    <span className="mt-auto mb-0.5 text-[11px] sm:text-sm font-bold leading-none" style={{ color: ORANGE, fontFamily: C.cond }}>{fmtYards(y)}<span className="text-[8px] text-white/40"> CY</span></span>
                  )}
                </button>
              );
            })}
          </div>
          {/* selected-day detail */}
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-end justify-between mb-2">
              <div style={{ fontFamily: C.cond }} className="text-white text-lg font-bold">{formatOrderDateLong(selected)}</div>
              <div className="text-right shrink-0"><span style={{ color: ORANGE, fontFamily: C.cond }} className="text-xl font-bold">{fmtYards(yardsFor(selected))}</span> <span className="text-white/45 text-xs">CY · {selOrders.length} order{selOrders.length === 1 ? "" : "s"}</span></div>
            </div>
            {selOrders.length === 0 ? (
              <div className="text-white/40 text-sm py-4 text-center">No orders this day.</div>
            ) : (
              selOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={onStatus} onAssign={onAssign} onCancel={onCancel} onEdited={onEdited} onCreated={onCreated} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Staff modal: schedule a new order for a customer. Truck is optional — orders
// start 'scheduled' and a truck can be assigned later from the board.
function NewOrderModal({ trucks, onClose, onCreated, initial }) {
  // `initial` (from "Order again") pre-fills spec/site/notes/time and the
  // customer (matched by name once the roster loads). Date is always re-picked.
  const spec = useConcreteSpec(initial);
  const [customers, setCustomers] = useState([]);
  const [custFilter, setCustFilter] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [site, setSite] = useState(initial?.site || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(/^\d{2}:\d{2}/.test(initial?.time || "") ? initial.time : "");
  const [truck, setTruck] = useState("");
  const [notes, setNotes] = useState(String(initial?.notes || "").replace(/\s*—?\s*Short load fee \$200 \(accepted\)\s*/i, "").trim());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [created, setCreated] = useState(null);   // COD order awaiting payment box

  useEffect(() => {
    getCustomers().then((cs) => {
      setCustomers(cs);
      if (initial?.customer) { const m = cs.find((c) => c.name === initial.customer); if (m) setCustomerId(m.id); }
    }).catch((e) => setErr(e.message));
  }, []);

  const selCust = customers.find((c) => c.id === customerId);
  const f = custFilter.trim().toLowerCase();
  const shown = f ? customers.filter((c) => c.name.toLowerCase().includes(f)).slice(0, 25) : [];
  const canSubmit = customerId && site.trim() && spec.valid && date >= localToday() && !busy;

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let finalNotes = notes.trim();
      if (spec.shortNote) finalNotes = (finalNotes ? finalNotes + " — " : "") + spec.shortNote;
      const o = await createOrder({ customer_id: customerId, site: site.trim(), scheduled_for: date, time, truck: truck || null, notes: finalNotes, ...spec.build() });
      if (o.prepay_required) { setCreated(o); setBusy(false); }   // COD → show payment box
      else onCreated(o);
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  const inCls = "w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const lbl = "text-white/50 text-xs uppercase tracking-wide mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><CalendarPlus size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">New order</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        {created ? (
          <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#6aa9ff22" }}><CreditCard size={26} color="#6aa9ff" /></div>
            <div className="text-white text-lg font-bold" style={{ fontFamily: C.cond }}>Order {created.ref} created</div>
            <div className="text-xs font-semibold mb-3" style={{ color: "#6aa9ff" }}>{created.customer} is COD — collect payment before this order can be dispatched.</div>
            <CodControls o={created} />
            <button onClick={() => onCreated(created)} className="w-full mt-4 rounded-xl py-2.5 font-bold active:scale-[0.98]" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>Done</button>
            <div className="text-white/35 text-[11px] mt-2 text-center" style={{ fontFamily: C.body }}>You can also do this later from the order on the board.</div>
          </div>
        ) : (
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          <label className={lbl}>Customer</label>
          {selCust ? (
            <div className="mb-3">
              <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: NAVY, border: `1px solid ${selCust.cod ? "#6aa9ff" : ORANGE}` }}>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-white text-sm truncate">{selCust.name}</span>
                  {selCust.cod && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "#6aa9ff22", color: "#6aa9ff" }}>COD</span>}
                </span>
                <button onClick={() => { setCustomerId(null); setCustFilter(""); }} className="text-xs shrink-0 ml-2" style={{ color: ORANGE }}>change</button>
              </div>
              {selCust.cod && <div className="mt-1.5 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5" style={{ background: "#6aa9ff1a", color: "#6aa9ff", fontFamily: C.body }}><CreditCard size={13} /> COD customer — payment required before this order can be dispatched.</div>}
            </div>
          ) : (
            <div className="mb-3">
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)" }}>
                <Search size={14} className="text-white/40" />
                <input value={custFilter} onChange={(e) => setCustFilter(e.target.value)} placeholder="Search customer…" className="bg-transparent outline-none text-sm text-white w-full placeholder:text-white/30" autoFocus />
              </div>
              {shown.length > 0 && (
                <div className="max-h-40 overflow-y-auto mt-1 rounded-lg" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                  {shown.map((c) => (
                    <button key={c.id} onClick={() => setCustomerId(c.id)} className="w-full text-left px-3 py-2 text-sm text-white border-b border-white/5 active:bg-white/10 flex items-center justify-between gap-2">
                      <span className="truncate">{c.name}</span>
                      {c.cod && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "#6aa9ff22", color: "#6aa9ff" }}>COD</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className={lbl}>Job site</label>
          <AddressInput value={site} onChange={setSite} placeholder="Type address or business name" inCls={inCls} inSt={inSt} wrapClass="mb-3" />

          {spec.fields}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="min-w-0"><label className={lbl}>Date</label><input type="date" min={localToday()} value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }} className={inCls} style={inSt} /></div>
            <div className="min-w-0"><label className={lbl}>Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inCls} style={inSt} /></div>
          </div>

          <label className={lbl}>Truck (optional)</label>
          <select value={truck} onChange={(e) => setTruck(e.target.value)} className={inCls} style={inSt}>
            <option value="">Unassigned</option>
            {trucks.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
          <p className="text-white/35 text-xs mt-1 mb-3">Assign a truck now or later from the board.</p>

          <label className={lbl}>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="e.g. pump truck needed, call on arrival" className={inCls + " mb-3 resize-none"} style={inSt} />

          {err && <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}

          <button onClick={submit} disabled={!canSubmit} className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} Schedule order
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

// Local YYYY-MM-DD for "today" (the office's own timezone).
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// Classify an order by its scheduled date: "today" (today or overdue) vs
// "upcoming" (a future date). Handles legacy "today"/"tomorrow"; unknown → today
// so nothing ever disappears.
function orderDay(when, today) {
  const s = (when || "").trim().toLowerCase();
  if (s === "tomorrow") return "upcoming";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s > today ? "upcoming" : "today";
  return "today";
}
// Human-readable scheduled date: "2026-06-08" -> "Mon, Jun 8" (adds the year only
// if it's not the current year). Legacy "today"/"tomorrow" are just capitalized.
function formatOrderDate(when) {
  const s = (when || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const opts = { weekday: "short", month: "short", day: "numeric" };
    if (dt.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
    return dt.toLocaleDateString(undefined, opts);
  }
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
// Longer, prominent form for day headers: "Monday, June 8".
function formatOrderDateLong(when) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((when || "").trim());
  if (m) {
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const opts = { weekday: "long", month: "long", day: "numeric" };
    if (dt.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
    return dt.toLocaleDateString(undefined, opts);
  }
  return formatOrderDate(when);
}
// Pull the yard number out of a quantity string ("10 CY" -> 10), for daily totals.
function parseYards(qty) {
  const m = /([\d.]+)/.exec(qty || "");
  return m ? parseFloat(m[1]) : 0;
}
// Tidy a yard total: 42 -> "42", 10.5 -> "10.5".
function fmtYards(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
// Slump + admixtures as one line: '5" slump · Fiber, Color' (empty if neither set).
function orderExtras(o) {
  return [o.slump ? `${o.slump} slump` : "", o.admixtures].filter(Boolean).join(" · ");
}

// One shared audio context, unlocked on the first user interaction (browsers
// block sound until then). orderChime() then plays an attention chime.
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) _audioCtx = new Ctx();
  }
  return _audioCtx;
}
function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}
function orderChime() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const play = () => {
      const start = ctx.currentTime + 0.05;
      // Alternating two-tone alarm (a "new order!" buzzer), more attention-grabbing.
      [988, 740, 988, 740, 988, 740].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = "square"; o.frequency.value = freq;
        const t = start + i * 0.2;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.start(t); o.stop(t + 0.2);
      });
    };
    // Schedule the tones only once the context is actually running, or they play silently.
    if (ctx.state === "suspended") ctx.resume().then(play).catch(() => {});
    else play();
  } catch { /* audio blocked — banner + notification still show */ }
}
function desktopNotify(o) {
  try {
    if (window.Notification && Notification.permission === "granted") {
      new Notification("New concrete order request", { body: `${o.customer} · ${o.qty} ${o.mix} (${o.ref})`, tag: o.ref });
    }
  } catch { /* ignore */ }
}

function DispatchApp({ email, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showNew, setShowNew] = useState(false);   // "New order" modal
  const [showTrucks, setShowTrucks] = useState(false);   // "Manage trucks" modal
  const [showCal, setShowCal] = useState(false);   // "Delivery calendar" modal
  const [showPast, setShowPast] = useState(false);   // "Past orders" modal
  const [showLogins, setShowLogins] = useState(false);   // "Customer logins" modal
  const [, forceTick] = useState(0);   // keep "Xm ago" / staleness labels ticking
  const [alerts, setAlerts] = useState([]);   // new customer order requests to flag
  const seenReq = useRef(null);   // refs of "requested" orders already seen
  const [soundOn, setSoundOn] = useState(false);   // audio actually resumed THIS page-load (needs a gesture)
  // Whether the user has opted into alert sound at all (remembered across refreshes).
  const [wantSound, setWantSound] = useState(() => {
    try { return localStorage.getItem("ab_sound") === "1"; } catch { return false; }
  });

  // Opt in to alert sound (plays a test chime so they know it works) and remember it.
  const enableSound = () => {
    unlockAudio(); orderChime(); setSoundOn(true); setWantSound(true);
    try { localStorage.setItem("ab_sound", "1"); } catch { /* private mode */ }
  };

  // Installed-app (PWA) support. When the board runs as an installed app the
  // browser allows the alarm to sound WITHOUT a click, so we arm it on mount and
  // never show the "tap to resume" prompt. `installPrompt` holds the browser's
  // deferred install event so the "Install app" button can trigger it.
  const isStandalone = typeof window !== "undefined" &&
    ((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    if (isStandalone) { unlockAudio(); setSoundOn(true); }   // installed → sound works without a click
  }, [isStandalone]);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch { /* dismissed */ }
    setInstallPrompt(null);
  };

  // Ask for desktop-notification permission once.
  useEffect(() => {
    if (window.Notification && Notification.permission === "default") Notification.requestPermission().catch(() => {});
  }, []);

  // Browsers suspend audio until a user gesture, and a full page refresh resets that.
  // So: ANY interaction anywhere re-arms the chime (no need to hunt for a button), and
  // we also retry resuming whenever the tab regains focus (e.g. phone unlocked).
  useEffect(() => {
    const arm = () => { unlockAudio(); setSoundOn(true); };
    const evs = ["pointerdown", "keydown", "touchstart"];
    evs.forEach((e) => window.addEventListener(e, arm));
    const onVisible = () => { if (document.visibilityState === "visible") unlockAudio(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      evs.forEach((e) => window.removeEventListener(e, arm));
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  // Detect new customer-placed ("requested") orders between polls → chime + notify.
  useEffect(() => {
    const requested = orders.filter((o) => o.status === "requested");
    if (seenReq.current === null) { seenReq.current = new Set(requested.map((o) => o.ref)); return; }
    const fresh = requested.filter((o) => !seenReq.current.has(o.ref));
    if (fresh.length) {
      fresh.forEach((o) => seenReq.current.add(o.ref));
      setAlerts((prev) => [...fresh, ...prev]);
      orderChime();
      fresh.forEach(desktopNotify);
    }
  }, [orders]);

  // Keep sounding the alarm every 90s while there are unacknowledged order requests.
  useEffect(() => {
    if (!alerts.length) return;
    const id = setInterval(() => orderChime(), 90000);
    return () => clearInterval(id);
  }, [alerts.length]);

  // Pull orders + fleet at once, reusing the existing endpoints.
  const refresh = async () => {
    try {
      const [os, ts] = await Promise.all([getOrders(), getTrucks()]);
      setOrders(os);
      setTrucks(ts);
      setErr("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    const run = async () => { if (alive) await refresh(); };
    run();
    const poll = setInterval(run, 5000);   // orders, fleet, and requests all refresh within ~5s
    const tick = setInterval(() => { if (alive) forceTick((n) => n + 1); }, 1000);
    return () => { alive = false; clearInterval(poll); clearInterval(tick); };
  }, []);

  // Drop a freshly-updated order (returned by the status/assign endpoints) back
  // into the list so the row reflects it immediately, without waiting for the
  // next 5s poll. Both throw on a rejected change — OrderRow catches and shows it.
  const applyOrder = (updated) =>
    setOrders((os) => os.map((o) => (o.ref === updated.ref ? updated : o)));
  const addOrder = (created) =>   // drop a newly-created order ("Order again") onto the board
    setOrders((os) => [created, ...os.filter((x) => x.ref !== created.ref)]);
  const changeStatus = async (ref, status) => applyOrder(await setOrderStatus(ref, status));
  const assign = async (ref, truck) => applyOrder(await assignTruck(ref, truck));
  const cancelOrder = async (ref) => {
    await deleteOrder(ref);                                  // throws on failure -> row shows it
    setOrders((os) => os.filter((o) => o.ref !== ref));      // drop it from the board
  };

  const activeOrders = orders.filter((o) => o.status !== "complete");
  const completedOrders = orders.filter((o) => o.status === "complete").slice().sort((a, b) => String(b.when).localeCompare(String(a.when)));
  const today = localToday();
  const todayOrders = activeOrders.filter((o) => orderDay(o.when, today) === "today");
  const upcomingOrders = activeOrders.filter((o) => orderDay(o.when, today) === "upcoming");
  const movingTrucks = trucks.filter((t) => t.lat != null && !isStale(t.updated_at)).length;

  // Each truck's status, derived from the order it's assigned to. (Later, GPS
  // geofences for the yard / job site will drive At yard vs On site automatically.)
  const truckStatus = (t) => {
    const o = activeOrders.find((x) => x.truck === t.label && ["batched", "enroute", "onsite"].includes(x.status));
    if (!o) return { label: "At yard", color: "#7c8794" };
    if (o.status === "onsite") return { label: "On site", color: GREEN, order: o.ref };
    if (o.status === "enroute") return { label: "En route", color: ORANGE_HOT, order: o.ref };
    return { label: "Loading", color: ORANGE, order: o.ref };   // batched
  };

  // Yard totals for planning: today's total, and upcoming grouped by day.
  const todayYards = todayOrders.reduce((sum, o) => sum + parseYards(o.qty), 0);
  const upcomingByDay = {};
  for (const o of upcomingOrders) (upcomingByDay[o.when || "—"] ||= []).push(o);
  const upcomingDays = Object.keys(upcomingByDay).sort();

  if (loading) return <Splash label="Loading dispatch…" />;

  return (
    <div className="h-screen w-full" style={{ background: "#0c1117" }}>
      <style>{FONT}</style>
      {showCal && (
        <CalendarModal orders={orders} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onClose={() => setShowCal(false)} />
      )}
      {showPast && (
        <PastOrdersModal orders={completedOrders} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onClose={() => setShowPast(false)} />
      )}
      {showLogins && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setShowLogins(false)}>
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CustomerLogins orders={orders} trucks={trucks} onReordered={addOrder} />
            <button onClick={() => setShowLogins(false)} className="w-full mt-2 rounded-xl py-2 text-sm font-semibold text-white" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>Close</button>
          </div>
        </div>
      )}
      {showTrucks && (
        <ManageTrucksModal onClose={() => setShowTrucks(false)} onChanged={refresh} />
      )}
      {showNew && (
        <NewOrderModal
          trucks={trucks}
          onClose={() => setShowNew(false)}
          onCreated={(o) => { setOrders((os) => [o, ...os.filter((x) => x.ref !== o.ref)]); setShowNew(false); }}
        />
      )}
      <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: NAVY_DEEP, fontFamily: C.body }}>
        {/* brand header */}
        <div className="px-5 sm:px-6 pb-2.5 shrink-0" style={{ background: ORANGE, paddingTop: "calc(env(safe-area-inset-top) + 0.625rem)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Roo size={34} />
              <div className="leading-none">
                <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-xl font-bold tracking-tight">AUSSIEBLOCK</div>
                <div style={{ color: NAVY_DEEP, fontFamily: C.body }} className="text-[11px] font-semibold opacity-70 -mt-0.5">Dispatch · Office Console</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LivePill live={!err} />
              <button onClick={onLogout} title="Log out" className="p-1.5 rounded-full active:scale-90 transition-transform" style={{ background: NAVY_DEEP }}><LogOut size={14} color={ORANGE} /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-5 py-3 gap-3">
          {/* Arm audio so new-order alerts can sound. Browsers block sound until a gesture,
              and a page refresh resets it — so first-timers get the big button, and anyone
              who's already opted in just gets a slim "tap to resume" that any click clears. */}
          {!soundOn && !wantSound && (
            <button onClick={enableSound} className="shrink-0 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
              <Bell size={16} /> Tap to turn on new-order alert sounds
            </button>
          )}
          {!soundOn && wantSound && (
            <button onClick={enableSound} className="shrink-0 rounded-lg px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-semibold active:scale-95 transition-transform" style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.5)", color: "#f59e0b", fontFamily: C.body }}>
              <Bell size={13} /> Tap anywhere to resume order-alert sound
            </button>
          )}
          {/* new-order alert banner */}
          {alerts.length > 0 && (
            <div className="shrink-0 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3" style={{ background: "#6aa9ff1f", border: "1px solid #6aa9ff" }}>
              <div className="flex items-center gap-2 min-w-0">
                <Bell size={17} color="#6aa9ff" />
                <span className="text-white text-sm font-bold shrink-0" style={{ fontFamily: C.cond }}>{alerts.length} new order request{alerts.length > 1 ? "s" : ""}</span>
                <span className="text-white/60 text-xs truncate" style={{ fontFamily: C.body }}>{alerts.map((a) => `${a.ref} · ${a.customer} · ${a.qty} ${a.mix}`).join("    ")}</span>
              </div>
              <button onClick={() => setAlerts([])} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full active:scale-95" style={{ background: "#6aa9ff", color: NAVY_DEEP, fontFamily: C.body }}>Got it</button>
            </div>
          )}
          {/* title + actions */}
          <div className="flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <h1 style={{ fontFamily: C.cond }} className="text-white text-xl font-bold leading-tight">Dispatch board</h1>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}><Package size={14} color={ORANGE} /><span className="text-white/55">Today</span><span className="text-white font-bold">{todayOrders.length}</span></span>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}><CalendarPlus size={14} color={ORANGE_HOT} /><span className="text-white/55">Scheduled</span><span className="text-white font-bold">{upcomingOrders.length}</span></span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {installPrompt && (
                <button onClick={promptInstall} title="Install the dispatch board as an app so order alerts sound without a click" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold active:scale-95 transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                  <Download size={16} /> Install app
                </button>
              )}
              <button onClick={() => setShowLogins(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <KeyRound size={16} color={ORANGE} /> Customers
              </button>
              <button onClick={() => setShowCal(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <CalendarDays size={16} color={ORANGE} /> Calendar
              </button>
              <button onClick={() => setShowPast(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <Inbox size={16} color={ORANGE} /> Past orders
              </button>
              <button onClick={() => setShowTrucks(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <Truck size={16} color={ORANGE} /> Trucks
              </button>
              <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold active:scale-95 transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
                <CalendarPlus size={16} /> New order
              </button>
              <button onClick={() => { unlockAudio(); orderChime(); }} title="Test new-order sound" className="p-2 rounded-xl active:scale-90 transition-transform" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
                <Bell size={16} color={ORANGE} />
              </button>
              <button onClick={refresh} title="Refresh now" className="p-2 rounded-xl active:scale-90 transition-transform" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
                <RefreshCw size={16} color={ORANGE} />
              </button>
            </div>
          </div>

          {err && (
            <div className="rounded-xl px-3 py-2.5 text-sm mb-4" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>
              Couldn’t load dispatch data: {err}
            </div>
          )}

          {/* main columns — fill the screen; each scrolls inside so the page doesn't.
              Fleet (map) gets the most width; the two order columns are narrower. */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr_1fr] gap-3">
            <Panel title="Fleet" icon={MapPin} count={trucks.length} fill>
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0"><GoogleFleetMap trucks={trucks} /></div>
                <div className="shrink-0 overflow-y-auto flex flex-col gap-1.5 mt-3" style={{ maxHeight: "40%" }}>
                {trucks.length === 0 ? (
                  <div className="text-white/40 text-sm text-center py-2" style={{ fontFamily: C.body }}>No trucks — add them under “Trucks”.</div>
                ) : trucks.map((t) => {
                  const s = truckStatus(t);
                  return (
                    <div key={t.label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Truck size={14} color={ORANGE} />
                          <span className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{t.label}</span>
                        </div>
                        {t.notes && <div className="text-white/40 text-xs truncate mt-0.5" style={{ fontFamily: C.body }}>{t.notes}</div>}
                      </div>
                      <span className="flex items-center gap-2 shrink-0">
                        {s.order && <span className="text-white/40 text-xs" style={{ fontFamily: C.body }}>{s.order}</span>}
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: s.color + "22", color: s.color, fontFamily: C.body }}>{s.label}</span>
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
            </Panel>
            <Panel title="Today's orders" icon={List} count={todayOrders.length} fill>
              {todayOrders.length === 0 ? (
                <div className="text-white/40 text-sm py-6 text-center" style={{ fontFamily: C.body }}>No orders scheduled for today.</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3 rounded-lg px-3 py-2" style={{ background: NAVY }}>
                    <Package size={15} color={ORANGE} />
                    <span className="text-white text-sm font-semibold" style={{ fontFamily: C.body }}>{fmtYards(todayYards)} CY scheduled today</span>
                    <span className="text-white/40 text-xs" style={{ fontFamily: C.body }}>· {todayOrders.length} order{todayOrders.length === 1 ? "" : "s"}</span>
                  </div>
                  {todayOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} />)}
                </>
              )}
            </Panel>
            <Panel title="Upcoming orders" icon={CalendarPlus} count={upcomingOrders.length} fill>
              {upcomingOrders.length === 0 ? (
                <div className="text-white/40 text-sm py-6 text-center" style={{ fontFamily: C.body }}>Nothing scheduled ahead.</div>
              ) : (
                upcomingDays.map((day) => {
                  const dayOrders = upcomingByDay[day];
                  const yards = dayOrders.reduce((sum, o) => sum + parseYards(o.qty), 0);
                  return (
                    <div key={day} className="mb-5">
                      <div className="flex items-end justify-between mb-2.5 pb-2" style={{ borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
                        <div>
                          <div style={{ fontFamily: C.cond }} className="text-white text-xl font-bold leading-none">{formatOrderDateLong(day)}</div>
                          <div className="text-white/40 text-xs mt-1" style={{ fontFamily: C.body }}>{dayOrders.length} order{dayOrders.length === 1 ? "" : "s"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div style={{ color: ORANGE, fontFamily: C.cond }} className="text-2xl font-bold leading-none">{fmtYards(yards)}</div>
                          <div className="text-white/45 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>CY total</div>
                        </div>
                      </div>
                      {dayOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} />)}
                    </div>
                  );
                })
              )}
            </Panel>
          </div>

          <WeatherBar />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [me, setMe] = useState(null);          // { email, role, customer_id }
  const [screen, setScreen] = useState("home");
  const [active, setActive] = useState(null);
  const [orders, setOrders] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  // Real visible height in px (works on every browser, incl. in-app webviews and
  // ones without svh) so the app fits exactly and the bottom tabs stay in view.
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? (window.visualViewport?.height || window.innerHeight) : 0));

  useEffect(() => {
    const update = () => setVh(window.visualViewport?.height || window.innerHeight);
    update();
    const t1 = setTimeout(update, 200);   // iOS Safari settles its toolbar after first paint
    const t2 = setTimeout(update, 800);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener("load", update);
    window.visualViewport?.addEventListener("resize", update);
    // Block iOS pinch-zoom (it ignores user-scalable=no) — keeps the app native-feeling.
    const noZoom = (e) => e.preventDefault();
    document.addEventListener("gesturestart", noZoom);
    document.addEventListener("gesturechange", noZoom);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("load", update);
      window.visualViewport?.removeEventListener("resize", update);
      document.removeEventListener("gesturestart", noZoom);
      document.removeEventListener("gesturechange", noZoom);
    };
  }, []);

  // On first load, check whether a saved token is still valid.
  useEffect(() => {
    (async () => {
      if (isLoggedIn()) {
        try { setMe(await getMe()); } catch { /* token expired/invalid — show login */ }
      }
      setAuthChecked(true);
    })();
  }, []);

  // Once logged in, load this customer's orders + billing — and KEEP THEM FRESH.
  // The list/account used to load only once, so customers had to manually refresh
  // to see status changes or new invoices. Now we poll every 20s (silently, no
  // spinner) and also refresh the instant the app regains focus (phone unlocked /
  // tab refocused), so updates show up on their own.
  // Staff don't have a customer account — they get the dispatch console instead.
  useEffect(() => {
    if (!me || me.role === "staff") return;
    let alive = true;
    const loadData = async (silent) => {
      if (!silent) { setLoading(true); setLoadError(""); }
      try {
        const os = await getOrders();
        if (alive) setOrders(os.map((o) => ({ ...o, id: o.ref })));  // map backend `ref` -> the `id` the UI uses
        if (me.customer_id != null) {
          const acct = await getBilling(me.customer_id);
          if (alive) setAccount(acct);
        }
        if (alive && silent) setLoadError("");   // a recovered poll clears any stale error
      } catch (e) {
        if (alive && !silent) setLoadError(e.message);   // keep showing current data if a background poll blips
      } finally {
        if (alive && !silent) setLoading(false);
      }
    };
    loadData(false);
    const poll = setInterval(() => { if (alive) loadData(true); }, 20000);
    const onVisible = () => { if (document.visibilityState === "visible" && alive) loadData(true); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { alive = false; clearInterval(poll); document.removeEventListener("visibilitychange", onVisible); };
  }, [me]);

  // Re-fetch this customer's orders (e.g. right after they place a new one).
  const reloadOrders = async () => {
    try {
      const os = await getOrders();
      setOrders(os.map((o) => ({ ...o, id: o.ref })));
    } catch { /* keep current list on transient error */ }
  };

  const open = (o) => { setActive(o); setScreen("track"); };
  const handleLogout = () => {
    logout();
    setMe(null); setOrders([]); setAccount(null); setActive(null); setScreen("home");
  };

  const nav = [{ k: "home", icon: List, label: "Orders" }, { k: "track", icon: MapPin, label: "Track" }, { k: "calc", icon: Calculator, label: "Estimate" }, { k: "account", icon: User, label: "Account" }];

  if (!authChecked) return <Splash label="Starting…" />;
  if (!me) return <LoginScreen onLoggedIn={setMe} />;
  if (me.role === "staff") return <DispatchApp email={me.email} onLogout={handleLogout} />;
  if (loading) return <Splash label="Loading your orders…" />;

  return (
    <div className="w-full flex justify-center sm:items-center sm:p-4 overflow-hidden" style={{ height: vh ? `${vh}px` : "100dvh", background: "#0c1117" }}>
      <style>{FONT}</style>
      <div className="w-full sm:max-w-sm h-full sm:h-auto sm:max-h-[94vh] flex flex-col overflow-hidden rounded-none sm:rounded-[2.2rem] sm:shadow-2xl sm:border sm:border-white/10" style={{ background: NAVY_DEEP, fontFamily: C.body }}>
        {/* brand header */}
        <div className="px-4 pb-3 shrink-0" style={{ background: ORANGE, paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Roo size={34} />
              <div className="leading-none">
                <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-xl font-bold tracking-tight">AUSSIEBLOCK</div>
                <div style={{ color: NAVY_DEEP, fontFamily: C.body }} className="text-[11px] font-semibold opacity-70 -mt-0.5">Ready Mix · Delivery Tracking · {BUILD_TAG}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LivePill live={!loadError} />
              <button onClick={handleLogout} title="Log out" className="p-1.5 rounded-full active:scale-90 transition-transform" style={{ background: NAVY_DEEP }}><LogOut size={14} color={ORANGE} /></button>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="px-4 py-2.5 text-xs shrink-0" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85", fontFamily: C.body }}>
            Couldn’t load data: {loadError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          {screen === "track" && active ? <TrackScreen order={active} onBack={() => setScreen("home")} onChanged={reloadOrders} />
            : screen === "calc" ? <CalculatorScreen onPlaced={reloadOrders} />
            : screen === "account" ? <AccountScreen account={account} customerId={me.customer_id} />
            : <OrdersScreen orders={orders} account={account} onOpen={open} onPlaced={reloadOrders} />}
        </div>

        {/* bottom nav */}
        <div className="shrink-0 flex items-center justify-around py-3" style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.06)", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          {nav.map(({ k, icon: Icon, label }) => {
            const on = screen === k;
            return (
              <button key={k} onClick={() => { if (k === "track") { if (orders.length) { setActive(orders[0]); setScreen("track"); } } else setScreen(k); }} className="flex flex-col items-center gap-1">
                <Icon size={20} color={on ? ORANGE : "rgba(255,255,255,0.45)"} />
                <span className="text-[10px]" style={{ color: on ? ORANGE : "rgba(255,255,255,0.45)" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

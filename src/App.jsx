import { useState, useEffect, useRef, createContext, useContext, Fragment } from "react";
import { Truck, MapPin, Clock, ChevronLeft, CheckCircle2, Circle, Plus, FileText, Bell, User, List, Building2, Send, CreditCard, ChevronRight, Phone, Download, LogOut, Loader2, RefreshCw, Inbox, Navigation, Activity, Package, KeyRound, Search, X, CalendarPlus, Trash2, CalendarDays, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun, CloudFog, Wind, Moon, CloudMoon, Droplets, Calculator, ClipboardList, Save, Printer, BookOpen, UploadCloud, AlertTriangle, Layers, Check, Camera } from "lucide-react";
import { login, getMe, getOrders, getOrder, getBilling, syncBilling, getInvoicePayLink, getTrucks, setOrderStatus, assignTruck, assignDriver, getCustomers, setCustomerLogin, removeCustomerLogin, createOrder, deleteOrder, editOrder, requestOrder, addTruck, deleteTruck, getFuel, getTruckFuel, getMixerReadings, resetMixerTotal, getDrivers, addDriver, deleteDriver, getDriverOrders, saveDriverNotes, logManualFuel, signOffOrder, signOffLoad, getSignatureDataUrl, getBatchTicketImages, getLoadBatchTicketImages, getSmsEnabled, textInvite, listStaff, createStaff, deleteStaff, staffTextInvite, setCustomerCod, codFromAging, getOrderPaymentStatus, getPriceSheet, savePriceSheet, getOrderPricing, getOrdersPricingBulk, setOrderDelivery, setOrderPrice, setOrderFiber, addLoad, updateLoad, removeLoad, uploadBatchTicket, openBatchTicket, deleteBatchTicket, uploadLoadBatchTicket, openLoadBatchTicket, deleteLoadBatchTicket, saveBatchData, setOrderArchived, getDocs, uploadDoc, openDoc, deleteDoc, getMaterials, updateMaterial, getReceipts, addReceipt, editReceipt, deleteReceipt, uploadReceiptPhoto, fetchReceiptPhotoUrl, deleteReceiptPhoto, getPOs, createPO, editPO, deletePO, logout, isLoggedIn } from "./api";

// True when the logged-in office user may see financials & account info (full
// staff). False for "worker" logins (concrete crew / TxDOT engineers). Provided
// by DispatchApp; components read it to hide COD/billing/account UI.
const FinanceContext = createContext(true);
// Assignable driver names, sourced from the driver logins (GET /drivers). Provided
// at the board level so the order/load driver dropdowns share one fetched list —
// add a driver in Manage Staff (Driver role) and they appear here.
const DriversContext = createContext([]);

// ── Aussieblock brand ────────────────────────────────────────────────
const ORANGE = "#e7732a";
const ORANGE_HOT = "#FB7013";
const NAVY = "#1e2939";
const NAVY_DEEP = "#161d27";
const GREEN = "#27c08a";
const WARN = "#f5a524";   // amber — double-booked slot warning on the dispatch board

// Give each truck its own color on the maps so they're easy to tell apart.
// Distinct, readable on the dark map; assigned by sorted label so colors are
// stable for a given fleet.
const TRUCK_COLORS = ["#ff7a3d", "#4da3ff", "#27c08a", "#c77dff", "#ffd23d", "#ff5d8f", "#3dd6d6", "#ff9f1c"];
function truckColorMap(trucks) {
  const m = {};
  [...new Set((trucks || []).map((t) => t.label))].sort()
    .forEach((label, i) => { m[label] = TRUCK_COLORS[i % TRUCK_COLORS.length]; });
  return m;
}
// Straight-line distance in miles between two {lat,lng} points (null if either missing).
function milesBetween(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 3958.8, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

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
// Exact Aussieblock vector paths extracted from the official logo PDF. Module-level
// so the printable PDFs (cost report etc.) can embed the same mark as the on-screen UI.
const LOGO_TILE = "M98.76 54.72 L526.70 54.72 C528.14 54.72 529.57 54.79 531.00 54.93 C532.43 55.07 533.85 55.28 535.26 55.56 C536.67 55.84 538.06 56.19 539.44 56.61 C540.82 57.03 542.17 57.51 543.50 58.06 C544.82 58.61 546.12 59.23 547.39 59.90 C548.66 60.58 549.89 61.32 551.08 62.12 C552.28 62.92 553.43 63.77 554.54 64.69 C555.65 65.60 556.72 66.56 557.73 67.58 C558.75 68.60 559.72 69.66 560.63 70.77 C561.54 71.89 562.39 73.04 563.19 74.24 C563.99 75.43 564.73 76.66 565.41 77.93 C566.08 79.20 566.70 80.50 567.25 81.83 C567.80 83.16 568.28 84.51 568.70 85.89 C569.12 87.26 569.47 88.66 569.75 90.07 C570.03 91.48 570.24 92.90 570.38 94.33 C570.52 95.76 570.59 97.20 570.59 98.64 L570.59 384.11 C570.59 385.54 570.52 386.98 570.38 388.41 C570.24 389.84 570.03 391.26 569.75 392.67 C569.47 394.08 569.12 395.48 568.70 396.85 C568.28 398.23 567.80 399.58 567.25 400.91 C566.70 402.24 566.08 403.54 565.41 404.81 C564.73 406.08 563.99 407.31 563.19 408.51 C562.39 409.70 561.54 410.86 560.63 411.97 C559.72 413.08 558.75 414.14 557.73 415.16 C556.72 416.18 555.65 417.14 554.54 418.06 C553.43 418.97 552.28 419.82 551.08 420.62 C549.89 421.42 548.66 422.16 547.39 422.84 C546.12 423.52 544.82 424.13 543.50 424.68 C542.17 425.23 540.82 425.72 539.44 426.13 C538.06 426.55 536.67 426.90 535.26 427.18 C533.85 427.46 532.43 427.67 531.00 427.81 C529.57 427.95 528.14 428.02 526.70 428.02 L98.76 428.02 C97.32 428.02 95.89 427.95 94.46 427.81 C93.03 427.67 91.61 427.46 90.20 427.18 C88.79 426.90 87.40 426.55 86.02 426.13 C84.64 425.72 83.29 425.23 81.96 424.68 C80.64 424.13 79.34 423.52 78.07 422.84 C76.80 422.16 75.57 421.42 74.38 420.62 C73.18 419.82 72.03 418.97 70.92 418.06 C69.81 417.14 68.74 416.18 67.73 415.16 C66.71 414.14 65.75 413.08 64.83 411.97 C63.92 410.86 63.07 409.70 62.27 408.51 C61.47 407.31 60.73 406.08 60.05 404.81 C59.38 403.54 58.76 402.24 58.21 400.91 C57.66 399.58 57.18 398.23 56.76 396.85 C56.34 395.48 55.99 394.08 55.71 392.67 C55.43 391.26 55.22 389.84 55.08 388.41 C54.94 386.98 54.87 385.54 54.87 384.11 L54.87 98.64 C54.87 97.20 54.94 95.76 55.08 94.33 C55.22 92.90 55.43 91.48 55.71 90.07 C55.99 88.66 56.34 87.26 56.76 85.89 C57.18 84.51 57.66 83.16 58.21 81.83 C58.76 80.50 59.38 79.20 60.05 77.93 C60.73 76.66 61.47 75.43 62.27 74.24 C63.07 73.04 63.92 71.89 64.83 70.77 C65.75 69.66 66.71 68.60 67.73 67.58 C68.74 66.56 69.81 65.60 70.92 64.69 C72.03 63.77 73.18 62.92 74.38 62.12 C75.57 61.32 76.80 60.58 78.07 59.90 C79.34 59.23 80.64 58.61 81.96 58.06 C83.29 57.51 84.64 57.03 86.02 56.61 C87.40 56.19 88.79 55.84 90.20 55.56 C91.61 55.28 93.03 55.07 94.46 54.93 C95.89 54.79 97.32 54.72 98.76 54.72 Z";
const LOGO_ROO = "M458.01 178.78 L443.12 167.86 L439.48 161.24 L427.90 154.95 C425.59 153.96 423.27 153.63 420.96 153.96 L420.30 148.00 C419.97 145.68 418.97 143.37 417.32 142.04 L413.02 138.07 C412.03 137.08 410.37 136.75 409.05 137.41 L408.39 137.74 C408.06 138.07 407.40 138.40 407.07 138.73 C405.74 138.07 403.76 138.07 402.77 139.06 L402.10 139.40 C400.78 140.39 400.12 142.37 400.78 144.03 L404.09 152.97 C405.08 155.61 407.40 157.93 410.04 159.26 L411.37 159.92 C411.37 159.92 411.37 160.25 411.03 160.25 L401.11 183.09 C398.13 188.05 392.84 191.36 386.56 191.36 L384.90 191.36 L356.12 191.36 C307.17 191.36 267.14 231.08 267.14 280.40 L267.14 299.60 C267.14 318.46 251.93 333.36 233.40 333.36 L172.21 337.00 C167.91 337.00 164.60 340.31 164.60 344.61 L232.74 344.61 L244.65 344.61 C266.48 344.61 285.67 330.71 292.28 309.86 L298.24 291.65 C304.85 297.28 313.45 300.59 322.71 300.59 C324.70 300.59 326.68 300.59 328.67 300.26 L331.65 304.56 L331.65 317.47 L326.02 338.32 C325.36 341.30 327.68 344.28 330.98 344.28 L399.46 344.28 C399.46 342.63 398.80 341.30 397.80 340.31 L407.07 340.31 C407.07 338.65 406.40 337.33 405.41 336.34 C404.42 335.34 402.77 334.68 401.11 334.68 L395.82 334.68 L392.18 331.37 L356.45 331.37 C353.81 331.37 351.82 329.39 351.82 326.74 L351.82 298.60 L366.38 259.22 L388.87 246.31 L395.82 263.85 L395.82 291.32 C399.46 291.32 402.43 289.00 403.43 285.69 C406.73 284.70 409.38 281.72 409.38 278.08 L409.38 241.01 C409.38 238.36 409.71 235.71 410.04 233.07 C421.29 223.47 427.91 209.57 427.91 194.34 L427.91 192.69 C427.91 190.70 429.56 189.04 431.54 189.04 L441.14 189.04 L449.74 191.36 C451.72 192.02 453.71 191.03 454.70 189.38 L457.68 189.38 L459.33 185.73 C460.65 183.42 459.99 180.44 458.01 178.78 Z";

function Roo({ size = 32, variant = "tile" }) {
  const TILE = LOGO_TILE, ROO = LOGO_ROO;
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
  ongoing: { label: "Pour ongoing", color: ORANGE_HOT },   // umbrella status for a continuous pour in flight
  batched: { label: "Loading at yard", color: ORANGE },
  enroute: { label: "En route", color: ORANGE_HOT },
  onsite: { label: "On site", color: GREEN },
  pouring: { label: "Pouring", color: GREEN },
  returning: { label: "Returning to yard", color: "#4da3ff" },
  complete: { label: "Complete", color: GREEN },
};
const STAGES = ["Loading at yard", "En route", "On site", "Pouring", "Returning", "Complete"];
// The delivery stages staff can set from the dispatch board, in order. Mirrors
// ORDER_STATUSES in the backend — keep the two in sync.
const ORDER_STATUSES = ["requested", "scheduled", "ongoing", "batched", "enroute", "onsite", "pouring", "returning", "complete"];
// A continuous pour rolls up to one of these umbrella states (the per-load rows
// carry the individual truck stages). "ongoing" is set automatically by the
// backend while loads are in flight; staff can also set scheduled/complete.
const POUR_STATUSES = ["scheduled", "ongoing", "complete"];
// Statuses that mean a delivery is actively happening (truck in flight or pouring).
const LIVE_STATUSES = ["batched", "ongoing", "enroute", "onsite", "pouring", "returning"];
// The order a customer means by "Track": the one in progress, else the next
// upcoming/scheduled delivery, else (nothing pending) the most recent. Never an old
// completed order by default — that was the bug where Track opened a finished order.
function pickCurrentOrder(orders) {
  if (!orders || !orders.length) return null;
  const byWhenAsc = (a, b) => String(a.when).localeCompare(String(b.when));
  const live = orders.filter((o) => LIVE_STATUSES.includes(o.status));
  if (live.length) return live.slice().sort(byWhenAsc)[0];
  const upcoming = orders.filter((o) => o.status === "scheduled" || o.status === "requested");
  if (upcoming.length) return upcoming.slice().sort(byWhenAsc)[0];
  return orders.slice().sort((a, b) => String(b.when).localeCompare(String(a.when)))[0];
}
// Options for the customer order form. Edit to match what you sell.
const MIXES = ["3000 PSI", "3500 PSI", "4000 PSI", "4500 PSI", "5000 PSI"];
const BUILD_TAG = "build Jun18-v77";   // bump on each deploy to verify clients aren't cached
const DISPATCH_PHONE = "940-577-7475";   // dispatch line — customers can call OR text it (one number, two-way)
const DISPATCH_TEL = "+19405777475";     // E.164 for tel:/sms: links
// Phones have a working sms: handler; laptops/desktops don't. On desktop we offer
// "Copy & open Google Messages" instead of a dead sms: link.
const IS_MOBILE = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
const RECOMMENDED_MIX = "3500 PSI";
const TXDOT_MIXES = ["TxDOT Class A", "TxDOT Class B", "TxDOT Class C"];
const PRECAST_MIXES = ["Precast", "Block Fill"];   // specialty mixes
// Customers locked to a single mix — they never order anything else, so the mix
// field defaults to (and locks on) it. Matched as a substring of the customer
// name, case-insensitive. The backend enforces this too. Keep in sync there.
const FORCED_MIX = { landers: "Precast" };
function forcedMixFor(name) {
  const n = (name || "").toLowerCase();
  for (const key of Object.keys(FORCED_MIX)) if (n.includes(key)) return FORCED_MIX[key];
  return "";
}
const SLUMPS = ["0\"", "1\"", "2\"", "3\"", "4\"", "5\"", "6\"", "7\""];
const ADMIXTURES = ["Set Control", "Accelerant", "Fiber", "Color"];
// Selectable fiber products + their standard dose (lbs/yd). MAC 330 is the TxDOT
// standard; Mac Matrix 360 is the legacy macrofiber.
const FIBER_PRODUCTS = [
  { name: "MasterFiber MAC 330", dose: 4 },
  { name: "Mac Matrix 360", dose: 4.5 },
];
const fiberDose = (name) => (FIBER_PRODUCTS.find((f) => f.name === name) || FIBER_PRODUCTS[0]).dose;
const SET_TIMES = ["30 min", "1 hr", "1.5 hr", "2 hr", "3 hr", "4 hr"];
const USES = ["Slab", "Flatwork", "Driveway", "Sidewalk", "Curbs", "Footings", "Foundation", "Patio", "Walls", "Precast", "Block Fill", "Other"];
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
          <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-xs font-bold tracking-wider">{o.ref}</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-white/55 text-xs">{formatOrderDate(o.when)}</span>
        </div>
        <div style={{ fontFamily: C.cond }} className="text-white text-base font-semibold leading-tight mt-0.5 truncate">{o.project || o.site}</div>
        <div className="text-white/45 text-xs mt-0.5 truncate">{o.mix} · {o.qty}</div>
      </button>
      {onReorder && (
        <button onClick={() => onReorder(o)} title="Order this again" className="shrink-0 rounded-2xl px-3 flex flex-col items-center justify-center gap-0.5 font-bold active:scale-95 transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
          <Plus size={16} /><span className="text-[11px]">Again</span>
        </button>
      )}
    </div>
  );
}

// Compact row for the dispatch board's Completed column — completed orders are
// just reference, so we skip the full controls. One line of summary + Archive
// (clear it off the board). Full details/batch ticket live under "Past orders".
function CompletedRow({ o, onArchived }) {
  const [busy, setBusy] = useState(false);
  const archive = async () => {
    setBusy(true);
    try { onArchived(await setOrderArchived(o.ref, true)); }
    catch (e) { alert(e.message); setBusy(false); }
  };
  return (
    <div className="flex items-stretch gap-2 mb-1.5">
      <div className="flex-1 min-w-0 rounded-xl px-2.5 py-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={12} color={GREEN} className="shrink-0" />
          <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-xs font-bold tracking-wider">{o.ref}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/50 text-xs truncate">{formatOrderDate(o.when)}</span>
        </div>
        <div className="text-white/70 text-xs mt-0.5 truncate" style={{ fontFamily: C.body }}>{o.customer} · {o.mix} · {o.qty}</div>
      </div>
      <button onClick={archive} disabled={busy} title="Archive — clear from the board" className="shrink-0 rounded-xl px-2.5 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
        <Inbox size={14} />
      </button>
    </div>
  );
}

function OrderCard({ o, onOpen, showCustomer, showPay = true }) {
  return (
    <button onClick={() => onOpen(o)} className="w-full text-left rounded-2xl p-4 mb-3 transition-transform active:scale-[0.98]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{o.ref}</span>
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
          {showPay && o.prepay_required && (
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

// Short ETA-to-site label for a tracked truck: real distance when we have its GPS
// and the geocoded job site, else a rough estimate from delivery progress.
// "At yard" while it's still loading, "On site"/"Done" once it has arrived.
function etaFor(status, pos, siteLatLng, progress) {
  if (["onsite", "pouring"].includes(status)) return "On site";
  if (status === "complete") return "Done";
  if (status === "batched") return "At yard";   // still loading; ETA starts once en route
  if (status === "returning") {
    // Heading back to the yard — ETA to the plant so dispatch knows when it'll reload.
    const rem = milesBetween(pos, PLANT);
    if (rem == null) return "To yard";
    const min = Math.round((rem * 1.3) / 30 * 60);
    return rem < 0.2 || min <= 0 ? "At yard" : `${min} min to yard`;
  }
  const rem = milesBetween(pos, siteLatLng);
  const min = rem != null ? Math.round((rem * 1.3) / 30 * 60) : Math.max(0, Math.round((1 - (progress || 0)) * 22));
  return (rem != null && rem < 0.2) || min <= 0 ? "Arriving" : `${min} min`;
}

function TrackScreen({ order, onBack, onChanged, canFinance = true }) {
  const [live, setLive] = useState(order);                        // full order, refreshed live
  const [siteLatLng, setSiteLatLng] = useState(null);             // job site coords (from the map's geocode) — for a real ETA
  const [payErr, setPayErr] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showReorder, setShowReorder] = useState(false);   // "Order again" — new order pre-filled from this one
  const [showSignedTicket, setShowSignedTicket] = useState(false);   // signed delivery ticket (proof of delivery)
  // Workers manage orders like a customer; only billing (canFinance) is hidden.
  const editable = ["requested", "scheduled"].includes(live.status);
  const cancelOrder = async () => {
    if (!window.confirm(`Cancel order ${order.ref}? This can't be undone.`)) return;
    try { await deleteOrder(order.ref); onChanged && onChanged(); onBack(); }
    catch (e) { alert(e.message); }
  };

  // COD: open the QuickBooks pay link for this order (fetched live).
  const payCod = async () => {
    const w = window.open("", "_blank");
    setPayErr("");
    try {
      const r = await getOrderPaymentStatus(order.ref);
      if (r.link) { if (w) w.location = r.link; else window.location.href = r.link; }
      else { if (w) w.close(); setPayErr(r.prepaid ? "This order is already paid." : "Payment link isn't ready yet — Aussieblock is setting it up."); }
    } catch (e) { if (w) w.close(); setPayErr(e.message); }
  };

  // LIVE: poll the whole order every few seconds so the map, the per-truck
  // statuses and the ETAs reflect real backend state (the GPS poller advances
  // each load — mock movement now, real One Step GPS later).
  useEffect(() => { setLive(order); }, [order.ref]);   // reset when switching orders
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try { const fresh = await getOrder(order.ref); if (alive && fresh) setLive(fresh); }
      catch { /* ignore transient errors; keep last value */ }
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => { alive = false; clearInterval(iv); };
  }, [order.ref]);

  // Every order is load-tracked. The truck the customer cares about right now is
  // the one en route, then on site/pouring, else the first load still in flight.
  const loads = live.loads || [];
  const activeLoad = loads.find((l) => l.status === "enroute")
    || loads.find((l) => ["onsite", "pouring"].includes(l.status)) || null;
  const repLoad = activeLoad || loads.find((l) => l.status !== "complete") || loads[0] || null;
  // The map, headline ETA and status pill follow that truck (fall back to the
  // order itself for an order that isn't load-tracked yet).
  const trackPos = (repLoad && repLoad.truck_position) || live.truck_position || null;
  const trackTruck = repLoad ? repLoad.truck : live.truck;
  const trackDriver = repLoad ? repLoad.driver : live.driver;
  const trackProgress = repLoad ? repLoad.progress : (live.progress || 0.05);
  const trackStatus = repLoad ? repLoad.status : live.status;

  // ETA to the job site for the tracked truck. Per-load ETA (shown per row) is
  // only meaningful once a truck is en route — before that it's "Loading at yard".
  const etaText = etaFor(trackStatus, trackPos, siteLatLng, trackProgress);
  // For the customer, tracking is just the ETA of an incoming truck. The moment it
  // arrives, tracking is over — no pour tracking, no return trip, no return ETA.
  const loadEta = (ld) => ld.status === "enroute" ? etaFor(ld.status, ld.truck_position, siteLatLng, ld.progress) : null;
  const arrived = ["onsite", "pouring", "returning", "complete"].includes(trackStatus);
  const delivered = live.status === "complete" || trackStatus === "complete";
  const preparing = !arrived && (live.status === "ongoing" || trackStatus === "batched" || live.status === "batched");
  // Customer-friendly per-truck label — we don't surface "returning to yard" etc.
  const custLabel = (st) => (st === "returning" || st === "complete") ? "Delivered"
    : (st === "onsite" || st === "pouring") ? "On site"
    : st === "enroute" ? "On the way"
    : "Loading at yard";
  const STATUS_STAGE = { batched: 0, enroute: 1, onsite: 2, pouring: 3, returning: 4, complete: 5 };
  const isLive = ["batched", "ongoing", "enroute", "onsite", "pouring", "returning", "complete"].includes(live.status);
  const tracking = trackStatus === "enroute";   // live map + ETA only while a truck is heading over
  const stageIdx = STATUS_STAGE[trackStatus] ?? -1;

  return (
    <div className="px-4 pb-6 pt-2">
      <button onClick={onBack} className="flex items-center gap-1 text-white/60 text-sm mb-3 active:opacity-60"><ChevronLeft size={18} /> Back</button>
      <div className="flex items-baseline justify-between">
        <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{order.ref}</span>
        <StatusPill status={trackStatus} />
      </div>
      <h2 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight mt-1">{order.project || order.site}</h2>
      {order.project && <p className="text-white/50 text-sm flex items-center gap-1"><MapPin size={13} /> {order.site}</p>}
      {order.is_pour ? (
        <p className="text-white/50 text-sm">{order.mix} · Ordered {order.qty} · Delivered {fmtYards(live.yards_loaded || 0)} yd</p>
      ) : (
        <p className="text-white/50 text-sm">{order.mix} · {order.qty}</p>
      )}
      {orderExtras(order) && <p className="text-white/40 text-xs mt-0.5">{orderExtras(order)}</p>}

      {canFinance && order.prepay_required && !order.prepaid && (
        <div className="rounded-2xl p-4 mt-3" style={{ background: "rgba(231,115,42,0.12)", border: `1px solid ${ORANGE}` }}>
          <div className="text-white font-bold text-sm" style={{ fontFamily: C.cond }}>Payment required before delivery</div>
          <div className="text-white/55 text-xs mt-0.5" style={{ fontFamily: C.body }}>This is a COD order — pay now to get your delivery scheduled.</div>
          <button onClick={payCod} className="w-full mt-2.5 rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98]" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}><CreditCard size={16} /> Pay now</button>
          {payErr && <div className="text-xs mt-1.5" style={{ color: "#ff8a85", fontFamily: C.body }}>{payErr}</div>}
        </div>
      )}
      {canFinance && order.prepay_required && order.prepaid && (
        <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: GREEN, fontFamily: C.body }}><CheckCircle2 size={14} /> Payment received — your delivery is confirmed</div>
      )}

      {tracking ? (
        <>
          <div className="mt-4"><GoogleTrackMap site={order.site} truckPosition={trackPos} truckLabel={trackTruck} progress={trackProgress} onSite={setSiteLatLng} /></div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-2xl p-4" style={{ background: NAVY }}><div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wide"><Clock size={13} /> ETA</div><div style={{ color: ORANGE, fontFamily: C.cond }} className="text-3xl font-bold mt-1">{etaText}</div></div>
            <div className="rounded-2xl p-4" style={{ background: NAVY }}><div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wide"><Truck size={13} /> Vehicle</div><div style={{ fontFamily: C.cond }} className="text-white text-3xl font-bold mt-1">{trackTruck}</div>{trackDriver && trackDriver !== "—" && <div className="text-white/55 text-xs mt-1 flex items-center gap-1" style={{ fontFamily: C.body }}><User size={12} /> {trackDriver}</div>}</div>
          </div>
          <div className="rounded-2xl p-4 mt-3" style={{ background: NAVY }}><div className="text-white/50 text-xs uppercase tracking-wide">Delivery progress</div><Timeline stageIdx={stageIdx} /></div>
        </>
      ) : (arrived || delivered) ? (
        // The truck has arrived — for the customer, tracking is over. No pour or
        // return-trip tracking; just confirm it's here / delivered.
        <div className="rounded-2xl p-6 mt-4 text-center" style={{ background: NAVY }}>
          <CheckCircle2 size={30} color={GREEN} className="mx-auto mb-2" />
          <div className="text-white text-lg font-bold" style={{ fontFamily: C.cond }}>{delivered ? "Delivered" : "On site"}</div>
          <div className="text-white/55 text-sm mt-1" style={{ fontFamily: C.body }}>{delivered ? "Your concrete has been delivered — thank you!" : "Your truck has arrived — your concrete is being delivered."}</div>
        </div>
      ) : preparing ? (
        // Loading at the yard (or a pour underway) but no truck is en route yet —
        // the ETA appears once a truck heads out.
        <div className="rounded-2xl p-5 mt-4 text-center" style={{ background: NAVY }}>
          <Truck size={28} color={ORANGE_HOT} className="mx-auto mb-2" />
          <div className="text-white text-lg font-bold" style={{ fontFamily: C.cond }}>Getting ready</div>
          <div className="text-white/55 text-sm mt-1" style={{ fontFamily: C.body }}>Your concrete is being loaded — the ETA appears here once the truck heads out.</div>
        </div>
      ) : (
        <div className="rounded-2xl p-6 mt-4 text-center" style={{ background: NAVY }}>
          <Clock size={30} color={ORANGE} className="mx-auto mb-2" />
          <div className="text-white text-lg font-bold" style={{ fontFamily: C.cond }}>{live.status === "requested" ? "Awaiting confirmation" : "Scheduled"}</div>
          <div className="text-white/55 text-sm mt-1" style={{ fontFamily: C.body }}>
            {live.status === "requested"
              ? "Aussieblock will confirm this delivery shortly."
              : `Scheduled for ${[formatOrderDate(live.when), live.time].filter(Boolean).join(" · ") || "a date to be confirmed"}.`}
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

      {order.is_pour ? (
        // Continuous pour: show each truck-load delivered, its yards, status, and ticket.
        loads.length > 0 ? (
          (() => {
          const isReceived = (ld) => ld.has_signature || ld.status === "complete" || ld.status === "returning";
          const receivedCount = loads.filter(isReceived).length;
          return (
          <div className="mt-3 rounded-2xl p-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)" }}>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <span className="text-white/55 text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: C.body }}>Loads · {fmtYards(live.yards_loaded || 0)} of {order.qty} yd delivered</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: GREEN + "22", color: GREEN, fontFamily: C.body }}>{receivedCount} of {loads.length} received</span>
            </div>
            <div className="flex flex-col gap-2">
              {loads.map((ld) => {
                const meta = STATUS_META[ld.status] || STATUS_META.scheduled;
                const eta = loadEta(ld);
                const received = isReceived(ld);
                return (
                  <div key={ld.seq} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5" style={{ background: NAVY_DEEP, border: `1px solid ${received ? GREEN + "55" : "rgba(255,255,255,0.1)"}` }}>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold flex items-center gap-1.5" style={{ fontFamily: C.cond }}>Load {ld.seq} of {loads.length} · {ld.qty} yd</div>
                      <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1" style={{ color: received ? GREEN : meta.color, fontFamily: C.body }}>
                        {received ? <><CheckCircle2 size={12} /> Received</> : <>{custLabel(ld.status)}{eta && <span className="text-white/45">{` · ${eta}`}</span>}</>}
                      </div>
                    </div>
                    {ld.has_batch_ticket && (
                      <button onClick={() => openLoadBatchTicket(order.ref, ld.seq).catch((e) => alert(e.message))} className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg active:scale-95 transition-transform" style={{ color: "#fff", background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>
                        <FileText size={14} /> Ticket
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          );
          })()
        ) : order.has_batch_ticket ? (
          // Legacy order: a pour with no loads but an order-level ticket (uploaded
          // before load-tracking). Show the order-level ticket so it stays reachable.
          <button onClick={() => openBatchTicket(order.ref).catch((e) => alert(e.message))} className="w-full mt-3 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform text-white" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><FileText size={18} /> Batch ticket (PDF)</button>
        ) : (
          <div className="text-center text-white/35 text-xs py-2 mt-3" style={{ fontFamily: C.body }}>Loads will appear here as each truck is delivered.</div>
        )
      ) : order.has_batch_ticket ? (
        <button onClick={() => openBatchTicket(order.ref).catch((e) => alert(e.message))} className="w-full mt-3 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform text-white" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><FileText size={18} /> Batch ticket (PDF)</button>
      ) : (
        <div className="text-center text-white/35 text-xs py-2 mt-3" style={{ fontFamily: C.body }}>Batch ticket will appear here once it's uploaded.</div>
      )}

      {live.has_signature && (
        <button onClick={() => setShowSignedTicket(true)} className="w-full mt-3 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform" style={{ background: GREEN + "18", border: `1px solid ${GREEN}55`, color: GREEN, fontFamily: C.body }}><CheckCircle2 size={18} /> Signed delivery ticket</button>
      )}
      {showSignedTicket && <DeliveryTicketModal order={live} onClose={() => setShowSignedTicket(false)} />}

      {/* Reach dispatch about this delivery — one number, call or text */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <a href={`tel:${DISPATCH_TEL}`} className="rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-white active:scale-95 transition-transform" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><Phone size={16} color={ORANGE} /> Call dispatch</a>
        <a href={`sms:${DISPATCH_TEL}`} className="rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold text-white active:scale-95 transition-transform" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><Send size={16} color={ORANGE} /> Text dispatch</a>
      </div>
      <div className="text-center text-white/35 text-xs mt-1.5" style={{ fontFamily: C.body }}>Dispatch · {DISPATCH_PHONE}</div>

      {showEdit && <EditOrderModal order={order} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); onChanged && onChanged(); onBack(); }} />}
      {showReorder && <OrderConcreteModal initial={order} onClose={() => setShowReorder(false)} onPlaced={() => { setShowReorder(false); onChanged && onChanged(); onBack(); }} companyName={order.customer} />}
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
  const admix = []; let extraSet = "1 hr", fiberLbs = "", colorDetail = "", fiberType = FIBER_PRODUCTS[0].name;
  String(o.admixtures || "").split(",").map((s) => s.trim()).filter(Boolean).forEach((p) => {
    if (p.startsWith("Set Control")) { admix.push("Set Control"); const m = p.match(/\+\s*(.+)/); if (m) extraSet = m[1].trim(); }
    else if (/fiber|matrix|mac\s*3\d0/i.test(p)) {
      admix.push("Fiber");
      // Which product was chosen, and its dose (digit-safe: the lbs number, not 330/360).
      fiberType = /360|matrix/i.test(p) ? "Mac Matrix 360" : "MasterFiber MAC 330";
      const m = p.match(/([\d.]+)\s*lbs/i);
      if (m) { const t = parseFloat(m[1]); if (t && t !== fiberDose(fiberType)) fiberLbs = m[1]; }   // blank field = the product's standard dose
    }
    else if (p.startsWith("Color")) { admix.push("Color"); const m = p.match(/Color:\s*(.+)/); if (m) colorDetail = m[1].trim(); }
    else if (p === "Accelerant") admix.push("Accelerant");
  });
  return { mix, qty, slump, useFor, useOther, admix, extraSet, fiberLbs, fiberType, colorDetail, project: o.project || "" };
}

function useConcreteSpec(initial, customerName) {
  const p = parseSpec(initial);
  const forcedMix = forcedMixFor(customerName);   // e.g. Landers → always "Precast"
  const [mix, setMix] = useState(forcedMix || p.mix);
  // When the order is for a single-mix customer, snap the mix to theirs and keep
  // it there even if the customer is picked/changed after the form opened.
  useEffect(() => { if (forcedMix && mix !== forcedMix) setMix(forcedMix); }, [forcedMix]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [useFor, setUseFor] = useState(p.useFor);
  const [useOther, setUseOther] = useState(p.useOther);
  const [qty, setQty] = useState(p.qty);
  const [slump, setSlump] = useState(p.slump);
  const [admix, setAdmix] = useState(p.admix);
  const [extraSet, setExtraSet] = useState(p.extraSet);
  const [fiberLbs, setFiberLbs] = useState(p.fiberLbs);
  const [fiberType, setFiberType] = useState(p.fiberType);
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
      if (a === "Fiber") { const x = parseFloat(fiberLbs); const dose = x > 0 ? x : fiberDose(fiberType); return `${fiberType}: ${dose} lbs/yd`; }
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
      <select value={mix} onChange={(e) => setMix(e.target.value)} disabled={!!forcedMix} className={inCls + (forcedMix ? " mb-1 opacity-70" : " mb-3")} style={inSt}>
        {forcedMix ? (
          <option value={forcedMix}>{forcedMix}</option>
        ) : (<>
        <optgroup label="Strength (PSI)">
          {MIXES.map((m) => <option key={m} value={m}>{m === RECOMMENDED_MIX ? `${m} (recommended)` : m}</option>)}
        </optgroup>
        <optgroup label="TxDOT mix design">
          {TXDOT_MIXES.map((m) => <option key={m} value={m}>{m}</option>)}
        </optgroup>
        <optgroup label="Specialty">
          {PRECAST_MIXES.map((m) => <option key={m} value={m}>{m}</option>)}
        </optgroup>
        </>)}
      </select>
      {forcedMix && <div className="text-white/35 text-[11px] mb-3">This customer only uses {forcedMix} — mix is set automatically.</div>}

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
          <label className={lbl}>Fiber product</label>
          <select value={fiberType} onChange={(e) => setFiberType(e.target.value)} className={inCls + " mb-2"} style={inSt}>
            {FIBER_PRODUCTS.map((f) => <option key={f.name} value={f.name}>{f.name} ({f.dose} lbs/yd std)</option>)}
          </select>
          <label className={lbl}>Dose — lbs/yd ({fiberDose(fiberType)} is standard)</label>
          <div className="flex items-center rounded-lg" style={inSt}>
            <input type="number" min="0" step="0.5" value={fiberLbs} onChange={(e) => setFiberLbs(e.target.value)} placeholder={`${fiberDose(fiberType)} (standard)`} className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
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
function OrderConcreteModal({ onClose, onPlaced, initial, companyName }) {
  const spec = useConcreteSpec(initial, companyName);   // single-mix customers (Landers) lock the mix
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
              <div className="min-w-0"><label className={lbl}>Time (optional)</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inCls} style={inSt} /></div>
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
  const spec = useConcreteSpec(order, order.customer);
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
      const o = await editOrder(order.ref, { site: site.trim(), scheduled_for: date, time, notes: finalNotes, ...spec.build() });
      onSaved(o);
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><FileText size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Modify order {order.ref}</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {spec.fields}
          <label className={lbl}>Job site</label>
          <AddressInput value={site} onChange={setSite} placeholder="Type address or business name" inCls={inCls} inSt={inSt} wrapClass="mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="min-w-0"><label className={lbl}>Date</label><input type="date" min={localToday()} value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }} className={inCls} style={inSt} /></div>
            <div className="min-w-0"><label className={lbl}>Time (optional)</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inCls} style={inSt} /></div>
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
function CalculatorScreen({ onPlaced, companyName }) {
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

      {showOrder && <OrderConcreteModal initial={{ qty: `${orderCy} CY` }} onClose={() => setShowOrder(false)} onPlaced={() => { setShowOrder(false); onPlaced && onPlaced(); }} companyName={companyName} />}
    </div>
  );
}

// Knowledge Center — the shared PDF library (guides, spec sheets, safety). Read-
// only here; the office uploads/removes from the dispatch board. Shown to every
// company-side login (workers + admins).
function KnowledgeScreen() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  useEffect(() => {
    let alive = true;
    getDocs()
      .then((d) => { if (alive) { setDocs(d); setLoading(false); } })
      .catch((e) => { if (alive) { setErr(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, []);
  return (
    <div className="px-4 pb-6 pt-2">
      <h1 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight mb-1">Knowledge Center</h1>
      <p className="text-white/45 text-sm mb-4" style={{ fontFamily: C.body }}>Guides, spec sheets &amp; safety docs from Aussieblock.</p>
      {loading ? (
        <div className="text-white/40 text-sm py-8 text-center" style={{ fontFamily: C.body }}>Loading…</div>
      ) : err ? (
        <div className="text-sm py-3 rounded-lg px-3" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85", fontFamily: C.body }}>{err}</div>
      ) : docs.length === 0 ? (
        <div className="text-white/40 text-sm py-10 text-center" style={{ fontFamily: C.body }}>No documents yet — check back soon.</div>
      ) : docs.map((d) => (
        <button key={d.id} onClick={() => openDoc(d.id).catch((e) => alert(e.message))} className="w-full text-left rounded-2xl p-4 mb-3 flex items-center gap-3 transition-transform active:scale-[0.98]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="shrink-0 rounded-xl p-2.5" style={{ background: ORANGE + "22" }}><FileText size={20} color={ORANGE} /></div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-base font-semibold leading-tight truncate" style={{ fontFamily: C.cond }}>{d.title}</div>
            <div className="text-white/40 text-xs mt-0.5" style={{ fontFamily: C.body }}>PDF · tap to open</div>
          </div>
          <Download size={18} className="text-white/40 shrink-0" />
        </button>
      ))}
    </div>
  );
}

function OrdersScreen({ orders, account, onOpen, onPlaced, canFinance = true, companyName }) {
  const [showOrder, setShowOrder] = useState(false);
  const [reorder, setReorder] = useState(null);   // a past order to "Order again"
  const [showNotifs, setShowNotifs] = useState(false);   // notifications panel
  const todayKey = localToday();
  const requested = orders.filter((o) => o.status === "requested");
  // Completed orders go to their own "Past orders" history (most recent first),
  // so they don't clutter the live lists but stay easy to reorder. Archived
  // orders are shown here too — archiving only declutters the staff board, it
  // shouldn't hide a crew's delivery history.
  const completed = orders.filter((o) => o.status === "complete").slice().sort((a, b) => String(b.when).localeCompare(String(a.when)));
  const active = orders.filter((o) => o.status !== "requested" && o.status !== "complete");
  const todayO = active.filter((o) => orderDay(o.when, todayKey) === "today");
  const upcomingO = active.filter((o) => orderDay(o.when, todayKey) === "upcoming");
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const hdr = "text-white/50 text-xs font-semibold uppercase tracking-widest mb-2";

  // Notifications: things needing the customer's attention, built from their own
  // orders + account (no backend). The bell shows the count; tapping an order
  // alert opens it (Track), where they can pay / track / get the ticket.
  const money = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const notifs = [];
  orders.filter((o) => o.prepay_required && !o.prepaid).forEach((o) =>
    notifs.push({ key: "pay-" + o.ref, Icon: CreditCard, color: ORANGE, title: `Payment due — ${o.ref}`, sub: `${o.mix} · ${o.qty} — tap to pay`, order: o }));
  orders.filter((o) => ["enroute", "onsite", "pouring", "returning"].includes(o.status)).forEach((o) =>
    notifs.push({ key: "live-" + o.ref, Icon: Truck, color: ORANGE_HOT, title: `${(STATUS_META[o.status] || {}).label || "On the way"} — ${o.ref}`, sub: o.project || o.site, order: o }));
  orders.filter((o) => o.status === "requested").forEach((o) =>
    notifs.push({ key: "req-" + o.ref, Icon: Clock, color: "#6aa9ff", title: `Awaiting confirmation — ${o.ref}`, sub: `${o.mix} · ${o.qty}`, order: o }));
  (account?.invoices || []).filter((i) => i.status === "overdue" || i.status === "due").forEach((i) =>
    notifs.push({ key: "inv-" + i.id, Icon: FileText, color: i.status === "overdue" ? "#ff8a85" : ORANGE, title: `Invoice ${money(i.amount)} ${i.status}`, sub: `Dated ${i.date} — see Account to pay` }));
  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-white/45 text-sm" style={{ fontFamily: C.body }}>Welcome back</div>
          <h1 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight">{account?.company || companyName || "Your account"}</h1>
          <p className="text-white/40 text-sm mt-0.5">{todayLabel}</p>
        </div>
        <button onClick={() => setShowNotifs(true)} title="Notifications" className="relative mt-1 active:scale-90 transition-transform">
          <Bell size={22} className="text-white/70" />
          {notifs.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "#ff4d4d", color: "#fff", fontFamily: C.body }}>{notifs.length}</span>
          )}
        </button>
      </div>

      <button onClick={() => setShowOrder(true)} className="w-full rounded-2xl py-3.5 mb-5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
        <Plus size={18} /> Order Concrete
      </button>

      <h2 style={{ fontFamily: C.cond }} className="text-white text-lg font-bold mb-2">My Orders</h2>
      {orders.length === 0 && <div className="text-white/40 text-sm py-8 text-center" style={{ fontFamily: C.body }}>No orders yet. Tap “Order Concrete” to request a delivery.</div>}

      {requested.length > 0 && <div className={hdr} style={{ color: "#6aa9ff" }}>Pending confirmation</div>}
      {requested.map((o) => <OrderCard key={o.ref} o={o} onOpen={onOpen} showPay={canFinance} />)}

      {todayO.length > 0 && <div className={hdr + " mt-5"}>Today</div>}
      {todayO.map((o) => <OrderCard key={o.ref} o={o} onOpen={onOpen} showPay={canFinance} />)}

      {upcomingO.length > 0 && <div className={hdr + " mt-5"}>Upcoming</div>}
      {upcomingO.map((o) => <OrderCard key={o.ref} o={o} onOpen={onOpen} showPay={canFinance} />)}

      {completed.length > 0 && <div className={hdr + " mt-5"}>Past orders · tap “Again” to reorder</div>}
      {completed.map((o) => <PastOrderRow key={o.ref} o={o} onOpen={onOpen} onReorder={setReorder} />)}

      {showOrder && <OrderConcreteModal onClose={() => setShowOrder(false)} onPlaced={onPlaced} companyName={account?.company || companyName} />}
      {reorder && <OrderConcreteModal initial={reorder} onClose={() => setReorder(null)} onPlaced={() => { setReorder(null); onPlaced && onPlaced(); }} companyName={account?.company || companyName} />}

      {showNotifs && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowNotifs(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden max-h-[80vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
              <div className="flex items-center gap-2"><Bell size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Notifications</span></div>
              <button onClick={() => setShowNotifs(false)} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ fontFamily: C.body }}>
              {notifs.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={30} color={GREEN} className="mx-auto mb-2" />
                  <div className="text-white/60 text-sm">You're all caught up.</div>
                </div>
              ) : notifs.map((n) => (
                <button key={n.key} onClick={() => { if (n.order) { setShowNotifs(false); onOpen(n.order); } }} className="w-full text-left flex items-center gap-3 rounded-xl p-3 mb-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <n.Icon size={18} color={n.color} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{n.title}</div>
                    {n.sub && <div className="text-white/45 text-xs truncate">{n.sub}</div>}
                  </div>
                  {n.order && <ChevronRight size={16} className="text-white/30 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountScreen({ account, customerId }) {
  // Track which invoice (if any) we're fetching a pay link for, plus any error.
  const [paying, setPaying] = useState(null);
  const [payErr, setPayErr] = useState("");
  const [showStatement, setShowStatement] = useState(false);   // in-app statement overlay (always closable)

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
<style>body{font-family:Arial,Helvetica,sans-serif;color:#161d27;margin:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}h1{color:#e7732a;margin:0;font-size:22px;letter-spacing:.5px;}
.brand{display:flex;align-items:center;gap:16px;border-bottom:3px solid #e7732a;padding-bottom:14px;}
.brand .logo{height:52px;width:auto;display:block;}.brand-words{flex:1;}
.brand-name{font-size:22px;font-weight:bold;letter-spacing:.06em;color:#161d27;}
.brand-sub{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#e7732a;font-weight:bold;margin-top:3px;}
.brand-meta{text-align:right;font-size:11px;color:#667;line-height:1.7;}.brand-meta .ml{text-transform:uppercase;letter-spacing:.05em;color:#9aa1ab;font-size:9.5px;}
.foot{margin-top:24px;border-top:1px solid #e2e6ea;padding-top:10px;color:#667;font-size:11px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;}.foot .co{font-weight:bold;color:#161d27;}
.muted{color:#667;font-size:13px;}.sum{display:flex;gap:30px;background:#f6f7f9;border-radius:10px;padding:14px 16px;margin-top:18px;}
.lab{color:#667;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}.big{font-size:20px;font-weight:bold;margin-top:2px;}
table{width:100%;border-collapse:collapse;margin-top:18px;font-size:13px;}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #e2e6ea;}
th{color:#667;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}.r{text-align:right;}.pastdue{color:#c62828;}
button{background:#e7732a;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer;margin-top:22px;}@media print{button{display:none;}}</style></head>
<body>
<header class="brand">
  <svg class="logo" viewBox="54 54 517 374" xmlns="http://www.w3.org/2000/svg"><path d="${LOGO_TILE}" fill="#161d27"/><path d="${LOGO_ROO}" fill="#e7732a"/></svg>
  <div class="brand-words"><div class="brand-name">AUSSIEBLOCK READY MIX</div><div class="brand-sub">Account Statement</div></div>
  <div class="brand-meta"><div><span class="ml">Generated</span> ${stDate}</div></div>
</header>
<div style="margin-top:14px;"><strong>${account.company}</strong><div class="muted">Account ${account.acctNo || ""} &middot; Terms ${account.terms || ""}</div></div>
<div class="sum"><div><div class="lab">Current balance</div><div class="big">${usd(account.balance)}</div></div>
${account.pastDue > 0 ? `<div><div class="lab pastdue">Past due</div><div class="big pastdue">${usd(account.pastDue)}</div></div>` : ""}</div>
<table><thead><tr><th>Invoice</th><th>Date</th><th>Order</th><th>Status</th><th class="r">Amount</th></tr></thead>
<tbody>${rows || `<tr><td colspan="5" class="muted">No invoices on file.</td></tr>`}</tbody>
<tfoot><tr><td colspan="4" class="r"><strong>Total</strong></td><td class="r"><strong>${usd(total)}</strong></td></tr></tfoot></table>
<div class="foot"><span class="co">Aussieblock Ready Mix</span><span>Billing questions? Office 325-213-5315 &middot; Dispatch 940-577-7475</span></div>
<button onclick="window.print()">Print / Save as PDF</button>
<button onclick="window.close()" style="background:#161d27;margin-left:8px;">Close</button></body></html>`);
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
        <button onClick={() => setShowStatement(true)} className="flex items-center gap-1 text-xs active:opacity-60" style={{ color: ORANGE, fontFamily: C.body }}><Download size={12} /> Statement</button>
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

      {/* dispatch — orders & deliveries; call or text the one line */}
      <div className="rounded-2xl p-4 mt-3" style={{ background: NAVY }}>
        <div className="flex items-center gap-3 mb-3">
          <Truck size={18} color={ORANGE} />
          <div className="min-w-0">
            <div className="text-white/45 text-xs uppercase tracking-wide" style={{ fontFamily: C.body }}>Dispatch — orders & deliveries</div>
            <div className="text-white text-sm" style={{ fontFamily: C.body }}>{DISPATCH_PHONE}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${DISPATCH_TEL}`} className="rounded-xl py-2.5 flex items-center justify-center gap-2 font-semibold text-white active:scale-95 transition-transform" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><Phone size={15} color={ORANGE} /> Call</a>
          <a href={`sms:${DISPATCH_TEL}`} className="rounded-xl py-2.5 flex items-center justify-center gap-2 font-semibold text-white active:scale-95 transition-transform" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><Send size={15} color={ORANGE} /> Text</a>
        </div>
      </div>

      {showStatement && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setShowStatement(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden my-4" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
              <div className="flex items-center gap-2"><FileText size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Account Statement</span></div>
              <button onClick={() => setShowStatement(false)} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
            </div>
            <div className="p-5" style={{ fontFamily: C.body }}>
              <div className="text-white font-bold" style={{ fontFamily: C.cond }}>{account.company}</div>
              <div className="text-white/45 text-xs">Account {account.acctNo || "—"} · Terms {account.terms || "—"}</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl p-3" style={{ background: NAVY }}><div className="text-white/45 text-[11px] uppercase tracking-wide">Current balance</div><div className="text-white text-xl font-bold mt-0.5" style={{ fontFamily: C.cond }}>{usd(outstanding)}</div></div>
                {pastDue > 0 && <div className="rounded-xl p-3" style={{ background: "rgba(239,83,80,0.12)" }}><div className="text-[11px] uppercase tracking-wide" style={{ color: "#ff8a85" }}>Past due</div><div className="text-xl font-bold mt-0.5" style={{ color: "#ff8a85", fontFamily: C.cond }}>{usd(pastDue)}</div></div>}
              </div>
              <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mt-4 mb-2">Invoices</div>
              <div className="max-h-[40vh] overflow-y-auto -mr-1 pr-1">
                {invoices.length === 0 ? (
                  <div className="text-white/40 text-sm py-3 text-center">No invoices on file.</div>
                ) : invoices.map((inv) => {
                  const m = INV_STATUS[inv.status] || INV_STATUS.due;
                  return (
                    <div key={inv.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="min-w-0">
                        <div className="text-white text-sm truncate">{inv.id}{inv.order ? ` · ${inv.order}` : ""}</div>
                        <div className="text-white/40 text-xs">{inv.date || ""} · <span style={{ color: m.color }}>{m.label}</span></div>
                      </div>
                      <div className="text-white text-sm font-semibold shrink-0 ml-2">{usd(inv.amount)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={openStatement} className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-white active:scale-95" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><Download size={15} /> Print / Save PDF</button>
                <button onClick={() => setShowStatement(false)} className="flex-1 rounded-xl py-2.5 text-sm font-bold active:scale-95" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
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
function GoogleFleetMap({ trucks, sites = [] }) {
  const elRef = useRef(null), mapRef = useRef(null), markersRef = useRef([]);
  const trucksRef = useRef(trucks); trucksRef.current = trucks;
  const sitesRef = useRef(sites); sitesRef.current = sites;
  const siteMarkersRef = useRef([]);
  const geocodeRef = useRef({});   // address -> {lat,lng} | null (geocode failed)
  const lastFitKeyRef = useRef("");   // which jobs we last framed — refit only when it changes
  const [failed, setFailed] = useState(false);

  const drawTrucks = (maps) => {
    if (!mapRef.current) return;
    const colors = truckColorMap(trucksRef.current);
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = trucksRef.current
      .filter((t) => t.lat != null && t.lng != null)
      .map((t) => new maps.Marker({
        position: { lat: t.lat, lng: t.lng }, map: mapRef.current, title: t.label,
        icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, rotation: t.heading || 0,
                fillColor: isStale(t.updated_at) ? "#7c8794" : (colors[t.label] || "#ff7a3d"), fillOpacity: 1, strokeColor: "#fff", strokeWeight: 1.5 },
        label: { text: t.label, color: "#fff", fontSize: "10px", fontWeight: "600" },
      }));
  };

  // Frame the yard + every geocoded job site so both are always in view; with
  // several sites this zooms out to fit them all. Only refit when the set of
  // mappable jobs changes, so it doesn't fight a manual zoom/pan between updates.
  const fitToYardAndSites = (maps) => {
    if (!mapRef.current) return;
    const located = sitesRef.current.filter((s) => geocodeRef.current[s.site]);
    const key = located.map((s) => s.ref).sort().join(",");
    if (key === lastFitKeyRef.current) return;
    lastFitKeyRef.current = key;
    if (located.length === 0) return;   // nothing but the yard — keep the default view
    const b = new maps.LatLngBounds();
    b.extend({ lat: PLANT.lat, lng: PLANT.lng });
    located.forEach((s) => b.extend(geocodeRef.current[s.site]));
    mapRef.current.fitBounds(b, 70);   // 70px padding around the markers
  };

  // A dot at each job site (geocoded from the order's address) so staff can eyeball
  // that the address on the card actually lands where the job is. Cached per address.
  const drawSites = (maps) => {
    if (!mapRef.current) return;
    siteMarkersRef.current.forEach((m) => m.setMap(null));
    siteMarkersRef.current = [];
    const place = (loc, s) => {
      siteMarkersRef.current.push(new maps.Marker({
        position: loc, map: mapRef.current, title: `${s.label} — ${s.site}`,
        icon: { path: maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#6aa9ff", fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 2 },
        label: { text: s.label, color: "#cfe0ff", fontSize: "10px", fontWeight: "600" },
      }));
      // 300 m radius around the site — a visual geofence to track trucks arriving.
      siteMarkersRef.current.push(new maps.Circle({
        center: loc, radius: 300, map: mapRef.current, clickable: false,
        strokeColor: "#6aa9ff", strokeOpacity: 0.6, strokeWeight: 1.5,
        fillColor: "#6aa9ff", fillOpacity: 0.1,
      }));
    };
    const seen = new Set();
    let pending = 0;
    for (const s of sitesRef.current) {
      if (!s.site || seen.has(s.ref)) continue;
      seen.add(s.ref);
      const cached = geocodeRef.current[s.site];
      if (cached) { place(cached, s); continue; }
      if (cached === null) continue;   // known-bad address — skip re-geocoding
      pending++;
      new maps.Geocoder().geocode({ address: s.site }, (res, status) => {
        if (status === "OK" && res && res[0]) {
          const ll = res[0].geometry.location;
          const loc = { lat: ll.lat(), lng: ll.lng() };
          geocodeRef.current[s.site] = loc;
          if (mapRef.current) place(loc, s);
        } else {
          geocodeRef.current[s.site] = null;
        }
        if (--pending === 0) fitToYardAndSites(maps);   // refit once all geocodes resolve
      });
    }
    fitToYardAndSites(maps);   // fit immediately for the already-cached sites
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
      drawSites(maps);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const maps = window.google?.maps;
    if (maps && mapRef.current) drawTrucks(maps);
  }, [trucks]);

  useEffect(() => {
    const maps = window.google?.maps;
    if (maps && mapRef.current) drawSites(maps);
  }, [sites]);

  if (failed || !GOOGLE_PLACES_KEY) return <FleetMap trucks={trucks} />;
  return <div ref={elRef} className="w-full h-full rounded-2xl" style={{ minHeight: 340, background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }} />;
}

// Real Google map for the CUSTOMER track screen: the yard, the live delivery
// truck (with heading), and the destination job site (geocoded from its address).
// Same dark Google map the dispatch board uses; falls back to the schematic
// TrackMap if Maps JS isn't available (no key / API not enabled).
function GoogleTrackMap({ site, truckPosition, truckLabel, progress, onSite }) {
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
            onSite && onSite({ lat: loc.lat(), lng: loc.lng() });   // report site coords up for a real ETA
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
    <div className="shrink-0 w-fit max-w-full flex items-center rounded-2xl px-4 py-2 overflow-x-auto" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* current */}
      <div className="flex items-center gap-2.5 pr-4 mr-4 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <cur.Icon size={32} color={cur.color} strokeWidth={1.75} />
        <div>
          <div className="flex items-start gap-0.5">
            <span className="text-white text-2xl font-bold leading-none" style={{ fontFamily: C.cond }}>{wx.tempF}</span>
            <span className="text-white/50 text-xs font-semibold mt-0.5">°F</span>
          </div>
          <div className="text-white/35 text-[11px] uppercase tracking-wide mt-0.5" style={{ fontFamily: C.body }}>San Angelo</div>
        </div>
      </div>
      {/* forecast — next 3 days, compact */}
      <div className="flex items-center gap-4">
        {wx.days.slice(0, 3).map((d) => {
          const ic = wxIcon(d.text, true);
          return (
            <div key={d.name} className="flex items-center gap-1.5 shrink-0" title={d.text}>
              <span className="text-white/45 text-xs font-semibold" style={{ fontFamily: C.body }}>{shortDay(d.name)}</span>
              <ic.Icon size={20} color={ic.color} strokeWidth={1.75} />
              <span className="text-white text-sm font-bold" style={{ fontFamily: C.cond }}>{d.hi}°</span>
              {d.lo != null && <span className="text-white/40 text-xs" style={{ fontFamily: C.cond }}>{d.lo}°</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// COD notice shown on a COD order row: this just FLAGS that the customer is COD
// so dispatch sends a payment request to the office, who generates the invoice in
// QuickBooks. No pay link / charge happens here — billing is handled by the office.
function CodControls({ o }) {
  if (o.prepaid) return <div className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: GREEN, fontFamily: C.body }}><CheckCircle2 size={13} /> Paid — invoice settled</div>;

  return (
    <div className="mt-2 rounded-lg p-2.5" style={{ background: "rgba(106,169,255,0.1)", border: "1px solid rgba(106,169,255,0.4)" }}>
      <div className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: "#6aa9ff", fontFamily: C.body }}><CreditCard size={13} /> COD customer</div>
      <div className="text-[11px] text-white/60" style={{ fontFamily: C.body }}>Send a payment request to the office so they can generate an invoice for this order.</div>
    </div>
  );
}

// ── Batch Ticket panel ───────────────────────────────────────────────────────
// A complete digital copy of the paper batch ticket, grouped like the form.
// Core identity fields (customer/job/mix/qty/slump/truck/driver) already live on
// the order and are echoed read-only up top; everything else is saved as the
// order's batch_data (JSON) via PUT /orders/{ref}/batch-data.
const BATCH_BLANK = {
  date: "", cash_charge: "", customer_phone: "", product_name: "",
  plant: "", air: "", load: "", ordered: "", delivered: "",
  water_reducer: "", retarder: "",
  times: { left_plant: "", a_train_pr: "", left_job: "", return_plant: "" },
  inspector: "", received_by: "",
  mix_design: {
    rock: { design: "", target: "", actual: "" },
    sand: { design: "", target: "", actual: "" },
    cement: { design: "", target: "", actual: "" },
    slag: { design: "", target: "", actual: "" },
    air: { design: "", target: "", actual: "" },
    water: { design: "", target: "", actual: "" },
  },
  pricing: { unit_price: "", extended: "", subtotal: "", tax1: "", tax2: "", total: "", job_running_total: "" },
};

const getAt = (obj, path) => path.split(".").reduce((x, k) => (x == null ? x : x[k]), obj);

// TxDOT batch reporting: water is batched in pounds but inspectors report gallons.
// 1 US gallon of water ≈ 8.34 lb.
const WATER_LB_PER_GAL = 8.34;
const lbsToGal = (lbs) => {
  const n = parseFloat(lbs);
  return isFinite(n) ? `${(n / WATER_LB_PER_GAL).toFixed(1)} gal` : "";
};
// Max water-to-cement ratio by TxDOT class: Class A & B = 0.60, Class C = 0.45.
function wcMaxForMix(mix) {
  const m = String(mix || "").toLowerCase();
  if (m.includes("class c")) return 0.45;
  if (m.includes("class a") || m.includes("class b")) return 0.60;
  return null;
}
// Water/cement ratio from the batch sheet, preferring Actual, then Target, then
// Design — whichever column has both water and cement filled in.
function waterCementRatio(d) {
  for (const col of ["actual", "target", "design"]) {
    const w = parseFloat(getAt(d, `mix_design.water.${col}`));
    const c = parseFloat(getAt(d, `mix_design.cement.${col}`));
    if (isFinite(w) && isFinite(c) && c > 0) return { wc: w / c, col };
  }
  return null;
}

function mergeBatch(saved) {
  // deep-merge a (possibly partial/older) saved record onto the blank template
  const b = JSON.parse(JSON.stringify(BATCH_BLANK));
  if (!saved || typeof saved !== "object") return b;
  for (const k of Object.keys(b)) {
    if (saved[k] == null) continue;
    if (b[k] && typeof b[k] === "object") {
      for (const k2 of Object.keys(b[k])) {
        if (saved[k][k2] == null) continue;
        if (b[k][k2] && typeof b[k][k2] === "object") Object.assign(b[k][k2], saved[k][k2]);
        else b[k][k2] = saved[k][k2];
      }
    } else b[k] = saved[k];
  }
  return b;
}

// "Ticket details" → per-order PRICING view: what we bill the customer (from the
// price sheet) + the delivery (haul) cost (mileage auto from the job address,
// haul $/yd by distance, staff-picked hauler). The mix design lives on the
// uploaded batch ticket now, so this panel is pricing-only.
function BatchTicketForm({ o, onEdited }) {
  const [px, setPx] = useState(null);
  const [hauler, setHauler] = useState(o.hauler || "");
  const [mileage, setMileage] = useState(o.mileage != null ? String(o.mileage) : "");
  const [priceOv, setPriceOv] = useState(o.price_override != null ? String(o.price_override) : "");
  // Fiber dosage (lbs/yd), parsed from the order's admixtures string. Read the lbs
  // from the fiber segment itself (not anchored to the name) so a product label with
  // digits — "MasterFiber MAC 330: 4 lbs/yd" / "Mac Matrix 360: 4.5 lbs/yd" — yields
  // the real dose, not the 330/360 in the name.
  const [fiberLbs, setFiberLbs] = useState(() => {
    const seg = (o.admixtures || "").split(",").find((p) => /fiber|matrix|mac\s*3\d0/i.test(p)) || "";
    const m = /([\d.]+)\s*lb/i.exec(seg);
    return m ? m[1] : "";
  });
  // Custom fiber $/lb for this order (blank = price-sheet rate).
  const [fiberRate, setFiberRate] = useState(o.fiber_rate != null ? String(o.fiber_rate) : "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const done = o.status === "complete";   // pricing populates only once the order is complete

  useEffect(() => {
    if (!done) return undefined;   // don't calculate until the end (final actual yards)
    let live = true;
    getOrderPricing(o.ref).then((p) => {
      if (!live) return;
      setPx(p);
      if (!hauler && p.delivery && p.delivery.hauler) setHauler(p.delivery.hauler);
      if (mileage === "" && p.delivery && p.delivery.mileage) setMileage(String(p.delivery.mileage));
    }).catch((e) => live && setErr(e.message));
    return () => { live = false; };
  }, [o.ref, done]);   // eslint-disable-line react-hooks/exhaustive-deps

  const saveDelivery = async () => {
    setBusy(true); setErr(""); setSavedOk(false);
    try {
      const dl = await setOrderDelivery(o.ref, { hauler: hauler || null, mileage: mileage === "" ? null : Number(mileage) });
      setPx((p) => ({ ...(p || {}), delivery: dl }));
      if (dl.mileage != null) setMileage(String(dl.mileage));
      setSavedOk(true);
      onEdited && onEdited({ ...o, hauler: dl.hauler, mileage: dl.mileage });
    } catch (e) { setErr(e.message || "Could not save"); }
    finally { setBusy(false); }
  };

  // Custom $/yd unit price for this order (blank = use the price sheet). Works on
  // completed orders too. Re-pulls pricing so the totals reflect the new rate.
  const savePrice = async () => {
    setBusy(true); setErr(""); setSavedOk(false);
    try {
      const val = priceOv.trim() === "" ? null : Number(priceOv);
      const updated = await setOrderPrice(o.ref, val);
      const p = await getOrderPricing(o.ref);
      // Only the concrete pricing changes — the haul (delivery) is mileage × volume,
      // never the price, so we keep the existing delivery figure exactly as-is.
      setPx((prev) => ({ ...p, delivery: (prev && prev.delivery) ? prev.delivery : p.delivery }));
      onEdited && onEdited(updated);
      setSavedOk(true);
    } catch (e) { setErr(e.message || "Could not save price"); }
    finally { setBusy(false); }
  };

  // Set the fiber lbs/yd and $/lb on this order (blank/0 clears each). Re-pulls
  // pricing so the fiber line and totals reflect the new dosage × rate.
  const saveFiber = async () => {
    const lt = fiberLbs.trim(), rt = fiberRate.trim();
    const lbs = lt === "" ? null : Number(lt);
    const rate = rt === "" ? null : Number(rt);
    if (lbs != null && (Number.isNaN(lbs) || lbs < 0)) { setErr("Enter fiber lbs/yd as a number (0 or more)."); return; }
    if (rate != null && (Number.isNaN(rate) || rate < 0)) { setErr("Enter fiber $/lb as a number (0 or more)."); return; }
    setBusy(true); setErr(""); setSavedOk(false);
    try {
      const updated = await setOrderFiber(o.ref, lbs, rate);
      const p = await getOrderPricing(o.ref);
      setPx((prev) => ({ ...p, delivery: (prev && prev.delivery) ? prev.delivery : p.delivery }));
      onEdited && onEdited(updated);
      setSavedOk(true);
    } catch (e) { setErr(e.message || "Could not save fiber"); }
    finally { setBusy(false); }
  };

  const money = (v) => (v == null || v === "" ? "—" : `$${Number(v).toFixed(2)}`);
  const cp = px && px.customer, dl = px && px.delivery;
  const HAULERS = ["PL", "RTS"];

  const groupHead = (txt) => (
    <div className="text-[10px] font-bold uppercase tracking-wider mt-3 mb-1 pb-1" style={{ color: ORANGE, borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: C.body }}>{txt}</div>
  );
  const ro = (label, val) => (
    <div className="flex flex-col gap-1">
      <span className="text-white/30 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>{label}</span>
      <span className="text-white/80 text-sm truncate" style={{ fontFamily: C.body }}>{val || "—"}</span>
    </div>
  );
  const Prow = ({ label, val, bold }) => (
    <div className="flex items-center justify-between py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className={`text-sm ${bold ? "font-bold text-white" : "text-white/70"}`} style={{ fontFamily: C.body }}>{label}</span>
      <span className="text-sm" style={{ color: bold ? ORANGE : "#fff", fontWeight: bold ? 700 : 400, fontFamily: C.body }}>{val}</span>
    </div>
  );

  return (
    <div className="mt-2 rounded-xl p-3" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2">
        {ro("Customer", o.customer)}
        {ro("Job", o.site)}
        {ro("Mix", o.mix)}
        {ro("Quantity", o.qty)}
      </div>

      {!done ? (
        <div className="text-white/45 text-xs py-4 flex items-center gap-1.5" style={{ fontFamily: C.body }}>
          <Clock size={13} /> Pricing populates when this order is marked <b style={{ color: "#fff" }}>Complete</b> — it bills the actual yards delivered.
        </div>
      ) : (
      <>
      {groupHead("Customer pricing — what you bill")}
      {!cp ? (
        <div className="text-white/40 text-xs py-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Calculating…</div>
      ) : (
        <div>
          <Prow label={`Concrete  (${px.billed_qty} yd × ${money(cp.unit_price)}/yd)`} val={money(cp.extended)} />
          {px.billed_qty && px.ordered_qty && parseFloat(px.billed_qty) !== parseFloat(px.ordered_qty) && (
            <div className="text-[11px] py-0.5" style={{ color: "#6aa9ff", fontFamily: C.body }}>Billed actual {px.billed_qty} yd (ordered {px.ordered_qty})</div>
          )}
          {(cp.admixtures || []).map((a, i) => <Prow key={i} label={a.label} val={money(a.amount)} />)}
          {cp.short_load ? <Prow label="Short-load fee" val={money(cp.short_load)} /> : null}
          {cp.backhaul ? <Prow label="Back-haul fee" val={money(cp.backhaul)} /> : null}
          <Prow label="Subtotal" val={money(cp.subtotal)} />
          <Prow label={`Sales tax (${cp.tax_pct}%)`} val={money(cp.tax)} />
          <Prow label="Total" val={money(cp.total)} bold />
        </div>
      )}
      {/* custom $/yd unit price — overrides the sheet, works on completed orders */}
      <div className="mt-2 flex items-end gap-2 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Custom $/yd</span>
          <input value={priceOv} onChange={(e) => { setPriceOv(e.target.value); setSavedOk(false); }} placeholder={cp ? String(cp.unit_price) : "sheet price"} inputMode="decimal" className="rounded-lg px-2 py-1.5 text-sm outline-none w-28" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
        </label>
        <button onClick={savePrice} disabled={busy} className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: NAVY_DEEP, background: ORANGE, fontFamily: C.body }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Apply price
        </button>
        {o.price_override != null && (
          <button onClick={() => { setPriceOv(""); setTimeout(savePrice, 0); }} disabled={busy} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "rgba(255,255,255,0.6)", background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>Clear</button>
        )}
      </div>
      <div className="text-white/35 text-[11px] mt-1">Overrides the price-sheet $/yd for this order only (blank = sheet price). Applies to completed orders too.</div>

      {/* Mac Matrix Fiber — lbs/yd dosage and $/lb rate, both set per order */}
      <div className="mt-3 flex items-end gap-2 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Fiber lbs/yd</span>
          <input value={fiberLbs} onChange={(e) => { setFiberLbs(e.target.value); setSavedOk(false); }} placeholder="e.g. 4.5" inputMode="decimal" className="rounded-lg px-2 py-1.5 text-sm outline-none w-24" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Fiber $/lb</span>
          <input value={fiberRate} onChange={(e) => { setFiberRate(e.target.value); setSavedOk(false); }} placeholder={cp && cp.admixtures ? "sheet rate" : "e.g. 3.00"} inputMode="decimal" className="rounded-lg px-2 py-1.5 text-sm outline-none w-24" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
        </label>
        <button onClick={saveFiber} disabled={busy} className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: NAVY_DEEP, background: ORANGE, fontFamily: C.body }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Apply fiber
        </button>
        {(fiberLbs.trim() !== "" || fiberRate.trim() !== "") && (
          <button onClick={() => { setFiberLbs(""); setFiberRate(""); setTimeout(saveFiber, 0); }} disabled={busy} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "rgba(255,255,255,0.6)", background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>Clear</button>
        )}
      </div>
      <div className="text-white/35 text-[11px] mt-1">Fiber bill = lbs/yd × $/lb × yards. Liberty is 4.5 lbs/yd at $3.00/lb. Leave $/lb blank to use the Price-sheet rate; leave lbs/yd blank for no fiber.</div>

      {groupHead("Delivery cost — haul (internal)")}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Hauler</span>
          <select value={hauler} onChange={(e) => { setHauler(e.target.value); setSavedOk(false); }} className="rounded-lg px-2 py-1.5 text-sm outline-none" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
            <option value="">— pick —</option>
            {HAULERS.map((h) => <option key={h} value={h}>{h}</option>)}
            {hauler && !HAULERS.includes(hauler) && <option value={hauler}>{hauler}</option>}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Mileage (mi)</span>
          <input value={mileage} onChange={(e) => { setMileage(e.target.value); setSavedOk(false); }} placeholder="auto" inputMode="decimal" className="rounded-lg px-2 py-1.5 text-sm outline-none" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
        </label>
        {ro("Haul $/yd", dl ? money(dl.rate) : "…")}
        {ro("Haul total", dl ? money(dl.total) : "…")}
      </div>
      <div className="text-white/35 text-[11px] mt-1.5">Mileage auto-fills from the job address (Save to refresh); type a value to override. Rates come from the Price sheet.</div>

      {err && <div className="mt-2 rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>{err}</div>}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={saveDelivery} disabled={busy} className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: NAVY_DEEP, background: GREEN, fontFamily: C.body }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save delivery
        </button>
        {savedOk && <span className="text-xs flex items-center gap-1" style={{ color: GREEN, fontFamily: C.body }}><CheckCircle2 size={13} /> Saved</span>}
      </div>
      </>
      )}
    </div>
  );
}

// Flag any active orders that share the same delivery date AND time as another
// active order. This DOESN'T block anything — customers still book freely — it
// just tags each clashing order with `clash` (the other orders in that slot) so
// the dispatch board can highlight it and staff can call/reschedule.
function annotateClashes(orders) {
  const slots = {};
  for (const o of orders) {
    if (o.status === "complete" || !o.when || !o.time) continue;
    (slots[`${o.when}|${o.time}`] ||= []).push(o);
  }
  return orders.map((o) => {
    const group = slots[`${o.when}|${o.time}`];
    if (!group || group.length < 2) return o;
    const others = group.filter((x) => x.ref !== o.ref).map((x) => ({ ref: x.ref, customer: x.customer }));
    return { ...o, clash: others };
  });
}

// Editable yards for one pour load. A pour bills the SUM of its loads, so staff
// correct each load to what the truck actually poured. Commits on blur / Enter.
function LoadQtyInput({ qty, disabled, style, onSave }) {
  const [v, setV] = useState(String(qty ?? ""));
  useEffect(() => { setV(String(qty ?? "")); }, [qty]);
  const commit = () => {
    const t = v.trim();
    if (!t || t === String(qty)) { setV(String(qty ?? "")); return; }   // unchanged/blank — revert
    onSave(t);
  };
  return (
    <input
      value={v} disabled={disabled} inputMode="decimal" placeholder="yd"
      onChange={(e) => setV(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      title="Yards on this load — edit to the actual poured amount"
      className="rounded-lg px-1.5 py-1 text-xs outline-none w-full text-center disabled:opacity-50"
      style={style}
    />
  );
}

// The loads inside a continuous pour (>10 yd). Loads are added one at a time as
// each truck is batched/loaded; the card rolls them up. Keeps a big pour to one card.
function LoadsPanel({ o, trucks, onEdited }) {
  const drivers = useContext(DriversContext);
  const [busy, setBusy] = useState(null);   // seq (or "add") currently saving
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [nTruck, setNTruck] = useState("—");
  const [nDriver, setNDriver] = useState("");
  const [nQty, setNQty] = useState("10");
  const colors = truckColorMap(trucks);
  const total = parseFloat(o.qty) || 0;

  const wrap = async (key, fn) => {
    setBusy(key); setErr("");
    try { onEdited && onEdited(await fn()); }
    catch (e) { setErr(e.message || "Could not update"); }
    finally { setBusy(null); }
  };
  const upd = (seq, patch) => wrap(seq, () => updateLoad(o.ref, seq, patch));
  const del = (seq) => wrap(seq, () => removeLoad(o.ref, seq));
  const add = () => wrap("add", async () => {
    const r = await addLoad(o.ref, { truck: nTruck === "—" ? null : nTruck, driver: nDriver || null, qty: nQty || "10" });
    setAdding(false); setNTruck("—"); setNDriver(""); setNQty("10");
    return r;
  });

  // Each load carries its own batch ticket (one truck-load = one paper ticket).
  // One hidden picker, shared across rows; `ticketSeq` records which load it's for.
  const ticketRef = useRef(null);
  const [ticketSeq, setTicketSeq] = useState(null);
  const [tBusy, setTBusy] = useState(null);   // seq currently uploading/removing a ticket
  const pickTicket = (seq) => { setTicketSeq(seq); setErr(""); ticketRef.current?.click(); };
  const onTicketFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || ticketSeq == null) return;
    const seq = ticketSeq;
    setTBusy(seq); setErr("");
    try { onEdited && onEdited(await uploadLoadBatchTicket(o.ref, seq, file)); }
    catch (ex) { setErr(ex.message || "Upload failed"); }
    finally { setTBusy(null); setTicketSeq(null); }
  };
  const delTicket = async (seq) => {
    if (!window.confirm(`Remove the batch ticket for load #${seq}?`)) return;
    setTBusy(seq); setErr("");
    try { onEdited && onEdited(await deleteLoadBatchTicket(o.ref, seq)); }
    catch (ex) { setErr(ex.message); }
    finally { setTBusy(null); }
  };

  const selSt = { background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const setStatus = (status) => wrap("status", () => setOrderStatus(o.ref, status));
  const ordMeta = STATUS_META[o.status] || STATUS_META.scheduled;
  return (
    <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Overall pour status — a pour rolls up its loads, but staff still need to
          set the order's own stage (e.g. step it back to Scheduled). The per-load
          rows below track each truck separately. */}
      <label className="flex items-center justify-between gap-2 mb-2">
        <span className="text-white/45 text-[10px] uppercase tracking-wide shrink-0" style={{ fontFamily: C.body }}>Pour status</span>
        <select
          value={o.status} disabled={busy === "status"}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg px-2 py-1 text-xs outline-none disabled:opacity-50 cursor-pointer"
          style={{ ...selSt, color: ordMeta.color || "#fff" }}
        >
          {/* keep the order's current status selectable even if not an umbrella one (e.g. a stray "batched") */}
          {[...POUR_STATUSES, ...(POUR_STATUSES.includes(o.status) ? [] : [o.status])].map((sx) => <option key={sx} value={sx}>{STATUS_META[sx]?.label || sx}</option>)}
        </select>
      </label>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/45 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>
          Loads · {o.yards_loaded || 0}/{total} yd{o.loads_total ? ` · ${o.loads_done}/${o.loads_total} done` : ""}
        </span>
        <button onClick={() => { setAdding((a) => !a); setErr(""); }} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full active:scale-95" style={{ background: ORANGE + "22", color: ORANGE, fontFamily: C.body }}>
          <Plus size={12} /> Add load
        </button>
      </div>
      <input ref={ticketRef} type="file" accept="application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.heic" onChange={onTicketFile} className="hidden" />
      {(o.loads || []).map((ld) => {
        const meta = STATUS_META[ld.status] || STATUS_META.scheduled;
        const dot = ld.truck && ld.truck !== "—" ? colors[ld.truck] : "rgba(255,255,255,0.2)";
        return (
          <div key={ld.seq} className="mb-1.5">
            <div className="grid gap-1.5 items-center" style={{ gridTemplateColumns: "26px 44px minmax(0,82px) minmax(0,82px) minmax(0,1fr) 18px", maxWidth: 460 }}>
              <span className="text-xs flex items-center gap-1" style={{ color: "#fff", fontFamily: C.body }}>
                <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                #{ld.seq}
              </span>
              <LoadQtyInput qty={ld.qty} disabled={busy === ld.seq} style={selSt} onSave={(q) => upd(ld.seq, { qty: q })} />
              <select value={ld.truck} disabled={busy === ld.seq} onChange={(e) => upd(ld.seq, { truck: e.target.value })} className="rounded-lg px-1.5 py-1 text-xs outline-none disabled:opacity-50 cursor-pointer" style={selSt}>
                <option value="—">Unassigned</option>
                {trucks.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
              {/* Each load carries its own driver (one truck-load = one driver). Send "" to clear (the backend only clears on empty). */}
              <select value={ld.driver && ld.driver !== "—" ? ld.driver : ""} disabled={busy === ld.seq} onChange={(e) => upd(ld.seq, { driver: e.target.value })} className="rounded-lg px-1.5 py-1 text-xs outline-none disabled:opacity-50 cursor-pointer" style={selSt}>
                <option value="">Driver</option>
                {drivers.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={ld.status} disabled={busy === ld.seq} onChange={(e) => upd(ld.seq, { status: e.target.value })} className="rounded-lg px-1.5 py-1 text-xs outline-none disabled:opacity-50 cursor-pointer" style={{ ...selSt, color: meta.color || "#fff" }}>
                {ORDER_STATUSES.filter((sx) => sx !== "requested" && sx !== "ongoing").map((sx) => <option key={sx} value={sx}>{STATUS_META[sx]?.label || sx}</option>)}
              </select>
              <button onClick={() => del(ld.seq)} disabled={busy === ld.seq} title="Remove load" className="p-1 rounded active:scale-90 disabled:opacity-50" style={{ background: "rgba(239,83,80,0.12)" }}><X size={12} color="#ff8a85" /></button>
            </div>
            {/* this load's own batch ticket */}
            <div className="flex items-center gap-1.5 flex-wrap mt-1" style={{ paddingLeft: 60 }}>
              {ld.has_batch_ticket ? (
                <>
                  <button onClick={() => openLoadBatchTicket(o.ref, ld.seq).catch((e) => setErr(e.message))} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md active:scale-95" style={{ color: GREEN, background: GREEN + "1a", border: `1px solid ${GREEN}55`, fontFamily: C.body }}>
                    <FileText size={11} /> Ticket
                  </button>
                  {ld.has_original && (
                    <button onClick={() => openLoadBatchTicket(o.ref, ld.seq, "original").catch((e) => setErr(e.message))} title="Open the original scan/photo" className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md active:scale-95" style={{ color: "rgba(255,255,255,0.6)", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
                      <FileText size={11} /> Original
                    </button>
                  )}
                  <button onClick={() => pickTicket(ld.seq)} disabled={tBusy === ld.seq} className="text-[11px] font-semibold px-2 py-0.5 rounded-md active:scale-95 disabled:opacity-50" style={{ color: "rgba(255,255,255,0.6)", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
                    {tBusy === ld.seq ? <Loader2 size={11} className="animate-spin" /> : "Replace"}
                  </button>
                  <button onClick={() => delTicket(ld.seq)} disabled={tBusy === ld.seq} title="Remove this load's ticket" className="p-1 rounded-md active:scale-90 disabled:opacity-50" style={{ background: "rgba(239,83,80,0.1)" }}><Trash2 size={11} color="#ff8a85" /></button>
                </>
              ) : (
                <button onClick={() => pickTicket(ld.seq)} disabled={tBusy === ld.seq} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md active:scale-95 disabled:opacity-50" style={{ color: "#fff", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>
                  {tBusy === ld.seq ? <><Loader2 size={11} className="animate-spin" /> Converting…</> : <><Plus size={11} /> Add ticket</>}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {adding && (
        <div className="grid gap-1.5 mb-1 items-center" style={{ gridTemplateColumns: "minmax(0,100px) minmax(0,100px) 50px auto", maxWidth: 460 }}>
          <select value={nTruck} onChange={(e) => setNTruck(e.target.value)} className="rounded-lg px-1.5 py-1 text-xs outline-none cursor-pointer" style={selSt}>
            <option value="—">Pick truck…</option>
            {trucks.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
          <select value={nDriver} onChange={(e) => setNDriver(e.target.value)} className="rounded-lg px-1.5 py-1 text-xs outline-none cursor-pointer" style={selSt}>
            <option value="">Driver…</option>
            {drivers.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input value={nQty} onChange={(e) => setNQty(e.target.value)} inputMode="decimal" placeholder="yd" className="rounded-lg px-1.5 py-1 text-xs outline-none w-full" style={selSt} />
          <button onClick={add} disabled={busy === "add"} className="text-xs font-bold px-2.5 py-1 rounded-lg active:scale-95 disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>{busy === "add" ? "…" : "Add"}</button>
        </div>
      )}
      {(o.loads || []).length === 0 && !adding && (
        <div className="text-white/30 text-xs py-0.5" style={{ fontFamily: C.body }}>No loads yet — tap “Add load” as each truck is batched.</div>
      )}
      {err && <div className="text-[11px] mt-1" style={{ color: "#ff8a85", fontFamily: C.body }}>{err}</div>}
    </div>
  );
}

function OrderRow({ o, trucks, onStatus, onAssign, onCancel, onEdited, onCreated, onArchived, onDriver, compact }) {
  // `compact` (Upcoming column): a leaner card for future orders — keep Status,
  // Truck, Edit and Cancel; drop the Driver picker, "Order again" and "Ticket
  // details" (all day-of tasks) to cut the clutter.
  const canFinance = useContext(FinanceContext);   // workers don't see COD/payment bits
  const drivers = useContext(DriversContext);
  const clash = o.clash && o.clash.length ? o.clash : null;   // shares a date+time with another order
  const pct = Math.round((o.progress || 0) * 100);
  // Staff controls drive the backend, which can reject a move (e.g. setting a
  // load-carrying stage with no truck → 409). Track per-row busy/error so one
  // row's failed change doesn't block the others or the live polling.
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showEdit, setShowEdit] = useState(false);   // staff "Edit order" modal
  const [showReorder, setShowReorder] = useState(false);   // "Order again" — new order pre-filled from this one
  const [showBatch, setShowBatch] = useState(false);       // "Ticket details" — full batch-ticket form panel
  const [showSigned, setShowSigned] = useState(false);     // signed delivery ticket (proof of delivery)
  const [expanded, setExpanded] = useState(false);   // compact (Upcoming) rows: collapsed to just client + yardage; "Manage" reveals the controls

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

  // Batch ticket (PDF) upload — allowed on any single delivery, at any stage.
  // Pours don't use an order-level ticket: each load carries its own (see
  // LoadsPanel), so one paper ticket per truck-load.
  const fileRef = useRef(null);
  const batchable = !o.is_pour;
  // Legacy order: a pour (every order is one now) with no loads but an order-level
  // ticket uploaded before load-tracking. Surface it so staff can still open it —
  // but don't offer order-level upload on pours (new tickets go on each load).
  const showLegacyTicket = o.is_pour && (o.loads || []).length === 0 && o.has_batch_ticket;
  const onPickTicket = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";   // let them re-pick the same file later
    if (!file) return;
    setBusy(true); setErr("");
    try { onEdited && onEdited(await uploadBatchTicket(o.ref, file)); }
    catch (ex) { setErr(ex.message || "Upload failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: clash ? "rgba(245,165,36,0.10)" : (o.status === "requested" ? ORANGE + "1f" : NAVY), border: `1px solid ${clash ? WARN : (o.status === "requested" ? ORANGE : "rgba(255,255,255,0.06)")}`, borderLeft: clash ? `4px solid ${WARN}` : (o.status === "requested" ? `4px solid ${ORANGE}` : (o.prepay_required ? "3px solid #6aa9ff" : undefined)) }}>
      {clash && (
        <div className="mb-2.5 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5" style={{ background: "rgba(245,165,36,0.14)", border: `1px solid ${WARN}` }}>
          <AlertTriangle size={13} color={WARN} className="mt-0.5 shrink-0" />
          <span className="text-[11px] font-semibold" style={{ color: WARN, fontFamily: C.body }}>
            Double-booked — same slot ({o.time}) as {clash.map((c) => `${c.ref} (${c.customer})`).join(", ")}. Call or reschedule.
          </span>
        </div>
      )}
      {o.arrival_pending && (
        <div className="mb-2.5 rounded-lg px-2.5 py-2" style={{ background: GREEN + "1a", border: `1px solid ${GREEN}` }}>
          <div className="flex items-start gap-1.5">
            <MapPin size={13} color={GREEN} className="mt-0.5 shrink-0" />
            <span className="text-[11px] font-semibold" style={{ color: GREEN, fontFamily: C.body }}>
              {o.truck} looks parked at the job site — mark it On site?
            </span>
          </div>
          <button onClick={() => run(onStatus, "onsite")} disabled={busy} className="w-full mt-1.5 rounded-lg py-1.5 text-xs font-bold active:scale-95 disabled:opacity-50" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
            {busy ? "…" : "Confirm On site"}
          </button>
        </div>
      )}
      {compact ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div style={{ fontFamily: C.cond }} className="text-white text-lg font-bold leading-tight truncate">{o.customer}</div>
            <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-0.5 text-[11px] font-semibold flex items-center gap-0.5 active:scale-95" style={{ color: ORANGE, fontFamily: C.body }}>
              {expanded ? "Hide details" : "Manage"} <ChevronRight size={11} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
            </button>
          </div>
          <div style={{ color: ORANGE, fontFamily: C.cond }} className="text-2xl font-bold leading-none shrink-0">{o.qty}<span className="text-white/40 text-sm font-semibold ml-0.5">yd</span></div>
        </div>
      ) : (
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{o.ref}</span>
            {canFinance && o.prepay_required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: o.prepaid ? GREEN + "22" : "#6aa9ff22", color: o.prepaid ? GREEN : "#6aa9ff", fontFamily: C.body }}>{o.prepaid ? "COD · PAID" : "COD · UNPAID"}</span>}
            {o.has_signature && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: GREEN + "22", color: GREEN, fontFamily: C.body }}><CheckCircle2 size={10} /> SIGNED</span>}
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Clock size={12} /> {[formatOrderDate(o.when), o.time].filter(Boolean).join(" · ")}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Truck size={12} /> {o.truck}</span>
            {o.driver && o.driver !== "—" && (<><span className="text-white/30 text-xs">·</span><span className="text-white/60 text-xs flex items-center gap-1"><User size={12} /> {o.driver}</span></>)}
          </div>
          {compact ? (
            <>
              <div style={{ fontFamily: C.cond }} className="text-white text-base font-bold leading-tight mt-0.5 truncate">{o.customer}</div>
              <div className="text-white/55 text-xs truncate">{[o.project || o.site, o.mix].filter(Boolean).join(" · ")}</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: C.cond }} className="text-white text-base font-semibold leading-tight mt-0.5 truncate">{o.project || o.site}</div>
              {o.project && <div className="text-white/45 text-xs truncate flex items-center gap-1"><MapPin size={12} /> {o.site}</div>}
              <div className="text-white/50 text-sm truncate">{o.customer} · {o.mix}</div>
            </>
          )}
          {orderExtras(o) && <div className="text-white/40 text-xs mt-0.5 truncate">{orderExtras(o)}</div>}
          {o.use_for && <div className="text-white/40 text-xs mt-0.5 truncate">For: {o.use_for}</div>}
          {o.notes && <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#6aa9ff" }}><FileText size={11} /> {o.notes}</div>}
        </div>
        <div className="text-right shrink-0">
          {o.is_pour ? (
            // Pour: requested (ordered) vs actual (yards loaded so far / delivered).
            <div className="leading-none">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-white/40 text-[9px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Req</span>
                <span style={{ color: "rgba(255,255,255,0.85)", fontFamily: C.cond }} className="text-base font-bold">{o.qty}</span>
              </div>
              <div className="flex items-baseline justify-end gap-1 mt-0.5">
                <span className="text-white/40 text-[9px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Actual</span>
                <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-xl font-bold">{fmtYards(o.yards_loaded || 0)}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: ORANGE, fontFamily: C.cond }} className="text-xl font-bold leading-none">{o.qty}</div>
          )}
          <div className="mt-1"><StatusPill status={o.status} /></div>
        </div>
      </div>
      )}
      {(!compact || expanded) && (
      <>
      {/* progress bar — only meaningful once a truck is rolling */}
      {(o.status === "enroute" || o.status === "batched" || o.status === "onsite") && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: o.status === "onsite" ? GREEN : ORANGE }} />
          </div>
          <div className="text-white/35 text-[11px] mt-1" style={{ fontFamily: C.body }}>{o.status === "onsite" ? "On site" : `${pct}% to site`}</div>
        </div>
      )}

      {/* staff controls — a pour shows its loads; a single delivery shows one set */}
      {o.is_pour ? (
        <LoadsPanel o={o} trucks={trucks} onEdited={onEdited} />
      ) : (
      <>
      <div className={`mt-2 pt-2 grid ${onDriver && !compact ? "grid-cols-3" : "grid-cols-2"} gap-1.5`} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <label className="flex flex-col gap-0.5">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Status</span>
          <select
            value={o.status} disabled={busy}
            onChange={(e) => run(onStatus, e.target.value)}
            className="rounded-lg px-2 py-1 text-sm outline-none disabled:opacity-50 cursor-pointer"
            style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
          >
            {ORDER_STATUSES.filter((s) => s !== "ongoing").map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Truck</span>
          <select
            value={o.truck} disabled={busy}
            onChange={(e) => run(onAssign, e.target.value)}
            className="rounded-lg px-2 py-1 text-sm outline-none disabled:opacity-50 cursor-pointer"
            style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
          >
            <option value="—">Unassigned</option>
            {trucks.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
        </label>
        {onDriver && !compact && (
          <label className="flex flex-col gap-0.5">
            <span className="text-white/40 text-[10px] uppercase tracking-wide" style={{ fontFamily: C.body }}>Driver</span>
            <select
              value={o.driver || "—"} disabled={busy}
              onChange={(e) => run(onDriver, e.target.value)}
              className="rounded-lg px-2 py-1 text-sm outline-none disabled:opacity-50 cursor-pointer"
              style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}
            >
              <option value="—">Unassigned</option>
              {drivers.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        )}
      </div>
      {!compact && (
        <button
          onClick={async () => { setBusy(true); setErr(""); try { onEdited && onEdited(await addLoad(o.ref, { truck: o.truck && o.truck !== "—" ? o.truck : null })); } catch (e) { setErr(e.message); } finally { setBusy(false); } }}
          disabled={busy}
          title="Track this delivery as loads — splits it into per-truck loads with their own GPS, status and batch ticket"
          className="mt-1.5 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
          style={{ color: ORANGE, background: ORANGE + "1a", border: `1px solid ${ORANGE}55`, fontFamily: C.body }}
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Start loading (split into loads)
        </button>
      )}
      </>
      )}
      {canFinance && o.prepay_required && <CodControls o={o} />}
      {(batchable || showLegacyTicket) && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept="application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.heic" onChange={onPickTicket} className="hidden" />
          {o.has_batch_ticket ? (
            <>
              <button onClick={() => openBatchTicket(o.ref).catch((e) => setErr(e.message))} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform" style={{ color: GREEN, background: GREEN + "1a", border: `1px solid ${GREEN}55`, fontFamily: C.body }}>
                <FileText size={12} /> Batch ticket
              </button>
              {o.has_original && (
                <button onClick={() => openBatchTicket(o.ref, "original").catch((e) => setErr(e.message))} title="Open the original scan/photo you uploaded" className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform" style={{ color: "rgba(255,255,255,0.65)", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
                  <FileText size={12} /> Original
                </button>
              )}
              {o.has_print_ticket && (
                <button onClick={() => openBatchTicket(o.ref, "print").catch((e) => setErr(e.message))} title="Open the printer-friendly (light) version" className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform" style={{ color: ORANGE, background: ORANGE + "1a", border: `1px solid ${ORANGE}55`, fontFamily: C.body }}>
                  <Printer size={12} /> Print
                </button>
              )}
              <button onClick={() => fileRef.current?.click()} disabled={busy} className="text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "rgba(255,255,255,0.6)", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
                {busy ? <Loader2 size={12} className="animate-spin" /> : "Replace"}
              </button>
              <button onClick={async () => { if (!window.confirm(`Remove the batch ticket for ${o.ref}?`)) return; setBusy(true); setErr(""); try { onEdited && onEdited(await deleteBatchTicket(o.ref)); } catch (ex) { setErr(ex.message); } finally { setBusy(false); } }} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "#ff8a85", background: "rgba(239,83,80,0.1)", fontFamily: C.body }}>
                <Trash2 size={12} /> Remove
              </button>
            </>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "#fff", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>
              {busy ? <><Loader2 size={12} className="animate-spin" /> Converting…</> : <><Plus size={12} /> Add batch ticket (PDF or photo)</>}
            </button>
          )}
        </div>
      )}
      {err && (
        <div className="mt-2 rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>
          {err}
        </div>
      )}
      <div className="mt-2 flex justify-end gap-2 flex-wrap">
        {o.has_signature && (
          <button onClick={() => setShowSigned(true)} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform" style={{ color: GREEN, background: GREEN + "1a", border: `1px solid ${GREEN}55`, fontFamily: C.body }}>
            <CheckCircle2 size={12} /> Signed ticket
          </button>
        )}
        {onArchived && o.status === "complete" && (
          <button onClick={async () => { setBusy(true); setErr(""); try { onArchived(await setOrderArchived(o.ref, !o.archived)); } catch (e) { setErr(e.message); } finally { setBusy(false); } }} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "rgba(255,255,255,0.7)", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
            <Inbox size={12} /> {o.archived ? "Unarchive" : "Archive"}
          </button>
        )}
        {!compact && (
          <button onClick={() => setShowReorder(true)} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: NAVY_DEEP, background: ORANGE, fontFamily: C.body }}>
            <Plus size={12} /> Order again
          </button>
        )}
        {!compact && (
          <button onClick={() => setShowBatch((v) => !v)} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: showBatch ? NAVY_DEEP : "#fff", background: showBatch ? GREEN : NAVY_DEEP, border: showBatch ? "none" : "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>
            <ClipboardList size={12} /> Ticket details
          </button>
        )}
        <button onClick={() => setShowEdit(true)} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "#fff", background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}>
          <FileText size={12} /> Edit order
        </button>
        <button onClick={cancel} disabled={busy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50" style={{ color: "#ff8a85", background: "rgba(239,83,80,0.1)", fontFamily: C.body }}>
          <X size={12} /> Cancel order
        </button>
      </div>
      </>
      )}
      {showBatch && <BatchTicketForm o={o} onEdited={onEdited} />}
      {showSigned && <DeliveryTicketModal order={o} onClose={() => setShowSigned(false)} />}
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
    <div className={"rounded-2xl p-4 min-w-0" + (fill ? " flex flex-col min-h-0 h-full" : "")} style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
      {title && (
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <Icon size={16} color={ORANGE} />
          <h2 style={{ fontFamily: C.cond }} className="text-white text-lg font-bold">{title}</h2>
          {count != null && <span className="text-white/40 text-sm" style={{ fontFamily: C.body }}>({count})</span>}
        </div>
      )}
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

// Desktop texting helper: copy the invite to the clipboard and open Google
// Messages for web (paired to the dispatch phone) in a new tab — staff paste it
// into a new text, sent from the dispatch number. Google's web app can't be
// pre-filled with a recipient/body, so copy + open is the best we can do.
function copyAndOpenMessages(text) {
  try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
  window.open("https://messages.google.com/web", "_blank", "noopener");
}

// Staff tool: create or reset the login a customer uses to see their own orders
// & billing, then text them an invite. Lives in the dispatch board's right column.
function CustomerLogins({ orders = [], trucks = [], onReordered }) {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState(null);        // selected customer id
  const [reorder, setReorder] = useState(null);   // a past order to "Order again" for this customer
  const [emailVal, setEmailVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("");   // pre-filled from the customer's QuickBooks phone, used for the invite text
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);        // { ok, text }
  const [invite, setInvite] = useState(null);  // { id, name, phone, sms, text } after create
  const [copied, setCopied] = useState(false);
  const [smsAuto, setSmsAuto] = useState(false);   // app can send texts itself (Twilio)
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [codOnly, setCodOnly] = useState(false);   // filter list to COD customers

  const [syncing, setSyncing] = useState(false);
  const load = async () => {
    try { setCustomers(await getCustomers()); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  const syncNow = async () => {
    setSyncing(true);
    try { await syncBilling(); await load(); setMsg({ ok: true, text: "Synced with QuickBooks." }); }
    catch (e) { setMsg({ ok: false, text: "Sync failed: " + e.message }); }
    finally { setSyncing(false); }
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
    setEmailVal(c.login_email || (c.email || "").split(",")[0].trim() || "");   // pre-fill with the QuickBooks email (first if several) when no login yet
    setPhoneVal(c.contact || "");   // pre-fill the phone from QuickBooks, like the email
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
      const r = await setCustomerLogin(sel, emailVal.trim(), password, phoneVal.trim());
      const appUrl = window.location.origin;
      const text = `Hi ${cust.name} — Aussieblock has an app for ordering and tracking your concrete deliveries, and paying invoices online. You can place orders, track the trucks live, and view your account. Open ${appUrl} and sign in — email: ${r.email}, password: ${password}. Call or text us at ${DISPATCH_PHONE}. Add it to your phone's home screen (quick steps): ${appUrl}/add-to-home-screen.pdf`;
      const invitePhone = phoneVal.trim() || cust.contact;
      setInvite({ id: cust.id, name: cust.name, phone: invitePhone, sms: toSmsNumber(invitePhone), text });
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
      setEmailVal(""); setPhoneVal(""); setPw("");
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
  // Staff history/reorder tool — show ALL of this customer's completed orders,
  // including archived ones (archiving only declutters the board + customer app).
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
      {/* Sync with QuickBooks on demand (billing also auto-syncs when opened) */}
      <button onClick={syncNow} disabled={syncing} className="w-full flex items-center justify-center gap-2 rounded-xl py-2 mb-2 text-sm font-semibold active:scale-[0.99] transition-transform disabled:opacity-60" style={{ background: NAVY, color: ORANGE, border: `1px solid ${ORANGE}55`, fontFamily: C.body }}>
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> {syncing ? "Syncing with QuickBooks…" : "Sync QuickBooks now"}
      </button>
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
            value={phoneVal}
            onChange={(e) => setPhoneVal(e.target.value)}
            placeholder="customer phone (for the invite text)"
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
            ) : !IS_MOBILE ? (
              // Desktop/laptop: copy the message + open Google Messages for web.
              <button onClick={() => { copyAndOpenMessages(invite.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                <Send size={14} /> Copy & open Messages
              </button>
            ) : invite.sms ? (
              // Phone: open the messaging app pre-filled.
              <a href={`sms:${invite.sms}?body=${encodeURIComponent(invite.text)}`} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                <Send size={14} /> Text invite
              </a>
            ) : (
              <div className="flex-1 rounded-lg py-2 text-center text-xs text-white/40" style={{ fontFamily: C.body }}>No phone on file</div>
            )}
            <button onClick={() => { navigator.clipboard?.writeText(invite.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-semibold active:scale-[0.98] transition-transform" style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
              {copied ? <CheckCircle2 size={14} color={GREEN} /> : <Download size={14} />} {copied ? "Copied" : "Copy text"}
            </button>
          </div>
          <div className="text-white/35 text-[11px] mt-2" style={{ fontFamily: C.body }}>{smsAuto ? "\"Send text\" texts the customer automatically from your business number." : !IS_MOBILE ? "Copies the message and opens Google Messages (paired to your dispatch phone) — paste it into a new text. Sent from your dispatch number." : "\"Text invite\" opens your phone's messaging app with the message ready — just hit send."}</div>
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
  const [fuelVehicle, setFuelVehicle] = useState("");
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
      const r = await addTruck(label.trim(), device.trim(), notes.trim(), fuelVehicle.trim());
      setMsg({ ok: true, text: `Truck ${r.action}: ${r.label}` });
      setLabel(""); setDevice(""); setFuelVehicle(""); setNotes("");
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
                  <button onClick={() => { setLabel(t.label); setDevice(t.device || ""); setFuelVehicle(t.fuel_vehicle || ""); setNotes(t.notes || ""); }} className="min-w-0 flex-1 text-left">
                    <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{t.label}</div>
                    <div className="text-white/40 text-xs truncate">{t.device ? `GPS: ${t.device}` : "No GPS device"}{t.fuel_vehicle ? ` · Fuel: ${t.fuel_vehicle}` : ""}</div>
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
            <input value={fuelVehicle} onChange={(e) => setFuelVehicle(e.target.value)} placeholder="Fuel meter truck # (optional)" className={inCls + " mb-2"} style={inSt} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (driver, capacity, maintenance…)" className={inCls + " mb-1 resize-none"} style={inSt} />
            <p className="text-white/35 text-xs mb-2">Tap a truck above to edit it. GPS ID turns on live tracking (optional). Fuel fills match this truck by its name/number automatically — set a fuel meter # only if the meter reports a different number.</p>
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

// Staff modal: fuel usage per truck, pulled from FluidSecure. Tap a truck to see
// its individual fills. Vehicle numbers with no truck mapped show under "Unmatched"
// — map that number on the truck (Manage trucks) to pull those fills in.
function FuelModal({ onClose }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [openLabel, setOpenLabel] = useState(null);   // truck whose fills are expanded
  const [fills, setFills] = useState(null);           // fills for the expanded truck
  const [loadingFills, setLoadingFills] = useState(false);

  const load = async () => {
    try { setData(await getFuel()); setErr(""); } catch (e) { setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (label) => {
    if (openLabel === label) { setOpenLabel(null); setFills(null); return; }
    setOpenLabel(label); setFills(null); setLoadingFills(true);
    try { setFills((await getTruckFuel(label)).fills); }
    catch (e) { setErr(e.message); }
    finally { setLoadingFills(false); }
  };

  const totalGal = data ? data.trucks.reduce((a, t) => a + (t.gallons || 0), 0) : 0;
  const card = { background: NAVY, border: "1px solid rgba(255,255,255,0.06)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Droplets size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Fuel usage</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {!data && !err && <div className="text-white/50 text-sm py-6 text-center flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading fuel data…</div>}
          {err && <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}

          {data && (
            <>
              <div className="mb-3">
                <div className="text-white/50 text-xs uppercase tracking-wide">Total fuel — all trucks</div>
                <div className="text-white text-2xl font-bold" style={{ fontFamily: C.cond }}>{totalGal.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-white/50 text-base font-normal">gal</span></div>
              </div>

              {data.trucks.length === 0 ? (
                <div className="text-white/40 text-sm py-4 text-center mb-3" style={{ ...card, borderRadius: 12 }}>No trucks yet.</div>
              ) : (
                <div className="mb-3">
                  {data.trucks.map((t) => (
                    <div key={t.label} className="rounded-lg mb-1.5 overflow-hidden" style={card}>
                      <button onClick={() => t.fills > 0 && toggle(t.label)} className="w-full flex items-center justify-between px-3 py-2.5 text-left">
                        <div className="min-w-0">
                          <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{t.label}</div>
                          <div className="text-white/40 text-xs truncate">
                            {t.fills > 0 ? `${t.fills} fill${t.fills === 1 ? "" : "s"}` : "No fills yet"}
                            {t.last_fill ? ` · last ${timeAgo(t.last_fill)}` : ""}
                            {t.last_odometer != null ? ` · ${Number(t.last_odometer).toLocaleString()} odo` : ""}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-white font-bold" style={{ fontFamily: C.cond }}>{(t.gallons || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                          <div className="text-white/40 text-[11px]">gal</div>
                        </div>
                      </button>
                      {openLabel === t.label && (
                        <div className="px-3 pb-2.5 pt-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          {loadingFills ? (
                            <div className="text-white/40 text-xs py-2 flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Loading…</div>
                          ) : !fills || fills.length === 0 ? (
                            <div className="text-white/40 text-xs py-2">No fills recorded.</div>
                          ) : (
                            fills.map((f, i) => (
                              <div key={i} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: i < fills.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                                <span className="text-white/55">{f.when ? formatOrderDate(f.when) : "—"}{f.fuel_type ? ` · ${f.fuel_type}` : ""}{f.driver ? ` · ${f.driver}` : ""}{f.odometer != null ? ` · ${Number(f.odometer).toLocaleString()} odo` : ""}</span>
                                <span className="text-white font-semibold shrink-0 ml-2">{(f.gallons || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} gal</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {data.unmatched.fills > 0 && (
                <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,170,60,0.10)", border: "1px solid rgba(255,170,60,0.25)" }}>
                  <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: ORANGE }}><AlertTriangle size={13} /> {data.unmatched.fills} fill{data.unmatched.fills === 1 ? "" : "s"} ({data.unmatched.gallons.toLocaleString(undefined, { maximumFractionDigits: 1 })} gal) not matched to a truck</div>
                  {data.unmatched.vehicles.length > 0 && (
                    <div className="text-white/55 text-[11px] mt-1">Vehicle #s: {data.unmatched.vehicles.join(", ")} — set the matching number on a truck in <span className="font-semibold">Manage trucks</span> to pull these in.</div>
                  )}
                </div>
              )}

              <p className="text-white/35 text-[11px] mt-3">Fuel fills arrive automatically from the on-truck meters. A fill that doesn't match a truck shows above — set that number on a truck in <span className="font-semibold">Manage trucks</span> to pull it in.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Staff modal: mixer-drum telemetry. Each truck's on-board sensor POSTs one
// summary per load to /api/mixer/load; this lists them newest-first, filterable
// by truck. Read-only — the data flows in from the trucks, not the app.
function MixerModal({ onClose }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [resetting, setResetting] = useState("");   // `${truck}:${metric}` while a reset is in flight

  const load = async () => {
    try { setRows(await getMixerReadings({ limit: 500 })); setErr(""); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  // Zero a truck's water or drum total (display only — readings/ticket water stay).
  const doReset = async (truck, metric) => {
    const label = metric === "water" ? "water (gallons)" : "drum (revolutions)";
    if (!window.confirm(`Reset the ${label} total shown for ${truck} to 0?\n\nThis only clears the number on this screen — it won't change any saved load or batch ticket.`)) return;
    setResetting(`${truck}:${metric}`); setErr("");
    try { await resetMixerTotal(truck, metric); await load(); }
    catch (e) { setErr(e.message); }
    finally { setResetting(""); }
  };

  // One card per truck, always: collapse the reading log to each truck's LATEST
  // reading (rows come newest-first, so the first one seen per truck is newest).
  const latest = rows ? Object.values(rows.reduce((acc, r) => {
    const k = r.truck || "—";
    if (!acc[k]) acc[k] = r;
    return acc;
  }, {})).sort((a, b) => (a.truck || "").localeCompare(b.truck || "")) : [];
  const num = (v, d = 0) => (v == null ? "—" : Number(v).toLocaleString(undefined, { maximumFractionDigits: d }));
  const card = { background: NAVY, border: "1px solid rgba(255,255,255,0.06)" };
  const metric = (label, value, unit) => (
    <div className="min-w-0">
      <div className="text-white/40 text-[10px] uppercase tracking-wide truncate">{label}</div>
      <div className="text-white text-sm font-semibold" style={{ fontFamily: C.cond }}>{value}{unit && value !== "—" ? <span className="text-white/45 text-[11px] font-normal"> {unit}</span> : ""}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Activity size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Mixer telemetry</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {!rows && !err && <div className="text-white/50 text-sm py-6 text-center flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading readings…</div>}
          {err && <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}

          {rows && (
            <>
              {latest.length === 0 ? (
                <div className="text-white/40 text-sm py-6 text-center" style={{ ...card, borderRadius: 12 }}>No mixer readings yet. Each truck's sensor sends one per load.</div>
              ) : (
                latest.map((r) => (
                  <div key={r.truck || "—"} className="rounded-lg mb-1.5 p-3" style={card}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{r.truck || "—"}</div>
                      <div className="text-white/40 text-xs shrink-0 ml-2">{r.received_at ? timeAgo(r.received_at) : (r.ended_at ? timeAgo(r.ended_at) : "—")}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-2">
                      {metric("Water", num(r.gallons, 1), "gal")}
                      {metric("Total revs", num(r.total_revs), "")}
                      {metric("Temp", num(r.mix_temp_f, 1), "°F")}
                      {metric("Avg RPM", num(r.avg_rpm, 1), "")}
                      {metric("Max RPM", num(r.max_rpm, 1), "")}
                      {metric("Pressure", num(r.pressure_idx_avg, 2), "")}
                    </div>
                    <div className="text-white/30 text-[10px] mt-2 truncate">last load {r.load_uid}{r.fw ? ` · fw ${r.fw}` : ""}{r.charge_revs != null || r.discharge_revs != null ? ` · chg ${num(r.charge_revs)}/dis ${num(r.discharge_revs)}` : ""}</div>
                    <div className="flex items-center gap-2 mt-2.5 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-white/30 text-[10px] uppercase tracking-wide mr-auto">Reset total</span>
                      <button onClick={() => doReset(r.truck, "water")} disabled={!!resetting} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold active:scale-95 transition-transform disabled:opacity-50" style={{ background: "rgba(255,255,255,0.06)", color: "#cfe0ff", border: "1px solid rgba(255,255,255,0.10)" }}>
                        {resetting === `${r.truck}:water` ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} Water
                      </button>
                      <button onClick={() => doReset(r.truck, "drum")} disabled={!!resetting} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold active:scale-95 transition-transform disabled:opacity-50" style={{ background: "rgba(255,255,255,0.06)", color: "#cfe0ff", border: "1px solid rgba(255,255,255,0.10)" }}>
                        {resetting === `${r.truck}:drum` ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} Drum
                      </button>
                    </div>
                  </div>
                ))
              )}

              <p className="text-white/35 text-[11px] mt-3">One card per truck, showing its most recent load. Readings arrive automatically from each truck's mixer sensor; a card appears once the device's truck # matches a truck's name in <span className="font-semibold">Manage trucks</span>.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Staff modal: add/reset/remove office logins — workers (concrete crew / TxDOT
// engineers, no financials) and full staff — then text them their invite. Mirrors
// the customer-login flow (ManageTrucksModal layout + CustomerLogins invite box).
// Full-staff only; the board only renders the button for finance users.
function ManageStaffModal({ onClose }) {
  const [staff, setStaff] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);   // merged driver names (logins + name-only roster)
  const [companies, setCompanies] = useState([]);   // customer names, for the "who they work for" suggestions
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("worker");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState("");   // the company a worker belongs to (a real customer id) — scopes what they see
  const [project, setProject] = useState("");       // their current project/job
  const [driverName, setDriverName] = useState(""); // for a driver login: their name (matches Order.driver)
  const [editing, setEditing] = useState(false);   // editing an existing login (locks the email field)
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);            // { ok, text }
  const [invite, setInvite] = useState(null);      // { email, phone, sms, text } after create
  const [smsAuto, setSmsAuto] = useState(false);   // app can send texts itself (Twilio)
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const load = async () => {
    try { setStaff(await listStaff()); } catch (e) { setMsg({ ok: false, text: e.message }); }
    try { setAllDrivers(await getDrivers()); } catch { /* drivers list is best-effort */ }
  };
  useEffect(() => {
    load();
    getSmsEnabled().then((r) => setSmsAuto(!!r.enabled)).catch(() => {});
    getCustomers().then((cs) => setCompanies(cs.map((c) => ({ id: c.id, name: c.name })))).catch(() => {});   // the company a worker belongs to
  }, []);

  const reset = () => { setEmail(""); setPw(""); setRole("worker"); setPhone(""); setCompanyId(""); setProject(""); setDriverName(""); setEditing(false); };

  // Auto-generate an email + password for a worker so the office doesn't have to
  // invent one. These are just login ids (workers never type them — they use the
  // tap-to-login link), so a random handle is fine.
  const fillWorker = () => {
    const rand = () => Math.random().toString(36).slice(2, 8);
    setRole("worker");
    setEmail(`crew-${rand()}@texausrock.com`);
    setPw(`crew${rand()}`);
  };

  const pick = (u) => {
    setEmail(u.email); setPw(""); setRole(u.role); setPhone(u.phone || "");
    setCompanyId(u.customer_id || ""); setProject(u.project || "");
    setDriverName(u.role === "driver" ? (u.company || "") : "");
    setEditing(true); setMsg(null); setInvite(null);
  };

  const submit = async () => {
    if (role === "worker" || role === "customer") {
      if (!companyId) { setMsg({ ok: false, text: "Pick the company this person belongs to." }); return; }
    }
    if (role === "driver" && !driverName.trim()) { setMsg({ ok: false, text: "Enter the driver's name (must match the name on their orders)." }); return; }
    setBusy(true); setMsg(null);
    try {
      // Driver with no email → name-only roster entry (assignable, no tablet login).
      if (role === "driver" && !email.trim()) {
        await addDriver(driverName.trim());
        setInvite(null);
        setMsg({ ok: true, text: `Added driver "${driverName.trim()}" (no login). They're now assignable on orders.` });
        setDriverName("");
        await load();
        return;
      }
      const r = await createStaff(email.trim().toLowerCase(), pw, role, phone.trim(),
        (role === "worker" || role === "customer") ? Number(companyId) : null, project.trim(),
        role === "driver" ? driverName.trim() : "");
      if (pw) {
        // A password was set (new login or a reset) — offer the invite to send.
        const appUrl = window.location.origin;
        const addHome = ` Add it to your phone's home screen (quick steps): ${appUrl}/add-to-home-screen.pdf`;
        // Tap-to-open link that signs them in automatically (no typing). The
        // credentials ride in the URL; App() consumes + scrubs them on open.
        const quickLink = `${appUrl}/?login=${encodeURIComponent(btoa(`${r.email}:${pw}`))}`;
        const text = (role === "staff"
          ? `Hi, you've been set up on the Aussieblock dispatch board — the office system for scheduling and tracking concrete deliveries. Open ${appUrl} and sign in — email: ${r.email}, password: ${pw}. Call or text dispatch at ${DISPATCH_PHONE}.`
          : role === "driver"
          ? `Hi ${r.company || ""} — you're set up on the Aussieblock driver app for your truck tablet. Tap this link and it opens already signed in — no typing: ${quickLink} You'll see today's deliveries, the batch ticket, and can get the customer's signature on delivery. (Backup login — email: ${r.email}, password: ${pw}.) Questions? Call dispatch at ${DISPATCH_PHONE}.`
          : role === "customer"
          ? `Hi — Aussieblock has an app for ordering and tracking concrete deliveries and managing your account. You can place orders, track the trucks live, and view invoices for ${r.company || "your company"}. Open ${appUrl} and sign in — email: ${r.email}, password: ${pw}. Call or text dispatch at ${DISPATCH_PHONE}.`
          : `Hi! This is Aussieblock, your ready-mix concrete supplier. We've set you up on our app so you can see your scheduled deliveries for ${r.company || "your company"} and track the trucks live on a map. Just tap this link and the app opens already signed in — no username or password to type: ${quickLink} (Backup login if the link ever stops working — email: ${r.email}, password: ${pw}.) Questions? Call or text dispatch at ${DISPATCH_PHONE}.`) + addHome;
        setInvite({ email: r.email, phone: phone.trim(), sms: toSmsNumber(phone), text, quickLink, isWorker: role === "worker" });
        setSent(false); setCopied(false); setLinkCopied(false);
        setMsg({ ok: true, text: `Login ${r.action} for ${r.email} (${r.role}). Send the invite below 👇` });
      } else {
        // Details-only save (existing login, password left unchanged).
        setInvite(null);
        setMsg({ ok: true, text: `Saved ${r.email} (${r.role}). Password unchanged.` });
      }
      setPw("");
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (target) => {
    if (!window.confirm(`Remove the login for ${target}? They won't be able to sign in.`)) return;
    setBusy(true); setMsg(null);
    try {
      await deleteStaff(target);
      setMsg({ ok: true, text: `Login removed for ${target}.` });
      if (email.trim().toLowerCase() === target) reset();
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  // Name-only driver names (roster entries) — drivers that aren't a login.
  const loginDriverNames = new Set(staff.filter((u) => u.role === "driver").map((u) => (u.company || "").trim().toLowerCase()));
  const rosterDrivers = allDrivers.filter((n) => !loginDriverNames.has((n || "").trim().toLowerCase()));

  const removeDriver = async (name) => {
    if (!window.confirm(`Remove driver "${name}" from the roster? They'll no longer be assignable on orders.`)) return;
    setBusy(true); setMsg(null);
    try {
      await deleteDriver(name);
      setMsg({ ok: true, text: `Removed driver "${name}".` });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const sendText = async () => {
    setSending(true);
    try {
      const r = await staffTextInvite(invite.email, invite.text);
      setSent(true);
      setMsg({ ok: true, text: `Text sent to ${invite.email} (${r.to}).` });
    } catch (e) {
      setMsg({ ok: false, text: `Couldn't send: ${e.message}` });
    } finally {
      setSending(false);
    }
  };

  const inCls = "w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><User size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Workers &amp; admins</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          {/* current logins */}
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Office logins ({staff.length}) — tap to reset</div>
          {staff.length === 0 ? (
            <div className="text-white/40 text-sm py-4 text-center mb-3" style={{ background: NAVY, borderRadius: 12 }}>No logins yet — add your first below.</div>
          ) : (
            <div className="mb-4">
              {staff.map((u) => (
                <div key={u.email} className="flex items-center justify-between rounded-lg px-3 py-2 mb-1.5" style={{ background: NAVY, border: `1px solid ${editing && email.trim().toLowerCase() === u.email ? ORANGE : "rgba(255,255,255,0.06)"}` }}>
                  <button onClick={() => pick(u)} className="min-w-0 flex-1 text-left">
                    <div className="text-white text-sm font-semibold truncate flex items-center gap-2" style={{ fontFamily: C.cond }}>
                      {u.email}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={u.role === "staff" ? { background: ORANGE + "22", color: ORANGE } : u.role === "customer" ? { background: GREEN + "22", color: GREEN } : u.role === "driver" ? { background: ORANGE_HOT + "22", color: ORANGE_HOT } : { background: "#6aa9ff22", color: "#6aa9ff" }}>{u.role === "staff" ? "OPERATOR" : u.role === "customer" ? "ADMIN" : u.role === "driver" ? "DRIVER" : "WORKER"}</span>
                    </div>
                    {(u.company || u.project) && (
                      <div className="text-white/55 text-xs truncate flex items-center gap-1" style={{ fontFamily: C.body }}><Building2 size={11} color={ORANGE} /> {[u.company, u.project].filter(Boolean).join(" · ")}</div>
                    )}
                    <div className="text-white/40 text-xs truncate flex items-center gap-1">{u.phone ? <><Phone size={11} /> {u.phone}</> : "No phone on file"}</div>
                  </button>
                  <button onClick={() => remove(u.email)} disabled={busy} title="Remove login" className="p-1.5 rounded-lg shrink-0 ml-2 active:scale-90 disabled:opacity-50" style={{ background: "rgba(239,83,80,0.12)" }}>
                    <Trash2 size={15} color="#ff8a85" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* name-only drivers (assignable, no login) */}
          {rosterDrivers.length > 0 && (
            <div className="mb-4">
              <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Drivers without a login ({rosterDrivers.length})</div>
              {rosterDrivers.map((n) => (
                <div key={n} className="flex items-center justify-between rounded-lg px-3 py-2 mb-1.5" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{n}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: ORANGE_HOT + "22", color: ORANGE_HOT }}>DRIVER · NO LOGIN</span>
                  </div>
                  <button onClick={() => removeDriver(n)} disabled={busy} title="Remove driver" className="p-1.5 rounded-lg shrink-0 ml-2 active:scale-90 disabled:opacity-50" style={{ background: "rgba(239,83,80,0.12)" }}>
                    <Trash2 size={15} color="#ff8a85" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* add / reset form */}
          <div className="rounded-xl p-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-white text-sm font-semibold" style={{ fontFamily: C.cond }}>{editing ? `Reset ${email}` : "Add a login"}</div>
              {editing && <button onClick={reset} className="text-xs font-semibold" style={{ color: ORANGE, fontFamily: C.body }}>+ New</button>}
            </div>
            {/* role toggle — both Worker and Admin are tied to one company; an
                Admin also sees that company's billing. Existing full operators
                (staff) are shown read-only so they aren't downgraded by accident. */}
            {editing && role === "staff" ? (
              <div className="mb-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: ORANGE + "22", color: ORANGE, border: `1px solid ${ORANGE}`, fontFamily: C.body }}>Operator — full office access (all companies + billing)</div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setRole("staff")} className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: role === "staff" ? ORANGE + "22" : NAVY_DEEP, color: role === "staff" ? ORANGE : "rgba(255,255,255,0.5)", border: `1px solid ${role === "staff" ? ORANGE : "rgba(255,255,255,0.12)"}` }}>Operator — full office</button>
                <button onClick={() => setRole("worker")} className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: role === "worker" ? "#6aa9ff22" : NAVY_DEEP, color: role === "worker" ? "#6aa9ff" : "rgba(255,255,255,0.5)", border: `1px solid ${role === "worker" ? "#6aa9ff" : "rgba(255,255,255,0.12)"}` }}>Worker</button>
                <button onClick={() => setRole("customer")} className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: role === "customer" ? GREEN + "22" : NAVY_DEEP, color: role === "customer" ? GREEN : "rgba(255,255,255,0.5)", border: `1px solid ${role === "customer" ? GREEN : "rgba(255,255,255,0.12)"}` }}>Admin</button>
                <button onClick={() => setRole("driver")} className="flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: role === "driver" ? ORANGE_HOT + "22" : NAVY_DEEP, color: role === "driver" ? ORANGE_HOT : "rgba(255,255,255,0.5)", border: `1px solid ${role === "driver" ? ORANGE_HOT : "rgba(255,255,255,0.12)"}` }}>Driver</button>
              </div>
            )}
            {role === "worker" && !editing && (
              <button type="button" onClick={fillWorker} className="w-full mb-2 rounded-lg py-2 flex items-center justify-center gap-1.5 text-xs font-bold active:scale-[0.98] transition-transform" style={{ background: "#6aa9ff22", color: "#6aa9ff", border: "1px solid #6aa9ff", fontFamily: C.body }}>
                <KeyRound size={13} /> Auto-generate login (no email/password to type)
              </button>
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={editing} placeholder={role === "driver" ? "email (optional — leave blank for a name-only driver, no login)" : "email"} autoComplete="off" className={inCls + " mb-2 disabled:opacity-60"} style={inSt} />
            {!(role === "driver" && !email.trim() && !editing) && (
              <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder={editing ? "new password — leave blank to keep current" : "password (min 6 characters)"} autoComplete="new-password" className={inCls + " mb-2"} style={inSt} />
            )}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="cell phone (for the invite text)" className={inCls + " mb-2"} style={inSt} />
            {(role === "worker" || role === "customer") && (
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inCls + " mb-2"} style={inSt}>
                <option value="">— company they belong to (required) —</option>
                {companies.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {role === "driver" && (
              <input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="driver's name — must match the name on their orders (e.g. Rodney)" className={inCls + " mb-2"} style={inSt} />
            )}
            {role === "driver" && !email.trim() && !editing && (
              <p className="text-white/45 text-xs mb-2 -mt-1">No email = a name-only driver: assignable on orders, but no truck-tablet login. Add an email to also give them the driver app.</p>
            )}
            {role !== "driver" && <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="project / job (optional)" className={inCls + " mb-1"} style={inSt} />}
            <p className="text-white/35 text-xs mb-2">{role === "staff" ? "An operator has full access — all companies, the dispatch board, and billing." : role === "customer" ? "An admin manages one company's account — orders, tracking, AND billing — for that company only. No other companies, no dispatch board." : role === "driver" ? "A driver uses the truck tablet — today's deliveries assigned to them, the batch ticket, and customer sign-off. No board, no billing, no other companies." : "A worker sees one company's orders + delivery tracking — no billing, no other companies, no dispatch board."}</p>
            {(() => {
              const driverNoLogin = role === "driver" && !email.trim() && !editing;
              const disabled = busy
                || (role === "driver" && !driverName.trim())
                || (!driverNoLogin && !email.trim())
                || (!driverNoLogin && !editing && pw.length < 6)
                || (pw.length > 0 && pw.length < 6)
                || ((role === "worker" || role === "customer") && !companyId);
              return (
                <button onClick={submit} disabled={disabled} className="w-full rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>
                  {busy ? <Loader2 size={15} className="animate-spin" /> : driverNoLogin ? <Plus size={15} /> : <KeyRound size={15} />} {editing ? "Save changes" : driverNoLogin ? "Add driver (no login)" : "Create login"}
                </button>
              );
            })()}
          </div>

          {msg && (
            <div className="rounded-lg px-3 py-2 mt-3 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85" }}>{msg.text}</div>
          )}

          {invite && (
            <div className="rounded-xl p-3 mt-2" style={{ background: NAVY, border: `1px solid ${ORANGE}` }}>
              <div className="text-white text-sm font-semibold" style={{ fontFamily: C.cond }}>Send the invite to {invite.email}</div>
              <div className="text-white/45 text-xs mb-2" style={{ fontFamily: C.body }}>Phone on file: {invite.phone || "none"}</div>
              <div className="flex gap-2">
                {smsAuto ? (
                  invite.sms ? (
                    <button onClick={sendText} disabled={sending || sent} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-60" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                      {sending ? <Loader2 size={14} className="animate-spin" /> : sent ? <CheckCircle2 size={14} /> : <Send size={14} />} {sent ? "Sent" : sending ? "Sending…" : "Send text"}
                    </button>
                  ) : (
                    <div className="flex-1 rounded-lg py-2 text-center text-xs text-white/40" style={{ fontFamily: C.body }}>No phone on file</div>
                  )
                ) : !IS_MOBILE ? (
                  <button onClick={() => { copyAndOpenMessages(invite.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                    <Send size={14} /> Copy & open Messages
                  </button>
                ) : invite.sms ? (
                  <a href={`sms:${invite.sms}?body=${encodeURIComponent(invite.text)}`} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                    <Send size={14} /> Text invite
                  </a>
                ) : (
                  <div className="flex-1 rounded-lg py-2 text-center text-xs text-white/40" style={{ fontFamily: C.body }}>No phone on file</div>
                )}
                <button onClick={() => { navigator.clipboard?.writeText(invite.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-semibold active:scale-[0.98] transition-transform" style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>
                  {copied ? <CheckCircle2 size={14} color={GREEN} /> : <Download size={14} />} {copied ? "Copied" : "Copy text"}
                </button>
              </div>
              {invite.quickLink && (
                <button onClick={() => { navigator.clipboard?.writeText(invite.quickLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1500); }} className="w-full mt-2 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-semibold active:scale-[0.98] transition-transform" style={{ background: "#6aa9ff22", color: "#6aa9ff", border: "1px solid #6aa9ff", fontFamily: C.body }}>
                  {linkCopied ? <CheckCircle2 size={14} color={GREEN} /> : <KeyRound size={14} />} {linkCopied ? "Link copied" : "Copy tap-to-login link"}
                </button>
              )}
              <div className="text-white/35 text-[11px] mt-2" style={{ fontFamily: C.body }}>{invite.isWorker ? "The tap-to-login link opens the app already signed in — no email or password to type. Anyone with the link can open this worker view, so share it only with your crew." : smsAuto ? "\"Send text\" texts them automatically from your business number." : !IS_MOBILE ? "Copies the message and opens Google Messages (paired to your dispatch phone) — paste it into a new text. Sent from your dispatch number." : "\"Text invite\" opens your phone's messaging app with the message ready — just hit send."}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Staff modal: manage the Knowledge Center — upload PDFs (title + file) and
// remove them. The library is shared; every worker/admin sees it in their app.
function ManageDocsModal({ onClose }) {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const load = async () => { try { setDocs(await getDocs()); } catch (e) { setMsg({ ok: false, text: e.message }); } };
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) { setMsg({ ok: false, text: "Choose a PDF first." }); return; }
    const t = title.trim() || file.name.replace(/\.pdf$/i, "");   // default the title to the file name
    setBusy(true); setMsg(null);
    try {
      await uploadDoc(t, file);
      setMsg({ ok: true, text: `Uploaded "${t}".` });
      setTitle(""); setFile(null); if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };

  const remove = async (d) => {
    if (!window.confirm(`Remove "${d.title}" from the Knowledge Center?`)) return;
    setBusy(true); setMsg(null);
    try { await deleteDoc(d.id); await load(); } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };

  const inCls = "w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><BookOpen size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Knowledge Center</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Library ({docs.length}) — visible to all workers &amp; admins</div>
          {docs.length === 0 ? (
            <div className="text-white/40 text-sm py-4 text-center mb-3" style={{ background: NAVY, borderRadius: 12 }}>No documents yet — add your first below.</div>
          ) : (
            <div className="mb-4">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg px-3 py-2 mb-1.5" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <button onClick={() => openDoc(d.id).catch((e) => alert(e.message))} className="min-w-0 flex-1 text-left flex items-center gap-2">
                    <FileText size={15} color={ORANGE} className="shrink-0" />
                    <span className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{d.title}</span>
                  </button>
                  <button onClick={() => remove(d)} disabled={busy} title="Remove" className="p-1.5 rounded-lg shrink-0 ml-2 active:scale-90 disabled:opacity-50" style={{ background: "rgba(239,83,80,0.12)" }}><Trash2 size={15} color="#ff8a85" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl p-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>Add a document (PDF)</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional — defaults to file name)" className={inCls + " mb-2"} style={inSt} />
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-xs text-white/70 mb-2 file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:bg-white/10 file:text-white" style={{ fontFamily: C.body }} />
            <button onClick={upload} disabled={busy || !file} className="w-full rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />} Upload</button>
          </div>
          {msg && <div className="rounded-lg px-3 py-2 mt-3 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85" }}>{msg.text}</div>}
        </div>
      </div>
    </div>
  );
}

// Staff modal: the cement & slag tracker. Two parts — silo gauges (on-hand =
// opening + received − used) up top, and a tabbed body for the receiving log
// (reconcile against supplier invoices) and the mix-design table (lb/yd that
// drive the silo draw-down). Operator/office only.
const t1 = (n) => (n == null ? "—" : (Math.round(n * 10) / 10).toLocaleString());   // tons, 1 dp
const money = (n) => (n == null ? "" : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
// An amount in a material's own unit: tons to 1 dp, lb/oz as whole numbers.
const amt = (n, unit) => (n == null ? "—" : (unit === "ton" ? Math.round(n * 10) / 10 : Math.round(n)).toLocaleString());

function SiloCard({ m, onSaved }) {
  const [edit, setEdit] = useState(false);       // capacity / reorder / cost setup
  const [tonsMode, setTonsMode] = useState(false); // manual "set current tons" override
  const [f, setF] = useState({});
  const [tons, setTons] = useState("");
  const [busy, setBusy] = useState(false);
  const openSetup = () => { setF({ capacity_tons: m.capacity_tons || "", reorder_tons: m.reorder_tons || "", cost_rate: m.cost_rate || "" }); setEdit(true); setTonsMode(false); };
  const openTons = () => { setTons(m.on_hand_tons != null ? String(Math.round(m.on_hand_tons * 10) / 10) : ""); setTonsMode(true); setEdit(false); };
  const saveSetup = async () => {
    setBusy(true);
    try {
      await updateMaterial(m.id, {
        capacity_tons: Number(f.capacity_tons) || 0, reorder_tons: Number(f.reorder_tons) || 0,
        cost_rate: Number(f.cost_rate) || 0,
      });
      setEdit(false); onSaved && onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  // Manual override: pin the silo to the counted tons as of today. The backend treats
  // this as the new baseline (opening + counted_on), so batch-ticket draw-down resumes
  // from this number going forward.
  const saveTons = async () => {
    setBusy(true);
    try {
      await updateMaterial(m.id, { on_hand_tons: Number(tons) || 0, counted_on: localToday() });
      setTonsMode(false); onSaved && onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  const pct = m.pct != null ? m.pct : (m.capacity_tons ? Math.max(0, Math.min(1, m.on_hand_tons / m.capacity_tons)) : null);
  const barColor = m.low ? "#ff8a4d" : (pct != null && pct < 0.15 ? "#ff8a4d" : GREEN);
  const inCls = "w-full rounded-lg px-2 py-1.5 text-sm text-white outline-none";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  return (
    <div className="rounded-xl p-3.5" style={{ background: NAVY, border: `1px solid ${m.low ? "#ff8a4d" : "rgba(255,255,255,0.08)"}` }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-bold" style={{ fontFamily: C.cond }}>{m.name}</span>
        {m.low && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#ff8a4d22", color: "#ff8a4d" }}><AlertTriangle size={11} /> REORDER</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold" style={{ fontFamily: C.cond, color: m.low ? "#ff8a4d" : "#fff" }}>{t1(m.on_hand_tons)}</span>
        <span className="text-white/50 text-sm">ton{m.capacity_tons ? ` / ${t1(m.capacity_tons)}` : ""}</span>
      </div>
      <div className="h-2 rounded-full mt-1.5 mb-2 overflow-hidden" style={{ background: NAVY_DEEP }}>
        <div className="h-full rounded-full" style={{ width: `${pct != null ? Math.round(pct * 100) : 0}%`, background: barColor }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-white/50" style={{ fontFamily: C.body }}>
        <span>+{t1(m.received_tons)} received · −{t1(m.used_amount)} used{m.cost > 0 ? ` · ${money(m.cost)}` : ""}</span>
        <div className="flex items-center gap-2">
          <button onClick={tonsMode ? () => setTonsMode(false) : openTons} className="font-semibold" style={{ color: ORANGE }}>{tonsMode ? "Cancel" : "Set tons"}</button>
          <span className="text-white/20">·</span>
          <button onClick={edit ? () => setEdit(false) : openSetup} className="font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{edit ? "Cancel" : "Set up"}</button>
        </div>
      </div>
      {m.used_amount > 0 && (
        <div className="text-[10px] text-white/35 mt-0.5" style={{ fontFamily: C.body }}>
          drawn down {t1(m.used_amount)} ton from batch tickets{m.cost_rate > 0 ? ` · @ ${money(m.cost_rate)}/ton` : ""}
        </div>
      )}
      {tonsMode && (
        <div className="mt-2.5 pt-2.5 grid grid-cols-1 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <label className="text-[10px] text-white/45 uppercase tracking-wide">Tons in silo right now<input type="number" autoFocus value={tons} onChange={(e) => setTons(e.target.value)} className={inCls} style={inSt} /></label>
          <div className="text-[10px] text-white/35 leading-snug">Sets the silo to this exact amount as of today. Batch-ticket deliveries keep drawing it down from here.</div>
          <button onClick={saveTons} disabled={busy} className="rounded-lg py-1.5 text-sm font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? "Saving…" : "Set current tons"}</button>
        </div>
      )}
      {edit && (
        <div className="mt-2.5 pt-2.5 grid grid-cols-2 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <label className="text-[10px] text-white/45 uppercase tracking-wide">Capacity (ton)<input type="number" value={f.capacity_tons} onChange={(e) => setF({ ...f, capacity_tons: e.target.value })} className={inCls} style={inSt} /></label>
          <label className="text-[10px] text-white/45 uppercase tracking-wide">Reorder at (ton)<input type="number" value={f.reorder_tons} onChange={(e) => setF({ ...f, reorder_tons: e.target.value })} className={inCls} style={inSt} /></label>
          <label className="text-[10px] text-white/45 uppercase tracking-wide col-span-2">Cost ($/ton)<input type="number" value={f.cost_rate} onChange={(e) => setF({ ...f, cost_rate: e.target.value })} className={inCls} style={inSt} /></label>
          <div className="col-span-2 text-[10px] text-white/35 leading-snug">Capacity sizes the gauge; reorder flags the silo when it runs low. To correct the on-hand amount, use "Set tons". Cost = actual tons used × $/ton.</div>
          <button onClick={saveSetup} disabled={busy} className="col-span-2 rounded-lg py-1.5 text-sm font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? "Saving…" : "Save silo"}</button>
        </div>
      )}
    </div>
  );
}

// A non-silo material (gravel, sand, admixtures): tracked by ACTUAL batched usage off
// completed orders' tickets + cost only — no on-hand balance. Edit the cost rate (and
// optionally a start date) inline.
function UsageCard({ m, onSaved }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  const open = () => { setF({ cost_rate: m.cost_rate || "", counted_on: m.counted_on || "" }); setEdit(true); };
  const save = async () => {
    setBusy(true);
    try {
      await updateMaterial(m.id, { cost_rate: Number(f.cost_rate) || 0, counted_on: f.counted_on || null });
      setEdit(false); onSaved && onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  const inCls = "w-full rounded-lg px-2 py-1.5 text-sm text-white outline-none";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  return (
    <div className="rounded-xl p-3.5" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-bold" style={{ fontFamily: C.cond }}>{m.name}</span>
        <button onClick={edit ? () => setEdit(false) : open} className="text-[11px] font-semibold" style={{ color: ORANGE }}>{edit ? "Cancel" : "Set rate"}</button>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold" style={{ fontFamily: C.cond, color: "#fff" }}>{amt(m.used_amount, m.unit)}</span>
        <span className="text-white/50 text-sm">{m.unit} used</span>
      </div>
      <div className="flex items-center justify-between text-[11px] mt-1.5" style={{ fontFamily: C.body }}>
        <span className="font-semibold" style={{ color: m.cost > 0 ? GREEN : "rgba(255,255,255,0.4)" }}>{m.cost > 0 ? money(m.cost) : "—"}</span>
        <span className="text-white/40">{m.cost_rate > 0 ? `${money(m.cost_rate)}/${m.unit}` : `set $/${m.unit}`}</span>
      </div>
      {edit && (
        <div className="mt-2.5 pt-2.5 grid grid-cols-2 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <label className="text-[10px] text-white/45 uppercase tracking-wide">Cost ($/{m.unit})<input type="number" value={f.cost_rate} onChange={(e) => setF({ ...f, cost_rate: e.target.value })} className={inCls} style={inSt} /></label>
          <label className="text-[10px] text-white/45 uppercase tracking-wide">Count from<input type="date" value={f.counted_on} onChange={(e) => setF({ ...f, counted_on: e.target.value })} className={inCls} style={inSt} /></label>
          <div className="col-span-2 text-[10px] text-white/35 leading-snug">Usage = actual {m.unit} batched on completed orders' tickets{m.counted_on ? "" : " (all-time unless you set a start date)"}. Cost = used × $/{m.unit}.</div>
          <button onClick={save} disabled={busy} className="col-span-2 rounded-lg py-1.5 text-sm font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? "Saving…" : "Save"}</button>
        </div>
      )}
    </div>
  );
}

// The photo strip for one receipt — fetches each attached photo as an authed blob
// and shows thumbnails (tap to open full, X to remove), plus an "Add" camera tile.
function ReceiptPhotos({ receipt, onChanged }) {
  const [urls, setUrls] = useState({});   // name -> object URL
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const names = receipt.photos || [];
  useEffect(() => {
    let live = true; const made = [];
    (async () => {
      for (const name of names) {
        try {
          const u = await fetchReceiptPhotoUrl(receipt.id, name);
          if (!live) { URL.revokeObjectURL(u); return; }
          made.push(u); setUrls((m) => ({ ...m, [name]: u }));
        } catch { /* skip a missing photo */ }
      }
    })();
    return () => { live = false; made.forEach((u) => URL.revokeObjectURL(u)); };
  }, [receipt.id, names.join(",")]);

  const add = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setBusy(true);
    try { for (const f of files) await uploadReceiptPhoto(receipt.id, f); if (onChanged) await onChanged(); }
    catch (err) { alert(err.message); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  const remove = async (name) => {
    if (!window.confirm("Remove this attachment?")) return;
    setBusy(true);
    try { await deleteReceiptPhoto(receipt.id, name); if (onChanged) await onChanged(); }
    catch (err) { alert(err.message); } finally { setBusy(false); }
  };
  const isPdf = (name) => /\.pdf$/i.test(name);
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {names.map((name) => (
        <div key={name} className="relative">
          {!urls[name] ? (
            <div className="h-16 w-16 rounded-lg flex items-center justify-center" style={{ background: NAVY }}><Loader2 size={14} className="animate-spin text-white/40" /></div>
          ) : isPdf(name) ? (
            <button onClick={() => window.open(urls[name], "_blank")} title="Open PDF" className="h-16 w-16 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.15)" }}>
              <FileText size={20} color={ORANGE} /><span className="text-[9px] font-semibold text-white/70">PDF</span>
            </button>
          ) : (
            <img src={urls[name]} alt="delivery" onClick={() => window.open(urls[name], "_blank")} className="h-16 w-16 object-cover rounded-lg cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
          )}
          <button onClick={() => remove(name)} title="Remove" className="absolute -top-1.5 -right-1.5 rounded-full p-0.5 active:scale-90" style={{ background: "#ff5a52" }}><X size={11} color="#fff" /></button>
        </div>
      ))}
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="h-16 w-16 rounded-lg flex flex-col items-center justify-center gap-0.5 active:scale-95 disabled:opacity-50" style={{ background: NAVY, border: "1px dashed rgba(255,255,255,0.25)" }}>
        {busy ? <Loader2 size={15} className="animate-spin text-white/50" /> : <><Camera size={16} color={ORANGE} /><span className="text-[9px] text-white/50">Add</span></>}
      </button>
      <input ref={fileRef} type="file" accept="image/*,application/pdf,.pdf" multiple onChange={add} className="hidden" />
    </div>
  );
}

// Cement/slag purchase orders inside the Materials tab. Create an auto-numbered PO
// (AB-CEM-NNNN) to email the supplier, track Open/Partial/Received from deliveries,
// and reconcile each delivery's invoice — all wired into the receiving log.
const PO_STATUS_STYLE = {
  Open: { bg: ORANGE + "22", fg: ORANGE }, Partial: { bg: "#f59e0b22", fg: "#f59e0b" },
  Received: { bg: GREEN + "22", fg: GREEN }, Closed: { bg: "#ffffff14", fg: "rgba(255,255,255,0.6)" },
  Cancelled: { bg: "#ef444422", fg: "#ff8a85" },
};
function POPanel({ materials }) {
  const [pos, setPos] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const matName = (id) => materials.find((m) => m.id === id)?.name || "—";
  const blankPO = { vendor: "", material_id: materials[0]?.id ?? "", tons_ordered: "", fob_price: "", freight_terms: "Vendor Delivered", freight_cost: "", expected: localToday(), dest: "", notes: "" };
  const [poForm, setPoForm] = useState(blankPO);
  const blankDel = { tons: "", received_on: localToday(), invoice_no: "", ticket_no: "", supplier: "", unit_cost: "" };
  const [delForm, setDelForm] = useState(blankDel);

  const load = async () => {
    try { const [p, rc] = await Promise.all([getPOs(), getReceipts()]); setPos(p); setReceipts(rc); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const inCls = "w-full rounded-lg px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };

  const createPo = async () => {
    if (!poForm.vendor.trim()) { setMsg({ ok: false, text: "Enter the vendor." }); return; }
    if (!(Number(poForm.tons_ordered) > 0)) { setMsg({ ok: false, text: "Enter tons ordered." }); return; }
    setBusy(true); setMsg(null);
    try {
      const po = await createPO({
        vendor: poForm.vendor.trim(), material_id: poForm.material_id ? Number(poForm.material_id) : null,
        tons_ordered: Number(poForm.tons_ordered), fob_price: poForm.fob_price === "" ? null : Number(poForm.fob_price),
        freight_terms: poForm.freight_terms, freight_cost: poForm.freight_cost === "" ? null : Number(poForm.freight_cost),
        expected: poForm.expected || null, dest: poForm.dest.trim() || null, notes: poForm.notes.trim() || null,
      });
      setShowNew(false); setPoForm(blankPO);
      setMsg({ ok: true, text: `Created ${po.po_number} — email it to ${po.vendor}.` });
      await load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };
  const logDelivery = async (po) => {
    if (!(Number(delForm.tons) > 0)) { setMsg({ ok: false, text: "Enter tons received." }); return; }
    if (!po.material_id) { setMsg({ ok: false, text: "Set a material on this PO first." }); return; }
    setBusy(true); setMsg(null);
    try {
      await addReceipt({
        material_id: po.material_id, received_on: delForm.received_on || localToday(), tons: Number(delForm.tons),
        supplier: (delForm.supplier || po.vendor).trim() || null, ticket_no: delForm.ticket_no.trim() || null,
        invoice_no: delForm.invoice_no.trim() || null, unit_cost: delForm.unit_cost === "" ? null : Number(delForm.unit_cost),
        po_id: po.id,
      });
      setDelForm(blankDel);
      setMsg({ ok: true, text: "Delivery logged against " + po.po_number + "." });
      await load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };
  const setStatus = async (po, status) => { try { await editPO(po.id, { status }); await load(); } catch (e) { setMsg({ ok: false, text: e.message }); } };
  const toggleMatched = async (r) => { try { await editReceipt(r.id, { invoice_matched: !r.invoice_matched }); await load(); } catch (e) { setMsg({ ok: false, text: e.message }); } };
  const removePo = async (po) => { if (!window.confirm("Delete " + po.po_number + "? Its deliveries stay in the receiving log but unlink.")) return; try { await deletePO(po.id); await load(); } catch (e) { setMsg({ ok: false, text: e.message }); } };

  // Plain-text purchase order for emailing to the vendor (company letterhead +
  // the PO's material, tons, price, freight, destination, date and notes).
  const poEmailText = (po) => {
    const L = [
      "AUSSIEBLOCK READY MIX",
      "4264 S. Jackson St, San Angelo, TX 76903",
      "(325) 213-5315",
      "",
      `PURCHASE ORDER   ${po.po_number}`,
    ];
    const d = (po.created_at || "").slice(0, 10);
    L.push(`Date: ${orderDateUS(d) || d || ""}`);
    L.push("", `Vendor:     ${po.vendor}`, "", `Material:   ${matName(po.material_id)}`,
      `Quantity:   ${t1(po.tons_ordered)} tons`);
    if (po.fob_price != null) L.push(`FOB price:  ${money(po.fob_price)} / ton`);
    if (po.freight_terms) {
      let ft = po.freight_terms;
      if (po.freight_terms === "Vendor Delivered" && po.freight_cost) ft += ` (${money(po.freight_cost)}/ton)`;
      L.push(`Freight:    ${ft}`);
    }
    if (po.dest) L.push(`Deliver to: ${po.dest}`);
    if (po.expected) L.push(`Needed by:  ${orderDateUS(po.expected) || po.expected}`);
    if (po.committed) L.push("", `Estimated total: ${money(po.committed)}  (${t1(po.tons_ordered)} tons @ ${money(po.unit_all)}/ton)`);
    if (po.notes) L.push("", `Notes: ${po.notes}`);
    L.push("", "Please confirm receipt of this order and the expected delivery date.",
      "", "Thank you,", "Aussieblock Ready Mix", "dispatch@aussie-block.com");
    return L.join("\n");
  };
  const emailPO = (po) => {
    const subject = `Purchase Order ${po.po_number} — Aussieblock Ready Mix`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(poEmailText(po))}`;
  };
  const copyPO = async (po) => {
    const text = poEmailText(po);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      setMsg({ ok: true, text: `${po.po_number} text copied — paste it into your email.` });
    } catch (e) { setMsg({ ok: false, text: "Couldn't copy: " + (e.message || "") }); }
  };

  if (!pos) return <div className="text-white/50 text-sm py-6 text-center flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading POs…</div>;

  return (
    <>
      <button onClick={() => setShowNew((v) => !v)} className="w-full rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.99]" style={{ background: ORANGE, color: NAVY_DEEP }}>
        <Plus size={15} /> {showNew ? "Cancel" : "New purchase order"}
      </button>
      {showNew && (
        <div className="rounded-xl p-3 mb-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>New PO — number is assigned automatically</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input placeholder="Vendor *" value={poForm.vendor} onChange={(e) => setPoForm({ ...poForm, vendor: e.target.value })} className={inCls} style={inSt} />
            <select value={poForm.material_id} onChange={(e) => setPoForm({ ...poForm, material_id: e.target.value })} className={inCls} style={inSt}>
              <option value="">Material…</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="number" placeholder="Tons *" value={poForm.tons_ordered} onChange={(e) => setPoForm({ ...poForm, tons_ordered: e.target.value })} className={inCls} style={inSt} />
            <input type="number" placeholder="$/ton FOB" value={poForm.fob_price} onChange={(e) => setPoForm({ ...poForm, fob_price: e.target.value })} className={inCls} style={inSt} />
            <select value={poForm.freight_terms} onChange={(e) => setPoForm({ ...poForm, freight_terms: e.target.value })} className={inCls} style={inSt}>
              <option>Vendor Delivered</option><option>Self Pickup</option>
            </select>
            {poForm.freight_terms === "Vendor Delivered" && <input type="number" placeholder="Freight $/ton" value={poForm.freight_cost} onChange={(e) => setPoForm({ ...poForm, freight_cost: e.target.value })} className={inCls} style={inSt} />}
            <input type="date" value={poForm.expected} onChange={(e) => setPoForm({ ...poForm, expected: e.target.value })} className={inCls} style={inSt} />
            <input placeholder="Silo / destination" value={poForm.dest} onChange={(e) => setPoForm({ ...poForm, dest: e.target.value })} className={inCls} style={inSt} />
            <input placeholder="Notes" value={poForm.notes} onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })} className={inCls} style={inSt} />
          </div>
          <button onClick={createPo} disabled={busy} className="w-full mt-2 rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create PO</button>
        </div>
      )}
      {pos.length === 0 ? (
        <div className="text-white/40 text-sm py-6 text-center" style={{ background: NAVY, borderRadius: 12 }}>No purchase orders yet. Tap “New purchase order”.</div>
      ) : pos.map((po) => {
        const st = PO_STATUS_STYLE[po.status] || PO_STATUS_STYLE.Open;
        const pct = po.tons_ordered ? Math.min((po.received_tons / po.tons_ordered) * 100, 100) : 0;
        const open = expanded === po.id;
        const dels = receipts.filter((r) => r.po_id === po.id);
        return (
          <div key={po.id} className="rounded-xl mb-2 overflow-hidden" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => { setExpanded(open ? null : po.id); setDelForm(blankDel); }} className="w-full text-left p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm" style={{ fontFamily: C.cond }}>{po.po_number} · {matName(po.material_id)}</div>
                  <div className="text-white/45 text-xs truncate">{po.vendor}{po.expected ? " · exp " + (orderDateUS(po.expected) || po.expected) : ""}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0" style={{ background: st.bg, color: st.fg }}>{po.status}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}><div className="h-full rounded-full" style={{ width: pct + "%", background: ORANGE }} /></div>
              <div className="flex justify-between text-[11px] mt-1 text-white/55">
                <span>{t1(po.received_tons)} / {t1(po.tons_ordered)} t{po.committed ? " · " + money(po.committed) : ""}</span>
                <span style={{ color: po.deliveries > 0 && po.fully_matched ? GREEN : "rgba(255,255,255,0.55)" }}>{po.deliveries > 0 ? `invoices ${po.invoices_matched}/${po.deliveries}` : "no deliveries"}</span>
              </div>
            </button>
            {open && (
              <div className="px-3 pb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {dels.length > 0 && (
                  <div className="mt-2 mb-2">
                    {dels.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-xs py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-white/70 whitespace-nowrap">{r.received_on}</span>
                        <span className="text-white font-semibold">{t1(r.tons)} t</span>
                        <span className="text-white/45 truncate flex-1">{r.invoice_no ? "inv " + r.invoice_no : "no invoice"}{r.ticket_no ? " · tkt " + r.ticket_no : ""}</span>
                        <button onClick={() => toggleMatched(r)} title="Invoice reconciled" className="inline-flex items-center justify-center w-5 h-5 rounded active:scale-90 shrink-0" style={{ background: r.invoice_matched ? GREEN : "transparent", border: `1px solid ${r.invoice_matched ? GREEN : "rgba(255,255,255,0.25)"}` }}>{r.invoice_matched && <Check size={12} color={NAVY_DEEP} />}</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-white/45 text-[11px] uppercase tracking-wide mt-2 mb-1">Log a delivery on this PO</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input type="number" placeholder="Tons" value={delForm.tons} onChange={(e) => setDelForm({ ...delForm, tons: e.target.value })} className={inCls} style={inSt} />
                  <input type="date" value={delForm.received_on} onChange={(e) => setDelForm({ ...delForm, received_on: e.target.value })} className={inCls} style={inSt} />
                  <input placeholder="Invoice #" value={delForm.invoice_no} onChange={(e) => setDelForm({ ...delForm, invoice_no: e.target.value })} className={inCls} style={inSt} />
                  <input placeholder="Ticket #" value={delForm.ticket_no} onChange={(e) => setDelForm({ ...delForm, ticket_no: e.target.value })} className={inCls} style={inSt} />
                  <input type="number" placeholder="$/ton (optional)" value={delForm.unit_cost} onChange={(e) => setDelForm({ ...delForm, unit_cost: e.target.value })} className={inCls} style={inSt} />
                  <button onClick={() => logDelivery(po)} disabled={busy} className="rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Log</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => emailPO(po)} className="text-xs px-2.5 py-1 rounded-lg active:scale-95 inline-flex items-center gap-1 font-bold" style={{ background: ORANGE, color: NAVY_DEEP }}><Send size={13} /> Email vendor</button>
                  <button onClick={() => copyPO(po)} className="text-xs px-2.5 py-1 rounded-lg text-white/70 active:scale-95 inline-flex items-center gap-1" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }}><ClipboardList size={13} /> Copy text</button>
                  {po.raw_status !== "closed" && <button onClick={() => setStatus(po, "closed")} className="text-xs px-2.5 py-1 rounded-lg text-white/70 active:scale-95" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }}>Close</button>}
                  {po.raw_status !== "cancelled" && <button onClick={() => setStatus(po, "cancelled")} className="text-xs px-2.5 py-1 rounded-lg active:scale-95" style={{ background: NAVY_DEEP, border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85" }}>Cancel PO</button>}
                  {po.raw_status !== "open" && <button onClick={() => setStatus(po, "open")} className="text-xs px-2.5 py-1 rounded-lg text-white/70 active:scale-95" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }}>Reopen</button>}
                  <button onClick={() => removePo(po)} title="Delete PO" className="ml-auto text-xs px-2 py-1 rounded-lg active:scale-95" style={{ background: NAVY_DEEP, border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85" }}><Trash2 size={13} /></button>
                </div>
                {po.notes && <div className="text-white/45 text-[11px] mt-2">{po.notes}</div>}
              </div>
            )}
          </div>
        );
      })}
      {msg && <div className="rounded-lg px-3 py-2 mt-3 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85" }}>{msg.text}</div>}
    </>
  );
}

function MaterialsModal({ onClose }) {
  const [tab, setTab] = useState("inventory");
  const [summary, setSummary] = useState({ materials: [], unmapped_mixes: [] });
  const [receipts, setReceipts] = useState([]);
  const [msg, setMsg] = useState(null);
  const today = localToday();
  const blank = { material_id: "", received_on: today, supplier: "", tons: "", ticket_no: "", invoice_no: "", unit_cost: "" };
  const [form, setForm] = useState(blank);
  const [formPhotos, setFormPhotos] = useState([]);   // photos to attach to the delivery being logged
  const [openPhotos, setOpenPhotos] = useState(null);   // receipt id whose photo strip is expanded
  const [busy, setBusy] = useState(false);
  // Usage filters: a completed-date window (day or range) + a single-material focus.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [matFilter, setMatFilter] = useState("all");

  const load = async () => {
    try {
      const [sm, rc] = await Promise.all([getMaterials({ from, to }), getReceipts()]);
      setSummary(sm); setReceipts(rc);
      setForm((f) => ({ ...f, material_id: f.material_id || (sm.materials[0]?.id ?? "") }));
    } catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  useEffect(() => { load(); }, [from, to]);   // refetch usage when the date window changes

  const matName = (id) => summary.materials.find((m) => m.id === id)?.name || "";
  const allSilos = summary.materials.filter((m) => m.track_inventory);
  const dateActive = !!(from || to);
  const matSel = (list) => (matFilter === "all" ? list : list.filter((m) => m.id === Number(matFilter)));
  const silos = matSel(allSilos);
  const usage = matSel(summary.materials.filter((m) => !m.track_inventory));
  const windowLabel = dateActive
    ? `${from ? (orderDateUS(from) || from) : "start"} – ${to ? (orderDateUS(to) || to) : "today"}`
    : "";

  const logDelivery = async () => {
    if (!form.material_id) { setMsg({ ok: false, text: "Pick a material." }); return; }
    if (!(Number(form.tons) > 0)) { setMsg({ ok: false, text: "Enter the tons received." }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await addReceipt({
        material_id: Number(form.material_id), received_on: form.received_on || today,
        tons: Number(form.tons), supplier: form.supplier.trim() || null,
        ticket_no: form.ticket_no.trim() || null, invoice_no: form.invoice_no.trim() || null,
        unit_cost: form.unit_cost === "" ? null : Number(form.unit_cost),
      });
      if (formPhotos.length && r?.id) {
        for (const f of formPhotos) { try { await uploadReceiptPhoto(r.id, f); } catch { /* keep going */ } }
      }
      setForm({ ...blank, material_id: form.material_id, received_on: form.received_on });
      setFormPhotos([]);
      setMsg({ ok: true, text: `Delivery logged${formPhotos.length ? ` with ${formPhotos.length} file${formPhotos.length > 1 ? "s" : ""}` : ""}.` });
      await load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(false); }
  };

  const toggleMatched = async (r) => {
    try { await editReceipt(r.id, { invoice_matched: !r.invoice_matched }); await load(); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  const removeReceipt = async (r) => {
    if (!window.confirm(`Delete this ${r.material} delivery (${t1(r.tons)} ton${r.supplier ? ", " + r.supplier : ""})?`)) return;
    try { await deleteReceipt(r.id); await load(); } catch (e) { setMsg({ ok: false, text: e.message }); }
  };

  const inCls = "w-full rounded-lg px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Layers size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Materials</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          <div className="flex gap-2 mb-4">
            {[["inventory", "Inventory"], ["pos", "Purchase orders"]].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} className="rounded-lg px-3 py-1.5 text-sm font-semibold active:scale-95 transition-transform" style={tab === k ? { background: ORANGE, color: NAVY_DEEP } : { background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>{label}</button>
            ))}
          </div>
          {tab === "pos" && <POPanel materials={summary.materials} />}
          {tab === "inventory" && (<>
          {/* usage filters: material + completed-date window */}
          <div className="rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="text-white/45 text-[11px] uppercase tracking-wide shrink-0" style={{ fontFamily: C.body }}>Show usage for</span>
            <select value={matFilter} onChange={(e) => setMatFilter(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs text-white outline-none" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
              <option value="all">All materials</option>
              {summary.materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <CalendarDays size={14} className="shrink-0" style={{ color: ORANGE }} />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="rounded-lg px-2 py-1.5 text-xs outline-none" style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
            <span className="text-white/40 text-xs shrink-0" style={{ fontFamily: C.body }}>to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="rounded-lg px-2 py-1.5 text-xs outline-none" style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
            {(dateActive || matFilter !== "all") && <button onClick={() => { setFrom(""); setTo(""); setMatFilter("all"); }} className="text-white/45 text-xs px-2 py-1 rounded-lg active:scale-95 shrink-0" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>Clear</button>}
            <div className="basis-full text-[10px] text-white/35 leading-snug">
              {dateActive ? `Usage shown is what was batched on orders completed ${windowLabel}. Silo on-hand always reflects the live balance.` : "Usage is all-time (from each material's start date). Pick a day or range to narrow it."}
            </div>
          </div>
          {/* cement & slag silos */}
          {silos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {silos.map((m) => <SiloCard key={m.id} m={m} onSaved={load} />)}
            </div>
          )}
          {/* aggregates & admixtures — actual usage + cost (no silo) */}
          {usage.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/55 text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: C.body }}>Aggregates &amp; admixtures · {dateActive ? `used ${windowLabel}` : "actual used"}</span>
                {summary.total_cost > 0 && <span className="text-xs" style={{ color: GREEN, fontFamily: C.body }}>total material cost {money(summary.total_cost)}</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {usage.map((m) => <UsageCard key={m.id} m={m} onSaved={load} />)}
              </div>
            </div>
          )}
          <div className="text-white/55 text-xs font-semibold uppercase tracking-wide mb-3" style={{ fontFamily: C.body }}>Receiving log</div>

          <>
              {/* log a delivery */}
              <div className="rounded-xl p-3 mb-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>Log an incoming delivery</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <select value={form.material_id} onChange={(e) => setForm({ ...form, material_id: Number(e.target.value) })} className={inCls} style={inSt}>
                    {allSilos.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="date" value={form.received_on} onChange={(e) => setForm({ ...form, received_on: e.target.value })} className={inCls} style={inSt} />
                  <input type="number" placeholder="Tons" value={form.tons} onChange={(e) => setForm({ ...form, tons: e.target.value })} className={inCls} style={inSt} />
                  <input placeholder="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={inCls} style={inSt} />
                  <input placeholder="Ticket #" value={form.ticket_no} onChange={(e) => setForm({ ...form, ticket_no: e.target.value })} className={inCls} style={inSt} />
                  <input placeholder="Invoice #" value={form.invoice_no} onChange={(e) => setForm({ ...form, invoice_no: e.target.value })} className={inCls} style={inSt} />
                  <input type="number" placeholder="$/ton (optional)" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} className={inCls} style={inSt} />
                  <label className="sm:col-span-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer active:scale-[0.99]" style={{ ...inSt, borderStyle: "dashed" }}>
                    <Camera size={15} color={ORANGE} />
                    <span className="text-white/55">{formPhotos.length ? `${formPhotos.length} file${formPhotos.length > 1 ? "s" : ""} attached` : "Attach delivery ticket — photo or PDF (optional)"}</span>
                    <input type="file" accept="image/*,application/pdf,.pdf" multiple className="hidden" onChange={(e) => setFormPhotos(Array.from(e.target.files || []))} />
                  </label>
                  <button onClick={logDelivery} disabled={busy} className="sm:col-span-3 rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Log delivery</button>
                </div>
              </div>
              {/* receiving log */}
              {receipts.length === 0 ? (
                <div className="text-white/40 text-sm py-4 text-center" style={{ background: NAVY, borderRadius: 12 }}>No deliveries logged yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" style={{ fontFamily: C.body }}>
                    <thead><tr className="text-white/45 text-left">
                      <th className="py-1.5 pr-2 font-semibold">Date</th><th className="py-1.5 pr-2 font-semibold">Material</th><th className="py-1.5 pr-2 font-semibold">Supplier</th>
                      <th className="py-1.5 pr-2 font-semibold text-right">Tons</th><th className="py-1.5 pr-2 font-semibold">Ticket</th><th className="py-1.5 pr-2 font-semibold">Invoice</th>
                      <th className="py-1.5 pr-2 font-semibold text-right">Cost</th><th className="py-1.5 pr-2 font-semibold text-center">Matched</th><th></th>
                    </tr></thead>
                    <tbody>
                      {receipts.map((r) => (
                        <Fragment key={r.id}>
                          <tr className="text-white/80" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <td className="py-1.5 pr-2 whitespace-nowrap">{r.received_on}</td>
                            <td className="py-1.5 pr-2"><span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: r.material === "Slag" ? "#6aa9ff22" : ORANGE + "22", color: r.material === "Slag" ? "#6aa9ff" : ORANGE }}>{r.material}</span></td>
                            <td className="py-1.5 pr-2">{r.supplier || "—"}</td>
                            <td className="py-1.5 pr-2 text-right font-semibold text-white">{t1(r.tons)}</td>
                            <td className="py-1.5 pr-2">{r.ticket_no || "—"}</td>
                            <td className="py-1.5 pr-2">{r.invoice_no || "—"}</td>
                            <td className="py-1.5 pr-2 text-right">{r.total_cost != null ? money(r.total_cost) : (r.unit_cost != null ? money(r.unit_cost) + "/t" : "—")}</td>
                            <td className="py-1.5 pr-2 text-center">
                              <button onClick={() => toggleMatched(r)} title="Reconciled against the supplier invoice" className="inline-flex items-center justify-center w-5 h-5 rounded active:scale-90" style={{ background: r.invoice_matched ? GREEN : "transparent", border: `1px solid ${r.invoice_matched ? GREEN : "rgba(255,255,255,0.25)"}` }}>{r.invoice_matched && <Check size={13} color={NAVY_DEEP} />}</button>
                            </td>
                            <td className="py-1.5 text-right whitespace-nowrap">
                              <button onClick={() => setOpenPhotos(openPhotos === r.id ? null : r.id)} title="Delivery ticket photos / PDFs" className="p-1 rounded active:scale-90 inline-flex items-center gap-0.5 align-middle">
                                <Camera size={14} color={(r.photos || []).length ? ORANGE : "rgba(255,255,255,0.4)"} />
                                {(r.photos || []).length > 0 && <span className="text-[10px] font-semibold" style={{ color: ORANGE }}>{r.photos.length}</span>}
                              </button>
                              <button onClick={() => removeReceipt(r)} title="Delete" className="p-1 rounded active:scale-90 align-middle"><Trash2 size={13} color="#ff8a85" /></button>
                            </td>
                          </tr>
                          {openPhotos === r.id && (
                            <tr style={{ background: NAVY }}>
                              <td colSpan={9} className="px-2"><ReceiptPhotos receipt={r} onChanged={load} /></td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </>
          </>)}

          {msg && <div className="rounded-lg px-3 py-2 mt-3 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85" }}>{msg.text}</div>}
        </div>
      </div>
    </div>
  );
}

// Staff modal: month calendar for delivery planning. Each day cell shows the
// total yards scheduled; clicking a day lists that day's orders (with controls).
// Staff "Past orders" history modal — completed orders, most recent first, each
// a full OrderRow so staff can review and one-tap "Order again".
function PastOrdersModal({ orders, archived, trucks, onStatus, onAssign, onCancel, onEdited, onCreated, onArchived, onDriver, onClose }) {
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState("");
  const [openCust, setOpenCust] = useState(null);   // which customer group is expanded
  const base = showArchived ? archived : orders;

  const needle = q.trim().toLowerCase();
  const filtered = base.filter((o) => !needle ||
    [o.customer, o.ref, o.site, o.project, o.mix].some((v) => String(v || "").toLowerCase().includes(needle)));

  // group by customer; customers with the most past orders first
  const groups = {};
  filtered.forEach((o) => { (groups[o.customer || "—"] = groups[o.customer || "—"] || []).push(o); });
  const custNames = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length || a.localeCompare(b));
  const autoOpen = needle && custNames.length <= 4;   // expand results when the search narrows it down

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Inbox size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">{showArchived ? "Archived" : "Past orders"} · {filtered.length}</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="px-4 pt-3 pb-1 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => { setShowArchived(false); setOpenCust(null); }} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: showArchived ? NAVY : ORANGE + "22", color: showArchived ? "rgba(255,255,255,0.5)" : ORANGE, border: `1px solid ${showArchived ? "rgba(255,255,255,0.12)" : ORANGE}`, fontFamily: C.body }}>Past orders ({orders.length})</button>
            <button onClick={() => { setShowArchived(true); setOpenCust(null); }} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: showArchived ? ORANGE + "22" : NAVY, color: showArchived ? ORANGE : "rgba(255,255,255,0.5)", border: `1px solid ${showArchived ? ORANGE : "rgba(255,255,255,0.12)"}`, fontFamily: C.body }}>Archived ({archived.length})</button>
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)" }}>
            <Search size={15} className="text-white/40 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer, ticket #, job, mix…" className="bg-transparent outline-none text-sm text-white w-full" style={{ fontFamily: C.body }} />
            {q && <button onClick={() => setQ("")} className="text-white/40 active:scale-90 shrink-0"><X size={14} /></button>}
          </div>
        </div>
        <div className="p-4 pt-2 overflow-y-auto" style={{ fontFamily: C.body }}>
          {custNames.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center">{needle ? "No matches." : (showArchived ? "No archived orders." : "No completed orders yet.")}</div>
          ) : (
            custNames.map((name) => {
              const list = groups[name];
              const open = openCust === name || autoOpen;
              return (
                <div key={name} className="mb-2">
                  <button onClick={() => setOpenCust(open && openCust === name ? null : name)} className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 active:scale-[0.99]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="flex items-center gap-2 min-w-0">
                      <Building2 size={15} className="shrink-0" style={{ color: ORANGE }} />
                      <span className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{name}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: ORANGE + "22", color: ORANGE }}>{list.length}</span>
                      <ChevronRight size={16} className="text-white/40" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                    </span>
                  </button>
                  {open && (
                    <div className="mt-2">
                      {list.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={onStatus} onAssign={onAssign} onCancel={onCancel} onEdited={onEdited} onCreated={onCreated} onArchived={onArchived} onDriver={onDriver} />)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Per-customer COST TRACKING (finance only). For every completed order — including
// archived ones, so the history stays complete — it pulls the same pricing the
// Ticket-details panel shows: what we billed the customer (customer.total) and what
// goes to the hauler. The hauler gets the delivery/mileage cost PLUS the short-load
// and back-haul fees (those are billed to the customer but passed through to the
// hauler, not kept by us). Groups it by customer with per-customer + grand totals,
// filterable by a From/To date range, and "Export PDF" opens a clean printable sheet.
function CostsModal({ orders, onClose }) {
  const [px, setPx] = useState({});        // ref -> { billed, toHauler, yards, error }
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(() => monthBounds().first);   // default range: this month
  const [to, setTo] = useState(() => monthBounds().last);
  const [openCust, setOpenCust] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const list = orders || [];
      // Map one order's backend pricing payload into the row shape this modal uses.
      const shape = (o, p) => {
        if (!p || p.error) return { billed: null, toHauler: null, yards: o.qty, error: true };
        const cp = p.customer, dl = p.delivery;
        const billed = cp && cp.total != null ? Number(cp.total) : null;
        // To the hauler = delivery/mileage cost + short-load fee + back-haul fee.
        const haulMi = dl && dl.total != null ? Number(dl.total) : null;
        const fees = cp ? (Number(cp.short_load) || 0) + (Number(cp.backhaul) || 0) : 0;
        const toHauler = (haulMi != null || fees) ? (haulMi || 0) + fees : null;
        const yards = p.billed_qty != null ? p.billed_qty : o.qty;
        // base (pre-tax) price per yard: the sheet/override unit price, plus the
        // concrete-only extended (unit × yards) so subtotals blend correctly.
        const unit = cp && cp.unit_price != null ? Number(cp.unit_price) : null;
        const ext = cp && cp.extended != null ? Number(cp.extended) : null;
        // Fiber used — itemized from the admixture lines the backend already
        // priced (label carries the lbs, e.g. "Fiber (60 lb @ $3.75/lb)"). It's
        // included in `billed`; we surface it as its own column.
        const fiber = ((cp && cp.admixtures) || []).find((a) => /fiber/i.test(a && a.label || ""));
        const fiberAmt = fiber ? Number(fiber.amount) || 0 : 0;
        const lbM = fiber && /([\d.]+)\s*lb/i.exec(fiber.label || "");
        const fiberLbs = lbM ? Number(lbM[1]) : 0;
        return { billed, toHauler, yards, unit, ext, fiberAmt, fiberLbs };
      };
      // ONE request prices every order server-side — firing one request per order
      // used to flood the backend and lock the database, which broke the dispatch
      // board's poll ("Couldn't load dispatch data") and stuck this screen loading.
      try {
        const byRef = await getOrdersPricingBulk(list.map((o) => o.ref));
        if (live) setPx(Object.fromEntries(list.map((o) => [o.ref, shape(o, byRef[o.ref])])));
      } catch {
        if (live) setPx(Object.fromEntries(list.map((o) => [o.ref, { billed: null, toHauler: null, yards: o.qty, error: true }])));
      }
      if (live) setLoading(false);
    })();
    return () => { live = false; };
  }, [orders]);

  const money = (v) => (v == null ? "—" : `$${Number(v).toFixed(2)}`);

  const needle = q.trim().toLowerCase();
  const inText = (o) => !needle ||
    [o.customer, o.ref, o.site, o.project, o.mix, orderDateUS(o.when), o.when]
      .some((v) => String(v || "").toLowerCase().includes(needle));
  const inRange = (o) => {
    const d = (o.when || "").trim();   // ISO yyyy-mm-dd → string compare is chronological
    if (from && (!d || d < from)) return false;
    if (to && (!d || d > to)) return false;
    return true;
  };
  const filtered = (orders || []).filter((o) => inText(o) && inRange(o));

  // group by customer (alphabetical), each list earliest order first
  const groups = {};
  filtered.forEach((o) => { (groups[o.customer || "—"] = groups[o.customer || "—"] || []).push(o); });
  Object.values(groups).forEach((list) => list.sort((a, b) => String(a.when).localeCompare(String(b.when))));
  const custNames = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  const autoOpen = needle && custNames.length <= 4;

  const sumFor = (list) => list.reduce((acc, o) => {
    const r = px[o.ref] || {};
    if (r.billed != null) acc.billed += r.billed;
    if (r.toHauler != null) acc.toHauler += r.toHauler;
    if (r.ext != null) acc.ext += r.ext;   // concrete-only $ (pre-tax/fees) → blended base $/yd
    if (r.fiberAmt) acc.fiber += r.fiberAmt;
    if (r.fiberLbs) acc.fiberLbs += r.fiberLbs;
    if (r.billed != null && r.yards != null && Number(r.yards) > 0) acc.yards += Number(r.yards);   // yards that have a billed total → blended $/yd
    if (r.unit != null && Number(r.unit) > 0) acc.units.add(Number(r.unit).toFixed(2));   // distinct sheet rates in the group
    return acc;
  }, { billed: 0, toHauler: 0, yards: 0, ext: 0, fiber: 0, fiberLbs: 0, units: new Set() });
  const grand = sumFor(filtered);

  // Open a clean, printable PDF (new tab → "Print / Save as PDF"): a one-row-per-
  // customer SUMMARY page, then a page break and the per-customer DETAIL tables.
  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) { setErr("Allow pop-ups to open the PDF."); return; }
    setErr("");
    const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const m = (v) => (v == null ? "—" : `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    // Base price per yard = the price-sheet rate (concrete only, BEFORE tax/fees).
    // perYd(concrete $, yards) is used for subtotals (a yards-weighted blend);
    // basePerYd shows a single order's exact sheet/override unit price.
    const perYd = (val, yards) => (val == null || !(Number(yards) > 0)) ? "—" : `${m(val / Number(yards))}/yd`;
    const basePerYd = (r) => (r && r.unit != null && Number(r.unit) > 0) ? `${m(r.unit)}/yd` : perYd(r && r.ext, r && r.yards);
    // Summary/subtotal base $/yd: the flat sheet rate when every order in the
    // group is at one rate; only blend (concrete $ ÷ yards) when rates differ.
    const groupBase = (t) => (t.units && t.units.size === 1) ? `${m(Number([...t.units][0]))}/yd` : perYd(t.ext, t.yards);
    // Fiber used: lbs · $ charged (blank when no fiber on the order/group).
    const fiberCell = (amt, lbs) => {
      const parts = [];
      if (lbs) parts.push(`${Number(lbs).toLocaleString("en-US", { maximumFractionDigits: 1 })} lb`);
      if (amt) parts.push(m(amt));
      return parts.length ? parts.join(" · ") : "—";
    };
    const stamp = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const period = (from || to)
      ? `${from ? (orderDateUS(from) || from) : "start"} – ${to ? (orderDateUS(to) || to) : "today"}`
      : "All dates";

    // Page 1 — summary: one row per customer.
    const summaryRows = custNames.map((name) => {
      const t = sumFor(groups[name]);
      return `<tr><td>${esc(name)}</td><td class="r">${groups[name].length}</td><td class="r">${m(t.billed)}</td><td class="r">${fiberCell(t.fiber, t.fiberLbs)}</td><td class="r">${groupBase(t)}</td><td class="r">${m(t.toHauler)}</td></tr>`;
    }).join("");

    // Detail — per-customer tables (kept whole, won't split across a page).
    const sections = custNames.map((name) => {
      const list = groups[name];
      const t = sumFor(list);
      const rows = list.map((o) => {
        const r = px[o.ref] || {};
        return `<tr><td>${orderDateUS(o.when) || esc(o.when) || ""}</td><td>${esc(o.ref)}</td><td>${esc(o.mix || "")}</td><td class="job">${esc(o.site || "")}</td><td class="r">${r.yards != null ? esc(r.yards) : ""}</td><td class="r">${r.error ? "—" : fiberCell(r.fiberAmt, r.fiberLbs)}</td><td class="r">${r.error ? "—" : m(r.billed)}</td><td class="r">${r.error ? "—" : basePerYd(r)}</td><td class="r">${r.error ? "—" : m(r.toHauler)}</td></tr>`;
      }).join("");
      return `<section class="cust"><h2>${esc(name)} <span class="ct">· ${list.length} order${list.length === 1 ? "" : "s"}</span></h2>
<table><thead><tr><th>Date</th><th>Ticket #</th><th>Mix</th><th class="job">Job</th><th class="r">Yards</th><th class="r">Fiber</th><th class="r">Billed</th><th class="r">Base $/yd</th><th class="r">To hauler</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="5" class="r">Subtotal</td><td class="r">${fiberCell(t.fiber, t.fiberLbs)}</td><td class="r">${m(t.billed)}</td><td class="r">${groupBase(t)}</td><td class="r">${m(t.toHauler)}</td></tr></tfoot></table></section>`;
    }).join("");

    const empty = custNames.length === 0;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aussieblock costs — ${esc(period)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#161d27;margin:28px;font-size:13px;line-height:1.4;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .brand{display:flex;align-items:center;gap:16px;border-bottom:3px solid #e7732a;padding-bottom:14px;}
  .brand .logo{height:52px;width:auto;display:block;}
  .brand-words{flex:1;}
  .brand-name{font-size:22px;font-weight:bold;letter-spacing:.06em;color:#161d27;}
  .brand-sub{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#e7732a;font-weight:bold;margin-top:3px;}
  .brand-meta{text-align:right;font-size:11px;color:#667;line-height:1.7;}
  .brand-meta .ml{text-transform:uppercase;letter-spacing:.05em;color:#9aa1ab;font-size:9.5px;}
  .foot{margin-top:24px;border-top:1px solid #e2e6ea;padding-top:10px;color:#667;font-size:11px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;}
  .foot .co{font-weight:bold;color:#161d27;}
  h1{color:#e7732a;margin:0;font-size:22px;letter-spacing:.5px;}
  h2{font-size:15px;margin:20px 0 6px;color:#161d27;border-left:4px solid #e7732a;padding-left:8px;}
  h2 .ct{color:#889;font-size:12px;font-weight:normal;}
  .muted{color:#667;font-size:12px;}
  .sum{display:flex;flex-wrap:wrap;gap:26px;background:#f6f7f9;border-radius:10px;padding:14px 18px;margin-top:16px;}
  .lab{color:#667;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
  .big{font-size:19px;font-weight:bold;margin-top:2px;}
  .sec-title{font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.06em;color:#889;margin:22px 0 6px;}
  table{width:100%;border-collapse:collapse;margin-top:4px;}
  th,td{text-align:left;padding:7px 8px;}
  thead th{color:#667;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1.5px solid #c9ced4;}
  tbody td{border-bottom:1px solid #eceef1;}
  tbody tr:nth-child(even){background:#f7f8fa;}
  .r{text-align:right;white-space:nowrap;}
  .job{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  tfoot td{border-top:2px solid #c9ced4;font-weight:bold;padding-top:8px;}
  .cust{page-break-inside:avoid;page-break-before:always;margin-bottom:6px;}
  thead{display:table-header-group;}
  button{background:#e7732a;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer;margin-top:26px;}
  @media print{button{display:none;}body{margin:0;}}
</style></head>
<body>
  <header class="brand">
    <svg class="logo" viewBox="54 54 517 374" xmlns="http://www.w3.org/2000/svg"><path d="${LOGO_TILE}" fill="#161d27"/><path d="${LOGO_ROO}" fill="#e7732a"/></svg>
    <div class="brand-words">
      <div class="brand-name">AUSSIEBLOCK READY MIX</div>
      <div class="brand-sub">Customer Cost Report</div>
    </div>
    <div class="brand-meta">
      <div><span class="ml">Generated</span> ${stamp}</div>
      <div><span class="ml">Period</span> ${esc(period)}</div>
    </div>
  </header>
  <div class="sum">
    <div><div class="lab">Period</div><div class="big" style="font-size:15px;">${esc(period)}</div></div>
    <div><div class="lab">Total billed</div><div class="big">${m(grand.billed)}</div></div>
    <div><div class="lab">Total to hauler</div><div class="big">${m(grand.toHauler)}</div></div>
    <div><div class="lab">Orders</div><div class="big">${filtered.length}</div></div>
  </div>
  ${empty ? `<p class="muted" style="margin-top:24px;">No completed orders in this period.</p>` : `
  <div class="sec-title">Summary by customer</div>
  <table>
    <thead><tr><th>Customer</th><th class="r">Orders</th><th class="r">Billed</th><th class="r">Fiber</th><th class="r">Base $/yd</th><th class="r">To hauler</th></tr></thead>
    <tbody>${summaryRows}</tbody>
    <tfoot><tr><td>TOTAL</td><td class="r">${filtered.length}</td><td class="r">${m(grand.billed)}</td><td class="r">${fiberCell(grand.fiber, grand.fiberLbs)}</td><td class="r">${groupBase(grand)}</td><td class="r">${m(grand.toHauler)}</td></tr></tfoot>
  </table>
  ${sections}`}
  <div class="muted" style="margin-top:10px;font-size:11px;">“Base $/yd” = your price-sheet rate per yard — concrete only, before sales tax, fees &amp; admixtures (the flat sheet rate; only blended when a customer’s orders span different rates). “Fiber” = Mac Matrix fiber used (lbs · $ charged), already included in “Billed”. “Billed” is the full amount the customer paid, including tax, fiber &amp; any fees. “To hauler” = delivery (mileage) cost + short-load + back-haul fees. Completed orders only.</div>
  <div class="foot">
    <span class="co">Aussieblock Ready Mix</span>
    <span>Office 325-213-5315 &middot; Dispatch 940-577-7475</span>
  </div>
  <button onclick="window.print()">Print / Save as PDF</button>
  <button onclick="window.close()" style="background:#161d27;margin-left:8px;">Close</button>
</body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><ClipboardList size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Customer costs · {filtered.length}</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>

        <div className="px-4 pt-3 pb-1 shrink-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)" }}>
              <Search size={15} className="text-white/40 shrink-0" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer, ticket #, job, mix…" className="bg-transparent outline-none text-sm text-white w-full" style={{ fontFamily: C.body }} />
              {q && <button onClick={() => setQ("")} className="text-white/40 active:scale-90 shrink-0"><X size={14} /></button>}
            </div>
            <button onClick={exportPdf} disabled={loading || filtered.length === 0} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold active:scale-95 transition-transform disabled:opacity-40" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
              <Printer size={15} /> PDF
            </button>
          </div>
          {err && <div className="rounded-lg px-2.5 py-1.5 text-xs mb-2" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>{err}</div>}
          {/* date range filter */}
          <div className="flex items-center gap-2 mb-2.5">
            <CalendarDays size={14} className="shrink-0" style={{ color: ORANGE }} />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="rounded-lg px-2 py-1.5 text-xs outline-none" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
            <span className="text-white/40 text-xs shrink-0" style={{ fontFamily: C.body }}>to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="rounded-lg px-2 py-1.5 text-xs outline-none" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }} />
            {(from || to) && <button onClick={() => { setFrom(""); setTo(""); }} className="text-white/45 text-xs px-2 py-1 rounded-lg active:scale-95 shrink-0" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>Clear</button>}
          </div>
          {/* grand totals */}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 mb-1" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-white/45 text-[11px] uppercase tracking-wide" style={{ fontFamily: C.body }}>All shown</span>
            <span className="ml-auto text-xs" style={{ fontFamily: C.body }}>
              <span className="text-white/45">Billed </span><span className="font-bold" style={{ color: ORANGE }}>{money(grand.billed)}</span>
            </span>
            <span className="text-xs" style={{ fontFamily: C.body }}>
              <span className="text-white/45">To hauler </span><span className="font-bold text-white">{money(grand.toHauler)}</span>
            </span>
          </div>
        </div>

        <div className="p-4 pt-2 overflow-y-auto" style={{ fontFamily: C.body }}>
          {loading ? (
            <div className="text-white/45 text-sm py-8 text-center flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Pulling pricing for {orders.length} order{orders.length === 1 ? "" : "s"}…</div>
          ) : custNames.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center">{needle ? "No matches." : "No completed orders yet."}</div>
          ) : (
            custNames.map((name, ci) => {
              const list = groups[name];
              const open = openCust === name || autoOpen;
              const t = sumFor(list);
              const last = ci === custNames.length - 1;
              return (
                <div key={name} className={last ? "mb-2" : "mb-4 pb-4"} style={last ? undefined : { borderBottom: "2px solid rgba(255,255,255,0.12)" }}>
                  <button onClick={() => setOpenCust(open && openCust === name ? null : name)} className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 active:scale-[0.99]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="flex items-center gap-2 min-w-0">
                      <Building2 size={15} className="shrink-0" style={{ color: ORANGE }} />
                      <span className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{name}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: ORANGE + "22", color: ORANGE }}>{list.length}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-right leading-tight">
                        <span className="block text-xs font-bold" style={{ color: ORANGE }}>{money(t.billed)}</span>
                        <span className="block text-[10px] text-white/45">to hauler {money(t.toHauler)}</span>
                      </span>
                      <ChevronRight size={16} className="text-white/40" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                    </span>
                  </button>
                  {open && (
                    <div className="mt-1.5 mb-1">
                      {list.map((o) => {
                        const r = px[o.ref] || {};
                        return (
                          <div key={o.ref} className="grid items-center gap-2 px-3 py-1.5" style={{ gridTemplateColumns: "1fr auto", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="min-w-0">
                              <div className="text-white/85 text-xs font-semibold truncate" style={{ fontFamily: C.body }}>{orderDateUS(o.when) || o.when || "—"} · {o.ref}</div>
                              <div className="text-white/40 text-[11px] truncate" style={{ fontFamily: C.body }}>{o.mix || "—"} · {r.yards != null ? `${r.yards} yd` : o.qty}{o.site ? ` · ${o.site}` : ""}</div>
                            </div>
                            <div className="text-right shrink-0 leading-tight">
                              <span className="block text-sm font-bold" style={{ color: r.error ? "#ff8a85" : "#fff", fontFamily: C.body }}>{r.error ? "error" : money(r.billed)}</span>
                              <span className="block text-[10px] text-white/45" style={{ fontFamily: C.body }}>to hauler {money(r.toHauler)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarModal({ orders, trucks, onStatus, onAssign, onCancel, onEdited, onCreated, onDriver, onClose }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const todayKey = localToday();
  const [selected, setSelected] = useState(todayKey);

  const active = orders.filter((o) => o.status !== "complete");
  const byDay = {};
  for (const o of active) (byDay[o.when] ||= []).push(o);
  for (const day of Object.keys(byDay)) byDay[day].sort(byTimeAsc);   // earliest first within each day
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
              const hasClash = (byDay[key] || []).some((o) => o.clash && o.clash.length);
              return (
                <button key={i} onClick={() => setSelected(key)} className="relative aspect-square rounded-lg p-1 flex flex-col items-center active:scale-95 transition-transform overflow-hidden"
                  style={{ background: isSel ? ORANGE + "26" : NAVY, border: `1px solid ${isSel ? ORANGE : hasClash ? WARN : isToday ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.05)"}` }}>
                  {hasClash && <AlertTriangle size={11} color={WARN} className="absolute top-0.5 right-0.5" />}
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
              selOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={onStatus} onAssign={onAssign} onCancel={onCancel} onEdited={onEdited} onCreated={onCreated} onDriver={onDriver} />)
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
  const canFinance = useContext(FinanceContext);   // workers don't see the COD payment box
  const drivers = useContext(DriversContext);
  const [customers, setCustomers] = useState([]);
  const [custFilter, setCustFilter] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [site, setSite] = useState(initial?.site || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(/^\d{2}:\d{2}/.test(initial?.time || "") ? initial.time : "");
  const [truck, setTruck] = useState("");
  const [driver, setDriver] = useState("");
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
  const spec = useConcreteSpec(initial, selCust?.name);   // single-mix customers (Landers) lock the mix
  const f = custFilter.trim().toLowerCase();
  const shown = f ? customers.filter((c) => c.name.toLowerCase().includes(f)).slice(0, 25) : [];
  const canSubmit = customerId && site.trim() && spec.valid && date >= localToday() && !busy;

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let finalNotes = notes.trim();
      if (spec.shortNote) finalNotes = (finalNotes ? finalNotes + " — " : "") + spec.shortNote;
      const o = await createOrder({ customer_id: customerId, site: site.trim(), scheduled_for: date, time, truck: truck || null, driver, notes: finalNotes, ...spec.build() });
      if (o.prepay_required && canFinance) { setCreated(o); setBusy(false); }   // COD → show payment box (staff only)
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
            <div className="text-xs font-semibold mb-3" style={{ color: "#6aa9ff" }}>{created.customer} is COD — send a payment request to the office to generate an invoice.</div>
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
              {selCust.cod && <div className="mt-1.5 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5" style={{ background: "#6aa9ff1a", color: "#6aa9ff", fontFamily: C.body }}><CreditCard size={13} /> COD customer — send a payment request to the office to generate an invoice.</div>}
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
            <div className="min-w-0"><label className={lbl}>Time (optional)</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inCls} style={inSt} /></div>
          </div>

          <label className={lbl}>Truck (optional)</label>
          <select value={truck} onChange={(e) => setTruck(e.target.value)} className={inCls} style={inSt}>
            <option value="">Unassigned</option>
            {trucks.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
          <p className="text-white/35 text-xs mt-1 mb-3">Assign a truck now or later from the board.</p>

          <label className={lbl}>Driver (optional)</label>
          <select value={driver} onChange={(e) => setDriver(e.target.value)} className={inCls + " mb-3"} style={inSt}>
            <option value="">Unassigned</option>
            {drivers.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

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
// First and last calendar day of the current local month, as ISO yyyy-mm-dd.
// Used to default the Costs date range to "this month".
function monthBounds() {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth();   // m is 0-based
  const p = (n) => String(n).padStart(2, "0");
  const last = new Date(y, m + 1, 0).getDate();   // day 0 of next month = last day of this one
  return { first: `${y}-${p(m + 1)}-01`, last: `${y}-${p(m + 1)}-${p(last)}` };
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
// Sort a day's orders by scheduled time, earliest first. Times are "HH:MM"
// (24-hour, from the time picker) so a string compare is chronological; orders
// with no time set sort to the bottom.
function byTimeAsc(a, b) {
  return String(a.time || "99:99").localeCompare(String(b.time || "99:99"));
}
// Order's scheduled date as US M/D/YYYY with no leading zeros: "2026-06-08" ->
// "6/8/2026". Returns "" for legacy/blank values so callers can fall back.
function orderDateUS(when) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((when || "").trim());
  return m ? `${Number(m[2])}/${Number(m[3])}/${m[1]}` : "";
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

// Staff price sheet: rates that fill the batch-ticket pricing block. Base $/yd by
// mix (+ internal haul), per-customer overrides, and the fee/tax settings.
function PriceSheetModal({ onClose }) {
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { getPriceSheet().then(setSheet).catch((e) => setMsg({ ok: false, text: e.message })); }, []);

  const set = (k, v) => setSheet((s) => ({ ...s, [k]: v }));
  const setRow = (list, i, k, v) => setSheet((s) => ({ ...s, [list]: s[list].map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const addRow = (list, blank) => setSheet((s) => ({ ...s, [list]: [...(s[list] || []), blank] }));
  const delRow = (list, i) => setSheet((s) => ({ ...s, [list]: s[list].filter((_, j) => j !== i) }));

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const clean = {
        tax_pct: Number(sheet.tax_pct) || 0,
        short_load_fee: Number(sheet.short_load_fee) || 0,
        short_load_under_yd: Number(sheet.short_load_under_yd) || 0,
        backhaul_per_yd: Number(sheet.backhaul_per_yd) || 0,
        backhaul_under_yd: Number(sheet.backhaul_under_yd) || 0,
        mixes: (sheet.mixes || []).filter((m) => (m.mix || "").trim()).map((m) => ({ mix: m.mix.trim(), price: Number(m.price) || 0, haul: Number(m.haul) || 0 })),
        overrides: (sheet.overrides || []).filter((o) => (o.customer || "").trim()).map((o) => ({ customer: o.customer.trim(), mix: (o.mix || "").trim(), price: Number(o.price) || 0 })),
        admixtures: (sheet.admixtures || []).filter((a) => (a.name || "").trim()).map((a) => ({ name: a.name.trim(), rate: Number(a.rate) || 0, per: a.per === "lb" ? "lb" : "yard" })),
        self_haul_customers: (sheet.self_haul_customers || []).filter((c) => (c || "").trim()).map((c) => c.trim()),
      };
      setSheet(await savePriceSheet(clean));
      setMsg({ ok: true, text: "Price sheet saved." });
    } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  };

  const inCls = "rounded-lg px-2 py-1.5 text-sm text-white outline-none w-full";
  const inSt = { background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body };
  const lbl = "text-white/50 text-[11px] uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ background: ORANGE }}>
          <div className="flex items-center gap-2"><Calculator size={18} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Price sheet</span></div>
          <button onClick={onClose} title="Close" className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        {!sheet ? (
          <div className="p-8 text-center text-white/50" style={{ fontFamily: C.body }}>Loading…</div>
        ) : (
          <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
            {/* settings */}
            <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Settings</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <label><span className={lbl}>Sales tax %</span><input type="number" step="0.01" value={sheet.tax_pct} onChange={(e) => set("tax_pct", e.target.value)} className={inCls} style={inSt} /></label>
              <label><span className={lbl}>Short-load fee $</span><input type="number" value={sheet.short_load_fee} onChange={(e) => set("short_load_fee", e.target.value)} className={inCls} style={inSt} /></label>
              <label><span className={lbl}>…when order under (yd)</span><input type="number" value={sheet.short_load_under_yd} onChange={(e) => set("short_load_under_yd", e.target.value)} className={inCls} style={inSt} /></label>
              <label><span className={lbl}>Back-haul $/yd</span><input type="number" value={sheet.backhaul_per_yd} onChange={(e) => set("backhaul_per_yd", e.target.value)} className={inCls} style={inSt} /></label>
              <label><span className={lbl}>…when load under (yd)</span><input type="number" value={sheet.backhaul_under_yd} onChange={(e) => set("backhaul_under_yd", e.target.value)} className={inCls} style={inSt} /></label>
            </div>

            {/* mixes */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-white/50 text-xs uppercase tracking-wide">Mix prices ($/yd)</div>
              <button onClick={() => addRow("mixes", { mix: "", price: "", haul: "" })} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ORANGE + "22", color: ORANGE }}>+ Add mix</button>
            </div>
            <div className="grid gap-1.5 mb-1 text-white/40 text-[10px] uppercase" style={{ gridTemplateColumns: "1fr 90px 90px 28px" }}><span>Mix / product</span><span>Price/yd</span><span>Haul/yd</span><span></span></div>
            {(sheet.mixes || []).map((m, i) => (
              <div key={i} className="grid gap-1.5 mb-1.5 items-center" style={{ gridTemplateColumns: "1fr 90px 90px 28px" }}>
                <input value={m.mix} onChange={(e) => setRow("mixes", i, "mix", e.target.value)} placeholder="e.g. 3000 PSI" className={inCls} style={inSt} />
                <input type="number" value={m.price} onChange={(e) => setRow("mixes", i, "price", e.target.value)} className={inCls} style={inSt} />
                <input type="number" value={m.haul} onChange={(e) => setRow("mixes", i, "haul", e.target.value)} title="Haul portion (tracked, not printed)" className={inCls} style={inSt} />
                <button onClick={() => delRow("mixes", i)} className="p-1.5 rounded-lg active:scale-90" style={{ background: "rgba(239,83,80,0.12)" }}><Trash2 size={13} color="#ff8a85" /></button>
              </div>
            ))}
            {(sheet.mixes || []).length === 0 && <div className="text-white/30 text-xs py-1">No mixes yet — add one.</div>}
            <div className="text-white/35 text-[11px] mt-1 mb-4">Haul is the portion built into the price — tracked for your records, not printed on the ticket.</div>

            {/* overrides */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-white/50 text-xs uppercase tracking-wide">Customer overrides</div>
              <button onClick={() => addRow("overrides", { customer: "", mix: "", price: "" })} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#6aa9ff22", color: "#6aa9ff" }}>+ Add override</button>
            </div>
            <div className="grid gap-1.5 mb-1 text-white/40 text-[10px] uppercase" style={{ gridTemplateColumns: "1fr 1fr 90px 28px" }}><span>Customer</span><span>Mix (blank = any)</span><span>Price/yd</span><span></span></div>
            {(sheet.overrides || []).map((o, i) => (
              <div key={i} className="grid gap-1.5 mb-1.5 items-center" style={{ gridTemplateColumns: "1fr 1fr 90px 28px" }}>
                <input value={o.customer} onChange={(e) => setRow("overrides", i, "customer", e.target.value)} placeholder="Customer name" className={inCls} style={inSt} />
                <input value={o.mix} onChange={(e) => setRow("overrides", i, "mix", e.target.value)} placeholder="any mix" className={inCls} style={inSt} />
                <input type="number" value={o.price} onChange={(e) => setRow("overrides", i, "price", e.target.value)} className={inCls} style={inSt} />
                <button onClick={() => delRow("overrides", i)} className="p-1.5 rounded-lg active:scale-90" style={{ background: "rgba(239,83,80,0.12)" }}><Trash2 size={13} color="#ff8a85" /></button>
              </div>
            ))}

            {/* admixtures */}
            <div className="flex items-center justify-between mb-2 mt-4">
              <div className="text-white/50 text-xs uppercase tracking-wide">Admixture add-ons</div>
              <button onClick={() => addRow("admixtures", { name: "", rate: "", per: "yard" })} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: GREEN + "22", color: GREEN }}>+ Add admixture</button>
            </div>
            <div className="grid gap-1.5 mb-1 text-white/40 text-[10px] uppercase" style={{ gridTemplateColumns: "1fr 90px 90px 28px" }}><span>Name (as on protocol)</span><span>Rate $</span><span>Per</span><span></span></div>
            {(sheet.admixtures || []).map((a, i) => (
              <div key={i} className="grid gap-1.5 mb-1.5 items-center" style={{ gridTemplateColumns: "1fr 90px 90px 28px" }}>
                <input value={a.name} onChange={(e) => setRow("admixtures", i, "name", e.target.value)} placeholder="e.g. Fiber" className={inCls} style={inSt} />
                <input type="number" step="0.01" value={a.rate} onChange={(e) => setRow("admixtures", i, "rate", e.target.value)} className={inCls} style={inSt} />
                <select value={a.per} onChange={(e) => setRow("admixtures", i, "per", e.target.value)} className={inCls} style={inSt}>
                  <option value="yard">per yard</option>
                  <option value="lb">per lb</option>
                </select>
                <button onClick={() => delRow("admixtures", i)} className="p-1.5 rounded-lg active:scale-90" style={{ background: "rgba(239,83,80,0.12)" }}><Trash2 size={13} color="#ff8a85" /></button>
              </div>
            ))}
            <div className="text-white/35 text-[11px] mt-1">Charged when the admixture is on the order. "Per lb" uses the fiber lbs/yd from the order. Name it to match how it reads on the dornerBatch protocol.</div>

            {/* self-haul / pickup customers */}
            <div className="flex items-center justify-between mb-2 mt-4">
              <div className="text-white/50 text-xs uppercase tracking-wide">Self-haul / pickup customers</div>
              <button onClick={() => setSheet((s) => ({ ...s, self_haul_customers: [...(s.self_haul_customers || []), ""] }))} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#6aa9ff22", color: "#6aa9ff" }}>+ Add customer</button>
            </div>
            {(sheet.self_haul_customers || []).map((c, i) => (
              <div key={i} className="grid gap-1.5 mb-1.5 items-center" style={{ gridTemplateColumns: "1fr 28px" }}>
                <input value={c} onChange={(e) => setSheet((s) => ({ ...s, self_haul_customers: s.self_haul_customers.map((x, j) => (j === i ? e.target.value : x)) }))} placeholder="Customer name (exact)" className={inCls} style={inSt} />
                <button onClick={() => setSheet((s) => ({ ...s, self_haul_customers: s.self_haul_customers.filter((_, j) => j !== i) }))} className="p-1.5 rounded-lg active:scale-90" style={{ background: "rgba(239,83,80,0.12)" }}><Trash2 size={13} color="#ff8a85" /></button>
              </div>
            ))}
            <div className="text-white/35 text-[11px] mt-1">They buy concrete and haul it themselves — no delivery, short-load, or back-haul fees (concrete + admixtures + tax only).</div>

            {msg && <div className="rounded-lg px-3 py-2 mt-3 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85" }}>{msg.text}</div>}
            <button onClick={save} disabled={busy} className="w-full mt-4 rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save price sheet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DispatchApp({ email, role, onLogout }) {
  const canFinance = role !== "worker";   // full staff see financials/account info; workers don't
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);   // assignable driver names (from driver logins)
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showNew, setShowNew] = useState(false);   // "New order" modal
  const [showTrucks, setShowTrucks] = useState(false);   // "Manage trucks" modal
  const [showFuel, setShowFuel] = useState(false);       // "Fuel usage" modal
  const [showMixer, setShowMixer] = useState(false);     // "Mixer telemetry" modal
  const [showCal, setShowCal] = useState(false);   // "Delivery calendar" modal
  const [showPast, setShowPast] = useState(false);   // "Past orders" modal
  const [showCosts, setShowCosts] = useState(false);   // "Customer costs" tracking modal
  const [showLogins, setShowLogins] = useState(false);   // "Customer logins" modal
  const [showPrices, setShowPrices] = useState(false);   // "Price sheet" modal
  const [showStaff, setShowStaff] = useState(false);   // "Workers & staff" modal
  const [showDocs, setShowDocs] = useState(false);   // "Knowledge Center" modal
  const [showMaterials, setShowMaterials] = useState(false);   // cement & slag tracker modal
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
      const [os, ts, ds] = await Promise.all([getOrders(), getTrucks(), getDrivers().catch(() => [])]);
      setOrders(os);
      setTrucks(ts);
      setDrivers(ds || []);
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
  const setDriver = async (ref, driver) => applyOrder(await assignDriver(ref, driver));
  const cancelOrder = async (ref) => {
    await deleteOrder(ref);                                  // throws on failure -> row shows it
    setOrders((os) => os.filter((o) => o.ref !== ref));      // drop it from the board
  };

  const annotated = annotateClashes(orders);   // tag orders that share a date+time so the board can flag double-bookings
  const activeOrders = annotated.filter((o) => o.status !== "complete");
  const allCompleted = annotated.filter((o) => o.status === "complete").slice().sort((a, b) => String(b.when).localeCompare(String(a.when)));
  const completedOrders = allCompleted.filter((o) => !o.archived);
  const archivedOrders = allCompleted.filter((o) => o.archived);
  const today = localToday();
  // Live pours (>10 yd continuous pours actively being delivered) get their own
  // big column; they're pulled out of Today's/Upcoming so each shows in one place.
  // A pour still sitting at Scheduled stays in the schedule until it goes live.
  const LIVE_POUR_STATUS = ["batched", "enroute", "onsite", "pouring", "returning"];
  // A pour is "current" once it's in flight: its umbrella status is "ongoing"
  // (set when the pour starts), or it carries a stray truck stage. Scheduled /
  // requested / complete pours are not current.
  const isLivePour = (o) => o.is_pour && (o.status === "ongoing" || LIVE_POUR_STATUS.includes(o.status));
  const currentPours = activeOrders.filter(isLivePour).sort(byTimeAsc);
  const todayOrders = activeOrders.filter((o) => !isLivePour(o) && orderDay(o.when, today) === "today").sort(byTimeAsc);
  const upcomingOrders = activeOrders.filter((o) => !isLivePour(o) && orderDay(o.when, today) === "upcoming");
  const movingTrucks = trucks.filter((t) => t.lat != null && !isStale(t.updated_at)).length;

  // Each truck's status, derived from the order it's assigned to. (Later, GPS
  // geofences for the yard / job site will drive At yard vs On site automatically.)
  const statusToTruck = (status, ref, job) => {
    if (status === "returning") return { label: "Returning", color: "#4da3ff", order: ref, job };
    if (status === "pouring") return { label: "Pouring", color: GREEN, order: ref, job };
    if (status === "onsite") return { label: "On site", color: GREEN, order: ref, job };
    if (status === "enroute") return { label: "En route", color: ORANGE_HOT, order: ref, job };
    return { label: "Loading", color: ORANGE, order: ref, job };   // batched
  };
  const truckStatus = (t) => {
    // Order-level truck (a delivery assigned directly, no loads yet): match the order's own truck.
    const o = activeOrders.find((x) => (!x.loads || x.loads.length === 0) && x.truck === t.label && LIVE_POUR_STATUS.includes(x.status));
    if (o) return statusToTruck(o.status, o.ref, o);
    // Loads: the truck is assigned to a load, not the umbrella order. A truck can
    // have SEVERAL loads in a pour (it finished one and is now reloading), so pick
    // its ACTIVE load — the newest one in a live stage — not the first match (which
    // may be an already-completed load and would wrongly read as "At yard").
    let best = null;
    for (const p of activeOrders) {
      for (const ld of p.loads || []) {
        if (ld.truck !== t.label || !LIVE_POUR_STATUS.includes(ld.status)) continue;
        if (!best || (ld.seq || 0) >= (best.ld.seq || 0)) best = { ld, p };
      }
    }
    if (best) return statusToTruck(best.ld.status, best.p.ref, best.p);
    return { label: "At yard", color: "#7c8794" };
  };

  // Trucks heading back to the yard, with a clear ETA so dispatch can plan the next
  // load. Sorted soonest-first. (~30 mph, 1.3x straight-line for roads.) Keys off the
  // derived "Returning" stage, so it catches pour loads too (their order stays "ongoing").
  const _truckColors = truckColorMap(trucks);
  const returningTrucks = trucks
    .map((t) => {
      const s = truckStatus(t);
      if (s.label !== "Returning" || t.lat == null) return null;
      const mi = milesBetween({ lat: t.lat, lng: t.lng }, PLANT);
      const eta = mi != null ? Math.max(1, Math.round((mi * 1.3) / 30 * 60)) : null;
      return { label: t.label, eta, color: _truckColors[t.label] || ORANGE, ref: s.order };
    })
    .filter(Boolean)
    .sort((a, b) => (a.eta ?? 9999) - (b.eta ?? 9999));

  // Yard totals for planning: today's total, and upcoming grouped by day.
  const todayYards = todayOrders.reduce((sum, o) => sum + parseYards(o.qty), 0);
  // Live pour progress: how many yards have actually been produced (batched into
  // trucks) so far vs the ordered total, across every live pour.
  const pourProducedYards = currentPours.reduce((sum, o) => sum + (parseFloat(o.yards_loaded) || 0), 0);
  const pourTotalYards = currentPours.reduce((sum, o) => sum + parseYards(o.qty), 0);
  // Yards poured today = completed orders scheduled for today.
  // Poured today = actual yards delivered: for a pour that's the sum of its loads
  // (yards_loaded), for a single delivery it's the order quantity.
  const completedTodayYards = allCompleted.filter((o) => o.when === today)
    .reduce((sum, o) => sum + (o.is_pour && o.yards_loaded ? o.yards_loaded : parseYards(o.qty)), 0);
  const upcomingByDay = {};
  for (const o of upcomingOrders) (upcomingByDay[o.when || "—"] ||= []).push(o);
  for (const day of Object.keys(upcomingByDay)) upcomingByDay[day].sort(byTimeAsc);   // earliest first within each day
  const upcomingDays = Object.keys(upcomingByDay).sort();
  // Job-site dots for the map — today's deliveries + live pours, so staff can
  // eyeball that each address lands where the job actually is.
  const mapSites = [...currentPours, ...todayOrders]
    .filter((o) => o.site)
    .map((o) => ({ ref: o.ref, site: o.site, label: o.customer || o.ref }));

  if (loading) return <Splash label="Loading dispatch…" />;

  return (
    <FinanceContext.Provider value={canFinance}>
    <DriversContext.Provider value={drivers}>
    <div className="h-screen w-full" style={{ background: "#0c1117" }}>
      <style>{FONT}</style>
      {showCal && (
        <CalendarModal orders={annotated} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onDriver={setDriver} onClose={() => setShowCal(false)} />
      )}
      {showPast && (
        <PastOrdersModal orders={completedOrders} archived={archivedOrders} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onArchived={applyOrder} onDriver={setDriver} onClose={() => setShowPast(false)} />
      )}
      {showCosts && <CostsModal orders={allCompleted} onClose={() => setShowCosts(false)} />}
      {showPrices && <PriceSheetModal onClose={() => setShowPrices(false)} />}
      {showLogins && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setShowLogins(false)}>
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CustomerLogins orders={orders} trucks={trucks} onReordered={addOrder} />
            <button onClick={() => setShowLogins(false)} className="w-full mt-2 rounded-xl py-2 text-sm font-semibold text-white" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }}>Close</button>
          </div>
        </div>
      )}
      {showStaff && <ManageStaffModal onClose={() => { setShowStaff(false); refresh(); }} />}
      {showDocs && <ManageDocsModal onClose={() => setShowDocs(false)} />}
      {showMaterials && <MaterialsModal onClose={() => setShowMaterials(false)} />}
      {showTrucks && (
        <ManageTrucksModal onClose={() => setShowTrucks(false)} onChanged={refresh} />
      )}
      {showFuel && <FuelModal onClose={() => setShowFuel(false)} />}
      {showMixer && <MixerModal onClose={() => setShowMixer(false)} />}
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
          {/* title + actions (weather centered between them) */}
          <div className="flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2.5 flex-wrap min-w-0 flex-1">
              <h1 style={{ fontFamily: C.cond }} className="text-white text-xl font-bold leading-tight">Dispatch board</h1>
              <span className="flex items-center gap-2 rounded-full px-4 py-2 text-base" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}><Package size={17} color={ORANGE} /><span className="text-white/55">Today</span><span className="text-white font-bold">{todayOrders.length}</span></span>
              <span className="flex items-center gap-2 rounded-full px-4 py-2 text-base" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}><CalendarPlus size={17} color={ORANGE_HOT} /><span className="text-white/55">Scheduled</span><span className="text-white font-bold">{upcomingOrders.length}</span></span>
              <span className="flex items-center gap-2 rounded-full px-4 py-2 text-base" style={{ background: GREEN + "1a", border: `1px solid ${GREEN}55`, fontFamily: C.body }}><CheckCircle2 size={17} color={GREEN} /><span className="text-white/55">Poured today</span><span className="font-bold" style={{ color: GREEN }}>{fmtYards(completedTodayYards)} CY</span></span>
            </div>
            <div className="shrink-0 hidden md:flex"><WeatherBar /></div>
            <div className="flex items-center gap-2 flex-wrap justify-end flex-1">
              {installPrompt && (
                <button onClick={promptInstall} title="Install the dispatch board as an app so order alerts sound without a click" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold active:scale-95 transition-transform" style={{ background: GREEN, color: NAVY_DEEP, fontFamily: C.body }}>
                  <Download size={16} /> Install app
                </button>
              )}
              {canFinance && (
                <button onClick={() => setShowLogins(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                  <KeyRound size={16} color={ORANGE} /> Customers
                </button>
              )}
              {canFinance && (
                <button onClick={() => setShowPrices(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                  <Calculator size={16} color={ORANGE} /> Price sheet
                </button>
              )}
              {canFinance && (
                <button onClick={() => setShowCosts(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                  <ClipboardList size={16} color={ORANGE} /> Costs
                </button>
              )}
              {canFinance && (
                <button onClick={() => setShowStaff(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                  <User size={16} color={ORANGE} /> Workers
                </button>
              )}
              {canFinance && (
                <button onClick={() => setShowMaterials(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                  <Layers size={16} color={ORANGE} /> Materials
                </button>
              )}
              <button onClick={() => setShowDocs(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <BookOpen size={16} color={ORANGE} /> Knowledge
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
              <button onClick={() => setShowFuel(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <Droplets size={16} color={ORANGE} /> Fuel
              </button>
              <button onClick={() => setShowMixer(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.12)", fontFamily: C.body }}>
                <Activity size={16} color={ORANGE} /> Mixer
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

          {/* Returning to yard — at-a-glance reload planning. Big ETA per truck, soonest first. */}
          {returningTrucks.length > 0 && (
            <div className="mb-3 rounded-xl px-3 py-2 flex items-center gap-3 flex-wrap" style={{ background: "rgba(77,163,255,0.10)", border: "1px solid rgba(77,163,255,0.45)" }}>
              <span className="flex items-center gap-1.5 text-sm font-bold shrink-0 uppercase tracking-wide" style={{ color: "#4da3ff", fontFamily: C.cond }}>
                <Navigation size={16} /> Returning to yard
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {returningTrucks.map((t) => (
                  <span key={t.label} className="flex items-center gap-2 rounded-lg px-2.5 py-1" style={{ background: NAVY, border: `1px solid ${t.color}66`, borderLeft: `4px solid ${t.color}` }}>
                    <span className="text-white text-sm font-semibold" style={{ fontFamily: C.cond }}>{t.label}</span>
                    <span className="text-xl font-bold leading-none" style={{ color: "#4da3ff", fontFamily: C.cond }}>{t.eta != null ? `${t.eta} min` : "—"}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* main columns — fill the screen; each scrolls inside so the page doesn't.
              All pours gets the most room (the big continuous pours staff watch
              load-by-load); Today's is next; the map and Upcoming are reference
              columns. Completed orders aren't a column — they drop straight into the
              "Past orders" tab above. */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,2.9fr)_minmax(0,1.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-3">
            <Panel fill>
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0"><GoogleFleetMap trucks={trucks} sites={mapSites} /></div>
                <div className="shrink-0 overflow-y-auto flex flex-col gap-1 mt-2" style={{ maxHeight: "30%" }}>
                {trucks.length === 0 ? (
                  <div className="text-white/40 text-sm text-center py-2" style={{ fontFamily: C.body }}>No trucks — add them under “Trucks”.</div>
                ) : trucks.map((t) => {
                  const s = truckStatus(t);
                  const tColor = truckColorMap(trucks)[t.label] || ORANGE;
                  // ETA back to the yard while returning (straight-line ~30mph, 1.3x roads).
                  // Key off the derived stage so pour loads count too (their order stays "ongoing").
                  const yardMi = s.label === "Returning" && t.lat != null ? milesBetween({ lat: t.lat, lng: t.lng }, PLANT) : null;
                  const yardEta = yardMi != null ? Math.max(1, Math.round((yardMi * 1.3) / 30 * 60)) : null;
                  return (
                    <div key={t.label} className="flex items-center justify-between rounded-lg px-2.5 py-1" style={{ background: NAVY, border: `1px solid ${tColor}55`, borderLeft: `4px solid ${tColor}` }}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Truck size={14} color={tColor} />
                          <span className="text-white text-sm font-semibold truncate" style={{ fontFamily: C.cond }}>{t.label}</span>
                        </div>
                        {s.job ? (
                          <div className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.7)", fontFamily: C.body }}>
                            {s.job.ref} · {s.job.customer} · {s.job.site}{s.job.qty ? ` · ${s.job.qty}` : ""}
                          </div>
                        ) : (
                          <div className="text-white/35 text-xs truncate mt-0.5" style={{ fontFamily: C.body }}>No active job{t.notes ? ` · ${t.notes}` : ""}</div>
                        )}
                        {yardEta != null && (
                          <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#4da3ff", fontFamily: C.body }}>
                            <Navigation size={11} /> Back to yard · ~{yardEta} min
                          </div>
                        )}
                      </div>
                      <span className="shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: s.color + "22", color: s.color, fontFamily: C.body }}>{s.label}</span>
                      </span>
                    </div>
                  );
                })}
                </div>
              </div>
            </Panel>
            <Panel title="All pours" icon={Droplets} count={currentPours.length} fill>
              {currentPours.length === 0 ? (
                <div className="text-white/40 text-sm py-6 text-center" style={{ fontFamily: C.body }}>No pours right now. A continuous pour (&gt;10 yd) appears here once it goes live.</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3 rounded-lg px-3 py-2" style={{ background: NAVY }}>
                    <Droplets size={15} color={GREEN} />
                    <span className="text-white text-sm font-semibold" style={{ fontFamily: C.body }}>{fmtYards(pourProducedYards)} / {fmtYards(pourTotalYards)} CY produced</span>
                    <span className="text-white/40 text-xs" style={{ fontFamily: C.body }}>· {currentPours.length} pour{currentPours.length === 1 ? "" : "s"} live</span>
                  </div>
                  {currentPours.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onDriver={setDriver} />)}
                </>
              )}
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
                  {todayOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onDriver={setDriver} />)}
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
                      {dayOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={changeStatus} onAssign={assign} onCancel={cancelOrder} onEdited={applyOrder} onCreated={addOrder} onDriver={setDriver} compact />)}
                    </div>
                  );
                })
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
    </DriversContext.Provider>
    </FinanceContext.Provider>
  );
}

// On-screen signature pad: the customer signs with a finger/stylus on the tablet.
// White background so the captured PNG is legible anywhere. onSubmit(blob, name).
function SignaturePad({ orderRef, onCancel, onSubmit }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [name, setName] = useState("");
  const [water, setWater] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "#0c1117";
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p; if (!hasInk) setHasInk(true);
  };
  const end = () => { drawing.current = false; };
  const clear = () => {
    const c = canvasRef.current; const ctx = c.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width / ratio, c.height / ratio);
    setHasInk(false); setErr("");
  };
  const submit = () => {
    if (!hasInk) { setErr("Please have the customer sign above."); return; }
    if (!name.trim()) { setErr("Enter the name of who signed."); return; }
    setBusy(true); setErr("");
    canvasRef.current.toBlob((blob) => {
      Promise.resolve(onSubmit(blob, name.trim(), water.trim())).catch((e) => { setErr(e.message || "Could not save"); setBusy(false); });
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: ORANGE }}>
          <span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Customer sign-off · {orderRef}</span>
          <button onClick={onCancel} disabled={busy} className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5" style={{ fontFamily: C.body }}>
          <div className="text-white/60 text-xs mb-2">Have the customer sign below to confirm delivery.</div>
          <canvas ref={canvasRef} className="w-full rounded-xl touch-none" style={{ height: 200, background: "#fff", border: "2px solid rgba(255,255,255,0.15)" }}
            onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
          <div className="flex justify-end mt-1.5">
            <button onClick={clear} disabled={busy} className="text-xs font-semibold px-2.5 py-1 rounded-lg active:scale-95 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.6)", background: NAVY, border: "1px solid rgba(255,255,255,0.15)" }}><Trash2 size={12} /> Clear</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <label className="flex flex-col gap-1">
              <span className="text-white/40 text-[10px] uppercase tracking-wide">Printed name</span>
              <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="Who signed for it" className="rounded-lg px-3 py-2.5 text-base outline-none" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-white/40 text-[10px] uppercase tracking-wide">Water added (gal)</span>
              <input value={water} onChange={(e) => setWater(e.target.value)} placeholder="e.g. 5" inputMode="decimal" className="rounded-lg px-3 py-2.5 text-base outline-none" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }} />
            </label>
          </div>
          {err && <div className="mt-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}
          <button onClick={submit} disabled={busy} className="w-full mt-4 rounded-xl py-3 text-base font-bold active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: GREEN, color: NAVY_DEEP }}>
            {busy ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={18} /> Confirm delivery</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// The signed Delivery Ticket: order details + water added on site + the captured
// customer signature. In-app overlay (works in the installed PWA) with a
// Print / Save-PDF option. Shown wherever an order has_signature.
function DeliveryTicketModal({ order, onClose }) {
  const [sig, setSig] = useState(null);
  useEffect(() => {
    let live = true;
    if (order.has_signature) getSignatureDataUrl(order.ref).then((d) => live && setSig(d)).catch(() => {});
    return () => { live = false; };
  }, [order.ref, order.has_signature]);

  const signedAt = order.signed_at ? new Date(order.signed_at + "Z").toLocaleString() : "";
  const Row = ({ label, val }) => (val ? (
    <div className="flex justify-between gap-3 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="text-white/45 text-xs uppercase tracking-wide" style={{ fontFamily: C.body }}>{label}</span>
      <span className="text-white/90 text-sm text-right" style={{ fontFamily: C.body }}>{val}</span>
    </div>
  ) : null);

  const printTicket = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const r = (l, v) => v ? `<tr><td style="color:#667;padding:4px 0;text-transform:uppercase;font-size:11px">${l}</td><td style="text-align:right;padding:4px 0">${v}</td></tr>` : "";
    w.document.write(`<html><head><title>Delivery Ticket ${order.ref}</title></head>
      <body style="font-family:Arial,sans-serif;max-width:620px;margin:24px auto;color:#111">
      <h2 style="margin:0">AUSSIEBLOCK — Delivery Ticket</h2>
      <div style="color:#667;margin-bottom:12px">${order.ref}</div>
      <table style="width:100%;border-collapse:collapse;border-top:2px solid #111">
        ${r("Customer", order.customer)}${r("Job site", order.site)}${r("Project", order.project)}
        ${r("Mix", order.mix)}${r("Quantity", (order.qty || "") + " yd")}${r("Slump", order.slump)}
        ${r("Admixtures", order.admixtures)}${r("For", order.use_for)}
        ${r("Driver", order.driver)}${r("Truck", order.truck)}
        ${r("Water added on site", order.water_added ? order.water_added + " gal" : "")}
        ${r("Date / time", [order.when, order.time].filter(Boolean).join(" "))}
        ${r("Signed by", order.signed_by)}${r("Signed at", signedAt)}
      </table>
      ${sig ? `<div style="margin-top:16px"><div style="color:#667;font-size:11px;text-transform:uppercase">Customer signature</div><img src="${sig}" style="max-width:320px;border:1px solid #ccc;border-radius:6px;margin-top:4px"/></div>` : ""}
      <script>window.onload=function(){window.print()}</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: ORANGE }}>
          <span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Delivery ticket · {order.ref}</span>
          <button onClick={onClose} className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ fontFamily: C.body }}>
          <Row label="Customer" val={order.customer} />
          <Row label="Job site" val={order.site} />
          <Row label="Project" val={order.project} />
          <Row label="Mix" val={order.mix} />
          <Row label="Quantity" val={order.qty ? `${order.qty} yd` : ""} />
          <Row label="Slump" val={order.slump} />
          <Row label="Admixtures" val={order.admixtures} />
          <Row label="Driver" val={order.driver} />
          <Row label="Truck" val={order.truck} />
          <Row label="Water added on site" val={order.water_added ? `${order.water_added} gal` : "—"} />
          <Row label="Signed by" val={order.signed_by} />
          <Row label="Signed at" val={signedAt} />
          <div className="mt-3">
            <div className="text-white/45 text-xs uppercase tracking-wide mb-1">Customer signature</div>
            {order.has_signature ? (
              sig ? <img src={sig} alt="signature" className="w-full rounded-lg" style={{ background: "#fff", border: "1px solid rgba(255,255,255,0.15)" }} />
                  : <div className="text-white/40 text-xs py-3 flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Loading signature…</div>
            ) : <div className="text-white/40 text-xs py-3">Not signed yet.</div>}
          </div>
          <button onClick={printTicket} className="w-full mt-4 rounded-xl py-2.5 text-sm font-semibold active:scale-95 flex items-center justify-center gap-2" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// The DRIVER tablet app: today's deliveries assigned to this driver. Tap one to
// see details, open the batch ticket, and capture the customer's signature
// (which marks the delivery complete). No board, no billing.
function DriverApp({ driver, onLogout }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [activeRef, setActiveRef] = useState(null);
  const [signSeq, setSignSeq] = useState(null);   // null=closed, "order"=order-level, or a load seq number
  const [showTicket, setShowTicket] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);
  const [ticketPages, setTicketPages] = useState(null);   // in-app ticket viewer (PNG page data URLs)
  const [notesDraft, setNotesDraft] = useState("");        // driver's editable on-site notes
  const [notesBusy, setNotesBusy] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  // Manual fuel fill — driver enters truck #, gallons, optional mileage.
  const [showFuel, setShowFuel] = useState(false);
  const [fuelForm, setFuelForm] = useState({ truck_no: localStorage.getItem("driver_truck_no") || "", gallons: "", odometer: "" });
  const [fuelBusy, setFuelBusy] = useState(false);
  const [fuelMsg, setFuelMsg] = useState(null);
  const submitFuel = async () => {
    if (!fuelForm.truck_no.trim()) { setFuelMsg({ ok: false, text: "Enter your truck number." }); return; }
    if (!(Number(fuelForm.gallons) > 0)) { setFuelMsg({ ok: false, text: "Enter the gallons filled." }); return; }
    setFuelBusy(true); setFuelMsg(null);
    try {
      const r = await logManualFuel({ truck_no: fuelForm.truck_no.trim(), gallons: Number(fuelForm.gallons), odometer: fuelForm.odometer });
      localStorage.setItem("driver_truck_no", fuelForm.truck_no.trim());
      setFuelMsg({ ok: true, text: `Logged ${Number(fuelForm.gallons).toFixed(1)} gal${r && r.matched ? "" : " — truck # not recognized, saved as unmatched"}.` });
      setFuelForm((f) => ({ ...f, gallons: "", odometer: "" }));
    } catch (e) { setFuelMsg({ ok: false, text: e.message || "Could not log the fill" }); }
    finally { setFuelBusy(false); }
  };

  const load = async () => {
    try { setData(await getDriverOrders()); setErr(""); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);

  const orders = data?.orders || [];
  const active = orders.find((o) => o.ref === activeRef) || null;
  // A continuous pour keeps its tickets on the loads, not the order. Show the
  // driver ONLY the load(s) they drove (matched by name) — not the whole pour —
  // otherwise Rodney sees every truck's ticket instead of just his.
  const myName = (driver || "").trim().toLowerCase();
  const myLoads = (active?.loads || []).filter((l) => (l.driver || "").trim().toLowerCase() === myName);
  const isPour = myLoads.length > 0;   // a continuous pour: sign + show tickets per load

  // Load the saved notes into the editor when you open a delivery (only on open, so
  // the 20s background refresh never wipes out what the driver is mid-typing).
  useEffect(() => {
    const o = (data?.orders || []).find((x) => x.ref === activeRef);
    setNotesDraft(o?.driver_notes || ""); setNotesSaved(false);
  }, [activeRef]);   // eslint-disable-line react-hooks/exhaustive-deps

  const saveNotes = async () => {
    if (!active) return;
    setNotesBusy(true); setErr("");
    try { await saveDriverNotes(active.ref, notesDraft); setNotesSaved(true); await load(); }
    catch (e) { setErr(e.message || "Could not save notes"); }
    finally { setNotesBusy(false); }
  };

  // Open the order's ticket (single delivery) or one load's ticket (pour).
  const openTicket = async (seq = null) => {
    if (!active) return;
    setTicketBusy(true); setErr("");
    try {
      const res = seq != null ? await getLoadBatchTicketImages(active.ref, seq)
                              : await getBatchTicketImages(active.ref);
      const pages = res.pages || [];
      if (!pages.length) { setErr("No batch ticket pages to show yet."); return; }
      setTicketPages(pages);
    } catch (e) { setErr(e.message || "Could not open the ticket"); }
    finally { setTicketBusy(false); }
  };
  const submitSignature = async (blob, name, water) => {
    if (typeof signSeq === "number") await signOffLoad(active.ref, signSeq, blob, name, water);
    else await signOffOrder(active.ref, blob, name, water);
    setSignSeq(null);
    await load();
  };

  const Header = (
    <div className="px-4 pb-3 shrink-0" style={{ background: ORANGE, paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Truck size={28} color={NAVY_DEEP} />
          <div className="leading-none">
            <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-xl font-bold tracking-tight">DRIVER · {driver}</div>
            <div style={{ color: NAVY_DEEP, fontFamily: C.body }} className="text-[11px] font-semibold opacity-70 -mt-0.5">Today's deliveries · {BUILD_TAG}</div>
          </div>
        </div>
        <button onClick={onLogout} title="Log out" className="p-1.5 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><LogOut size={14} color={ORANGE} /></button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex justify-center sm:items-center sm:p-4 overflow-hidden" style={{ height: "100dvh", background: "#0c1117" }}>
      <style>{FONT}</style>
      <div className="w-full sm:max-w-xl h-full flex flex-col overflow-hidden" style={{ background: NAVY_DEEP, fontFamily: C.body }}>
        {Header}
        {err && <div className="px-4 py-2 text-xs shrink-0" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85" }}>{err}</div>}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 p-4">
          {!data ? (
            <div className="text-white/50 text-sm py-10 text-center flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading deliveries…</div>
          ) : !active ? (
            <>
              <button onClick={() => { setFuelMsg(null); setShowFuel(true); }} className="w-full rounded-xl py-3.5 mb-3 text-base font-bold active:scale-[0.99] flex items-center justify-center gap-2" style={{ background: ORANGE, color: NAVY_DEEP }}>
                <Droplets size={18} /> Fuel up — log a fill
              </button>
              {orders.length === 0 ? (
              <div className="text-white/40 text-sm py-10 text-center">No deliveries assigned for today.</div>
            ) : (
              orders.map((o) => {
                const sm = STATUS_META[o.status] || { label: o.status, color: "#7c8794" };
                return (
                  <button key={o.ref} onClick={() => setActiveRef(o.ref)} className="w-full text-left rounded-xl mb-2.5 p-3.5 active:scale-[0.99]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-base" style={{ fontFamily: C.cond }}>{o.project || o.customer || o.ref}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: sm.color + "22", color: sm.color }}>{sm.label}</span>
                    </div>
                    <div className="text-white/55 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {o.site}</div>
                    <div className="text-white/70 text-sm mt-1.5">{o.mix} · {o.qty} yd{o.time ? ` · ${o.time}` : ""}</div>
                    {o.has_signature && <div className="text-xs mt-1 flex items-center gap-1" style={{ color: GREEN }}><CheckCircle2 size={13} /> Signed by {o.signed_by}</div>}
                  </button>
                );
              })
              )}
            </>
          ) : (
            <div>
              <button onClick={() => setActiveRef(null)} className="flex items-center gap-1 text-sm mb-3" style={{ color: ORANGE }}><ChevronLeft size={16} /> All deliveries</button>

              {/* payment alert — drivers must know whether to collect before unloading */}
              {active.prepay_required && (
                active.prepaid ? (
                  <div className="rounded-xl py-2.5 px-3.5 mb-3 flex items-center gap-2" style={{ background: GREEN + "18", border: `1px solid ${GREEN}55` }}>
                    <CheckCircle2 size={18} color={GREEN} />
                    <span className="text-white font-semibold text-sm">Prepaid{active.prepay_amount ? ` · $${Number(active.prepay_amount).toFixed(2)}` : ""} — OK to deliver</span>
                  </div>
                ) : (
                  <div className="rounded-xl py-2.5 px-3.5 mb-3 flex items-center gap-2" style={{ background: "rgba(239,83,80,0.16)", border: "1px solid rgba(239,83,80,0.6)" }}>
                    <AlertTriangle size={18} color="#ff8a85" />
                    <span className="font-semibold text-sm" style={{ color: "#ffb3ae" }}>COLLECT{active.prepay_amount ? ` $${Number(active.prepay_amount).toFixed(2)}` : " payment"} before unloading — call dispatch if unsure.</span>
                  </div>
                )
              )}

              <div className="rounded-xl p-4 mb-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-white font-bold text-lg leading-tight" style={{ fontFamily: C.cond }}>{active.project || active.customer || active.ref}</div>
                  {(() => { const sm = STATUS_META[active.status] || { label: active.status, color: "#7c8794" }; return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: sm.color + "22", color: sm.color }}>{sm.label}</span>; })()}
                </div>
                {/* tappable address → opens turn-by-turn directions */}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(active.site || "")}`} target="_blank" rel="noreferrer" className="mt-2 rounded-lg px-3 py-2.5 flex items-center gap-2 active:opacity-70" style={{ background: "#6aa9ff14", color: "#9cc4ff", fontFamily: C.body }}>
                  <MapPin size={16} className="shrink-0" /> <span className="underline text-sm flex-1">{active.site || "No address"}</span> <span className="flex items-center gap-1 text-xs font-semibold shrink-0"><Navigation size={13} /> Directions</span>
                </a>
                <div className="grid grid-cols-2 gap-y-3 gap-x-3 mt-3.5 text-sm">
                  {[
                    ["Customer", active.customer], ["Order #", active.ref],
                    ["Mix", active.mix], ["Quantity", active.qty ? `${active.qty} yd` : null],
                    ["Time", active.time], ["Slump", active.slump],
                    ["For", active.use_for], ["Truck", active.truck && active.truck !== "—" ? active.truck : null],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}><div className="text-white/35 text-[10px] uppercase tracking-wide">{k}</div><div className="text-white/90 font-semibold">{v}</div></div>
                  ))}
                </div>
                {active.admixtures && <div className="mt-3 text-sm"><span className="text-white/35 text-[10px] uppercase tracking-wide">Admixtures</span><div className="text-white/90">{active.admixtures}</div></div>}
                {active.notes && <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: ORANGE + "14", color: "#ffd9bf" }}><span className="font-semibold uppercase text-[10px] tracking-wide block mb-0.5" style={{ color: ORANGE }}>Dispatch instructions</span>{active.notes}</div>}
              </div>

              {/* driver's on-site notes — saved to the order, visible to dispatch */}
              <div className="rounded-xl p-4 mb-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm font-bold flex items-center gap-1.5" style={{ fontFamily: C.cond }}><ClipboardList size={16} color={ORANGE} /> Driver notes</span>
                  {notesSaved && <span className="text-xs flex items-center gap-1" style={{ color: GREEN }}><Check size={13} /> Saved</span>}
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(e) => { setNotesDraft(e.target.value); setNotesSaved(false); }}
                  rows={3}
                  placeholder="Notes from the site — gate code, where to pour, who received it, any issues…"
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none placeholder:text-white/30"
                  style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.14)", fontFamily: C.body }}
                />
                <button onClick={saveNotes} disabled={notesBusy || notesDraft === (active.driver_notes || "")} className="w-full mt-2 rounded-lg py-2.5 text-sm font-bold active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: ORANGE, color: NAVY_DEEP }}>
                  {notesBusy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save notes
                </button>
              </div>

              {isPour ? (
                /* continuous pour: a ticket + customer signature for EACH of the driver's loads */
                <div className="mb-1">
                  <div className="text-white/55 text-xs font-semibold uppercase tracking-wide mb-2" style={{ fontFamily: C.body }}>Your load{myLoads.length > 1 ? "s" : ""} — sign each truck</div>
                  {myLoads.map((l) => {
                    const sm = STATUS_META[l.status] || { label: l.status, color: "#7c8794" };
                    return (
                      <div key={l.seq} className="rounded-xl p-3.5 mb-2.5" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold text-base" style={{ fontFamily: C.cond }}>Load {l.seq}{l.truck && l.truck !== "—" ? ` · ${l.truck}` : ""}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: sm.color + "22", color: sm.color }}>{sm.label}</span>
                        </div>
                        <button onClick={() => openTicket(l.seq)} disabled={ticketBusy || !l.has_batch_ticket} className="w-full rounded-lg py-2.5 mb-2 text-sm font-semibold active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: NAVY_DEEP, color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                          {ticketBusy ? <Loader2 size={15} className="animate-spin" /> : <FileText size={16} />} {l.has_batch_ticket ? "View batch ticket" : "No batch ticket yet"}
                        </button>
                        {l.has_signature ? (
                          <div className="rounded-lg py-2.5 px-3 flex items-center gap-2" style={{ background: GREEN + "18", border: `1px solid ${GREEN}55` }}>
                            <CheckCircle2 size={18} color={GREEN} />
                            <div>
                              <div className="text-white font-bold text-sm">Signed — {l.signed_by}</div>
                              <div className="text-white/50 text-xs">{l.signed_at ? new Date(l.signed_at + "Z").toLocaleString() : ""}{l.water_added ? ` · ${l.water_added} gal water` : ""}</div>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSignSeq(l.seq)} className="w-full rounded-lg py-3 text-base font-bold active:scale-95 flex items-center justify-center gap-2" style={{ background: GREEN, color: NAVY_DEEP }}>
                            <ClipboardList size={17} /> Get customer signature
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <button onClick={() => openTicket()} disabled={ticketBusy || !active.has_batch_ticket} className="w-full rounded-xl py-3 mb-2.5 text-base font-semibold active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                    {ticketBusy ? <Loader2 size={16} className="animate-spin" /> : <FileText size={18} />} {active.has_batch_ticket ? "View batch ticket" : "No batch ticket yet"}
                  </button>
                  {active.has_signature ? (
                    <>
                      <div className="rounded-xl py-3 px-4 flex items-center gap-2 mb-2.5" style={{ background: GREEN + "18", border: `1px solid ${GREEN}55` }}>
                        <CheckCircle2 size={20} color={GREEN} />
                        <div>
                          <div className="text-white font-bold text-sm">Customer signed — {active.signed_by}</div>
                          <div className="text-white/50 text-xs">{active.signed_at ? new Date(active.signed_at + "Z").toLocaleString() : ""}{active.water_added ? ` · ${active.water_added} gal water added` : ""}</div>
                        </div>
                      </div>
                      <button onClick={() => setShowTicket(true)} className="w-full rounded-xl py-3 text-base font-semibold active:scale-95 flex items-center justify-center gap-2" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                        <FileText size={18} /> View signed delivery ticket
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setSignSeq("order")} className="w-full rounded-xl py-3.5 text-base font-bold active:scale-95 flex items-center justify-center gap-2" style={{ background: GREEN, color: NAVY_DEEP }}>
                      <ClipboardList size={18} /> Get customer signature
                    </button>
                  )}
                </>
              )}

              {/* always-available help line */}
              <a href={`tel:${DISPATCH_TEL}`} className="w-full rounded-xl py-3 mt-2.5 text-base font-semibold active:scale-95 flex items-center justify-center gap-2" style={{ background: NAVY, color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                <Phone size={17} color={ORANGE} /> Call dispatch · {DISPATCH_PHONE}
              </a>
            </div>
          )}
        </div>
      </div>
      {signSeq != null && active && <SignaturePad orderRef={typeof signSeq === "number" ? `${active.ref} · Load ${signSeq}` : active.ref} onCancel={() => setSignSeq(null)} onSubmit={submitSignature} />}
      {showTicket && active && <DeliveryTicketModal order={active} onClose={() => setShowTicket(false)} />}
      {ticketPages && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: NAVY_DEEP }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: ORANGE, paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}>
            <span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-base font-bold flex items-center gap-2"><FileText size={18} /> Batch ticket{active ? ` · ${active.ref}` : ""}</span>
            <button onClick={() => setTicketPages(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold active:scale-95" style={{ background: NAVY_DEEP, color: ORANGE }}><X size={16} /> Close</button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-2" style={{ background: "#3a3f44" }}>
            {ticketPages.length === 0 ? (
              <div className="text-white/60 text-sm text-center py-10">Ticket has no viewable pages.</div>
            ) : ticketPages.map((src, i) => (
              <img key={i} src={src} alt={`Ticket page ${i + 1}`} className="w-full rounded shadow-lg mb-2" style={{ background: "#fff" }} />
            ))}
          </div>
        </div>
      )}
      {showFuel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setShowFuel(false)}>
          <div className="w-full sm:max-w-sm rounded-2xl overflow-hidden" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.12)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ background: ORANGE }}>
              <div className="flex items-center gap-2"><Droplets size={20} color={NAVY_DEEP} /><span style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-lg font-bold">Log a fuel fill</span></div>
              <button onClick={() => setShowFuel(false)} className="p-1 rounded-full active:scale-90" style={{ background: NAVY_DEEP }}><X size={16} color={ORANGE} /></button>
            </div>
            <div className="p-5">
              <label className="text-white/50 text-xs uppercase tracking-wide">Truck number</label>
              <input value={fuelForm.truck_no} onChange={(e) => setFuelForm({ ...fuelForm, truck_no: e.target.value })} inputMode="numeric" placeholder="e.g. 4554" className="w-full rounded-xl px-3 py-3 text-white text-lg outline-none mb-3 mt-1" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }} />
              <label className="text-white/50 text-xs uppercase tracking-wide">Gallons filled</label>
              <input value={fuelForm.gallons} onChange={(e) => setFuelForm({ ...fuelForm, gallons: e.target.value })} type="number" inputMode="decimal" placeholder="e.g. 45.0" className="w-full rounded-xl px-3 py-3 text-white text-lg outline-none mb-3 mt-1" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }} />
              <label className="text-white/50 text-xs uppercase tracking-wide">Current mileage (odometer)</label>
              <input value={fuelForm.odometer} onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })} type="number" inputMode="numeric" placeholder="optional" className="w-full rounded-xl px-3 py-3 text-white text-lg outline-none mb-3 mt-1" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.body }} />
              {fuelMsg && <div className="rounded-lg px-3 py-2 text-sm mb-3" style={{ background: fuelMsg.ok ? GREEN + "1f" : "rgba(239,83,80,0.14)", color: fuelMsg.ok ? GREEN : "#ff8a85" }}>{fuelMsg.text}</div>}
              <button onClick={submitFuel} disabled={fuelBusy} className="w-full rounded-xl py-3.5 text-base font-bold active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: ORANGE, color: NAVY_DEEP }}>
                {fuelBusy ? <Loader2 size={17} className="animate-spin" /> : <Check size={18} />} Log fill
              </button>
              <button onClick={() => setShowFuel(false)} className="w-full rounded-xl py-2.5 mt-2 text-sm font-semibold active:scale-95 text-white/70" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.12)" }}>Done</button>
            </div>
          </div>
        </div>
      )}
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

  // On first load, check whether a saved token is still valid — and honor a
  // quick-login link (?login=<base64 email:password>) so field crews can tap a
  // link and land in the app already signed in, no typing. We consume the token
  // then scrub it from the address bar so the credentials don't linger in
  // history/bookmarks. The login is saved, so later opens stay signed in too.
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const tok = params.get("login");
      if (tok) {
        try {
          const [email, ...rest] = atob(decodeURIComponent(tok)).split(":");
          await login(email, rest.join(":"));
          setMe(await getMe());
        } catch { /* bad/expired link — fall through to the normal login screen */ }
        params.delete("login");
        const clean = window.location.pathname + (params.toString() ? `?${params}` : "") + window.location.hash;
        window.history.replaceState({}, "", clean);
        setAuthChecked(true);
        return;
      }
      if (isLoggedIn()) {
        try { setMe(await getMe()); } catch { /* token expired/invalid — show login */ }
      }
      setAuthChecked(true);
    })();
  }, []);

  // Once logged in, load this customer's orders + billing — and KEEP THEM FRESH.
  // The list/account used to load only once, so customers had to manually refresh
  // to see status changes or new invoices. Now we poll every 7s (silently, no
  // spinner) and also refresh the instant the app regains focus (phone unlocked /
  // tab refocused), so updates show up on their own.
  // Staff don't have a customer account — they get the dispatch console instead.
  useEffect(() => {
    // Company-scoped users load this view: customers (orders + billing) and
    // workers (orders + tracking only). Staff use the dispatch board instead.
    if (!me || (me.role !== "customer" && me.role !== "worker")) return;
    let alive = true;
    const loadData = async (silent) => {
      if (!silent) { setLoading(true); setLoadError(""); }
      try {
        const os = await getOrders();
        const mapped = os.map((o) => ({ ...o, id: o.ref }));   // map backend `ref` -> the `id` the UI uses
        if (alive) {
          setOrders(mapped);
          // keep the order open on the Track screen fresh too, so it updates live
          // without the customer backing out and reopening it.
          setActive((prev) => (prev ? mapped.find((x) => x.ref === prev.ref) || prev : prev));
        }
        if (me.role === "customer" && me.customer_id != null) {   // workers never load billing
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
    const poll = setInterval(() => { if (alive) loadData(true); }, 7000);
    const onVisible = () => { if (document.visibilityState === "visible" && alive) loadData(true); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { alive = false; clearInterval(poll); document.removeEventListener("visibilitychange", onVisible); };
  }, [me]);

  // Re-fetch this customer's orders (e.g. right after they place a new one).
  const reloadOrders = async () => {
    try {
      const os = await getOrders();
      const mapped = os.map((o) => ({ ...o, id: o.ref }));
      setOrders(mapped);
      setActive((prev) => (prev ? mapped.find((x) => x.ref === prev.ref) || prev : prev));
    } catch { /* keep current list on transient error */ }
  };

  const open = (o) => { setActive(o); setScreen("track"); };
  const handleLogout = () => {
    logout();
    setMe(null); setOrders([]); setAccount(null); setActive(null); setScreen("home");
  };

  // Workers are a customer's field people: their company's orders + tracking, plus
  // the Estimate calculator (not confidential). No Account (billing). Customers
  // get the full nav including Account.
  const isWorker = me?.role === "worker";
  const nav = isWorker
    ? [{ k: "home", icon: List, label: "Orders" }, { k: "track", icon: MapPin, label: "Track" }, { k: "calc", icon: Calculator, label: "Estimate" }, { k: "docs", icon: BookOpen, label: "Docs" }]
    : [{ k: "home", icon: List, label: "Orders" }, { k: "track", icon: MapPin, label: "Track" }, { k: "calc", icon: Calculator, label: "Estimate" }, { k: "docs", icon: BookOpen, label: "Docs" }, { k: "account", icon: User, label: "Account" }];

  if (!authChecked) return <Splash label="Starting…" />;
  if (!me) return <LoginScreen onLoggedIn={setMe} />;
  if (me.role === "staff") return <DispatchApp email={me.email} role={me.role} onLogout={handleLogout} />;   // the dispatch board is the operator's only
  if (me.role === "driver") return <DriverApp driver={me.company || me.email} onLogout={handleLogout} />;   // truck tablet
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
          {screen === "track" && active ? <TrackScreen order={active} onBack={() => setScreen("home")} onChanged={reloadOrders} canFinance={!isWorker} />
            : screen === "docs" ? <KnowledgeScreen />
            : screen === "calc" ? <CalculatorScreen onPlaced={reloadOrders} companyName={me.company} />
            : screen === "account" && !isWorker ? <AccountScreen account={account} customerId={me.customer_id} />
            : <OrdersScreen orders={orders} account={account} onOpen={open} onPlaced={reloadOrders} canFinance={!isWorker} companyName={me.company} />}
        </div>

        {/* bottom nav */}
        <div className="shrink-0 flex items-center justify-around py-3" style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.06)", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          {nav.map(({ k, icon: Icon, label }) => {
            const on = screen === k;
            return (
              <button key={k} onClick={() => { if (k === "track") { const cur = pickCurrentOrder(orders); if (cur) { setActive(cur); setScreen("track"); } } else setScreen(k); }} className="flex flex-col items-center gap-1">
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

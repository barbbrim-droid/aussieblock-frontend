import { useState, useEffect } from "react";
import { Truck, MapPin, Clock, ChevronLeft, CheckCircle2, Circle, Plus, FileText, Bell, User, List, Building2, Send, CreditCard, ChevronRight, Phone, Download, LogOut, Loader2, RefreshCw, Inbox, Navigation, Activity, Package, KeyRound, Search } from "lucide-react";
import { login, getMe, getOrders, getOrder, getBilling, getInvoicePayLink, requestPlusLoad, getTrucks, getPlusLoads, handlePlusLoad, setOrderStatus, assignTruck, getCustomers, setCustomerLogin, logout, isLoggedIn } from "./api";

// ── Aussieblock brand ────────────────────────────────────────────────
const ORANGE = "#e7732a";
const ORANGE_HOT = "#FB7013";
const NAVY = "#1e2939";
const NAVY_DEEP = "#161d27";
const GREEN = "#27c08a";

const FONT = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap');
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
  scheduled: { label: "Scheduled", color: "#7c8794" },
  batched: { label: "Batched", color: ORANGE },
  enroute: { label: "En route", color: ORANGE_HOT },
  onsite: { label: "On site", color: GREEN },
  complete: { label: "Complete", color: GREEN },
};
const STAGES = ["Batched", "En route", "On site", "Pouring", "Complete"];
// The delivery stages staff can set from the dispatch board, in order. Mirrors
// ORDER_STATUSES in the backend — keep the two in sync.
const ORDER_STATUSES = ["scheduled", "batched", "enroute", "onsite", "complete"];

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

function OrderCard({ o, onOpen, showCustomer }) {
  return (
    <button onClick={() => onOpen(o)} className="w-full text-left rounded-2xl p-4 mb-3 transition-transform active:scale-[0.98]" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{o.id}</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Clock size={12} /> {o.time}</span>
          </div>
          <div style={{ fontFamily: C.cond }} className="text-white text-lg font-semibold leading-tight mt-1 truncate">{o.site}</div>
          <div className="text-white/50 text-sm mt-0.5">{showCustomer ? o.customer + " · " : ""}{o.mix}</div>
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

function TrackScreen({ order, onBack }) {
  const [progress, setProgress] = useState(order.progress || 0.05);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // LIVE: poll the backend for this order's real progress every few seconds.
  // The backend's GPS poller advances it (mock movement now, real One Step GPS
  // later), so the map + ETA reflect actual backend state — not a local animation.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const fresh = await getOrder(order.id);
        if (alive && fresh && typeof fresh.progress === "number") setProgress(fresh.progress);
      } catch { /* ignore transient errors; keep last value */ }
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => { alive = false; clearInterval(iv); };
  }, [order.id]);

  useEffect(() => { if (!sent) return; const t = setTimeout(() => setSent(false), 2600); return () => clearTimeout(t); }, [sent]);

  const handlePlusLoad = async () => {
    setSending(true);
    try {
      await requestPlusLoad(order.id);   // writes a real request the office dashboard can see
      setSent(true);
    } catch (e) {
      alert("Could not send request: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const etaMin = Math.max(0, Math.round((1 - progress) * 22));
  const stageIdx = progress >= 1 ? 2 : progress > 0.02 ? 1 : 0;
  return (
    <div className="px-4 pb-24 pt-2">
      <button onClick={onBack} className="flex items-center gap-1 text-white/60 text-sm mb-3 active:opacity-60"><ChevronLeft size={18} /> Back</button>
      <div className="flex items-baseline justify-between">
        <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{order.id}</span>
        <StatusPill status={progress >= 1 ? "onsite" : "enroute"} />
      </div>
      <h2 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight mt-1">{order.site}</h2>
      <p className="text-white/50 text-sm">{order.mix} · {order.qty}</p>
      <div className="mt-4"><TrackMap progress={progress} /></div>
      {progress > 0.92 && <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: GREEN, fontFamily: C.body }}><MapPin size={13} /> Truck entered site geofence — proof of delivery logged</div>}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="rounded-2xl p-4" style={{ background: NAVY }}><div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wide"><Clock size={13} /> ETA</div><div style={{ color: ORANGE, fontFamily: C.cond }} className="text-3xl font-bold mt-1">{progress >= 1 ? "Arrived" : `${etaMin} min`}</div></div>
        <div className="rounded-2xl p-4" style={{ background: NAVY }}><div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wide"><Truck size={13} /> Vehicle</div><div style={{ fontFamily: C.cond }} className="text-white text-3xl font-bold mt-1">{order.truck}</div></div>
      </div>
      <div className="rounded-2xl p-4 mt-3" style={{ background: NAVY }}><div className="text-white/50 text-xs uppercase tracking-wide">Delivery progress</div><Timeline stageIdx={stageIdx} /></div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button onClick={handlePlusLoad} disabled={sending} className="rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform disabled:opacity-60" style={{ background: ORANGE, color: NAVY_DEEP, fontFamily: C.body }}>{sending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Request plus load</button>
        <button className="rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform text-white" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", fontFamily: C.body }}><FileText size={18} /> Ticket</button>
      </div>
      {sent && (
        <div className="mt-3 rounded-2xl px-4 py-3 flex items-center gap-2.5" style={{ background: "rgba(39,192,138,0.12)", border: "1px solid rgba(39,192,138,0.4)" }}>
          <Send size={16} color={GREEN} />
          <span className="text-sm" style={{ color: GREEN, fontFamily: C.body }}>Request sent to Aussieblock dispatch</span>
        </div>
      )}
    </div>
  );
}

function OrdersScreen({ orders, account, onOpen }) {
  const today = orders.filter((o) => o.when === "today");
  const tomorrow = orders.filter((o) => o.when === "tomorrow");
  const other = orders.filter((o) => o.when !== "today" && o.when !== "tomorrow");
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="px-4 pb-24 pt-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-white/45 text-sm" style={{ fontFamily: C.body }}>Welcome back</div>
          <h1 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight">{account?.company || "Your account"}</h1>
          <p className="text-white/40 text-sm mt-0.5">{todayLabel}</p>
        </div>
        <Bell size={20} className="text-white/60 mt-1" />
      </div>
      <h2 style={{ fontFamily: C.cond }} className="text-white text-lg font-bold mb-2">My Orders</h2>
      {orders.length === 0 && <div className="text-white/40 text-sm py-8 text-center" style={{ fontFamily: C.body }}>No orders yet.</div>}
      {today.length > 0 && <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Today</div>}
      {today.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)}
      {tomorrow.length > 0 && <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2 mt-5">Tomorrow</div>}
      {tomorrow.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)}
      {other.length > 0 && <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2 mt-5">Upcoming</div>}
      {other.map((o) => <OrderCard key={o.id} o={o} onOpen={onOpen} />)}
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

  return (
    <div className="px-4 pb-24 pt-2">
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
        <button className="flex items-center gap-1 text-xs" style={{ color: ORANGE, fontFamily: C.body }}><Download size={12} /> Statement</button>
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
const PLANT = { lat: 31.4421, lng: -100.4503 };
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

function OrderRow({ o, trucks, onStatus, onAssign }) {
  const pct = Math.round((o.progress || 0) * 100);
  // Staff controls drive the backend, which can reject a move (e.g. setting a
  // load-carrying stage with no truck → 409). Track per-row busy/error so one
  // row's failed change doesn't block the others or the live polling.
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // The selects are *controlled* by o.status / o.truck (server truth). On a
  // rejected change the parent state never updates, so the select snaps back to
  // its previous value on its own — we just surface why.
  const run = async (fn, value) => {
    setBusy(true); setErr("");
    try { await fn(o.ref, value); }
    catch (e) { setErr(e.message || "Change rejected"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: ORANGE, fontFamily: C.cond }} className="text-sm font-bold tracking-wider">{o.ref}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Clock size={12} /> {o.time}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/60 text-xs flex items-center gap-1"><Truck size={12} /> {o.truck}</span>
          </div>
          <div style={{ fontFamily: C.cond }} className="text-white text-lg font-semibold leading-tight mt-1 truncate">{o.site}</div>
          <div className="text-white/50 text-sm mt-0.5 truncate">{o.customer} · {o.mix}</div>
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
      {err && (
        <div className="mt-2 rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>
          {err}
        </div>
      )}
    </div>
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

function Panel({ title, icon: Icon, count, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: NAVY_DEEP, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} color={ORANGE} />
        <h2 style={{ fontFamily: C.cond }} className="text-white text-lg font-bold">{title}</h2>
        {count != null && <span className="text-white/40 text-sm" style={{ fontFamily: C.body }}>({count})</span>}
      </div>
      {children}
    </div>
  );
}

// Staff tool: create or reset the login a customer uses to see their own
// orders & billing. Lives in the dispatch board's right column.
function CustomerLogins() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [sel, setSel] = useState(null);        // selected customer id
  const [emailVal, setEmailVal] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);        // { ok, text }

  const load = async () => {
    try { setCustomers(await getCustomers()); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const pick = (c) => {
    setSel(c.id);
    setEmailVal(c.login_email || "");
    setPw("");
    setMsg(null);
  };

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await setCustomerLogin(sel, emailVal.trim(), pw);
      setMsg({ ok: true, text: `Login ${r.action} — ${r.email} can now sign in.` });
      setPw("");
      await load();   // refresh the "has login" badges
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const f = filter.trim().toLowerCase();
  const shown = (f ? customers.filter((c) => c.name.toLowerCase().includes(f)) : customers).slice(0, 60);
  const selCust = customers.find((c) => c.id === sel);
  const withLogins = customers.filter((c) => c.login_email).length;

  return (
    <Panel title="Customer logins" icon={KeyRound} count={`${withLogins}/${customers.length}`}>
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

      {/* customer list */}
      <div className="max-h-48 overflow-y-auto pr-1 -mr-1">
        {shown.length === 0 ? (
          <div className="text-white/40 text-sm py-6 text-center" style={{ fontFamily: C.body }}>No customers match.</div>
        ) : shown.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c)}
            className="w-full text-left rounded-lg px-3 py-2 mb-1 flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: sel === c.id ? ORANGE + "22" : NAVY, border: `1px solid ${sel === c.id ? ORANGE : "rgba(255,255,255,0.06)"}` }}
          >
            <span className="text-white text-sm truncate" style={{ fontFamily: C.body }}>{c.name}</span>
            {c.login_email
              ? <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: GREEN + "22", color: GREEN }}><CheckCircle2 size={10} /> Login</span>
              : <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>No login</span>}
          </button>
        ))}
      </div>

      {/* create / reset form */}
      {selCust && (
        <div className="rounded-xl p-3 mt-3" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-white text-sm font-semibold mb-2" style={{ fontFamily: C.cond }}>
            {selCust.login_email ? "Reset login for " : "Create login for "}{selCust.name}
          </div>
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
        </div>
      )}

      {msg && (
        <div className="rounded-lg px-3 py-2 mt-2 text-xs" style={{ background: msg.ok ? GREEN + "1a" : "rgba(239,83,80,0.12)", color: msg.ok ? GREEN : "#ff8a85", fontFamily: C.body }}>
          {msg.text}
        </div>
      )}
    </Panel>
  );
}

function DispatchApp({ email, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [, forceTick] = useState(0);   // keep "Xm ago" / staleness labels ticking

  // Pull all three feeds at once, reusing the existing endpoints.
  const refresh = async () => {
    try {
      const [os, ts, rs] = await Promise.all([getOrders(), getTrucks(), getPlusLoads()]);
      setOrders(os);
      setTrucks(ts);
      setRequests(rs);
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

  const markHandled = async (id) => {
    setBusyId(id);
    try {
      await handlePlusLoad(id);
      setRequests((rs) => rs.filter((r) => r.id !== id));   // drop immediately; next poll confirms
    } catch (e) {
      alert("Could not mark handled: " + e.message);
    } finally {
      setBusyId(null);
    }
  };

  // Drop a freshly-updated order (returned by the status/assign endpoints) back
  // into the list so the row reflects it immediately, without waiting for the
  // next 5s poll. Both throw on a rejected change — OrderRow catches and shows it.
  const applyOrder = (updated) =>
    setOrders((os) => os.map((o) => (o.ref === updated.ref ? updated : o)));
  const changeStatus = async (ref, status) => applyOrder(await setOrderStatus(ref, status));
  const assign = async (ref, truck) => applyOrder(await assignTruck(ref, truck));

  const activeOrders = orders.filter((o) => o.status !== "complete");
  const movingTrucks = trucks.filter((t) => t.lat != null && !isStale(t.updated_at)).length;

  if (loading) return <Splash label="Loading dispatch…" />;

  return (
    <div className="min-h-screen w-full flex items-start justify-center p-4 sm:p-6" style={{ background: "#0c1117" }}>
      <style>{FONT}</style>
      <div className="w-full max-w-6xl rounded-[1.6rem] overflow-hidden shadow-2xl" style={{ background: NAVY_DEEP, fontFamily: C.body, border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* brand header */}
        <div className="px-5 sm:px-6 pt-3.5 pb-3.5" style={{ background: ORANGE }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Roo size={34} />
              <div className="leading-none">
                <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-xl font-bold tracking-tight">AUSSIEBLOCK</div>
                <div style={{ color: NAVY_DEEP, fontFamily: C.body }} className="text-[11px] font-semibold opacity-70 -mt-0.5">Dispatch · Office Console</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: NAVY_DEEP, color: GREEN, fontFamily: C.body }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} /> LIVE</span>
              <button onClick={onLogout} title="Log out" className="p-1.5 rounded-full active:scale-90 transition-transform" style={{ background: NAVY_DEEP }}><LogOut size={14} color={ORANGE} /></button>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5">
          {/* title + refresh */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 style={{ fontFamily: C.cond }} className="text-white text-2xl font-bold leading-tight">Dispatch board</h1>
              <p className="text-white/45 text-sm" style={{ fontFamily: C.body }}>Signed in as {email}</p>
            </div>
            <button onClick={refresh} title="Refresh now" className="p-2 rounded-xl active:scale-90 transition-transform" style={{ background: NAVY, border: "1px solid rgba(255,255,255,0.1)" }}>
              <RefreshCw size={16} color={ORANGE} />
            </button>
          </div>

          {err && (
            <div className="rounded-xl px-3 py-2.5 text-sm mb-4" style={{ background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.4)", color: "#ff8a85", fontFamily: C.body }}>
              Couldn’t load dispatch data: {err}
            </div>
          )}

          {/* stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            <StatTile icon={Package} label="Active orders" value={activeOrders.length} accent={ORANGE} />
            <StatTile icon={Navigation} label="Trucks moving" value={`${movingTrucks}/${trucks.length}`} accent={ORANGE_HOT} />
            <StatTile icon={Activity} label="Open plus-loads" value={requests.length} accent={GREEN} />
          </div>

          {/* main grid: map + orders (left), plus-loads (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Panel title="Fleet" icon={MapPin} count={trucks.length}>
                <FleetMap trucks={trucks} />
              </Panel>
              <Panel title="Active orders" icon={List} count={activeOrders.length}>
                {activeOrders.length === 0 ? (
                  <div className="text-white/40 text-sm py-6 text-center" style={{ fontFamily: C.body }}>No active orders.</div>
                ) : (
                  activeOrders.map((o) => <OrderRow key={o.ref} o={o} trucks={trucks} onStatus={changeStatus} onAssign={assign} />)
                )}
              </Panel>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-4">
              <Panel title="Plus-load requests" icon={Inbox} count={requests.length}>
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Inbox size={36} className="text-white/20" />
                    <div className="text-white/55 text-base font-semibold" style={{ fontFamily: C.cond }}>All caught up</div>
                    <div className="text-white/35 text-sm" style={{ fontFamily: C.body }}>New requests appear here automatically.</div>
                  </div>
                ) : (
                  requests.map((r) => <PlusLoadCard key={r.id} r={r} onHandle={markHandled} busy={busyId === r.id} />)
                )}
              </Panel>
              <CustomerLogins />
            </div>
          </div>
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

  // On first load, check whether a saved token is still valid.
  useEffect(() => {
    (async () => {
      if (isLoggedIn()) {
        try { setMe(await getMe()); } catch { /* token expired/invalid — show login */ }
      }
      setAuthChecked(true);
    })();
  }, []);

  // Once logged in, load this customer's orders + billing.
  // Staff don't have a customer account — they get the dispatch console instead.
  useEffect(() => {
    if (!me || me.role === "staff") return;
    let alive = true;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const os = await getOrders();
        if (alive) setOrders(os.map((o) => ({ ...o, id: o.ref })));  // map backend `ref` -> the `id` the UI uses
        if (me.customer_id != null) {
          const acct = await getBilling(me.customer_id);
          if (alive) setAccount(acct);
        }
      } catch (e) {
        if (alive) setLoadError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [me]);

  const open = (o) => { setActive(o); setScreen("track"); };
  const handleLogout = () => {
    logout();
    setMe(null); setOrders([]); setAccount(null); setActive(null); setScreen("home");
  };

  const nav = [{ k: "home", icon: List, label: "Orders" }, { k: "track", icon: MapPin, label: "Track" }, { k: "account", icon: User, label: "Account" }];

  if (!authChecked) return <Splash label="Starting…" />;
  if (!me) return <LoginScreen onLoggedIn={setMe} />;
  if (me.role === "staff") return <DispatchApp email={me.email} onLogout={handleLogout} />;
  if (loading) return <Splash label="Loading your orders…" />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "#0c1117" }}>
      <style>{FONT}</style>
      <div className="w-full max-w-sm rounded-[2.2rem] overflow-hidden shadow-2xl relative" style={{ background: NAVY_DEEP, fontFamily: C.body, border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* brand header */}
        <div className="px-4 pt-3 pb-3" style={{ background: ORANGE }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Roo size={34} />
              <div className="leading-none">
                <div style={{ color: NAVY_DEEP, fontFamily: C.cond }} className="text-xl font-bold tracking-tight">AUSSIEBLOCK</div>
                <div style={{ color: NAVY_DEEP, fontFamily: C.body }} className="text-[11px] font-semibold opacity-70 -mt-0.5">Ready Mix · Delivery Tracking</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: NAVY_DEEP, color: GREEN, fontFamily: C.body }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} /> LIVE</span>
              <button onClick={handleLogout} title="Log out" className="p-1.5 rounded-full active:scale-90 transition-transform" style={{ background: NAVY_DEEP }}><LogOut size={14} color={ORANGE} /></button>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="px-4 py-2.5 text-xs" style={{ background: "rgba(239,83,80,0.12)", color: "#ff8a85", fontFamily: C.body }}>
            Couldn’t load data: {loadError}
          </div>
        )}

        <div className="min-h-[600px]">
          {screen === "track" && active ? <TrackScreen order={active} onBack={() => setScreen("home")} />
            : screen === "account" ? <AccountScreen account={account} customerId={me.customer_id} />
            : <OrdersScreen orders={orders} account={account} onOpen={open} />}
        </div>

        {/* bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-3" style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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

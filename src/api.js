// ── api.js ──────────────────────────────────────────────────────────────────
// One place that knows how to talk to the Aussieblock backend.
// Your components import these functions instead of using fake data.
//
// All requests go through "/api", which Vite forwards to the backend
// (see vite.config.js). So /api/orders -> http://127.0.0.1:8000/orders.

const TOKEN_KEY = 'aussieblock_token'

// Where the backend lives. In local dev this stays '/api', which Vite proxies to
// http://127.0.0.1:8000 (see vite.config.js) — no CORS, backend address in one
// place. In production there's no proxy, so set VITE_API_BASE at build time to
// the backend's public URL (e.g. https://aussieblock-api.onrender.com); requests
// then go straight there (the backend allows cross-origin calls).
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// The login token is kept in the browser's localStorage so it survives page
// refreshes. (Fine for a prototype; revisit for production security.)
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function isLoggedIn() {
  return !!getToken()
}
export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

// Core fetch wrapper: attaches the bearer token, parses JSON, throws on errors.
async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    // Token missing/expired — clear it so the app can show the login screen.
    logout()
    throw new Error('Not logged in')
  }
  if (!res.ok) {
    let detail = res.statusText
    try { detail = (await res.json()).detail || detail } catch { /* ignore */ }
    throw new Error(detail)
  }
  // Some endpoints (rare) return no body; guard against that.
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// ── Auth ──
// The backend's login expects form fields named username/password (OAuth2 style).
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', body })
  if (!res.ok) throw new Error('Incorrect email or password')
  const data = await res.json()
  localStorage.setItem(TOKEN_KEY, data.access_token)
  return data // { access_token, token_type, role, customer_id }
}

export function getMe() {
  return request('/auth/me')
}

// ── Data ──
// Each returns exactly what the backend sends. The shapes match what the
// prototype's screens already expect (orders, truck positions, billing).
export function getOrders() {
  return request('/orders')
}
// Schedule a new order (staff only). Pass { customer_id, site, mix, qty,
// scheduled_for, time, truck }. Returns the new order in the same shape as
// getOrders(), so the board can drop it straight into the list.
export function createOrder(order) {
  return request('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
}
// Cancel (delete) an order by its ref. Staff any; a customer their own while it's
// still requested/scheduled.
export function deleteOrder(ref) {
  return request(`/orders/${encodeURIComponent(ref)}`, { method: 'DELETE' })
}
// Modify an order (staff or owning customer, while requested/scheduled).
export function editOrder(ref, order) {
  return request(`/orders/${encodeURIComponent(ref)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
}
// Archive or unarchive a completed order (staff). Returns the updated order.
export function setOrderArchived(ref, archived = true) {
  return request(`/orders/${encodeURIComponent(ref)}/archive?archived=${archived}`, { method: 'POST' })
}

// Upload a batch-ticket PDF for an order (staff). Returns the updated order.
export async function uploadBatchTicket(ref, file, variant = 'view') {
  const fd = new FormData()
  fd.append('file', file)
  const q = variant === 'print' ? '?variant=print' : ''
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/batch-ticket${q}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },   // no Content-Type: browser sets the multipart boundary
    body: fd,
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  return res.json()
}

// Remove an order's batch-ticket PDF (staff). Returns the updated order.
export function deleteBatchTicket(ref) {
  return request(`/orders/${encodeURIComponent(ref)}/batch-ticket`, { method: 'DELETE' })
}

// ── Knowledge Center (shared PDF library) ──
// getDocs lists the library (any login). uploadDoc/deleteDoc are operator-only.
// openDoc fetches with the bearer token and opens the PDF via a blob URL.
export function getDocs() {
  return request('/knowledge')   // path is /knowledge (FastAPI reserves /docs for Swagger UI)
}
export async function uploadDoc(title, file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE}/knowledge?title=${encodeURIComponent(title)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },   // no Content-Type: browser sets the multipart boundary
    body: fd,
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  return res.json()
}
export async function openDoc(id) {
  const res = await fetch(`${API_BASE}/knowledge/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url; a.target = '_blank'; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
export function deleteDoc(id) {
  return request(`/knowledge/${id}`, { method: 'DELETE' })
}

// Save the full delivered batch-ticket fields for an order (staff). `data` is a
// plain object of every paper-ticket field. Returns the updated order (whose
// `batch_data` now holds what was saved).
export function saveBatchData(ref, data) {
  return request(`/orders/${encodeURIComponent(ref)}/batch-data`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })
}

// Open an order's batch-ticket PDF (staff or owning customer). Fetches with the
// auth token, then opens the PDF via a blob URL (works around no-auth <a href>).
export async function openBatchTicket(ref, variant = 'view') {
  // cache-bust so a freshly (re)converted ticket never shows a stale cached copy
  const q = (variant && variant !== 'view' ? `?variant=${encodeURIComponent(variant)}&` : '?') + `t=${Date.now()}`
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/batch-ticket${q}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store',
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url; a.target = '_blank'; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

// Upload a batch ticket for ONE load of a pour (staff). Returns the updated order.
export async function uploadLoadBatchTicket(ref, seq, file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/loads/${seq}/batch-ticket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },   // browser sets the multipart boundary
    body: fd,
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  return res.json()
}

// Open a load's batch-ticket PDF (staff or owning customer), via an auth'd blob.
export async function openLoadBatchTicket(ref, seq, variant = 'view') {
  const q = (variant && variant !== 'view' ? `?variant=${encodeURIComponent(variant)}&` : '?') + `t=${Date.now()}`
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/loads/${seq}/batch-ticket${q}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: 'no-store',
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url; a.target = '_blank'; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

// Remove one load's batch-ticket PDF (staff). Returns the updated order.
export function deleteLoadBatchTicket(ref, seq) {
  return request(`/orders/${encodeURIComponent(ref)}/loads/${seq}/batch-ticket`, { method: 'DELETE' })
}

// Flag every customer with an unpaid balance >= `days` days old as COD (staff).
export function codFromAging(days = 30) {
  return request(`/customers/cod-from-aging?days=${days}`, { method: 'POST' })
}
// COD: mark a customer pay-before-delivery on/off (staff only).
export function setCustomerCod(customerId, cod) {
  return request(`/customers/${customerId}/cod`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cod }),
  })
}
// Create a pay link for a COD load from the customer's existing QuickBooks
// invoice (staff only). The amount comes from that invoice — no amount entered.
// Returns { amount, link, doc_number }.
export function chargeOrder(ref) {
  return request(`/orders/${encodeURIComponent(ref)}/charge`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
}
// COD payment status for an order (staff, or the owning customer). Returns
// { prepay_required, prepaid, amount, charged, link, balance }.
export function getOrderPaymentStatus(ref) {
  return request(`/orders/${encodeURIComponent(ref)}/payment-status`)
}

// A customer places a concrete order from their app. It lands as "requested" for
// staff to confirm. Pass { site, mix, qty, scheduled_for, time, notes }.
export function requestOrder(order) {
  return request('/orders/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
}
export function getOrder(ref) {
  return request(`/orders/${ref}`)
}
export function getTrucks() {
  return request('/trucks')
}
// Add a truck (or update it if the name already exists) — staff only.
// gps_device_id (One Step GPS) and fluidsecure_vehicle_id (FluidSecure fuel) are
// both optional; fill them in later to enable live tracking / fuel tracking.
export function addTruck(label, gps_device_id, notes, fluidsecure_vehicle_id) {
  return request('/trucks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      label,
      gps_device_id: gps_device_id || null,
      fluidsecure_vehicle_id: fluidsecure_vehicle_id || null,
      notes: notes || '',
    }),
  })
}
export function deleteTruck(label) {
  return request(`/trucks/${encodeURIComponent(label)}`, { method: 'DELETE' })
}
// Per-truck fuel usage rolled up from FluidSecure (staff only).
export function getFuel() {
  return request('/fuel')
}
// The individual fuel fills for one truck, newest first (staff only).
export function getTruckFuel(label) {
  return request(`/trucks/${encodeURIComponent(label)}/fuel`)
}
// Import a FluidSecure transaction export (CSV) when the API token isn't
// available (staff). Returns { rows, added }.
export async function importFuel(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE}/fuel/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },   // no Content-Type: browser sets the multipart boundary
    body: fd,
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  return res.json()
}
// ── Driver tablet ──
// Today's deliveries assigned to the logged-in driver (+ any not yet assigned).
export function getDriverOrders() {
  return request('/driver/orders')
}
// Capture the customer's signature (a PNG Blob) + printed name + water added on
// site (gal); marks the order Delivered/Complete and stores proof of delivery.
export async function signOffOrder(ref, blob, signedBy, waterAdded = '') {
  const fd = new FormData()
  fd.append('file', blob, `${ref}-signature.png`)
  const q = `signed_by=${encodeURIComponent(signedBy)}&water_added=${encodeURIComponent(waterAdded)}`
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/signoff?${q}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },   // browser sets the multipart boundary
    body: fd,
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  return res.json()
}

// Fetch the captured signature image as a data URL (authed) — for showing it on
// the in-app signed delivery ticket. Returns null if there's none.
export async function getSignatureDataUrl(ref) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/signature`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) return null
  const blob = await res.blob()
  return await new Promise((resolve) => {
    const r = new FileReader()
    r.onloadend = () => resolve(r.result)
    r.readAsDataURL(blob)
  })
}

export function getBilling(customerId) {
  return request(`/billing/${customerId}`)
}
// Pull the latest A/R from QuickBooks into the app now (staff). The "Sync now"
// button calls this; billing also auto-syncs when opened.
export function syncBilling() {
  return request(`/billing/sync`, { method: 'POST' })
}
// Fetch a customer-facing QuickBooks payment link for one invoice (what the
// "Make a payment" button opens). The link is hosted by Intuit — the customer
// pays there and it posts straight into QuickBooks. Throws (with the backend's
// plain-language reason) if no link is available, e.g. already paid or demo mode.
export function getInvoicePayLink(customerId, invoiceNumber) {
  return request(`/billing/${customerId}/invoices/${encodeURIComponent(invoiceNumber)}/pay-link`)
}
export function requestPlusLoad(ref, note = '') {
  const qs = note ? `?note=${encodeURIComponent(note)}` : ''
  return request(`/orders/${ref}/plus-load${qs}`, { method: 'POST' })
}
// Continuous pour: add a load (each time a truck is batched/loaded).
export function addLoad(ref, body) {
  return request(`/orders/${encodeURIComponent(ref)}/loads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
// Update one load (assign truck/driver or advance status).
export function updateLoad(ref, seq, patch) {
  return request(`/orders/${encodeURIComponent(ref)}/loads/${seq}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}
// Remove a load from a pour.
export function removeLoad(ref, seq) {
  return request(`/orders/${encodeURIComponent(ref)}/loads/${seq}`, { method: 'DELETE' })
}
// Per-order pricing: what we bill the customer + the delivery (haul) cost.
export function getOrderPricing(ref) {
  return request(`/orders/${ref}/pricing`)
}
export function setOrderDelivery(ref, { hauler, mileage }) {
  return request(`/orders/${ref}/delivery`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hauler, mileage }),
  })
}
// Set (or clear, with null) a custom $/yd unit price on an order. Works on
// completed orders too. Returns the updated order.
export function setOrderPrice(ref, price_override) {
  return request(`/orders/${encodeURIComponent(ref)}/price`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price_override }),
  })
}
// Price sheet (staff): rates that fill the batch-ticket pricing block.
export function getPriceSheet() {
  return request('/price-sheet')
}
export function savePriceSheet(sheet) {
  return request('/price-sheet', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sheet),
  })
}

// ── Dispatch (staff only) ──
// The office side of the plus-load loop. getPlusLoads() returns the queue of
// requests customers have sent that nobody has actioned yet; handlePlusLoad()
// marks one done so it drops off the queue. Both 403 for non-staff logins.
export function getPlusLoads() {
  return request('/dispatch/plus-loads')
}

// Customer logins (staff only). getCustomers() lists every customer with whether
// they already have a login; setCustomerLogin() creates or resets the email +
// password a customer signs in with. Both 403 for non-staff.
export function getCustomers() {
  return request('/customers')
}
export function setCustomerLogin(customerId, email, password, phone) {
  return request(`/customers/${customerId}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, phone }),
  })
}
export function removeCustomerLogin(customerId) {
  return request(`/customers/${customerId}/login`, { method: 'DELETE' })
}
// Whether the app can send texts itself (Twilio configured). When false, the
// board opens the staff phone's messaging app instead (sms: link).
export function getSmsEnabled() {
  return request('/sms/enabled')
}
// Send a customer their invite text via the texting service (staff only).
export function textInvite(customerId, message) {
  return request(`/customers/${customerId}/text-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
}

// Office logins — workers (concrete crew / TxDOT engineers) and full staff.
// All four are full-staff only (require_finance). listStaff() returns
// [{email, role, phone}]; createStaff() creates OR resets a login (role 'staff'
// = full access, 'worker' = orders/tracking, no financials); deleteStaff()
// revokes one; staffTextInvite() texts that login its invite (same texting
// service / sms-fallback as the customer invite).
export function listStaff() {
  return request('/staff')
}
// company is the driver's NAME for role 'driver' (matches Order.driver); ignored
// for other roles (their company comes from customer_id).
export function createStaff(email, password, role, phone, customerId, project, company) {
  return request('/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, phone, customer_id: customerId, project, company }),
  })
}
export function deleteStaff(email) {
  return request(`/staff/${encodeURIComponent(email)}`, { method: 'DELETE' })
}
export function staffTextInvite(email, message) {
  return request(`/staff/${encodeURIComponent(email)}/text-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
}
export function handlePlusLoad(requestId) {
  return request(`/dispatch/plus-loads/${requestId}/handle`, { method: 'POST' })
}

// The two staff controls on the dispatch board's order rows. Both take query
// params (matching the backend) and return the updated order in the same shape
// as getOrders(), so the caller can drop the result straight into its list.
//   setOrderStatus moves an order along its delivery stage (scheduled → … →
//   complete). The backend 409s if you set a load-carrying stage with no truck.
//   assignTruck puts a truck on the order (pass its label) or takes it off
//   (pass "—"). The backend 409s if you unassign mid-delivery. Both 403 for
//   non-staff logins.
export function setOrderStatus(ref, status) {
  return request(`/orders/${ref}/status?status=${encodeURIComponent(status)}`, { method: 'POST' })
}
export function assignTruck(ref, truck) {
  return request(`/orders/${ref}/assign?truck=${encodeURIComponent(truck)}`, { method: 'POST' })
}
// Set (or clear, with "—") the driver on an order (staff).
export function assignDriver(ref, driver) {
  return request(`/orders/${ref}/driver?driver=${encodeURIComponent(driver)}`, { method: 'POST' })
}

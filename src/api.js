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
// Upload a batch-ticket PDF for an order (staff). Returns the updated order.
export async function uploadBatchTicket(ref, file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/batch-ticket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },   // no Content-Type: browser sets the multipart boundary
    body: fd,
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  return res.json()
}

// Open an order's batch-ticket PDF (staff or owning customer). Fetches with the
// auth token, then opens the PDF via a blob URL (works around no-auth <a href>).
export async function openBatchTicket(ref) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(ref)}/batch-ticket`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).detail || d } catch { /* ignore */ } throw new Error(d) }
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url; a.target = '_blank'; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
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
// Create a QuickBooks invoice + pay link for a COD load (staff only). Returns
// { amount, link, doc_number }.
export function chargeOrder(ref, amount) {
  return request(`/orders/${encodeURIComponent(ref)}/charge`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
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
// Add a truck (or update its GPS device id if the name already exists) — staff
// only. gps_device_id is optional; fill it in later to enable live tracking.
export function addTruck(label, gps_device_id, notes) {
  return request('/trucks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, gps_device_id: gps_device_id || null, notes: notes || '' }),
  })
}
export function deleteTruck(label) {
  return request(`/trucks/${encodeURIComponent(label)}`, { method: 'DELETE' })
}
export function getBilling(customerId) {
  return request(`/billing/${customerId}`)
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
export function setCustomerLogin(customerId, email, password) {
  return request(`/customers/${customerId}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
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

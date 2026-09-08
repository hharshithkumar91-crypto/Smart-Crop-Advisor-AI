// ═══════════════════════════════════════════════════
// api.js — FastAPI Backend Client
// Replaces firebase.js for all DB calls
// BASE_URL auto-switches between local dev and production
// ═══════════════════════════════════════════════════

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────

export async function apiSignup(data) {
  return apiFetch("/signup", { method: "POST", body: JSON.stringify(data) });
}

export async function apiLogin(data) {
  return apiFetch("/login", { method: "POST", body: JSON.stringify(data) });
}

export async function apiVerifyOtp(data) {
  return apiFetch("/verify-otp", { method: "POST", body: JSON.stringify(data) });
}

export async function apiResendOtp(username) {
  return apiFetch(`/resend-otp?username=${encodeURIComponent(username)}`, { method: "POST" });
}

// ── Farmers Registry ──────────────────────────────────

export async function getAllUsers() {
  try {
    return await apiFetch("/farmers");
  } catch (e) {
    console.error("Error fetching farmers:", e);
    return [];
  }
}

export async function getTotalUsers() {
  try {
    const farmers = await apiFetch("/farmers");
    return farmers.length;
  } catch (e) {
    return 0;
  }
}

export async function getOnlineUsers() {
  try {
    const farmers = await apiFetch("/farmers");
    return farmers.filter((f) => f.isOnline).length;
  } catch (e) {
    return 0;
  }
}

// No-op stubs kept for compatibility with existing App.js calls
export async function setUserOffline() {}
export async function saveUserToFirestore() {}
export async function updateUserLogin() {}
export async function checkPhoneExists() { return false; }
export async function findUserByPhone() { return null; }
export async function findUserByEmail() { return null; }
export async function logAuthEvent() {}

// ── Marketplace Listings ────────────────────────────

export async function addListing(listingData) {
  try {
    const res = await apiFetch("/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    });
    return res.data?.id || null;
  } catch (e) {
    console.error("Error adding listing:", e);
    return null;
  }
}

export async function getActiveListings() {
  try {
    return await apiFetch("/listings");
  } catch (e) {
    console.error("Error getting listings:", e);
    return [];
  }
}

export async function rateListing(listingId, userRating) {
  try {
    return await apiFetch(`/listings/${listingId}/rate`, {
      method: "POST",
      body: JSON.stringify({ stars: userRating }),
    });
  } catch (e) {
    console.error("Error rating listing:", e);
    return null;
  }
}

// ── Ledger ───────────────────────────────────────────

export async function getLedger() {
  try {
    return await apiFetch("/ledger");
  } catch (e) {
    console.error("Error getting ledger:", e);
    return [];
  }
}

export async function addLedgerEntry(entry) {
  try {
    return await apiFetch("/ledger", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  } catch (e) {
    console.error("Error adding ledger entry:", e);
    return null;
  }
}

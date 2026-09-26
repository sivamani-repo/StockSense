import { apiRequest } from "./api";

// -------------------------------------------------------------
// Dashboard Analytics
// -------------------------------------------------------------
export async function getDashboardStats() {
  return apiRequest("/dashboard/stats");
}

// -------------------------------------------------------------
// Products
// -------------------------------------------------------------
export async function getProducts() {
  return apiRequest("/products");
}

export async function searchProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });
  const qs = query.toString();
  return apiRequest(`/products/search${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id) {
  return apiRequest(`/products/${id}`);
}

export async function createProduct(data) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
}

// -------------------------------------------------------------
// Categories
// -------------------------------------------------------------
export async function getCategories() {
  return apiRequest("/categories");
}

export async function createCategory(data) {
  return apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return apiRequest(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id) {
  return apiRequest(`/categories/${id}`, {
    method: "DELETE",
  });
}

// -------------------------------------------------------------
// Stock Levels & Ledger Audit
// -------------------------------------------------------------
export async function getStockLevels(filters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });
  const qs = query.toString();
  return apiRequest(`/stock/levels${qs ? `?${qs}` : ""}`);
}

export async function getStockLedger(filters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });
  const qs = query.toString();
  return apiRequest(`/stock/ledger${qs ? `?${qs}` : ""}`);
}

export async function getStockSummary() {
  return apiRequest("/stock/summary");
}

// -------------------------------------------------------------
// Receipts (Inbound Orders)
// -------------------------------------------------------------
export async function getReceipts(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append("status", filters.status);
  if (filters.location_id) query.append("location_id", filters.location_id);
  const qs = query.toString();
  return apiRequest(`/receipts${qs ? `?${qs}` : ""}`);
}

export async function getReceipt(id) {
  return apiRequest(`/receipts/${id}`);
}

export async function createReceipt(data) {
  return apiRequest("/receipts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function validateReceipt(id) {
  return apiRequest(`/receipts/${id}/validate`, {
    method: "POST",
  });
}

export async function cancelReceipt(id) {
  return apiRequest(`/receipts/${id}/cancel`, {
    method: "POST",
  });
}

// -------------------------------------------------------------
// Deliveries (Outbound Orders)
// -------------------------------------------------------------
export async function getDeliveries(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append("status", filters.status);
  if (filters.location_id) query.append("location_id", filters.location_id);
  const qs = query.toString();
  return apiRequest(`/deliveries${qs ? `?${qs}` : ""}`);
}

export async function getDelivery(id) {
  return apiRequest(`/deliveries/${id}`);
}

export async function createDelivery(data) {
  return apiRequest("/deliveries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function pickDelivery(id) {
  return apiRequest(`/deliveries/${id}/pick`, {
    method: "POST",
  });
}

export async function packDelivery(id) {
  return apiRequest(`/deliveries/${id}/pack`, {
    method: "POST",
  });
}

export async function validateDelivery(id) {
  return apiRequest(`/deliveries/${id}/validate`, {
    method: "POST",
  });
}

export async function cancelDelivery(id) {
  return apiRequest(`/deliveries/${id}/cancel`, {
    method: "POST",
  });
}

// -------------------------------------------------------------
// Internal Transfers
// -------------------------------------------------------------
export async function getTransfers(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append("status", filters.status);
  if (filters.location_id) query.append("location_id", filters.location_id);
  const qs = query.toString();
  return apiRequest(`/transfers${qs ? `?${qs}` : ""}`);
}

export async function getTransfer(id) {
  return apiRequest(`/transfers/${id}`);
}

export async function createTransfer(data) {
  return apiRequest("/transfers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function validateTransfer(id) {
  return apiRequest(`/transfers/${id}/validate`, {
    method: "POST",
  });
}

export async function cancelTransfer(id) {
  return apiRequest(`/transfers/${id}/cancel`, {
    method: "POST",
  });
}

// -------------------------------------------------------------
// Inventory Adjustments
// -------------------------------------------------------------
export async function getAdjustments(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append("status", filters.status);
  if (filters.location_id) query.append("location_id", filters.location_id);
  const qs = query.toString();
  return apiRequest(`/adjustments${qs ? `?${qs}` : ""}`);
}

export async function getAdjustment(id) {
  return apiRequest(`/adjustments/${id}`);
}

export async function createAdjustment(data) {
  return apiRequest("/adjustments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function applyAdjustment(id) {
  return apiRequest(`/adjustments/${id}/apply`, {
    method: "POST",
  });
}

export async function cancelAdjustment(id) {
  return apiRequest(`/adjustments/${id}/cancel`, {
    method: "POST",
  });
}

// -------------------------------------------------------------
// Warehouses & Locations
// -------------------------------------------------------------
export async function getWarehouses() {
  return apiRequest("/warehouses");
}

export async function createWarehouse(data) {
  return apiRequest("/warehouses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWarehouse(id, data) {
  return apiRequest(`/warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWarehouse(id) {
  return apiRequest(`/warehouses/${id}`, {
    method: "DELETE",
  });
}

export async function getLocations(warehouseId = null) {
  const url = warehouseId ? `/locations?warehouse_id=${warehouseId}` : "/locations";
  return apiRequest(url);
}

export async function createLocation(data) {
  return apiRequest("/locations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLocation(id, data) {
  return apiRequest(`/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLocation(id) {
  return apiRequest(`/locations/${id}`, {
    method: "DELETE",
  });
}

// -------------------------------------------------------------
// Reorder Rules
// -------------------------------------------------------------
export async function getReorderRules(productId = null) {
  const url = productId ? `/reorder-rules?product_id=${productId}` : "/reorder-rules";
  return apiRequest(url);
}

export async function createReorderRule(data) {
  return apiRequest("/reorder-rules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReorderRule(id, data) {
  return apiRequest(`/reorder-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteReorderRule(id) {
  return apiRequest(`/reorder-rules/${id}`, {
    method: "DELETE",
  });
}

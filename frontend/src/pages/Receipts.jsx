import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  CheckCircle,
  XCircle,
  ArrowDownToLine,
  Trash2,
  Eye,
  Building,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  getReceipts,
  getReceipt,
  createReceipt,
  validateReceipt,
  cancelReceipt,
  getProducts,
  getLocations,
} from "../services/inventoryService";

export default function Receipts() {
  const [searchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get("new") === "true";
  const preselectedProduct = searchParams.get("product_id");

  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [locationId, setLocationId] = useState(null);
  const [items, setItems] = useState([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Detail Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getReceipts(), getProducts(), getLocations()])
      .then(([recList, prodList, locList]) => {
        setReceipts(recList || []);
        setProducts(prodList || []);
        setLocations(locList || []);

        if (locList && locList.length > 0 && !locationId) {
          setLocationId(locList[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load receipts.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (shouldOpenNew && products.length > 0) {
      handleOpenCreate();
    }
  }, [shouldOpenNew, products]);

  function handleOpenCreate() {
    setSupplierName("Apex Logistics Supply");
    const defaultLoc = locations[0]?.id || null;
    setLocationId(defaultLoc);

    const initialPid = preselectedProduct ? Number(preselectedProduct) : products[0]?.id;
    setItems([
      {
        product_id: initialPid,
        quantity: 20,
      },
    ]);
    setCreateError("");
    setIsCreateOpen(true);
  }

  function handleAddItemRow() {
    const defaultPid = products[0]?.id;
    setItems([...items, { product_id: defaultPid, quantity: 10 }]);
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = field === "quantity" ? parseFloat(value) || 0 : Number(value);
    setItems(updated);
  }

  function handleRemoveItemRow(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!supplierName.trim()) {
      setCreateError("Supplier name is required.");
      return;
    }
    if (!locationId) {
      setCreateError("Please select a destination warehouse location.");
      return;
    }
    if (items.length === 0) {
      setCreateError("Please add at least one line item.");
      return;
    }
    for (const it of items) {
      if (!it.product_id || it.quantity <= 0) {
        setCreateError("Each item must have a valid product and positive quantity.");
        return;
      }
    }

    try {
      setCreateSubmitting(true);
      setCreateError("");
      await createReceipt({
        supplier: supplierName.trim(),
        location_id: Number(locationId),
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
        })),
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setCreateError(err.message || "Failed to create receipt.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleValidate(receiptId) {
    try {
      setActionLoading(true);
      await validateReceipt(receiptId);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to validate receipt.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(receiptId) {
    if (!window.confirm("Are you sure you want to cancel this inbound receipt?")) return;
    try {
      setActionLoading(true);
      await cancelReceipt(receiptId);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to cancel receipt.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleViewDetail(rec) {
    setSelectedReceipt(rec);
    setIsDetailOpen(true);
  }

  const filteredReceipts = receipts.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  return (
    <AppLayout
      title="Inbound Receipts"
      actionButton={
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>New Inbound Receipt</span>
        </button>
      }
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all", "draft", "done", "canceled"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn-secondary btn-sm ${activeTab === tab ? "active" : ""}`}
            style={{
              textTransform: "capitalize",
              background: activeTab === tab ? "#28221d" : "#ffffff",
              color: activeTab === tab ? "#ffffff" : "#181513",
              borderColor: activeTab === tab ? "#28221d" : "#d5cfc7",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab} ({receipts.filter((r) => tab === "all" || r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Receipts Table */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt Ref</th>
                <th>Supplier</th>
                <th>Destination Location</th>
                <th>Items Count</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                    Loading inbound receipts...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <ArrowDownToLine className="empty-state-icon" />
                      <h4>No {activeTab !== "all" ? activeTab : ""} receipts found</h4>
                      <p>Create a new purchase or supplier receipt to receive stock into your warehouse.</p>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        style={{ marginTop: "14px" }}
                        onClick={handleOpenCreate}
                      >
                        <Plus size={14} /> Create Inbound Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => {
                  const loc = locations.find((l) => l.id === rec.location_id);
                  const itemCount = rec.items ? rec.items.length : 0;
                  const totalUnits = rec.items
                    ? rec.items.reduce((sum, it) => sum + (it.quantity || 0), 0)
                    : 0;

                  return (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#181513" }}>
                          REC-{String(rec.id).padStart(4, "0")}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rec.supplier || rec.supplier_name}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", color: "#5e5751" }}>
                          {loc ? `${loc.name} (${loc.code})` : `Location #${rec.location_id}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {itemCount} line(s) · {totalUnits} unit(s)
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={rec.status} />
                      </td>
                      <td style={{ fontSize: "12px", color: "#8c847e" }}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            title="View receipt details"
                            onClick={() => handleViewDetail(rec)}
                          >
                            <Eye size={13} />
                          </button>
                          {rec.status === "draft" && (
                            <button
                              type="button"
                              className="btn-success btn-sm"
                              title="Validate & Increase Stock"
                              onClick={() => handleValidate(rec.id)}
                            >
                              <CheckCircle size={13} />
                              <span>Validate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Receipt Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Inbound Receipt"
        wide
      >
        {createError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Supplier / Vendor Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Industrial Supplies"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Destination Warehouse Location *</label>
              <select
                className="form-select"
                value={locationId || ""}
                onChange={(e) => setLocationId(Number(e.target.value))}
                required
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: "14px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "13.5px" }}>Line Items</span>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={handleAddItemRow}
            >
              <Plus size={13} /> Add Product
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
            {items.map((row, idx) => {
              const matchedProduct = products.find((p) => p.id === row.product_id);
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#f9f8f6",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #eae6e1",
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <select
                      className="form-select"
                      style={{ padding: "6px 10px", fontSize: "13px", width: "100%" }}
                      value={row.product_id}
                      onChange={(e) => handleItemChange(idx, "product_id", e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) · {p.stock} on hand
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      className="form-input"
                      style={{ padding: "6px 10px", fontSize: "13px", width: "100%" }}
                      value={row.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      required
                    />
                    <span style={{ fontSize: "12px", color: "#6e6761", width: "35px" }}>
                      {matchedProduct?.unit || "units"}
                    </span>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="logout-icon-btn"
                      style={{ color: "#c5221f" }}
                      onClick={() => handleRemoveItemRow(idx)}
                      title="Remove row"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="modal-footer" style={{ padding: "20px 0 0", marginTop: "18px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={createSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createSubmitting}>
              {createSubmitting ? "Creating..." : "Save Draft Receipt"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail / Action Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Receipt REC-${String(selectedReceipt.id).padStart(4, "0")}`}
          wide
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#6e6761" }}>Supplier</div>
              <div style={{ fontWeight: 700, fontSize: "16px" }}>{selectedReceipt.supplier || selectedReceipt.supplier_name}</div>
            </div>
            <div>
              <StatusBadge status={selectedReceipt.status} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#6e6761" }}>Items on this Receipt:</span>
            <table className="custom-table" style={{ marginTop: "8px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {selectedReceipt.items?.map((it, idx) => {
                  const prod = products.find((p) => p.id === it.product_id);
                  return (
                    <tr key={idx}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{prod ? prod.name : `Product #${it.product_id}`}</span>
                        {prod && <span style={{ fontSize: "11px", color: "#8c847e", marginLeft: "8px" }}>({prod.sku})</span>}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {it.quantity} {prod?.unit || "units"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0" }}>
            {selectedReceipt.status === "draft" && (
              <>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => handleCancel(selectedReceipt.id)}
                  disabled={actionLoading}
                >
                  <XCircle size={14} /> Cancel Receipt
                </button>
                <button
                  type="button"
                  className="btn-success"
                  onClick={() => handleValidate(selectedReceipt.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle size={15} />
                  <span>{actionLoading ? "Processing..." : "Validate & Receive into Stock"}</span>
                </button>
              </>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsDetailOpen(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

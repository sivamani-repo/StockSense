import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Scale,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  getAdjustments,
  createAdjustment,
  applyAdjustment,
  cancelAdjustment,
  getProducts,
  getLocations,
} from "../services/inventoryService";

export default function Adjustments() {
  const [searchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get("new") === "true";

  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [locationId, setLocationId] = useState(null);
  const [items, setItems] = useState([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Detail Modal State
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getAdjustments(), getProducts(), getLocations()])
      .then(([adjList, prodList, locList]) => {
        setAdjustments(adjList || []);
        setProducts(prodList || []);
        setLocations(locList || []);

        if (locList && locList.length > 0 && !locationId) {
          setLocationId(locList[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load adjustments.");
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
    const defaultLoc = locations[0]?.id || null;
    setLocationId(defaultLoc);

    const defaultPid = products[0]?.id;
    const initialProd = products[0];
    setItems([
      {
        product_id: defaultPid,
        counted_quantity: initialProd ? initialProd.stock : 0,
      },
    ]);
    setCreateError("");
    setIsCreateOpen(true);
  }

  function handleAddItemRow() {
    const defaultPid = products[0]?.id;
    const prod = products[0];
    setItems([
      ...items,
      {
        product_id: defaultPid,
        counted_quantity: prod ? prod.stock : 0,
      },
    ]);
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    if (field === "counted_quantity") {
      updated[index].counted_quantity = parseFloat(value) || 0;
    } else {
      updated[index].product_id = Number(value);
      const prod = products.find((p) => p.id === Number(value));
      if (prod) {
        updated[index].counted_quantity = prod.stock;
      }
    }
    setItems(updated);
  }

  function handleRemoveItemRow(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!locationId) {
      setCreateError("Please select an adjustment location.");
      return;
    }
    if (items.length === 0) {
      setCreateError("Please add at least one line item.");
      return;
    }
    for (const it of items) {
      if (!it.product_id || it.counted_quantity < 0) {
        setCreateError("Each item must have a valid product and non-negative count.");
        return;
      }
    }

    try {
      setCreateSubmitting(true);
      setCreateError("");
      await createAdjustment({
        location_id: Number(locationId),
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          counted_quantity: Number(it.counted_quantity),
        })),
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setCreateError(err.message || "Failed to create adjustment.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleApply(id) {
    try {
      setActionLoading(true);
      await applyAdjustment(id);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to apply adjustment.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this inventory adjustment record?")) return;
    try {
      setActionLoading(true);
      await cancelAdjustment(id);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to cancel adjustment.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleViewDetail(adj) {
    setSelectedAdjustment(adj);
    setIsDetailOpen(true);
  }

  const filteredAdjustments = adjustments.filter((a) => {
    if (activeTab === "all") return true;
    return a.status === activeTab;
  });

  return (
    <AppLayout
      title="Inventory Adjustments & Stock Takes"
      actionButton={
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>New Stock Count / Adjustment</span>
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
            {tab} ({adjustments.filter((a) => tab === "all" || a.status === tab).length})
          </button>
        ))}
      </div>

      {/* Adjustments Table */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Adjustment Ref</th>
                <th>Count Location</th>
                <th>Items Audited</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                    Loading stock adjustments...
                  </td>
                </tr>
              ) : filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <Scale className="empty-state-icon" />
                      <h4>No {activeTab !== "all" ? activeTab : ""} adjustments found</h4>
                      <p>Perform physical counts to reconcile theoretical system inventory with shelf realities.</p>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        style={{ marginTop: "14px" }}
                        onClick={handleOpenCreate}
                      >
                        <Plus size={14} /> Record Physical Count
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const loc = locations.find((l) => l.id === adj.location_id);
                  const itemCount = adj.items ? adj.items.length : 0;

                  return (
                    <tr key={adj.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#181513" }}>
                          ADJ-{String(adj.id).padStart(4, "0")}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {loc ? `${loc.name} (${loc.code})` : `Location #${adj.location_id}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {itemCount} product line(s)
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={adj.status} />
                      </td>
                      <td style={{ fontSize: "12px", color: "#8c847e" }}>
                        {new Date(adj.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            title="View adjustment details"
                            onClick={() => handleViewDetail(adj)}
                          >
                            <Eye size={13} />
                          </button>
                          {adj.status === "draft" && (
                            <button
                              type="button"
                              className="btn-success btn-sm"
                              title="Apply & Reconcile Stock"
                              onClick={() => handleApply(adj.id)}
                            >
                              <CheckCircle size={13} />
                              <span>Apply Count</span>
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

      {/* Create Adjustment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Physical Count (Adjustment)"
        wide
      >
        {createError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit}>
          <div className="form-field">
            <label>Physical Storage Location *</label>
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

          <div style={{ marginTop: "14px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "13.5px" }}>Counted Products</span>
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
              const systemQty = matchedProduct ? matchedProduct.stock : 0;
              const diff = (row.counted_quantity || 0) - systemQty;

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
                          {p.name} ({p.sku}) · System: {p.stock} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1.2, display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="form-input"
                      style={{ padding: "6px 10px", fontSize: "13px", width: "100%" }}
                      value={row.counted_quantity}
                      onChange={(e) => handleItemChange(idx, "counted_quantity", e.target.value)}
                      placeholder="Counted"
                      required
                    />
                    <span style={{ fontSize: "12px", color: "#6e6761", width: "35px" }}>
                      {matchedProduct?.unit || "units"}
                    </span>
                  </div>

                  <div style={{ width: "70px", fontSize: "12px", fontWeight: 700, color: diff === 0 ? "#6e6761" : diff > 0 ? "#15803d" : "#b91c1c" }}>
                    {diff > 0 ? `+${diff}` : diff}
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
              {createSubmitting ? "Saving..." : "Save Draft Adjustment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail / Action Modal */}
      {selectedAdjustment && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Adjustment ADJ-${String(selectedAdjustment.id).padStart(4, "0")}`}
          wide
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#6e6761" }}>Location</div>
              <div style={{ fontWeight: 700, fontSize: "16px" }}>Location #{selectedAdjustment.location_id}</div>
            </div>
            <div>
              <StatusBadge status={selectedAdjustment.status} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#6e6761" }}>Physical Counted Values:</span>
            <table className="custom-table" style={{ marginTop: "8px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Counted Quantity</th>
                </tr>
              </thead>
              <tbody>
                {selectedAdjustment.items?.map((it, idx) => {
                  const prod = products.find((p) => p.id === it.product_id);
                  return (
                    <tr key={idx}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{prod ? prod.name : `Product #${it.product_id}`}</span>
                        {prod && <span style={{ fontSize: "11px", color: "#8c847e", marginLeft: "8px" }}>({prod.sku})</span>}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {it.counted_quantity} {prod?.unit || "units"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0" }}>
            {selectedAdjustment.status === "draft" && (
              <>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => handleCancel(selectedAdjustment.id)}
                  disabled={actionLoading}
                >
                  <XCircle size={14} /> Cancel Adjustment
                </button>
                <button
                  type="button"
                  className="btn-success"
                  onClick={() => handleApply(selectedAdjustment.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle size={15} />
                  <span>{actionLoading ? "Applying..." : "Apply & Reconcile Stock"}</span>
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

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ArrowRight,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  getTransfers,
  createTransfer,
  validateTransfer,
  cancelTransfer,
  getProducts,
  getLocations,
} from "../services/inventoryService";

export default function Transfers() {
  const [searchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get("new") === "true";

  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sourceLocId, setSourceLocId] = useState(null);
  const [destLocId, setDestLocId] = useState(null);
  const [items, setItems] = useState([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Detail Modal State
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getTransfers(), getProducts(), getLocations()])
      .then(([trfList, prodList, locList]) => {
        setTransfers(trfList || []);
        setProducts(prodList || []);
        setLocations(locList || []);

        if (locList && locList.length >= 2) {
          setSourceLocId(locList[0].id);
          setDestLocId(locList[1].id);
        } else if (locList && locList.length === 1) {
          setSourceLocId(locList[0].id);
          setDestLocId(locList[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load transfers.");
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
    if (locations.length >= 2) {
      setSourceLocId(locations[0].id);
      setDestLocId(locations[1].id);
    }
    const defaultPid = products[0]?.id;
    setItems([{ product_id: defaultPid, quantity: 5 }]);
    setCreateError("");
    setIsCreateOpen(true);
  }

  function handleAddItemRow() {
    const defaultPid = products[0]?.id;
    setItems([...items, { product_id: defaultPid, quantity: 1 }]);
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
    if (!sourceLocId || !destLocId) {
      setCreateError("Source and Destination locations are required.");
      return;
    }
    if (sourceLocId === destLocId) {
      setCreateError("Source location and Destination location cannot be the same.");
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
      await createTransfer({
        source_location_id: Number(sourceLocId),
        destination_location_id: Number(destLocId),
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
        })),
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setCreateError(err.message || "Failed to create transfer.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleValidate(id) {
    try {
      setActionLoading(true);
      await validateTransfer(id);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to execute transfer. Verify sufficient source stock!");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this transfer request?")) return;
    try {
      setActionLoading(true);
      await cancelTransfer(id);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to cancel transfer.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleViewDetail(trf) {
    setSelectedTransfer(trf);
    setIsDetailOpen(true);
  }

  const filteredTransfers = transfers.filter((t) => {
    if (activeTab === "all") return true;
    return t.status === activeTab;
  });

  return (
    <AppLayout
      title="Internal Stock Transfers"
      actionButton={
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>New Stock Transfer</span>
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
            {tab} ({transfers.filter((t) => tab === "all" || t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Transfers Table */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Transfer Ref</th>
                <th>Source Location</th>
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
                    Loading stock transfers...
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <ArrowLeftRight className="empty-state-icon" />
                      <h4>No {activeTab !== "all" ? activeTab : ""} transfers found</h4>
                      <p>Move inventory seamlessly between zones, aisles, and warehouses.</p>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        style={{ marginTop: "14px" }}
                        onClick={handleOpenCreate}
                      >
                        <Plus size={14} /> Create Stock Transfer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((trf) => {
                  const srcLoc = locations.find((l) => l.id === trf.source_location_id);
                  const dstLoc = locations.find((l) => l.id === trf.destination_location_id);
                  const itemCount = trf.items ? trf.items.length : 0;
                  const totalUnits = trf.items
                    ? trf.items.reduce((sum, it) => sum + (it.quantity || 0), 0)
                    : 0;

                  return (
                    <tr key={trf.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#181513" }}>
                          TRF-{String(trf.id).padStart(4, "0")}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {srcLoc ? `${srcLoc.name} (${srcLoc.code})` : `Location #${trf.source_location_id}`}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <ArrowRight size={13} color="#8c847e" />
                          <span style={{ fontWeight: 600 }}>
                            {dstLoc ? `${dstLoc.name} (${dstLoc.code})` : `Location #${trf.destination_location_id}`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {itemCount} line(s) · {totalUnits} unit(s)
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={trf.status} />
                      </td>
                      <td style={{ fontSize: "12px", color: "#8c847e" }}>
                        {new Date(trf.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            title="View transfer details"
                            onClick={() => handleViewDetail(trf)}
                          >
                            <Eye size={13} />
                          </button>
                          {trf.status === "draft" && (
                            <button
                              type="button"
                              className="btn-success btn-sm"
                              title="Validate & Relocate Stock"
                              onClick={() => handleValidate(trf.id)}
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

      {/* Create Transfer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Internal Stock Transfer"
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
              <label>Source Location (From) *</label>
              <select
                className="form-select"
                value={sourceLocId || ""}
                onChange={(e) => setSourceLocId(Number(e.target.value))}
                required
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Destination Location (To) *</label>
              <select
                className="form-select"
                value={destLocId || ""}
                onChange={(e) => setDestLocId(Number(e.target.value))}
                required
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id} disabled={l.id === sourceLocId}>
                    {l.name} ({l.code}) {l.id === sourceLocId ? "(Source)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: "14px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "13.5px" }}>Items to Relocate</span>
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
                          {p.name} ({p.sku}) · {p.stock} {p.unit} total
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
              {createSubmitting ? "Creating..." : "Save Draft Transfer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail / Action Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Transfer TRF-${String(selectedTransfer.id).padStart(4, "0")}`}
          wide
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#6e6761" }}>Transfer Route</div>
              <div style={{ fontWeight: 700, fontSize: "16px" }}>
                Location #{selectedTransfer.source_location_id} → Location #{selectedTransfer.destination_location_id}
              </div>
            </div>
            <div>
              <StatusBadge status={selectedTransfer.status} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#6e6761" }}>Items to Move:</span>
            <table className="custom-table" style={{ marginTop: "8px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity to Transfer</th>
                </tr>
              </thead>
              <tbody>
                {selectedTransfer.items?.map((it, idx) => {
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
            {selectedTransfer.status === "draft" && (
              <>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => handleCancel(selectedTransfer.id)}
                  disabled={actionLoading}
                >
                  <XCircle size={14} /> Cancel Transfer
                </button>
                <button
                  type="button"
                  className="btn-success"
                  onClick={() => handleValidate(selectedTransfer.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle size={15} />
                  <span>{actionLoading ? "Moving stock..." : "Validate & Move Stock"}</span>
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

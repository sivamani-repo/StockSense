import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  ArrowUpFromLine,
  CheckCircle,
  XCircle,
  PackageCheck,
  Truck,
  Eye,
  Trash2,
  ChevronRight,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  getDeliveries,
  getDelivery,
  createDelivery,
  pickDelivery,
  packDelivery,
  validateDelivery,
  cancelDelivery,
  getProducts,
  getLocations,
} from "../services/inventoryService";

export default function Deliveries() {
  const [searchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get("new") === "true";

  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [locationId, setLocationId] = useState(null);
  const [items, setItems] = useState([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Detail Modal
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getDeliveries(), getProducts(), getLocations()])
      .then(([delList, prodList, locList]) => {
        setDeliveries(delList || []);
        setProducts(prodList || []);
        setLocations(locList || []);

        if (locList && locList.length > 0 && !locationId) {
          setLocationId(locList[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load deliveries.");
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
    setCustomerName("Acme Enterprise Client");
    const defaultLoc = locations[0]?.id || null;
    setLocationId(defaultLoc);

    const defaultPid = products[0]?.id;
    setItems([
      {
        product_id: defaultPid,
        quantity: 5,
      },
    ]);
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
    if (!customerName.trim()) {
      setCreateError("Customer name is required.");
      return;
    }
    if (!locationId) {
      setCreateError("Please select a source warehouse location.");
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
      await createDelivery({
        customer: customerName.trim(),
        location_id: Number(locationId),
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
        })),
      });
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setCreateError(err.message || "Failed to create delivery.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  // Lifecycle workflow actions
  async function handlePick(id) {
    try {
      setActionLoading(true);
      const updated = await pickDelivery(id);
      setSelectedDelivery(updated);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to pick delivery.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePack(id) {
    try {
      setActionLoading(true);
      const updated = await packDelivery(id);
      setSelectedDelivery(updated);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to pack delivery.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleValidateShip(id) {
    try {
      setActionLoading(true);
      const updated = await validateDelivery(id);
      setSelectedDelivery(updated);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to validate delivery. Check on-hand stock!");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this delivery order?")) return;
    try {
      setActionLoading(true);
      await cancelDelivery(id);
      setIsDetailOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to cancel delivery.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleViewDetail(del) {
    setSelectedDelivery(del);
    setIsDetailOpen(true);
  }

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeTab === "all") return true;
    return d.status === activeTab;
  });

  return (
    <AppLayout
      title="Outbound Deliveries"
      actionButton={
        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>New Outbound Delivery</span>
        </button>
      }
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all", "draft", "waiting", "ready", "done", "canceled"].map((tab) => (
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
            {tab === "waiting" ? "Picked (Waiting)" : tab === "ready" ? "Packed (Ready)" : tab} (
            {deliveries.filter((d) => tab === "all" || d.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Deliveries Table */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Delivery Ref</th>
                <th>Customer</th>
                <th>Source Location</th>
                <th>Items Count</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: "right" }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                    Loading outbound deliveries...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <ArrowUpFromLine className="empty-state-icon" />
                      <h4>No {activeTab !== "all" ? activeTab : ""} deliveries found</h4>
                      <p>Create a sales shipment to fulfill and deliver products to customers.</p>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        style={{ marginTop: "14px" }}
                        onClick={handleOpenCreate}
                      >
                        <Plus size={14} /> Create Outbound Delivery
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => {
                  const loc = locations.find((l) => l.id === del.location_id);
                  const itemCount = del.items ? del.items.length : 0;
                  const totalUnits = del.items
                    ? del.items.reduce((sum, it) => sum + (it.quantity || 0), 0)
                    : 0;

                  return (
                    <tr key={del.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#181513" }}>
                          DEL-{String(del.id).padStart(4, "0")}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{del.customer || del.customer_name}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", color: "#5e5751" }}>
                          {loc ? `${loc.name} (${loc.code})` : `Location #${del.location_id}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {itemCount} line(s) · {totalUnits} unit(s)
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={del.status} />
                      </td>
                      <td style={{ fontSize: "12px", color: "#8c847e" }}>
                        {new Date(del.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            title="Inspect workflow details"
                            onClick={() => handleViewDetail(del)}
                          >
                            <Eye size={13} />
                          </button>

                          {del.status === "draft" && (
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              style={{ background: "#e0f2fe", borderColor: "#bae6fd", color: "#0369a1" }}
                              onClick={() => handlePick(del.id)}
                            >
                              Pick
                            </button>
                          )}

                          {del.status === "waiting" && (
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              style={{ background: "#f3e8fd", borderColor: "#e9d5ff", color: "#7e22ce" }}
                              onClick={() => handlePack(del.id)}
                            >
                              Pack
                            </button>
                          )}

                          {del.status === "ready" && (
                            <button
                              type="button"
                              className="btn-success btn-sm"
                              onClick={() => handleValidateShip(del.id)}
                            >
                              <Truck size={13} /> Validate & Ship
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

      {/* Create Delivery Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Outbound Delivery"
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
              <label>Customer Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nexus Corp Retail"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Source Warehouse Location *</label>
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
            <span style={{ fontWeight: 700, fontSize: "13.5px" }}>Deliverable Line Items</span>
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
                          {p.name} ({p.sku}) · {p.stock} {p.unit} in stock
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
              {createSubmitting ? "Creating..." : "Save Draft Delivery"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail / Stepper Modal */}
      {selectedDelivery && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Delivery DEL-${String(selectedDelivery.id).padStart(4, "0")}`}
          wide
        >
          {/* Step Pipeline Visualization */}
          <div className="workflow-steps">
            <div className={`workflow-step ${selectedDelivery.status === "draft" ? "current" : ["waiting", "ready", "done"].includes(selectedDelivery.status) ? "completed" : ""}`}>
              1. Draft Created
            </div>
            <ChevronRight className="workflow-arrow" size={14} />
            <div className={`workflow-step ${selectedDelivery.status === "waiting" ? "current" : ["ready", "done"].includes(selectedDelivery.status) ? "completed" : ""}`}>
              2. Warehouse Picked
            </div>
            <ChevronRight className="workflow-arrow" size={14} />
            <div className={`workflow-step ${selectedDelivery.status === "ready" ? "current" : selectedDelivery.status === "done" ? "completed" : ""}`}>
              3. Packed & Labeled
            </div>
            <ChevronRight className="workflow-arrow" size={14} />
            <div className={`workflow-step ${selectedDelivery.status === "done" ? "completed" : ""}`}>
              4. Shipped (Validated)
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#6e6761" }}>Customer</div>
              <div style={{ fontWeight: 700, fontSize: "16px" }}>{selectedDelivery.customer || selectedDelivery.customer_name}</div>
            </div>
            <div>
              <StatusBadge status={selectedDelivery.status} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#6e6761" }}>Items in this Delivery:</span>
            <table className="custom-table" style={{ marginTop: "8px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity to Ship</th>
                </tr>
              </thead>
              <tbody>
                {selectedDelivery.items?.map((it, idx) => {
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
            {selectedDelivery.status !== "done" && selectedDelivery.status !== "canceled" && (
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => handleCancel(selectedDelivery.id)}
                disabled={actionLoading}
              >
                <XCircle size={14} /> Cancel Delivery
              </button>
            )}

            {selectedDelivery.status === "draft" && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => handlePick(selectedDelivery.id)}
                disabled={actionLoading}
              >
                <span>Pick Delivery Items</span>
              </button>
            )}

            {selectedDelivery.status === "waiting" && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => handlePack(selectedDelivery.id)}
                disabled={actionLoading}
              >
                <PackageCheck size={15} />
                <span>Pack & Seal Items</span>
              </button>
            )}

            {selectedDelivery.status === "ready" && (
              <button
                type="button"
                className="btn-success"
                onClick={() => handleValidateShip(selectedDelivery.id)}
                disabled={actionLoading}
              >
                <Truck size={15} />
                <span>{actionLoading ? "Processing..." : "Validate & Ship Order"}</span>
              </button>
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

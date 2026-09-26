import React, { useEffect, useState } from "react";
import {
  Plus,
  BellRing,
  Trash2,
  AlertTriangle,
  Package,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import {
  getReorderRules,
  createReorderRule,
  deleteReorderRule,
  getProducts,
  getLocations,
} from "../services/inventoryService";

export default function ReorderRules() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: null,
    location_id: null,
    minimum_quantity: 10,
    maximum_quantity: 100,
    reorder_quantity: 25,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getReorderRules(), getProducts(), getLocations()])
      .then(([ruleList, prodList, locList]) => {
        setRules(ruleList || []);
        setProducts(prodList || []);
        setLocations(locList || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load reorder rules.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenAdd() {
    setForm({
      product_id: products[0]?.id || null,
      location_id: null,
      minimum_quantity: 10,
      maximum_quantity: 100,
      reorder_quantity: 25,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.product_id) {
      setFormError("Please select a product.");
      return;
    }
    if (form.minimum_quantity < 0 || form.reorder_quantity <= 0) {
      setFormError("Minimum quantity must be >= 0 and Reorder quantity must be > 0.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await createReorderRule({
        product_id: Number(form.product_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        minimum_quantity: Number(form.minimum_quantity),
        maximum_quantity: form.maximum_quantity ? Number(form.maximum_quantity) : null,
        reorder_quantity: Number(form.reorder_quantity),
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to create reorder rule.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(rule) {
    if (!window.confirm("Delete this automated reorder threshold rule?")) return;
    try {
      await deleteReorderRule(rule.id);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete reorder rule.");
    }
  }

  return (
    <AppLayout
      title="Automated Reorder Rules & Safety Stock"
      actionButton={
        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>New Reorder Rule</span>
        </button>
      }
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div className="content-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Scope (Location)</th>
                <th>Current Stock</th>
                <th>Min Safety Stock</th>
                <th>Max Limit</th>
                <th>Suggested Reorder Qty</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                    Loading reorder rules...
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <BellRing className="empty-state-icon" />
                      <h4>No Reorder Rules Configured</h4>
                      <p>Set minimum threshold safety stocks so StockSense alerts you when inventory is running low.</p>
                      <button type="button" className="btn-primary btn-sm" style={{ marginTop: "14px" }} onClick={handleOpenAdd}>
                        <Plus size={14} /> Add First Rule
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                rules.map((rule) => {
                  const prod = products.find((p) => p.id === rule.product_id);
                  const loc = locations.find((l) => l.id === rule.location_id);
                  const isLow = prod && prod.stock <= rule.minimum_quantity;

                  return (
                    <tr key={rule.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prod ? prod.name : `Product #${rule.product_id}`}</div>
                        <div style={{ fontSize: "11px", color: "#8c847e" }}>{prod?.sku}</div>
                      </td>
                      <td>
                        {loc ? (
                          <span style={{ fontSize: "13px" }}>{loc.name} ({loc.code})</span>
                        ) : (
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "6px", background: "#f2eee9", color: "#6e6761" }}>
                            GLOBAL (All Locations)
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: "14px" }}>
                        {prod ? `${prod.stock} ${prod.unit}` : "-"}
                      </td>
                      <td style={{ fontWeight: 600, color: "#b45309" }}>
                        {rule.minimum_quantity} {prod?.unit || "units"}
                      </td>
                      <td style={{ color: "#6e6761" }}>
                        {rule.maximum_quantity ? `${rule.maximum_quantity} ${prod?.unit || "units"}` : "None"}
                      </td>
                      <td style={{ fontWeight: 700, color: "#15803d" }}>
                        +{rule.reorder_quantity} {prod?.unit || "units"}
                      </td>
                      <td>
                        {isLow ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#dc2626", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                            <AlertTriangle size={13} /> Triggered
                          </span>
                        ) : (
                          <span style={{ color: "#15803d", fontWeight: 600, fontSize: "12px" }}>
                            Normal
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="logout-icon-btn"
                          style={{ color: "#c5221f" }}
                          title="Delete Rule"
                          onClick={() => handleDelete(rule)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Automated Reorder Rule"
      >
        {formError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Product *</label>
            <select
              className="form-select"
              value={form.product_id || ""}
              onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) · {p.stock} on hand
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Location Scope (Optional)</label>
            <select
              className="form-select"
              value={form.location_id || ""}
              onChange={(e) => setForm({ ...form, location_id: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Global across all locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Minimum Stock Threshold *</label>
              <input
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.minimum_quantity}
                onChange={(e) => setForm({ ...form, minimum_quantity: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="form-field">
              <label>Maximum Quantity (Cap)</label>
              <input
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.maximum_quantity || ""}
                onChange={(e) => setForm({ ...form, maximum_quantity: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Suggested Replenishment Quantity *</label>
            <input
              type="number"
              min="1"
              step="any"
              className="form-input"
              value={form.reorder_quantity}
              onChange={(e) => setForm({ ...form, reorder_quantity: parseFloat(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0", marginTop: "16px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Reorder Rule"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

import React, { useEffect, useState } from "react";
import {
  Plus,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../services/inventoryService";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Form states
  const [whForm, setWhForm] = useState({ name: "", code: "" });
  const [locForm, setLocForm] = useState({
    warehouse_id: null,
    name: "",
    code: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getWarehouses(), getLocations()])
      .then(([whs, locs]) => {
        setWarehouses(whs || []);
        setLocations(locs || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load facility data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenWarehouseModal() {
    setWhForm({ name: "", code: "" });
    setFormError("");
    setIsWarehouseModalOpen(true);
  }

  function handleOpenLocationModal(warehouseId = null) {
    const targetWhId = warehouseId || warehouses[0]?.id || null;
    setLocForm({
      warehouse_id: targetWhId,
      name: "",
      code: "",
      is_active: true,
    });
    setFormError("");
    setIsLocationModalOpen(true);
  }

  async function handleWarehouseSubmit(e) {
    e.preventDefault();
    if (!whForm.name.trim() || !whForm.code.trim()) {
      setFormError("Name and unique code are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await createWarehouse({
        name: whForm.name.trim(),
        code: whForm.code.trim().toUpperCase(),
      });
      setIsWarehouseModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to create warehouse.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLocationSubmit(e) {
    e.preventDefault();
    if (!locForm.name.trim() || !locForm.code.trim() || !locForm.warehouse_id) {
      setFormError("Warehouse, location name, and location code are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await createLocation({
        warehouse_id: Number(locForm.warehouse_id),
        name: locForm.name.trim(),
        code: locForm.code.trim().toUpperCase(),
        is_active: Boolean(locForm.is_active),
      });
      setIsLocationModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to create location.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWarehouse(wh) {
    if (!window.confirm(`Delete warehouse "${wh.name}"? It must have no locations or stock.`)) return;
    try {
      await deleteWarehouse(wh.id);
      loadData();
    } catch (err) {
      alert(err.message || "Cannot delete warehouse with existing locations.");
    }
  }

  async function handleDeleteLocation(loc) {
    if (!window.confirm(`Delete location "${loc.name}"? It must contain zero stock.`)) return;
    try {
      await deleteLocation(loc.id);
      loadData();
    } catch (err) {
      alert(err.message || "Cannot delete location with existing stock balances.");
    }
  }

  return (
    <AppLayout
      title="Warehouses & Storage Locations"
      actionButton={
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="btn-secondary" onClick={() => handleOpenLocationModal()}>
            <Plus size={15} />
            <span>Add Location</span>
          </button>
          <button type="button" className="btn-primary" onClick={handleOpenWarehouseModal}>
            <Plus size={15} />
            <span>Add Warehouse</span>
          </button>
        </div>
      }
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#8c847e" }}>
          Loading warehouse hierarchy...
        </div>
      ) : warehouses.length === 0 ? (
        <div className="content-card" style={{ padding: "40px", textAlign: "center" }}>
          <Building2 className="empty-state-icon" />
          <h4>No Warehouses Configured</h4>
          <p>Create your primary warehouse facility to start assigning storage zones.</p>
          <button type="button" className="btn-primary" style={{ marginTop: "14px" }} onClick={handleOpenWarehouseModal}>
            <Plus size={14} /> Create First Warehouse
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {warehouses.map((wh) => {
            const whLocations = locations.filter((l) => l.warehouse_id === wh.id);

            return (
              <div key={wh.id} className="content-card">
                <div className="content-card-header" style={{ background: "#fbfaf8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="kpi-icon-pill brown" style={{ width: "32px", height: "32px" }}>
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                        {wh.name}
                      </h3>
                      <span style={{ fontSize: "12px", color: "#6e6761" }}>
                        Facility Code: <code>{wh.code}</code> · {whLocations.length} active location zone(s)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => handleOpenLocationModal(wh.id)}
                    >
                      <Plus size={13} /> Add Zone
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      style={{ color: "#c5221f" }}
                      title="Delete Warehouse"
                      onClick={() => handleDeleteWarehouse(wh)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Location / Zone Name</th>
                        <th>Location Code</th>
                        <th>Active Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whLocations.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#8c847e" }}>
                            No locations in this warehouse. Click "Add Zone" above to add shelves or aisles.
                          </td>
                        </tr>
                      ) : (
                        whLocations.map((loc) => (
                          <tr key={loc.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <MapPin size={14} color="#6e6761" />
                                <span style={{ fontWeight: 600 }}>{loc.name}</span>
                              </div>
                            </td>
                            <td>
                              <code>{loc.code}</code>
                            </td>
                            <td>
                              {loc.is_active ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#15803d", fontSize: "12px", fontWeight: 600 }}>
                                  <CheckCircle size={13} /> Active
                                </span>
                              ) : (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#b91c1c", fontSize: "12px", fontWeight: 600 }}>
                                  <XCircle size={13} /> Inactive
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                className="logout-icon-btn"
                                style={{ color: "#c5221f" }}
                                title="Delete Location"
                                onClick={() => handleDeleteLocation(loc)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        title="Add New Warehouse"
      >
        {formError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleWarehouseSubmit}>
          <div className="form-field">
            <label>Warehouse Facility Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Central Distribution Hub"
              value={whForm.name}
              onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label>Unique Facility Code *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MAIN, WEST-1, DOCK"
              value={whForm.code}
              onChange={(e) => setWhForm({ ...whForm, code: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0", marginTop: "16px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsWarehouseModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Create Warehouse"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Location Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Add Storage Location / Zone"
      >
        {formError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleLocationSubmit}>
          <div className="form-field">
            <label>Parent Warehouse *</label>
            <select
              className="form-select"
              value={locForm.warehouse_id || ""}
              onChange={(e) => setLocForm({ ...locForm, warehouse_id: Number(e.target.value) })}
              required
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Location / Zone Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aisle 3 - Pallet Rack B"
                value={locForm.name}
                onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Location Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A3-B2, RECV-01"
                value={locForm.code}
                onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0", marginTop: "16px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsLocationModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Create Location"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

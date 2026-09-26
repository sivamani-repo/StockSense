import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Package,
  Wand2,
  AlertCircle,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getLocations,
} from "../services/inventoryService";

export default function Products() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState(initialFilter);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    category_id: null,
    unit: "pcs",
    stock: 0,
    location_id: null,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([getProducts(), getCategories(), getLocations()])
      .then(([prods, cats, locs]) => {
        setProducts(prods || []);
        setCategories(cats || []);
        setLocations(locs || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load products.");
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
      name: "",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.name || "General",
      category_id: categories[0]?.id || null,
      unit: "pcs",
      stock: 0,
      location_id: locations[0]?.id || null,
    });
    setFormError("");
    setIsAddModalOpen(true);
  }

  function handleOpenEdit(prod) {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      category_id: prod.category_id,
      unit: prod.unit,
      stock: prod.stock,
      location_id: null,
    });
    setFormError("");
    setIsEditModalOpen(true);
  }

  function handleCategorySelect(catName) {
    const found = categories.find((c) => c.name === catName);
    setForm((prev) => ({
      ...prev,
      category: catName,
      category_id: found ? found.id : null,
    }));
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || !form.category.trim()) {
      setFormError("Product name, SKU, and category are required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      await createProduct({
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        category: form.category.trim(),
        category_id: form.category_id || undefined,
        unit: form.unit.trim() || "pcs",
        stock: Number(form.stock) || 0,
        location_id: form.location_id ? Number(form.location_id) : undefined,
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to create product.");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setFormSubmitting(true);
      setFormError("");
      await updateProduct(editingProduct.id, {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        category: form.category.trim(),
        category_id: form.category_id || editingProduct.category_id,
        unit: form.unit.trim() || "pcs",
        stock: Number(form.stock),
      });
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to update product.");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(prod) {
    if (!window.confirm(`Are you sure you want to delete ${prod.name} (${prod.sku})?`)) {
      return;
    }
    try {
      await deleteProduct(prod.id);
      loadData();
    } catch (err) {
      alert(err.message || "Unable to delete product. It may have existing transaction records.");
    }
  }

  // Filter products locally for instantaneous snappy response
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();

    let matchesStatus = true;
    if (stockStatusFilter === "in_stock") {
      matchesStatus = p.stock > 10;
    } else if (stockStatusFilter === "low_stock") {
      matchesStatus = p.stock > 0 && p.stock <= 10;
    } else if (stockStatusFilter === "out_of_stock") {
      matchesStatus = p.stock <= 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AppLayout
      title="Product Catalog"
      actionButton={
        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      }
      onSearch={setSearchQuery}
      searchValue={searchQuery}
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#6e6761" }}>Category:</label>
          <select
            className="form-select"
            style={{ padding: "6px 12px", fontSize: "13px" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <label style={{ fontSize: "12px", fontWeight: 600, color: "#6e6761", marginLeft: "10px" }}>
            Stock Health:
          </label>
          <select
            className="form-select"
            style={{ padding: "6px 12px", fontSize: "13px" }}
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">Healthy (In Stock)</option>
            <option value="low_stock">Low Stock (≤ 10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "#6e6761" }}>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
        </div>
      </div>

      {/* Products Table Card */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>On-Hand Stock</th>
                <th>Unit</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="empty-state">
                      <Package className="empty-state-icon" />
                      <h4>No products match your filter</h4>
                      <p>Try clearing your search query or add a new product to your inventory catalog.</p>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        style={{ marginTop: "14px" }}
                        onClick={handleOpenAdd}
                      >
                        <Plus size={14} /> Add First Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  let status = "in_stock";
                  if (p.stock <= 0) status = "out_of_stock";
                  else if (p.stock <= 10) status = "low_stock";

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#8c847e" }}>ID #{p.id}</div>
                      </td>
                      <td>
                        <code
                          style={{
                            background: "#f2eee9",
                            padding: "3px 7px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#3f362e",
                          }}
                        >
                          {p.sku}
                        </code>
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#f5f3f0",
                            padding: "3px 9px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            color: "#5e5751",
                            fontWeight: 500,
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: "14px" }}>
                        {p.stock.toLocaleString()}
                      </td>
                      <td style={{ color: "#6e6761", fontSize: "13px" }}>
                        {p.unit}
                      </td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            title="Edit product"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            style={{ color: "#c5221f" }}
                            title="Delete product"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        {formError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleAddSubmit}>
          <div className="form-field">
            <label>Product Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ergonomic Office Chair"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>SKU (Stock Keeping Unit) *</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CHR-100"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  title="Generate Random SKU"
                  onClick={() =>
                    setForm({
                      ...form,
                      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                    })
                  }
                >
                  <Wand2 size={13} />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label>Unit of Measure *</label>
              <input
                type="text"
                className="form-input"
                placeholder="pcs, kg, boxes, liters"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Category *</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Initial Opening Stock</label>
              <input
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {locations.length > 0 && form.stock > 0 && (
            <div className="form-field">
              <label>Storage Location for Initial Stock</label>
              <select
                className="form-select"
                value={form.location_id || ""}
                onChange={(e) => setForm({ ...form, location_id: e.target.value ? Number(e.target.value) : null })}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-footer" style={{ padding: "16px 0 0", marginTop: "16px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={formSubmitting}>
              {formSubmitting ? "Creating..." : "Save Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        {formError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleEditSubmit}>
          <div className="form-field">
            <label>Product Name *</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>SKU *</label>
              <input
                type="text"
                className="form-input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Unit *</label>
              <input
                type="text"
                className="form-input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Category *</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Reconciled Stock Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: "16px 0 0", marginTop: "16px" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={formSubmitting}>
              {formSubmitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

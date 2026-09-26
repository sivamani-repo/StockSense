import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Layers,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import {
  getStockLevels,
  getStockLedger,
  getProducts,
  getLocations,
} from "../services/inventoryService";

export default function StockLedger() {
  const [activeTab, setActiveTab] = useState("ledger"); // "ledger" or "levels"

  // Data
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovementType, setSelectedMovementType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  function loadData() {
    setLoading(true);
    setError(null);
    Promise.all([
      getStockLedger({ limit: 150 }),
      getStockLevels(),
      getProducts(),
      getLocations(),
    ])
      .then(([ledger, levels, prods, locs]) => {
        setLedgerEntries(ledger || []);
        setStockLevels(levels || []);
        setProducts(prods || []);
        setLocations(locs || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load stock data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredLedger = ledgerEntries.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedMovementType === "all" || item.movement_type === selectedMovementType;

    const matchesLoc =
      selectedLocation === "all" || String(item.location_id) === selectedLocation;

    return matchesSearch && matchesType && matchesLoc;
  });

  const filteredLevels = stockLevels.filter((lvl) => {
    const matchesSearch =
      !searchQuery ||
      lvl.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.product_sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLoc =
      selectedLocation === "all" || String(lvl.location_id) === selectedLocation;

    return matchesSearch && matchesLoc;
  });

  return (
    <AppLayout
      title="Stock Levels & Audit Ledger"
      actionButton={
        <button type="button" className="btn-secondary" onClick={loadData} title="Refresh">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
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

      {/* Main Mode Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          type="button"
          className="btn-secondary"
          style={{
            background: activeTab === "ledger" ? "#28221d" : "#ffffff",
            color: activeTab === "ledger" ? "#ffffff" : "#181513",
            borderColor: activeTab === "ledger" ? "#28221d" : "#d5cfc7",
          }}
          onClick={() => setActiveTab("ledger")}
        >
          <ClipboardList size={16} />
          <span>Stock Movement Ledger (Audit Log)</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          style={{
            background: activeTab === "levels" ? "#28221d" : "#ffffff",
            color: activeTab === "levels" ? "#ffffff" : "#181513",
            borderColor: activeTab === "levels" ? "#28221d" : "#d5cfc7",
          }}
          onClick={() => setActiveTab("levels")}
        >
          <Layers size={16} />
          <span>Location Balance Matrix</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="filter-bar">
        <div className="filter-group">
          {activeTab === "ledger" && (
            <>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#6e6761" }}>
                Movement Type:
              </label>
              <select
                className="form-select"
                style={{ padding: "6px 12px", fontSize: "13px" }}
                value={selectedMovementType}
                onChange={(e) => setSelectedMovementType(e.target.value)}
              >
                <option value="all">All Movements</option>
                <option value="receipt">Receipt (Inbound)</option>
                <option value="delivery">Delivery (Outbound)</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="adjustment">Count Adjustment</option>
                <option value="opening_balance">Opening Balance</option>
              </select>
            </>
          )}

          <label style={{ fontSize: "12px", fontWeight: 600, color: "#6e6761", marginLeft: "10px" }}>
            Storage Location:
          </label>
          <select
            className="form-select"
            style={{ padding: "6px 12px", fontSize: "13px" }}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={String(loc.id)}>
                {loc.name} ({loc.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "#6e6761" }}>
          Showing <strong>{activeTab === "ledger" ? filteredLedger.length : filteredLevels.length}</strong> record(s)
        </div>
      </div>

      {/* Tab 1: Ledger Table */}
      {activeTab === "ledger" && (
        <div className="content-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>Location</th>
                  <th>Movement Type</th>
                  <th>Quantity Change</th>
                  <th>Before → After</th>
                  <th>Reference</th>
                  <th>Operator</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                      Loading ledger entries...
                    </td>
                  </tr>
                ) : filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                      <div className="empty-state">
                        <ClipboardList className="empty-state-icon" />
                        <h4>No audit ledger records found</h4>
                        <p>Perform receipts, deliveries, transfers, or adjustments to see audit logs recorded here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((row) => {
                    const isPositive = row.quantity_change > 0;
                    return (
                      <tr key={row.id}>
                        <td style={{ fontSize: "12px", color: "#6e6761", whiteSpace: "nowrap" }}>
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.product_name}</div>
                          <div style={{ fontSize: "11px", color: "#8c847e" }}>{row.product_sku}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: "13px" }}>{row.location_name}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "#f2eee9",
                              color: "#5e5751",
                            }}
                          >
                            {row.movement_type.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              color: isPositive ? "#15803d" : "#b91c1c",
                            }}
                          >
                            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {isPositive ? `+${row.quantity_change}` : row.quantity_change}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px", color: "#5e5751" }}>
                          {row.quantity_before} → <strong>{row.quantity_after}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", background: "#f5f3f0", padding: "2px 6px", borderRadius: "4px" }}>
                            {row.reference_type} #{row.reference_id}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "#6e6761" }}>
                          {row.created_by_name}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Levels Table */}
      {activeTab === "levels" && (
        <div className="content-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Warehouse</th>
                  <th>Location Zone</th>
                  <th>On-Hand Quantity</th>
                  <th>Unit</th>
                  <th>Last Movement</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                      Loading location stock levels...
                    </td>
                  </tr>
                ) : filteredLevels.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                      <div className="empty-state">
                        <Layers className="empty-state-icon" />
                        <h4>No location balances recorded</h4>
                        <p>Stock will appear here once allocated to locations via receipts or adjustments.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLevels.map((lvl) => (
                    <tr key={lvl.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{lvl.product_name}</div>
                        <div style={{ fontSize: "11px", color: "#8c847e" }}>{lvl.product_category}</div>
                      </td>
                      <td>
                        <code>{lvl.product_sku}</code>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{lvl.warehouse_name}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{lvl.location_name}</span>
                        <span style={{ fontSize: "11px", color: "#8c847e", marginLeft: "6px" }}>
                          ({lvl.location_code})
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: "15px" }}>
                        {lvl.quantity}
                      </td>
                      <td style={{ color: "#6e6761" }}>
                        {lvl.product_unit}
                      </td>
                      <td style={{ fontSize: "12px", color: "#8c847e" }}>
                        {new Date(lvl.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Boxes,
  AlertTriangle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Scale,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import StatusBadge from "../components/StatusBadge";
import { getDashboardStats } from "../services/inventoryService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadStats() {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadStats();
  }, []);

  const kpis = data?.kpis || {};
  const lowStockItems = data?.low_stock_items || [];
  const categoryDistribution = data?.category_distribution || [];
  const recentActivities = data?.recent_activities || [];

  const pendingOpsCount =
    (kpis.pending_receipts || 0) +
    (kpis.pending_deliveries || 0) +
    (kpis.pending_transfers || 0) +
    (kpis.pending_adjustments || 0);

  return (
    <AppLayout
      title="Inventory Dashboard"
      actionButton={
        <button
          type="button"
          onClick={loadStats}
          className="btn-secondary"
          title="Refresh statistics"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      }
    >
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 18px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Total Products</span>
            <div className="kpi-icon-pill brown">
              <Package size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? "..." : (kpis.total_products || 0).toLocaleString()}
          </div>
          <div className="kpi-subtext">
            Across {kpis.total_warehouses || 1} warehouse(s) & {kpis.total_locations || 1} location(s)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Total Stock Units</span>
            <div className="kpi-icon-pill green">
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? "..." : Math.round(kpis.total_stock_units || 0).toLocaleString()}
          </div>
          <div className="kpi-subtext">
            Physical on-hand inventory volume
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Stock Alerts</span>
            <div className="kpi-icon-pill amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: (kpis.out_of_stock_count || 0) > 0 ? "#dc2626" : "inherit" }}>
            {loading ? "..." : (kpis.low_stock_count || 0) + (kpis.out_of_stock_count || 0)}
          </div>
          <div className="kpi-subtext">
            <strong style={{ color: "#dc2626" }}>{kpis.out_of_stock_count || 0}</strong> out of stock,{" "}
            <strong style={{ color: "#d97706" }}>{kpis.low_stock_count || 0}</strong> low stock
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Pending Operations</span>
            <div className="kpi-icon-pill blue">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? "..." : pendingOpsCount}
          </div>
          <div className="kpi-subtext">
            {kpis.pending_receipts || 0} Inbound · {kpis.pending_deliveries || 0} Outbound · {kpis.pending_transfers || 0} Transfer
          </div>
        </div>
      </div>

      {/* Quick Launchpad Strip */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "16px 20px",
          border: "1px solid #eae6e1",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#6e6761", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Quick Actions:
        </span>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => navigate("/receipts?new=true")}
          >
            <ArrowDownToLine size={14} />
            <span>Receive Stock</span>
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => navigate("/deliveries?new=true")}
          >
            <ArrowUpFromLine size={14} />
            <span>Create Delivery</span>
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => navigate("/transfers?new=true")}
          >
            <ArrowLeftRight size={14} />
            <span>Move Stock</span>
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => navigate("/adjustments?new=true")}
          >
            <Scale size={14} />
            <span>Audit Adjustment</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Recent Movements & Categories) / Right 1 Col (Stock Alerts & Operations) */}
      <div className="dashboard-grid-sections">
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Recent Stock Ledger Movements */}
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">
                <Clock size={16} />
                <span>Recent Stock Movements (Audit Trail)</span>
              </h3>
              <Link
                to="/stock-ledger"
                style={{
                  fontSize: "12px",
                  color: "#6e6761",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "none",
                }}
              >
                <span>View Full Ledger</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Change</th>
                    <th>After</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#8c847e" }}>
                        No stock movements recorded yet. Create a receipt or adjustment to get started!
                      </td>
                    </tr>
                  ) : (
                    recentActivities.map((act) => {
                      const isPositive = act.quantity_change > 0;
                      return (
                        <tr key={act.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{act.product_name}</div>
                            <div style={{ fontSize: "11px", color: "#8c847e" }}>{act.product_sku}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px" }}>{act.location_name}</span>
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
                              {act.movement_type.replace("_", " ")}
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
                              {isPositive ? `+${act.quantity_change}` : act.quantity_change}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {act.quantity_after}
                          </td>
                          <td style={{ fontSize: "12px", color: "#6e6761" }}>
                            {act.user_name}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory by Category */}
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">
                <Boxes size={16} />
                <span>Inventory Distribution by Category</span>
              </h3>
            </div>
            <div className="content-card-body">
              {categoryDistribution.length === 0 ? (
                <p style={{ color: "#8c847e", fontSize: "13px", margin: 0 }}>
                  No categories found.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {categoryDistribution.map((cat) => {
                    const totalUnits = kpis.total_stock_units || 1;
                    const percent = Math.min(Math.round((cat.total_stock / totalUnits) * 100), 100);

                    return (
                      <div key={cat.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
                          <span style={{ fontWeight: 600 }}>{cat.name}</span>
                          <span style={{ color: "#6e6761" }}>
                            {cat.product_count} product(s) · {Math.round(cat.total_stock)} units ({percent}%)
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#eae6e1",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: "100%",
                              backgroundColor: "#2e6648",
                              borderRadius: "4px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Low Stock Attention Radar */}
          <div className="content-card">
            <div className="content-card-header" style={{ borderBottomColor: "#fee2e2" }}>
              <h3 className="content-card-title" style={{ color: "#b91c1c" }}>
                <AlertTriangle size={16} />
                <span>Low Stock Radar</span>
              </h3>
              <Link
                to="/products?filter=low_stock"
                style={{ fontSize: "12px", color: "#6e6761", fontWeight: 600, textDecoration: "none" }}
              >
                View all
              </Link>
            </div>

            <div className="content-card-body" style={{ padding: "12px 18px" }}>
              {lowStockItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 10px", color: "#15803d" }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>All stock levels healthy!</p>
                  <span style={{ fontSize: "12px", color: "#6e6761" }}>
                    No products below their minimum reorder threshold.
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: item.status === "out_of_stock" ? "#fef2f2" : "#fffbeb",
                        border: `1px solid ${item.status === "out_of_stock" ? "#fee2e2" : "#fef3c7"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>{item.name}</div>
                        <div style={{ fontSize: "11px", color: "#6e6761" }}>
                          SKU: {item.sku} · Min: {item.min_stock} {item.unit}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color: item.status === "out_of_stock" ? "#dc2626" : "#d97706",
                          }}
                        >
                          {item.stock} {item.unit}
                        </div>
                        <Link
                          to={`/receipts?new=true&product_id=${item.id}`}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#28221d",
                            textDecoration: "underline",
                          }}
                        >
                          + Reorder
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warehouse Operations Completion Card */}
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">
                <Boxes size={16} />
                <span>Operational Pipeline Status</span>
              </h3>
            </div>
            <div className="content-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#5e5751" }}>Completed Inbound Receipts</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>
                  {kpis.completed_receipts || 0}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#5e5751" }}>Completed Outbound Deliveries</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>
                  {kpis.completed_deliveries || 0}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#5e5751" }}>Completed Internal Transfers</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>
                  {kpis.completed_transfers || 0}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#5e5751" }}>Completed Stock Adjustments</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#15803d" }}>
                  {kpis.completed_adjustments || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

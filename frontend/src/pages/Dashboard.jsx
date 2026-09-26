import React, { useEffect, useState, useMemo } from "react";
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
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  Layers,
  Sparkles,
  Zap,
  ShieldAlert,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  Warehouse,
  ExternalLink,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import StatusBadge from "../components/StatusBadge";
import { getDashboardStats } from "../services/inventoryService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovementFilter, setSelectedMovementFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  function loadStats() {
    setLoading(true);
    setIsRefreshing(true);
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
        setTimeout(() => setIsRefreshing(false), 600);
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

  const completedOpsCount =
    (kpis.completed_receipts || 0) +
    (kpis.completed_deliveries || 0) +
    (kpis.completed_transfers || 0) +
    (kpis.completed_adjustments || 0);

  const totalOps = pendingOpsCount + completedOpsCount;
  const completionRate = totalOps > 0 ? Math.round((completedOpsCount / totalOps) * 100) : 100;

  const filteredActivities = useMemo(() => {
    return recentActivities.filter((act) => {
      const matchesSearch =
        act.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.product_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        selectedMovementFilter === "all" || act.movement_type === selectedMovementFilter;
      return matchesSearch && matchesFilter;
    });
  }, [recentActivities, searchTerm, selectedMovementFilter]);

  const filteredCategories = useMemo(() => {
    if (selectedCategoryFilter === "all") return categoryDistribution;
    return categoryDistribution.filter((c) => c.id === selectedCategoryFilter || c.name === selectedCategoryFilter);
  }, [categoryDistribution, selectedCategoryFilter]);

  return (
    <AppLayout
      title="Inventory Dashboard"
      actionButton={
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={loadStats}
            className="btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#334155",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} style={{ transition: "transform 0.5s ease" }} />
            <span>Sync Stats</span>
          </button>
        </div>
      }
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .dashboard-container {
          animation: fadeIn 0.4s ease-out forwards;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
        }

        .glass-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }

        .kpi-card-enhanced {
          background: #ffffff;
          border-radius: 16px;
          padding: 22px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        }

        .kpi-card-enhanced:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .kpi-card-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .kpi-brown::before { background: linear-gradient(90deg, #8b5cf6, #6366f1); }
        .kpi-green::before { background: linear-gradient(90deg, #10b981, #059669); }
        .kpi-amber::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .kpi-blue::before { background: linear-gradient(90deg, #3b82f6, #2563eb); }

        .action-btn-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }

        .action-btn-primary {
          background: #0f172a;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        .action-btn-primary:hover {
          background: #1e293b;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
        }

        .action-btn-secondary {
          background: #f8fafc;
          color: #334155;
          border: 1px solid #e2e8f0;
        }

        .action-btn-secondary:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .custom-table-enhanced {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .custom-table-enhanced th {
          padding: 14px 18px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .custom-table-enhanced td {
          padding: 16px 18px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
        }

        .custom-table-enhanced tr:hover td {
          background: #f8fafc;
        }

        .badge-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background-color: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "16px 20px",
              borderRadius: "14px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.08)",
            }}
          >
            <ShieldAlert size={20} color="#dc2626" />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>System Error:</span> {error}
            </div>
            <button
              onClick={loadStats}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {/* Card 1 */}
          <div className="kpi-card-enhanced kpi-brown">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Total Products</span>
              <div style={{ background: "#f3e8ff", color: "#7e22ce", padding: "8px", borderRadius: "10px" }}>
                <Package size={20} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", tracking: "-0.02em" }}>
              {loading ? "..." : (kpis.total_products || 0).toLocaleString()}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
              <Warehouse size={14} color="#94a3b8" />
              <span>{kpis.total_warehouses || 1} Wh. · {kpis.total_locations || 1} Locations</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="kpi-card-enhanced kpi-green">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Total Stock Units</span>
              <div style={{ background: "#d1fae5", color: "#047857", padding: "8px", borderRadius: "10px" }}>
                <Boxes size={20} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", tracking: "-0.02em" }}>
              {loading ? "..." : Math.round(kpis.total_stock_units || 0).toLocaleString()}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Physical volume available</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="kpi-card-enhanced kpi-amber">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Stock Alerts</span>
              <div style={{ background: "#fef3c7", color: "#b45309", padding: "8px", borderRadius: "10px" }}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: (kpis.out_of_stock_count || 0) > 0 ? "#e11d48" : "#0f172a",
                tracking: "-0.02em",
              }}
            >
              {loading ? "..." : (kpis.low_stock_count || 0) + (kpis.out_of_stock_count || 0)}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", display: "flex", gap: "8px" }}>
              <span style={{ color: "#e11d48", fontWeight: 700 }}>{kpis.out_of_stock_count || 0} Out</span>
              <span>·</span>
              <span style={{ color: "#d97706", fontWeight: 700 }}>{kpis.low_stock_count || 0} Low</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="kpi-card-enhanced kpi-blue">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Pending Ops</span>
              <div style={{ background: "#dbeafe", color: "#1d4ed8", padding: "8px", borderRadius: "10px" }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", tracking: "-0.02em" }}>
              {loading ? "..." : pendingOpsCount}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {kpis.pending_receipts || 0} In · {kpis.pending_deliveries || 0} Out · {kpis.pending_transfers || 0} Move
            </div>
          </div>
        </div>

        {/* Quick Launchpad Strip */}
        <div
          className="glass-card"
          style={{
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#0f172a", color: "#fff", padding: "6px", borderRadius: "8px" }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Quick Operations</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Execute common inventory tasks instantly</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="action-btn-pill action-btn-primary" onClick={() => navigate("/receipts?new=true")}>
              <ArrowDownToLine size={15} />
              <span>Receive Stock</span>
            </button>
            <button className="action-btn-pill action-btn-primary" onClick={() => navigate("/deliveries?new=true")}>
              <ArrowUpFromLine size={15} />
              <span>Create Delivery</span>
            </button>
            <button className="action-btn-pill action-btn-secondary" onClick={() => navigate("/transfers?new=true")}>
              <ArrowLeftRight size={15} />
              <span>Move Stock</span>
            </button>
            <button className="action-btn-pill action-btn-secondary" onClick={() => navigate("/adjustments?new=true")}>
              <Scale size={15} />
              <span>Audit Adjustment</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
          {/* Left Main Column (8 Cols) */}
          <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Recent Audit Movements Card */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Activity size={18} color="#475569" />
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    Stock Movement Ledger
                  </h3>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="Search movements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: "6px 12px 6px 30px",
                        fontSize: "12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        outline: "none",
                        width: "160px",
                      }}
                    />
                  </div>
                  <Link
                    to="/stock-ledger"
                    style={{
                      fontSize: "13px",
                      color: "#2563eb",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      textDecoration: "none",
                    }}
                  >
                    <span>Full Ledger</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="custom-table-enhanced">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Change</th>
                      <th>Balance</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                          <Layers size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                          <div>No stock movements match your query.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((act) => {
                        const isPositive = act.quantity_change > 0;
                        return (
                          <tr key={act.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>{act.product_name}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{act.product_sku}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: "12px", color: "#334155" }}>{act.location_name}</span>
                            </td>
                            <td>
                              <span
                                className="badge-pill"
                                style={{
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {act.movement_type ? act.movement_type.replace("_", " ") : "Movement"}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  color: isPositive ? "#16a34a" : "#dc2626",
                                }}
                              >
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {isPositive ? `+${act.quantity_change}` : act.quantity_change}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600, color: "#0f172a" }}>{act.quantity_after}</td>
                            <td style={{ fontSize: "12px", color: "#64748b" }}>{act.user_name || "System"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <PieChart size={18} color="#475569" />
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    Category Breakdown
                  </h3>
                </div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>By total volume ratio</span>
              </div>

              {filteredCategories.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  No category data available.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {filteredCategories.map((cat) => {
                    const totalUnits = kpis.total_stock_units || 1;
                    const percent = Math.min(Math.round((cat.total_stock / totalUnits) * 100), 100);

                    return (
                      <div key={cat.id || cat.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{cat.name}</span>
                          <span style={{ color: "#64748b", fontSize: "12px" }}>
                            {cat.product_count} items · <strong>{Math.round(cat.total_stock)}</strong> units ({percent}%)
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${percent}%`,
                              background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
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

          {/* Right Column (4 Cols) */}
          <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Low Stock Radar */}
            <div className="glass-card" style={{ padding: "20px", borderTop: "4px solid #ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#991b1b" }}>
                    Stock Alert Radar
                  </h3>
                </div>
                <Link
                  to="/products?filter=low_stock"
                  style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
                >
                  View All
                </Link>
              </div>

              {lowStockItems.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    background: "#f0fdf4",
                    borderRadius: "12px",
                    border: "1px solid #bbf7d0",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={24} color="#16a34a" style={{ margin: "0 auto 8px auto" }} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#15803d" }}>All Levels Healthy</div>
                  <div style={{ fontSize: "11px", color: "#166534", marginTop: "2px" }}>
                    No products below safety threshold.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {lowStockItems.map((item) => {
                    const isOut = item.status === "out_of_stock";
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          background: isOut ? "#fef2f2" : "#fffbeb",
                          border: `1px solid ${isOut ? "#fee2e2" : "#fef3c7"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{item.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                            Min: {item.min_stock} {item.unit}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "13px",
                              color: isOut ? "#dc2626" : "#d97706",
                            }}
                          >
                            {item.stock} {item.unit}
                          </div>
                          <Link
                            to={`/receipts?new=true&product_id=${item.id}`}
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#2563eb",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px",
                              marginTop: "2px",
                            }}
                          >
                            <span>Reorder</span>
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pipeline Status */}
            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BarChart3 size={18} color="#475569" />
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    Pipeline Health
                  </h3>
                </div>
                <span className="badge-pill" style={{ background: "#f0fdf4", color: "#166534" }}>
                  {completionRate}% Done
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b" }}>Receipts Fulfilled</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{kpis.completed_receipts || 0}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(((kpis.completed_receipts || 0) / ((kpis.completed_receipts || 0) + (kpis.pending_receipts || 1))) * 100, 100)}%`,
                        background: "#10b981",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b" }}>Deliveries Dispatched</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{kpis.completed_deliveries || 0}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(((kpis.completed_deliveries || 0) / ((kpis.completed_deliveries || 0) + (kpis.pending_deliveries || 1))) * 100, 100)}%`,
                        background: "#3b82f6",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b" }}>Internal Transfers</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{kpis.completed_transfers || 0}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(((kpis.completed_transfers || 0) / ((kpis.completed_transfers || 0) + (kpis.pending_transfers || 1))) * 100, 100)}%`,
                        background: "#8b5cf6",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b" }}>Audit Adjustments</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{kpis.completed_adjustments || 0}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(((kpis.completed_adjustments || 0) / ((kpis.completed_adjustments || 0) + (kpis.pending_adjustments || 1))) * 100, 100)}%`,
                        background: "#f59e0b",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Scale,
  ClipboardList,
  Building2,
  BellRing,
  LogOut,
} from "lucide-react";
import { getCurrentUser, logoutUser } from "../services/authService";
import { getDashboardStats } from "../services/inventoryService";

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch(() => {
        // Fallback or guest
      });

    getDashboardStats()
      .then((res) => {
        if (isMounted && res?.kpis?.low_stock_count !== undefined) {
          setLowStockCount((res.kpis.low_stock_count || 0) + (res.kpis.out_of_stock_count || 0));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SS";

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-mark">S</div>
        <div className="sidebar-brand-text">
          <h1>StockSense</h1>
          <span>Smart Inventory</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-title">Overview</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <div className="sidebar-nav-section-title">Catalog & Inventory</div>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Package size={18} />
          <span>Products</span>
          {lowStockCount > 0 && (
            <span className="sidebar-nav-badge" title="Items needing attention">
              {lowStockCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/stock-ledger"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <ClipboardList size={18} />
          <span>Stock & Ledger</span>
        </NavLink>

        <div className="sidebar-nav-section-title">Operations</div>
        <NavLink
          to="/receipts"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <ArrowDownToLine size={18} />
          <span>Inbound Receipts</span>
        </NavLink>

        <NavLink
          to="/deliveries"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <ArrowUpFromLine size={18} />
          <span>Outbound Deliveries</span>
        </NavLink>

        <NavLink
          to="/transfers"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <ArrowLeftRight size={18} />
          <span>Internal Transfers</span>
        </NavLink>

        <NavLink
          to="/adjustments"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Scale size={18} />
          <span>Adjustments</span>
        </NavLink>

        <div className="sidebar-nav-section-title">Configuration</div>
        <NavLink
          to="/warehouses"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Building2 size={18} />
          <span>Warehouses & Locations</span>
        </NavLink>

        <NavLink
          to="/reorder-rules"
          className={({ isActive }) =>
            `sidebar-nav-link ${isActive ? "active" : ""}`
          }
        >
          <BellRing size={18} />
          <span>Reorder Rules</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar">{initials}</div>
          <div className="user-meta">
            <div className="user-name">{user?.name || "Warehouse User"}</div>
            <div className="user-role-pill">
              {user?.role ? user.role.replace("_", " ") : "staff"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-icon-btn"
          title="Sign out of StockSense"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

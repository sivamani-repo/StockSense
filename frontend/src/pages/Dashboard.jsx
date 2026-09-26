
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpFromLine,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Layers3,
  MapPin,
  Package,
  PieChart,
  RefreshCw,
  ScanLine,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Truck,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Zap,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import { getDashboardStats } from "../services/inventoryService";

/* ================================================================
   STOCKSENSE DASHBOARD
   Premium logistics command center
   ================================================================ */

/*
  Remote imagery used only for the visual layer.
  You can later move these images into:
  src/assets/dashboard/
  without changing the dashboard architecture.
*/
const HERO_IMAGE =
  "https://static.wixstatic.com/media/6729c4_c03cf6f67f1944538f08a7d1cb91f4c2~mv2.jpg/v1/fill/w_1600%2Ch_1066%2Cal_c/6729c4_c03cf6f67f1944538f08a7d1cb91f4c2~mv2.jpg";

const SECONDARY_IMAGE =
  "https://www.also.com/ec/cms5/5410/customer/providers/also/5410-also-25q4-also-landing-page/img1_800px.jpg";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovementFilter, setSelectedMovementFilter] =
    useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ================================================================
     DATA
     ================================================================ */

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

        setTimeout(() => {
          setIsRefreshing(false);
        }, 650);
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

  const completionRate =
    totalOps > 0
      ? Math.round((completedOpsCount / totalOps) * 100)
      : 100;

  const totalProducts = Number(kpis.total_products || 0);
  const totalStockUnits = Number(kpis.total_stock_units || 0);
  const lowStockCount = Number(kpis.low_stock_count || 0);
  const outOfStockCount = Number(kpis.out_of_stock_count || 0);

  /* ================================================================
     FILTERS
     ================================================================ */

  const movementTypes = useMemo(() => {
    const types = recentActivities
      .map((item) => item.movement_type)
      .filter(Boolean);

    return ["all", ...Array.from(new Set(types))];
  }, [recentActivities]);

  const filteredActivities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return recentActivities.filter((act) => {
      const matchesSearch =
        !query ||
        act.product_name?.toLowerCase().includes(query) ||
        act.product_sku?.toLowerCase().includes(query) ||
        act.location_name?.toLowerCase().includes(query);

      const matchesMovement =
        selectedMovementFilter === "all" ||
        act.movement_type === selectedMovementFilter;

      return matchesSearch && matchesMovement;
    });
  }, [
    recentActivities,
    searchTerm,
    selectedMovementFilter,
  ]);

  const filteredCategories = useMemo(() => {
    if (selectedCategoryFilter === "all") {
      return categoryDistribution;
    }

    return categoryDistribution.filter(
      (category) =>
        category.id === selectedCategoryFilter ||
        category.name === selectedCategoryFilter
    );
  }, [
    categoryDistribution,
    selectedCategoryFilter,
  ]);

  /* ================================================================
     HELPERS
     ================================================================ */

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatMovementType = (value) =>
    value
      ? value
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "Movement";

  const pipelinePercentage = (completed, pending) => {
    const total =
      Number(completed || 0) + Number(pending || 0);

    if (!total) return 0;

    return Math.min(
      (Number(completed || 0) / total) * 100,
      100
    );
  };

  const healthText =
    completionRate >= 85
      ? "Operations are running smoothly"
      : completionRate >= 60
        ? "Operations need some attention"
        : "Several workflows need attention";

  const heroDate = new Date().toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  /* ================================================================
     UI
     ================================================================ */

  return (
    <AppLayout
      title="Inventory Dashboard"
      actionButton={
        <button
          type="button"
          className="ss-sync-button"
          onClick={loadStats}
          disabled={isRefreshing}
        >
          <RefreshCw
            size={15}
            className={isRefreshing ? "ss-spin" : ""}
          />

          <span>
            {isRefreshing ? "Syncing..." : "Sync Stats"}
          </span>
        </button>
      }
    >
      <style>{`
        /* ==========================================================
           BASE
        =========================================================== */

        .ss-dashboard {
          --ss-ink: #07111f;
          --ss-ink-2: #172033;
          --ss-muted: #64748b;
          --ss-soft: #94a3b8;
          --ss-border: #e6ebf1;
          --ss-blue: #2563eb;
          --ss-green: #10b981;
          --ss-red: #ef4444;
          --ss-amber: #f59e0b;
          --ss-purple: #7c3aed;

          width: 100%;
          max-width: 1700px;
          margin: 0 auto;
          color: var(--ss-ink);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          display: flex;
          flex-direction: column;
          gap: 22px;

          animation:
            ss-page-enter
            0.65s
            cubic-bezier(.22,.75,.2,1)
            both;
        }

        .ss-dashboard *,
        .ss-dashboard *::before,
        .ss-dashboard *::after {
          box-sizing: border-box;
        }

        .ss-dashboard button,
        .ss-dashboard input,
        .ss-dashboard select {
          font: inherit;
        }

        .ss-dashboard button:focus-visible,
        .ss-dashboard a:focus-visible,
        .ss-dashboard input:focus-visible,
        .ss-dashboard select:focus-visible {
          outline:
            3px solid
            rgba(37, 99, 235, .17);
          outline-offset: 3px;
        }

        /* ==========================================================
           TOP SYNC
        =========================================================== */

        .ss-sync-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          height: 38px;
          padding: 0 14px;

          border-radius: 12px;
          border: 1px solid #dce3ea;

          background:
            linear-gradient(
              180deg,
              #ffffff,
              #f8fafc
            );

          color: #0f172a;

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 6px 16px
            rgba(15, 23, 42, .045);

          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease;
        }

        .ss-sync-button:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: #cbd5e1;

          box-shadow:
            0 12px 26px
            rgba(15, 23, 42, .09);
        }

        .ss-sync-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .ss-sync-button:disabled {
          opacity: .72;
          cursor: not-allowed;
        }

        .ss-spin {
          animation:
            ss-spin
            .8s
            linear
            infinite;
        }

        /* ==========================================================
           HERO
        =========================================================== */

        .ss-hero {
          position: relative;
          min-height: 300px;

          overflow: hidden;

          border:
            1px solid
            rgba(15, 23, 42, .9);

          border-radius: 28px;

          background:
            radial-gradient(
              circle at 10% 15%,
              rgba(96, 165, 250, .23),
              transparent 23%
            ),
            radial-gradient(
              circle at 80% 0%,
              rgba(168, 85, 247, .14),
              transparent 26%
            ),
            linear-gradient(
              135deg,
              #07111f 0%,
              #101a2b 48%,
              #17253d 100%
            );

          box-shadow:
            0 22px 50px
            rgba(15, 23, 42, .18);

          isolation: isolate;
        }

        .ss-hero::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              100deg,
              rgba(4, 10, 19, .97) 0%,
              rgba(4, 10, 19, .90) 36%,
              rgba(4, 10, 19, .48) 68%,
              rgba(4, 10, 19, .25) 100%
            );

          z-index: 1;
        }

        .ss-hero-grid {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(255,255,255,.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.045) 1px,
              transparent 1px
            );

          background-size:
            46px 46px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent
            );

          opacity: .45;

          animation:
            ss-grid-drift
            16s
            linear
            infinite;
        }

        .ss-hero-image {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
          object-position: center;

          opacity: .46;

          transform:
            scale(1.045);

          filter:
            saturate(.88)
            contrast(1.03);

          animation:
            ss-hero-image
            12s
            ease-in-out
            infinite alternate;
        }

        .ss-hero-content {
          position: relative;
          z-index: 3;

          min-height: 300px;

          padding:
            28px 30px;

          display: grid;

          grid-template-columns:
            minmax(0, 1.25fr)
            minmax(360px, .75fr);

          gap: 26px;

          align-items: center;
        }

        .ss-hero-left {
          min-width: 0;
        }

        .ss-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding:
            7px 11px;

          border-radius: 999px;

          border:
            1px solid
            rgba(147, 197, 253, .25);

          background:
            rgba(59, 130, 246, .12);

          color: #bfdbfe;

          font-size: 10px;
          font-weight: 850;

          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .ss-hero-live-dot {
          width: 7px;
          height: 7px;

          border-radius: 999px;

          background: #34d399;

          box-shadow:
            0 0 0 5px
            rgba(52, 211, 153, .11);

          animation:
            ss-soft-pulse
            2.1s
            ease-in-out
            infinite;
        }

        .ss-hero-title {
          max-width: 690px;

          margin:
            16px 0 0;

          color: #ffffff;

          font-size:
            clamp(32px, 4vw, 53px);

          font-weight: 900;

          line-height: .99;

          letter-spacing:
            -.055em;
        }

        .ss-hero-title span {
          color: #93c5fd;
        }

        .ss-hero-description {
          max-width: 620px;

          margin:
            14px 0 0;

          color:
            rgba(226, 232, 240, .78);

          font-size: 13px;

          line-height: 1.65;
        }

        .ss-hero-actions {
          display: flex;
          flex-wrap: wrap;

          gap: 9px;

          margin-top: 20px;
        }

        .ss-hero-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          min-height: 40px;

          padding:
            0 13px;

          border-radius: 11px;

          font-size: 11px;
          font-weight: 850;

          cursor: pointer;

          transition:
            transform .22s ease,
            background .22s ease,
            border-color .22s ease,
            box-shadow .22s ease;
        }

        .ss-hero-button:hover {
          transform: translateY(-2px);
        }

        .ss-hero-button-primary {
          border:
            1px solid
            rgba(255,255,255,.95);

          background: #ffffff;

          color: #0f172a;

          box-shadow:
            0 7px 18px
            rgba(0,0,0,.16);
        }

        .ss-hero-button-primary:hover {
          background: #f8fafc;
        }

        .ss-hero-button-secondary {
          border:
            1px solid
            rgba(255,255,255,.15);

          background:
            rgba(255,255,255,.07);

          color: #e2e8f0;
        }

        .ss-hero-button-secondary:hover {
          background:
            rgba(255,255,255,.12);
        }

        /* ==========================================================
           HERO RIGHT VISUAL
        =========================================================== */

        .ss-hero-visual {
          min-width: 0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ss-hero-stack {
          position: relative;

          width: min(100%, 460px);
          min-height: 225px;
        }

        .ss-floating-card {
          position: absolute;

          display: flex;
          align-items: center;
          gap: 9px;

          padding:
            9px 11px;

          border:
            1px solid
            rgba(255,255,255,.13);

          border-radius: 12px;

          background:
            rgba(15, 23, 42, .72);

          backdrop-filter:
            blur(14px);

          box-shadow:
            0 14px 28px
            rgba(0,0,0,.18);

          color: #fff;

          animation:
            ss-float
            4.8s
            ease-in-out
            infinite;
        }

        .ss-floating-card strong {
          display: block;

          font-size: 12px;
          font-weight: 850;
        }

        .ss-floating-card span {
          display: block;

          margin-top: 2px;

          color: #94a3b8;

          font-size: 9px;
        }

        .ss-floating-one {
          top: 8px;
          left: 0;
        }

        .ss-floating-two {
          right: 0;
          bottom: 6px;

          animation-delay:
            -1.8s;
        }

        .ss-floating-icon {
          display: grid;
          place-items: center;

          width: 30px;
          height: 30px;

          border-radius: 9px;

          background:
            rgba(255,255,255,.09);
        }

        .ss-hero-image-frame {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 77%;
          height: 83%;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.18);

          border-radius: 18px;

          transform:
            translate(-50%, -50%)
            rotate(1.6deg);

          box-shadow:
            0 24px 46px
            rgba(0,0,0,.26);

          animation:
            ss-card-float
            6s
            ease-in-out
            infinite;
        }

        .ss-hero-image-frame::after {
          content: "";

          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,.12),
              transparent 45%,
              rgba(15,23,42,.22)
            );
        }

        .ss-hero-image-frame img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          transform:
            scale(1.035);

          transition:
            transform .8s
            cubic-bezier(.2,.75,.2,1);
        }

        .ss-hero:hover
        .ss-hero-image-frame img {
          transform:
            scale(1.08);
        }

        .ss-hero-meta {
          position: absolute;

          right: 16px;
          top: 16px;

          z-index: 5;

          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding:
            8px 10px;

          border:
            1px solid
            rgba(255,255,255,.13);

          border-radius: 999px;

          background:
            rgba(2,6,23,.46);

          backdrop-filter:
            blur(12px);

          color:
            rgba(255,255,255,.82);

          font-size: 9px;
          font-weight: 750;
        }

        /* ==========================================================
           KPI GRID
        =========================================================== */

        .ss-kpi-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 16px;
        }

        .ss-kpi-card {
          position: relative;
          overflow: hidden;

          min-height: 177px;

          padding: 20px;

          border:
            1px solid
            #e5eaf0;

          border-radius: 20px;

          background:
            linear-gradient(
              180deg,
              #ffffff,
              #fbfcfe
            );

          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, .045);

          transition:
            transform .27s ease,
            box-shadow .27s ease,
            border-color .27s ease;

          animation:
            ss-card-enter
            .7s
            cubic-bezier(.22,.75,.2,1)
            both;
        }

        .ss-kpi-card:nth-child(1) {
          animation-delay: .06s;
        }

        .ss-kpi-card:nth-child(2) {
          animation-delay: .11s;
        }

        .ss-kpi-card:nth-child(3) {
          animation-delay: .16s;
        }

        .ss-kpi-card:nth-child(4) {
          animation-delay: .21s;
        }

        .ss-kpi-card:hover {
          transform:
            translateY(-5px);

          box-shadow:
            0 20px 40px
            rgba(15,23,42,.08);

          border-color:
            #d7dee7;
        }

        .ss-kpi-glow {
          position: absolute;

          width: 135px;
          height: 135px;

          top: -62px;
          right: -46px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              var(--ss-card-glow),
              transparent 70%
            );

          pointer-events: none;
        }

        .ss-kpi-top {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 14px;
        }

        .ss-kpi-label {
          margin: 0;

          color: #64748b;

          font-size: 11px;
          font-weight: 850;

          letter-spacing: .01em;
        }

        .ss-kpi-note {
          margin-top: 4px;

          color: #a1adbc;

          font-size: 9px;

          line-height: 1.4;
        }

        .ss-kpi-icon {
          position: relative;
          z-index: 3;

          display: grid;
          place-items: center;

          width: 42px;
          height: 42px;

          flex: 0 0 auto;

          border-radius: 12px;

          background:
            var(--ss-card-soft);

          color:
            var(--ss-card-color);

          border:
            1px solid
            rgba(255,255,255,.8);

          box-shadow:
            0 7px 16px
            rgba(15,23,42,.055);

          transition:
            transform .28s ease;
        }

        .ss-kpi-card:hover
        .ss-kpi-icon {
          transform:
            rotate(-5deg)
            scale(1.06);
        }

        .ss-kpi-value {
          position: relative;
          z-index: 2;

          margin-top: 18px;

          color: #09111e;

          font-size: 32px;
          font-weight: 900;

          line-height: 1;

          letter-spacing:
            -.055em;
        }

        .ss-kpi-value-danger {
          color: #dc2626;
        }

        .ss-kpi-footer {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          gap: 6px;

          margin-top: 15px;

          color: #64748b;

          font-size: 10px;
          font-weight: 650;
        }

        .ss-skeleton {
          display: block;

          width: 94px;
          height: 29px;

          border-radius: 8px;

          background:
            linear-gradient(
              90deg,
              #eef2f7 25%,
              #dfe7ef 50%,
              #eef2f7 75%
            );

          background-size:
            200% 100%;

          animation:
            ss-shimmer
            1.3s
            linear
            infinite;
        }

        /* ==========================================================
           QUICK ACTIONS
        =========================================================== */

        .ss-command {
          position: relative;
          overflow: hidden;

          min-height: 90px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 22px;

          padding:
            17px 18px;

          border-radius: 20px;

          background:
            radial-gradient(
              circle at 95% 20%,
              rgba(96,165,250,.2),
              transparent 24%
            ),
            radial-gradient(
              circle at 75% 120%,
              rgba(168,85,247,.12),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #0a1322,
              #121d31 54%,
              #192840
            );

          border:
            1px solid
            rgba(15,23,42,.95);

          box-shadow:
            0 17px 34px
            rgba(15,23,42,.14);
        }

        .ss-command::after {
          content: "";

          position: absolute;

          width: 240px;
          height: 240px;

          top: -180px;
          right: 100px;

          border-radius: 50%;

          border:
            1px solid
            rgba(147,197,253,.12);

          box-shadow:
            0 0 0 20px
            rgba(147,197,253,.025),
            0 0 0 40px
            rgba(147,197,253,.018);

          pointer-events: none;
        }

        .ss-command-copy {
          display: flex;
          align-items: center;
          gap: 11px;

          min-width: 0;

          position: relative;
          z-index: 1;
        }

        .ss-command-icon {
          display: grid;
          place-items: center;

          width: 40px;
          height: 40px;

          border-radius: 12px;

          border:
            1px solid
            rgba(255,255,255,.11);

          background:
            rgba(255,255,255,.075);

          color: #bfdbfe;

          animation:
            ss-soft-pulse
            2.9s
            ease-in-out
            infinite;
        }

        .ss-command-title {
          color: #ffffff;

          font-size: 13px;
          font-weight: 900;
        }

        .ss-command-subtitle {
          margin-top: 3px;

          color: #94a3b8;

          font-size: 10px;
        }

        .ss-command-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;

          gap: 8px;

          position: relative;
          z-index: 2;
        }

        .ss-command-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          min-height: 38px;

          padding:
            0 12px;

          border-radius: 10px;

          font-size: 10px;
          font-weight: 850;

          cursor: pointer;

          transition:
            transform .22s ease,
            background .22s ease,
            box-shadow .22s ease;
        }

        .ss-command-button:hover {
          transform:
            translateY(-2px);
        }

        .ss-command-button-primary {
          border:
            1px solid
            rgba(255,255,255,.95);

          background: #ffffff;

          color: #0f172a;

          box-shadow:
            0 6px 17px
            rgba(0,0,0,.14);
        }

        .ss-command-button-primary:hover {
          background: #f8fafc;
        }

        .ss-command-button-secondary {
          border:
            1px solid
            rgba(255,255,255,.12);

          background:
            rgba(255,255,255,.065);

          color: #e2e8f0;
        }

        .ss-command-button-secondary:hover {
          background:
            rgba(255,255,255,.115);
        }

        /* ==========================================================
           MAIN LAYOUT
        =========================================================== */

        .ss-main-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.82fr)
            minmax(320px, .78fr);

          gap: 18px;

          align-items: start;
        }

        .ss-column {
          display: flex;
          flex-direction: column;

          gap: 18px;

          min-width: 0;
        }

        /* ==========================================================
           CARD
        =========================================================== */

        .ss-card {
          overflow: hidden;

          border:
            1px solid
            var(--ss-border);

          border-radius: 20px;

          background: #ffffff;

          box-shadow:
            0 9px 26px
            rgba(15,23,42,.035),
            0 1px 2px
            rgba(15,23,42,.025);

          transition:
            box-shadow .25s ease,
            transform .25s ease,
            border-color .25s ease;
        }

        .ss-card:hover {
          border-color: #dde4eb;

          box-shadow:
            0 17px 34px
            rgba(15,23,42,.06);
        }

        .ss-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 14px;

          padding:
            17px 18px;

          border-bottom:
            1px solid
            #edf1f5;
        }

        .ss-card-heading {
          display: flex;
          align-items: center;

          gap: 10px;

          min-width: 0;
        }

        .ss-section-icon {
          display: grid;
          place-items: center;

          width: 34px;
          height: 34px;

          flex: 0 0 auto;

          border-radius: 10px;

          border:
            1px solid
            #e2e8f0;

          background:
            #f8fafc;

          color:
            #334155;
        }

        .ss-card-title {
          margin: 0;

          color: #0f172a;

          font-size: 13px;
          font-weight: 900;

          letter-spacing:
            -.01em;
        }

        .ss-card-subtitle {
          margin-top: 3px;

          color: #9aa6b5;

          font-size: 9px;
        }

        .ss-card-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 850;

          text-decoration: none;

          white-space: nowrap;
        }

        .ss-card-link:hover {
          color: #1d4ed8;
        }

        /* ==========================================================
           TABLE TOOLBAR
        =========================================================== */

        .ss-toolbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          flex-wrap: wrap;

          gap: 7px;
        }

        .ss-search {
          position: relative;

          width: 190px;
        }

        .ss-search-icon {
          position: absolute;

          left: 9px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #94a3b8;

          pointer-events: none;
        }

        .ss-search-input {
          width: 100%;
          height: 34px;

          border:
            1px solid
            #dfe6ee;

          border-radius: 10px;

          background: #ffffff;

          padding:
            0 10px 0 29px;

          color: #0f172a;

          font-size: 10px;

          outline: none;

          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .ss-search-input::placeholder {
          color: #a6b0be;
        }

        .ss-search-input:focus {
          border-color: #93c5fd;

          box-shadow:
            0 0 0 4px
            rgba(59,130,246,.075);
        }

        .ss-select {
          height: 34px;

          border:
            1px solid
            #dfe6ee;

          border-radius: 10px;

          padding:
            0 27px 0 9px;

          background: #ffffff;

          color: #475569;

          font-size: 10px;
          font-weight: 750;

          outline: none;

          cursor: pointer;
        }

        /* ==========================================================
           TABLE
        =========================================================== */

        .ss-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .ss-table {
          width: 100%;

          min-width:
            720px;

          border-collapse:
            collapse;
        }

        .ss-table th {
          padding:
            11px 15px;

          border-bottom:
            1px solid
            #ebf0f4;

          background:
            #fafbfd;

          color:
            #6b7787;

          font-size: 9px;
          font-weight: 900;

          letter-spacing:
            .065em;

          text-transform:
            uppercase;

          text-align: left;
        }

        .ss-table td {
          padding:
            14px 15px;

          border-bottom:
            1px solid
            #eef2f6;

          color: #334155;

          font-size: 10px;

          vertical-align: middle;

          transition:
            background .18s ease;
        }

        .ss-table tbody tr:last-child td {
          border-bottom: none;
        }

        .ss-table tbody tr:hover td {
          background:
            linear-gradient(
              90deg,
              #fbfdff,
              #f8fbff
            );
        }

        .ss-product-name {
          color: #0f172a;

          font-size: 11px;
          font-weight: 900;
        }

        .ss-product-sku {
          margin-top: 3px;

          color: #9aa6b5;

          font-size: 8px;
          font-weight: 700;

          letter-spacing:
            .025em;
        }

        .ss-location {
          color: #475569;

          font-size: 10px;
          font-weight: 700;
        }

        .ss-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          padding:
            5px 8px;

          border-radius: 999px;

          border:
            1px solid
            #e2e8f0;

          background:
            #f8fafc;

          color:
            #475569;

          font-size: 8px;
          font-weight: 850;

          white-space: nowrap;
        }

        .ss-delta {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          font-size: 10px;
          font-weight: 900;
        }

        .ss-positive {
          color: #16a34a;
        }

        .ss-negative {
          color: #dc2626;
        }

        .ss-balance {
          color: #0f172a;

          font-weight:
            900;
        }

        .ss-user {
          color: #64748b;

          font-size: 9px;
          font-weight: 650;
        }

        /* ==========================================================
           EMPTY STATE
        =========================================================== */

        .ss-empty {
          min-height: 225px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-direction: column;

          text-align: center;

          padding: 28px;
        }

        .ss-empty-icon {
          display: grid;
          place-items: center;

          width: 50px;
          height: 50px;

          margin-bottom: 10px;

          border-radius: 14px;

          background:
            #f8fafc;

          border:
            1px solid
            #e2e8f0;

          color:
            #94a3b8;
        }

        .ss-empty-title {
          color: #334155;

          font-size: 11px;
          font-weight: 850;
        }

        .ss-empty-text {
          max-width: 320px;

          margin-top: 5px;

          color: #9aa6b5;

          font-size: 9px;

          line-height: 1.55;
        }

        /* ==========================================================
           CATEGORY
        =========================================================== */

        .ss-card-content {
          padding:
            18px;
        }

        .ss-category-list {
          display: flex;
          flex-direction: column;

          gap: 17px;
        }

        .ss-category-row {
          display: flex;
          flex-direction: column;

          gap: 7px;
        }

        .ss-category-meta {
          display: flex;
          align-items: end;
          justify-content: space-between;

          gap: 12px;
        }

        .ss-category-name {
          color: #1e293b;

          font-size: 10px;
          font-weight: 850;
        }

        .ss-category-info {
          color: #95a1b0;

          font-size: 8px;
          font-weight: 650;

          text-align: right;
        }

        .ss-progress {
          width: 100%;
          height: 8px;

          overflow: hidden;

          border-radius: 999px;

          background:
            #edf2f7;
        }

        .ss-progress-fill {
          width: 0;
          height: 100%;

          border-radius:
            inherit;

          background:
            linear-gradient(
              90deg,
              #60a5fa,
              #2563eb
            );

          box-shadow:
            0 0 12px
            rgba(37,99,235,.18);

          animation:
            ss-progress-grow
            1.2s
            cubic-bezier(.2,.75,.2,1)
            both;
        }

        /* ==========================================================
           ALERT RADAR
        =========================================================== */

        .ss-alert-card {
          position: relative;

          overflow: hidden;
        }

        .ss-alert-card::before {
          content: "";

          display: block;

          height: 4px;

          background:
            linear-gradient(
              90deg,
              #ef4444,
              #fb923c,
              #f59e0b
            );
        }

        .ss-alert-summary {
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding:
            12px;

          border:
            1px solid
            #fee2e2;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #fff8f8,
              #fffaf9
            );
        }

        .ss-alert-summary::after {
          content: "";

          position: absolute;

          width: 90px;
          height: 90px;

          top: -46px;
          right: 28px;

          border-radius: 50%;

          border:
            1px solid
            rgba(239,68,68,.11);

          box-shadow:
            0 0 0 11px
            rgba(239,68,68,.025),
            0 0 0 22px
            rgba(239,68,68,.02);
        }

        .ss-alert-total {
          display: flex;
          align-items: center;

          gap: 9px;

          position: relative;
          z-index: 1;
        }

        .ss-alert-icon {
          display: grid;
          place-items: center;

          width: 34px;
          height: 34px;

          border-radius: 10px;

          background:
            #fee2e2;

          color:
            #dc2626;
        }

        .ss-alert-count {
          color: #991b1b;

          font-size: 18px;
          font-weight: 900;

          line-height: 1;
        }

        .ss-alert-label {
          margin-top: 3px;

          color:
            #b91c1c;

          font-size: 8px;
          font-weight: 750;
        }

        .ss-alert-summary-note {
          position: relative;
          z-index: 2;

          color: #94a3b8;

          font-size: 8px;
          font-weight: 750;
        }

        .ss-alert-items {
          display: flex;
          flex-direction: column;

          gap: 9px;

          margin-top: 14px;
        }

        .ss-alert-item {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding:
            11px 12px;

          border-radius: 13px;

          border:
            1px solid
            transparent;

          transition:
            transform .22s ease,
            box-shadow .22s ease;
        }

        .ss-alert-item:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 10px 22px
            rgba(15,23,42,.06);
        }

        .ss-alert-out {
          border-color:
            #fee2e2;

          background:
            #fff8f8;
        }

        .ss-alert-low {
          border-color:
            #fef3c7;

          background:
            #fffdf7;
        }

        .ss-alert-name {
          color:
            #0f172a;

          font-size: 10px;
          font-weight: 900;
        }

        .ss-alert-min {
          margin-top: 3px;

          color:
            #98a4b2;

          font-size: 8px;
          font-weight: 650;
        }

        .ss-alert-value {
          font-size: 10px;
          font-weight: 900;

          text-align: right;
        }

        .ss-alert-value-out {
          color:
            #dc2626;
        }

        .ss-alert-value-low {
          color:
            #d97706;
        }

        .ss-reorder {
          display: inline-flex;
          align-items: center;
          gap: 3px;

          margin-top: 3px;

          color:
            #2563eb;

          font-size: 8px;
          font-weight: 900;

          text-decoration: none;
        }

        .ss-reorder:hover {
          color:
            #1d4ed8;
        }

        .ss-all-good {
          display: flex;
          flex-direction: column;
          align-items: center;

          padding:
            24px 12px;

          margin-top:
            14px;

          border:
            1px solid
            #bbf7d0;

          border-radius:
            14px;

          background:
            linear-gradient(
              135deg,
              #f0fdf4,
              #f7fee7
            );

          text-align:
            center;
        }

        .ss-all-good-icon {
          display: grid;
          place-items: center;

          width: 38px;
          height: 38px;

          margin-bottom: 8px;

          border-radius: 11px;

          background:
            #dcfce7;

          color:
            #16a34a;
        }

        .ss-all-good-title {
          color:
            #15803d;

          font-size: 11px;
          font-weight: 900;
        }

        .ss-all-good-text {
          max-width: 240px;

          margin-top: 4px;

          color:
            #166534;

          font-size: 8px;

          line-height:
            1.5;
        }

        /* ==========================================================
           PIPELINE
        =========================================================== */

        .ss-health-top {
          display: grid;

          grid-template-columns:
            86px 1fr;

          gap: 16px;

          align-items: center;

          margin-bottom: 18px;
        }

        .ss-ring {
          position: relative;

          display: grid;
          place-items: center;

          width: 86px;
          height: 86px;

          border-radius: 50%;

          background:
            conic-gradient(
              #2563eb
              ${completionRate}%,
              #e8eef6
              ${completionRate}%
              100%
            );

          animation:
            ss-ring-enter
            1.1s
            cubic-bezier(.2,.75,.2,1)
            both;
        }

        .ss-ring::before {
          content: "";

          position: absolute;

          width: 64px;
          height: 64px;

          border-radius: 50%;

          background: #ffffff;

          box-shadow:
            inset 0 0 0 1px
            #eef2f7;
        }

        .ss-ring-content {
          position: relative;
          z-index: 2;

          text-align:
            center;
        }

        .ss-ring-value {
          color:
            #0f172a;

          font-size:
            17px;

          font-weight:
            900;

          line-height:
            1;
        }

        .ss-ring-label {
          margin-top: 2px;

          color:
            #94a3b8;

          font-size:
            7px;

          font-weight:
            850;

          text-transform:
            uppercase;
        }

        .ss-health-title {
          color:
            #0f172a;

          font-size:
            12px;

          font-weight:
            900;
        }

        .ss-health-text {
          margin-top:
            5px;

          color:
            #9aa6b5;

          font-size:
            9px;

          line-height:
            1.55;
        }

        .ss-health-badge {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            5px;

          padding:
            5px 8px;

          margin-top:
            8px;

          border-radius:
            999px;

          background:
            #f0fdf4;

          color:
            #15803d;

          font-size:
            8px;

          font-weight:
            900;
        }

        .ss-health-list {
          display:
            flex;

          flex-direction:
            column;

          gap:
            13px;
        }

        .ss-health-row {
          display:
            flex;

          flex-direction:
            column;

          gap:
            6px;
        }

        .ss-health-meta {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            10px;

          color:
            #64748b;

          font-size:
            9px;

          font-weight:
            650;
        }

        .ss-health-meta strong {
          color:
            #0f172a;

          font-weight:
            900;
        }

        .ss-health-progress {
          width:
            100%;

          height:
            6px;

          overflow:
            hidden;

          border-radius:
            999px;

          background:
            #edf2f7;
        }

        .ss-health-progress-fill {
          width:
            0;

          height:
            100%;

          border-radius:
            inherit;

          animation:
            ss-progress-grow
            1.1s
            cubic-bezier(.2,.75,.2,1)
            both;
        }

        /* ==========================================================
           VISUAL OPERATIONS CARD
        =========================================================== */

        .ss-visual-card {
          position: relative;

          min-height:
            188px;

          overflow:
            hidden;

          border-radius:
            20px;
        }

        .ss-visual-card img {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .8s
            cubic-bezier(.2,.75,.2,1);
        }

        .ss-visual-card:hover img {
          transform:
            scale(1.075);
        }

        .ss-visual-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(3,8,18,.12),
              rgba(3,8,18,.86)
            );
        }

        .ss-visual-content {
          position: absolute;

          inset:
            auto 17px 17px;

          z-index: 3;
        }

        .ss-visual-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          padding:
            5px 8px;

          border-radius:
            999px;

          background:
            rgba(255,255,255,.10);

          border:
            1px solid
            rgba(255,255,255,.13);

          backdrop-filter:
            blur(8px);

          color:
            #dbeafe;

          font-size:
            7px;

          font-weight:
            900;

          letter-spacing:
            .07em;

          text-transform:
            uppercase;
        }

        .ss-visual-title {
          margin-top:
            8px;

          color:
            #ffffff;

          font-size:
            18px;

          font-weight:
            900;

          letter-spacing:
            -.035em;
        }

        .ss-visual-text {
          max-width:
            360px;

          margin-top:
            4px;

          color:
            rgba(226,232,240,.72);

          font-size:
            8px;

          line-height:
            1.55;
        }

        .ss-visual-chip {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            5px;

          margin-top:
            10px;

          padding:
            6px 8px;

          border-radius:
            8px;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.1);

          color:
            #ffffff;

          font-size:
            8px;

          font-weight:
            800;
        }

        /* ==========================================================
           SNAPSHOT
        =========================================================== */

        .ss-snapshot {
          position: relative;
          overflow: hidden;

          padding:
            18px;

          border:
            1px solid
            #dbeafe;

          border-radius:
            20px;

          background:
            radial-gradient(
              circle at 95% 0%,
              rgba(96,165,250,.16),
              transparent 27%
            ),
            linear-gradient(
              135deg,
              #f8fbff,
              #eff6ff
            );
        }

        .ss-snapshot::before {
          content: "";

          position: absolute;

          left: -20%;
          right: -20%;

          bottom: 0;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(59,130,246,.26),
              transparent
            );

          animation:
            ss-line-slide
            4s
            ease-in-out
            infinite;
        }

        .ss-snapshot-top {
          display: flex;
          align-items: flex-start;

          gap: 10px;
        }

        .ss-snapshot-icon {
          display: grid;
          place-items: center;

          width: 34px;
          height: 34px;

          border-radius: 10px;

          background:
            #dbeafe;

          color:
            #2563eb;
        }

        .ss-snapshot-label {
          color:
            #2563eb;

          font-size:
            8px;

          font-weight:
            900;

          text-transform:
            uppercase;

          letter-spacing:
            .06em;
        }

        .ss-snapshot-title {
          margin-top:
            3px;

          color:
            #0f172a;

          font-size:
            12px;

          font-weight:
            900;
        }

        .ss-snapshot-text {
          max-width:
            780px;

          margin:
            8px 0 0;

          color:
            #64748b;

          font-size:
            9px;

          line-height:
            1.58;
        }

        .ss-snapshot-stats {
          display:
            grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap:
            9px;

          margin-top:
            13px;
        }

        .ss-snapshot-stat {
          padding:
            11px;

          border:
            1px solid
            rgba(219,234,254,.95);

          border-radius:
            11px;

          background:
            rgba(255,255,255,.67);

          backdrop-filter:
            blur(7px);
        }

        .ss-snapshot-stat-label {
          color:
            #94a3b8;

          font-size:
            8px;

          font-weight:
            750;
        }

        .ss-snapshot-stat-value {
          margin-top:
            4px;

          color:
            #0f172a;

          font-size:
            15px;

          font-weight:
            900;
        }

        /* ==========================================================
           ERROR
        =========================================================== */

        .ss-error {
          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          padding:
            14px 16px;

          border:
            1px solid
            #fecaca;

          border-radius:
            15px;

          background:
            linear-gradient(
              135deg,
              #fff8f8,
              #fef2f2
            );

          box-shadow:
            0 10px 22px
            rgba(239,68,68,.055);
        }

        .ss-error-icon {
          display:
            grid;

          place-items:
            center;

          width:
            34px;

          height:
            34px;

          flex:
            0 0 auto;

          border-radius:
            10px;

          background:
            #fee2e2;

          color:
            #dc2626;
        }

        .ss-error-content {
          flex:
            1;

          min-width:
            0;
        }

        .ss-error-title {
          color:
            #991b1b;

          font-size:
            10px;

          font-weight:
            900;
        }

        .ss-error-text {
          margin-top:
            2px;

          color:
            #b91c1c;

          font-size:
            9px;

          line-height:
            1.45;
        }

        .ss-error-button {
          border:
            1px solid
            #ef4444;

          background:
            #dc2626;

          color:
            #ffffff;

          padding:
            7px 11px;

          border-radius:
            8px;

          font-size:
            9px;

          font-weight:
            850;

          cursor:
            pointer;
        }

        /* ==========================================================
           ANIMATIONS
        =========================================================== */

        @keyframes ss-page-enter {
          from {
            opacity: 0;
            transform: translateY(13px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ss-card-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ss-spin {
          from {
            transform: rotate(0);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ss-shimmer {
          from {
            background-position: 200% 0;
          }

          to {
            background-position: -200% 0;
          }
        }

        @keyframes ss-progress-grow {
          from {
            width: 0;
          }
        }

        @keyframes ss-ring-enter {
          from {
            transform: rotate(-40deg) scale(.85);
            opacity: .3;
          }

          to {
            transform: rotate(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes ss-float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes ss-card-float {
          0%,
          100% {
            transform:
              translate(-50%, -50%)
              rotate(1.6deg);
          }

          50% {
            transform:
              translate(-50%, -52%)
              rotate(.6deg);
          }
        }

        @keyframes ss-hero-image {
          from {
            transform: scale(1.045);
          }

          to {
            transform: scale(1.085);
          }
        }

        @keyframes ss-soft-pulse {
          0%,
          100% {
            opacity: .78;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes ss-grid-drift {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(46px, 46px, 0);
          }
        }

        @keyframes ss-line-slide {
          0%,
          100% {
            transform: translateX(-20%);
            opacity: .25;
          }

          50% {
            transform: translateX(20%);
            opacity: .75;
          }
        }

        /* ==========================================================
           RESPONSIVE
        =========================================================== */

        @media (max-width: 1260px) {
          .ss-hero-content {
            grid-template-columns:
              minmax(0, 1.15fr)
              minmax(310px, .85fr);
          }

          .ss-kpi-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .ss-main-grid {
            grid-template-columns:
              1fr;
          }
        }

        @media (max-width: 900px) {
          .ss-hero {
            min-height: auto;
          }

          .ss-hero-content {
            grid-template-columns:
              1fr;

            padding:
              25px;
          }

          .ss-hero-visual {
            min-height:
              240px;
          }

          .ss-command {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .ss-command-actions {
            justify-content:
              flex-start;

            width:
              100%;
          }

          .ss-toolbar {
            justify-content:
              flex-start;

            width:
              100%;
          }
        }

        @media (max-width: 640px) {
          .ss-dashboard {
            gap:
              15px;
          }

          .ss-hero-content {
            padding:
              20px;
          }

          .ss-hero-title {
            font-size:
              34px;
          }

          .ss-hero-description {
            font-size:
              11px;
          }

          .ss-hero-visual {
            display:
              none;
          }

          .ss-kpi-grid {
            grid-template-columns:
              1fr;
          }

          .ss-command {
            padding:
              15px;
          }

          .ss-command-actions {
            display:
              grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .ss-command-button {
            width:
              100%;
          }

          .ss-card-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .ss-toolbar {
            display:
              grid;

            grid-template-columns:
              1fr;

            width:
              100%;
          }

          .ss-search,
          .ss-select {
            width:
              100%;
          }

          .ss-health-top {
            grid-template-columns:
              72px 1fr;
          }

          .ss-ring {
            width:
              72px;

            height:
              72px;
          }

          .ss-ring::before {
            width:
              54px;

            height:
              54px;
          }

          .ss-snapshot-stats {
            grid-template-columns:
              1fr;
          }

          .ss-error {
            align-items:
              flex-start;

            flex-wrap:
              wrap;
          }

          .ss-error-button {
            margin-left:
              45px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ss-dashboard *,
          .ss-dashboard *::before,
          .ss-dashboard *::after {
            animation:
              none !important;

            transition:
              none !important;
          }
        }
      `}</style>

      <div className="ss-dashboard">
        {/* ==========================================================
            HERO
        =========================================================== */}
        <section className="ss-hero">
          <div className="ss-hero-grid" />

          <img
            className="ss-hero-image"
            src={HERO_IMAGE}
            alt="Modern warehouse logistics and inventory operations"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="ss-hero-content">
            <div className="ss-hero-left">
              <div className="ss-hero-eyebrow">
                <span className="ss-hero-live-dot" />
                StockSense command center
              </div>

              <h1 className="ss-hero-title">
                Your inventory.
                <br />
                <span>Under control.</span>
              </h1>

              <p className="ss-hero-description">
                Monitor products, stock movement, warehouse activity,
                replenishment risks, and operational flow from one
                intelligent workspace.
              </p>

              <div className="ss-hero-actions">
                <button
                  type="button"
                  className="ss-hero-button ss-hero-button-primary"
                  onClick={() =>
                    navigate("/receipts?new=true")
                  }
                >
                  <ArrowDownToLine size={14} />
                  Receive stock
                </button>

                <button
                  type="button"
                  className="ss-hero-button ss-hero-button-secondary"
                  onClick={() =>
                    navigate("/deliveries?new=true")
                  }
                >
                  <ArrowUpFromLine size={14} />
                  Create delivery
                </button>

                <Link
                  to="/stock-ledger"
                  className="ss-hero-button ss-hero-button-secondary"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <Activity size={14} />
                  Open ledger
                </Link>
              </div>
            </div>

            <div className="ss-hero-visual">
              <div className="ss-hero-stack">
                <div className="ss-hero-image-frame">
                  <img
                    src={HERO_IMAGE}
                    alt="Truck operating inside a warehouse"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="ss-floating-card ss-floating-one">
                  <div className="ss-floating-icon">
                    <Truck size={14} />
                  </div>

                  <div>
                    <strong>Inbound logistics</strong>
                    <span>
                      Warehouse movement active
                    </span>
                  </div>
                </div>

                <div className="ss-floating-card ss-floating-two">
                  <div className="ss-floating-icon">
                    <ScanLine size={14} />
                  </div>

                  <div>
                    <strong>
                      {loading
                        ? "Syncing..."
                        : `${formatNumber(totalStockUnits)} units`}
                    </strong>

                    <span>
                      Live inventory volume
                    </span>
                  </div>
                </div>

                <div className="ss-hero-meta">
                  <MapPin size={11} />
                  <span>Warehouse network · {heroDate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            ERROR
        =========================================================== */}
        {error && (
          <section className="ss-error">
            <div className="ss-error-icon">
              <ShieldAlert size={16} />
            </div>

            <div className="ss-error-content">
              <div className="ss-error-title">
                Dashboard sync failed
              </div>

              <div className="ss-error-text">
                {error}
              </div>
            </div>

            <button
              type="button"
              className="ss-error-button"
              onClick={loadStats}
            >
              Retry
            </button>
          </section>
        )}

        {/* ==========================================================
            KPI CARDS
        =========================================================== */}
        <section className="ss-kpi-grid">
          {/* PRODUCTS */}
          <article
            className="ss-kpi-card"
            style={{
              "--ss-card-color": "#7c3aed",
              "--ss-card-soft": "#f3e8ff",
              "--ss-card-glow":
                "rgba(124,58,237,.16)",
            }}
          >
            <div className="ss-kpi-glow" />

            <div className="ss-kpi-top">
              <div>
                <p className="ss-kpi-label">
                  Total Products
                </p>

                <div className="ss-kpi-note">
                  Cataloged inventory items
                </div>
              </div>

              <div className="ss-kpi-icon">
                <Package size={20} />
              </div>
            </div>

            <div className="ss-kpi-value">
              {loading ? (
                <span className="ss-skeleton" />
              ) : (
                formatNumber(totalProducts)
              )}
            </div>

            <div className="ss-kpi-footer">
              <Warehouse size={12} />

              <span>
                {kpis.total_warehouses || 1}
                {" "}warehouses ·{" "}
                {kpis.total_locations || 1}
                {" "}locations
              </span>
            </div>
          </article>

          {/* STOCK */}
          <article
            className="ss-kpi-card"
            style={{
              "--ss-card-color": "#059669",
              "--ss-card-soft": "#d1fae5",
              "--ss-card-glow":
                "rgba(16,185,129,.16)",
            }}
          >
            <div className="ss-kpi-glow" />

            <div className="ss-kpi-top">
              <div>
                <p className="ss-kpi-label">
                  Total Stock Units
                </p>

                <div className="ss-kpi-note">
                  Current physical inventory
                </div>
              </div>

              <div className="ss-kpi-icon">
                <Boxes size={20} />
              </div>
            </div>

            <div className="ss-kpi-value">
              {loading ? (
                <span className="ss-skeleton" />
              ) : (
                formatNumber(
                  Math.round(totalStockUnits)
                )
              )}
            </div>

            <div className="ss-kpi-footer">
              <CheckCircle2
                size={12}
                color="#10b981"
              />

              <span>
                Physical volume available
              </span>
            </div>
          </article>

          {/* ALERTS */}
          <article
            className="ss-kpi-card"
            style={{
              "--ss-card-color": "#d97706",
              "--ss-card-soft": "#fef3c7",
              "--ss-card-glow":
                "rgba(245,158,11,.16)",
            }}
          >
            <div className="ss-kpi-glow" />

            <div className="ss-kpi-top">
              <div>
                <p className="ss-kpi-label">
                  Stock Alerts
                </p>

                <div className="ss-kpi-note">
                  Products below safe thresholds
                </div>
              </div>

              <div className="ss-kpi-icon">
                <AlertTriangle size={20} />
              </div>
            </div>

            <div
              className={`ss-kpi-value ${
                outOfStockCount > 0
                  ? "ss-kpi-value-danger"
                  : ""
              }`}
            >
              {loading ? (
                <span className="ss-skeleton" />
              ) : (
                formatNumber(
                  lowStockCount +
                    outOfStockCount
                )
              )}
            </div>

            <div className="ss-kpi-footer">
              <span
                style={{
                  color: "#dc2626",
                  fontWeight: 850,
                }}
              >
                {outOfStockCount} Out
              </span>

              <span>·</span>

              <span
                style={{
                  color: "#d97706",
                  fontWeight: 850,
                }}
              >
                {lowStockCount} Low
              </span>
            </div>
          </article>

          {/* PENDING */}
          <article
            className="ss-kpi-card"
            style={{
              "--ss-card-color": "#2563eb",
              "--ss-card-soft": "#dbeafe",
              "--ss-card-glow":
                "rgba(37,99,235,.16)",
            }}
          >
            <div className="ss-kpi-glow" />

            <div className="ss-kpi-top">
              <div>
                <p className="ss-kpi-label">
                  Pending Operations
                </p>

                <div className="ss-kpi-note">
                  Work currently in pipeline
                </div>
              </div>

              <div className="ss-kpi-icon">
                <Clock3 size={20} />
              </div>
            </div>

            <div className="ss-kpi-value">
              {loading ? (
                <span className="ss-skeleton" />
              ) : (
                formatNumber(pendingOpsCount)
              )}
            </div>

            <div className="ss-kpi-footer">
              <span>
                {kpis.pending_receipts || 0} In
                {" · "}
                {kpis.pending_deliveries || 0} Out
                {" · "}
                {kpis.pending_transfers || 0} Move
              </span>
            </div>
          </article>
        </section>

        {/* ==========================================================
            QUICK COMMAND BAR
        =========================================================== */}
        <section className="ss-command">
          <div className="ss-command-copy">
            <div className="ss-command-icon">
              <Zap size={18} />
            </div>

            <div>
              <div className="ss-command-title">
                Quick operations
              </div>

              <div className="ss-command-subtitle">
                Execute your most common inventory workflows instantly.
              </div>
            </div>
          </div>

          <div className="ss-command-actions">
            <button
              type="button"
              className="ss-command-button ss-command-button-primary"
              onClick={() =>
                navigate("/receipts?new=true")
              }
            >
              <ArrowDownToLine size={14} />
              Receive stock
            </button>

            <button
              type="button"
              className="ss-command-button ss-command-button-primary"
              onClick={() =>
                navigate("/deliveries?new=true")
              }
            >
              <ArrowUpFromLine size={14} />
              Create delivery
            </button>

            <button
              type="button"
              className="ss-command-button ss-command-button-secondary"
              onClick={() =>
                navigate("/transfers?new=true")
              }
            >
              <ArrowLeftRight size={14} />
              Move stock
            </button>

            <button
              type="button"
              className="ss-command-button ss-command-button-secondary"
              onClick={() =>
                navigate("/adjustments?new=true")
              }
            >
              <Scale size={14} />
              Audit adjustment
            </button>
          </div>
        </section>

        {/* ==========================================================
            MAIN
        =========================================================== */}
        <section className="ss-main-grid">
          {/* ========================================================
              LEFT
          ========================================================= */}
          <div className="ss-column">
            {/* -------------------------------------------------------
                STOCK LEDGER
            -------------------------------------------------------- */}
            <section className="ss-card">
              <div className="ss-card-header">
                <div className="ss-card-heading">
                  <div className="ss-section-icon">
                    <Activity size={16} />
                  </div>

                  <div>
                    <h2 className="ss-card-title">
                      Stock movement ledger
                    </h2>

                    <div className="ss-card-subtitle">
                      Recent inventory movements across your operation
                    </div>
                  </div>
                </div>

                <div className="ss-toolbar">
                  <div className="ss-search">
                    <Search
                      size={13}
                      className="ss-search-icon"
                    />

                    <input
                      type="text"
                      className="ss-search-input"
                      placeholder="Search product, SKU, location..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <select
                    className="ss-select"
                    value={
                      selectedMovementFilter
                    }
                    onChange={(event) =>
                      setSelectedMovementFilter(
                        event.target.value
                      )
                    }
                    aria-label="Movement filter"
                  >
                    {movementTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type === "all"
                          ? "All movements"
                          : formatMovementType(type)}
                      </option>
                    ))}
                  </select>

                  <Link
                    to="/stock-ledger"
                    className="ss-card-link"
                  >
                    Full ledger
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="ss-table-wrap">
                <table className="ss-table">
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
                        <td colSpan={6}>
                          <div className="ss-empty">
                            <div className="ss-empty-icon">
                              <Layers3 size={22} />
                            </div>

                            <div className="ss-empty-title">
                              No matching movements
                            </div>

                            <div className="ss-empty-text">
                              Try changing the search query
                              or movement filter.
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map(
                        (act, index) => {
                          const quantityChange =
                            Number(
                              act.quantity_change || 0
                            );

                          const isPositive =
                            quantityChange > 0;

                          return (
                            <tr
                              key={act.id}
                              style={{
                                animation:
                                  "ss-card-enter .45s ease both",
                                animationDelay:
                                  `${index * 0.045}s`,
                              }}
                            >
                              <td>
                                <div className="ss-product-name">
                                  {act.product_name ||
                                    "Unnamed Product"}
                                </div>

                                <div className="ss-product-sku">
                                  {act.product_sku ||
                                    "No SKU"}
                                </div>
                              </td>

                              <td>
                                <div className="ss-location">
                                  {act.location_name ||
                                    "Unknown location"}
                                </div>
                              </td>

                              <td>
                                <span className="ss-type-badge">
                                  {formatMovementType(
                                    act.movement_type
                                  )}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`ss-delta ${
                                    isPositive
                                      ? "ss-positive"
                                      : "ss-negative"
                                  }`}
                                >
                                  {isPositive ? (
                                    <TrendingUp
                                      size={12}
                                    />
                                  ) : (
                                    <TrendingDown
                                      size={12}
                                    />
                                  )}

                                  {isPositive
                                    ? `+${quantityChange}`
                                    : quantityChange}
                                </span>
                              </td>

                              <td>
                                <span className="ss-balance">
                                  {formatNumber(
                                    act.quantity_after
                                  )}
                                </span>
                              </td>

                              <td>
                                <span className="ss-user">
                                  {act.user_name ||
                                    "System"}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* -------------------------------------------------------
                CATEGORY BREAKDOWN
            -------------------------------------------------------- */}
            <section className="ss-card">
              <div className="ss-card-header">
                <div className="ss-card-heading">
                  <div className="ss-section-icon">
                    <PieChart size={16} />
                  </div>

                  <div>
                    <h2 className="ss-card-title">
                      Category breakdown
                    </h2>

                    <div className="ss-card-subtitle">
                      See where your inventory volume is concentrated
                    </div>
                  </div>
                </div>

                <select
                  className="ss-select"
                  value={
                    selectedCategoryFilter
                  }
                  onChange={(event) =>
                    setSelectedCategoryFilter(
                      event.target.value
                    )
                  }
                  aria-label="Category filter"
                >
                  <option value="all">
                    All categories
                  </option>

                  {categoryDistribution.map(
                    (category) => (
                      <option
                        key={
                          category.id ||
                          category.name
                        }
                        value={
                          category.id ||
                          category.name
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="ss-card-content">
                {filteredCategories.length === 0 ? (
                  <div className="ss-empty">
                    <div className="ss-empty-icon">
                      <PieChart size={22} />
                    </div>

                    <div className="ss-empty-title">
                      No category data available
                    </div>

                    <div className="ss-empty-text">
                      Inventory distribution will appear
                      here once category data is available.
                    </div>
                  </div>
                ) : (
                  <div className="ss-category-list">
                    {filteredCategories.map(
                      (category, index) => {
                        const totalUnits =
                          totalStockUnits || 1;

                        const percentage = Math.min(
                          Math.round(
                            (Number(
                              category.total_stock ||
                                0
                            ) /
                              totalUnits) *
                              100
                          ),
                          100
                        );

                        return (
                          <div
                            key={
                              category.id ||
                              category.name
                            }
                            className="ss-category-row"
                            style={{
                              animation:
                                "ss-card-enter .5s ease both",
                              animationDelay:
                                `${index * .055}s`,
                            }}
                          >
                            <div className="ss-category-meta">
                              <div className="ss-category-name">
                                {category.name}
                              </div>

                              <div className="ss-category-info">
                                {formatNumber(
                                  category.product_count
                                )}{" "}
                                items ·{" "}
                                <strong>
                                  {formatNumber(
                                    Math.round(
                                      category.total_stock
                                    )
                                  )}
                                </strong>{" "}
                                units ·{" "}
                                {percentage}%
                              </div>
                            </div>

                            <div className="ss-progress">
                              <div
                                className="ss-progress-fill"
                                style={{
                                  width:
                                    `${percentage}%`,
                                  animationDelay:
                                    `${index * .08}s`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* -------------------------------------------------------
                INVENTORY SNAPSHOT
            -------------------------------------------------------- */}
            <section className="ss-snapshot">
              <div className="ss-snapshot-top">
                <div className="ss-snapshot-icon">
                  <Sparkles size={17} />
                </div>

                <div>
                  <div className="ss-snapshot-label">
                    Inventory snapshot
                  </div>

                  <div className="ss-snapshot-title">
                    {healthText}
                  </div>
                </div>
              </div>

              <p className="ss-snapshot-text">
                {outOfStockCount > 0
                  ? `${formatNumber(
                      outOfStockCount
                    )} product${
                      outOfStockCount === 1
                        ? ""
                        : "s"
                    } currently ${
                      outOfStockCount === 1
                        ? "is"
                        : "are"
                    } out of stock. Prioritize replenishment and review the affected SKUs.`
                  : lowStockCount > 0
                    ? `${formatNumber(
                        lowStockCount
                      )} product${
                        lowStockCount === 1
                          ? ""
                          : "s"
                      } ${
                        lowStockCount === 1
                          ? "is"
                          : "are"
                      } below the preferred safety threshold.`
                    : "Inventory levels are currently above the recorded safety thresholds."}
              </p>

              <div className="ss-snapshot-stats">
                <div className="ss-snapshot-stat">
                  <div className="ss-snapshot-stat-label">
                    Completed ops
                  </div>

                  <div className="ss-snapshot-stat-value">
                    {formatNumber(
                      completedOpsCount
                    )}
                  </div>
                </div>

                <div className="ss-snapshot-stat">
                  <div className="ss-snapshot-stat-label">
                    Pending ops
                  </div>

                  <div className="ss-snapshot-stat-value">
                    {formatNumber(
                      pendingOpsCount
                    )}
                  </div>
                </div>

                <div className="ss-snapshot-stat">
                  <div className="ss-snapshot-stat-label">
                    Stock units
                  </div>

                  <div className="ss-snapshot-stat-value">
                    {formatNumber(
                      Math.round(
                        totalStockUnits
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ========================================================
              RIGHT
          ========================================================= */}
          <div className="ss-column">
            {/* -------------------------------------------------------
                STOCK ALERT RADAR
            -------------------------------------------------------- */}
            <section className="ss-card ss-alert-card">
              <div className="ss-card-header">
                <div className="ss-card-heading">
                  <div
                    className="ss-section-icon"
                    style={{
                      background: "#fff1f2",
                      borderColor: "#ffe4e6",
                      color: "#e11d48",
                    }}
                  >
                    <AlertTriangle size={16} />
                  </div>

                  <div>
                    <h2 className="ss-card-title">
                      Stock alert radar
                    </h2>

                    <div className="ss-card-subtitle">
                      Products requiring your attention
                    </div>
                  </div>
                </div>

                <Link
                  to="/products?filter=low_stock"
                  className="ss-card-link"
                >
                  View all
                  <ChevronRight size={12} />
                </Link>
              </div>

              <div className="ss-card-content">
                <div className="ss-alert-summary">
                  <div className="ss-alert-total">
                    <div className="ss-alert-icon">
                      <ShieldAlert size={15} />
                    </div>

                    <div>
                      <div className="ss-alert-count">
                        {formatNumber(
                          lowStockCount +
                            outOfStockCount
                        )}
                      </div>

                      <div className="ss-alert-label">
                        products flagged
                      </div>
                    </div>
                  </div>

                  <div className="ss-alert-summary-note">
                    {outOfStockCount > 0
                      ? "Immediate action"
                      : lowStockCount > 0
                        ? "Monitor closely"
                        : "All clear"}
                  </div>
                </div>

                {lowStockItems.length === 0 ? (
                  <div className="ss-all-good">
                    <div className="ss-all-good-icon">
                      <CheckCircle2 size={18} />
                    </div>

                    <div className="ss-all-good-title">
                      All stock levels healthy
                    </div>

                    <div className="ss-all-good-text">
                      No products are currently below
                      their safety threshold.
                    </div>
                  </div>
                ) : (
                  <div className="ss-alert-items">
                    {lowStockItems.map(
                      (item, index) => {
                        const isOut =
                          item.status ===
                          "out_of_stock";

                        return (
                          <div
                            key={item.id}
                            className={`ss-alert-item ${
                              isOut
                                ? "ss-alert-out"
                                : "ss-alert-low"
                            }`}
                            style={{
                              animation:
                                "ss-card-enter .45s ease both",
                              animationDelay:
                                `${index * .065}s`,
                            }}
                          >
                            <div>
                              <div className="ss-alert-name">
                                {item.name ||
                                  "Unnamed product"}
                              </div>

                              <div className="ss-alert-min">
                                Minimum:{" "}
                                {item.min_stock}{" "}
                                {item.unit}
                              </div>
                            </div>

                            <div>
                              <div
                                className={`ss-alert-value ${
                                  isOut
                                    ? "ss-alert-value-out"
                                    : "ss-alert-value-low"
                                }`}
                              >
                                {item.stock}{" "}
                                {item.unit}
                              </div>

                              <Link
                                to={`/receipts?new=true&product_id=${item.id}`}
                                className="ss-reorder"
                              >
                                Reorder
                                <ArrowUpRight
                                  size={10}
                                />
                              </Link>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* -------------------------------------------------------
                PIPELINE HEALTH
            -------------------------------------------------------- */}
            <section className="ss-card">
              <div className="ss-card-header">
                <div className="ss-card-heading">
                  <div className="ss-section-icon">
                    <BarChart3 size={16} />
                  </div>

                  <div>
                    <h2 className="ss-card-title">
                      Pipeline health
                    </h2>

                    <div className="ss-card-subtitle">
                      Completion across active workflows
                    </div>
                  </div>
                </div>

                <span className="ss-health-badge">
                  <CheckCircle2 size={10} />
                  {completionRate}% done
                </span>
              </div>

              <div className="ss-card-content">
                <div className="ss-health-top">
                  <div
                    className="ss-ring"
                    style={{
                      background:
                        `conic-gradient(
                          #2563eb ${completionRate}%,
                          #e8eef6 ${completionRate}% 100%
                        )`,
                    }}
                  >
                    <div className="ss-ring-content">
                      <div className="ss-ring-value">
                        {completionRate}%
                      </div>

                      <div className="ss-ring-label">
                        complete
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="ss-health-title">
                      {healthText}
                    </div>

                    <div className="ss-health-text">
                      {formatNumber(
                        completedOpsCount
                      )}{" "}
                      completed operations across
                      receipts, deliveries, transfers,
                      and adjustments.
                    </div>
                  </div>
                </div>

                <div className="ss-health-list">
                  <div className="ss-health-row">
                    <div className="ss-health-meta">
                      <span>
                        Receipts fulfilled
                      </span>

                      <strong>
                        {formatNumber(
                          kpis.completed_receipts ||
                            0
                        )}
                      </strong>
                    </div>

                    <div className="ss-health-progress">
                      <div
                        className="ss-health-progress-fill"
                        style={{
                          width:
                            `${pipelinePercentage(
                              kpis.completed_receipts,
                              kpis.pending_receipts
                            )}%`,
                          background:
                            "#10b981",
                        }}
                      />
                    </div>
                  </div>

                  <div className="ss-health-row">
                    <div className="ss-health-meta">
                      <span>
                        Deliveries dispatched
                      </span>

                      <strong>
                        {formatNumber(
                          kpis.completed_deliveries ||
                            0
                        )}
                      </strong>
                    </div>

                    <div className="ss-health-progress">
                      <div
                        className="ss-health-progress-fill"
                        style={{
                          width:
                            `${pipelinePercentage(
                              kpis.completed_deliveries,
                              kpis.pending_deliveries
                            )}%`,
                          background:
                            "#3b82f6",
                        }}
                      />
                    </div>
                  </div>

                  <div className="ss-health-row">
                    <div className="ss-health-meta">
                      <span>
                        Internal transfers
                      </span>

                      <strong>
                        {formatNumber(
                          kpis.completed_transfers ||
                            0
                        )}
                      </strong>
                    </div>

                    <div className="ss-health-progress">
                      <div
                        className="ss-health-progress-fill"
                        style={{
                          width:
                            `${pipelinePercentage(
                              kpis.completed_transfers,
                              kpis.pending_transfers
                            )}%`,
                          background:
                            "#8b5cf6",
                        }}
                      />
                    </div>
                  </div>

                  <div className="ss-health-row">
                    <div className="ss-health-meta">
                      <span>
                        Audit adjustments
                      </span>

                      <strong>
                        {formatNumber(
                          kpis.completed_adjustments ||
                            0
                        )}
                      </strong>
                    </div>

                    <div className="ss-health-progress">
                      <div
                        className="ss-health-progress-fill"
                        style={{
                          width:
                            `${pipelinePercentage(
                              kpis.completed_adjustments,
                              kpis.pending_adjustments
                            )}%`,
                          background:
                            "#f59e0b",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* -------------------------------------------------------
                VISUAL LOGISTICS CARD
            -------------------------------------------------------- */}
            <section className="ss-visual-card">
              <img
                src={SECONDARY_IMAGE}
                alt="Warehouse loading and forklift operations"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <div className="ss-visual-overlay" />

              <div className="ss-visual-content">
                <div className="ss-visual-eyebrow">
                  <Truck size={9} />
                  Fulfillment operations
                </div>

                <div className="ss-visual-title">
                  From dock to shelf.
                </div>

                <div className="ss-visual-text">
                  Keep inbound, outbound, and internal
                  movement visible from one operational
                  command center.
                </div>

                <div className="ss-visual-chip">
                  <ScanLine size={10} />
                  Inventory visibility
                </div>
              </div>
            </section>

            {/* -------------------------------------------------------
                OPERATION SNAPSHOT
            -------------------------------------------------------- */}
            <section className="ss-card">
              <div className="ss-card-header">
                <div className="ss-card-heading">
                  <div className="ss-section-icon">
                    <Layers3 size={16} />
                  </div>

                  <div>
                    <h2 className="ss-card-title">
                      Operation snapshot
                    </h2>

                    <div className="ss-card-subtitle">
                      Current workflow distribution
                    </div>
                  </div>
                </div>
              </div>

              <div className="ss-card-content">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "11px",
                      border:
                        "1px solid #dbeafe",
                      borderRadius: "11px",
                      background: "#f8fbff",
                    }}
                  >
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "8px",
                        fontWeight: 750,
                      }}
                    >
                      Pending receipts
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#1d4ed8",
                        fontSize: "18px",
                        fontWeight: 900,
                      }}
                    >
                      {formatNumber(
                        kpis.pending_receipts ||
                          0
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "11px",
                      border:
                        "1px solid #fee2e2",
                      borderRadius: "11px",
                      background: "#fff9f9",
                    }}
                  >
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "8px",
                        fontWeight: 750,
                      }}
                    >
                      Pending deliveries
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#dc2626",
                        fontSize: "18px",
                        fontWeight: 900,
                      }}
                    >
                      {formatNumber(
                        kpis.pending_deliveries ||
                          0
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "11px",
                      border:
                        "1px solid #ede9fe",
                      borderRadius: "11px",
                      background: "#faf8ff",
                    }}
                  >
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "8px",
                        fontWeight: 750,
                      }}
                    >
                      Pending transfers
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#7c3aed",
                        fontSize: "18px",
                        fontWeight: 900,
                      }}
                    >
                      {formatNumber(
                        kpis.pending_transfers ||
                          0
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "11px",
                      border:
                        "1px solid #fef3c7",
                      borderRadius: "11px",
                      background: "#fffdf7",
                    }}
                  >
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "8px",
                        fontWeight: 750,
                      }}
                    >
                      Pending adjustments
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#d97706",
                        fontSize: "18px",
                        fontWeight: 900,
                      }}
                    >
                      {formatNumber(
                        kpis.pending_adjustments ||
                          0
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    height: "1px",
                    background: "#edf1f5",
                    margin:
                      "15px 0",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "29px",
                        height: "29px",
                        borderRadius: "9px",
                        background: "#f0fdf4",
                        color: "#16a34a",
                      }}
                    >
                      <CheckCircle2 size={14} />
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "8px",
                          fontWeight: 750,
                        }}
                      >
                        Completed operations
                      </div>

                      <div
                        style={{
                          marginTop: "2px",
                          color: "#0f172a",
                          fontSize: "15px",
                          fontWeight: 900,
                        }}
                      >
                        {formatNumber(
                          completedOpsCount
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/stock-ledger"
                    className="ss-card-link"
                    style={{
                      padding:
                        "8px 10px",
                      border:
                        "1px solid #dbeafe",
                      borderRadius: "9px",
                      background:
                        "#f8fbff",
                    }}
                  >
                    Open ledger
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Database,
  Filter,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Warehouse,
  X,
} from "lucide-react";

import AppLayout from "../components/AppLayout";

import {
  getStockLevels,
  getStockLedger,
  getProducts,
  getLocations,
} from "../services/inventoryService";

/* ========================================================================
   STOCKSENSE
   Stock Levels & Audit Ledger
   UI contribution: Varun
   Backend/API behavior intentionally preserved
   ======================================================================== */

const movementLabels = {
  receipt: "Receipt",
  delivery: "Delivery",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment: "Adjustment",
  opening_balance: "Opening",
};

const movementTone = {
  receipt: "inbound",
  transfer_in: "inbound",
  delivery: "outbound",
  transfer_out: "outbound",
  adjustment: "adjustment",
  opening_balance: "neutral",
};

function formatMovement(type) {
  if (!type) return "Unknown";

  return (
    movementLabels[type] ||
    type.replace(/_/g, " ")
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function safeText(value) {
  return value === null ||
    value === undefined ||
    value === ""
    ? "—"
    : String(value);
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}) {
  return (
    <div className="sl-stat-card">
      <div className="sl-stat-icon">
        <Icon size={18} />
      </div>

      <div className="sl-stat-content">
        <span className="sl-stat-label">
          {label}
        </span>

        <strong className="sl-stat-value">
          {value}
        </strong>

        {helper && (
          <span className="sl-stat-helper">
            {helper}
          </span>
        )}
      </div>
    </div>
  );
}

function MovementBadge({ type }) {
  const tone =
    movementTone[type] || "neutral";

  return (
    <span
      className={`sl-movement-badge ${tone}`}
    >
      <span className="sl-movement-dot" />
      {formatMovement(type)}
    </span>
  );
}

function QuantityChange({ value }) {
  const numeric = Number(value) || 0;
  const positive = numeric > 0;
  const negative = numeric < 0;

  if (numeric === 0) {
    return (
      <span className="sl-quantity neutral">
        <span>•</span>
        0
      </span>
    );
  }

  return (
    <span
      className={`sl-quantity ${
        positive
          ? "positive"
          : "negative"
      }`}
    >
      {positive ? (
        <ArrowUpRight size={14} />
      ) : (
        <ArrowDownRight size={14} />
      )}

      {positive ? "+" : ""}
      {numeric}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="sl-empty-state">
      <div className="sl-empty-icon">
        <Icon size={28} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

function LoadingRows({ columns = 7 }) {
  return (
    <>
      {Array.from({
        length: 7,
      }).map((_, index) => (
        <tr key={index}>
          {Array.from({
            length: columns,
          }).map((__, column) => (
            <td key={column}>
              <div className="sl-skeleton" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function StockLedger() {
  const [activeTab, setActiveTab] =
    useState("ledger");

  const [ledgerEntries, setLedgerEntries] =
    useState([]);

  const [stockLevels, setStockLevels] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedMovementType,
    setSelectedMovementType,
  ] = useState("all");

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState("all");

  function loadData() {
    setLoading(true);
    setError(null);

    Promise.all([
      getStockLedger({ limit: 150 }),
      getStockLevels(),
      getProducts(),
      getLocations(),
    ])
      .then(
        ([
          ledger,
          levels,
          prods,
          locs,
        ]) => {
          setLedgerEntries(
            ledger || []
          );

          setStockLevels(
            levels || []
          );

          setProducts(
            prods || []
          );

          setLocations(
            locs || []
          );
        }
      )
      .catch((err) => {
        setError(
          err.message ||
            "Failed to load stock data."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredLedger = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return ledgerEntries.filter(
      (item) => {
        const productName = safeText(
          item.product_name
        ).toLowerCase();

        const sku = safeText(
          item.product_sku
        ).toLowerCase();

        const locationName =
          safeText(
            item.location_name
          ).toLowerCase();

        const matchesSearch =
          !query ||
          productName.includes(query) ||
          sku.includes(query) ||
          locationName.includes(query);

        const matchesType =
          selectedMovementType ===
            "all" ||
          item.movement_type ===
            selectedMovementType;

        const matchesLocation =
          selectedLocation ===
            "all" ||
          String(item.location_id) ===
            selectedLocation;

        return (
          matchesSearch &&
          matchesType &&
          matchesLocation
        );
      }
    );
  }, [
    ledgerEntries,
    searchQuery,
    selectedMovementType,
    selectedLocation,
  ]);

  const filteredLevels = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return stockLevels.filter(
      (item) => {
        const productName =
          safeText(
            item.product_name
          ).toLowerCase();

        const sku =
          safeText(
            item.product_sku
          ).toLowerCase();

        const locationName =
          safeText(
            item.location_name
          ).toLowerCase();

        const warehouseName =
          safeText(
            item.warehouse_name
          ).toLowerCase();

        const matchesSearch =
          !query ||
          productName.includes(query) ||
          sku.includes(query) ||
          locationName.includes(query) ||
          warehouseName.includes(query);

        const matchesLocation =
          selectedLocation ===
            "all" ||
          String(item.location_id) ===
            selectedLocation;

        return (
          matchesSearch &&
          matchesLocation
        );
      }
    );
  }, [
    stockLevels,
    searchQuery,
    selectedLocation,
  ]);

  const metrics = useMemo(() => {
    const totalUnits =
      stockLevels.reduce(
        (sum, item) =>
          sum +
          (Number(item.quantity) || 0),
        0
      );

    const ledgerIn =
      ledgerEntries.filter(
        (item) =>
          Number(
            item.quantity_change
          ) > 0
      ).length;

    const ledgerOut =
      ledgerEntries.filter(
        (item) =>
          Number(
            item.quantity_change
          ) < 0
      ).length;

    const uniqueProducts =
      new Set(
        stockLevels.map(
          (item) => item.product_id
        )
      ).size;

    const uniqueLocations =
      new Set(
        stockLevels.map(
          (item) => item.location_id
        )
      ).size;

    return {
      totalUnits,
      ledgerIn,
      ledgerOut,
      uniqueProducts:
        uniqueProducts ||
        products.length,
      uniqueLocations:
        uniqueLocations ||
        locations.length,
    };
  }, [
    stockLevels,
    ledgerEntries,
    products,
    locations,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedMovementType !== "all" ||
    selectedLocation !== "all";

  function clearFilters() {
    setSearchQuery("");
    setSelectedMovementType("all");
    setSelectedLocation("all");
  }

  return (
    <>
      <style>
        {`
          .sl-page {
            position: relative;
          }

          .sl-hero {
            position: relative;
            overflow: hidden;
            border-radius: 22px;
            margin-bottom: 18px;
            padding: 26px;
            background:
              radial-gradient(
                circle at 85% 15%,
                rgba(255,255,255,.15),
                transparent 26%
              ),
              linear-gradient(
                135deg,
                #211d19 0%,
                #2d2722 48%,
                #171310 100%
              );
            color: #fff;
            box-shadow:
              0 18px 45px rgba(44,35,28,.16);
          }

          .sl-hero::before {
            content: "";
            position: absolute;
            width: 240px;
            height: 240px;
            border-radius: 50%;
            right: -90px;
            top: -110px;
            border: 1px solid rgba(255,255,255,.09);
            box-shadow:
              0 0 0 22px rgba(255,255,255,.025),
              0 0 0 44px rgba(255,255,255,.018);
          }

          .sl-hero-grid {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 22px;
            align-items: center;
          }

          .sl-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 9px;
            color: rgba(255,255,255,.56);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .14em;
            text-transform: uppercase;
          }

          .sl-live-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 0 5px rgba(255,255,255,.08);
          }

          .sl-hero h2 {
            margin: 0;
            font-size: clamp(25px, 3vw, 34px);
            line-height: 1.05;
            letter-spacing: -.03em;
          }

          .sl-hero p {
            max-width: 650px;
            margin: 10px 0 0;
            color: rgba(255,255,255,.64);
            font-size: 13px;
            line-height: 1.65;
          }

          .sl-hero-actions {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .sl-refresh {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(255,255,255,.15);
            border-radius: 11px;
            padding: 10px 13px;
            background: rgba(255,255,255,.07);
            color: #fff;
            cursor: pointer;
            font-size: 12px;
            font-weight: 750;
            transition: .2s ease;
          }

          .sl-refresh:hover {
            background: rgba(255,255,255,.13);
            transform: translateY(-1px);
          }

          .sl-stat-grid {
            display: grid;
            grid-template-columns:
              repeat(5, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 18px;
          }

          .sl-stat-card {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 92px;
            padding: 15px;
            border: 1px solid rgba(36,31,27,.08);
            border-radius: 16px;
            background: #fff;
            box-shadow:
              0 8px 24px rgba(37,29,23,.05);
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .sl-stat-card:hover {
            transform: translateY(-2px);
            box-shadow:
              0 13px 30px rgba(37,29,23,.08);
          }

          .sl-stat-icon {
            width: 38px;
            height: 38px;
            flex: 0 0 38px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: #f3f0ec;
            color: #312a25;
          }

          .sl-stat-content {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .sl-stat-label {
            overflow: hidden;
            color: #8a827b;
            font-size: 10px;
            font-weight: 750;
            letter-spacing: .06em;
            text-transform: uppercase;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sl-stat-value {
            color: #211d19;
            font-size: 22px;
            letter-spacing: -.03em;
          }

          .sl-stat-helper {
            color: #9b938b;
            font-size: 10px;
          }

          .sl-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            flex-wrap: wrap;
            margin-bottom: 14px;
          }

          .sl-tabs {
            display: flex;
            gap: 7px;
            padding: 5px;
            border: 1px solid #e6e0da;
            border-radius: 14px;
            background: #f7f4f1;
          }

          .sl-tab {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 38px;
            border: 0;
            border-radius: 10px;
            padding: 0 14px;
            background: transparent;
            color: #716961;
            cursor: pointer;
            font-size: 12px;
            font-weight: 800;
            transition: .2s ease;
          }

          .sl-tab:hover {
            color: #211d19;
            background: #eee9e3;
          }

          .sl-tab.active {
            background: #28221d;
            color: #fff;
            box-shadow:
              0 5px 13px rgba(40,34,29,.15);
          }

          .sl-count {
            display: inline-grid;
            min-width: 21px;
            height: 21px;
            place-items: center;
            padding: 0 5px;
            border-radius: 999px;
            background: rgba(0,0,0,.07);
            font-size: 9px;
          }

          .sl-tab.active .sl-count {
            background: rgba(255,255,255,.13);
          }

          .sl-filter-panel {
            display: flex;
            align-items: center;
            gap: 9px;
            flex-wrap: wrap;
            padding: 11px;
            margin-bottom: 14px;
            border: 1px solid #e8e2dc;
            border-radius: 15px;
            background: #fff;
            box-shadow:
              0 7px 22px rgba(37,29,23,.04);
          }

          .sl-filter-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #7d756e;
            font-size: 11px;
            font-weight: 800;
          }

          .sl-select {
            min-width: 160px;
            height: 36px;
            border: 1px solid #ded7d0;
            border-radius: 9px;
            padding: 0 10px;
            background: #faf9f7;
            color: #2b2622;
            outline: none;
            cursor: pointer;
            font-size: 11px;
            font-weight: 700;
          }

          .sl-select:focus {
            border-color: #28221d;
            box-shadow:
              0 0 0 3px rgba(40,34,29,.08);
          }

          .sl-record-count {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: auto;
            color: #8c847d;
            font-size: 11px;
          }

          .sl-record-count strong {
            color: #28221d;
          }

          .sl-clear {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 34px;
            border: 1px solid #e1dad4;
            border-radius: 9px;
            padding: 0 9px;
            background: #fff;
            color: #716961;
            cursor: pointer;
            font-size: 10px;
            font-weight: 800;
          }

          .sl-clear:hover {
            background: #f7f4f1;
            color: #28221d;
          }

          .sl-table-card {
            overflow: hidden;
            border: 1px solid #e7e0d9;
            border-radius: 18px;
            background: #fff;
            box-shadow:
              0 10px 28px rgba(37,29,23,.045);
          }

          .sl-table-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 18px;
            border-bottom: 1px solid #eee9e4;
          }

          .sl-table-title {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .sl-table-title-icon {
            width: 30px;
            height: 30px;
            display: grid;
            place-items: center;
            border-radius: 9px;
            background: #f4f1ed;
            color: #403932;
          }

          .sl-table-title strong {
            display: block;
            color: #28221d;
            font-size: 13px;
          }

          .sl-table-title span {
            display: block;
            margin-top: 2px;
            color: #999088;
            font-size: 10px;
          }

          .sl-table-meta {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #9a928b;
            font-size: 10px;
            font-weight: 700;
          }

          .sl-table-wrap {
            overflow-x: auto;
          }

          .sl-table {
            width: 100%;
            min-width: 960px;
            border-collapse: collapse;
          }

          .sl-table th {
            position: sticky;
            top: 0;
            z-index: 1;
            padding: 12px 16px;
            border-bottom: 1px solid #eae4df;
            background: #fbfaf8;
            color: #8c847d;
            text-align: left;
            font-size: 9px;
            font-weight: 850;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

          .sl-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #f0ece8;
            vertical-align: middle;
          }

          .sl-table tbody tr {
            transition: background .15s ease;
          }

          .sl-table tbody tr:hover {
            background: #fcfbfa;
          }

          .sl-table tbody tr:last-child td {
            border-bottom: 0;
          }

          .sl-date {
            display: flex;
            flex-direction: column;
            gap: 2px;
            white-space: nowrap;
          }

          .sl-date-main {
            color: #403932;
            font-size: 11px;
            font-weight: 700;
          }

          .sl-date-sub {
            color: #aaa19a;
            font-size: 9px;
          }

          .sl-product {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 180px;
          }

          .sl-product-icon {
            width: 34px;
            height: 34px;
            flex: 0 0 34px;
            display: grid;
            place-items: center;
            border-radius: 10px;
            background: #f3f0ec;
            color: #5e554d;
          }

          .sl-product-name {
            max-width: 230px;
            overflow: hidden;
            color: #2c2723;
            font-size: 12px;
            font-weight: 800;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .sl-product-sku {
            margin-top: 3px;
            color: #a09790;
            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              monospace;
            font-size: 9px;
          }

          .sl-location {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #554d46;
            font-size: 11px;
            font-weight: 700;
          }

          .sl-location svg {
            color: #9b928b;
          }

          .sl-movement-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid #e7e0da;
            border-radius: 999px;
            padding: 5px 8px;
            background: #faf8f6;
            color: #625a53;
            font-size: 9px;
            font-weight: 850;
            white-space: nowrap;
          }

          .sl-movement-badge.inbound {
            background: #f2f7f3;
            border-color: #d9e8dc;
            color: #45664c;
          }

          .sl-movement-badge.outbound {
            background: #f9f3f1;
            border-color: #eadbd6;
            color: #8b5d52;
          }

          .sl-movement-badge.adjustment {
            background: #f7f5f1;
            border-color: #e7dfd5;
            color: #756754;
          }

          .sl-movement-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: currentColor;
          }

          .sl-quantity {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            font-weight: 850;
            white-space: nowrap;
          }

          .sl-quantity.positive {
            color: #347248;
          }

          .sl-quantity.negative {
            color: #a14e43;
          }

          .sl-quantity.neutral {
            color: #887f78;
          }

          .sl-balance {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #716861;
            font-size: 11px;
          }

          .sl-balance strong {
            color: #2f2925;
            font-weight: 850;
          }

          .sl-reference {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            max-width: 160px;
            overflow: hidden;
            border-radius: 7px;
            padding: 5px 7px;
            background: #f6f3f0;
            color: #6e655e;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              monospace;
            font-size: 9px;
          }

          .sl-operator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-width: 120px;
            color: #574f48;
            font-size: 10px;
            font-weight: 700;
          }

          .sl-avatar {
            width: 27px;
            height: 27px;
            flex: 0 0 27px;
            display: grid;
            place-items: center;
            border-radius: 8px;
            background: #2c2621;
            color: #fff;
            font-size: 9px;
            font-weight: 850;
          }

          .sl-level-product {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .sl-level-icon {
            width: 33px;
            height: 33px;
            display: grid;
            place-items: center;
            border-radius: 9px;
            background: #f4f1ed;
            color: #625a52;
          }

          .sl-level-main {
            color: #302a26;
            font-size: 11px;
            font-weight: 800;
          }

          .sl-level-category {
            margin-top: 2px;
            color: #a19891;
            font-size: 9px;
          }

          .sl-sku {
            display: inline-flex;
            border-radius: 7px;
            padding: 5px 7px;
            background: #f7f4f1;
            color: #645c55;
            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              monospace;
            font-size: 9px;
            font-weight: 700;
          }

          .sl-warehouse {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #5c544d;
            font-size: 11px;
            font-weight: 700;
          }

          .sl-stock-value {
            min-width: 95px;
          }

          .sl-stock-number {
            color: #2d2723;
            font-size: 15px;
            font-weight: 900;
            letter-spacing: -.02em;
          }

          .sl-stock-meter {
            width: 72px;
            height: 4px;
            margin-top: 7px;
            overflow: hidden;
            border-radius: 999px;
            background: #eeeae5;
          }

          .sl-stock-meter span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: #4b433c;
          }

          .sl-unit {
            color: #817970;
            font-size: 10px;
            font-weight: 700;
          }

          .sl-empty-state {
            display: flex;
            min-height: 330px;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 42px 20px;
            text-align: center;
          }

          .sl-empty-icon {
            width: 58px;
            height: 58px;
            display: grid;
            place-items: center;
            margin-bottom: 14px;
            border-radius: 17px;
            background: #f4f1ed;
            color: #716860;
          }

          .sl-empty-state h3 {
            margin: 0;
            color: #302a26;
            font-size: 16px;
          }

          .sl-empty-state p {
            max-width: 430px;
            margin: 8px 0 0;
            color: #9b938b;
            font-size: 11px;
            line-height: 1.6;
          }

          .sl-skeleton {
            width: 88%;
            height: 11px;
            border-radius: 6px;
            background:
              linear-gradient(
                90deg,
                #f1ede9 25%,
                #f8f5f2 50%,
                #f1ede9 75%
              );
            background-size: 200% 100%;
            animation:
              sl-shimmer 1.3s infinite;
          }

          @keyframes sl-shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          @media (max-width: 1200px) {
            .sl-stat-grid {
              grid-template-columns:
                repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 850px) {
            .sl-hero-grid {
              grid-template-columns: 1fr;
            }

            .sl-hero-actions {
              justify-content: flex-start;
            }

            .sl-stat-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .sl-record-count {
              margin-left: 0;
            }
          }

          @media (max-width: 560px) {
            .sl-hero {
              padding: 20px;
              border-radius: 17px;
            }

            .sl-stat-grid {
              grid-template-columns: 1fr;
            }

            .sl-tabs {
              width: 100%;
            }

            .sl-tab {
              flex: 1;
              justify-content: center;
              padding: 0 8px;
            }

            .sl-filter-panel {
              align-items: stretch;
            }

            .sl-select {
              width: 100%;
            }

            .sl-filter-label {
              width: 100%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .sl-stat-card,
            .sl-refresh,
            .sl-tab {
              transition: none;
            }

            .sl-skeleton {
              animation: none;
            }
          }
        `}
      </style>

      <AppLayout
        title="Stock Levels & Audit Ledger"
        actionButton={
          <button
            type="button"
            className="btn-secondary"
            onClick={loadData}
            title="Refresh stock data"
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            <span>Refresh</span>
          </button>
        }
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      >
        <div className="sl-page">
          {/* ============================================================
              HERO
              ============================================================ */}

          <section className="sl-hero">
            <div className="sl-hero-grid">
              <div>
                <div className="sl-eyebrow">
                  <span className="sl-live-dot" />
                  Inventory Intelligence
                </div>

                <h2>
                  Stock movement,
                  <br />
                  fully traceable.
                </h2>

                <p>
                  Monitor inventory balances
                  across locations and inspect
                  every stock movement through
                  one unified operational ledger.
                </p>
              </div>

              <div className="sl-hero-actions">
                <button
                  type="button"
                  className="sl-refresh"
                  onClick={loadData}
                  disabled={loading}
                >
                  <RefreshCw
                    size={15}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {loading
                    ? "Syncing..."
                    : "Sync inventory"}
                </button>
              </div>
            </div>
          </section>

          {/* ============================================================
              METRICS
              ============================================================ */}

          <section className="sl-stat-grid">
            <StatCard
              icon={Boxes}
              label="On-hand units"
              value={metrics.totalUnits.toLocaleString()}
              helper="Across tracked locations"
            />

            <StatCard
              icon={Package}
              label="Products tracked"
              value={metrics.uniqueProducts}
              helper="Unique inventory items"
            />

            <StatCard
              icon={Warehouse}
              label="Locations"
              value={metrics.uniqueLocations}
              helper="Active stock locations"
            />

            <StatCard
              icon={TrendingUp}
              label="Inbound records"
              value={metrics.ledgerIn}
              helper="Positive movements"
            />

            <StatCard
              icon={TrendingDown}
              label="Outbound records"
              value={metrics.ledgerOut}
              helper="Negative movements"
            />
          </section>

          {/* ============================================================
              ERROR
              ============================================================ */}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
                padding: "12px 14px",
                border: "1px solid #efd8d4",
                borderRadius: "13px",
                background: "#fff8f7",
                color: "#8e4239",
                fontSize: "11px",
                fontWeight: "700",
              }}
              role="alert"
            >
              <AlertTriangle size={16} />

              <span>
                {error}
              </span>
            </div>
          )}

          {/* ============================================================
              TABS
              ============================================================ */}

          <div className="sl-toolbar">
            <div className="sl-tabs">
              <button
                type="button"
                className={`sl-tab ${
                  activeTab === "ledger"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    "ledger"
                  )
                }
              >
                <ClipboardList size={15} />

                <span>
                  Movement Ledger
                </span>

                <span className="sl-count">
                  {filteredLedger.length}
                </span>
              </button>

              <button
                type="button"
                className={`sl-tab ${
                  activeTab === "levels"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    "levels"
                  )
                }
              >
                <Layers size={15} />

                <span>
                  Location Balances
                </span>

                <span className="sl-count">
                  {filteredLevels.length}
                </span>
              </button>
            </div>
          </div>

          {/* ============================================================
              FILTERS
              ============================================================ */}

          <div className="sl-filter-panel">
            <span className="sl-filter-label">
              <SlidersHorizontal
                size={14}
              />

              Filters
            </span>

            {activeTab ===
              "ledger" && (
              <>
                <span className="sl-filter-label">
                  <Activity
                    size={13}
                  />

                  Movement
                </span>

                <select
                  className="sl-select"
                  value={
                    selectedMovementType
                  }
                  onChange={(e) =>
                    setSelectedMovementType(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All movements
                  </option>

                  <option value="receipt">
                    Receipt (Inbound)
                  </option>

                  <option value="delivery">
                    Delivery (Outbound)
                  </option>

                  <option value="transfer_in">
                    Transfer In
                  </option>

                  <option value="transfer_out">
                    Transfer Out
                  </option>

                  <option value="adjustment">
                    Count Adjustment
                  </option>

                  <option value="opening_balance">
                    Opening Balance
                  </option>
                </select>
              </>
            )}

            <span className="sl-filter-label">
              <MapPin size={13} />

              Location
            </span>

            <select
              className="sl-select"
              value={
                selectedLocation
              }
              onChange={(e) =>
                setSelectedLocation(
                  e.target.value
                )
              }
            >
              <option value="all">
                All locations
              </option>

              {locations.map(
                (location) => (
                  <option
                    key={location.id}
                    value={String(
                      location.id
                    )}
                  >
                    {location.name}{" "}
                    ({location.code})
                  </option>
                )
              )}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="sl-clear"
                onClick={
                  clearFilters
                }
              >
                <X size={13} />

                Clear
              </button>
            )}

            <span className="sl-record-count">
              <Database size={12} />

              Showing{" "}
              <strong>
                {activeTab ===
                "ledger"
                  ? filteredLedger.length
                  : filteredLevels.length}
              </strong>

              records
            </span>
          </div>

          {/* ============================================================
              MOVEMENT LEDGER
              ============================================================ */}

          {activeTab === "ledger" && (
            <section className="sl-table-card">
              <div className="sl-table-head">
                <div className="sl-table-title">
                  <div className="sl-table-title-icon">
                    <ClipboardList
                      size={15}
                    />
                  </div>

                  <div>
                    <strong>
                      Stock movement ledger
                    </strong>

                    <span>
                      Complete inventory
                      audit trail
                    </span>
                  </div>
                </div>

                <span className="sl-table-meta">
                  <Clock3 size={12} />

                  Latest records first
                </span>
              </div>

              <div className="sl-table-wrap">
                <table className="sl-table">
                  <thead>
                    <tr>
                      <th>
                        Timestamp
                      </th>

                      <th>
                        Product
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Movement
                      </th>

                      <th>
                        Change
                      </th>

                      <th>
                        Before → After
                      </th>

                      <th>
                        Reference
                      </th>

                      <th>
                        Operator
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <LoadingRows
                        columns={8}
                      />
                    ) : filteredLedger.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={8}
                        >
                          <EmptyState
                            icon={
                              searchQuery
                                ? Search
                                : ClipboardList
                            }
                            title={
                              searchQuery
                                ? "No matching movements"
                                : "No audit records yet"
                            }
                            description={
                              searchQuery
                                ? "Try changing your search or filters."
                                : "Receipts, deliveries, transfers, and adjustments will appear here automatically."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map(
                        (row) => {
                          const quantity =
                            Number(
                              row.quantity_change
                            ) || 0;

                          const before =
                            Number(
                              row.quantity_before
                            ) || 0;

                          const after =
                            Number(
                              row.quantity_after
                            ) || 0;

                          const operator =
                            safeText(
                              row.created_by_name
                            );

                          const initials =
                            operator
                              .split(" ")
                              .filter(
                                Boolean
                              )
                              .slice(0, 2)
                              .map(
                                (part) =>
                                  part[0]
                              )
                              .join("")
                              .toUpperCase() ||
                            "OP";

                          return (
                            <tr
                              key={
                                row.id
                              }
                            >
                              <td>
                                <div className="sl-date">
                                  <span className="sl-date-main">
                                    {formatDateTime(
                                      row.created_at
                                    )}
                                  </span>

                                  <span className="sl-date-sub">
                                    Inventory event
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="sl-product">
                                  <div className="sl-product-icon">
                                    <Package
                                      size={16}
                                    />
                                  </div>

                                  <div>
                                    <div className="sl-product-name">
                                      {safeText(
                                        row.product_name
                                      )}
                                    </div>

                                    <div className="sl-product-sku">
                                      {safeText(
                                        row.product_sku
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className="sl-location">
                                  <MapPin
                                    size={13}
                                  />

                                  {safeText(
                                    row.location_name
                                  )}
                                </span>
                              </td>

                              <td>
                                <MovementBadge
                                  type={
                                    row.movement_type
                                  }
                                />
                              </td>

                              <td>
                                <QuantityChange
                                  value={
                                    quantity
                                  }
                                />
                              </td>

                              <td>
                                <span className="sl-balance">
                                  {before}

                                  <ChevronRight
                                    size={13}
                                  />

                                  <strong>
                                    {after}
                                  </strong>
                                </span>
                              </td>

                              <td>
                                <span
                                  className="sl-reference"
                                  title={`${safeText(
                                    row.reference_type
                                  )} #${safeText(
                                    row.reference_id
                                  )}`}
                                >
                                  {safeText(
                                    row.reference_type
                                  )}

                                  {" #"}

                                  {safeText(
                                    row.reference_id
                                  )}
                                </span>
                              </td>

                              <td>
                                <span className="sl-operator">
                                  <span className="sl-avatar">
                                    {initials ||
                                      "OP"}
                                  </span>

                                  <span>
                                    {operator}
                                  </span>
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
          )}

          {/* ============================================================
              LOCATION LEVELS
              ============================================================ */}

          {activeTab === "levels" && (
            <section className="sl-table-card">
              <div className="sl-table-head">
                <div className="sl-table-title">
                  <div className="sl-table-title-icon">
                    <Layers
                      size={15}
                    />
                  </div>

                  <div>
                    <strong>
                      Location balance matrix
                    </strong>

                    <span>
                      Current stock by
                      warehouse location
                    </span>
                  </div>
                </div>

                <span className="sl-table-meta">
                  <CheckCircle2
                    size={12}
                  />

                  Current snapshot
                </span>
              </div>

              <div className="sl-table-wrap">
                <table className="sl-table">
                  <thead>
                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        SKU
                      </th>

                      <th>
                        Warehouse
                      </th>

                      <th>
                        Location zone
                      </th>

                      <th>
                        On-hand
                      </th>

                      <th>
                        Unit
                      </th>

                      <th>
                        Last movement
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <LoadingRows
                        columns={7}
                      />
                    ) : filteredLevels.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                        >
                          <EmptyState
                            icon={
                              searchQuery
                                ? Search
                                : Layers
                            }
                            title={
                              searchQuery
                                ? "No matching stock levels"
                                : "No location balances"
                            }
                            description={
                              searchQuery
                                ? "Try a different product, SKU, warehouse, or location."
                                : "Stock levels will appear here after inventory is allocated to locations."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredLevels.map(
                        (
                          level
                        ) => {
                          const quantity =
                            Number(
                              level.quantity
                            ) || 0;

                          const maxQuantity =
                            Math.max(
                              ...filteredLevels.map(
                                (item) =>
                                  Number(
                                    item.quantity
                                  ) || 0
                              ),
                              1
                            );

                          const width =
                            Math.max(
                              5,
                              Math.min(
                                100,
                                (quantity /
                                  maxQuantity) *
                                  100
                              )
                            );

                          return (
                            <tr
                              key={
                                level.id
                              }
                            >
                              <td>
                                <div className="sl-level-product">
                                  <div className="sl-level-icon">
                                    <Boxes
                                      size={15}
                                    />
                                  </div>

                                  <div>
                                    <div className="sl-level-main">
                                      {safeText(
                                        level.product_name
                                      )}
                                    </div>

                                    <div className="sl-level-category">
                                      {safeText(
                                        level.product_category
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className="sl-sku">
                                  {safeText(
                                    level.product_sku
                                  )}
                                </span>
                              </td>

                              <td>
                                <span className="sl-warehouse">
                                  <Warehouse
                                    size={14}
                                  />

                                  {safeText(
                                    level.warehouse_name
                                  )}
                                </span>
                              </td>

                              <td>
                                <span className="sl-location">
                                  <MapPin
                                    size={13}
                                  />

                                  {safeText(
                                    level.location_name
                                  )}

                                  <span
                                    style={{
                                      color:
                                        "#a19891",
                                      fontSize:
                                        "9px",
                                    }}
                                  >
                                    (
                                    {safeText(
                                      level.location_code
                                    )}
                                    )
                                  </span>
                                </span>
                              </td>

                              <td>
                                <div className="sl-stock-value">
                                  <div className="sl-stock-number">
                                    {quantity.toLocaleString()}
                                  </div>

                                  <div className="sl-stock-meter">
                                    <span
                                      style={{
                                        width: `${width}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className="sl-unit">
                                  {safeText(
                                    level.product_unit
                                  )}
                                </span>
                              </td>

                              <td>
                                <div className="sl-date">
                                  <span className="sl-date-main">
                                    {formatDate(
                                      level.updated_at
                                    )}
                                  </span>

                                  <span className="sl-date-sub">
                                    Last updated
                                  </span>
                                </div>
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
          )}

          {/* ============================================================
              FOOTER MICRO SUMMARY
              ============================================================ */}

          {!loading && (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "13px",
                padding:
                  "0 4px",
                color: "#aaa19a",
                fontSize: "9px",
                fontWeight: "700",
              }}
            >
              <span>
                StockSense inventory
                intelligence
              </span>

              <span>
                {activeTab ===
                "ledger"
                  ? `${filteredLedger.length} movement records`
                  : `${filteredLevels.length} location balances`}
              </span>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}

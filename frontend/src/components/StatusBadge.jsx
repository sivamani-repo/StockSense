import React from "react";

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  const labels = {
    draft: "Draft",
    waiting: "Waiting (Picked)",
    ready: "Ready (Packed)",
    done: "Completed",
    canceled: "Canceled",
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
  };

  return (
    <span className={`status-pill ${normalized}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "currentColor",
          display: "inline-block",
        }}
      />
      {labels[normalized] || status}
    </span>
  );
}

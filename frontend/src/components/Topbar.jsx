import React from "react";
import { Search, Bell, Plus } from "lucide-react";

export default function Topbar({ title, actionButton, onSearch, searchValue }) {
  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <h2 className="page-title-heading">{title}</h2>
      </div>

      <div className="topbar-right">
        {onSearch && (
          <div className="search-input-box">
            <Search size={15} color="#8c847e" />
            <input
              type="text"
              placeholder="Search items, SKUs, records..."
              value={searchValue || ""}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        {actionButton}
      </div>
    </header>
  );
}

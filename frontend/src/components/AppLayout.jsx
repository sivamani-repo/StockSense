import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../styles/app.css";

export default function AppLayout({ title, actionButton, onSearch, searchValue, children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Topbar
          title={title}
          actionButton={actionButton}
          onSearch={onSearch}
          searchValue={searchValue}
        />
        <main className="page-content-wrapper">{children}</main>
      </div>
    </div>
  );
}

// ============================================================
//  FILE: src/pages/NotFound.jsx
//  PURPOSE: FRONTEND ONLY — 404 page for invalid routes
// ============================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <p className="notfound-code">404</p>
      <h1 className="notfound-title">Page not found</h1>
      <p className="notfound-text">The page you're looking for doesn't exist or has been moved.</p>
      <button className="notfound-btn" onClick={() => navigate("/")}>
        🏠 Go Home
      </button>
    </div>
  );
}

export default NotFound;

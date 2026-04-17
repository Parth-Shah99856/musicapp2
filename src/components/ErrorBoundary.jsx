// ============================================================
//  FILE: src/components/ErrorBoundary.jsx
//  PURPOSE: FRONTEND ONLY — Catches render errors gracefully
//
//  React Error Boundaries must be CLASS components (not hooks).
//  If any child component throws during render, this catches it
//  and shows a fallback UI instead of a white screen.
//
//  DATA STRUCTURE: Uses React's component state to store the
//  error object when caught.
// ============================================================

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called when a child component throws an error during render
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Called after an error is caught — good place for logging
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", height: "100%", padding: "40px",
          color: "#b3b3b3", textAlign: "center",
        }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>😵</p>
          <h2 style={{ color: "#fff", marginBottom: "8px" }}>Something went wrong</h2>
          <p style={{ marginBottom: "24px" }}>An unexpected error occurred.</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); }}
            style={{
              background: "#1db954", color: "#fff", border: "none",
              padding: "10px 24px", borderRadius: "20px", cursor: "pointer",
              fontSize: "14px", fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// ============================================================
//  FILE: src/components/Toast.jsx
//  PURPOSE: FRONTEND ONLY — Renders toast notifications
//
//  LOGIC used from: src/js/toastHelper.js (via ToastContext)
//  - toasts (ARRAY as QUEUE) → renders each toast in order
//  - dismissToast()          → removes a toast when clicked
//
//  DATA STRUCTURES shown:
//  - toasts is an ARRAY (Queue) → .map() renders each toast
//  - Each toast is an Object: { id, message, type, timestamp }
// ============================================================

import React from "react";
import { useToast } from "../context/ToastContext";
import "./Toast.css";

function Toast() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {/* Loop through toasts Array (Queue) — oldest first */}
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          onClick={() => dismissToast(toast.id)}
          role="alert"
        >
          <span className="toast__icon">
            {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "ℹ"}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;

// ============================================================
//  FILE: src/context/ToastContext.jsx
//  PURPOSE: React "bridge" that connects toastHelper.js to
//           the UI components.
//
//  LOGIC used from: src/js/toastHelper.js
//  - addToast()            → adds to queue (FIFO Array)
//  - removeToast()         → removes by ID
//  - cleanExpiredToasts()  → auto-cleans old toasts
//  - TOAST_DURATION        → timing constant
//
//  This context provides showToast() to any component in the app.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  addToast as addToastLogic,
  removeToast as removeToastLogic,
  cleanExpiredToasts,
  TOAST_DURATION,
  ToastType,
} from "../js/toastHelper.js";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  // toasts is an ARRAY used as a QUEUE (FIFO)
  const [toasts, setToasts] = useState([]);
  const cleanupRef = useRef(null);

  // Show a new toast — delegates to addToast() in toastHelper.js
  const showToast = useCallback((message, type = ToastType.INFO) => {
    setToasts(prev => addToastLogic(prev, message, type));
  }, []);

  // Dismiss a specific toast — delegates to removeToast() in toastHelper.js
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => removeToastLogic(prev, toastId));
  }, []);

  // Auto-cleanup timer: removes expired toasts every second
  useEffect(() => {
    if (toasts.length === 0) return;

    cleanupRef.current = setInterval(() => {
      setToasts(prev => {
        const cleaned = cleanExpiredToasts(prev);
        // Only update state if something actually changed
        if (cleaned.length !== prev.length) return cleaned;
        return prev;
      });
    }, 500);

    return () => clearInterval(cleanupRef.current);
  }, [toasts.length]);

  const value = { toasts, showToast, dismissToast, ToastType };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

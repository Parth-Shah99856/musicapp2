// ============================================================
//  FILE: src/js/toastHelper.js
//  PURPOSE: Pure JavaScript logic for toast notifications
//
//  DATA STRUCTURE USED: ARRAY as a QUEUE (FIFO)
//  ---------------------------------------------------------------
//  A Queue follows First In, First Out (FIFO):
//  - New toasts are added at the END (.push)
//  - Old toasts are removed from the FRONT
//
//  Each toast is an Object with:
//  { id, message, type, timestamp }
//
//  WHY ARRAY as Queue?
//  - Toasts appear in order — first shown = first dismissed
//  - We need to render all active toasts at once (.map)
//  - .filter() lets us remove expired toasts efficiently
//
//  TOAST TYPES (uses string constants like an ENUM):
//  - "success" → green (liked, added, created)
//  - "info"    → blue  (general info)
//  - "warning" → orange (errors, missing data)
// ============================================================

// ---------------------------------------------------------------
//  Toast type constants (used like an ENUM)
// ---------------------------------------------------------------
export const ToastType = {
  SUCCESS: "success",
  INFO:    "info",
  WARNING: "warning",
};

// How long each toast stays visible (in milliseconds)
export const TOAST_DURATION = 3000; // 3 seconds

// Maximum number of toasts shown at once
// Prevents screen from being filled with toasts
export const MAX_TOASTS = 5;

// ---------------------------------------------------------------
//  createToast()
//  Creates a new toast object to add to the queue
//
//  Parameters:
//  - message (string): The text to display
//  - type (string):    One of ToastType values
//
//  Returns: a toast object { id, message, type, timestamp }
//
//  We use Date.now() as a unique ID (same pattern as playlist IDs)
//  The timestamp is used to auto-expire toasts
// ---------------------------------------------------------------
export function createToast(message, type = ToastType.INFO) {
  return {
    id: Date.now() + Math.random(), // unique ID (timestamp + random to avoid collisions)
    message,
    type,
    timestamp: Date.now(),
  };
}

// ---------------------------------------------------------------
//  addToast()
//  Adds a new toast to the queue (end of Array)
//  If queue exceeds MAX_TOASTS, removes the oldest (front of Array)
//
//  DATA STRUCTURE: Queue operation — enqueue at back
//  If over capacity, dequeue from front (using .slice)
//
//  Returns: new Array with the toast added
// ---------------------------------------------------------------
export function addToast(toasts, message, type) {
  const newToast = createToast(message, type);

  // Add to the END of the array (enqueue)
  const updated = [...toasts, newToast];

  // If too many toasts, remove from the FRONT (dequeue oldest)
  // .slice(-MAX_TOASTS) keeps only the last MAX_TOASTS items
  if (updated.length > MAX_TOASTS) {
    return updated.slice(-MAX_TOASTS);
  }

  return updated;
}

// ---------------------------------------------------------------
//  removeToast()
//  Removes a specific toast by ID
//
//  Uses .filter() — Linear Search O(n) through the queue
//  Returns: new Array with that toast removed
// ---------------------------------------------------------------
export function removeToast(toasts, toastId) {
  return toasts.filter(t => t.id !== toastId);
}

// ---------------------------------------------------------------
//  cleanExpiredToasts()
//  Removes all toasts older than TOAST_DURATION
//
//  Uses .filter() with timestamp comparison
//  Called periodically or on each render to auto-clean
//
//  Returns: new Array with only active (non-expired) toasts
// ---------------------------------------------------------------
export function cleanExpiredToasts(toasts) {
  const now = Date.now();
  return toasts.filter(t => now - t.timestamp < TOAST_DURATION);
}

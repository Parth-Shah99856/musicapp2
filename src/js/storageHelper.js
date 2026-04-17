// ============================================================
//  FILE: src/js/storageHelper.js
//  PURPOSE: A helper to read/write data to localStorage
//
//  WHAT IS localStorage?
//  ---------------------------------------------------------------
//  localStorage is the browser's built-in KEY-VALUE store.
//  It persists data even after the browser tab is closed.
//
//  DATA STRUCTURE: HASH MAP (Key → Value)
//  ---------------------------------------------------------------
//  localStorage works exactly like a Hash Map:
//  - localStorage.setItem("key", value)  → insert/update
//  - localStorage.getItem("key")         → lookup by key → O(1)
//  - localStorage.removeItem("key")      → delete by key
//
//  The keys we use in this app:
//  ┌─────────────────┬────────────────────────────────────────┐
//  │ Key             │ Value stored                           │
//  ├─────────────────┼────────────────────────────────────────┤
//  │ "likedSongs"    │ JSON array of liked song IDs           │
//  │ "playlists"     │ JSON array of playlist objects         │
//  └─────────────────┴────────────────────────────────────────┘
//
//  NOTE: localStorage only stores STRINGS.
//  So we use JSON.stringify() to convert objects/arrays → string
//  And JSON.parse() to convert string → back to object/array.
// ============================================================

// Save any value to localStorage under a key
export function saveToStorage(key, value) {
  // Convert the value to a JSON string before saving
  // Example: [1, 3, 5] → '[ 1, 3, 5 ]'
  localStorage.setItem(key, JSON.stringify(value));
}

// Load a value from localStorage by key
// Returns null if key doesn't exist
export function loadFromStorage(key) {
  const raw = localStorage.getItem(key); // returns string or null
  if (raw === null) return null;         // nothing saved yet
  return JSON.parse(raw);               // convert string back to object/array
}

// Remove a key from localStorage
export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// The specific keys used in this app (so we don't mistype them)
export const STORAGE_KEYS = {
  LIKED_SONGS: "likedSongs",  // stores: [1, 3, 5]  (array of song IDs)
  PLAYLISTS:   "playlists",   // stores: [{id, name, songIds:[...]}, ...]
};

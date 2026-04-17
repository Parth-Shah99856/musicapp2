// ============================================================
//  FILE: src/js/keyboardShortcuts.js
//  PURPOSE: Map keyboard keys to player actions
//
//  DATA STRUCTURE USED: HASH MAP (Object)
//  ---------------------------------------------------------------
//  A Hash Map stores KEY → VALUE pairs with O(1) lookup.
//
//  Here we use a JavaScript Object as a Hash Map:
//  - KEY   = the keyboard key string (e.g., " ", "ArrowRight")
//  - VALUE = the action name string (e.g., "togglePlay", "nextSong")
//
//  When a key is pressed:
//  1. Look up the key in the map → O(1)
//  2. If found, return the action name
//  3. If not found, return null (key not mapped)
//
//  WHY Hash Map?
//  - O(1) lookup — instant, no matter how many shortcuts we add
//  - Easy to add/remove shortcuts without changing any logic
//  - Self-documenting — the map IS the documentation
//
//  ALTERNATIVE: if/else chain or switch statement
//  - Works, but harder to maintain as shortcuts grow
//  - Hash Map is the standard pattern for this in real apps
// ============================================================

// ---------------------------------------------------------------
//  SHORTCUT_MAP — The main Hash Map
//  ---------------------------------------------------------------
//  Key (keyboard key)  →  Value (action to perform)
//
//  ┌──────────────────┬─────────────────┐
//  │ Key              │ Action          │
//  ├──────────────────┼─────────────────┤
//  │ " " (Space)      │ togglePlay      │
//  │ ArrowRight       │ nextSong        │
//  │ ArrowLeft        │ prevSong        │
//  │ ArrowUp          │ volumeUp        │
//  │ ArrowDown        │ volumeDown      │
//  │ m                │ toggleMute      │
//  │ s                │ toggleShuffle   │
//  │ r                │ cycleRepeat     │
//  └──────────────────┴─────────────────┘
// ---------------------------------------------------------------
const SHORTCUT_MAP = {
  " ":          "togglePlay",    // Space bar
  "ArrowRight": "nextSong",      // Right arrow
  "ArrowLeft":  "prevSong",      // Left arrow
  "ArrowUp":    "volumeUp",      // Up arrow
  "ArrowDown":  "volumeDown",    // Down arrow
  "m":          "toggleMute",    // M key
  "s":          "toggleShuffle", // S key
  "r":          "cycleRepeat",   // R key
};

// ---------------------------------------------------------------
//  getActionForKey()
//  Given a keyboard event, return the action name or null
//
//  ALGORITHM: Hash Map lookup → O(1)
//
//  We also check if the user is typing in an input/textarea
//  (we don't want Space to toggle play while typing a playlist name!)
//
//  Parameters:
//  - event: the browser KeyboardEvent object
//
//  Returns:
//  - action name (string) if the key is mapped
//  - null if the key has no mapping or user is typing
// ---------------------------------------------------------------
export function getActionForKey(event) {
  // Don't intercept keyboard when user is typing in a form field
  // event.target is the HTML element that received the keypress
  const tagName = event.target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return null; // let the text input handle the key normally
  }

  // Look up the pressed key in our Hash Map — O(1)
  const action = SHORTCUT_MAP[event.key];

  // Return the action name, or null if not found
  return action || null;
}

// ---------------------------------------------------------------
//  VOLUME_STEP
//  How much to change volume per key press (5%)
// ---------------------------------------------------------------
export const VOLUME_STEP = 0.05;

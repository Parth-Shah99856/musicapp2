// ============================================================
//  FILE: src/js/playerLogic.js
//  PURPOSE: All logic related to playing music
//           (play, pause, next, previous, seek, volume)
//
//  DATA STRUCTURE USED: QUEUE (for song order)
//  ---------------------------------------------------------------
//  A Queue is a data structure where:
//  - Items are added at the BACK  (enqueue)
//  - Items are removed from the FRONT (dequeue)
//  - Think of it like a LINE at a ticket counter
//  - FIFO = First In, First Out
//
//  We use the songs ARRAY as a Queue here:
//  - The currently playing song is at the "front"
//  - next() moves the pointer forward (like dequeue + enqueue)
//  - prev() moves the pointer backward
//
//  We also use an INDEX POINTER to track position in the queue:
//  currentIndex = 0 means first song, 1 means second, etc.
//
//  CIRCULAR QUEUE concept:
//  - When we reach the last song and press Next,
//    we wrap back to the first song (index 0)
//  - Formula: nextIndex = (currentIndex + 1) % totalSongs
//  - The % (modulo) operator handles the wrapping
// ============================================================

import songsData from "./songsData.js";

// ---------------------------------------------------------------
//  formatTime()
//  Converts seconds (a number) into "m:ss" string
//
//  Example: formatTime(213) → "3:33"
//
//  How it works:
//  - Math.floor(213 / 60) = 3  (the minutes part)
//  - 213 % 60 = 33             (the remaining seconds)
//  - If secs < 10, add a "0" in front so "3:3" becomes "3:03"
// ---------------------------------------------------------------
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// ---------------------------------------------------------------
//  getNextSong()
//  Returns the next song in the queue (circular)
//
//  DATA STRUCTURE: Circular Queue using Array + index
//
//  Example with 5 songs (indices 0,1,2,3,4):
//  - currentIndex = 3 → nextIndex = (3+1) % 5 = 4  (normal)
//  - currentIndex = 4 → nextIndex = (4+1) % 5 = 0  (wraps to start!)
// ---------------------------------------------------------------
export function getNextSong(currentSongId) {
  // Step 1: Find WHERE the current song is in the array
  const currentIndex = songsData.findIndex(song => song.id === currentSongId);

  // Step 2: Calculate the next index using MODULO for circular wrap
  const nextIndex = (currentIndex + 1) % songsData.length;

  // Step 3: Return the next song object
  return songsData[nextIndex];
}

// ---------------------------------------------------------------
//  getPrevSong()
//  Returns the previous song in the queue (circular)
//
//  Tricky part: if index = 0 (first song), going back should
//  land on the LAST song, not index -1 (which doesn't exist).
//
//  Formula: prevIndex = (currentIndex - 1 + total) % total
//  Example with 5 songs:
//  - currentIndex = 2 → (2 - 1 + 5) % 5 = 6 % 5 = 1  ✓
//  - currentIndex = 0 → (0 - 1 + 5) % 5 = 4 % 5 = 4  (last song) ✓
// ---------------------------------------------------------------
export function getPrevSong(currentSongId) {
  const currentIndex = songsData.findIndex(song => song.id === currentSongId);
  const prevIndex = (currentIndex - 1 + songsData.length) % songsData.length;
  return songsData[prevIndex];
}

// ---------------------------------------------------------------
//  calculateProgress()
//  Given currentTime and duration, returns a % from 0 to 100
//
//  Example: currentTime=60, duration=200 → (60/200)*100 = 30%
// ---------------------------------------------------------------
export function calculateProgress(currentTime, duration) {
  if (!duration || duration === 0) return 0;
  return (currentTime / duration) * 100;
}

// ---------------------------------------------------------------
//  calculateSeekTime()
//  When user drags the seek bar to a % position,
//  calculate what actual time in seconds that maps to.
//
//  Example: percentage=50, duration=200 → (50/100)*200 = 100 sec
// ---------------------------------------------------------------
export function calculateSeekTime(percentage, duration) {
  return (percentage / 100) * duration;
}

// ---------------------------------------------------------------
//  getVolumeIcon()
//  Returns the right emoji based on volume level
// ---------------------------------------------------------------
export function getVolumeIcon(volume) {
  if (volume === 0) return "🔇";
  if (volume < 0.5) return "🔉";
  return "🔊";
}

// ---------------------------------------------------------------
//  REPEAT MODE — Constants
//  ---------------------------------------------------------------
//  Repeat has 3 states that cycle: NONE → ALL → ONE → NONE → ...
//  Using a plain object as an ENUM (named constants).
//
//  NONE = stop after last song
//  ALL  = loop the entire queue (same as current circular behavior)
//  ONE  = repeat the same song forever
// ---------------------------------------------------------------
export const RepeatMode = {
  NONE: "none",
  ALL:  "all",
  ONE:  "one",
};

// ---------------------------------------------------------------
//  cycleRepeatMode()
//  Returns the next repeat mode in the cycle
//  Uses a HASH MAP (object) to map current → next
//
//  Data structure: Object used as a state machine transition table
//  { "none" → "all", "all" → "one", "one" → "none" }
// ---------------------------------------------------------------
const repeatCycleMap = {
  [RepeatMode.NONE]: RepeatMode.ALL,
  [RepeatMode.ALL]:  RepeatMode.ONE,
  [RepeatMode.ONE]:  RepeatMode.NONE,
};

export function cycleRepeatMode(currentMode) {
  return repeatCycleMap[currentMode] || RepeatMode.NONE;
}

// ---------------------------------------------------------------
//  shuffleArray() — Fisher-Yates Shuffle Algorithm
//  ---------------------------------------------------------------
//  ALGORITHM: Fisher-Yates (also called Knuth Shuffle)
//
//  PURPOSE: Randomly reorder an array so every permutation
//           is equally likely (unbiased shuffle).
//
//  HOW IT WORKS:
//  Start from the LAST element and go backward.
//  For each position i, pick a random index j from [0, i].
//  Swap elements at positions i and j.
//
//  Example with [A, B, C, D]:
//  Step 1: i=3, pick random j from [0,3], say j=1 → swap D↔B → [A,D,C,B]
//  Step 2: i=2, pick random j from [0,2], say j=0 → swap C↔A → [C,D,A,B]
//  Step 3: i=1, pick random j from [0,1], say j=1 → swap D↔D → [C,D,A,B]
//  Done!
//
//  TIME COMPLEXITY: O(n) — one pass through the array
//  SPACE COMPLEXITY: O(n) — creates a copy first (doesn't mutate input)
//
//  WHY Fisher-Yates and not sort(() => Math.random() - 0.5)?
//  - sort-based shuffle is BIASED — some orderings are more likely
//  - Fisher-Yates guarantees uniform distribution
// ---------------------------------------------------------------
export function shuffleArray(array) {
  // Step 1: Create a COPY so we don't mutate the original array
  const shuffled = [...array];

  // Step 2: Loop from the last element down to the second
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at positions i and j
    // Using destructuring swap: [a, b] = [b, a]
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// ---------------------------------------------------------------
//  getNextSongFromQueue() / getPrevSongFromQueue()
//  Same circular queue logic, but operates on ANY queue (array)
//  This allows us to pass in either the original or shuffled queue
//
//  DATA STRUCTURE: Circular Queue (same as before, but flexible)
// ---------------------------------------------------------------
export function getNextSongFromQueue(currentSongId, queue) {
  const currentIndex = queue.findIndex(song => song.id === currentSongId);
  if (currentIndex === -1) return queue[0]; // fallback to first
  const nextIndex = (currentIndex + 1) % queue.length;
  return queue[nextIndex];
}

export function getPrevSongFromQueue(currentSongId, queue) {
  const currentIndex = queue.findIndex(song => song.id === currentSongId);
  if (currentIndex === -1) return queue[0]; // fallback to first
  const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
  return queue[prevIndex];
}

// ---------------------------------------------------------------
//  handleRepeatOnEnd()
//  Decides what happens when a song finishes playing
//
//  Returns: { action: "repeat" | "next" | "stop" }
//  - "repeat" = play the same song again (RepeatMode.ONE)
//  - "next"   = advance to next song (RepeatMode.ALL or songs remaining)
//  - "stop"   = stop playback (RepeatMode.NONE and at last song)
//
//  This is PURE LOGIC — the React context decides what to do
//  with each action.
// ---------------------------------------------------------------
export function handleRepeatOnEnd(repeatMode, currentSongId, queue) {
  if (repeatMode === RepeatMode.ONE) {
    return { action: "repeat" };
  }

  const currentIndex = queue.findIndex(song => song.id === currentSongId);
  const isLastSong = currentIndex === queue.length - 1;

  if (repeatMode === RepeatMode.ALL) {
    return { action: "next" }; // circular — always go next
  }

  // RepeatMode.NONE
  if (isLastSong) {
    return { action: "stop" }; // end of queue, stop playing
  }
  return { action: "next" };
}

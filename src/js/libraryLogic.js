// ============================================================
//  FILE: src/js/libraryLogic.js
//  PURPOSE: All logic for liked songs and playlists
//
//  DATA STRUCTURES USED:
//
//  1. SET — for liked songs
//  ---------------------------------------------------------------
//  A Set is a collection that stores UNIQUE values only.
//  - If you add the same value twice, it only stores it ONCE.
//  - Very fast to check: "Is this item in the set?" → O(1) time
//  - We use it for liked song IDs because:
//    → You can't like the same song twice
//    → We only care IF a song is liked, not in what order
//
//  JavaScript Set methods used:
//    set.has(id)    → returns true/false (is this id liked?)
//    set.add(id)    → adds id to the set
//    set.delete(id) → removes id from the set
//
//  NOTE: localStorage can't store a Set directly,
//        so we convert: Set ↔ Array when saving/loading
//
//  2. HASH MAP (Object) — for playlists
//  ---------------------------------------------------------------
//  A Hash Map stores data as KEY → VALUE pairs.
//  - Very fast to look up a value by its key → O(1) time
//  - We store each playlist's songs as: playlistId → [songIds]
//
//  JavaScript Object (used as a HashMap):
//    obj[key] = value   → insert
//    obj[key]           → lookup
//    delete obj[key]    → remove
//
//  3. ARRAY — for the list of all playlists
//  ---------------------------------------------------------------
//  We store the playlist metadata (id, name) in an Array
//  so we can loop through them in order.
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "./storageHelper.js";

// ============================================================

// ---------------------------------------------------------------
//  LIKED SONGS — using a SET
// ---------------------------------------------------------------

// Load liked song IDs from localStorage into a Set
// localStorage stores strings, so we parse the JSON first
export function loadLikedSongs() {
  const asArray = loadFromStorage(STORAGE_KEYS.LIKED_SONGS);
  if (!asArray) return new Set(); // empty Set if nothing saved

  // Convert the saved Array back into a Set
  // Example: [1,3,5] → Set {1, 3, 5}
  return new Set(asArray);
}

// Save liked songs Set to localStorage
// Sets can't be stored directly → convert to Array first
export function saveLikedSongs(likedSet) {
  // Convert Set to Array: Set{1,3,5} → [1,3,5]
  const asArray = Array.from(likedSet);
  saveToStorage(STORAGE_KEYS.LIKED_SONGS, asArray);
}

// Check if a song is liked — O(1) time (very fast!)
export function isSongLiked(likedSet, songId) {
  return likedSet.has(songId); // Set.has() is O(1)
}

// Toggle like: if liked → remove, if not liked → add
// Returns a NEW Set (we don't mutate the original — React best practice)
export function toggleLikeSong(likedSet, songId) {
  const newSet = new Set(likedSet); // copy the Set first

  if (newSet.has(songId)) {
    newSet.delete(songId); // remove from Set
  } else {
    newSet.add(songId);    // add to Set
  }

  return newSet; // return updated Set
}

// ---------------------------------------------------------------
//  PLAYLISTS — using ARRAY + HASH MAP
// ---------------------------------------------------------------

// Load all playlists from localStorage
// Returns an Array of playlist objects: [{ id, name, songIds:[] }]
export function loadPlaylists() {
  const saved = loadFromStorage(STORAGE_KEYS.PLAYLISTS);
  return saved ? saved : []; // empty Array if nothing saved
}

// Save playlists Array to localStorage
export function savePlaylists(playlists) {
  saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists);
}

// Create a new playlist and return the updated Array
// DATA STRUCTURE: We use Date.now() as a unique ID (like a hash key)
export function createPlaylist(playlists, name) {
  if (!name || !name.trim()) return playlists; // ignore empty name

  const newPlaylist = {
    id: Date.now(),    // unique numeric ID (timestamp = always unique)
    name: name.trim(),
    songIds: []        // empty Array — no songs yet
  };

  // Return a NEW array with the new playlist added at the end
  return [...playlists, newPlaylist];
}

// Add a song to a playlist
// DATA STRUCTURE: We use .map() to find the right playlist,
//                 then spread its songIds with the new one added.
//
// .map() goes through EACH playlist (like traversing a linked list)
// and returns either the updated one or the original.
export function addSongToPlaylist(playlists, playlistId, songId) {
  return playlists.map(playlist => {
    if (playlist.id === playlistId) {
      // Don't add duplicate songs — check with .includes() first
      if (playlist.songIds.includes(songId)) return playlist;

      return {
        ...playlist,                          // copy everything else
        songIds: [...playlist.songIds, songId] // add new songId at end
      };
    }
    return playlist; // not this playlist → return unchanged
  });
}

// Remove a song from a playlist
// We use .filter() to keep all songIds EXCEPT the one to remove
export function removeSongFromPlaylist(playlists, playlistId, songId) {
  return playlists.map(playlist => {
    if (playlist.id === playlistId) {
      return {
        ...playlist,
        songIds: playlist.songIds.filter(id => id !== songId) // remove it
      };
    }
    return playlist;
  });
}

// Delete an entire playlist from the Array
// .filter() keeps everything EXCEPT the deleted playlist
export function deletePlaylist(playlists, playlistId) {
  return playlists.filter(p => p.id !== playlistId);
}

// Rename a playlist
export function renamePlaylist(playlists, playlistId, newName) {
  if (!newName.trim()) return playlists;
  return playlists.map(p =>
    p.id === playlistId ? { ...p, name: newName.trim() } : p
  );
}

// Get a single playlist by id — HASH MAP style lookup
// Instead of looping, .find() stops as soon as it finds the match
export function getPlaylistById(playlists, playlistId) {
  return playlists.find(p => p.id == playlistId); // == handles string/number mismatch from URL
}

// ============================================================
//  FILE: src/js/searchLogic.js
//  PURPOSE: All logic for searching and filtering songs
//
//  ALGORITHM USED: LINEAR SEARCH
//  ---------------------------------------------------------------
//  Linear Search goes through EACH item one by one
//  and checks if it matches the condition.
//
//  Time Complexity: O(n) — where n = number of songs
//  This means if you have 100 songs, it checks all 100.
//
//  WHY Linear Search here (not Binary Search)?
//  - Binary Search needs the data to be SORTED first
//  - Our search is by partial text match (not exact equality)
//  - For a small music library (< 1000 songs), O(n) is fine
//
//  JavaScript's .filter() implements Linear Search internally:
//  It goes through each element, runs your test function,
//  and collects all items where the test returns TRUE.
//
//  DATA STRUCTURE: ARRAY (input and output are both Arrays)
// ============================================================

import songsData from "./songsData.js";

// ---------------------------------------------------------------
//  SONG MAP — Hash Map for O(1) lookups by ID
//  ---------------------------------------------------------------
//  DATA STRUCTURE: MAP (Hash Map)
//  Instead of searching through the entire Array each time,
//  we build a Map once at startup: songId → songObject
//
//  Map.get(id) is O(1) — instant lookup regardless of array size.
//  Compare to Array.find() which is O(n) — scans every element.
//
//  Built once, used everywhere that needs to look up a song by ID.
// ---------------------------------------------------------------
const songMap = new Map(songsData.map(song => [song.id, song]));

// ---------------------------------------------------------------
//  searchSongs()
//  Searches songs by title, artist, album, or genre
//
//  HOW IT WORKS (Linear Search):
//  1. Convert the query to lowercase (so search is case-insensitive)
//  2. Loop through EVERY song (that's the "linear" part)
//  3. For each song, check if any field contains the query
//  4. If yes → include in results. If no → skip.
//
//  Example:
//  query = "wave"
//  → checks song1: "The Wavelengths".includes("wave") → TRUE ✓
//  → checks song2: "Neon Pulse".includes("wave")      → FALSE ✗
//  → Result: [song1]
// ---------------------------------------------------------------
export function searchSongs(query) {
  // If query is empty, return ALL songs (no filter needed)
  if (!query || !query.trim()) return songsData;

  const lowerQuery = query.toLowerCase(); // "Wave" → "wave"

  // .filter() = Linear Search through the Array
  return songsData.filter(song => {
    return (
      song.title.toLowerCase().includes(lowerQuery)  ||  // check title
      song.artist.toLowerCase().includes(lowerQuery) ||  // check artist
      song.album.toLowerCase().includes(lowerQuery)  ||  // check album
      song.genre.toLowerCase().includes(lowerQuery)      // check genre
    );
  });
  // Time: O(n) — goes through all n songs one by one
}

// ---------------------------------------------------------------
//  getUniqueGenres()
//  Returns a list of genres without duplicates
//
//  DATA STRUCTURE: SET (for removing duplicates)
//
//  Step 1: .map() → extract just the genre from each song
//          ["Pop", "Electronic", "Pop", "Folk"] ← has duplicates
//
//  Step 2: new Set(...) → automatically removes duplicates
//          Set {"Pop", "Electronic", "Folk"}
//
//  Step 3: Array.from() → convert Set back to Array
//          ["Pop", "Electronic", "Folk"]
// ---------------------------------------------------------------
export function getUniqueGenres() {
  const allGenres = songsData.map(song => song.genre); // Step 1
  const uniqueGenres = new Set(allGenres);              // Step 2 (Set removes duplicates)
  return Array.from(uniqueGenres);                      // Step 3
}

// ---------------------------------------------------------------
//  filterByGenre()
//  Returns only songs that match a specific genre
//
//  Also a Linear Search — O(n)
// ---------------------------------------------------------------
export function filterByGenre(genre) {
  return songsData.filter(song => song.genre === genre);
}

// ---------------------------------------------------------------
//  getSongById()
//  Finds ONE song by its ID
//
//  ALGORITHM: Hash Map lookup — O(1) constant time
//  Uses the pre-built songMap instead of scanning the array.
//  songMap.get(id) returns the song object instantly.
// ---------------------------------------------------------------
export function getSongById(id) {
  return songMap.get(id);  // O(1) — Hash Map lookup
}

// ---------------------------------------------------------------
//  getSongsByIds()
//  Given an array of song IDs, returns those song objects
//  Used by Playlist and Liked Songs pages
//
//  DATA STRUCTURE: Uses the pre-built SONG MAP for O(1) per lookup
//  Total time: O(n) where n = number of IDs
//  (Previously O(n × m) where m = total songs)
// ---------------------------------------------------------------
export function getSongsByIds(idsArray) {
  return idsArray
    .map(id => songMap.get(id))       // O(1) lookup per ID via Map
    .filter(song => song !== undefined); // remove any not found
}

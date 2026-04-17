// ============================================================
//  FILE: src/pages/LikedSongs.jsx
//  PURPOSE: FRONTEND ONLY — Shows all liked songs
//
//  LOGIC used from: src/js/libraryLogic.js (via LibraryContext)
//  - likedSongs (SET)        → set of liked song IDs
//
//  LOGIC used from: src/js/searchLogic.js
//  - getSongsByIds()         → converts SET of IDs → Array of song objects
//
//  HOW IT WORKS:
//  1. likedSongs is a SET of IDs like: Set{1, 3, 5}
//  2. We convert it to an Array: [1, 3, 5]
//  3. getSongsByIds() does LINEAR SEARCH to find each song object
//  4. We render the results as SongCards
//
//  WHY SET for liked songs?
//  - O(1) to check if a song is liked → instant heart button toggle
//  - Automatically prevents duplicates → can't like same song twice
// ============================================================

import React from "react";
import { useLibrary } from "../context/LibraryContext";
import { getSongsByIds } from "../js/searchLogic.js";
import SongCard from "../components/SongCard";
import "./LikedSongs.css";

function LikedSongs() {
  const { likedSongs } = useLibrary();

  // likedSongs is a SET → convert to Array first, then fetch song objects
  // SET  →  Array.from(likedSongs)  →  [1, 3, 5]
  // Array of IDs  →  getSongsByIds()  →  [songObj, songObj, songObj]
  const likedSongObjects = getSongsByIds(Array.from(likedSongs));

  return (
    <div className="liked-page">
      <div className="liked-header">
        <div className="liked-header__icon">❤️</div>
        <div className="liked-header__info">
          <p className="liked-header__label">Playlist</p>
          <h1 className="liked-header__title">Liked Songs</h1>
          <p className="liked-header__count">
            {/* likedSongs.size → SETs use .size (not .length like Arrays) */}
            {likedSongs.size} {likedSongs.size === 1 ? "song" : "songs"}
          </p>
        </div>
      </div>

      {likedSongs.size === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🤍</p>
          <p>No liked songs yet.</p>
          <p>Click the heart icon on any song to add it here!</p>
        </div>
      ) : (
        <div className="songs-grid">
          {/* likedSongObjects is an Array → .map() to render each card */}
          {likedSongObjects.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LikedSongs;

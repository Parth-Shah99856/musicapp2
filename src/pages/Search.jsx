// ============================================================
//  FILE: src/pages/Search.jsx
//  PURPOSE: FRONTEND ONLY — Search and filter songs
//
//  LOGIC used from: src/js/searchLogic.js
//  - searchSongs(query) → LINEAR SEARCH through songs array
//  - getUniqueGenres()  → SET to get unique genres for browse cards
//
//  HOW SEARCH WORKS (step by step):
//  1. User types in the input box
//  2. React re-renders because searchQuery state changed
//  3. searchSongs(query) runs — Linear Search through all songs
//  4. Only matching songs are returned → displayed in the grid
//
//  TIME COMPLEXITY: O(n) where n = number of songs
//  This means every keystroke scans all songs once.
//  For a small library this is perfectly fast.
// ============================================================

import React, { useState } from "react";
import { searchSongs, getUniqueGenres } from "../js/searchLogic.js";
import SongCard from "../components/SongCard";
import "./Search.css";

function Search() {
  // searchQuery is the current text in the search box
  const [searchQuery, setSearchQuery] = useState("");

  // searchSongs() from searchLogic.js runs LINEAR SEARCH
  // Returns filtered Array every time searchQuery changes
  const results = searchSongs(searchQuery);

  // getUniqueGenres() uses SET → Array (shown when search is empty)
  const genres = getUniqueGenres();

  // Genre card colors (one per genre, loops if more genres than colors)
  const genreColors = ["#e91429", "#0d73ec", "#1db954", "#ff6437", "#8400e7", "#d84000"];

  return (
    <div className="search-page">
      <h1 className="page-title">Search</h1>

      {/* Search input box */}
      <div className="search-bar-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search songs, artists, albums, genres..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
        )}
      </div>

      {/* Show search results when typing */}
      {searchQuery ? (
        <div>
          <h2 className="section-title">
            {results.length === 0
              ? "No results found"
              : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </h2>
          {results.length > 0 && (
            <div className="songs-grid">
              {/* results is the filtered Array from searchSongs() */}
              {results.map(song => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
          {results.length === 0 && (
            <p className="no-results-hint">Try a different song name, artist, or genre.</p>
          )}
        </div>
      ) : (
        /* Show genre browse cards when not searching */
        <div>
          <h2 className="section-title">Browse by Genre</h2>
          <div className="genre-grid">
            {/* genres is an Array (converted from SET in searchLogic.js) */}
            {genres.map((genre, index) => (
              <div
                key={genre}
                className="genre-card"
                style={{ backgroundColor: genreColors[index % genreColors.length] }}
                onClick={() => setSearchQuery(genre)} // clicking a genre searches it
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;

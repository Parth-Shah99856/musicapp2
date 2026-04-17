// ============================================================
//  FILE: src/pages/Home.jsx
//  PURPOSE: FRONTEND ONLY — Homepage with song collection
//
//  LOGIC used from: src/js/searchLogic.js
//  - getUniqueGenres() → uses a SET to remove duplicate genres
//  - filterByGenre()   → LINEAR SEARCH through songs array
//
//  DATA STRUCTURES shown here:
//  - songsData is an ARRAY → we .map() it to render SongCards
//  - genres is an ARRAY (converted from a SET) → grouped sections
//
//  PERFORMANCE: useMemo() caches genre list and filtered songs
//  so they aren't recalculated on every render.
// ============================================================

import React, { useMemo } from "react";
import songsData from "../js/songsData.js";
import { getUniqueGenres, filterByGenre } from "../js/searchLogic.js";
import SongCard from "../components/SongCard";
import "./Home.css";

function Home() {
  // useMemo caches the result — only recalculates if songsData changes
  // getUniqueGenres() uses SET internally to remove duplicates
  const genres = useMemo(() => getUniqueGenres(), []);

  // Pre-compute genre sections to avoid calling filterByGenre on every render
  const genreSections = useMemo(() => {
    return genres.map(genre => ({
      genre,
      songs: filterByGenre(genre), // LINEAR SEARCH — cached by useMemo
    }));
  }, [genres]);

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Good vibes 🎶</h1>
        <p>Your music collection</p>
      </div>

      {/* All Songs — loop through the songsData ARRAY with .map() */}
      <section className="home-section">
        <h2 className="section-title">All Songs</h2>
        <div className="songs-grid">
          {songsData.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>

      {/* Group songs by genre — using memoized genreSections */}
      {genreSections.map(({ genre, songs }) => (
        <section key={genre} className="home-section">
          <h2 className="section-title">{genre}</h2>
          <div className="songs-grid">
            {songs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Home;

// ============================================================
//  FILE: src/components/Sidebar.jsx
//  PURPOSE: FRONTEND ONLY — Left navigation panel
//
//  LOGIC used from: src/js/libraryLogic.js (via LibraryContext)
//  - createPlaylist() → makes a new playlist
//  - playlists (Array) → lists all playlists in sidebar
//
//  RESPONSIVE: On mobile (≤768px), sidebar becomes an overlay
//  toggled by a hamburger button.
// ============================================================

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import "./Sidebar.css";

function Sidebar() {
  const { playlists, createPlaylist } = useLibrary();
  const navigate = useNavigate();

  const [showInput, setShowInput]         = useState(false);
  const [newPlaylistName, setNewPlaylist] = useState("");
  const [mobileOpen, setMobileOpen]       = useState(false);

  function handleCreate() {
    if (showInput && newPlaylistName.trim()) {
      // Calls createPlaylist() from libraryLogic.js
      // DATA STRUCTURE: adds a new object to the playlists ARRAY
      createPlaylist(newPlaylistName);
      setNewPlaylist("");
      setShowInput(false);
    } else {
      setShowInput(true);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter")  handleCreate();
    if (e.key === "Escape") { setShowInput(false); setNewPlaylist(""); }
  }

  // Close sidebar on navigation (mobile)
  function handleNavClick() {
    if (window.innerWidth <= 768) setMobileOpen(false);
  }

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Overlay backdrop — visible only on mobile when sidebar is open */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="sidebar-logo">🎵 MusicApp</div>

        <nav className="sidebar-nav">
          <NavLink to="/"        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={handleNavClick}>🏠 Home</NavLink>
          <NavLink to="/search"  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={handleNavClick}>🔍 Search</NavLink>
          <NavLink to="/library" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={handleNavClick}>📚 Your Library</NavLink>
        </nav>

        <div className="sidebar-divider" />

        <NavLink to="/liked" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={handleNavClick}>❤️ Liked Songs</NavLink>

        <div className="sidebar-divider" />

        <div className="playlists-header">
          <span>Playlists</span>
          <button className="add-playlist-btn" onClick={handleCreate} title="New Playlist" aria-label="Create new playlist">+</button>
        </div>

        {showInput && (
          <input
            className="new-playlist-input"
            type="text"
            placeholder="Playlist name..."
            value={newPlaylistName}
            onChange={e => setNewPlaylist(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="New playlist name"
          />
        )}

        {/* Loop through the playlists ARRAY and render each one */}
        <div className="playlist-list">
          {playlists.length === 0 && !showInput && (
            <p className="no-playlists">No playlists yet. Click + to create one!</p>
          )}
          {playlists.map(playlist => (
            <button
              key={playlist.id}
              className="playlist-item"
              onClick={() => { navigate(`/playlist/${playlist.id}`); handleNavClick(); }}
              aria-label={`Open playlist ${playlist.name}`}
            >
              📋 {playlist.name}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

// ============================================================
//  FILE: src/pages/Library.jsx
//  PURPOSE: FRONTEND ONLY — Shows all your playlists
//
//  LOGIC used from: src/js/libraryLogic.js (via LibraryContext)
//  - playlists (ARRAY)        → list of all playlist objects
//  - createPlaylist()         → adds to Array, saves to localStorage
//  - deletePlaylist()         → filters Array, saves to localStorage
//  - renamePlaylist()         → maps Array, saves to localStorage
//
//  DATA STRUCTURE shown:
//  - playlists = ARRAY of objects: [{id, name, songIds:[]}, ...]
//  - We loop with .map() to render each playlist card
//  - songIds inside each playlist is also an ARRAY
// ============================================================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import "./Library.css";

function Library() {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = useLibrary();
  const navigate = useNavigate();

  const [newName, setNewName]       = useState("");
  const [showInput, setShowInput]   = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameVal] = useState("");

  function handleCreate() {
    if (newName.trim()) {
      // createPlaylist() from libraryLogic.js → adds to playlists ARRAY
      createPlaylist(newName);
      setNewName("");
      setShowInput(false);
    }
  }

  function handleRenameSubmit(id) {
    // renamePlaylist() from libraryLogic.js → .map() over playlists ARRAY
    renamePlaylist(id, renameValue);
    setRenamingId(null);
  }

  function handleDelete(id) {
    // deletePlaylist() from libraryLogic.js → .filter() over playlists ARRAY
    deletePlaylist(id);
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="page-title">Your Library</h1>
        <button className="create-btn" onClick={() => setShowInput(!showInput)}>
          + New Playlist
        </button>
      </div>

      {showInput && (
        <div className="new-playlist-form">
          <input
            type="text"
            className="form-input"
            placeholder="Enter playlist name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowInput(false); }}
            autoFocus
          />
          <button className="form-btn form-btn--green" onClick={handleCreate}>Create</button>
          <button className="form-btn" onClick={() => setShowInput(false)}>Cancel</button>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p>You have no playlists yet.</p>
          <p>Click <strong>+ New Playlist</strong> to create one!</p>
        </div>
      ) : (
        <div className="playlist-grid">
          {/* Loop through playlists ARRAY with .map() */}
          {playlists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
              <div className="playlist-card__cover" onClick={() => navigate(`/playlist/${playlist.id}`)}>
                📋
              </div>

              <div className="playlist-card__info">
                {renamingId === playlist.id ? (
                  <input
                    className="rename-input"
                    value={renameValue}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleRenameSubmit(playlist.id); if (e.key === "Escape") setRenamingId(null); }}
                    onBlur={() => handleRenameSubmit(playlist.id)}
                    autoFocus
                  />
                ) : (
                  <p className="playlist-card__name" onClick={() => navigate(`/playlist/${playlist.id}`)}>
                    {playlist.name}
                  </p>
                )}
                {/* playlist.songIds is an ARRAY → .length gives count */}
                <p className="playlist-card__count">
                  {playlist.songIds.length} {playlist.songIds.length === 1 ? "song" : "songs"}
                </p>
              </div>

              <div className="playlist-card__actions">
                <button className="icon-btn" onClick={() => { setRenamingId(playlist.id); setRenameVal(playlist.name); }} title="Rename">✏️</button>
                <button className="icon-btn" onClick={() => handleDelete(playlist.id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Library;

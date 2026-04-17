// ============================================================
//  FILE: src/pages/PlaylistDetail.jsx
//  PURPOSE: FRONTEND ONLY — Shows songs inside one playlist
//
//  LOGIC used from: src/js/libraryLogic.js (via LibraryContext)
//  - getPlaylistById()        → finds one playlist by ID (Linear Search)
//  - removeFromPlaylist()     → removes song ID from songIds Array
//  - deletePlaylist()         → removes playlist from playlists Array
//
//  LOGIC used from: src/js/searchLogic.js
//  - getSongsByIds()          → converts array of IDs → song objects
//
//  DATA STRUCTURES shown:
//  - playlist.songIds is an ARRAY of song IDs: [2, 5, 7]
//  - getSongsByIds() searches the songs Array to get full objects
//  - Result is displayed as a numbered list
// ============================================================

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { getSongsByIds } from "../js/searchLogic.js";
import { usePlayer } from "../context/PlayerContext";
import "./PlaylistDetail.css";

function PlaylistDetail() {
  // useParams reads :id from the URL, e.g. /playlist/1712345678
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlaylistById, removeFromPlaylist, deletePlaylist } = useLibrary();
  const { playSong, currentSong, isPlaying, formatTime } = usePlayer();

  // getPlaylistById() from libraryLogic.js — Linear Search through playlists Array
  const playlist = getPlaylistById(id);

  if (!playlist) {
    return (
      <div className="playlist-detail-page">
        <button className="back-btn" onClick={() => navigate("/library")}>← Back</button>
        <div className="empty-state"><p>Playlist not found.</p></div>
      </div>
    );
  }

  // playlist.songIds = Array of IDs like [2, 5, 7]
  // getSongsByIds() → Linear Search to convert IDs → full song objects
  const playlistSongs = getSongsByIds(playlist.songIds);

  function handleDelete() {
    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
      // deletePlaylist() from libraryLogic.js → .filter() on playlists Array
      deletePlaylist(playlist.id);
      navigate("/library");
    }
  }

  return (
    <div className="playlist-detail-page">
      <button className="back-btn" onClick={() => navigate("/library")}>← Back to Library</button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header__icon">📋</div>
        <div className="detail-header__info">
          <p className="detail-header__label">Playlist</p>
          <h1 className="detail-header__title">{playlist.name}</h1>
          {/* playlist.songIds.length → Array .length gives count */}
          <p className="detail-header__count">
            {playlistSongs.length} {playlistSongs.length === 1 ? "song" : "songs"}
          </p>
          <button className="delete-playlist-btn" onClick={handleDelete}>🗑️ Delete Playlist</button>
        </div>
      </div>

      {playlistSongs.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🎵</p>
          <p>This playlist is empty.</p>
          <p>Click ➕ on any song to add it here!</p>
        </div>
      ) : (
        <div className="detail-song-list">
          {/* playlistSongs is an Array → .map() with index for numbering */}
          {playlistSongs.map((song, index) => {
            const isActive = currentSong.id === song.id;
            return (
              <div
                key={song.id}
                className={`detail-song-row ${isActive ? "detail-song-row--active" : ""}`}
                onClick={() => playSong(song)}
              >
                {/* Index = position in the Array (0-based → show as 1-based) */}
                <span className="detail-song-num">
                  {isActive && isPlaying ? "▶" : index + 1}
                </span>

                <div className="detail-song-info">
                  <img
                    src={song.cover}
                    alt={song.album}
                    className="detail-song-cover"
                    onError={e => { e.target.src = "https://via.placeholder.com/48x48/282828/1db954?text=♪"; }}
                  />
                  <div>
                    <p className={`detail-song-title ${isActive ? "detail-song-title--green" : ""}`}>{song.title}</p>
                    <p className="detail-song-artist">{song.artist}</p>
                  </div>
                </div>

                <p className="detail-song-album">{song.album}</p>

                {/* removeFromPlaylist() from libraryLogic.js → .filter() on songIds Array */}
                <button
                  className="remove-btn"
                  onClick={e => { e.stopPropagation(); removeFromPlaylist(playlist.id, song.id); }}
                  title="Remove from playlist"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PlaylistDetail;

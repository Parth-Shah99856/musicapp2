// ============================================================
//  FILE: src/components/SongCard.jsx
//  PURPOSE: FRONTEND ONLY — displays one song as a card
//
//  LOGIC used from:
//  - src/js/playerLogic.js  → formatTime() for duration display
//  - src/js/libraryLogic.js → isSongLiked(), toggleLikeSong()
//                             addSongToPlaylist()
//
//  DATA STRUCTURES shown here:
//  - playlists is an ARRAY → we .map() it to build the dropdown
//  - isLiked() uses a SET internally → O(1) check
// ============================================================

import React, { useState } from "react";
import { usePlayer }  from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import "./SongCard.css";

function SongCard({ song }) {
  const { currentSong, isPlaying, playSong, formatTime } = usePlayer();
  const { isLiked, toggleLike, playlists, addToPlaylist } = useLibrary();

  const [showDropdown, setShowDropdown] = useState(false);

  const isCurrentSong = currentSong.id === song.id;

  return (
    <div
      className={`song-card ${isCurrentSong ? "song-card--active" : ""}`}
      onClick={() => playSong(song)}
    >
      {/* Cover image */}
      <div className="song-card__cover-wrap">
        <img
          src={song.cover}
          alt={song.album}
          className="song-card__cover"
          onError={e => { e.target.src = "https://via.placeholder.com/160x160/282828/1db954?text=♪"; }}
        />
        <button
          className={`song-card__play-btn ${isCurrentSong && isPlaying ? "song-card__play-btn--visible" : ""}`}
          onClick={e => { e.stopPropagation(); playSong(song); }}
          aria-label={isCurrentSong && isPlaying ? "Pause" : `Play ${song.title}`}
        >
          {isCurrentSong && isPlaying ? "⏸" : "▶"}
        </button>
      </div>

      {/* Song info */}
      <div className="song-card__info">
        <p className={`song-card__title ${isCurrentSong ? "song-card__title--green" : ""}`}>{song.title}</p>
        <p className="song-card__artist">{song.artist}</p>
      </div>

      {/* Action row */}
      <div className="song-card__actions" onClick={e => e.stopPropagation()}>
        {/* formatTime() from playerLogic.js: seconds → "m:ss" */}
        <span className="song-card__duration">{formatTime(song.duration)}</span>

        {/* toggleLike uses SET from libraryLogic.js — O(1) */}
        <button
          className={`action-btn ${isLiked(song.id) ? "action-btn--liked" : ""}`}
          onClick={() => toggleLike(song.id)}
          aria-label={isLiked(song.id) ? `Unlike ${song.title}` : `Like ${song.title}`}
        >
          {isLiked(song.id) ? "❤️" : "🤍"}
        </button>

        {/* Add to playlist dropdown — loops through playlists ARRAY */}
        <div className="dropdown-wrap">
          <button className="action-btn" onClick={() => setShowDropdown(!showDropdown)} aria-label="Add to playlist">➕</button>
          {showDropdown && (
            <div className="dropdown-menu">
              {playlists.length === 0 ? (
                <p className="dropdown-empty">No playlists yet!</p>
              ) : (
                // .map() loops through the playlists Array to build buttons
                playlists.map(p => (
                  <button
                    key={p.id}
                    className="dropdown-item"
                    onClick={() => { addToPlaylist(p.id, song.id); setShowDropdown(false); }}
                  >
                    📋 {p.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SongCard;

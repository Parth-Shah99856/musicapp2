// ============================================================
//  FILE: src/components/Player.jsx
//  PURPOSE: FRONTEND ONLY — Bottom music player bar
//
//  LOGIC used from: src/js/playerLogic.js (via PlayerContext)
//  - togglePlay()        → play / pause
//  - nextSong()          → move to next song (respects shuffle queue)
//  - prevSong()          → move to prev song (respects shuffle queue)
//  - seekTo()            → calculateSeekTime() converts % → seconds
//  - formatTime()        → converts seconds → "m:ss" string
//  - getVolumeIcon()     → returns correct emoji for volume level
//  - toggleShuffle()     → on/off shuffle (Fisher-Yates in playerLogic.js)
//  - handleCycleRepeat() → cycles: none → all → one (state machine)
//  - toggleMute()        → mute / unmute
//
//  KEYBOARD SHORTCUTS (handled in PlayerContext via keyboardShortcuts.js):
//  Space=play/pause, ←/→=prev/next, ↑/↓=volume, M=mute, S=shuffle, R=repeat
// ============================================================

import React from "react";
import { usePlayer }  from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { RepeatMode } from "../js/playerLogic.js";
import "./Player.css";

function Player() {
  const {
    currentSong, isPlaying, progress, currentTime, duration, volume, isLoading,
    shuffleMode, repeatMode,
    setVolume, togglePlay, nextSong, prevSong, seekTo,
    toggleShuffle, handleCycleRepeat, toggleMute,
    formatTime, getVolumeIcon,
  } = usePlayer();

  const { isLiked, toggleLike } = useLibrary();

  // Repeat button label changes based on mode
  const getRepeatLabel = () => {
    switch (repeatMode) {
      case RepeatMode.ONE:  return "🔂"; // repeat one
      case RepeatMode.ALL:  return "🔁"; // repeat all
      default:              return "🔁"; // same icon, different opacity via CSS
    }
  };

  return (
    <div className="player-bar">

      {/* ── LEFT: Current song info ── */}
      <div className="player-song-info">
        <img
          src={currentSong.cover}
          alt={currentSong.album}
          className={`player-cover ${isPlaying ? "player-cover--spinning" : ""}`}
          onError={e => { e.target.src = "https://via.placeholder.com/56x56/282828/1db954?text=♪"; }}
        />
        <div className="player-song-text">
          <p className="player-song-title">{currentSong.title}</p>
          <p className="player-song-artist">{currentSong.artist}</p>
        </div>
        <button
          className={`player-like-btn ${isLiked(currentSong.id) ? "player-like-btn--active" : ""}`}
          onClick={() => toggleLike(currentSong.id)}
          aria-label={isLiked(currentSong.id) ? "Unlike song" : "Like song"}
        >
          {isLiked(currentSong.id) ? "❤️" : "🤍"}
        </button>
      </div>

      {/* ── MIDDLE: Controls + progress bar ── */}
      <div className="player-center">
        <div className="player-controls">
          {/* Shuffle toggle — uses Fisher-Yates from playerLogic.js */}
          <button
            className={`ctrl-btn ctrl-btn--small ${shuffleMode ? "ctrl-btn--active" : ""}`}
            onClick={toggleShuffle}
            aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
            title="Shuffle (S)"
          >
            🔀
          </button>

          {/* prevSong() uses getPrevSongFromQueue() from playerLogic.js */}
          <button className="ctrl-btn" onClick={prevSong} aria-label="Previous song" title="Previous (←)">⏮</button>

          {/* togglePlay() from playerLogic.js */}
          <button
            className={`ctrl-btn ctrl-btn--play ${isLoading ? "ctrl-btn--loading" : ""}`}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            title="Play/Pause (Space)"
          >
            {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
          </button>

          {/* nextSong() uses getNextSongFromQueue() from playerLogic.js */}
          <button className="ctrl-btn" onClick={nextSong} aria-label="Next song" title="Next (→)">⏭</button>

          {/* Repeat cycle — uses cycleRepeatMode() state machine from playerLogic.js */}
          <button
            className={`ctrl-btn ctrl-btn--small ${repeatMode !== RepeatMode.NONE ? "ctrl-btn--active" : ""}`}
            onClick={handleCycleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
            title="Repeat (R)"
          >
            {getRepeatLabel()}
            {repeatMode === RepeatMode.ONE && <span className="repeat-one-badge">1</span>}
          </button>
        </div>

        {/* Progress bar — seekTo() calls calculateSeekTime() from playerLogic.js */}
        <div className="player-progress">
          {/* formatTime() from playerLogic.js converts seconds → "m:ss" */}
          <span className="player-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="progress-slider"
            min="0" max="100"
            value={progress}
            onChange={e => seekTo(Number(e.target.value))}
            aria-label="Seek position"
          />
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ── RIGHT: Volume slider ── */}
      <div className="player-volume">
        {/* getVolumeIcon() from playerLogic.js picks the right emoji */}
        <button
          className="ctrl-btn ctrl-btn--small"
          onClick={toggleMute}
          aria-label={volume === 0 ? "Unmute" : "Mute"}
          title="Mute (M)"
        >
          {getVolumeIcon(volume)}
        </button>
        <input
          type="range"
          className="volume-slider"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>

    </div>
  );
}

export default Player;

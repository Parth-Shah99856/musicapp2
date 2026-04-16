// ============================================================
//  FILE: src/context/PlayerContext.jsx
//  PURPOSE: React "bridge" that connects playerLogic.js to
//           the UI components.
//
//  WHAT THIS FILE DOES:
//  - This is ONLY React code (useState, useEffect, useRef)
//  - All the actual LOGIC (next song, calculate progress, etc.)
//    is imported from src/js/playerLogic.js
//  - Think of this file as a "remote control" —
//    the buttons are here, but the actual machinery is in playerLogic.js
//
//  HOW CONTEXT WORKS:
//  - createContext() creates a "shared box"
//  - PlayerProvider wraps the whole app and fills that box
//  - Any component can call usePlayer() to access the box
// ============================================================

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import songsData from "../js/songsData.js";
import {
  formatTime,
  getNextSong,
  getPrevSong,
  calculateProgress,
  calculateSeekTime,
  getVolumeIcon,
  // New imports for shuffle & repeat (from playerLogic.js)
  RepeatMode,
  cycleRepeatMode,
  shuffleArray,
  getNextSongFromQueue,
  getPrevSongFromQueue,
  handleRepeatOnEnd,
} from "../js/playerLogic.js";  // ← all logic lives here

// Import audio generator (creates real playable music)
import { generateSongAudio } from "../js/audioGenerator.js";

// New import for keyboard shortcuts (from keyboardShortcuts.js)
import { getActionForKey, VOLUME_STEP } from "../js/keyboardShortcuts.js";

// Create the shared context box
const PlayerContext = createContext();

export function PlayerProvider({ children }) {

  // React state variables (these trigger re-renders when they change)
  const [currentSong, setCurrentSong] = useState(songsData[0]); // first song by default
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [progress,    setProgress]    = useState(0);   // 0–100 percentage
  const [currentTime, setCurrentTime] = useState(0);   // seconds
  const [duration,    setDuration]    = useState(0);   // seconds
  const [volume,      setVolume]      = useState(0.8); // 0.0–1.0
  const [isLoading,   setIsLoading]   = useState(false); // audio buffering state

  // Audio generation state
  // audioMap is a MAP: songId → blobURL for generated audio
  const [audioReady,  setAudioReady]  = useState(false);  // are songs generated?
  const [genProgress, setGenProgress] = useState(0);      // generation progress 0–8
  const audioMapRef = useRef(new Map()); // Map<songId, blobURL>
  const audioPromiseMapRef = useRef(new Map()); // Map<songId, Promise<string>>

  // Shuffle & Repeat state
  const [shuffleMode, setShuffleMode] = useState(false);          // on/off
  const [repeatMode,  setRepeatMode]  = useState(RepeatMode.ALL); // none/all/one
  const [queue,       setQueue]       = useState(songsData);      // current play queue

  // useRef gives us a direct reference to the <audio> HTML element
  const audioRef = useRef(null);

  // Ref to track isPlaying without stale closures
  // This solves the bug where useEffect captured an old isPlaying value
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  // Ref for previous volume (used for mute toggle)
  const prevVolumeRef = useRef(0.8);

  // Generates a song only once and reuses the same Promise for callers.
  const ensureSongAudio = useCallback(async (song) => {
    const existingUrl = audioMapRef.current.get(song.id);
    if (existingUrl) return existingUrl;

    const existingPromise = audioPromiseMapRef.current.get(song.id);
    if (existingPromise) return existingPromise;

    const generationPromise = generateSongAudio(song.id, song.genre, song.duration)
      .then((blobUrl) => {
        audioMapRef.current.set(song.id, blobUrl);
        setGenProgress(audioMapRef.current.size);
        return blobUrl;
      })
      .finally(() => {
        audioPromiseMapRef.current.delete(song.id);
      });

    audioPromiseMapRef.current.set(song.id, generationPromise);
    return generationPromise;
  }, []);

  // ── AUDIO GENERATION STRATEGY ──
  // 1) Do not block player startup.
  // 2) Generate the current song first (on-demand).
  // 3) Warm the rest in the background.
  useEffect(() => {
    let cancelled = false;
    setAudioReady(true); // Player controls are available immediately.

    ensureSongAudio(currentSong).catch(() => {});

    async function warmRemainingSongs() {
      for (let i = 0; i < songsData.length; i++) {
        if (cancelled) return;
        const song = songsData[i];
        if (song.id === currentSong.id) continue;

        // Yield to the main thread between songs so UI remains responsive.
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (cancelled) return;
        await ensureSongAudio(song).catch(() => {});
      }
    }

    warmRemainingSongs();
    return () => { cancelled = true; };
  }, [currentSong, ensureSongAudio]);

  // When currentSong changes → load the new audio source
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Use generated blob URL from the audioMap (Hash Map lookup)
    const blobUrl = audioMapRef.current.get(currentSong.id);
    if (blobUrl) {
      audio.src = blobUrl;
    } else {
      // Fallback to original path if not generated yet
      audio.src = currentSong.src;
      ensureSongAudio(currentSong)
        .then((generatedUrl) => {
          if (currentSong.id !== songIdRef.current) return;
          const currentAudio = audioRef.current;
          if (!currentAudio || currentAudio.src === generatedUrl) return;
          currentAudio.src = generatedUrl;
          currentAudio.load();
          if (isPlayingRef.current) currentAudio.play().catch(() => {});
        })
        .catch(() => {});
    }
    audio.load();
    // Use the ref instead of the state to avoid stale closure
    if (isPlayingRef.current) audio.play().catch(() => {});
  }, [currentSong, audioReady, ensureSongAudio]);

  // Tracks latest current song ID for async generation callbacks.
  const songIdRef = useRef(currentSong.id);
  useEffect(() => {
    songIdRef.current = currentSong.id;
  }, [currentSong]);

  // When volume changes → update the audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // When shuffleMode changes → rebuild the queue
  useEffect(() => {
    if (shuffleMode) {
      // shuffleArray() from playerLogic.js uses Fisher-Yates algorithm
      const shuffled = shuffleArray(songsData);
      setQueue(shuffled);
    } else {
      setQueue(songsData); // restore original order
    }
  }, [shuffleMode]);

  // ── KEYBOARD SHORTCUTS ──
  // Uses getActionForKey() from keyboardShortcuts.js (Hash Map lookup)
  useEffect(() => {
    function handleKeyDown(event) {
      const action = getActionForKey(event); // O(1) Hash Map lookup
      if (!action) return; // no mapping for this key

      event.preventDefault(); // prevent default browser behavior (e.g., Space scrolling)

      // Map action strings to player functions
      switch (action) {
        case "togglePlay":    togglePlay();    break;
        case "nextSong":      nextSong();      break;
        case "prevSong":      prevSong();      break;
        case "volumeUp":      setVolume(v => Math.min(1, v + VOLUME_STEP)); break;
        case "volumeDown":    setVolume(v => Math.max(0, v - VOLUME_STEP)); break;
        case "toggleMute":    toggleMute();    break;
        case "toggleShuffle": toggleShuffle(); break;
        case "cycleRepeat":   handleCycleRepeat(); break;
        default: break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong, volume, shuffleMode, repeatMode, queue]);

  // ── PLAYER ACTIONS ──
  // These functions call the logic from playerLogic.js

  function playSong(song) {
    if (currentSong.id === song.id) {
      togglePlay();  // same song → just toggle
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingRef.current) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlayingRef.current);
  }

  function nextSong() {
    // Uses the queue-based navigation from playerLogic.js
    // If shuffle is on, queue is shuffled; otherwise it's the original order
    const next = getNextSongFromQueue(currentSong.id, queue);
    setCurrentSong(next);
    setIsPlaying(true);
  }

  function prevSong() {
    const prev = getPrevSongFromQueue(currentSong.id, queue);
    setCurrentSong(prev);
    setIsPlaying(true);
  }

  function seekTo(percentage) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    // calculateSeekTime() from playerLogic.js converts % → seconds
    audio.currentTime = calculateSeekTime(percentage, duration);
    setProgress(percentage);
    setCurrentTime(audio.currentTime);
  }

  // ── SHUFFLE & REPEAT ACTIONS ──

  function toggleShuffle() {
    setShuffleMode(prev => !prev);
  }

  function handleCycleRepeat() {
    // cycleRepeatMode() from playerLogic.js — uses Hash Map state machine
    setRepeatMode(prev => cycleRepeatMode(prev));
  }

  function toggleMute() {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current || 0.8);
    }
  }

  // Called every frame while song plays (by the <audio> element's onTimeUpdate event)
  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    // calculateProgress() from playerLogic.js converts seconds → %
    setProgress(calculateProgress(audio.currentTime, audio.duration));
    setCurrentTime(audio.currentTime);
  }

  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }

  function handleEnded() {
    // handleRepeatOnEnd() from playerLogic.js — pure logic decides action
    const result = handleRepeatOnEnd(repeatMode, currentSong.id, queue);

    switch (result.action) {
      case "repeat":
        // Repeat the same song — reset to start and play
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        break;
      case "next":
        nextSong(); // advance to next song in queue
        break;
      case "stop":
        setIsPlaying(false); // stop playback
        break;
      default:
        break;
    }
  }

  // Audio loading state handlers
  function handleWaiting() {
    setIsLoading(true);
  }

  function handleCanPlay() {
    setIsLoading(false);
  }

  // Everything shared with the rest of the app
  const value = {
    currentSong, isPlaying, progress, currentTime, duration, volume, isLoading,
    shuffleMode, repeatMode, audioReady, genProgress,
    setVolume, playSong, togglePlay, nextSong, prevSong, seekTo,
    toggleShuffle, handleCycleRepeat, toggleMute,
    formatTime,     // from playerLogic.js
    getVolumeIcon,  // from playerLogic.js
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Hidden <audio> element — the actual browser audio engine */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
      />
      {children}
    </PlayerContext.Provider>
  );
}

// Custom hook: lets any component access the player
// Usage: const { currentSong, playSong } = usePlayer();
export function usePlayer() {
  return useContext(PlayerContext);
}

// ============================================================
//  FILE: src/context/LibraryContext.jsx
//  PURPOSE: React "bridge" that connects libraryLogic.js to
//           the UI components.
//
//  All liked songs / playlist LOGIC is in src/js/libraryLogic.js
//  All localStorage read/write is in src/js/storageHelper.js
//  This file only handles: React state + calling those functions
//
//  Now also fires TOAST NOTIFICATIONS via ToastContext
//  when the user likes/unlikes, adds to playlist, etc.
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loadLikedSongs, saveLikedSongs,
  isSongLiked, toggleLikeSong,
  loadPlaylists, savePlaylists,
  createPlaylist, addSongToPlaylist, removeSongFromPlaylist,
  deletePlaylist, renamePlaylist, getPlaylistById
} from "../js/libraryLogic.js";   // ← all logic lives here

import { useToast } from "./ToastContext";
import { ToastType } from "../js/toastHelper.js";

const LibraryContext = createContext();

export function LibraryProvider({ children }) {

  const { showToast } = useToast();

  // likedSongs is a SET (loaded from localStorage via libraryLogic.js)
  // DATA STRUCTURE: SET — fast O(1) lookups for "is this song liked?"
  const [likedSongs, setLikedSongs] = useState(() => loadLikedSongs());

  // playlists is an ARRAY of objects: [{id, name, songIds:[...]}, ...]
  // DATA STRUCTURE: ARRAY — ordered list of playlists
  const [playlists, setPlaylists] = useState(() => loadPlaylists());

  // Whenever likedSongs changes → save the updated Set to localStorage
  useEffect(() => {
    saveLikedSongs(likedSongs); // libraryLogic.js converts Set → Array → JSON
  }, [likedSongs]);

  // Whenever playlists changes → save the updated Array to localStorage
  useEffect(() => {
    savePlaylists(playlists);   // libraryLogic.js converts Array → JSON
  }, [playlists]);

  // ── LIKED SONGS ACTIONS (delegate to libraryLogic.js) ──

  function checkIsLiked(songId) {
    return isSongLiked(likedSongs, songId); // Set.has() → O(1)
  }

  function handleToggleLike(songId) {
    const wasLiked = isSongLiked(likedSongs, songId);
    const updatedSet = toggleLikeSong(likedSongs, songId); // returns new Set
    setLikedSongs(updatedSet);

    // Fire toast notification
    if (wasLiked) {
      showToast("Removed from Liked Songs", ToastType.INFO);
    } else {
      showToast("Added to Liked Songs", ToastType.SUCCESS);
    }
  }

  // ── PLAYLIST ACTIONS (delegate to libraryLogic.js) ──

  function handleCreatePlaylist(name) {
    const updated = createPlaylist(playlists, name); // returns new Array
    setPlaylists(updated);
    showToast(`Playlist "${name}" created`, ToastType.SUCCESS);
  }

  function handleAddToPlaylist(playlistId, songId) {
    const playlist = getPlaylistById(playlists, playlistId);
    // Check if song already exists before adding
    if (playlist && playlist.songIds.includes(songId)) {
      showToast("Song already in playlist", ToastType.WARNING);
      return;
    }
    const updated = addSongToPlaylist(playlists, playlistId, songId);
    setPlaylists(updated);
    showToast(`Added to "${playlist?.name || "playlist"}"`, ToastType.SUCCESS);
  }

  function handleRemoveFromPlaylist(playlistId, songId) {
    const updated = removeSongFromPlaylist(playlists, playlistId, songId);
    setPlaylists(updated);
    showToast("Removed from playlist", ToastType.INFO);
  }

  function handleDeletePlaylist(playlistId) {
    const playlist = getPlaylistById(playlists, playlistId);
    const updated = deletePlaylist(playlists, playlistId);
    setPlaylists(updated);
    showToast(`Playlist "${playlist?.name || ""}" deleted`, ToastType.INFO);
  }

  function handleRenamePlaylist(playlistId, newName) {
    const updated = renamePlaylist(playlists, playlistId, newName);
    setPlaylists(updated);
    showToast(`Playlist renamed to "${newName}"`, ToastType.SUCCESS);
  }

  function handleGetPlaylistById(id) {
    return getPlaylistById(playlists, id); // returns single playlist object
  }

  // Everything shared with the rest of the app
  const value = {
    likedSongs,
    playlists,
    isLiked:            checkIsLiked,
    toggleLike:         handleToggleLike,
    createPlaylist:     handleCreatePlaylist,
    addToPlaylist:      handleAddToPlaylist,
    removeFromPlaylist: handleRemoveFromPlaylist,
    deletePlaylist:     handleDeletePlaylist,
    renamePlaylist:     handleRenamePlaylist,
    getPlaylistById:    handleGetPlaylistById,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}

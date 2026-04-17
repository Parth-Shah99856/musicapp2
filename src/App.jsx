// ============================================================
//  FILE: src/App.jsx
//  PURPOSE: FRONTEND ONLY — The main page layout
//
//  This file is ONLY about layout and routing.
//  No logic here — just "which page goes where".
//
//  LAYOUT:
//  ┌──────────┬──────────────────────────┐
//  │          │                          │
//  │ Sidebar  │   Page Content           │
//  │  (left)  │   (changes with URL)     │
//  │          │                          │
//  ├──────────┴──────────────────────────┤
//  │         Player Bar (bottom)         │
//  └─────────────────────────────────────┘
//
//  ADDITIONS:
//  - ErrorBoundary wraps main content (catches render crashes)
//  - Toast component renders notifications (bottom-right)
//  - NotFound route catches invalid URLs (404 page)
// ============================================================

import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar       from "./components/Sidebar";
import Player        from "./components/Player";
import Toast         from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import Home           from "./pages/Home";
import Search         from "./pages/Search";
import Library        from "./pages/Library";
import LikedSongs     from "./pages/LikedSongs";
import PlaylistDetail from "./pages/PlaylistDetail";
import NotFound       from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />                   {/* Always visible on the left */}

      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/search"       element={<Search />} />
            <Route path="/library"      element={<Library />} />
            <Route path="/liked"        element={<LikedSongs />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Player />                    {/* Always visible at the bottom */}
      <Toast />                     {/* Toast notifications overlay */}
    </div>
  );
}

export default App;

// ============================================================
//  FILE: src/index.js
//  PURPOSE: Entry point — React starts here
//  Wraps the app in all context providers.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import { LibraryProvider } from "./context/LibraryContext";
import { ToastProvider }   from "./context/ToastContext";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ToastProvider>       {/* Makes toast notifications available everywhere */}
      <PlayerProvider>    {/* Makes player controls available everywhere */}
        <LibraryProvider> {/* Makes liked songs & playlists available everywhere */}
          <App />
        </LibraryProvider>
      </PlayerProvider>
    </ToastProvider>
  </BrowserRouter>
);

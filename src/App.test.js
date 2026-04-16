import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { PlayerProvider } from "./context/PlayerContext";
import { LibraryProvider } from "./context/LibraryContext";
import App from "./App";

jest.mock("./js/audioGenerator.js", () => ({
  generateSongAudio: jest.fn(async () => "blob:test-audio"),
}));

test("renders app shell with navigation", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <ToastProvider>
        <PlayerProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </PlayerProvider>
      </ToastProvider>
    </MemoryRouter>
  );

  expect(screen.getByText("🎵 MusicApp")).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
});

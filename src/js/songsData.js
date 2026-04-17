// ============================================================
//  FILE: src/js/songsData.js
//  PURPOSE: Stores all song information
//
//  DATA STRUCTURE USED: ARRAY of OBJECTS
//  ---------------------------------------------------------------
//  An Array is a list that holds multiple items in order.
//  Each item here is an Object — a collection of key:value pairs.
//
//  Example of ONE song object:
//  {
//    id: 1,           <- unique number to identify this song
//    title: "...",    <- the song name
//    artist: "...",   <- who made it
//    album: "...",    <- which album
//    genre: "...",    <- what type of music
//    duration: 213,   <- length in SECONDS (213 seconds = 3 min 33 sec)
//    src: "...",      <- path to the .mp3 file inside /public/songs/
//    cover: "...",    <- path to the cover image inside /public/covers/
//  }
//
//  WHY ARRAY?
//  - We need to store MANY songs in order
//  - We can loop through them with .map(), .filter(), .find()
//  - Fast to access by index: songs[0] gives the first song
// ============================================================

const songsData = [
  {
    id: 1,
    title: "Summer Breeze",
    artist: "The Wavelengths",
    album: "Ocean Vibes",
    genre: "Pop",
    duration: 120,
    src: "/songs/song1.wav",
    cover: "/covers/cover1.jpg"
  },
  {
    id: 2,
    title: "Midnight Drive",
    artist: "Neon Pulse",
    album: "City Lights",
    genre: "Electronic",
    duration: 150,
    src: "/songs/song2.wav",
    cover: "/covers/cover2.jpg"
  },
  {
    id: 3,
    title: "Mountain High",
    artist: "Acoustic Stories",
    album: "Nature Calls",
    genre: "Folk",
    duration: 110,
    src: "/songs/song3.wav",
    cover: "/covers/cover3.jpg"
  },
  {
    id: 4,
    title: "Rainy Days",
    artist: "The Wavelengths",
    album: "Ocean Vibes",
    genre: "Pop",
    duration: 130,
    src: "/songs/song4.wav",
    cover: "/covers/cover4.jpg"
  },
  {
    id: 5,
    title: "Electric Feel",
    artist: "Neon Pulse",
    album: "City Lights",
    genre: "Electronic",
    duration: 160,
    src: "/songs/song5.wav",
    cover: "/covers/cover5.jpg"
  },
  {
    id: 6,
    title: "Golden Hour",
    artist: "Acoustic Stories",
    album: "Nature Calls",
    genre: "Folk",
    duration: 100,
    src: "/songs/song6.wav",
    cover: "/covers/cover6.jpg"
  },
  {
    id: 7,
    title: "City Rhythm",
    artist: "Groove Masters",
    album: "Downtown",
    genre: "Jazz",
    duration: 180,
    src: "/songs/song7.wav",
    cover: "/covers/cover7.jpg"
  },
  {
    id: 8,
    title: "Starlight",
    artist: "Groove Masters",
    album: "Downtown",
    genre: "Jazz",
    duration: 140,
    src: "/songs/song8.wav",
    cover: "/covers/cover8.jpg"
  }
];

// ---------------------------------------------------------------
//  HOW TO ADD A NEW SONG:
//  1. Copy any one object from above
//  2. Paste it before the last "]"
//  3. Change id to the next number (e.g. 9)
//  4. Fill in title, artist, album, genre, duration, src, cover
//  5. Put your audio file in public/songs/ and cover in public/covers/
// ---------------------------------------------------------------

export default songsData;

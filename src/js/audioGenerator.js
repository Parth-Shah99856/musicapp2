// ============================================================
//  FILE: src/js/audioGenerator.js
//  PURPOSE: Generate real, playable music using Web Audio API
//
//  DATA STRUCTURES USED:
//  - ARRAY: Note sequences (melodies), chord progressions
//  - HASH MAP (Object): Genre → musical configuration
//  - QUEUE-like pattern: Notes are scheduled sequentially in time
//
//  ALGORITHM: Uses OfflineAudioContext to render audio offline,
//  then converts the rendered buffer to a Blob URL that can be
//  used as an <audio> source.
//
//  Each genre has unique:
//  - Scale/key (which notes are used)
//  - Chord progressions
//  - Tempo (BPM)
//  - Timbre (oscillator type + effects)
//  - Rhythm pattern
// ============================================================

// ---------------------------------------------------------------
//  MUSIC THEORY DATA STRUCTURES
// ---------------------------------------------------------------

// Notes as frequencies (Hz) — Hash Map: note name → frequency
// Based on A4 = 440 Hz, equal temperament tuning
const NOTE_FREQ = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
  'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
  'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'Db3': 138.59, 'Eb3': 155.56, 'Gb3': 185.00, 'Ab3': 207.65, 'Bb3': 233.08,
  'Db4': 277.18, 'Eb4': 311.13, 'Gb4': 369.99, 'Ab4': 415.30, 'Bb4': 466.16,
  'Db5': 554.37, 'Eb5': 622.25, 'Gb5': 739.99, 'Ab5': 830.61, 'Bb5': 932.33,
};

// ---------------------------------------------------------------
//  GENRE CONFIGURATIONS — Hash Map: genre → config object
//  Each genre has its own musical DNA
// ---------------------------------------------------------------
const GENRE_CONFIG = {
  Pop: {
    tempo: 120,
    scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    bassScale: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'],
    chords: [
      ['C4', 'E4', 'G4'],     // C major
      ['G3', 'B3', 'D4'],     // G major
      ['A3', 'C4', 'E4'],     // A minor
      ['F3', 'A3', 'C4'],     // F major
    ],
    melodyOsc: 'sine',
    chordOsc: 'triangle',
    bassOsc: 'sine',
    melodyGain: 0.15,
    chordGain: 0.06,
    bassGain: 0.12,
  },
  Electronic: {
    tempo: 128,
    scale: ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5'],
    bassScale: ['C3', 'Eb3', 'F3', 'G3', 'Bb3'],
    chords: [
      ['C4', 'Eb4', 'G4'],    // C minor
      ['Bb3', 'D4', 'F4'],    // Bb major
      ['Ab3', 'C4', 'Eb4'],   // Ab major
      ['G3', 'Bb3', 'D4'],    // G minor
    ],
    melodyOsc: 'sawtooth',
    chordOsc: 'sawtooth',
    bassOsc: 'sawtooth',
    melodyGain: 0.08,
    chordGain: 0.04,
    bassGain: 0.15,
  },
  Folk: {
    tempo: 100,
    scale: ['D4', 'E4', 'Gb4', 'A4', 'B4', 'D5'],
    bassScale: ['D3', 'E3', 'Gb3', 'A3', 'B3'],
    chords: [
      ['D4', 'Gb4', 'A4'],    // D major
      ['A3', 'Db4', 'E4'],    // A major
      ['B3', 'D4', 'Gb4'],    // B minor
      ['G3', 'B3', 'D4'],     // G major
    ],
    melodyOsc: 'triangle',
    chordOsc: 'sine',
    bassOsc: 'triangle',
    melodyGain: 0.12,
    chordGain: 0.07,
    bassGain: 0.10,
  },
  Jazz: {
    tempo: 110,
    scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'],
    bassScale: ['C3', 'D3', 'E3', 'G3', 'A3'],
    chords: [
      ['C4', 'E4', 'G4', 'Bb4'],    // C7 (dominant 7th)
      ['F3', 'A3', 'C4', 'E4'],     // Fmaj7
      ['D4', 'F4', 'A4', 'C5'],     // Dm7
      ['G3', 'B3', 'D4', 'F4'],     // G7
    ],
    melodyOsc: 'sine',
    chordOsc: 'triangle',
    bassOsc: 'triangle',
    melodyGain: 0.12,
    chordGain: 0.05,
    bassGain: 0.11,
  },
};

// ---------------------------------------------------------------
//  SEEDED RANDOM — Deterministic random number generator
//  ---------------------------------------------------------------
//  We use the song ID as a seed so each song always generates
//  the SAME music (deterministic). This means refreshing the page
//  produces identical tracks.
//
//  ALGORITHM: Simple linear congruential generator (LCG)
//  next = (seed * 1664525 + 1013904223) % 2^32
// ---------------------------------------------------------------
function createSeededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

// ---------------------------------------------------------------
//  generateMelody()
//  Creates a sequence of notes for the melody
//
//  DATA STRUCTURE: ARRAY of { note, startTime, duration }
//  Each element represents one note to play
//
//  Uses seeded random to pick notes from the genre's scale
//  and create varied rhythmic patterns
// ---------------------------------------------------------------
function generateMelody(config, songDuration, random) {
  const notes = [];
  const beatDuration = 60 / config.tempo;
  let time = beatDuration * 2; // start after intro

  while (time < songDuration - 2) {
    // Pick a note from the scale — uses index into ARRAY
    const noteIndex = Math.floor(random() * config.scale.length);
    const note = config.scale[noteIndex];

    // Varied note lengths: quarter, half, or eighth notes
    const durations = [beatDuration * 0.5, beatDuration, beatDuration * 1.5, beatDuration * 2];
    const durIndex = Math.floor(random() * durations.length);
    const dur = durations[durIndex];

    // Occasional rests (30% chance) make the melody breathe
    if (random() > 0.3) {
      notes.push({ note, startTime: time, duration: dur * 0.8 });
    }

    time += dur;
  }

  return notes;
}

// ---------------------------------------------------------------
//  generateBassLine()
//  Creates a bass line following the chord progression
//
//  DATA STRUCTURE: ARRAY of { note, startTime, duration }
//  Bass notes change with chord changes (every 4 beats)
// ---------------------------------------------------------------
function generateBassLine(config, songDuration, random) {
  const notes = [];
  const beatDuration = 60 / config.tempo;
  const barDuration = beatDuration * 4;
  let time = 0;
  let chordIndex = 0;

  while (time < songDuration - 1) {
    const bassNote = config.bassScale[chordIndex % config.bassScale.length];

    // Root note on beat 1
    notes.push({ note: bassNote, startTime: time, duration: beatDuration * 0.9 });

    // Walking bass pattern — add passing tones
    if (random() > 0.3) {
      const passingIndex = (chordIndex + 2) % config.bassScale.length;
      const passingNote = config.bassScale[passingIndex];
      notes.push({ note: passingNote, startTime: time + beatDuration * 2, duration: beatDuration * 0.8 });
    }

    time += barDuration;
    chordIndex++;
  }

  return notes;
}

// ---------------------------------------------------------------
//  generateChordProgression()
//  Places chords at regular intervals through the song
//
//  DATA STRUCTURE: ARRAY of { chord: [notes], startTime, duration }
// ---------------------------------------------------------------
function generateChordProgression(config, songDuration) {
  const chordEvents = [];
  const beatDuration = 60 / config.tempo;
  const barDuration = beatDuration * 4;
  let time = 0;
  let chordIndex = 0;

  while (time < songDuration - 1) {
    chordEvents.push({
      chord: config.chords[chordIndex % config.chords.length],
      startTime: time,
      duration: barDuration * 0.95,
    });

    time += barDuration;
    chordIndex++;
  }

  return chordEvents;
}

// ---------------------------------------------------------------
//  generateDrumPattern()
//  Creates a simple drum pattern using noise
//
//  Returns an ARRAY of { type, startTime, duration }
//  type = "kick" | "snare" | "hihat"
// ---------------------------------------------------------------
function generateDrumPattern(config, songDuration, random) {
  const hits = [];
  const beatDuration = 60 / config.tempo;
  let time = 0;

  while (time < songDuration - 0.5) {
    // Kick on beats 1 and 3
    hits.push({ type: 'kick', startTime: time, duration: 0.15 });
    hits.push({ type: 'kick', startTime: time + beatDuration * 2, duration: 0.15 });

    // Snare on beats 2 and 4
    hits.push({ type: 'snare', startTime: time + beatDuration, duration: 0.1 });
    hits.push({ type: 'snare', startTime: time + beatDuration * 3, duration: 0.1 });

    // Hi-hat on every eighth note
    for (let i = 0; i < 8; i++) {
      if (random() > 0.2) {
        hits.push({ type: 'hihat', startTime: time + beatDuration * 0.5 * i, duration: 0.05 });
      }
    }

    time += beatDuration * 4;
  }

  return hits;
}

// ---------------------------------------------------------------
//  renderNote()
//  Schedule a single note on the OfflineAudioContext
//
//  Creates an oscillator → gain envelope → output
//  The gain envelope (attack/release) prevents clicking sounds
// ---------------------------------------------------------------
function renderNote(ctx, freq, startTime, duration, oscType, gainValue, masterGain) {
  if (startTime < 0 || startTime >= ctx.length / ctx.sampleRate) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = oscType;
  osc.frequency.setValueAtTime(freq, startTime);

  // ADSR-like envelope: attack → sustain → release
  const attackTime = 0.02;
  const releaseTime = Math.min(0.1, duration * 0.3);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainValue, startTime + attackTime);
  gain.gain.setValueAtTime(gainValue, startTime + duration - releaseTime);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

// ---------------------------------------------------------------
//  renderDrumHit()
//  Creates percussive sounds using oscillators and noise
// ---------------------------------------------------------------
function renderDrumHit(ctx, hit, masterGain, drumBuffers) {
  const { type, startTime, duration } = hit;
  if (startTime < 0 || startTime >= ctx.length / ctx.sampleRate) return;

  const gain = ctx.createGain();
  gain.connect(masterGain);

  if (type === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.12);
    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  } else if (type === 'snare') {
    const noise = ctx.createBufferSource();
    noise.buffer = drumBuffers.snare;
    gain.gain.setValueAtTime(0.10, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
    noise.connect(gain);
    noise.start(startTime);
    noise.stop(startTime + 0.1);
  } else if (type === 'hihat') {
    const noise = ctx.createBufferSource();
    noise.buffer = drumBuffers.hihat;
    // High-pass filter for metallic sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    gain.gain.setValueAtTime(0.05, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    noise.start(startTime);
    noise.stop(startTime + 0.05);
  }
}

function createNoiseBuffer(ctx, durationSec, level, random) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (random() * 2 - 1) * level;
  }
  return buffer;
}

// ---------------------------------------------------------------
//  generateSongAudio()
//  Main function: generates a full song as a Blob URL
//
//  ALGORITHM:
//  1. Get genre config (Hash Map lookup)
//  2. Generate melody, bass, chords, drums (all Arrays)
//  3. Create OfflineAudioContext (renders audio in memory)
//  4. Schedule all notes on the context
//  5. Render to AudioBuffer
//  6. Convert AudioBuffer → WAV Blob → Blob URL
//
//  Returns: Promise<string> — a blob:// URL for the audio
// ---------------------------------------------------------------
export async function generateSongAudio(songId, genre, duration, options = {}) {
  const config = GENRE_CONFIG[genre] || GENRE_CONFIG.Pop;
  const random = createSeededRandom(songId * 7919); // prime seed for variety
  const sampleRate = options.sampleRate || 32000;
  const renderDuration = Math.min(duration, options.renderDuration || duration);
  const totalSamples = sampleRate * renderDuration;

  // Create offline context — renders audio without playing it
  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // Master gain (volume control for the whole track)
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.7, 0);

  const fadeInDuration = Math.min(2, renderDuration * 0.35);
  const fadeOutDuration = Math.min(3, renderDuration * 0.35);
  const fadeOutStart = Math.max(fadeInDuration, renderDuration - fadeOutDuration);

  // Fade in at start
  masterGain.gain.setValueAtTime(0, 0);
  masterGain.gain.linearRampToValueAtTime(0.7, fadeInDuration);

  // Fade out at end
  masterGain.gain.setValueAtTime(0.7, fadeOutStart);
  masterGain.gain.linearRampToValueAtTime(0, renderDuration);

  masterGain.connect(ctx.destination);

  // Generate all musical elements (ARRAYS of note events)
  const melody = generateMelody(config, renderDuration, random);
  const bass = generateBassLine(config, renderDuration, random);
  const chords = generateChordProgression(config, renderDuration);
  const drums = generateDrumPattern(config, renderDuration, random);
  const drumBuffers = {
    snare: createNoiseBuffer(ctx, 0.1, 0.3, random),
    hihat: createNoiseBuffer(ctx, 0.05, 0.15, random),
  };

  // Schedule melody notes
  melody.forEach(({ note, startTime, duration: noteDur }) => {
    const freq = NOTE_FREQ[note];
    if (freq) renderNote(ctx, freq, startTime, noteDur, config.melodyOsc, config.melodyGain, masterGain);
  });

  // Schedule bass notes
  bass.forEach(({ note, startTime, duration: dur }) => {
    const freq = NOTE_FREQ[note];
    if (freq) renderNote(ctx, freq, startTime, dur, config.bassOsc, config.bassGain, masterGain);
  });

  // Schedule chords (each chord = multiple notes at same time)
  chords.forEach(({ chord, startTime, duration: dur }) => {
    chord.forEach(note => {
      const freq = NOTE_FREQ[note];
      if (freq) renderNote(ctx, freq, startTime, dur, config.chordOsc, config.chordGain, masterGain);
    });
  });

  // Schedule drum hits
  drums.forEach(hit => {
    renderDrumHit(ctx, hit, masterGain, drumBuffers);
  });

  // Render the audio buffer
  const audioBuffer = await ctx.startRendering();

  // Convert AudioBuffer → WAV Blob → Blob URL
  const wavBlob = audioBufferToWav(audioBuffer);
  return URL.createObjectURL(wavBlob);
}

// ---------------------------------------------------------------
//  audioBufferToWav()
//  Converts an AudioBuffer to a WAV file Blob
//
//  WAV is a simple uncompressed format:
//  [44-byte header] + [raw PCM audio data]
//
//  The header describes: sample rate, channels, bit depth, etc.
//  We use 16-bit PCM (standard CD quality)
// ---------------------------------------------------------------
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Interleave channels
  let interleaved;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length * 2);
    for (let i = 0; i < left.length; i++) {
      interleaved[i * 2] = left[i];
      interleaved[i * 2 + 1] = right[i];
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }

  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write audio samples as 16-bit integers
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// ---------------------------------------------------------------
//  generateAllSongs()
//  Generates audio for all songs and returns a Map of blob URLs
//
//  DATA STRUCTURE: MAP (songId → blobURL)
//  Allows O(1) lookup when the player needs a song's audio
//
//  Returns: Promise<Map<number, string>>
// ---------------------------------------------------------------
export async function generateAllSongs(songsData) {
  const audioMap = new Map();

  // Generate all songs in parallel for speed
  const promises = songsData.map(async (song) => {
    const blobUrl = await generateSongAudio(song.id, song.genre, song.duration);
    audioMap.set(song.id, blobUrl);
  });

  await Promise.all(promises);
  return audioMap;
}

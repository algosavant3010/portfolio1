// lib/musicEngine.ts — Reactive ambient music engine using Tone.js Markov chains

import * as Tone from 'tone';

// Chord progressions for the Markov chain
const CHORD_MAP: Record<string, string[]> = {
  Cmaj7: ['Dm7', 'Em7', 'Am7', 'Fmaj7'],
  Dm7: ['G7', 'Em7', 'Cmaj7'],
  Em7: ['Am7', 'Fmaj7', 'Dm7'],
  Fmaj7: ['G7', 'Cmaj7', 'Dm7', 'Em7'],
  G7: ['Cmaj7', 'Am7', 'Em7'],
  Am7: ['Dm7', 'Fmaj7', 'G7'],
};

// Notes for each chord
const CHORD_NOTES: Record<string, string[]> = {
  Cmaj7: ['C3', 'E3', 'G3', 'B3'],
  Dm7: ['D3', 'F3', 'A3', 'C4'],
  Em7: ['E3', 'G3', 'B3', 'D4'],
  Fmaj7: ['F3', 'A3', 'C4', 'E4'],
  G7: ['G3', 'B3', 'D4', 'F4'],
  Am7: ['A3', 'C4', 'E4', 'G4'],
};

export class MusicEngine {
  private synth: Tone.PolySynth | null = null;
  private padSynth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private filter: Tone.Filter | null = null;
  private currentChord = 'Cmaj7';
  private isPlaying = false;
  private loopId: number | null = null;
  private masterGain: Tone.Gain | null = null;

  /**
   * Initialize the audio engine. Must be called after a user gesture.
   */
  async init() {
    if (this.synth) return;
    await Tone.start();

    this.reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
    this.delay = new Tone.FeedbackDelay('8n', 0.3).connect(this.reverb);
    this.filter = new Tone.Filter(800, 'lowpass').connect(this.delay);
    this.masterGain = new Tone.Gain(0.15).connect(this.filter);

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 1.5, sustain: 0.4, release: 3 },
    }).connect(this.masterGain);

    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 2, decay: 3, sustain: 0.6, release: 4 },
    }).connect(this.masterGain);
  }

  /**
   * Get next chord via Markov chain transition.
   */
  private nextChord(): string {
    const transitions = CHORD_MAP[this.currentChord] || CHORD_MAP['Cmaj7'];
    const idx = Math.floor(Math.random() * transitions.length);
    this.currentChord = transitions[idx];
    return this.currentChord;
  }

  /**
   * Start the ambient music loop.
   */
  start() {
    if (this.isPlaying || !this.synth) return;
    this.isPlaying = true;

    const playChord = () => {
      if (!this.isPlaying || !this.synth || !this.padSynth) return;

      const chord = this.nextChord();
      const notes = CHORD_NOTES[chord];

      // Play pad
      this.padSynth.triggerAttackRelease(notes, '2n');

      // Arpeggiate
      notes.forEach((note, i) => {
        setTimeout(() => {
          if (this.synth && this.isPlaying) {
            this.synth.triggerAttackRelease(note, '4n');
          }
        }, i * 400);
      });

      // Schedule next chord
      this.loopId = window.setTimeout(playChord, 4000 + Math.random() * 2000);
    };

    playChord();
  }

  /**
   * Stop the music.
   */
  stop() {
    this.isPlaying = false;
    if (this.loopId !== null) {
      clearTimeout(this.loopId);
      this.loopId = null;
    }
  }

  /**
   * Adjust the filter frequency based on camera distance to a node.
   * Closer = brighter sound (higher cutoff).
   */
  setProximity(distance: number) {
    if (!this.filter) return;
    // Map distance 0..20 to frequency 2000..200
    const freq = Math.max(200, Math.min(2000, 2000 - distance * 90));
    this.filter.frequency.rampTo(freq, 0.5);
  }

  /**
   * Set master volume (0-1).
   */
  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.rampTo(Math.max(0, Math.min(1, v * 0.2)), 0.3);
    }
  }

  dispose() {
    this.stop();
    this.synth?.dispose();
    this.padSynth?.dispose();
    this.reverb?.dispose();
    this.delay?.dispose();
    this.filter?.dispose();
    this.masterGain?.dispose();
  }
}

// Singleton
let instance: MusicEngine | null = null;
export function getMusicEngine(): MusicEngine {
  if (!instance) instance = new MusicEngine();
  return instance;
}

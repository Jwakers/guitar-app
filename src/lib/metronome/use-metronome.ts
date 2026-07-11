"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCHEDULE_AHEAD_TIME = 0.1;
const LOOKAHEAD_INTERVAL = 25;

export type TimeSignature = {
  beats: number;
  subdivision: number;
};

export type MetronomeState = {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  timeSignature: TimeSignature;
  accentFirst: boolean;
};

export type MetronomeActions = {
  toggle: () => void;
  start: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: TimeSignature) => void;
  setAccentFirst: (accent: boolean) => void;
};

const CLICK_FREQUENCY = 880;
const ACCENT_FREQUENCY = 1100;
const CLICK_DURATION = 0.03;
const ACCENT_DURATION = 0.05;

export function clampBpm(bpm: number): number {
  return Math.min(300, Math.max(20, Math.round(bpm)));
}

type UseMetronomeOptions = {
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
};

export function useMetronome(
  options: UseMetronomeOptions = {},
): [MetronomeState, MetronomeActions] {
  const initialBpm = clampBpm(options.initialBpm ?? 120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(initialBpm);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>({
    beats: 4,
    subdivision: 4,
  });
  const [accentFirst, setAccentFirstState] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nextBeatTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(bpm);
  const timeSignatureRef = useRef(timeSignature);
  const accentFirstRef = useRef(accentFirst);
  const onBpmChangeRef = useRef(options.onBpmChange);

  useEffect(() => {
    onBpmChangeRef.current = options.onBpmChange;
  }, [options.onBpmChange]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);

  useEffect(() => {
    accentFirstRef.current = accentFirst;
  }, [accentFirst]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.7;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  const scheduleClick = useCallback(
    (time: number, beatIndex: number) => {
      const ctx = getAudioContext();
      const gain = gainNodeRef.current!;

      const isAccent = accentFirstRef.current && beatIndex === 0;
      const freq = isAccent ? ACCENT_FREQUENCY : CLICK_FREQUENCY;
      const duration = isAccent ? ACCENT_DURATION : CLICK_DURATION;
      const clickVolume = isAccent ? 1.0 : 0.6;

      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      clickGain.gain.setValueAtTime(0, time);
      clickGain.gain.linearRampToValueAtTime(clickVolume, time + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(clickGain);
      clickGain.connect(gain);

      osc.start(time);
      osc.stop(time + duration + 0.01);

      const delay = (time - ctx.currentTime) * 1000;
      setTimeout(() => {
        setCurrentBeat(beatIndex);
      }, Math.max(0, delay));
    },
    [getAudioContext],
  );

  const scheduler = useCallback(() => {
    const ctx = getAudioContext();
    const secondsPerBeat = 60.0 / bpmRef.current;

    while (nextBeatTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleClick(nextBeatTimeRef.current, currentBeatRef.current);
      currentBeatRef.current =
        (currentBeatRef.current + 1) % timeSignatureRef.current.beats;
      nextBeatTimeRef.current += secondsPerBeat;
    }
  }, [getAudioContext, scheduleClick]);

  const start = useCallback(() => {
    if (isPlayingRef.current) {
      return;
    }

    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    isPlayingRef.current = true;
    currentBeatRef.current = 0;
    nextBeatTimeRef.current = ctx.currentTime + 0.05;
    setCurrentBeat(-1);
    setIsPlaying(true);

    timerRef.current = setInterval(scheduler, LOOKAHEAD_INTERVAL);
  }, [getAudioContext, scheduler]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentBeat(-1);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const setBpm = useCallback((newBpm: number) => {
    const clamped = clampBpm(newBpm);
    setBpmState(clamped);
    onBpmChangeRef.current?.(clamped);
  }, []);

  const setTimeSignature = useCallback((ts: TimeSignature) => {
    setTimeSignatureState(ts);
    if (isPlayingRef.current) {
      currentBeatRef.current = 0;
    }
  }, []);

  const setAccentFirst = useCallback((accent: boolean) => {
    setAccentFirstState(accent);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const state: MetronomeState = {
    isPlaying,
    bpm,
    currentBeat,
    timeSignature,
    accentFirst,
  };

  const actions: MetronomeActions = {
    toggle,
    start,
    stop,
    setBpm,
    setTimeSignature,
    setAccentFirst,
  };

  return [state, actions];
}

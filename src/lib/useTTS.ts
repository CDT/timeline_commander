import { useState, useEffect, useRef, useCallback } from "react";
import type { Locale } from "./types";

const LANG_MAP: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  "zh-CN": "zh-CN",
};

function pickVoice(locale: Locale): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const lang = LANG_MAP[locale];
  // Prefer exact match, fall back to language prefix
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ??
    null
  );
}

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, locale: Locale) => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[locale];

      // Voices may not be loaded yet — re-pick on voiceschanged if needed
      const voice = pickVoice(locale);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  // Stop on unmount
  useEffect(() => () => { stop(); }, [stop]);

  return { speak, stop, isPlaying, isSupported };
}

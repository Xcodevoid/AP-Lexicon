"use client";
import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

/** Uses a recorded audio URL when provided, otherwise the browser's built-in speech synthesis (offline-capable, no API keys). */
export function Pronounce({ text, audioUrl, lang = "en-US", className }: { text: string; audioUrl?: string | null; lang?: string; className?: string }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(!!audioUrl || (typeof window !== "undefined" && "speechSynthesis" in window)), [audioUrl]);
  if (!supported) return null;
  const play = () => {
    if (audioUrl) { void new Audio(audioUrl).play(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.92;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)) && /natural|premium|enhanced/i.test(v.name)) ?? window.speechSynthesis.getVoices().find((v) => v.lang === lang);
    if (voice) u.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  return (
    <button type="button" onClick={play} className={`grid h-10 w-10 place-items-center rounded-xl sunken hover:text-brand-500 ${className ?? ""}`} aria-label={`Play pronunciation of ${text}`} title={audioUrl ? "Play recording" : "Play (browser speech synthesis)"}>
      <Volume2 size={18} />
    </button>
  );
}

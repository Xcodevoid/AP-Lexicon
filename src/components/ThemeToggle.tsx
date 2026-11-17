"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("apl-theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button type="button" onClick={toggle} className={`grid h-9 w-9 place-items-center rounded-xl hover:bg-[rgb(var(--bg-sunken))] ${className ?? ""}`} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/** Inline script to set the theme before paint (avoids a flash). */
export const themeScript = `(function(){try{var t=localStorage.getItem('apl-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})();`;

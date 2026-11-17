"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AchievementBadge } from "../achievements/AchievementBadge";
import { Button } from "../ui/Button";

export type UnlockedAchievement = { key: string; title: string; titleZh: string; description: string; icon: string; tier: "bronze" | "silver" | "gold" };

export function Celebration({ items, onClose }: { items: UnlockedAchievement[]; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (!items.length) setIdx(0); }, [items.length]);
  const a = items[idx];
  const next = () => (idx + 1 < items.length ? setIdx(idx + 1) : onClose());
  return (
    <AnimatePresence>
      {a && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/60 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="ach-title">
          <motion.div key={a.key} className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[rgb(var(--bg-elev))] p-8 text-center shadow-lift" initial={reduce ? false : { scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
            {!reduce && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.circle key={i} r={2 + (i % 3)} fill={["#F5B83D", "#2F6BFF", "#14A894", "#FF6B5A"][i % 4]} initial={{ cx: "50%", cy: "38%", opacity: 1 }} animate={{ cx: `${50 + Math.cos(i) * 46}%`, cy: `${38 + Math.sin(i * 1.7) * 40}%`, opacity: 0 }} transition={{ duration: 1.4, ease: "easeOut" }} />
                ))}
              </svg>
            )}
            <p className="eyebrow">Achievement unlocked · 解锁成就</p>
            <motion.div className="mx-auto mt-4 w-fit" initial={reduce ? false : { rotate: -12, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}>
              <AchievementBadge icon={a.icon} tier={a.tier} size={112} />
            </motion.div>
            <h2 id="ach-title" className="display mt-4 text-2xl font-semibold">{a.title}</h2>
            <p className="zh text-subtle">{a.titleZh}</p>
            <p className="mt-3 text-sm text-muted">{a.description}</p>
            <Button className="mt-6 w-full" variant="accent" onClick={next} autoFocus>{items.length - idx > 1 ? `Next (${items.length - idx - 1} more)` : "Keep going"}</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { describe, expect, it } from "vitest";
import { newMemoryState, nextIntervalDays, retrievability, schedule, DEFAULT_WEIGHTS } from "@/lib/engine/fsrs";

const t0 = new Date("2026-01-01T10:00:00Z");
const days = (n: number) => new Date(t0.getTime() + n * 86_400_000);

describe("FSRS scheduler", () => {
  it("R(S, S) = 0.9 by construction", () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 6);
    expect(retrievability(0, 5)).toBe(1);
  });
  it("interval equals stability at 90% desired retention", () => {
    expect(nextIntervalDays(7.3)).toBe(7);
    expect(nextIntervalDays(0.2)).toBe(1); // never below a day for graduated cards
    expect(nextIntervalDays(5000, 0.9, 365)).toBe(365);
  });
  it("first Good review uses the initial stability weight and graduates the card", () => {
    const r = schedule(newMemoryState(), 3, t0);
    expect(r.next.stability).toBeCloseTo(DEFAULT_WEIGHTS[2]);
    expect(r.next.state).toBe("REVIEW");
    expect(r.intervalDays).toBe(Math.round(DEFAULT_WEIGHTS[2]));
  });
  it("Again on a new card schedules a same-day learning step", () => {
    const r = schedule(newMemoryState(), 1, t0);
    expect(r.next.state).toBe("LEARNING");
    expect(r.due.getTime() - t0.getTime()).toBe(10 * 60_000);
  });
  it("successful on-time reviews grow stability; lapses shrink it and count", () => {
    let s = schedule(newMemoryState(), 3, t0);
    const s1 = s.next.stability;
    s = schedule(s.next, 3, days(s.intervalDays));
    expect(s.next.stability).toBeGreaterThan(s1);
    const beforeLapse = s.next.stability;
    const lapse = schedule(s.next, 1, days(s.intervalDays + 10));
    expect(lapse.next.stability).toBeLessThan(beforeLapse);
    expect(lapse.next.lapses).toBe(1);
    expect(lapse.next.state).toBe("RELEARNING");
  });
  it("Easy > Good > Hard for the resulting interval", () => {
    const base = schedule(newMemoryState(), 3, t0).next;
    const at = days(3);
    const hard = schedule(base, 2, at).intervalDays;
    const good = schedule(base, 3, at).intervalDays;
    const easy = schedule(base, 4, at).intervalDays;
    expect(easy).toBeGreaterThan(good);
    expect(good).toBeGreaterThan(hard);
  });
  it("difficulty stays within 1..10", () => {
    let st = schedule(newMemoryState(), 1, t0).next;
    for (let i = 0; i < 30; i++) st = schedule(st, 1, days(i + 1)).next;
    expect(st.difficulty).toBeLessThanOrEqual(10);
    let e = schedule(newMemoryState(), 4, t0).next;
    for (let i = 0; i < 30; i++) e = schedule(e, 4, days((i + 1) * 5)).next;
    expect(e.difficulty).toBeGreaterThanOrEqual(1);
  });
});

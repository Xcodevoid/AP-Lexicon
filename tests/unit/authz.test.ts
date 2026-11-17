import { describe, expect, it } from "vitest";
import { can, canAccessUserData } from "@/lib/auth/permissions";

const student = { id: "s1", role: "STUDENT" as const, isDemo: false };
const admin = { id: "a1", role: "ADMIN" as const, isDemo: false };
const demoAdmin = { id: "d1", role: "ADMIN" as const, isDemo: true };

describe("authorization", () => {
  it("only non-demo admins can write, import or publish content", () => {
    for (const a of ["content:write", "content:import", "content:publish", "content:read-draft"] as const) {
      expect(can(admin, a)).toBe(true);
      expect(can(student, a)).toBe(false);
      expect(can(demoAdmin, a)).toBe(false);
      expect(can(null, a)).toBe(false);
    }
  });
  it("every signed-in user can record their own progress; anonymous users cannot", () => {
    expect(can(student, "progress:write")).toBe(true);
    expect(can(null, "progress:write")).toBe(false);
  });
  it("demo accounts cannot join the leaderboard", () => {
    expect(can({ ...student, isDemo: true }, "leaderboard:join")).toBe(false);
    expect(can(student, "leaderboard:join")).toBe(true);
  });
  it("users can only access their own records", () => {
    expect(canAccessUserData(student, "s1")).toBe(true);
    expect(canAccessUserData(student, "s2")).toBe(false);
    expect(canAccessUserData(admin, "s1")).toBe(false);
    expect(canAccessUserData(null, "s1")).toBe(false);
  });
});

/** Pure authorization rules (unit-tested). All checks run on the server. */
export type Role = "STUDENT" | "ADMIN";
export interface Principal { id: string; role: Role; isDemo: boolean }

export type Action =
  | "content:read-draft"
  | "content:write"
  | "content:import"
  | "content:publish"
  | "progress:write"
  | "notebook:write"
  | "leaderboard:join";

export function can(user: Principal | null | undefined, action: Action): boolean {
  if (!user) return false;
  switch (action) {
    case "content:read-draft":
    case "content:write":
    case "content:import":
    case "content:publish":
      return user.role === "ADMIN" && !user.isDemo;
    case "leaderboard:join":
      return !user.isDemo;
    case "progress:write":
    case "notebook:write":
      return true;
  }
}

/** A user may only act on their own records unless they are an admin reading aggregate data. */
export function canAccessUserData(actor: Principal | null | undefined, ownerId: string) {
  return !!actor && actor.id === ownerId;
}

/** Map palettes per subject theme key (stored on Subject.theme). */
export const THEMES: Record<string, { node: string; path: string; glow: string; terrain: string; name: string }> = {
  teal: { node: "#14A894", path: "#2CC6AF", glow: "rgba(20,168,148,.35)", terrain: "contour", name: "Market Coast" },
  cyan: { node: "#0E8DA8", path: "#22B5CF", glow: "rgba(34,181,207,.35)", terrain: "grid", name: "Policy Plains" },
  green: { node: "#2E9E5B", path: "#47C27A", glow: "rgba(46,158,91,.35)", terrain: "cells", name: "Living Archipelago" },
  amber: { node: "#C9862B", path: "#E5A54B", glow: "rgba(201,134,43,.35)", terrain: "contour", name: "Old Continents" },
  indigo: { node: "#4F55D9", path: "#7A7FF0", glow: "rgba(79,85,217,.35)", terrain: "grid", name: "Mechanics Range" },
  rose: { node: "#D24A6A", path: "#EB6F8C", glow: "rgba(210,74,106,.35)", terrain: "cells", name: "Reaction Delta" },
  blue: { node: "#2F6BFF", path: "#5C86FF", glow: "rgba(47,107,255,.35)", terrain: "grid", name: "Change Highlands" },
  sky: { node: "#2484D6", path: "#4BA3EE", glow: "rgba(36,132,214,.35)", terrain: "contour", name: "Series Fjords" },
  violet: { node: "#7A4FD9", path: "#9C79EE", glow: "rgba(122,79,217,.35)", terrain: "grid", name: "Function Plateau" },
  pink: { node: "#C24FA8", path: "#DE74C6", glow: "rgba(194,79,168,.35)", terrain: "cells", name: "Mind Gardens" },
  slate: { node: "#3F5A82", path: "#6684B0", glow: "rgba(63,90,130,.35)", terrain: "grid", name: "Logic Circuits" },
  gold: { node: "#C99419", path: "#E8B23A", glow: "rgba(201,148,25,.35)", terrain: "contour", name: "Exam Citadel" },
};

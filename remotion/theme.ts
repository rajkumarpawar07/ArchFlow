import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const C = {
  ink: "#1e1e1e",
  ink70: "rgba(30,30,30,0.72)",
  ink50: "rgba(30,30,30,0.5)",
  paper: "#ffffff",
  dot: "#d4d4d4",
  border: "#e9e9eb",
  primary: "#6965db",
  primaryLight: "#e0dfff",
  yellow: "#ffd43b",
  yellowSoft: "#fff9db",
  red: "#fa5252",
  redSoft: "#ffe3e3",
  amber: "#fab005",
  amberSoft: "#fff3bf",
  blue: "#339af0",
  blueSoft: "#d0ebff",
  green: "#2f9e44",
  greenSoft: "#d3f9d8",
  canvasBg: "#fffdf5",
  codeBg: "#f8f9fa",
} as const;

export const INK_SOFT = "#495057";
export const INK_MUTED = "#868e96";

const caveat = loadCaveat("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const inter = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

export const F = {
  hand: `${caveat.fontFamily}, cursive`,
  sans: `${inter.fontFamily}, Arial, Helvetica, sans-serif`,
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

export { caveat, inter };

export const ROUGH = "255px 15px 225px 15px / 15px 225px 15px 255px";
export const ROUGH_SM = "125px 12px 115px 12px / 12px 115px 12px 125px";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const SHADOW_SOFT = "2px 3px 0 rgba(30,30,30,0.15)";
export const SHADOW_PANEL = "0 16px 48px rgba(30,30,30,0.16)";
export const SHADOW_FLOAT = "0 12px 32px rgba(30,30,30,0.12)";
export const SHADOW_HARD = "2px 2px 0 #1e1e1e";

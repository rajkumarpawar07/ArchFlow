import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, ROUGH, ROUGH_SM, SHADOW_SOFT } from "./theme";

export const Caret: React.FC<{ show: boolean; w?: number }> = ({ show, w = 13 }) => {
  const f = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: "1.05em",
        transform: "translateY(2px)",
        background: C.ink,
        opacity: show ? (Math.floor(f / 14) % 2 === 0 ? 1 : 0.12) : 0,
        marginLeft: 1,
        borderRadius: 2,
      }}
    />
  );
};

export const TypeText: React.FC<{
  text: string;
  from: number;
  cps?: number;
  style?: React.CSSProperties;
  caret?: boolean;
}> = ({ text, from, cps = 2.4, style, caret = true }) => {
  const f = useCurrentFrame();
  const n = Math.floor(Math.max(0, f - from) * cps);
  const shown = text.slice(0, Math.min(text.length, n));
  const done = n >= text.length;
  return (
    <span style={style}>
      {shown}
      {caret ? <Caret show={!done} /> : null}
    </span>
  );
};

/** Word-by-word handwriting feel. */
export const WordTyper: React.FC<{
  text: string;
  from: number;
  perWord?: number;
  style?: React.CSSProperties;
  caret?: boolean;
}> = ({ text, from, perWord = 4, style, caret = true }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const n = Math.floor(Math.max(0, f - from) / perWord);
  const shown = words.slice(0, Math.min(words.length, Math.max(0, n))).join(" ");
  const done = n >= words.length;
  return (
    <span style={style}>
      {shown}
      {caret ? <Caret show={!done} /> : null}
    </span>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; filled?: boolean; dark?: boolean }> = ({ children, style, filled, dark }) => (
  <span
    style={{
      fontFamily: F.mono,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: dark ? C.yellow : C.ink,
      background: filled ? (dark ? C.ink : C.primary) : "#fff",
      boxShadow: SHADOW_SOFT,
      border: `1.5px solid ${C.ink}`,
      borderRadius: ROUGH_SM,
      padding: "6px 14px",
      display: "inline-block",
      ...style,
    }}
  >
    {children}
  </span>
);

export const Stamp: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; scale?: number }> = ({ children, style, scale = 1 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "baseline",
      gap: 10,
      background: C.yellowSoft,
      border: `2px solid ${C.ink}`,
      boxShadow: "3px 4px 0 rgba(30,30,30,0.2)",
      borderRadius: ROUGH,
      padding: "6px 18px",
      transform: `scale(${scale})`,
      ...style,
    }}
  >
    {children}
  </span>
);

export const Springy: React.FC<{ from: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ from, children, style, y = 24 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, f - from), fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  return (
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * y}px) scale(${0.94 + 0.085 * p})`, ...style }}>{children}</div>
  );
};

export const Squiggle: React.FC<{ width: number; from: number; color?: string }> = ({ width, from, color = C.primary }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const amp = 7;
  const step = 26;
  const pts: string[] = [];
  for (let i = 0; i <= width / step; i++) pts.push(`${i * step},${amp * Math.sin(i * 1.05)}`);
  const ptsShown = pts.slice(0, Math.max(2, Math.ceil(pts.length * p)));
  return (
    <svg width={width} height={26} style={{ display: "block" }}>
      <polyline points={ptsShown.join(" ")} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const WaveBars: React.FC<{ at: number; bars?: number; x?: React.CSSProperties; active: boolean }> = ({ at, bars = 14, x, active }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "inline-flex", gap: 4, alignItems: "flex-end", height: 34, ...x }}>
      {Array.from({ length: bars }).map((_, i) => {
        const t = Math.max(0, f - at);
        const h = active ? 8 + 26 * Math.abs(Math.sin(i * 1.53 + t * 0.22)) * (0.55 + 0.45 * random(`bar-${i}`)) : 6;
        return <span key={i} style={{ width: 5, height: h, borderRadius: 4, background: C.primary, opacity: active ? 0.9 : 0.25 }} />;
      })}
    </div>
  );
};

export const MicPulse: React.FC<{ at: number; size?: number }> = ({ at, size = 96 }) => {
  const f = useCurrentFrame();
  const t = Math.max(0, f - at);
  const p = (t % 60) / 60;
  const second = (t - 30) % 60 < 0 ? 0 : ((t - 30) % 60) / 60;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      {[p, second].map((pp, i) =>
        pp > 0 ? (
          <span
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `2.5px solid ${C.primary}`,
              opacity: 0.55 * (1 - pp),
              transform: `scale(${1 + pp * 1.1})`,
            }}
          />
        ) : null
      )}
      <span
        style={{
          width: size * 0.64,
          height: size * 0.64,
          borderRadius: "50%",
          background: C.primaryLight,
          border: `2.5px solid ${C.ink}`,
          boxShadow: "3px 4px 0 rgba(30,30,30,0.2)",
          display: "grid",
          placeItems: "center",
          fontSize: size * 0.34,
          transform: `rotate(${Math.sin(t * 0.08) * 3}deg)`,
        }}
      >
        🎙️
      </span>
    </div>
  );
};

export const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => {
  const f = useCurrentFrame();
  return <span style={{ display: "inline-block", transform: `rotate(${f * 9}deg)`, fontSize: size }}>✨</span>;
};

export const MdType: React.FC<{ md: string; from: number; cps?: number; style?: React.CSSProperties }> = ({ md, from, cps = 4.4, style }) => {
  const f = useCurrentFrame();
  let budget = Math.max(0, (f - from) * cps);
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  for (const line of lines) {
    if (budget <= 0) break;
    const take = Math.min(line.length, Math.floor(budget));
    budget -= line.length + 1;
    const text = line.slice(0, take);
    if (line.startsWith("## ")) {
      out.push(
        <div key={line} style={{ fontFamily: F.hand, fontSize: 25, fontWeight: 700, color: C.ink, marginTop: 8, width: "fit-content" }}>
          <span style={{ background: `linear-gradient(transparent 60%, ${C.yellow}66 60%)`, padding: "0 4px" }}>{text.slice(3)}</span>
        </div>
      );
    } else if (line.startsWith("- ")) {
      const segments = inlineBold(text.slice(2));
      out.push(
        <div key={line} style={{ display: "flex", gap: 7, fontSize: 14, color: INKS.body, lineHeight: 1.45 }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>•</span>
          <span>{segments}</span>
        </div>
      );
    } else if (line.trim().length) {
      out.push(
        <div key={line} style={{ fontSize: 14, color: INKS.body, lineHeight: 1.5 }}>
          {inlineBold(text)}
        </div>
      );
    } else {
      out.push(<div key={line} style={{ height: 7 }} />);
    }
  }
  return <div style={style}>{out}</div>;
};

const INKS = { body: "#343a40" };

function inlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <b key={i} style={{ color: C.ink }}>{part.slice(2, -2)}</b>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} style={{ fontFamily: F.mono, fontSize: 12.5, background: C.codeBg, padding: "1px 5px", borderRadius: 6, color: "#c2255c" }}>
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

export const Sticky: React.FC<{
  sev: "high" | "medium" | "low";
  title: string;
  detail: string;
  fix: string;
  at: number;
  tiltr?: number;
  exitAt?: number | null;
  width?: number;
}> = ({ sev, title, detail, fix, at, tiltr = 0.6, exitAt = null, width = 330 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - at), fps, config: { damping: 15, stiffness: 140, mass: 0.7 } });
  let gone = false;
  let exitP = 0;
  if (exitAt && f >= exitAt) {
    exitP = Math.min(1, (f - exitAt) / 22);
    gone = exitP >= 1;
  }
  if (gone || pop <= 0.01) return null;
  const palette = sev === "high" ? { bg: C.redSoft, bd: C.red, icon: "⚠️" } : sev === "medium" ? { bg: C.amberSoft, bd: C.amber, icon: "⚡" } : { bg: C.blueSoft, bd: C.blue, icon: "ℹ️" };
  return (
    <div
      style={{
        position: "relative",
        width,
        background: palette.bg,
        border: `2px solid ${palette.bd}`,
        boxShadow: SHADOW_SOFT,
        padding: "14px 14px 12px",
        transform: `rotate(${tiltr}deg) translateY(${(1 - pop) * 26}px) translateX(${exitP * -40}px)`,
        opacity: (f >= at ? 1 : 0) * (1 - exitP),
        borderRadius: 4,
      }}
    >
      <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%) rotate(-2deg)", width: 66, height: 19, background: "rgba(255,255,255,0.6)", borderLeft: "1px dashed rgba(0,0,0,0.15)", borderRight: "1px dashed rgba(0,0,0,0.15)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }} />
      <div style={{ fontFamily: F.hand, fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
        {palette.icon} {title}
      </div>
      <div style={{ fontSize: 13, color: C.ink70, marginTop: 5, lineHeight: 1.4 }}>{detail}</div>
      <div style={{ fontSize: 12.5, marginTop: 6, color: INKS.body }}>
        <b style={{ color: palette.bd, fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.08em" }}>FIX </b>
        {fix}
      </div>
    </div>
  );
};

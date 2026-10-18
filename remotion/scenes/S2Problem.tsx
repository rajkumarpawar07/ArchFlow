import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Springy, WordTyper, MicPulse } from "../ui";
import { C, F } from "../theme";

const StickyCard: React.FC<{ sev: "high" | "medium" | "low"; title: string; detail: string; at: number; tiltr: number }> = ({ sev, title, detail, at, tiltr }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - at), fps, config: { damping: 15, stiffness: 140, mass: 0.7 } });
  if (pop <= 0.01) return null;
  const palette = sev === "high" ? { bg: C.redSoft, bd: C.red, icon: "⚠️" } : sev === "medium" ? { bg: C.amberSoft, bd: "#fab005", icon: "⚡" } : { bg: C.blueSoft, bd: C.blue, icon: "ℹ️" };
  return (
    <div
      style={{
        position: "relative",
        width: 350,
        background: palette.bg,
        border: `2px solid ${palette.bd}`,
        boxShadow: "2px 3px 0 rgba(30,30,30,0.15)",
        padding: "16px 16px 14px",
        borderRadius: 4,
        transform: `rotate(${tiltr}deg) translateY(${(1 - pop) * 30}px)`,
        opacity: pop,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -9,
          left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: 66,
          height: 19,
          background: "rgba(255,255,255,0.6)",
          borderLeft: "1px dashed rgba(0,0,0,0.15)",
          borderRight: "1px dashed rgba(0,0,0,0.15)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      />
      <div style={{ fontFamily: F.hand, fontSize: 26, fontWeight: 700, color: C.ink }}>
        {palette.icon} {title}
      </div>
      <div style={{ fontSize: 14.5, color: C.ink70, marginTop: 6, lineHeight: 1.45 }}>{detail}</div>
    </div>
  );
};

export const S2Problem: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 110, left: "50%", transform: "translateX(-50%)", width: 1400, textAlign: "center" }}>
        <div style={{ fontFamily: F.hand, fontSize: 84, fontWeight: 700, lineHeight: 1.1 }}>
          <WordTyper text="Drawing cloud architecture is the slowest part of shipping." from={16} perWord={7} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 46 }}>
        <Springy from={120} y={34}>
          <StickyCard sev="high" title="🌀 draw.io archaeology" detail="45+ mins fighting lines for one diagram" at={120} tiltr={-1.2} />
        </Springy>
        <Springy from={185} y={34}>
          <StickyCard sev="medium" title="💔 PRD ≠ diagram ≠ reality" detail="three artifacts, three different stories" at={185} tiltr={0.8} />
        </Springy>
        <Springy from={250} y={34}>
          <StickyCard sev="low" title="😵 hand-written main.tf" detail="IaC written later at 2am, if ever" at={250} tiltr={-0.9} />
        </Springy>
      </div>

      <div style={{ position: "absolute", top: 650, left: "50%", transform: "translateX(-50%)", width: 1250, textAlign: "center" }}>
        <div style={{ fontFamily: F.hand, fontSize: 74, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 30 }}>
          <span style={{ opacity: f > 290 ? 1 : 0.15 }}>
            <MicPulse at={290} size={74} />
          </span>
          <WordTyper text="Your best ideas happen while talking." from={290} perWord={9} />
        </div>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <WordTyper text="So we built the canvas that listens. 👂" from={348} perWord={7} style={{ fontFamily: F.hand, fontSize: 46, fontWeight: 700, color: C.primary }} />
        </div>
      </div>
    </div>
  );
};

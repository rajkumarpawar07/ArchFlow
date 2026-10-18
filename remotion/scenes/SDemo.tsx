import React from "react";
import { AbsoluteFill, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, F, SHADOW_PANEL, SHADOW_SOFT, ROUGH } from "../theme";

const VID = { x: 172, y: 84, w: 1576, h: 892 };

const Note: React.FC<{ at: number; x: React.CSSProperties; children: React.ReactNode; tiltr?: number }> = ({ at, x, children, tiltr = -1.4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, f - at), fps, config: { damping: 15, stiffness: 130, mass: 0.75 } });
  if (pop <= 0.01) return null;
  return (
    <div
      style={{
        ...x,
        position: "absolute",
        zIndex: 6,
        background: "#fff",
        border: `2px solid ${C.blue}`,
        boxShadow: SHADOW_SOFT,
        borderRadius: ROUGH_SM_NUM,
        padding: "13px 17px",
        fontFamily: F.hand,
        fontSize: 23,
        fontWeight: 700,
        color: C.ink,
        maxWidth: 300,
        lineHeight: 1.22,
        transform: `rotate(${tiltr}deg) translateY(${(1 - pop) * 20}px)`,
        opacity: Math.min(1, pop),
      }}
    >
      {children}
    </div>
  );
};

const ROUGH_SM_NUM = 10;

const RecBadge: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 16) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        right: 24,
        top: VID.y + 8,
        zIndex: 6,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        border: `2px solid ${C.red}`,
        boxShadow: SHADOW_SOFT,
        borderRadius: 999,
        padding: "6px 14px",
        fontFamily: F.sans,
        fontSize: 15,
        fontWeight: 700,
        color: C.ink,
      }}
    >
      <span style={{ width: 11, height: 11, borderRadius: 999, background: C.red, opacity: blink ? 1 : 0.25, display: "inline-block" }} />
      REC · raw · unedited
    </div>
  );
};

export const SDemo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frameIn = spring({ frame: f, fps, config: { damping: 18, stiffness: 120, mass: 0.9 } });
  const scale = 0.94 + frameIn * 0.06;
  const tail = interpolate(f, [792, 836, 856], [1, 1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const recOpacity = f > 786 ? 1 - Math.min(1, (f - 786) / 14) : 1;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#f1f3f5" }} />
      <div
        style={{
          position: "absolute",
          left: VID.x,
          top: VID.y,
          width: VID.w,
          height: VID.h,
          transform: `scale(${scale * tail})`,
          transformOrigin: "center center",
          opacity: Math.min(1, f / 8),
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            border: `3px solid ${C.ink}`,
            boxShadow: SHADOW_PANEL,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 42, borderBottom: `2px solid rgba(30,30,30,0.12)`, background: "#fafafa", display: "flex", alignItems: "center", gap: 10, paddingLeft: 16 }}>
            {["#fa5252", "#fab005", "#40c057"].map((c) => (
              <span key={c} style={{ width: 13, height: 13, borderRadius: 999, background: c, border: `1.5px solid rgba(30,30,30,0.28)` }} />
            ))}
            <span style={{ marginLeft: 14, background: "#fff", border: `1.5px solid rgba(30,30,30,0.18)`, borderRadius: 999, padding: "3px 16px", fontFamily: F.sans, fontSize: 14, color: C.ink70 }}>
              app.archflow.dev — live demo
            </span>
          </div>
          <div style={{ position: "absolute", top: 42, left: 0, right: 0, bottom: 0, overflow: "hidden", background: "#fff" }}>
            <OffthreadVideo src={staticFile("recording.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>
      <div style={{ opacity: recOpacity }}>
        <RecBadge />
      </div>
      <Note at={36} x={{ left: 24, top: 240 }}>
        the real product — zero cuts, zero zoom-hacks
      </Note>
      <Note at={250} x={{ left: 24, top: 435 }} tiltr={1.2}>
        no mouse drags — every node came from one voice ramble
      </Note>
      <Note at={470} x={{ right: 24, top: 250 }} tiltr={-1.1}>
        PRD streams itself in, live, staff-audited
      </Note>
      <Note at={730} x={{ right: 24, top: 430 }} tiltr={1.3}>
        undo · export · terraform — all in the box
      </Note>
    </AbsoluteFill>
  );
};

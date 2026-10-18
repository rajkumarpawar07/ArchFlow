import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { Chip, WaveBars } from "../ui";

/**
 * Screen-recording slot (20s). Replace this component usage in Root.tsx with:
 *   <OffthreadVideo src={staticFile("screen-a.mp4")} />   // must exist in remotion/public/
 * or keep the placeholder.
 */
export const RecSlot: React.FC<{ title: string; bullets: string[]; tag: string }> = ({ title, bullets, tag }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f * 0.06) * 8;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 70,
          border: `3px dashed #adb5bd`,
          borderRadius: 22,
          background: "rgba(251,251,253,0.7)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, transform: `translateY(${bob}px)` }}>🎥</div>
          <div style={{ fontFamily: F.hand, fontSize: 46, fontWeight: 700, marginTop: 6 }}>{title}</div>
          <div style={{ marginTop: 14, display: "grid", gap: 8, maxWidth: 900 }}>
            {bullets.map((b) => (
              <div key={b} style={{ fontSize: 17, color: C.ink70 }}>
                → {b}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, opacity: 0.75 }}>
            <WaveBars at={0} active bars={10} />
          </div>
          <div style={{ marginTop: 20 }}>
            <Chip style={{ fontSize: 12.5 }}>slot placeholder — drop your recording in remotion/public/</Chip>
          </div>
          <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 12, color: "#868e96" }}>
            {"swap for <OffthreadVideo src={staticFile(`" + tag + "`)} /> in remotion/Root.tsx"}
          </div>
        </div>
      </div>
    </div>
  );
};

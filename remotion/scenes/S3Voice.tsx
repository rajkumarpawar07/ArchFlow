import React from "react";
import { useCurrentFrame } from "remotion";
import { AppFrame } from "../appframe";
import { SketchCanvas } from "../sketch";
import { RAMBLE } from "../data";
import { C, F } from "../theme";
import { Springy } from "../ui";

/**
 * 10s: empty app + typing the raw voice ramble into the voice bar, mic pulsing.
 * Hands off to Scene Build cleanly (loading pill visible at end).
 */
export const S3Voice: React.FC = () => {
  const f = useCurrentFrame();
  const typing = (n: number) => RAMBLE.slice(0, n);
  const n = Math.floor(Math.max(0, f - 40) * 1.55);
  const typingDone = n >= RAMBLE.length;

  return (
    <AppFrame
      warnings={0}
      meta={{ nodes: 0, edges: 0 }}
      tab={null}
      docsContent={null}
      voice={{
        recording: true,
        typing: typingDone ? null : { text: typing(n), from: 40, cps: 99 },
      }}
      loadingPill={typingDone ? { at: 150 } : undefined}
      bottomHint={
        <Springy from={170} style={{ position: "absolute", left: "50%", bottom: 342, transform: "translateX(-50%)" }}>
          <span style={{ fontFamily: F.hand, fontSize: 22, fontWeight: 600, color: INK_SOFT_ }}>
            “auto-send fires 900ms after you stop talking ⏱”
          </span>
        </Springy>
      }
    >
      <SketchCanvas nodes={[]} edges={[]} width="100%" height="100%" />
      <EmptyBox f={f} />
    </AppFrame>
  );
};

const INK_SOFT_ = "#495057";

function EmptyBox({ f }: { f: number }) {
  if (f > 285) return null;
  const p = Math.min(1, f / 12);
  return (
    <div
      style={{
        position: "absolute",
        left: "39%",
        top: "45%",
        transform: `translate(-50%,-50%)`,
        opacity: p * (f > 270 ? Math.max(0, (285 - f) / 15) : 1),
        border: "2px dashed #adb5bd",
        borderRadius: 14,
        background: "rgba(255,255,255,0.92)",
        padding: "28px 40px",
        textAlign: "center",
        boxShadow: "3px 4px 0 rgba(30,30,30,0.08)",
      }}
    >
      <div style={{ fontFamily: F.hand, fontSize: 42, fontWeight: 700, color: C.ink }}>Infinite canvas awaits ✍️</div>
      <div style={{ fontSize: 15, color: INK_SOFT_, marginTop: 6 }}>
        Hold your mic hotkey and <b>talk your architecture</b> — the sketch comes alive.
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 11.5, color: "#868e96", marginTop: 10 }}>drag to pan · scroll to zoom · drag nodes · double-click to edit</div>
    </div>
  );
}

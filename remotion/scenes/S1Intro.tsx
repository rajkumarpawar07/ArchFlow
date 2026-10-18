import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MicPulse, Squiggle, Springy, WordTyper, Chip } from "../ui";
import { C, F } from "../theme";

const TITLE = "Talk your architecture.";
const SUB = "One voice ramble  →  live diagram  ·  PRD  ·  staff review  ·  Terraform.";

const FloatChips: React.FC = () => {
  const f = useCurrentFrame();
  const chips: Array<[string, number, number, number, number]> = [
    ["Cloud Run", 140, 160, -8, 1.0],
    ["Pub/Sub", 1620, 180, 6, 1.0],
    ["BigQuery", 230, 860, -5, 1.05],
    ["Cloud Spanner", 1500, 880, 4, 1.05],
    ["API Gateway", 620, 930, -3, 0.95],
    ["Cloud Armor", 1200, 140, 5, 0.95],
  ];
  return (
    <>
      {chips.map(([label, x, y, rot, w], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y + Math.sin(f * 0.02 + i * 1.9) * 9,
            transform: `rotate(${rot}deg)`,
            opacity: 0.5,
            fontFamily: F.hand,
            fontWeight: 600,
            fontSize: 24,
            color: C.ink70,
            border: `2px solid ${C.dot}`,
            background: "#fff",
            borderRadius: 10,
            padding: "4px 14px",
            width: "fit-content",
          }}
        >
          {label}
        </span>
      ))}
    </>
  );
};

export const S1Intro: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [430, 450], [1, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <FloatChips />

      <div style={{ position: "absolute", top: 150, left: "50%", transform: "translateX(-50%)" }}>
        <Springy from={20}>
          <MicPulse at={12} size={110} />
        </Springy>
      </div>

      <div style={{ position: "absolute", top: 380, left: "50%", transform: "translateX(-50%)", width: 1400, textAlign: "center" }}>
        <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 112, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          <WordTyper text={TITLE} from={90} perWord={26} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -18, paddingRight: 260 }}>
          <Squiggle width={330} from={330} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 610, left: "50%", transform: "translateX(-50%)", width: 1300, textAlign: "center" }}>
        <div style={{ fontSize: 27, color: "#343a40", fontWeight: 500 }}>
          <WordTyper text={SUB} from={255} perWord={5.5} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 120, left: "50%", transform: "translateX(-50%)" }}>
        <Springy from={340}>
          <span style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10, background: C.yellowSoft, border: "2px solid #1e1e1e", boxShadow: "3px 4px 0 rgba(30,30,30,0.2)", borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px", padding: "6px 20px" }}>
              <span style={{ fontFamily: F.hand, fontSize: 40, fontWeight: 700 }}>ArchFlow</span>
              <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 700, background: "#1e1e1e", color: C.yellow, padding: "2px 7px", borderRadius: 4 }}>voice-first architect</span>
            </span>
            <Chip style={{ fontSize: 12 }}>3-min pitch</Chip>
          </span>
        </Springy>
      </div>
    </div>
  );
};

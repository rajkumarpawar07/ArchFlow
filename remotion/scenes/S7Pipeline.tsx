import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, SHADOW_SOFT, ROUGH_SM, SHADOW_FLOAT } from "../theme";
import { Springy, WordTyper, Chip } from "../ui";

const CARD_W = 330;

const Bubble: React.FC<{ icon: string; big: string; small: string; at: number }> = ({ icon, big, small, at }) => {
  return (
    <Springy from={at} y={26}>
      <div
        style={{
          width: CARD_W,
          background: "#fff",
          border: `2px solid ${C.ink}`,
          borderRadius: 14,
          boxShadow: SHADOW_SOFT,
          padding: "18px 20px 16px",
        }}
      >
        <div style={{ fontSize: 30 }}>{icon}</div>
        <div style={{ fontFamily: F.hand, fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{big}</div>
        <div style={{ fontSize: 13.5, color: C.ink70, marginTop: 3 }}>{small}</div>
      </div>
    </Springy>
  );
};

const MINI_JSON = [
  '{ "utterance": "swap Cloud SQL → Spanner" }',
  '  ↳ nodes[5].type = "data"        // patched',
  '  ↳ edges: + cache, + DLQ        // wired',
  "  ↳ warnings: 3 → 1              // re-scored",
  "  ↳ prd_markdown / terraform_hcl // regenerated",
];

const HowCard: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const lines = MINI_JSON.slice(0, Math.max(1, Math.floor((f - at) / 9)));
  return (
    <Springy from={at} style={{ position: "absolute", left: 50, top: 470 }}>
      <div
        style={{
          width: 1180,
          background: "#fff",
          border: `1.5px solid ${C.border}`,
          borderRadius: 12,
          boxShadow: SHADOW_FLOAT,
          padding: "14px 18px",
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", color: "#868e96", marginBottom: 8 }}>POST /api/synthesize — zod-validated ArchState</div>
        <div style={{ fontFamily: F.mono, fontSize: 15, lineHeight: 1.6, color: "#24292e" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ color: i === 0 ? C.primary : "#24292e" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </Springy>
  );
};

/** 16s: pipeline explainer + built-with chips. */
export const S7Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 70, left: 50, right: 50, textAlign: "left" }}>
        <div style={{ fontFamily: F.hand, fontSize: 62, fontWeight: 700 }}>
          <WordTyper text="how it works — four artifacts, one source of truth" from={8} perWord={6} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 190, left: 70, display: "flex", gap: 26, alignItems: "flex-start" }}>
        <Bubble icon="🎙️" big="your ramble" small="any whiteboard-speed speech, LLM-dictated" at={60} />
        <Arrow at={110} />
        <Bubble icon="✨" big="Gemini parses it" small="structured output → ArchState (nodes · edges · PRD · risks · .tf)" at={80} />
        <Arrow at={140} />
        <Bubble icon="🧠" big="deterministic mutations" small="each voice patch edits only what changes — undoable" at={100} />
      </div>

      <HowCard at={170} />

      <div style={{ position: "absolute", left: 70, top: 730, display: "flex", gap: 12, flexWrap: "wrap", width: 900 }}>
        {["Next.js 16", "React 19", "React Flow", "dagre", "Zod 4", "Gemini 2.5 Flash"].map((t, i) => (
          <Springy key={t} from={230 + i * 7} y={14}>
            <Chip style={{ fontSize: 12.5 }}>{t}</Chip>
          </Springy>
        ))}
      </div>

      <Springy from={300} style={{ position: "absolute", left: 70, top: 800 }}>
        <span style={{ display: "inline-block", background: C.greenSoft, fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: C.green, border: `1.5px solid ${C.green}`, borderRadius: ROUGH_SM, padding: "5px 12px" }}>
          offline? deterministic mock engine keeps the demo alive
        </span>
      </Springy>

      <Springy from={330} style={{ position: "absolute", right: 60, top: 750 }}>
        <span style={{ display: "inline-block", fontFamily: F.hand, fontSize: 28, fontWeight: 700, color: C.primary, transform: "rotate(-2deg)" }}>
          (this video too — Remotion 😌)
        </span>
      </Springy>
    </div>
  );
};

const Arrow: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={60} height={30} style={{ marginTop: 40 }}>
      <path d="M 2 15 L 48 15" stroke={C.ink} strokeWidth={2.5} strokeDasharray={"1"} pathLength={1} strokeDashoffset={1 - p} markerEnd="url(#arrow2)" fill="none" />
      <defs>
        <marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.ink} />
        </marker>
      </defs>
    </svg>
  );
};

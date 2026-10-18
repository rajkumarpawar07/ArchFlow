import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, W, H, FPS, caveat, inter, SHADOW_SOFT, ROUGH } from "./theme";
import { PaperDots } from "./appframe";
import { S1Intro } from "./scenes/S1Intro";
import { S2Problem } from "./scenes/S2Problem";
import { S3Voice } from "./scenes/S3Voice";
import { S3Build } from "./scenes/S3Build";
import { S4PRD } from "./scenes/S4PRD";
import { SDemo } from "./scenes/SDemo";
import { S5Mutation } from "./scenes/S5Mutation";
import { S6Terraform } from "./scenes/S6Terraform";
import { S7Pipeline } from "./scenes/S7Pipeline";
import { S8Outro } from "./scenes/S8Outro";
import { NARRATION } from "./narration.gen";

const FADE = 12;

// ── Timeline (30fps): 450+450+300+540+480+860+750+510+570+490 = 5400 frames = 180s ──
// Scene slots sized to the narration timing (scripts/gen-narration.mjs).
type SceneDef = { id: string; dur: number; node: React.ReactNode };

const SCENES: SceneDef[] = [
  { id: "s1", dur: 450, node: <S1Intro /> },
  { id: "s2", dur: 450, node: <S2Problem /> },
  { id: "s3voice", dur: 300, node: <S3Voice /> },
  { id: "s3build", dur: 540, node: <S3Build /> },
  { id: "s4prd", dur: 480, node: <S4PRD /> },
  { id: "demo", dur: 856, node: <SDemo /> },
  { id: "s5", dur: 750, node: <S5Mutation /> },
  { id: "s6", dur: 510, node: <S6Terraform /> },
  { id: "s7", dur: 570, node: <S7Pipeline /> },
  { id: "s8", dur: 494, node: <S8Outro /> },
];

const STARTS: number[] = (() => {
  const arr: number[] = [];
  let acc = 0;
  for (let i = 0; i < SCENES.length; i++) {
    arr[i] = acc;
    acc += SCENES[i].dur;
  }
  return arr;
})();

export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);

const sceneIndexOf = (lineId: string): number => {
  if (lineId === "demoA" || lineId === "demoB") return 5;
  return SCENES.findIndex((s) => s.id === lineId);
};

const lineStart = (line: (typeof NARRATION)[number]): number => {
  const idx = sceneIndexOf(line.id);
  return idx >= 0 ? STARTS[idx] + line.at : STARTS[0];
};

type Word = { w: string; s: number; e: number };
type Phrase = { words: Word[]; sAbs: number; eAbs: number };

const PHRASES: Phrase[] = (() => {
  const phrases: Phrase[] = [];
  for (const line of NARRATION) {
    const base = lineStart(line);
    let cur: Word[] = [];
    let curS = 0;
    let curE = 0;
    const flush = () => {
      if (!cur.length) return;
      phrases.push({ words: cur, sAbs: base + curS, eAbs: base + curE });
      cur = [];
    };
    for (const [w, sSec, eSec] of line.words) {
      const s = Math.round(sSec * FPS);
      const e = Math.round(eSec * FPS);
      const gap = cur.length ? s - curE : 0;
      if (cur.length && (gap > 8 || cur.length >= 9 || /—/.test(w) || /[.!?]$/.test(w))) flush();
      if (!cur.length) curS = s;
      cur.push({ w, s, e });
      curE = Math.max(curE, e);
    }
    flush();
  }
  return phrases;
})();

const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([caveat.waitUntilDone(), inter.waitUntilDone()])
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);
  return ready;
};

const FadeShell: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, FADE, dur - FADE, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const active = useMemo(() => PHRASES.find((p) => f >= p.sAbs - 2 && f <= p.eAbs + 12) ?? null, [f]);
  if (!active) return null;
  const opacity = interpolate(f, [active.sAbs - 2, active.sAbs + 4, active.eAbs + 5, active.eAbs + 11], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 72,
          transform: `translateX(-50%) rotate(-0.4deg)`,
          filter: "url(#excali-rough)",
          background: "#fff",
          border: `2.5px solid ${C.ink}`,
          boxShadow: SHADOW_SOFT,
          borderRadius: 14,
          padding: "13px 30px",
          maxWidth: 1220,
          fontFamily: caveat.fontFamily,
          fontSize: 44,
          color: C.ink,
          opacity,
          lineHeight: 1.22,
          textAlign: "center",
        }}
      >
        {active.words.map((word, i) => {
          const on = f >= active.sAbs + word.s && f <= active.sAbs + word.e;
          return (
            <span key={i} style={{ color: on ? C.primary : C.ink, fontWeight: on ? 800 : 600, whiteSpace: "pre" }}>
              {word.w}
              {i < active.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const NarrationAudio: React.FC = () => (
  <>
    {NARRATION.map((line, i) => (
      <Sequence key={line.id} from={lineStart(line)} durationInFrames={line.durF + 16} name={`narr-${i}`}>
        <Audio src={staticFile(line.file)} />
      </Sequence>
    ))}
  </>
);

const ArchFlowPitch: React.FC = () => {
  const fontsReady = useFontsReady();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="excali-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={2} result="n" seed={7} />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.7} />
          </filter>
        </defs>
      </svg>
      <AbsoluteFill style={{ fontFamily: inter.fontFamily, color: C.ink, backgroundColor: "#ffffff" }}>
        <PaperDots />
      </AbsoluteFill>
      {fontsReady ? (
        <>
          {SCENES.map((s, i) => (
            <Sequence key={s.id} from={STARTS[i]} durationInFrames={s.dur} name={s.id}>
              <FadeShell dur={s.dur}>{s.node}</FadeShell>
            </Sequence>
          ))}
          <NarrationAudio />
          <Captions />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition id="ArchFlowPitch" component={ArchFlowPitch} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);

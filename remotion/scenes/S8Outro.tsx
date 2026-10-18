import React from "react";
import { random } from "remotion";
import { C, F, SHADOW_SOFT } from "../theme";
import { Springy, WordTyper, Chip } from "../ui";

const Confetti: React.FC = () => (
  <>
    {Array.from({ length: 26 }).map((_, i) => {
      const x = random(`cx-${i}`) * 1850;
      const y = 900 + random(`cy-${i}`) * 300;
      const size = 7 + random(`cs-${i}`) * 8;
      const color = [C.primary, C.yellow, C.red, C.green, C.blue][Math.floor(random(`cc-${i}`) * 5)];
      const rot = random(`cr-${i}`) * 360;
      return <span key={i} style={{ position: "absolute", left: x, top: y, width: size * 0.7, height: size, background: color, transform: `rotate(${rot}deg)`, borderRadius: 3, opacity: 0.9 }} />;
    })}
  </>
);

export const S8Outro: React.FC = () => {
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <Confetti />

      <div style={{ position: "absolute", top: 170, left: "50%", transform: "translateX(-50%)" }}>
        <Springy from={6}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 14,
              background: C.yellowSoft,
              border: `2.5px solid #1e1e1e`,
              boxShadow: "4px 5px 0 rgba(30,30,30,0.2)",
              borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
              padding: "10px 30px",
              transform: "rotate(-1.2deg)",
            }}
          >
            <span style={{ fontFamily: F.hand, fontSize: 74, fontWeight: 700 }}>ArchFlow</span>
            <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 700, background: "#1e1e1e", color: C.yellow, padding: "3px 9px", borderRadius: 5 }}>hackathon build</span>
          </span>
        </Springy>
      </div>

      <div style={{ position: "absolute", top: 370, left: "50%", transform: "translateX(-50%)", width: 1500, textAlign: "center" }}>
        <div style={{ fontFamily: F.hand, fontSize: 96, fontWeight: 700 }}>
          <WordTyper text="Talk your stack into existence." from={60} perWord={13} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 560, left: "50%", transform: "translateX(-50%)" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {["⬡ Diagram", "📝 PRD", "📌 Staff review", "🧱 Terraform"].map((t, i) => (
            <Springy key={t} from={180 + i * 10} y={18}>
              <Chip style={{ fontSize: 15, padding: "8px 18px" }}>{t}</Chip>
            </Springy>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 220, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <Springy from={280}>
          <span style={{ fontFamily: F.sans, fontSize: 19, color: "#495057", fontWeight: 500 }}>
            one voice ramble → a spec your whole team can navigate&nbsp;&nbsp;·&nbsp;&nbsp;≈60 seconds
          </span>
        </Springy>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <Springy from={340}>
          <SpringyB>
            <Chip style={{ fontSize: 14, padding: "6px 14px" }}>⭐ star the repo</Chip>
          </SpringyB>
        </Springy>
        <Springy from={356}>
          <span style={{ fontFamily: F.hand, fontSize: 26, fontWeight: 600, color: "#495057" }}>
            built with ♥ + Remotion — team ArchFlow
          </span>
        </Springy>
      </div>
    </div>
  );
};

const SpringyB: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ boxShadow: SHADOW_SOFT }}>{children}</span>;

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, INK_MUTED, INK_SOFT, ROUGH, ROUGH_SM, SHADOW_FLOAT, SHADOW_PANEL, SHADOW_SOFT } from "./theme";
import { Chip, Spinner, Springy, TypeText } from "./ui";

export const LogoBadge: React.FC<{ engine?: string; at?: number }> = ({ engine = "gemini", at = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, f - at), fps, config: { damping: 15, stiffness: 130 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        top: 16,
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        background: C.yellowSoft,
        border: "2px solid #1e1e1e",
        boxShadow: "2px 2px 0 #1e1e1e",
        borderRadius: ROUGH,
        padding: "4px 12px",
        transform: `scale(${Math.max(0.6, p)})`,
        opacity: p,
      }}
    >
      <span style={{ fontFamily: F.hand, fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: "36px" }}>ArchFlow</span>
      <span style={{ fontFamily: F.mono, fontSize: 10.5, fontWeight: 700, background: C.ink, color: C.yellow, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.04em" }}>
        {engine}
      </span>
    </div>
  );
};

export const Toolbar: React.FC<{ warnings?: number; activeTab?: "prd" | "critic" | "tf" | null }> = ({ warnings = 0, activeTab = null }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: 14,
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 2,
      background: "rgba(255,255,255,0.95)",
      border: `1.2px solid ${C.border}`,
      borderRadius: 18,
      padding: "6px 10px",
      boxShadow: SHADOW_FLOAT,
    }}
  >
    {["➖", "✋"].map((e) => (
      <ToolIcon key={e} e={e} active={e === "➖"} />
    ))}
    <Sep />
    <ToolIcon e="📝" active={activeTab === "prd"} />
    <ToolIcon e="📌" active={activeTab === "critic"} sup={warnings || undefined} />
    <ToolIcon e="🧱" active={activeTab === "tf"} />
    <Sep />
    <ToolIcon e="↩️" />
    <ToolIcon e="↪️" />
    <ToolIcon e="🗑️" />
  </div>
);

const ToolIcon: React.FC<{ e: string; active?: boolean; sup?: number }> = ({ e, active, sup }) => (
  <span
    style={{
      position: "relative",
      width: 38,
      height: 36,
      display: "grid",
      placeItems: "center",
      borderRadius: 10,
      fontSize: 17,
      background: active ? C.primaryLight : "transparent",
      color: C.ink70,
    }}
  >
    {e}
    {sup ? <sup style={{ position: "absolute", top: 2, right: 0, fontSize: 10, fontWeight: 700, color: C.red }}>{sup}</sup> : null}
  </span>
);

const Sep = () => <span style={{ width: 1, height: 22, background: C.border, margin: "0 6px" }} />;

export const ShareBtn: React.FC<{ at?: number }> = ({ at = 10 }) => <Springy from={at} style={{ position: "absolute", right: 18, top: 16 }}>
  <span
    style={{
      display: "inline-block",
      fontFamily: F.sans,
      fontSize: 14.5,
      fontWeight: 700,
      color: "#fff",
      background: C.primary,
      border: "1.5px solid #1e1e1e",
      boxShadow: "2px 2px 0 #1e1e1e",
      borderRadius: 12,
      padding: "9px 16px",
    }}
  >
    Share ⤴
  </span>
</Springy>;

export const DocsPanel: React.FC<{
  tab: "prd" | "critic" | "tf";
  at?: number;
  children: React.ReactNode;
  footer?: string;
  width?: number;
  style?: React.CSSProperties;
}> = ({ tab, at = 0, children, footer = "V select · H pan · drag nodes · scroll zoom · Ctrl+Z undo", width = 380, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [1, 0.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: 74,
        bottom: 336,
        width,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "rgba(255,255,255,0.97)",
        border: `1.2px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: SHADOW_PANEL,
        transform: f >= at ? "translateX(0)" : "translateX(430px)",
        opacity: f >= at ? 1 : 0.4 * p,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, borderBottom: `1.2px solid ${C.border}`, padding: 8 }}>
        {(
          [
            ["prd", "📝 PRD"],
            ["critic", "📌 Review"],
            ["tf", "🧱 Terraform"],
          ] as const
        ).map(([k, label]) => (
          <span
            key={k}
            style={{
              fontFamily: F.hand,
              fontSize: 20,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 9,
              color: tab === k ? C.ink : INK_MUTED,
              background: tab === k ? C.primaryLight : "transparent",
            }}
          >
            {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: INK_MUTED, fontSize: 15, padding: "0 8px" }}>⋯</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: "10px 14px" }}>{children}</div>
      <div style={{ borderTop: `1px dashed ${C.border}`, padding: "6px 12px", fontFamily: F.mono, fontSize: 10, color: INK_MUTED, lineHeight: 1.4 }}>
        {footer}
      </div>
    </div>
  );
};

export const EmptyCanvas: React.FC<{ at: number; out?: number }> = ({ at, out = 1e9 }) => {
  const f = useCurrentFrame();
  if (f < at || f >= out) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "38%",
        top: "44%",
        transform: `translate(-50%,-50%) scale(${interpolate(f, [at, at + 14], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        opacity: interpolate(f, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - interpolate(f, [out - 12, out], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
        border: "2px dashed #adb5bd",
        borderRadius: ROUGH,
        background: "rgba(255,255,255,0.92)",
        padding: "26px 38px",
        textAlign: "center",
        boxShadow: "3px 4px 0 rgba(30,30,30,0.08)",
      }}
    >
      <div style={{ fontFamily: F.hand, fontSize: 40, fontWeight: 700, color: C.ink }}>Infinite canvas awaits ✍️</div>
      <div style={{ fontSize: 14, color: INK_SOFT, marginTop: 4 }}>
        Hold your mic and <b>talk your architecture</b> — the sketch comes alive.
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: INK_MUTED, marginTop: 8 }}>drag to pan · scroll to zoom · drag nodes · double-click to edit</div>
    </div>
  );
};

export const HeardChip: React.FC<{ text: string; at: number; cps?: number; clearAt?: number }> = ({ text, at, cps = 5.5, clearAt }) => {
  const f = useCurrentFrame();
  if (f < at || (clearAt !== undefined && f >= clearAt)) return null;
  const p = interpolate(f, [at, at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: 760,
        background: "rgba(255,249,219,0.96)",
        border: `1.2px solid ${C.border}`,
        borderRadius: ROUGH_SM,
        padding: "7px 14px",
        fontFamily: F.hand,
        fontSize: 21,
        fontWeight: 600,
        color: INK_SOFT,
        whiteSpace: "nowrap",
        overflow: "hidden",
        opacity: p,
        transform: `translateY(${(1 - p) * 12}px) scaleX(${0.9 + p * 0.12})`,
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>✍️ Heard:&nbsp;{text}</span>
    </div>
  );
};

export const VoiceBar: React.FC<{
  typing?: { text: string; from: number; cps: number } | null;
  recording: boolean;
  pressed?: boolean;
  loading?: boolean;
}> = ({ typing = null, recording, pressed = false, loading = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pressScale = pressed ? 1 + 0.18 * (1 - Math.min(1, (f - 0) / 20)) : 1;
  return (
    <div
      style={{
        width: 780,
        background: "rgba(255,255,255,0.96)",
        border: `1.2px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: SHADOW_PANEL,
        padding: "10px 14px 10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${recording ? C.primary : C.ink}`,
            background: recording ? C.primary : "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 17,
          }}
        >
          🎙️
          {recording ? (
            <span style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `2px solid ${C.primary}`, opacity: 0.6 * (1 - ((f % 40) / 40)), transform: `scale(1 + ((f % 40) / 40))` }} />
          ) : null}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: F.hand, fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1 }}>Hold Wispr hotkey & talk to sketch…</div>
          <div style={{ fontSize: 11, color: INK_MUTED, marginTop: 2 }}>Burst auto-sends 900ms after you stop · Enter to send</div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 600,
            color: INK_SOFT,
            border: `1px solid ${C.border}`,
            background: "#f8f9fa",
            borderRadius: 999,
            padding: "5px 10px",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: recording || loading ? "#40c057" : "#adb5bd" }} /> Auto ON
        </span>
      </div>

      <div style={{ marginTop: 8, background: C.canvasBg, border: "1.5px solid rgba(30,30,30,0.6)", borderRadius: ROUGH_SM, padding: "10px 12px", minHeight: 64, maxWidth: 752, boxShadow: "inset 0 0 0 rgba(0,0,0,0)" }}>
        <div style={{ fontSize: 14.5, lineHeight: 1.5, color: C.ink, fontFamily: F.sans }}>
          {typing ? <TypeText text={typing.text} from={typing.from} cps={typing.cps} /> : <span style={{ color: "#adb5bd" }}>{"Dictate via Wispr Flow, e.g. Let's design an event-driven order system…"}</span>}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: F.sans, fontSize: 13.5, fontWeight: 700, color: "#fff", background: C.primary, border: "1.5px solid #1e1e1e", borderRadius: 9, padding: "7px 14px" }}>
            <Spinner size={15} /> Sketching…
          </span>
        ) : (
          <span
            style={{
              display: "inline-block",
              fontFamily: F.sans,
              fontSize: 13.5,
              fontWeight: 700,
              color: "#fff",
              background: C.primary,
              border: "1.5px solid #1e1e1e",
              boxShadow: "2px 2px 0 #1e1e1e",
              borderRadius: 9,
              padding: "7px 14px",
              transform: `scale(${pressScale})`,
              opacity: loading ? 0 : 1,
            }}
          >
            ✨ Sketch →
          </span>
        )}
        <span style={{ fontFamily: F.mono, fontSize: 11.5, color: INK_MUTED }}>{typing ? `${Math.ceil(typing.text.split(" ").length)} words` : "0 words"}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 6 }}>
          {["orders", "active-active", "⇄ Spanner", "＋ DLQ"].map((s) => (
            <span key={s} style={{ fontFamily: F.hand, fontSize: 17, fontWeight: 600, color: "#343a40", border: "1px solid #ced4da", background: "#fff", borderRadius: ROUGH_SM, padding: "3px 10px" }}>
              {s}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export const MetaChip: React.FC<{ nodes: number; edges: number; undo?: number }> = ({ nodes, edges, undo = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 18,
      bottom: 20,
      fontFamily: F.mono,
      fontSize: 11,
      color: INK_MUTED,
      background: "rgba(255,255,255,0.92)",
      border: `1.2px solid ${C.border}`,
      borderRadius: 10,
      padding: "5px 10px",
    }}
  >
    {nodes} shapes · {edges} arrows · {undo} undo
  </div>
);

export const LoadingPill: React.FC<{ at: number; clearAt?: number; label?: string }> = ({ at, clearAt, label = "synthesizing via gemini-2.5-flash…" }) => {
  const f = useCurrentFrame();
  if (f < at || (clearAt !== undefined && f >= clearAt)) return null;
  return (
    <Springy from={at} style={{ position: "absolute", left: "50%", bottom: 235, transform: "translateX(-50%)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: F.sans, fontSize: 13.5, fontWeight: 600, color: C.ink, background: "#fff", border: `1.2px solid ${C.border}`, borderRadius: 999, padding: "8px 16px", boxShadow: SHADOW_FLOAT }}>
        <Spinner size={16} /> {label}
      </span>
    </Springy>
  );
};

export const AppFrame: React.FC<{
  warnings?: number;
  meta: { nodes: number; edges: number; undo?: number };
  tab: "prd" | "critic" | "tf" | null;
  docsContent: React.ReactNode;
  voice: { recording: boolean; typing: { text: string; from: number; cps: number } | null; pressed?: boolean; loading?: boolean };
  loadingPill?: { at: number; clearAt?: number };
  bottomHint?: React.ReactNode;
  engine?: string;
  children: React.ReactNode;
}> = ({ warnings = 0, meta, tab = null, docsContent, voice, loadingPill, bottomHint, engine = "gemini", children }) => {
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 64, right: 0, bottom: 320 }}>{children}</div>
      <LogoBadge engine={engine} />
      <Toolbar warnings={warnings} activeTab={tab ?? undefined} />
      <ShareBtn />
      {docsContent !== null ? <DocsPanel tab={(tab ?? "prd") as "prd" | "critic" | "tf"}>{docsContent}</DocsPanel> : null}
      <div style={{ position: "absolute", left: "50%", bottom: 24, transform: "translateX(-50%)" }}>
        {bottomHint ? <div style={{ position: "absolute", bottom: 118 }}>{bottomHint}</div> : null}
        <VoiceBar typing={voice.typing} recording={voice.recording} pressed={voice.pressed} loading={voice.loading} />
      </div>
      {loadingPill ? <LoadingPill at={loadingPill.at} clearAt={loadingPill.clearAt} /> : null}
      <MetaChip nodes={meta.nodes} edges={meta.edges} undo={meta.undo ?? 0} />
    </div>
  );
};

export const ExportChips: React.FC<{ at: number }> = ({ at }) => {
  const items: Array<[string, string]> = [
    ["📝", "archflow-prd.md"],
    ["📌", "archflow-review.md"],
    ["🧱", "main.tf"],
    ["🔗", "diagram.mmd"],
    ["📦", "archflow.json"],
  ];
  return (
    <div style={{ position: "absolute", left: "50%", bottom: 250, transform: "translateX(-50%)", display: "flex", gap: 10 }}>
      {items.map(([icon, name], i) => (
        <Springy key={name} from={at + i * 9} y={16}>
          <Chip style={{ fontSize: 12.5, padding: "5px 12px", textTransform: "none" }}>
            {icon} {name}
          </Chip>
        </Springy>
      ))}
    </div>
  );
};

export const PaperDots: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      backgroundColor: "#ffffff",
      backgroundImage: `radial-gradient(${C.dot} 1.3px, transparent 1.3px)`,
      backgroundSize: "24px 24px",
    }}
  />
);

export const Toast: React.FC<{ at: number; children: React.ReactNode; clearAt?: number; style?: React.CSSProperties }> = ({ at, children, clearAt, style }) => {
  const f = useCurrentFrame();
  if (f < at || (clearAt !== undefined && f >= clearAt)) return null;
  const p = interpolate(f, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        display: "inline-flex",
        gap: 9,
        alignItems: "center",
        background: "#fff",
        border: `1.5px solid ${C.ink}`,
        borderRadius: ROUGH_SM,
        padding: "9px 16px",
        boxShadow: SHADOW_FLOAT,
        fontFamily: F.hand,
        fontSize: 23,
        fontWeight: 600,
        color: C.ink,
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

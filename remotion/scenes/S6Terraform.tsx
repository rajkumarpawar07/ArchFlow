import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AppFrame, Toast } from "../appframe";
import { SketchCanvas } from "../sketch";
import { NODES, E, TF_CODE } from "../data";
import { C, F } from "../theme";
import { Springy } from "../ui";
import type { NodeSpec, EdgeSpec } from "../data";

const NODES_SEEN: NodeSpec[] = [
  { node: NODES.mobile, at: 0 },
  { node: NODES.api_gateway, at: 0 },
  { node: NODES.pubsub_dlq, at: 0 },
  { node: NODES.cloud_run_workers, at: 0 },
  { node: NODES.spanner, at: 0 },
  { node: NODES.memorystore, at: 0 },
  { node: NODES.bigquery, at: 0 },
  { node: NODES.orders_dlq, at: 0 },
];

const EDGES_SEEN: EdgeSpec[] = [
  { edge: E.e1, at: 0 },
  { edge: E.e2, at: 0 },
  { edge: E.e3, at: 0 },
  { edge: E.e4_spanner, at: 0 },
  { edge: E.e5, at: 0 },
  { edge: E["e-cache"], at: 0 },
  { edge: E["e-dlq"], at: 0 },
];

const KEYWORDS = ["resource", "provider", "dead_letter_policy", "scaling", "template"];

function tokenize(line: string) {
  const out: { text: string; kind: "kw" | "str" | "com" | "pl" }[] = [];
  if (line.trim().startsWith("#")) return [{ text: line, kind: "com" as const }];
  const re = /("(?:[^"\\]|\\.)*")|(\b(?:google_[a-z0-9_]+|[a-z]+_[a-z0-9_]+)\b)|(resource|provider)/g;
  let last = 0;
  let m: RegExpExecArray | null = re.exec(line);
  while (m) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), kind: "pl" });
    if (m[0].startsWith("\"")) out.push({ text: m[0], kind: "str" });
    else if (m[0] === "resource" || m[0] === "provider") out.push({ text: m[0], kind: "kw" });
    else out.push({ text: m[0], kind: "pl" });
    last = m.index + m[0].length;
    m = re.exec(line);
  }
  if (last < line.length) out.push({ text: line.slice(last), kind: "pl" });
  const flat: ("kw" | "str" | "com" | "pl")[] = [];
  return out.map((tk) => {
    if (KEYWORDS.includes(tk.text.trim())) flat.push("kw");
    return tk;
  });
}

const colors: Record<string, string> = { kw: "#8250df", str: "#0a7d32", com: "#8b949e", pl: "#24292e" };

const CodeLines: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const lines = TF_CODE.split("\n");
  const shown = Math.max(0, Math.floor((f - from - 8) / 3.4));
  return (
    <div style={{ fontFamily: F.mono, fontSize: 14.5, lineHeight: 1.52, color: "#24292e" }}>
      {lines.slice(0, shown).map((ln, i) => (
        <div key={i} style={{ whiteSpace: "pre" }}>
          {tokenize(ln).map((tk, j) => (
            <span key={j} style={{ color: colors[tk.kind], fontWeight: tk.kind === "kw" ? 700 : 400 }}>
              {tk.text}
            </span>
          ))}
          {shown === i + 1 ? <span style={{ display: "inline-block", width: 8, height: 15, background: C.primary, transform: "translateY(2px)" }} /> : null}
        </div>
      ))}
    </div>
  );
};

/** 16s: terraform generated live — typed into the code card, exports pinned. */
export const S6Terraform: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AppFrame
      warnings={1}
      meta={{ nodes: 8, edges: 7, undo: 3 }}
      tab="tf"
      docsContent={
        <div style={{ fontFamily: F.mono, fontSize: 12.5, color: "#24292e", lineHeight: 1.5 }}>
          <div style={{ color: "#8b949e" }}># ArchFlow starter</div>
          <div>
            <span style={{ color: "#8250df", fontWeight: 700 }}>resource</span> <span style={{ color: "#0a7d32" }}>{"\u201Cgoogle_spanner_instance\u201D"}
            </span>{" "}
            <span style={{ color: "#0a7d32" }}>{"\u201Cmain\u201D"}</span> {"{"}
          </div>
          <div>{`  config    = "nam6"`}</div>
          <div>{`  num_nodes = 3`}</div>
          <div>{"}"}</div>
          <div style={{ marginTop: 6, color: "#8b949e" }}># + DLQ policy on orders_sub</div>
          <div>{`# (see main.tf card)`}</div>
        </div>
      }
      voice={{ recording: false, typing: null }}
      bottomHint={
        f >= 340 ? (
          <Springy from={340} style={{ position: "absolute", left: "50%", bottom: 104 }}>
            <span style={{ fontFamily: F.hand, fontSize: 24, fontWeight: 600, color: C.ink70 }}>diagram ↔ PRD ↔ main.tf — always in sync 🔁</span>
          </Springy>
        ) : null
      }
    >
      <SketchCanvas nodes={NODES_SEEN} edges={EDGES_SEEN} width="100%" height="100%" />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 140,
          width: 920,
          opacity: interpolate(f, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(f, [4, 16], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          background: "#fff",
          border: `2px solid ${C.ink}`,
          borderRadius: 14,
          boxShadow: "4px 5px 0 rgba(30,30,30,0.2)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: `1.5px dashed ${C.border}`, background: C.yellowSoft }}>
          <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700 }}>🧱 main.tf</span>
          <span style={{ marginLeft: "auto", fontFamily: F.sans, fontSize: 12.5, color: C.green, fontWeight: 700 }}>terraform plan ready in 60s ⚡</span>
        </div>
        <div style={{ margin: 0, padding: "12px 18px 16px", height: 560, whiteSpace: "pre", background: C.codeBg, overflow: "hidden" }}>
          <CodeLines from={6} />
        </div>
      </div>
      <Toast at={300} clearAt={390} style={{ right: 420, top: 96 }}>
        📦 exports: .md · .tf · .mmd · .json
      </Toast>
    </AppFrame>
  );
};

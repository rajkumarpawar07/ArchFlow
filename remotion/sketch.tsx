import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { NodeSpec, EdgeSpec } from "./data";
import { CANON } from "./data";
import { C, F, SHADOW_SOFT, ROUGH } from "./theme";
import { NODE_COLORS, NODE_FILLS, logoForNode } from "./sketchData";

type Vec2 = { x: number; y: number };

const HALF_W = 110;
const HALF_H = 68;
const CLEAR = 8;

type Anchor = "right" | "left" | "top" | "bottom";

function anchor(pos: Vec2, a: Anchor): Vec2 {
  switch (a) {
    case "right":
      return { x: pos.x + HALF_W + CLEAR, y: pos.y };
    case "left":
      return { x: pos.x - HALF_W - CLEAR, y: pos.y };
    case "top":
      return { x: pos.x, y: pos.y - HALF_H - CLEAR };
    case "bottom":
      return { x: pos.x, y: pos.y + HALF_H + CLEAR };
  }
}

// Rounded orthogonal polyline through waypoints (quadratic corner easing).
function roundedPath(pts: Vec2[], r = 15): string {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const last = i === pts.length - 1;
    const p = pts[i];
    const prev = pts[i - 1];
    if (!last) {
      const next = pts[i + 1];
      const vIn = { x: p.x - prev.x, y: p.y - prev.y };
      const vOut = { x: next.x - p.x, y: next.y - p.y };
      const inLen = Math.hypot(vIn.x, vIn.y) || 1;
      const outLen = Math.hypot(vOut.x, vOut.y) || 1;
      const rr = Math.min(r, inLen / 2, outLen / 2);
      const aP = { x: p.x - (vIn.x / inLen) * rr, y: p.y - (vIn.y / inLen) * rr };
      const bP = { x: p.x + (vOut.x / outLen) * rr, y: p.y + (vOut.y / outLen) * rr };
      d += ` L ${aP.x} ${aP.y} Q ${p.x} ${p.y} ${bP.x} ${bP.y}`;
    } else {
      d += ` L ${p.x} ${p.y}`;
    }
  }
  return d;
}

function polyMid(pts: Vec2[]): Vec2 {
  let total = 0;
  const lens: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    lens.push(l);
    total += l;
  }
  let acc = 0;
  for (let i = 0; i < lens.length; i++) {
    if (acc + lens[i] >= total / 2) {
      const t = (total / 2 - acc) / lens[i];
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t };
    }
    acc += lens[i];
  }
  return pts[pts.length - 1];
}

type Route = { from: Anchor; to: Anchor; kind: "hz" | "vw" | "ve" | "vv" };

function buildPath(from: Vec2, to: Vec2, style: Route): { d: string; mid: Vec2 } {
  const a = anchor(from, style.from);
  const b = anchor(to, style.to);
  if (style.kind === "vv") {
    return { d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  }
  if (style.kind === "vw") {
    const pts = [a, { x: a.x, y: a.y + 22 }, { x: from.x - HALF_W - 22, y: a.y + 22 }, { x: from.x - HALF_W - 22, y: b.y }, b];
    return { d: roundedPath(pts), mid: polyMid(pts) };
  }
  if (style.kind === "ve") {
    const busY = Math.max(a.y, b.y - HALF_H - CLEAR) + 24;
    const pts = [a, { x: a.x, y: busY }, { x: b.x, y: busY }, b];
    return { d: roundedPath(pts), mid: polyMid(pts) };
  }
  // horizontal
  if (Math.abs(b.y - a.y) < 6) {
    return { d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  }
  const span = b.x - a.x;
  const dx = Math.max(30, Math.min(130, span * 0.45));
  const c1: Vec2 = { x: a.x + dx, y: a.y };
  const c2: Vec2 = { x: b.x - dx, y: b.y };
  const mt = 0.5;
  const mid: Vec2 = {
    x: mt * mt * mt * a.x + 3 * mt * mt * (1 - mt) * c1.x + 3 * mt * (1 - mt) * (1 - mt) * c2.x + (1 - mt) * (1 - mt) * (1 - mt) * b.x,
    y: mt * mt * mt * a.y + 3 * mt * mt * (1 - mt) * c1.y + 3 * mt * (1 - mt) * (1 - mt) * c2.y + (1 - mt) * (1 - mt) * (1 - mt) * b.y,
  };
  return { d: `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`, mid };
}

function edgeStyleFor(e: EdgeSpec): Route {
  switch (e.edge.id) {
    case "e-cache":
      return { from: "bottom", to: "left", kind: "vw" };
    case "e5":
      return { from: "bottom", to: "top", kind: "ve" };
    case "e-dlq":
      return { from: "top", to: "bottom", kind: "vv" };
  }
  return { from: "right", to: "left", kind: "hz" };
}

// Greedy ≤11-char lines so pills fit the ~90px inter-card gaps; camel words
// pre-split at boundaries; vertical routes get room and keep the raw label.
function pillLines(label: string, roomy: boolean): string[] {
  const raw = label.split(" ");
  if (roomy && raw.every((w) => w.length <= 11)) return [label];
  const words = flatMapForCamel(raw);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > 11) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function flatMapForCamel(raw: string[]): string[] {
  const out: string[] = [];
  for (const w of raw) out.push(...w.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(" ").filter(Boolean));
  return out;
}

const EdgeBits: React.FC<{ spec: EdgeSpec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const life = f - spec.at;
  if (life < 0) return null;
  let gone = 1;
  if (spec.goneAt !== undefined && f >= spec.goneAt) {
    gone = 1 - Math.min(1, (f - spec.goneAt) / 14);
    if (gone <= 0) return null;
  }
  const p = spring({ frame: life, fps, config: { damping: 200, stiffness: 80, mass: 0.6 }, durationInFrames: 26 });
  const s = CANON[spec.edge.source];
  const t = CANON[spec.edge.target] ?? s;
  const style = edgeStyleFor(spec);
  const { d, mid } = buildPath(s, t, style);
  const lines = pillLines(spec.edge.label ?? "", style.kind !== "hz");
  const lineH = 20;
  const pillW = Math.max(...lines.map((l) => l.length)) * 7.9 + 14;
  const pillH = lines.length * lineH + 10;
  const marching = spec.edge.protocol === "Pub/Sub" || spec.edge.protocol === "streaming" || spec.edge.protocol === "DLQ";
  const dashOffset = -(f * 0.55);
  return (
    <g opacity={gone}>
      <path
        d={d}
        fill="none"
        stroke={C.ink}
        strokeWidth={2.4}
        strokeDasharray={"1"}
        pathLength={1}
        strokeDashoffset={1 - p}
        markerEnd="url(#arrow)"
        opacity={p}
      />
      {p >= 1 && marching ? (
        <path d={d} fill="none" stroke={C.primary} strokeWidth={2.4} strokeDasharray={"7 9"} strokeDashoffset={dashOffset} opacity={0.55} />
      ) : null}
      <g opacity={interpolate(p, [0.75, 1], [0, 1], { extrapolateRight: "clamp" })} transform={`translate(${mid.x}, ${mid.y})`}>
        <rect x={-pillW / 2} y={-pillH / 2 + 1} width={pillW} height={pillH} rx={9} fill="#fff" opacity={0.97} stroke="rgba(30,30,30,0.3)" strokeWidth={1} />
        {lines.map((line, i) => (
          <text
            key={i}
            textAnchor="middle"
            dominantBaseline="middle"
            x={0}
            y={(i - (lines.length - 1) / 2) * lineH}
            fontFamily={F.hand}
            fontSize={17.5}
            fontWeight={600}
            fill={C.ink}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  );
};

function roughRadiusFor(type: string): string {
  switch (type) {
    case "actor":
      return "50% / 55%";
    case "gateway":
    case "cache":
      return "20px";
    case "messaging":
      return "999px";
    default:
      return "16px";
  }
}

const SketchNode: React.FC<{ spec: NodeSpec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { node } = spec;
  const pos = CANON[node.slot ?? node.id];

  const pop = spring({ frame: Math.max(0, f - spec.at), fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });
  const visible = f >= spec.at && (!spec.exitAt || f < spec.exitAt);

  let exit = 1;
  let exitRot = 0;
  if (spec.exitAt && f >= spec.exitAt) {
    const t = Math.min(1, (f - spec.exitAt) / 16);
    exit = 1 - t;
    exitRot = -10 * t;
  }
  const opacity = pop * (spec.exitAt ? exit : 1);
  const scale = (0.55 + 0.45 * pop) * (spec.exitAt ? exit * exit : 1);

  const stroke = NODE_COLORS[node.type] ?? C.ink50;
  const fill = NODE_FILLS[node.type] ?? "#f8f9fa";
  const logo = logoForNode(node.label, node.sublabel ?? "", node.type);
  const LogoIcon = logo.Icon;
  const tilt = ((node.label.length % 3) - 1) * 0.9;

  if (!visible && f < spec.at - 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x - HALF_W,
        top: pos.y - HALF_H,
        width: HALF_W * 2,
        opacity,
        transform: `scale(${scale}) rotate(${tilt + exitRot}deg)`,
        filter: "url(#excali-rough)",
      }}
    >
      <div
        style={{
          borderRadius: roughRadiusFor(node.type),
          transform: node.type === "gateway" || node.type === "cache" ? "skewX(-6deg)" : undefined,
          background: fill,
          border: `2.5px solid ${stroke}`,
          boxShadow: SHADOW_SOFT,
          padding: "4px 16px",
          height: HALF_H * 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, transform: "skewX(0deg)" }}>
          <span style={{ color: logo.color, fontSize: 26, lineHeight: 1 }}>
            <LogoIcon style={{ width: 24, height: 24 }} />
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.ink70, textTransform: "uppercase" }}>{node.type}</span>
        </div>
        <div style={{ fontFamily: F.hand, fontSize: 33, fontWeight: 600, color: C.ink, lineHeight: "35px", marginTop: 2 }}>{node.label}</div>
        {node.sublabel ? (
          <div style={{ fontFamily: F.hand, fontSize: 23, fontWeight: 500, color: C.ink70, lineHeight: "25px" }}>{node.sublabel}</div>
        ) : null}
        {node.region ? (
          <div
            style={{
              display: "inline-block",
              marginTop: 4,
              fontFamily: F.mono,
              fontSize: 12,
              color: C.ink,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(30,30,30,0.55)",
              borderRadius: ROUGH,
              padding: "2px 8px",
              transform: "skewX(6deg)",
            }}
          >
            {node.region}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const SketchCanvas: React.FC<{
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  width: React.CSSProperties["width"];
  height: React.CSSProperties["height"];
  dim?: number;
}> = ({ nodes, edges, width, height, dim = 1 }) => {
  return (
    <div style={{ position: "absolute", inset: 0, opacity: dim }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={C.ink} />
          </marker>
        </defs>
        {edges.map((e) => (
          <EdgeBits key={e.edge.id} spec={e} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, width, height }}>
        {nodes.map((n) => (
          <SketchNode key={n.node.id} spec={n} />
        ))}
      </div>
    </div>
  );
};

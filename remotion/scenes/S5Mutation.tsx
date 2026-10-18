import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AppFrame, ExportChips, Toast } from "../appframe";
import { SketchCanvas } from "../sketch";
import { NODES, E, MUT_SPANNER, MUT_DLQ, WARN_CANONICAL, PRD_UPDATED } from "../data";
import { C, F } from "../theme";
import { MdType, Sticky, Springy, TypeText } from "../ui";
import type { NodeSpec, EdgeSpec } from "../data";
import { HeardChip } from "../appframe";

const nodesFor = (f: number): NodeSpec[] => [
  { node: NODES.mobile, at: 0 },
  { node: NODES.api_gateway, at: 0 },
  { node: NODES.pubsub_noDlq, at: 0, exitAt: 300 },
  { node: NODES.pubsub_dlq, at: 306 },
  { node: NODES.cloud_run_workers, at: 0 },
  { node: NODES.cloud_sql, at: 0, exitAt: 60 },
  { node: NODES.spanner, at: 78 },
  { node: NODES.memorystore, at: 120 },
  { node: NODES.bigquery, at: 0 },
  { node: NODES.orders_dlq, at: 296 },
];

const edgesFor = (f: number): EdgeSpec[] => [
  { edge: E.e1, at: 0 },
  { edge: E.e2, at: 0 },
  { edge: E.e3, at: 0 },
  { edge: E.e4_sql, at: 0, goneAt: 62 },
  { edge: E.e4_spanner, at: 100 },
  { edge: E.e5, at: 0 },
  { edge: E["e-cache"], at: 152 },
  { edge: E["e-dlq"], at: 320 },
];

const ReviewPanel: React.FC = () => {
  const f = useCurrentFrame();
  void f;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <Sticky sev="high" title={WARN_CANONICAL.spof.title} detail={WARN_CANONICAL.spof.detail} fix={WARN_CANONICAL.spof.fix} at={0} tiltr={0.6} exitAt={170} />
      <CheckMark at={176} label="SPOF solved — Spanner" clearAt={232} />
      <Sticky sev="high" title={WARN_CANONICAL.dlq.title} detail={WARN_CANONICAL.dlq.detail} fix={WARN_CANONICAL.dlq.fix} at={0} tiltr={-0.8} exitAt={345} />
      <Sticky sev="medium" title={WARN_CANONICAL.cache.title} detail={WARN_CANONICAL.cache.detail} fix={WARN_CANONICAL.cache.fix} at={0} tiltr={0.5} exitAt={210} />
      <CheckMark at={214} label="cache added" clearAt={266} />
      <Sticky sev="low" title={WARN_CANONICAL.cost.title} detail={WARN_CANONICAL.cost.detail} fix={WARN_CANONICAL.cost.fix} at={236} tiltr={0.5} />
      <CheckMark at={351} label="DLQ enabled" clearAt={410} />
    </div>
  );
};

const CheckMark: React.FC<{ at: number; label: string; clearAt?: number }> = ({ at, label, clearAt }) => {
  const f = useCurrentFrame();
  if (f < at || (clearAt !== undefined && f >= clearAt)) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
        fontFamily: F.hand,
        fontSize: 21,
        fontWeight: 700,
        color: C.green,
        background: C.greenSoft,
        border: `1.5px solid ${C.green}`,
        borderRadius: 10,
        padding: "5px 12px",
        transform: `rotate(-0.6deg)`,
      }}
    >
      ✅ {label}
    </span>
  );
};

/** 24s: two voice mutations — swap → Spanner + cache, add DLQ; spec + exports update. */
export const S5Mutation: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [500, 590], [1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tab: "critic" | "prd" = f < 380 ? "critic" : "prd";

  const counts = { nodes: f >= 296 ? 8 : f >= 78 ? 7 : 6, edges: f >= 320 ? 7 : f >= 152 ? 6 : 5 };

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: F.sans, color: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 42%" }}>
        <AppFrame
          warnings={f >= 345 ? 1 : f >= 170 ? 2 : 3}
          meta={{ nodes: counts.nodes, edges: counts.edges, undo: f >= 100 ? 3 : 2 }}
          tab={tab}
          docsContent={tab === "critic" ? <ReviewPanel /> : <MdType md={PRD_UPDATED} from={384} cps={7.6} />}
          voice={{ recording: false, typing: null }}
          bottomHint={null}
        >
          <SketchCanvas nodes={nodesFor(f)} edges={edgesFor(f)} width="100%" height="100%" />

          <HeardChip text={MUT_SPANNER} at={6} clearAt={235} cps={5} />
          <HeardChip text={MUT_DLQ} at={252} cps={5} />

          <Toast at={130} clearAt={240} style={{ left: 90, bottom: 60 }}>
            🧪 in-place swap · node id kept stable
          </Toast>
          <Toast at={330} clearAt={430} style={{ left: 90, bottom: 60 }}>
            🪝 pubsub got a DLQ — nothing drops
          </Toast>
          <Toast at={430} clearAt={600} style={{ right: 430, top: 90 }}>
            ✏️ PRD patched in place
          </Toast>
        </AppFrame>

        <ExportChips at={410} />

        <div style={{ position: "absolute", left: "50%", top: 108, transform: "translateX(-50%)" }}>
          <Springy from={560} y={16}>
            <span style={{ fontFamily: F.hand, fontSize: 30, fontWeight: 700, color: C.ink70 }}>voice patches only touch what changes 🩹</span>
          </Springy>
        </div>

        <div style={{ position: "absolute", left: "50%", bottom: 336, transform: "translateX(-50%)" }}>
          {f >= 240 && f < 400 ? (
            <span style={{ fontFamily: F.sans, fontSize: 13, color: "#868e96" }}>
              <TypeText text="patches stack · each keeps undo history ⌛" from={250} cps={3} />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

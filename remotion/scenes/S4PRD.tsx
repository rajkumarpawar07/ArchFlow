import React from "react";
import { useCurrentFrame } from "remotion";
import { AppFrame } from "../appframe";
import { SketchCanvas } from "../sketch";
import { NODES, E, PRD_BASE, WARN_CANONICAL } from "../data";
import { C, F } from "../theme";
import { MdType, Sticky, Springy } from "../ui";
import type { NodeSpec, EdgeSpec } from "../data";

const BASE_NODES: NodeSpec[] = [
  { node: NODES.mobile, at: 20 },
  { node: NODES.api_gateway, at: 20 },
  { node: NODES.pubsub_noDlq, at: 20 },
  { node: NODES.cloud_run_workers, at: 20 },
  { node: NODES.cloud_sql, at: 20 },
  { node: NODES.bigquery, at: 20 },
];

const BASE_EDGES: EdgeSpec[] = [
  { edge: E.e1, at: 20 },
  { edge: E.e2, at: 20 },
  { edge: E.e3, at: 20 },
  { edge: E.e4_sql, at: 20 },
  { edge: E.e5, at: 20 },
];

const ReviewStack: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
    <Sticky sev={WARN_CANONICAL.spof.severity} title={WARN_CANONICAL.spof.title} detail={WARN_CANONICAL.spof.detail} fix={WARN_CANONICAL.spof.fix} at={362} tiltr={0.6} />
    <Sticky sev={WARN_CANONICAL.dlq.severity} title={WARN_CANONICAL.dlq.title} detail={WARN_CANONICAL.dlq.detail} fix={WARN_CANONICAL.dlq.fix} at={382} tiltr={-0.8} />
    <Sticky sev={WARN_CANONICAL.cache.severity} title={WARN_CANONICAL.cache.title} detail={WARN_CANONICAL.cache.detail} fix={WARN_CANONICAL.cache.fix} at={402} tiltr={0.5} />
  </div>
);

/** 14s: PRD streams into the docs panel; staff-review stickies flip in. */
export const S4PRD: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AppFrame
      warnings={f >= 360 ? 3 : 0}
      meta={{ nodes: 6, edges: 5, undo: 1 }}
      tab={f < 350 ? "prd" : "critic"}
      docsContent={f < 350 ? <MdType md={PRD_BASE} from={15} cps={4.6} /> : <ReviewStack />}
      voice={{ recording: false, typing: null }}
      bottomHint={
        f >= 380 ? (
          <Springy from={380} style={{ position: "absolute", left: "50%", bottom: 104 }}>
            <span style={{ fontFamily: F.hand, fontSize: 24, fontWeight: 600, color: C.red }}>
              📌 3 red flags waiting — fix them by talking ⤴
            </span>
          </Springy>
        ) : null
      }
    >
      <SketchCanvas nodes={BASE_NODES} edges={BASE_EDGES} width="100%" height="100%" />
    </AppFrame>
  );
};

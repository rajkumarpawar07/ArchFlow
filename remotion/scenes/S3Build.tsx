import React from "react";
import { useCurrentFrame } from "remotion";
import { AppFrame, Toast } from "../appframe";
import { SketchCanvas } from "../sketch";
import { NODES, E } from "../data";
import { C, F } from "../theme";
import type { NodeSpec, EdgeSpec } from "../data";
import { Springy } from "../ui";

/** 17s: nodes pop one by one with dagre-style layout, PRD tab lights up. */
export const S3Build: React.FC = () => {
  const f = useCurrentFrame();

  const nodes: NodeSpec[] = [
    { node: NODES.mobile, at: 20 },
    { node: NODES.api_gateway, at: 80 },
    { node: NODES.pubsub_noDlq, at: 145 },
    { node: NODES.cloud_run_workers, at: 210 },
    { node: NODES.cloud_sql, at: 285 },
    { node: NODES.bigquery, at: 360 },
  ];
  const edges: EdgeSpec[] = [
    { edge: E.e1, at: 105 },
    { edge: E.e2, at: 170 },
    { edge: E.e3, at: 235 },
    { edge: E.e4_sql, at: 310 },
    { edge: E.e5, at: 385 },
  ];

  let v = 0;
  for (const n of nodes) if (f >= n.at) v++;
  let e2 = 0;
  for (const ed of edges) if (f >= ed.at) e2++;

  return (
    <AppFrame
      warnings={0}
      meta={{ nodes: v, edges: e2, undo: 0 }}
      tab={null}
      docsContent={null}
      voice={{ recording: false, typing: null, pressed: f > 0 && f < 10 }}
      loadingPill={{ at: 0, clearAt: 26 }}
      bottomHint={
        f >= 250 ? (
          <Springy from={250} style={{ position: "absolute", left: "50%", bottom: 110 }}>
            <span style={{ fontFamily: F.hand, fontSize: 23, fontWeight: 600, color: C.ink70, textAlign: "center" }}>{""}</span>
          </Springy>
        ) : null
      }
    >
      <SketchCanvas nodes={nodes} edges={edges} width="100%" height="100%" />
      <Toast at={300} clearAt={470} style={{ left: 90, bottom: 60 }}>
        ✨ gemini structured the graph · Zod-validated
      </Toast>
    </AppFrame>
  );
};

import dagre from "dagre";
import type { ArchEdge, ArchNode } from "./schema";

export type RFNode = {
  id: string;
  type?: string;
  data: { label: string; sublabel?: string; nodeType: string; region?: string };
  position: { x: number; y: number };
};

export type RFEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
};

export function layoutGraph(
  nodes: ArchNode[],
  edges: ArchEdge[]
): { rfNodes: RFNode[]; rfEdges: RFEdge[] } {
  const g = new dagre.graphlib.Graph();
  // Node bbox matches the rendered SketchNode (~230w × ~104h incl. sublabel + region chip),
  // so dagre doesn't stack taller real nodes on top of each other.
  const NODE_W = 230;
  const NODE_H = 104;
  g.setGraph({
    rankdir: "LR",
    nodesep: 90, // breathing room between nodes on the same rank
    edgesep: 60,
    ranksep: 170, // clear lane between ranks so edge labels never collide
    marginx: 24,
    marginy: 24,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => {
    if (nodes.find((n) => n.id === e.source) && nodes.find((n) => n.id === e.target)) {
      g.setEdge(e.source, e.target);
    }
  });
  dagre.layout(g);

  const rfNodes: RFNode[] = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      data: {
        label: n.label,
        sublabel: n.sublabel || "",
        nodeType: n.type,
        region: n.region || "",
      },
      position: { x: (pos?.x ?? 0) - NODE_W / 2, y: (pos?.y ?? 0) - NODE_H / 2 },
    };
  });

  const rfEdges: RFEdge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label || e.protocol || "",
    animated: e.protocol?.toLowerCase().includes("pub") || e.label?.toLowerCase().includes("event"),
  }));

  return { rfNodes, rfEdges };
}

export const NODE_COLORS: Record<string, string> = {
  actor: "#1971c2",
  gateway: "#5f3dc4",
  compute: "#2b8a3e",
  messaging: "#e67700",
  data: "#1864ab",
  cache: "#c2255c",
  security: "#a61e4d",
  analytics: "#0b7285",
  generic: "#495057",
};

// Soft Excalidraw-style fill per type
export const NODE_FILLS: Record<string, string> = {
  actor: "#d0ebff",
  gateway: "#e5dbff",
  compute: "#d3f9d8",
  messaging: "#ffec99",
  data: "#dbe4ff",
  cache: "#ffdeeb",
  security: "#ffd6e0",
  analytics: "#c5f6fa",
  generic: "#f1f3f5",
};

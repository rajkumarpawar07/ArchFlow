import dagre from "dagre";
import type { ArchEdge, ArchNode, ArchState } from "../lib/schema";
import { logoForNode } from "../lib/serviceLogos";
import { NODE_COLORS, NODE_FILLS } from "../lib/layout";

export { NODE_COLORS, NODE_FILLS, logoForNode };
export type { ArchEdge, ArchNode, ArchState };

export type Vec = { x: number; y: number };

/** Canonical final graph: order-flow with Spanner + Memorystore + DLQ. */
export const FINAL_NODES: ArchNode[] = [
  { id: "mobile", type: "actor", label: "Mobile clients", sublabel: "iOS / Android", region: "" },
  { id: "api_gateway", type: "gateway", label: "API Gateway", sublabel: "Auth + rate limit", region: "" },
  { id: "pubsub_orders", type: "messaging", label: "Pub/Sub orders", sublabel: "event buffer", region: "" },
  { id: "cloud_run_workers", type: "compute", label: "Cloud Run workers", sublabel: "0-200 instances", region: "us-central1" },
  { id: "memorystore", type: "cache", label: "Memorystore Redis", sublabel: "hot reads", region: "us-central1" },
  { id: "spanner", type: "data", label: "Cloud Spanner", sublabel: "multi-region nam6", region: "nam6" },
  { id: "bigquery", type: "analytics", label: "BigQuery", sublabel: "orders_analytics", region: "US" },
  { id: "orders_dlq", type: "messaging", label: "orders-dlq", sublabel: "7d retention", region: "" },
];

export const FINAL_EDGES: ArchEdge[] = [
  { id: "e1", source: "mobile", target: "api_gateway", label: "POST /v1/orders", protocol: "HTTPS" },
  { id: "e2", source: "api_gateway", target: "pubsub_orders", label: "OrderCreated", protocol: "Pub/Sub" },
  { id: "e3", source: "pubsub_orders", target: "cloud_run_workers", label: "pull", protocol: "Pub/Sub" },
  { id: "e-cache", source: "cloud_run_workers", target: "memorystore", label: "hot reads", protocol: "RESP" },
  { id: "e4", source: "cloud_run_workers", target: "spanner", label: "writes", protocol: "Spanner API" },
  { id: "e5", source: "cloud_run_workers", target: "bigquery", label: "OrderCompleted", protocol: "streaming" },
  { id: "e-dlq", source: "pubsub_orders", target: "orders_dlq", label: "5x failures", protocol: "DLQ" },
];

export const NODE_W = 236;
export const NODE_H = 100;
export const NODE_HALF = { x: NODE_W / 2, y: NODE_H / 2 };

type NodeSpec = { node: ArchNode; at: number; exitAt?: number };
type EdgeSpec = { edge: ArchEdge; at: number };

type SketchProps = {
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  positions: Record<string, Vec>;
  labelOverride?: Record<string, string>;
  region?: Record<string, string | undefined>;
};

// Hand-laid coordinates (center points) inside the canvas area — deterministic
// and stable across scenes. Canvas area occupies roughly x 40..1560, y 10..1000.
export const CANON: Record<string, Vec> = {
  mobile: { x: 120, y: 490 },
  api_gateway: { x: 440, y: 490 },
  pubsub_orders: { x: 760, y: 490 },
  cloud_run_workers: { x: 1080, y: 490 },
  memorystore: { x: 1240, y: 280 },
  spanner: { x: 1400, y: 490 },
  bigquery: { x: 1400, y: 720 },
  orders_dlq: { x: 760, y: 250 },
};

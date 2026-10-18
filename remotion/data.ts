import type { ArchEdge, ArchNode } from "../lib/schema";

export type Vec = { x: number; y: number };

/** Hand-laid node center coordinates inside the canvas region (stable across scenes).
 *  Column pitch ~310px so ~90px gaps fit edge label pills; rows: 470 main, 250/230 top, 700 bottom. */
export const CANON: Record<string, Vec> = {
  mobile: { x: 110, y: 470 },
  api_gateway: { x: 420, y: 470 },
  pubsub_orders: { x: 730, y: 470 },
  cloud_run_workers: { x: 1040, y: 470 },
  memorystore: { x: 1190, y: 250 },
  spanner: { x: 1350, y: 470 },
  bigquery: { x: 1350, y: 700 },
  orders_dlq: { x: 730, y: 230 },
  // cloud_sql occupies the spanner slot until it is swapped for Spanner
  cloud_sql: { x: 1350, y: 470 },
};

export type VNode = { id: string; type: string; label: string; sublabel?: string; region?: string; slot?: string };

export type NodeSpec = { node: VNode; at: number; exitAt?: number | null };
export type EdgeSpec = { edge: ArchEdge; at: number; goneAt?: number };

export const NODES: Record<string, VNode> = {
  mobile: { id: "mobile", type: "actor", label: "Mobile clients", sublabel: "iOS / Android" },
  api_gateway: { id: "api_gateway", type: "gateway", label: "API Gateway", sublabel: "Auth + rate limit" },
  pubsub_noDlq: { id: "pubsub_orders", type: "messaging", label: "Pub/Sub orders", sublabel: "no DLQ" },
  pubsub_dlq: { id: "pubsub_orders", type: "messaging", label: "Pub/Sub orders", sublabel: "+ DLQ enabled" },
  cloud_run_workers: { id: "cloud_run_workers", type: "compute", label: "Cloud Run workers", sublabel: "0-200 instances", region: "us-central1" },
  cloud_sql: { id: "cloud_sql", type: "data", label: "Cloud SQL", sublabel: "Postgres zonal", region: "us-central1", slot: "spanner" },
  spanner: { id: "spanner", type: "data", label: "Cloud Spanner", sublabel: "multi-region nam6", region: "nam6" },
  memorystore: { id: "memorystore", type: "cache", label: "Memorystore Redis", sublabel: "hot reads", region: "us-central1" },
  bigquery: { id: "bigquery", type: "analytics", label: "BigQuery", sublabel: "orders_analytics", region: "US" },
  orders_dlq: { id: "orders_dlq", type: "messaging", label: "orders-dlq", sublabel: "7d retention" },
};

export const BASE_IDS = ["mobile", "api_gateway", "pubsub_noDlq", "cloud_run_workers", "cloud_sql", "bigquery"];

export const E: Record<string, ArchEdge> = {
  e1: { id: "e1", source: "mobile", target: "api_gateway", label: "POST /v1/orders", protocol: "HTTPS" },
  e2: { id: "e2", source: "api_gateway", target: "pubsub_orders", label: "OrderCreated", protocol: "Pub/Sub" },
  e3: { id: "e3", source: "pubsub_orders", target: "cloud_run_workers", label: "pull", protocol: "Pub/Sub" },
  e4_sql: { id: "e4", source: "cloud_run_workers", target: "cloud_sql", label: "writes · SQL", protocol: "SQL" },
  e4_spanner: { id: "e4", source: "cloud_run_workers", target: "spanner", label: "writes · Spanner API", protocol: "Spanner API" },
  e5: { id: "e5", source: "cloud_run_workers", target: "bigquery", label: "OrderCompleted", protocol: "streaming" },
  "e-cache": { id: "e-cache", source: "cloud_run_workers", target: "memorystore", label: "hot reads", protocol: "RESP" },
  "e-dlq": { id: "e-dlq", source: "pubsub_orders", target: "orders_dlq", label: "5x failures", protocol: "DLQ" },
};

export const RAMBLE =
  "Let's design an event-driven order processing system on GCP. Mobile clients hit an API Gateway, which pushes events to Pub/Sub. A fleet of Cloud Run workers processes orders and writes to Cloud SQL, while pushing analytics to BigQuery.";

export const MUT_SPANNER =
  "Actually, Cloud SQL won't scale for global writes. Swap Cloud SQL for Cloud Spanner and put Memorystore in front of checkout.";

export const MUT_DLQ =
  "Add a Dead Letter Queue to that Pub/Sub topic so we don't drop failed payment events.";

export const PRD_BASE = `## Overview
Event-driven order processing on GCP. Mobile clients -> API Gateway -> Pub/Sub -> Cloud Run workers -> Cloud SQL + BigQuery analytics.

## Goals
- Accept orders at 5k rps peak, p99 ingest < 300ms
- Zero dropped payment events
- Global-ready checkout path

## Component Breakdown
- API Gateway: auth, rate-limit, request validation
- Pub/Sub topic \`orders\`: durable event buffer
- Cloud Run workers: idempotent order processor fleet
- **Cloud SQL** (Postgres, zonal)
- BigQuery: analytics sink via streaming insert

## Open Risks
- No DLQ — payment failures will be lost.`;

export const PRD_UPDATED = `## Overview
Event-driven order processing on GCP. Mobile clients -> API Gateway -> Pub/Sub -> Cloud Run workers -> **Cloud Spanner** + BigQuery analytics.

## Goals
- Accept orders at 5k rps peak, p99 ingest < 300ms
- Zero dropped payment events
- Global-ready checkout path

## Component Breakdown
- API Gateway: auth, rate-limit
- Pub/Sub \`orders\` + \`orders-dlq\` (7d retention)
- Cloud Run workers: idempotent processor fleet
- ** memorystore ** checkout cache (hot reads)
- **Cloud Spanner** (multi-region write scale)
- BigQuery: analytics sink

## Open Risks
- Spanner cost at scale — monitor interleaved tables.`;

export const TF_CODE = `# ArchFlow starter — terraform plan ready in 60s
provider "google" {
  project = var.project_id
  region  = "us-central1"
}

resource "google_pubsub_topic" "orders" {
  name = "orders"
}

resource "google_pubsub_topic" "orders_dlq" {
  name = "orders-dlq"
}

resource "google_pubsub_subscription" "orders_sub" {
  name  = "orders-worker-sub"
  topic = google_pubsub_topic.orders.name
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.orders_dlq.id
    max_delivery_attempts = 5
  }
}

resource "google_cloud_run_v2_service" "workers" {
  name = "order-workers"
  template { scaling { max_instance_count = 200 } }
}

resource "google_spanner_instance" "main" {
  name      = "orders-spanner"
  config    = "nam6"
  num_nodes = 3
}

resource "google_redis_instance" "checkout_cache" {
  tier           = "STANDARD_HA"
  memory_size_gb = 4
}

resource "google_bigquery_dataset" "analytics" {
  dataset_id = "orders_analytics"
}`;

export type Warning = { severity: "high" | "medium" | "low"; title: string; detail: string; fix: string };

export const WARN_CANONICAL: Record<string, Warning> = {
  spof: { severity: "high", title: "SPOF: Cloud SQL for global writes", detail: "Single-region Cloud SQL bottlenecks cross-region writes.", fix: "Swap Cloud SQL for Spanner." },
  dlq: { severity: "high", title: "Missing DLQ on Pub/Sub", detail: "Failed payment events die after 5 retries.", fix: "Add a Dead Letter Queue." },
  cache: { severity: "medium", title: "No cache in front of checkout", detail: "Hot reads hit the DB on every order.", fix: "Put Memorystore in front." },
  cost: { severity: "low", title: "Cost watch: Spanner + Redis", detail: "Multi-region nodes + HA dominate at low traffic.", fix: "Start 1-node; autoscale." },
};

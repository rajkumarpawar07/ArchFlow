import type { ArchState } from "./schema";

function prdForOrder(useSpanner: boolean, withCache: boolean, withDlq: boolean): string {
  const db = useSpanner
    ? "- **Cloud Spanner** (multi-region, global consistency, horizontal write scale)"
    : "- **Cloud SQL** (Postgres, zonal — known bottleneck for global writes)";
  const cache = withCache ? "- **Memorystore Redis** in front of checkout for hot reads\n" : "";
  const dlq = withDlq ? "- **Pub/Sub DLQ**: `orders-dlq` with 7-day retention + alerting\n" : "";
  return `## Overview
Event-driven order processing on GCP. Mobile clients -> API Gateway -> Pub/Sub -> Cloud Run workers -> ${useSpanner ? "Spanner" : "Cloud SQL"} + BigQuery analytics.

## Goals
- Accept orders at 5k rps peak, p99 ingest < 300ms
- Zero dropped payment events
- Global-ready checkout path

## Component Breakdown
- **API Gateway**: auth, rate-limit, request validation
- **Pub/Sub topic \`orders\`**: durable event buffer
${dlq}- **Cloud Run workers**: idempotent order processor fleet
${cache}${db}
- **BigQuery**: analytics sink via streaming insert

## Data Flow & API Contracts
1. \`POST /v1/orders\` -> Gateway validates -> publishes \`OrderCreated {orderId, items[], paymentToken}\`
2. Workers pull Pub/Sub, process idempotently on \`orderId\`, write DB, emit \`OrderCompleted\` to BigQuery
3. Failures after 5 retries -> DLQ ${withDlq ? "(enabled)" : "(MISSING — add DLQ)"}

## Non-Functional Requirements
- Availability 99.95%, RPO 0 / RTO < 5min for orders
- Scaling: Run 0-200 instances on queue depth; ${useSpanner ? "Spanner scales writes horizontally" : "Cloud SQL vertical + read replicas only"}
- Latency: p99 checkout < 500ms ${withCache ? "via Redis" : "(no cache yet)"}

## Open Risks
- ${useSpanner ? "Spanner cost at scale — monitor interleaved tables." : "Cloud SQL global write bottleneck — migrate to Spanner if cross-region writes grow."}
- ${withDlq ? "DLQ ops runbook needed." : "No DLQ — payment failures will be lost."}`;
}

function terraformForOrder(useSpanner: boolean, withCache: boolean, withDlq: boolean): string {
  return `# ArchFlow starter — terraform plan ready in 60s
provider "google" {
  project = var.project_id
  region  = "us-central1"
}

resource "google_pubsub_topic" "orders" {
  name = "orders"
}

${withDlq ? `resource "google_pubsub_topic" "orders_dlq" {
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
` : `# TODO: add orders-dlq + dead_letter_policy (flagged by Staff Review)
resource "google_pubsub_subscription" "orders_sub" {
  name  = "orders-worker-sub"
  topic = google_pubsub_topic.orders.name
}
`
}
resource "google_cloud_run_v2_service" "workers" {
  name     = "order-workers"
  location = "us-central1"
  template {
    containers {
      image = "gcr.io/PROJECT/order-workers:latest"
      env {
        name  = "DB_KIND"
        value = "${useSpanner ? "spanner" : "cloudsql"}"
      }
    }
    scaling { max_instance_count = 200 }
  }
}

${
  useSpanner
    ? `resource "google_spanner_instance" "main" {
  name         = "orders-spanner"
  display_name = "orders-spanner"
  config       = "nam6" # multi-region
  num_nodes    = 3
}`
    : `resource "google_sql_database_instance" "main" {
  name             = "orders-sql"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  settings { tier = "db-custom-4-16384" }
}`
}
${withCache ? `resource "google_redis_instance" "checkout_cache" {
  name           = "checkout-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 4
  region         = "us-central1"
}
` : ""}
resource "google_bigquery_dataset" "analytics" {
  dataset_id = "orders_analytics"
  location   = "US"
}
`;
}

function stateOrder(useSpanner: boolean, withCache: boolean, withDlq: boolean): ArchState {
  const nodes: ArchState["nodes"] = [
    { id: "mobile", type: "actor", label: "Mobile clients", sublabel: "iOS / Android", region: "" },
    { id: "api_gateway", type: "gateway", label: "API Gateway", sublabel: "Auth + rate limit", region: "" },
    { id: "pubsub_orders", type: "messaging", label: "Pub/Sub orders", sublabel: withDlq ? "+ DLQ enabled" : "no DLQ", region: "" },
    { id: "cloud_run_workers", type: "compute", label: "Cloud Run workers", sublabel: "0-200 instances", region: "us-central1" },
    ...(withCache
      ? [{ id: "memorystore", type: "cache" as const, label: "Memorystore Redis", sublabel: "checkout cache", region: "us-central1" }]
      : []),
    ...(useSpanner
      ? [{ id: "spanner", type: "data" as const, label: "Cloud Spanner", sublabel: "multi-region nam6", region: "nam6" }]
      : [{ id: "cloud_sql", type: "data" as const, label: "Cloud SQL", sublabel: "Postgres zonal", region: "us-central1" }]),
    { id: "bigquery", type: "analytics", label: "BigQuery", sublabel: "orders_analytics", region: "US" },
    ...(withDlq
      ? [{ id: "orders_dlq", type: "messaging" as const, label: "orders-dlq", sublabel: "7d retention", region: "" }]
      : []),
  ];
  const edges: ArchState["edges"] = [
    { id: "e1", source: "mobile", target: "api_gateway", label: "POST /v1/orders", protocol: "HTTPS" },
    { id: "e2", source: "api_gateway", target: "pubsub_orders", label: "OrderCreated", protocol: "Pub/Sub" },
    { id: "e3", source: "pubsub_orders", target: "cloud_run_workers", label: "pull", protocol: "Pub/Sub" },
    ...(withCache
      ? [{ id: "e-cache", source: "cloud_run_workers", target: "memorystore", label: "hot reads", protocol: "RESP" }]
      : []),
    { id: "e4", source: "cloud_run_workers", target: useSpanner ? "spanner" : "cloud_sql", label: "writes", protocol: useSpanner ? "Spanner API" : "SQL" },
    { id: "e5", source: "cloud_run_workers", target: "bigquery", label: "OrderCompleted", protocol: "streaming" },
    ...(withDlq
      ? [{ id: "e-dlq", source: "pubsub_orders", target: "orders_dlq", label: "5x failures", protocol: "DLQ" }]
      : []),
  ];
  const warnings: ArchState["warnings"] = [];
  if (!useSpanner)
    warnings.push({
      severity: "high",
      title: "SPOF: Cloud SQL for global writes",
      detail: "Single-region Cloud SQL will bottleneck cross-region write throughput and failover is minutes, not seconds.",
      fix: "Say: swap Cloud SQL for Spanner for horizontal global writes.",
    });
  if (!withDlq)
    warnings.push({
      severity: "high",
      title: "Missing DLQ on Pub/Sub",
      detail: "Failed payment events after retries have nowhere to go and will be dropped.",
      fix: "Say: add a Dead Letter Queue to the Pub/Sub topic.",
    });
  if (!withCache)
    warnings.push({
      severity: "medium",
      title: "No cache in front of checkout",
      detail: "Hot product/price reads hit the transactional DB on every order.",
      fix: "Say: put Memorystore Redis in front of checkout.",
    });
  if (useSpanner && withDlq && withCache)
    warnings.push({
      severity: "low",
      title: "Cost watch: Spanner + Redis",
      detail: "Multi-region Spanner nodes + HA Redis dominate the bill at low traffic.",
      fix: "Start with 1-node Spanner + basic tier Redis, autoscale with load.",
    });

  return {
    nodes,
    edges,
    prd_markdown: prdForOrder(useSpanner, withCache, withDlq),
    warnings,
    terraform_hcl: terraformForOrder(useSpanner, withCache, withDlq),
    cleaned_transcript: "",
  };
}

function stateGcpActiveActive(): ArchState {
  const nodes: ArchState["nodes"] = [
    { id: "users", type: "actor", label: "Global users", sublabel: "", region: "" },
    { id: "cloud_armor", type: "security", label: "Cloud Armor", sublabel: "DDoS + WAF", region: "global" },
    { id: "glb", type: "gateway", label: "Global LB", sublabel: "anycast", region: "global" },
    { id: "run_us", type: "compute", label: "Cloud Run us-central1", sublabel: "microservices", region: "us-central1" },
    { id: "run_eu", type: "compute", label: "Cloud Run europe-west1", sublabel: "microservices", region: "europe-west1" },
    { id: "spanner", type: "data", label: "Cloud Spanner", sublabel: "multi-region, strong consistency", region: "nam-eur" },
    { id: "bigquery", type: "analytics", label: "BigQuery", sublabel: "analytics sink", region: "US/EU" },
  ];
  const edges: ArchState["edges"] = [
    { id: "e1", source: "users", target: "cloud_armor", label: "HTTPS", protocol: "HTTPS" },
    { id: "e2", source: "cloud_armor", target: "glb", label: "filtered", protocol: "HTTPS" },
    { id: "e3", source: "glb", target: "run_us", label: "route", protocol: "HTTPS" },
    { id: "e4", source: "glb", target: "run_eu", label: "route", protocol: "HTTPS" },
    { id: "e5", source: "run_us", target: "spanner", label: "writes", protocol: "Spanner API" },
    { id: "e6", source: "run_eu", target: "spanner", label: "writes", protocol: "Spanner API" },
    { id: "e7", source: "run_us", target: "bigquery", label: "events", protocol: "streaming" },
  ];
  return {
    nodes,
    edges,
    prd_markdown: `## Overview
Multi-region active-active on GCP. Global LB + Cloud Armor -> Cloud Run in us-central1 + europe-west1 -> Cloud Spanner for global consistency + BigQuery analytics.

## Goals
- 99.99% availability, p99 < 200ms
- Survive single-region loss with no data loss

## Component Breakdown
- **Cloud Armor**: DDoS + WAF in front of everything
- **Global LB**: anycast routing to nearest healthy region
- **Cloud Run x2 regions**: stateless microservices, scale to zero
- **Cloud Spanner**: synchronous multi-region writes
- **BigQuery**: analytics

## Data Flow & API Contracts
1. Users -> Armor -> LB -> nearest Run
2. Run writes via Spanner API (TrueTime, external consistency)
3. Async event export to BigQuery

## Non-Functional Requirements
- RPO 0, RTO < 60s via Spanner multi-region
- Armor rate-limit + preconfigured WAF rules

## Open Risks
- Spanner + cross-region egress cost; cache hot reads if needed.`,
    warnings: [
      {
        severity: "low",
        title: "Egress + Spanner cost",
        detail: "Cross-region Spanner replication and egress dominate at scale.",
        fix: "Add Memorystore in each region for hot reads if p99/cost slips.",
      },
    ],
    terraform_hcl: `# Active-active GCP starter
provider "google" { project = var.project_id }

resource "google_compute_security_policy" "armor" {
  name = "armor-ddos-waf"
  rule {
    action   = "deny(403)"
    priority = 1000
    match { versioned_expr = "SRC_IPS_V1" config { src_ip_ranges = ["9.9.9.0/24"] } }
    description = "blocklist example"
  }
}

resource "google_cloud_run_v2_service" "svc_us" {
  name = "svc-us"; location = "us-central1"
  template { containers { image = "gcr.io/PROJECT/svc:latest" } }
}
resource "google_cloud_run_v2_service" "svc_eu" {
  name = "svc-eu"; location = "europe-west1"
  template { containers { image = "gcr.io/PROJECT/svc:latest" } }
}

resource "google_spanner_instance" "main" {
  name = "global-spanner"; config = "nam-eur"; num_nodes = 3
}
`,
    cleaned_transcript: "",
  };
}

const REMOVE_RE = /\b(remove|delete|drop|kill|get rid of|without|strip out|take out)\b/i;

// Which node to target for a removal, keyed by utterance keywords.
const REMOVE_TARGETS: Array<{ re: RegExp; match: (n: ArchState["nodes"][number]) => boolean }> = [
  { re: /\b(api[\s-]?gateway|gateway|apigee|api)\b/i, match: (n) => n.type === "gateway" || /gateway|\bapi\b/i.test(n.id + " " + n.label) },
  { re: /\b(cache|redis|memorystore)\b/i, match: (n) => n.type === "cache" || /cache|redis|memorystore/i.test(n.id + " " + n.label) },
  { re: /\b(dlq|dead letter)\b/i, match: (n) => /dlq|dead/i.test(n.id + " " + n.label + " " + (n.sublabel ?? "")) },
  { re: /\b(bigquery|analytics)\b/i, match: (n) => n.type === "analytics" || /bigquery|analytics/i.test(n.id + " " + n.label) },
  { re: /\b(spanner)\b/i, match: (n) => /spanner/i.test(n.id + " " + n.label) },
  { re: /\b(cloud sql|sql|database|db)\b/i, match: (n) => n.type === "data" || /sql|database/i.test(n.id + " " + n.label) },
  { re: /\b(pub\/?sub|topic|queue)\b/i, match: (n) => n.type === "messaging" || /pubsub|pub.?sub|queue/i.test(n.id + " " + n.label) },
  { re: /\b(load balancer|glb|lb)\b/i, match: (n) => /balancer|\bglb\b|\blb\b/i.test(n.id + " " + n.label) },
  { re: /\b(cloud armor|armor|waf|ddos)\b/i, match: (n) => n.type === "security" || /armor|waf/i.test(n.id + " " + n.label) },
  { re: /\b(worker|cloud run|run)\b/i, match: (n) => /worker|cloud.?run/i.test(n.id + " " + n.label) },
];

function removeIntent(u: string, current: ArchState): ArchState | null {
  if (!REMOVE_RE.test(u)) return null;
  const target = REMOVE_TARGETS.find((t) => t.re.test(u));
  const node = target ? current.nodes.find(target.match) : undefined;
  if (!node) {
    log(`remove: no matching node for "${u.slice(0, 80)}" — keeping state intact`);
    return { ...current, cleaned_transcript: current.cleaned_transcript || u.trim() };
  }
  log(`remove: matched node id=${node.id} label=${JSON.stringify(node.label)}`);
  const edges = current.edges.filter((e) => e.source !== node.id && e.target !== node.id);
  return {
    ...current,
    nodes: current.nodes.filter((n) => n.id !== node.id),
    edges,
    cleaned_transcript: u.trim(),
  };
}

function log(msg: string) {
  if (process.env.SYNTH_DEBUG === "1" || process.env.NODE_ENV !== "production") {
    console.log("[mock]", msg);
  }
}

const ADD_RE = /\b(add|include|create|put|attach|provision|stand up|spin up|need|want|new|give)\b/i;

type AddSpec = {
  re: RegExp;
  node: () => { id: string; type: ArchState["nodes"][number]["type"]; label: string; sublabel: string };
  edgeLabel: string;
  protocol: string;
};

// Catalog of things users ask to ADD, with sensible wiring.
const ADD_TARGETS: AddSpec[] = [
  {
    re: /\b(storage bucket|cloud storage|gcs|bucket|object storage|blob storage|data lake)\b/i,
    node: () => ({ id: "cloud_storage", type: "data", label: "Cloud Storage", sublabel: "stream events archive" }),
    edgeLabel: "stream export",
    protocol: "GCS",
  },
  { re: /\b(cache|redis|memorystore)\b/i, node: () => ({ id: "memorystore", type: "cache", label: "Memorystore Redis", sublabel: "hot reads" }), edgeLabel: "reads", protocol: "RESP" },
  { re: /\b(dlq|dead letter)\b/i, node: () => ({ id: "orders_dlq", type: "messaging", label: "orders-dlq", sublabel: "7d retention" }), edgeLabel: "5x failures", protocol: "DLQ" },
  { re: /\b(spanner)\b/i, node: () => ({ id: "spanner", type: "data", label: "Cloud Spanner", sublabel: "global consistency" }), edgeLabel: "writes", protocol: "Spanner API" },
  { re: /\b(cloud sql|sql database|postgres)\b/i, node: () => ({ id: "cloud_sql", type: "data", label: "Cloud SQL", sublabel: "Postgres" }), edgeLabel: "writes", protocol: "SQL" },
  { re: /\b(bigquery|analytics)\b/i, node: () => ({ id: "bigquery", type: "analytics", label: "BigQuery", sublabel: "analytics sink" }), edgeLabel: "events", protocol: "streaming" },
  { re: /\b(pub\/?sub|topic|queue)\b/i, node: () => ({ id: "pubsub_orders", type: "messaging", label: "Pub/Sub orders", sublabel: "event buffer" }), edgeLabel: "publish", protocol: "Pub/Sub" },
  { re: /\b(api[\s-]?gateway|gateway|apigee)\b/i, node: () => ({ id: "api_gateway", type: "gateway", label: "API Gateway", sublabel: "auth + rate limit" }), edgeLabel: "HTTPS", protocol: "HTTPS" },
  { re: /\b(cloud armor|armor|waf|ddos)\b/i, node: () => ({ id: "cloud_armor", type: "security", label: "Cloud Armor", sublabel: "DDoS + WAF" }), edgeLabel: "filtered", protocol: "HTTPS" },
  { re: /\b(load balancer|global lb|glb)\b/i, node: () => ({ id: "glb", type: "gateway", label: "Global LB", sublabel: "anycast" }), edgeLabel: "route", protocol: "HTTPS" },
  { re: /\b(cloud run|worker|workers|microservice)\b/i, node: () => ({ id: "cloud_run_workers", type: "compute", label: "Cloud Run workers", sublabel: "0-200 instances" }), edgeLabel: "process", protocol: "Pub/Sub" },
  { re: /\b(gke|kubernetes|k8s|cluster)\b/i, node: () => ({ id: "gke", type: "compute", label: "GKE cluster", sublabel: "containers" }), edgeLabel: "deploy", protocol: "HTTPS" },
];

function findAnchor(utteranceLower: string, current: ArchState, excludeId: string) {
  // Prefer an existing node explicitly named near "for/after/to/in front of"
  const context = utteranceLower.replace(/\b(add|include|create|put|attach|provision|a|an|the|new|to|for|after|please|that|those|these|stream|events|store|storage|bucket)\b/g, " ");
  for (const n of current.nodes) {
    if (n.id === excludeId) continue;
    const tokens = [n.id.replace(/_/g, " "), n.label, n.sublabel ?? ""].join(" ").toLowerCase();
    const words = tokens.split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => context.includes(w))) return n;
  }
  // Default: right after the client (first actor node)
  return current.nodes.find((n) => n.type === "actor") ?? current.nodes[0];
}

function addIntent(u: string, utterance: string, current: ArchState): ArchState | null {
  if (!ADD_RE.test(u)) return null;
  const target = ADD_TARGETS.find((t) => t.re.test(u));
  const spec = target ?? null;

  const fresh = spec
    ? spec.node()
    : (() => {
        const cleaned = utterance
          .replace(/^(please\s+)?/i, "")
          .replace(/^(and\s+|also\s+|then\s+)?(add|include|create|put|attach|provision|stand up|spin up|give)\s+/i, "")
          .replace(/^(a|an|the|another|new)\s+/i, "")
          .replace(/\s+(after|before|in front of|upstream of|downstream of|to|for|that|so we|in order to|next to)\b.*$/i, "")
          .replace(/[.,;:]+$/, "")
          .trim()
          .slice(0, 40);
        return { id: `svc_${current.nodes.length + 1}`, type: "generic" as const, label: cleaned || "New service", sublabel: "from voice" };
      })();

  if (current.nodes.some((n) => n.id === fresh.id)) {
    log(`add: ${fresh.id} already exists — no-op`);
    return null;
  }
  if (current.nodes.length >= 16) {
    log("add: node limit 16 reached — no-op");
    return null;
  }

  const anchor = findAnchor(u, current, fresh.id);
  // "in front of X" inserts before the anchor; otherwise the new node hangs off it
  const before = /\b(in front of|before|upstream of|ahead of)\b/i.test(u);
  const source = before ? fresh.id : anchor.id;
  const targetId = before ? anchor.id : fresh.id;
  const edgeId = `e_${source}_${targetId}`;
  if (current.edges.some((e) => e.id === edgeId)) {
    log(`add: edge ${edgeId} exists — no-op`);
    return null;
  }

  log(`add: id=${fresh.id} label=${JSON.stringify(fresh.label)} anchor=${anchor.id} edge=${source}->${targetId}`);
  return {
    ...current,
    nodes: [...current.nodes, { ...fresh, region: "" }],
    edges: [...current.edges, { id: edgeId, source, target: targetId, label: spec?.edgeLabel ?? "data", protocol: spec?.protocol ?? "HTTPS" }],
    cleaned_transcript: utterance.trim(),
  };
}

export function mockSynthesize(utterance: string, current: ArchState | null): ArchState {
  const u = utterance.toLowerCase();
  const hasState = current && current.nodes.length > 0;
  log(`utterance=${JSON.stringify(utterance.slice(0, 160))} hasState=${hasState}`);
  const mentionsOrder = u.includes("order") || u.includes("pub/sub") || u.includes("pubsub") || u.includes("gateway");
  const mentionsActive = u.includes("active-active") || u.includes("spanner") && u.includes("armor") || (u.includes("multi-region") && u.includes("cloud run"));

  // Mutation path: detect current order-like state
  const isOrderState =
    hasState && (current!.nodes.some((n) => n.id === "pubsub_orders") || current!.nodes.some((n) => n.id === "cloud_sql") || current!.nodes.some((n) => n.id === "spanner"));

  if (!hasState) {
    if (mentionsOrder && !mentionsActive) {
      log("path=first-order");
      return { ...stateOrder(false, false, false), cleaned_transcript: utterance.trim() };
    }
    log("path=first-active-active");
    return { ...stateGcpActiveActive(), cleaned_transcript: utterance.trim() };
  }

  // Removal intent must win over append/switch logic
  const removed = removeIntent(u, current!);
  if (removed) return removed;

  // General "add X" handling — works on any existing state (order or active-active)
  const added = addIntent(u, utterance, current!);
  if (added) return added;

  if (isOrderState) {
    const curHasSpanner = current!.nodes.some((n) => n.id === "spanner");
    const curHasCache = current!.nodes.some((n) => n.id === "memorystore");
    const curHasDlq = current!.nodes.some((n) => n.id === "orders_dlq");
    const wantSpanner = curHasSpanner || u.includes("spanner");
    const wantCache = curHasCache || u.includes("redis") || u.includes("memorystore") || u.includes("cache");
    const wantDlq = curHasDlq || u.includes("dead letter") || u.includes("dlq") || (u.includes("dead") && u.includes("queue"));
    if (wantSpanner !== curHasSpanner || wantCache !== curHasCache || wantDlq !== curHasDlq) {
      log(`path=order-mutate spanner:${curHasSpanner}->${wantSpanner} cache:${curHasCache}->${wantCache} dlq:${curHasDlq}->${wantDlq}`);
      return { ...stateOrder(wantSpanner, wantCache, wantDlq), cleaned_transcript: utterance.trim() };
    }
    log("path=no-op (unrecognized mutation, keeping state)");
    return { ...current!, cleaned_transcript: utterance.trim() };
  }

  // Active-active state + order mutation -> switch to order
  if (mentionsOrder) {
    log("path=switch-to-order");
    return { ...stateOrder(u.includes("spanner"), u.includes("redis") || u.includes("cache"), u.includes("dead") || u.includes("dlq")), cleaned_transcript: utterance.trim() };
  }
  log("path=no-op (non-order state)");
  return { ...current!, cleaned_transcript: utterance.trim() };
}

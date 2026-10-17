export const SAMPLE_GCP_RAMBLE = `Okay so, um, we need like a multi-region active-active setup on GCP, you know, um, using Cloud Spanner for global consistency, uh, Cloud Run for microservices, and Cloud Armor for, like, DDoS protection. Front it with Global Load Balancer, two regions us-central1 and europe-west1, uh, and push analytics to BigQuery. Needs like 99.99 availability and under 200ms p99.`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _keepGcp = SAMPLE_GCP_RAMBLE;

export const SAMPLE_ORDER_RAMBLE = `Let's design an event-driven order processing system on GCP. Mobile clients hit an API Gateway, which pushes events to Pub/Sub. A fleet of Cloud Run workers processes orders and writes to Cloud SQL, while pushing analytics to BigQuery.`;

export const SAMPLE_MUTATION_SPANNER = `Actually, Cloud SQL won't scale for our global write volume. Swap Cloud SQL out for Cloud Spanner and put a Memorystore Redis cache in front of the checkout service.`;

export const SAMPLE_MUTATION_DLQ = `Add a Dead Letter Queue to that Pub/Sub topic so we don't drop failed payment events.`;

export const CUSTOM_DICTIONARY = [
  "Cloud Spanner",
  "Cloud Run",
  "Cloud Armor",
  "Pub/Sub",
  "Memorystore",
  "BigQuery",
  "Cloud SQL",
  "GKE",
  "VPC Peering",
  "Dead Letter Queue",
  "idempotency",
  "active-active",
];

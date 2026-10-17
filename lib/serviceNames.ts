import type { ArchState, ArchNode } from "./schema";

/**
 * Canonical Google Cloud / well-known service names.
 * Maps loose or ASR-mangled variants -> the official display name.
 * Applied to every synthesized state (Gemini and mock) so labels stay standard.
 */
const CANONICAL: Array<{ re: RegExp; name: string; id?: string }> = [
  // GCP compute
  { re: /^\s*(cloud run|cloudrun|cloud\s*functions|gcf|run workers?|cloud\s*run\s*service)\s*$/i, name: "Cloud Run" },
  { re: /^\s*(gke|kubernetes|k8s|google kubernetes engine|gke cluster|kubernetes engine)\s*$/i, name: "Google Kubernetes Engine" },
  { re: /^\s*(compute engine|gce|vm|virtual machine|compute)\s*$/i, name: "Compute Engine" },
  { re: /^\s*(cloud functions)\s*$/i, name: "Cloud Functions" },
  // GCP data
  { re: /^\s*(cloud spanner|spanner)\s*$/i, name: "Cloud Spanner" },
  { re: /^\s*(cloud sql|sql database|postgres(?:ql)?|mysql database)\s*$/i, name: "Cloud SQL" },
  { re: /^\s*(firestore|cloud firestore)\s*$/i, name: "Firestore" },
  { re: /^\s*(bigtable|cloud bigtable)\s*$/i, name: "Cloud Bigtable" },
  { re: /^\s*(bigquery|big query|bq)\s*$/i, name: "BigQuery" },
  { re: /^\s*(cloud storage|gcs|storage bucket|bucket|object storage|blob storage|data lake)\s*$/i, name: "Cloud Storage" },
  { re: /^\s*(dataflow|cloud dataflow)\s*$/i, name: "Dataflow" },
  { re: /^\s*(pubsub|pub\/sub|pub sub|publish(?:\/| )?subscribe|topic|event bus)\s*$/i, name: "Cloud Pub/Sub" },
  { re: /^\s*(memorystore|redis cache|redis)\s*$/i, name: "Memorystore for Redis" },
  { re: /^\s*(memcached)\s*$/i, name: "Memorystore for Memcached" },
  // GCP networking / security / mgmt
  { re: /^\s*(api gateway|apigee|api gw|api[\s-]?gw)\s*$/i, name: "API Gateway" },
  { re: /^\s*(cloud armor|armor|waf|ddos)\s*$/i, name: "Cloud Armor" },
  { re: /^\s*(load balancer|global lb|glb|http\(s\) load balancer|alb|network load balancer|nlb)\s*$/i, name: "Cloud Load Balancing" },
  { re: /^\s*(cloud cdn|cdn)\s*$/i, name: "Cloud CDN" },
  { re: /^\s*(cloud dns|dns)\s*$/i, name: "Cloud DNS" },
  { re: /^\s*(cloud vpn|vpn)\s*$/i, name: "Cloud VPN" },
  { re: /^\s*(vpc|vpc peering|subnet|network)\s*$/i, name: "VPC network" },
  { re: /^\s*(cloud iam|iam)\s*$/i, name: "Identity and Access Management" },
  { re: /^\s*(secret manager|secrets manager)\s*$/i, name: "Secret Manager" },
  { re: /^\s*(cloud build)\s*$/i, name: "Cloud Build" },
  { re: /^\s*(artifact registry|container registry|gcr)\s*$/i, name: "Artifact Registry" },
  { re: /^\s*(cloud run job)\s*$/i, name: "Cloud Run Jobs" },
  { re: /^\s*(cloud scheduler)\s*$/i, name: "Cloud Scheduler" },
  { re: /^\s*(cloud tasks)\s*$/i, name: "Cloud Tasks" },
  { re: /^\s*(cloud pub\/?sub dlq|dead letter queue|dlq|orders-dlq)\s*$/i, name: "Pub/Sub Dead Letter Topic" },
  { re: /^\s*(cloud monitoring|monitoring)\s*$/i, name: "Cloud Monitoring" },
  { re: /^\s*(cloud logging|logging)\s*$/i, name: "Cloud Logging" },
  { re: /^\s*(cloud trace|trace)\s*$/i, name: "Cloud Trace" },
  { re: /^\s*(cloud run mesh|anthos service mesh)\s*$/i, name: "Anthos Service Mesh" },
  // Common actors / generics keep as-is but normalize a few
  { re: /^\s*(mobile clients?|ios|android|mobile app|mobile)\s*$/i, name: "Mobile clients" },
  { re: /^\s*(web clients?|browser|frontend|web app|website)\s*$/i, name: "Web clients" },
  { re: /^\s*(global users?|users?|customers?|end users?|clients?|client)\s*$/i, name: "Users" },
  // AWS / Azure common
  { re: /^\s*(s3|amazon s3)\s*$/i, name: "Amazon S3" },
  { re: /^\s*(aws lambda|lambda)\s*$/i, name: "AWS Lambda" },
  { re: /^\s*(dynamodb)\s*$/i, name: "Amazon DynamoDB" },
  { re: /^\s*(sqs)\s*$/i, name: "Amazon SQS" },
  { re: /^\s*(sns)\s*$/i, name: "Amazon SNS" },
  { re: /^\s*(ec2)\s*$/i, name: "Amazon EC2" },
  { re: /^\s*(eks)\s*$/i, name: "Amazon EKS" },
];

/** Canonicalize a single label; returns null if no rule matches. */
export function canonicalName(label: string): string | null {
  const trimmed = label.trim();
  for (const { re, name } of CANONICAL) {
    if (re.test(trimmed)) return name;
  }
  // Sublabel-style compound names: match leading known service token, keep qualifier.
  const compound: Array<[RegExp, string]> = [
    [/^(cloud run)(\s+\S.*)?$/i, "Cloud Run"],
    [/^(cloud spanner|spanner)(\s+\S.*)?$/i, "Cloud Spanner"],
    [/^(cloud sql)(\s+\S.*)?$/i, "Cloud SQL"],
    [/^(pub\/?sub|pubsub)(\s+\S.*)?$/i, "Cloud Pub/Sub"],
    [/^(memorystore)(\s+\S.*)?$/i, "Memorystore for Redis"],
    [/^(cloud storage)(\s+\S.*)?$/i, "Cloud Storage"],
    [/^(bigquery)(\s+\S.*)?$/i, "BigQuery"],
    [/^(cloud armor)(\s+\S.*)?$/i, "Cloud Armor"],
    [/^(api gateway)(\s+\S.*)?$/i, "API Gateway"],
    [/^(gke|kubernetes)(\s+\S.*)?$/i, "Google Kubernetes Engine"],
  ];
  for (const [re] of compound) {
    const m = trimmed.match(re);
    if (m?.[1]) {
      return canonicalName(m[1]) ?? m[1].trim();
    }
  }
  return null;
}

function canonicalizeNode(n: ArchNode): ArchNode {
  const name = canonicalName(n.label);
  if (!name || name === n.label) return n;
  return { ...n, label: name };
}

/** Rewrite node labels in a state to official service names. */
export function canonicalizeState(state: ArchState): ArchState {
  return {
    ...state,
    nodes: state.nodes.map(canonicalizeNode),
  };
}

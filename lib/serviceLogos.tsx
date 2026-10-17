import type { IconType } from "react-icons";

export type ServiceLogo = {
  color: string;
  Icon: IconType;
  name: string;
};

const GcpBlue = "#4285F4";
const GcpYellow = "#FBBC04";
const GcpGreen = "#34A853";
const GcpRed = "#EA4335";
const AzureBlue = "#0078D4";

type MarkProps = { className?: string };

function GcpHex({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M12 2 L20.5 7 V17 L12 22 L3.5 17 V7 Z" fill={GcpBlue} opacity="0.15" />
      <path d="M12 2 L20.5 7 V17 L12 22 L3.5 17 V7 Z" stroke={GcpBlue} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill={GcpBlue} />
    </svg>
  );
}

function CloudRunMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="3" fill={GcpBlue} opacity="0.12" />
      <path
        d="M7 15c-1.7 0-3-1.2-3-2.8S5.3 9.4 7 9.4c.2-2 1.9-3.6 4-3.6 2.1 0 3.8 1.5 4.1 3.4 1.5.3 2.6 1.6 2.6 3.1 0 1.8-1.5 3.2-3.3 3.2H7z"
        fill={GcpBlue}
      />
      <path
        d="M14.5 12.2c.4-.6.6-1.3.6-2 0-1.5-.8-2.8-2-3.5.5 1.1.4 2.4-.3 3.4-.5.7-1.2 1.2-2 1.4l3.7.7z"
        fill={GcpYellow}
      />
      <path d="M17.5 11.5c.7.6 1.1 1.5 1.1 2.5 0 .9-.3 1.7-.8 2.3l-3.3-1.6 3-3.2z" fill={GcpGreen} />
    </svg>
  );
}

function CloudStorageMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6.5 19h11a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6-1.2A3.9 3.9 0 0 0 6.5 19z" fill={GcpBlue} opacity="0.9" />
      <path
        d="M9 13.5h6M12 11v5m0 0l-2-2m2 2l2-2"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpannerMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" fill="#669DF6" opacity="0.2" />
      <circle cx="12" cy="12" r="8" stroke={GcpBlue} strokeWidth="1.5" fill="none" />
      <path
        d="M4 12h16M12 4c2.5 2.3 2.5 13.7 0 16M12 4c-2.5 2.3-2.5 13.7 0 16"
        stroke={GcpBlue}
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="12" cy="12" r="2" fill={GcpBlue} />
    </svg>
  );
}

function PubSubMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="6" cy="12" r="2.2" fill={GcpYellow} />
      <circle cx="18" cy="6.5" r="2.2" fill={GcpBlue} />
      <circle cx="18" cy="17.5" r="2.2" fill={GcpGreen} />
      <path d="M8.2 11.2 L15.8 7.3M8.2 12.8 L15.8 16.7" stroke="#5F6368" strokeWidth="1.5" />
    </svg>
  );
}

function BigQueryMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" fill={GcpBlue} opacity="0.15" />
      <circle cx="11" cy="11" r="6.5" stroke={GcpBlue} strokeWidth="1.6" fill="none" />
      <path d="M16 16l4.5 4.5" stroke={GcpBlue} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8.5 13V10M11 13V8M13.5 13V9.5" stroke={GcpRed} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloudSqlMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill={GcpBlue} opacity="0.25" />
      <path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11" fill="none" stroke={GcpBlue} strokeWidth="1.6" />
      <ellipse cx="12" cy="6.5" rx="7" ry="2.8" fill="none" stroke={GcpBlue} strokeWidth="1.6" />
      <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" fill="none" stroke={GcpBlue} strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

function CloudArmorMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3l8 3v5.5c0 5-3.4 9.2-8 10.5-4.6-1.3-8-5.5-8-10.5V6l8-3z" fill={GcpBlue} opacity="0.15" />
      <path d="M12 3l8 3v5.5c0 5-3.4 9.2-8 10.5-4.6-1.3-8-5.5-8-10.5V6l8-3z" stroke={GcpBlue} strokeWidth="1.6" fill="none" />
      <path d="M9 12l2 2 4-4" stroke={GcpGreen} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function RedisMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 8.5l8-3.5 8 3.5-8 3.5L4 8.5z" fill="#D82C20" />
      <path d="M4 12l8 3.5L20 12" fill="none" stroke="#D82C20" strokeWidth="1.6" opacity="0.7" />
      <path d="M4 15.5l8 3.5 8-3.5" fill="none" stroke="#D82C20" strokeWidth="1.6" opacity="0.45" />
    </svg>
  );
}

function GkeMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" fill="#326CE5" opacity="0.15" />
      <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" stroke="#326CE5" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" fill="#326CE5" />
      <path
        d="M12 5v3M12 16v3M5.5 9l2.6 1.5M15.9 13.5l2.6 1.5M5.5 15l2.6-1.5M15.9 10.5l2.6-1.5"
        stroke="#326CE5"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function LoadBalancerMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="5" cy="12" r="2" fill={GcpBlue} />
      <circle cx="19" cy="6" r="2" fill={GcpBlue} />
      <circle cx="19" cy="18" r="2" fill={GcpBlue} />
      <path d="M7 12h4m0 0l6-5.2M11 12l6 5.2" stroke="#5F6368" strokeWidth="1.5" />
      <rect x="9" y="10" width="4" height="4" rx="1" fill={GcpBlue} opacity="0.3" stroke={GcpBlue} strokeWidth="1" />
    </svg>
  );
}

function ApiGatewayMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" fill={GcpBlue} opacity="0.1" stroke={GcpBlue} strokeWidth="1.5" />
      <path d="M8 12h8M12 8v8" stroke={GcpBlue} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.5" fill={GcpBlue} />
    </svg>
  );
}

function CloudFunctionsMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" fill={GcpBlue} opacity="0.1" stroke={GcpBlue} strokeWidth="1.4" />
      <path d="M9 9h6v6H9z" fill="none" stroke={GcpBlue} strokeWidth="1.4" />
      <path d="M9 12h6M12 9v6" stroke={GcpBlue} strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.6" fill={GcpBlue} />
    </svg>
  );
}

function FirebaseMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 18.5L8.2 4l3.1 6.2L14.5 5 19 18.5 12 21.5 5 18.5z" fill="#FFCA28" />
      <path d="M5 18.5L8.2 4l3.1 6.2L12 21.5 5 18.5z" fill="#F57C00" opacity="0.85" />
      <path d="M14.5 5L19 18.5 12 21.5V10.2L14.5 5z" fill="#FFA000" opacity="0.7" />
    </svg>
  );
}

function FirestoreMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 18c0-6 2-10 6-14 4 4 6 8 6 14-2 1.5-4 2-6 2s-4-.5-6-2z" fill="#FF7043" />
      <path d="M9 15c0-3.5 1-6.5 3-9.5" stroke="#FFCA28" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

function AwsS3Mark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 7.5c0-1.4 2.7-2.5 6-2.5s6 1.1 6 2.5v9c0 1.4-2.7 2.5-6 2.5s-6-1.1-6-2.5v-9z" fill="#569A31" opacity="0.9" />
      <ellipse cx="12" cy="7.5" rx="6" ry="2.5" fill="#8CBF3F" />
    </svg>
  );
}

function AwsLambdaMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#ED7100" opacity="0.15" />
      <path d="M8 6v12l8-6-8-6z" fill="#ED7100" />
    </svg>
  );
}

function DynamoDbMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 6.5L12 3l8 3.5v11L12 21l-8-3.5v-11z" fill="#252F3E" opacity="0.9" />
      <path d="M8 9.5h8M8 12.5h8M8 15.5h5" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SqsMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="6" width="7" height="5" rx="1.5" fill="#FF4F8B" />
      <rect x="14" y="6" width="7" height="5" rx="1.5" fill="#FF4F8B" opacity="0.6" />
      <rect x="3" y="13" width="7" height="5" rx="1.5" fill="#FF4F8B" opacity="0.6" />
      <rect x="14" y="13" width="7" height="5" rx="1.5" fill="#FF4F8B" />
    </svg>
  );
}

function RedshiftMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" fill="#8C4FFF" opacity="0.2" stroke="#8C4FFF" strokeWidth="1.4" />
      <path d="M8 10h8v4H8z" fill="#8C4FFF" />
    </svg>
  );
}

function AzureMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M9.5 4h5.2L21 19.2H9.8L9.5 4z" fill={AzureBlue} opacity="0.9" />
      <path d="M8.2 7.5L11 19.2H3.2L8.2 7.5z" fill="#50E6FF" opacity="0.8" />
      <path d="M9.5 4L8.2 7.5 3.2 19.2h6.6L9.5 4z" fill={AzureBlue} />
    </svg>
  );
}

function PostgresMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="12" cy="7" rx="7" ry="3" fill="#336791" opacity="0.25" />
      <path d="M5 7v9.5c0 1.7 3.1 3 7 3s7-1.3 7-3V7" fill="none" stroke="#336791" strokeWidth="1.6" />
      <ellipse cx="12" cy="7" rx="7" ry="3" fill="none" stroke="#336791" strokeWidth="1.6" />
      <path d="M9 11.5c1.5 1 4.5 1 6 0M9 14.5c1.5 1 4.5 1 6 0" stroke="#336791" strokeWidth="1.2" />
    </svg>
  );
}

function KafkaMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="6" cy="12" r="2.2" fill="#231F20" />
      <circle cx="17" cy="7" r="2.2" fill="#231F20" />
      <circle cx="17" cy="17" r="2.2" fill="#231F20" />
      <path d="M8.2 11.2l6.6-3.3M8.2 12.8l6.6 3.3" stroke="#231F20" strokeWidth="1.5" />
    </svg>
  );
}

function UserActorMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" fill="#1971c2" opacity="0.85" />
      <path d="M5 19.5c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" fill="#1971c2" opacity="0.85" />
    </svg>
  );
}

function MobileMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="2.5" fill="none" stroke="#1971c2" strokeWidth="1.6" />
      <rect x="9" y="6" width="6" height="9" rx="1" fill="#1971c2" opacity="0.7" />
      <circle cx="12" cy="18" r="1" fill="#1971c2" />
    </svg>
  );
}

function WebMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#1971c2" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8.5" fill="none" stroke="#1971c2" strokeWidth="1.2" />
      <path d="M3.5 12h17M4.5 8h15M4.5 16h15" stroke="#1971c2" strokeWidth="1.1" />
    </svg>
  );
}

function AwsMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6.5 14.5c2.2 1.6 5 2.4 7.8 2.4 2.2 0 4.4-.5 6.2-1.5" stroke="#FF9900" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M18.5 13.5l2 1.8-1.5 2.4" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6.5h3l1.5 6 1.6-6H14l-2.4 8.5H9.2L5 6.5z" fill="#232F3E" />
      <path d="M15 6.5h3.2c1.8 0 2.8 1 2.8 2.4 0 1.5-1.1 2.5-2.9 2.5H16.5l-.3 1.2H15V6.5zm1.8 1.4v1.8h1.2c.8 0 1.3-.3 1.3-1s-.5-.8-1.3-.8h-1.2z" fill="#232F3E" />
    </svg>
  );
}

const REGISTRY: Array<{ test: RegExp; logo: ServiceLogo }> = [
  { test: /\bcloud\s*spanner\b|\bspanner\b/, logo: { color: "#669DF6", Icon: SpannerMark, name: "Cloud Spanner" } },
  { test: /\bcloud\s*run\b|\bcloudrun\b/, logo: { color: GcpBlue, Icon: CloudRunMark, name: "Cloud Run" } },
  { test: /\bcloud\s*sql\b|\bcloudsql\b/, logo: { color: GcpBlue, Icon: CloudSqlMark, name: "Cloud SQL" } },
  {
    test: /\bpub\/?sub\b|\bpublish\/?subscribe\b|\bdead\s*letter\b|\bdlq\b/,
    logo: { color: GcpYellow, Icon: PubSubMark, name: "Pub/Sub" },
  },
  { test: /\bbigquery\b|\bbq\b/, logo: { color: GcpBlue, Icon: BigQueryMark, name: "BigQuery" } },
  {
    test: /\bcloud\s*storage\b|\bgcs\b|\bgoogle\s*cloud\s*storage\b/,
    logo: { color: GcpBlue, Icon: CloudStorageMark, name: "Cloud Storage" },
  },
  { test: /\bcloud\s*armor\b/, logo: { color: GcpBlue, Icon: CloudArmorMark, name: "Cloud Armor" } },
  { test: /\bmemorystore\b|\bredis\b/, logo: { color: "#D32F2F", Icon: RedisMark, name: "Redis / Memorystore" } },
  { test: /\bgke\b|\bkubernetes\b|\bk8s\b/, logo: { color: "#326CE5", Icon: GkeMark, name: "GKE / Kubernetes" } },
  {
    test: /\bload\s*balanc(?:er|ing)\b|\bglb\b|\balb\b/,
    logo: { color: GcpBlue, Icon: LoadBalancerMark, name: "Cloud Load Balancing" },
  },
  { test: /\bapi\s*gateway\b|\bapigee\b/, logo: { color: GcpBlue, Icon: ApiGatewayMark, name: "API Gateway" } },
  { test: /\bcloud\s*functions\b|\bgcf\b/, logo: { color: GcpBlue, Icon: CloudFunctionsMark, name: "Cloud Functions" } },
  { test: /\bfirestore\b/, logo: { color: "#FF7043", Icon: FirestoreMark, name: "Firestore" } },
  { test: /\bfirebase\b/, logo: { color: "#FFCA28", Icon: FirebaseMark, name: "Firebase" } },
  {
    test: /\bcompute\s*engine\b|\bgce\b|\bvm\b|\bvirtual\s*machine\b/,
    logo: { color: GcpBlue, Icon: GcpHex, name: "Compute Engine" },
  },
  { test: /\bvpc\b|\bsubnet\b|\bpeering\b/, logo: { color: GcpBlue, Icon: GcpHex, name: "VPC" } },
  { test: /\bgcp\b|\bgoogle\s*cloud\b/, logo: { color: GcpBlue, Icon: GcpHex, name: "Google Cloud" } },

  { test: /\bs3\b|\bamazon\s*s3\b/, logo: { color: "#569A31", Icon: AwsS3Mark, name: "Amazon S3" } },
  { test: /\blambda\b/, logo: { color: "#ED7100", Icon: AwsLambdaMark, name: "AWS Lambda" } },
  { test: /\bdynamodb\b/, logo: { color: "#FF9900", Icon: DynamoDbMark, name: "DynamoDB" } },
  { test: /\bsqs\b/, logo: { color: "#FF4F8B", Icon: SqsMark, name: "Amazon SQS" } },
  { test: /\bredshift\b/, logo: { color: "#8C4FFF", Icon: RedshiftMark, name: "Amazon Redshift" } },
  { test: /\bec2\b|\baws\b|\bamazon\s*web\s*services\b/, logo: { color: "#FF9900", Icon: AwsMark, name: "AWS" } },

  {
    test: /\bazure\b|\bcosmos\s*db\b|\bazure\s*sql\b|\bazure\s*functions\b/,
    logo: { color: AzureBlue, Icon: AzureMark, name: "Azure" },
  },

  { test: /\bkafka\b/, logo: { color: "#231F20", Icon: KafkaMark, name: "Kafka" } },
  { test: /\bpostgres(?:ql)?\b/, logo: { color: "#336791", Icon: PostgresMark, name: "PostgreSQL" } },
  {
    test: /\bsql\b|\bdatabase\b|\bdata\s*store\b|\bdatastore\b|\bwarehouse\b/,
    logo: { color: "#1864ab", Icon: CloudSqlMark, name: "Database" },
  },
  { test: /\bcache\b|\bcaching\b/, logo: { color: "#c2255c", Icon: RedisMark, name: "Cache" } },
  {
    test: /\bqueue\b|\bqueueing\b|\bmessaging\b|\bevent\s*bus\b|\btopic\b/,
    logo: { color: "#e67700", Icon: PubSubMark, name: "Messaging" },
  },
  { test: /\bmobile\b|\bios\b|\bandroid\b/, logo: { color: "#1971c2", Icon: MobileMark, name: "Mobile client" } },
  { test: /\bweb\b|\bbrowser\b|\bfrontend\b/, logo: { color: "#1971c2", Icon: WebMark, name: "Web client" } },
  {
    test: /\buser\b|\bclient\b|\bactor\b|\bcustomer\b|\bend\s*user\b/,
    logo: { color: "#1971c2", Icon: UserActorMark, name: "User" },
  },
  {
    test: /\bsecurity\b|\bfirewall\b|\bwaf\b|\bauth\b|\biam\b/,
    logo: { color: "#a61e4d", Icon: CloudArmorMark, name: "Security" },
  },
  { test: /\bgateway\b|\bproxy\b/, logo: { color: "#5f3dc4", Icon: ApiGatewayMark, name: "Gateway" } },
  {
    test: /\bworker\b|\bcompute\b|\bmicroservice\b|\bcontainer\b|\bpod\b/,
    logo: { color: "#2b8a3e", Icon: CloudRunMark, name: "Compute" },
  },
  { test: /\banalytics\b|\breporting\b/, logo: { color: "#0b7285", Icon: BigQueryMark, name: "Analytics" } },
];

const DEFAULT_LOGO: ServiceLogo = { color: "#495057", Icon: GcpHex, name: "Service" };

export function logoForNode(label: string, sublabel?: string, nodeType?: string): ServiceLogo {
  const haystack = `${label} ${sublabel ?? ""}`.toLowerCase();
  for (const entry of REGISTRY) {
    if (entry.test.test(haystack)) return entry.logo;
  }
  switch (nodeType) {
    case "actor":
      return { color: "#1971c2", Icon: UserActorMark, name: "Actor" };
    case "data":
      return { color: "#1864ab", Icon: CloudSqlMark, name: "Data store" };
    case "cache":
      return { color: "#c2255c", Icon: RedisMark, name: "Cache" };
    case "messaging":
      return { color: "#e67700", Icon: PubSubMark, name: "Messaging" };
    case "gateway":
      return { color: "#5f3dc4", Icon: ApiGatewayMark, name: "Gateway" };
    case "security":
      return { color: "#a61e4d", Icon: CloudArmorMark, name: "Security" };
    case "compute":
      return { color: "#2b8a3e", Icon: CloudRunMark, name: "Compute" };
    case "analytics":
      return { color: "#0b7285", Icon: BigQueryMark, name: "Analytics" };
    default:
      return DEFAULT_LOGO;
  }
}

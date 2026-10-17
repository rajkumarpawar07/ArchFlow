import { z } from "zod";

export const NodeTypeSchema = z.enum([
  "actor",
  "gateway",
  "compute",
  "messaging",
  "data",
  "cache",
  "security",
  "analytics",
  "generic",
]);

export type ArchNodeType = z.infer<typeof NodeTypeSchema>;

export const ArchNodeSchema = z.object({
  id: z.string().min(1).max(64),
  type: NodeTypeSchema,
  label: z.string().min(1).max(80),
  sublabel: z.string().max(120).optional(),
  region: z.string().max(60).optional(),
});

export const ArchEdgeSchema = z.object({
  id: z.string().min(1).max(64),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().max(80).optional(),
  protocol: z.string().max(40).optional(),
});

export const WarningSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  title: z.string().min(1).max(120),
  detail: z.string().min(1).max(600),
  fix: z.string().min(1).max(400),
});

export const ArchStateSchema = z.object({
  nodes: z.array(ArchNodeSchema).max(16),
  edges: z.array(ArchEdgeSchema).max(24),
  prd_markdown: z.string().max(12000),
  warnings: z.array(WarningSchema).max(8),
  terraform_hcl: z.string().max(12000),
  cleaned_transcript: z.string().max(8000).optional(),
});

export type ArchState = z.infer<typeof ArchStateSchema>;
export type ArchNode = z.infer<typeof ArchNodeSchema>;
export type ArchEdge = z.infer<typeof ArchEdgeSchema>;
export type ArchWarning = z.infer<typeof WarningSchema>;

export const SynthesizeRequestSchema = z.object({
  utterance: z.string().min(1).max(8000),
  currentState: ArchStateSchema.nullable().optional(),
});

export const emptyState: ArchState = {
  nodes: [],
  edges: [],
  prd_markdown: "",
  warnings: [],
  terraform_hcl: "",
  cleaned_transcript: "",
};

// Relaxed schema sent to Gemini. The Gemini responseJsonSchema endpoint enforces a
// complexity budget — sending ArchStateSchema (many .max() bounds) yields a bare
// HTTP 400 INVALID_ARGUMENT. We validate/clamp locally against ArchStateSchema.
export const GeminiArchStateSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: NodeTypeSchema,
      label: z.string(),
      sublabel: z.string().optional(),
      region: z.string().optional(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      label: z.string().optional(),
      protocol: z.string().optional(),
    })
  ),
  prd_markdown: z.string(),
  warnings: z.array(
    z.object({
      severity: z.enum(["low", "medium", "high"]),
      title: z.string(),
      detail: z.string(),
      fix: z.string(),
    })
  ),
  terraform_hcl: z.string(),
  cleaned_transcript: z.string().optional(),
});

function clampStr(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

/** Clamp a model-produced state into ArchState limits and drop dangling edges. */
export function clampToArchState(raw: z.infer<typeof GeminiArchStateSchema>): ArchState {
  const nodes = raw.nodes
    .filter((n) => n.id && n.label)
    .slice(0, 16);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = raw.edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .slice(0, 24);
  const candidate: ArchState = {
    nodes: nodes.map((n) => ({
      id: clampStr(n.id, 64),
      type: n.type,
      label: clampStr(n.label, 80),
      sublabel: clampStr(n.sublabel ?? "", 120),
      region: clampStr(n.region ?? "", 60),
    })),
    edges: edges.map((e) => ({
      id: clampStr(e.id, 64),
      source: e.source,
      target: e.target,
      label: clampStr(e.label ?? "", 80),
      protocol: clampStr(e.protocol ?? "", 40),
    })),
    prd_markdown: clampStr(raw.prd_markdown, 12000),
    warnings: raw.warnings.slice(0, 8).map((w) => ({
      severity: w.severity,
      title: clampStr(w.title, 120),
      detail: clampStr(w.detail, 600),
      fix: clampStr(w.fix, 400),
    })),
    terraform_hcl: clampStr(raw.terraform_hcl, 12000),
    cleaned_transcript: clampStr(raw.cleaned_transcript ?? "", 8000),
  };
  const parsed = ArchStateSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;
  return ArchStateSchema.parse({
    ...candidate,
    nodes: candidate.nodes.map((n) => ({ ...n, id: n.id || "node", label: n.label || "Service" })),
    edges: candidate.edges.map((e) => ({ ...e, id: e.id || `e_${e.source}_${e.target}` })),
    warnings: candidate.warnings.map((w) => ({ ...w, title: w.title || "Warning", detail: w.detail || "-", fix: w.fix || "-" })),
  });
}

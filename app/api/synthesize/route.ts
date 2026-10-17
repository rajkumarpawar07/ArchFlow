import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  ArchStateSchema,
  SynthesizeRequestSchema,
  GeminiArchStateSchema,
  clampToArchState,
} from "@/lib/schema";
import { SYNTHESIZE_SYSTEM, buildUserPrompt } from "@/lib/prompts";
import { mockSynthesize } from "@/lib/mock";
import { canonicalizeState } from "@/lib/serviceNames";

const DEBUG = process.env.SYNTH_DEBUG === "1" || process.env.NODE_ENV !== "production";

function log(...args: unknown[]) {
  if (DEBUG) console.log("[synth]", ...args);
}

export async function POST(req: Request) {
  const t0 = Date.now();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = SynthesizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    log("BAD_REQUEST issues=", JSON.stringify(parsed.error.issues));
    return NextResponse.json({ error: "Bad request", issues: parsed.error.issues }, { status: 400 });
  }
  const { utterance, currentState } = parsed.data;
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelId = process.env.GEMINI_MODEL_ID || "gemini-3.6-flash";

  log("utterance=", JSON.stringify(utterance.slice(0, 200)));
  log("currentNodes=", currentState?.nodes.length ?? 0, "currentEdges=", currentState?.edges.length ?? 0, "hasKey=", Boolean(apiKey), "model=", modelId);

  if (!apiKey) {
    const next = canonicalizeState(mockSynthesize(utterance, currentState ?? null));
    log("engine=mock (no API key) ->", next.nodes.length, "nodes", `${Date.now() - t0}ms`);
    return NextResponse.json({ state: next, engine: "mock" });
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const { output } = await generateText({
      model: google(modelId),
      system: SYNTHESIZE_SYSTEM,
      prompt: buildUserPrompt(utterance, currentState ?? null),
      // Relaxed schema: Gemini rejects complex responseJsonSchema with a bare 400.
      output: Output.object({ schema: GeminiArchStateSchema }),
      temperature: 0.2,
    });
    const raw = clampToArchState(output);
    const state = canonicalizeState(raw);
    const renamed = state.nodes.filter((n, i) => n.label !== raw.nodes[i]?.label);
    if (renamed.length) log("canonicalized labels:", renamed.map((n) => JSON.stringify(n.label)).join(", "));
    const finalCheck = ArchStateSchema.safeParse(state);
    log(
      "engine=gemini ok ->",
      state.nodes.length,
      "nodes /",
      state.edges.length,
      "edges /",
      state.warnings.length,
      "warnings, validated=", finalCheck.success,
      `${Date.now() - t0}ms`
    );
    return NextResponse.json({ state, engine: "gemini" });
  } catch (err) {
    const e = err as {
      statusCode?: number;
      responseBody?: string;
      message?: string;
      url?: string;
    };
    log("GEMINI_FAILED status=", e.statusCode ?? "?", "url=", e.url ?? "?");
    log("GEMINI_FAILED message=", e.message ?? String(err));
    log("GEMINI_FAILED responseBody=", (e.responseBody ?? "").slice(0, 500));
    log("falling back to mock");
    const next = canonicalizeState(mockSynthesize(utterance, currentState ?? null));
    log("engine=mock-fallback ->", next.nodes.length, "nodes", `${Date.now() - t0}ms`);
    return NextResponse.json({ state: next, engine: "mock-fallback" });
  }
}

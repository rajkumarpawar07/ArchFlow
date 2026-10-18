import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  ArchStateSchema,
  SynthesizeRequestSchema,
  ArchStateOutputSchema,
  clampToArchState,
} from "@/lib/schema";
import { SYNTHESIZE_SYSTEM, buildUserPrompt } from "@/lib/prompts";
import { mockSynthesize } from "@/lib/mock";
import { canonicalizeState } from "@/lib/serviceNames";

// Voice ramble -> structured patch can take up to ~40s per fallback attempt.
export const maxDuration = 120;

const DEBUG = process.env.SYNTH_DEBUG === "1" || process.env.NODE_ENV !== "production";

function log(...args: unknown[]) {
  if (DEBUG) console.log("[synth]", ...args);
}

// Primary model + user-configured fallbacks from .env / .env.local.
// e.g. OPENROUTER_MODEL_ID=google/gemini-2.5-flux ... see .env.local comments.
const MODEL_CHAIN = [
  process.env.OPENROUTER_MODEL_ID || "google/gemini-2.5-flash",
  ...(process.env.OPENROUTER_FALLBACK_MODELS ?? "").split(",").map((s) => s.trim()),
]
  .filter((m) => Boolean(m))
  .filter((m, i, arr) => arr.indexOf(m) === i);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(e: unknown): boolean {
  const err = e as { statusCode?: number; message?: string };
  if (typeof err?.statusCode === "number" && [408, 429, 500, 502, 503, 504].includes(err.statusCode)) return true;
  const msg = String(err?.message ?? "").toLowerCase();
  return /high demand|overload|temporarily|rate.?limit|exceeded your current quota|resource.?exhausted|unavailable|timeout|econnaborted|econnreset|fetch failed/.test(msg);
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
  const apiKey = process.env.OPENROUTER_API_KEY;

  log("utterance=", JSON.stringify(utterance.slice(0, 200)));
  log("currentNodes=", currentState?.nodes.length ?? 0, "currentEdges=", currentState?.edges.length ?? 0, "hasKey=", Boolean(apiKey), "models=", MODEL_CHAIN.join(" -> "));

  if (!apiKey) {
    const next = canonicalizeState(mockSynthesize(utterance, currentState ?? null));
    log("engine=mock (no OPENROUTER_API_KEY) ->", next.nodes.length, "nodes", `${Date.now() - t0}ms`);
    return NextResponse.json({ state: next, engine: "mock" });
  }

  try {
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      // Send `response_format: json_schema` (strict) instead of `{ json_object }` —
      // the :free reasoning-models on OpenRouter return EMPTY content with plain
      // json_object, but respond fine when the expected shape is enforced.
      supportsStructuredOutputs: true,
      headers: {
        // Optional attribution for https://openrouter.ai/rankings
        ...(process.env.OPENROUTER_SITE_URL ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL } : {}),
        ...(process.env.OPENROUTER_APP_TITLE ? { "X-Title": process.env.OPENROUTER_APP_TITLE } : {}),
      },
      // OpenRouter reads its extension params at the ROOT of the request body, which
      // ProviderOptions can't reach via the compatible provider — rewrite here instead.
      // Many :free slugs are "thinking" models that otherwise burn huge hidden reasoning
      // budgets and blow through any abort window.
      transformRequestBody: (body) => ({
        ...body,
        // Route to the fastest upstream provider serving the slug — the :free models are
        // shared across many upstreams and some are much slower / stall-prone.
        provider: { sort: "throughput" },
        reasoning: { enabled: false, exclude: true },
      }),
    });
    const totalDeadline = Date.now() + 90_000;
    let lastErr: unknown = null;

    outer: for (const modelId of MODEL_CHAIN) {
      // One patient attempt per model: structured generation for big patches can
      // legitimately take 15-30s. Only "fast" failures (quota/429/4xx) earn a second
      // spin on the same model — slow timeouts move straight to the fallback model.
      for (let attempt = 1; attempt <= 2; attempt++) {
        const budget = totalDeadline - Date.now();
        if (budget <= 6_000) break outer;
        const attemptStart = Date.now();
        try {
          const { output } = await generateText({
            model: openrouter(modelId),
            system: SYNTHESIZE_SYSTEM,
            prompt: buildUserPrompt(utterance, currentState ?? null),
            output: Output.object({ schema: ArchStateOutputSchema }),
            temperature: 0.2,
            maxRetries: 0, // our own model-chain + backoff handles retries
            abortSignal: AbortSignal.timeout(Math.min(budget, 40_000)),
          });
          const raw = clampToArchState(output);
          const state = canonicalizeState(raw);
          const renamed = state.nodes.filter((n, i) => n.label !== raw.nodes[i]?.label);
          if (renamed.length) log("canonicalized labels:", renamed.map((n) => JSON.stringify(n.label)).join(", "));
          const finalCheck = ArchStateSchema.safeParse(state);
          log(
            `engine=openrouter ok ->`,
            state.nodes.length,
            "nodes /",
            state.edges.length,
            "edges /",
            state.warnings.length,
            "warnings, model=",
            modelId,
            "attempt=",
            attempt,
            "validated=",
            finalCheck.success,
            `${Date.now() - t0}ms`
          );
          return NextResponse.json({ state, engine: "openrouter" });
        } catch (err) {
          lastErr = err;
          const e = err as { statusCode?: number; message?: string; name?: string };
          const failedFast = Date.now() - attemptStart < 8_000;
          const isTimeout = String(e?.name ?? "").includes("Timeout") || /aborted|timeout/i.test(String(e?.message ?? ""));
          const willRetry = failedFast && !isTimeout && attempt === 1 && isRetryable(err) && totalDeadline - Date.now() > 10_000;
          log(`OPENROUTER_FAIL model=${modelId} attempt=${attempt} fast=${failedFast ? "yes" : "no"} timeout=${isTimeout ? "yes" : "no"} status=${e?.statusCode ?? "?"} retry=${willRetry ? "yes" : "no(move to next model)"}`);
          log(`OPENROUTER_FAIL message=`, (e?.message ?? String(err)).slice(0, 200));
          if (willRetry) {
            await sleep(700);
            continue;
          }
          break; // move on to the next model in the chain
        }
      }
    }
    log("all openrouter models failed; lastError message=", (lastErr as Error | undefined)?.message ?? String(lastErr));
    throw lastErr instanceof Error ? lastErr : new Error("All OpenRouter models failed");
  } catch (err) {
    const e = err as {
      statusCode?: number;
      responseBody?: string;
      message?: string;
      url?: string;
    };
    log("OPENROUTER_FAILED status=", e.statusCode ?? "?", "url=", e.url ?? "?");
    log("OPENROUTER_FAILED message=", e.message ?? String(err));
    log("OPENROUTER_FAILED responseBody=", (e.responseBody ?? "").slice(0, 500));
    log("falling back to mock");
    const next = canonicalizeState(mockSynthesize(utterance, currentState ?? null));
    log("engine=mock-fallback ->", next.nodes.length, "nodes", `${Date.now() - t0}ms`);
    return NextResponse.json({ state: next, engine: "mock-fallback" });
  }
}

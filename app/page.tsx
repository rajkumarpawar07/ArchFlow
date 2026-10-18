"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import VoiceBar from "@/components/VoiceBar";
import DiagramCanvas from "@/components/DiagramCanvas";
import { CriticView, PrdView, TerraformView, download, mermaidFromState } from "@/components/SpecTabs";
import { SAMPLE_ORDER_RAMBLE } from "@/lib/samples";
import type { ArchState } from "@/lib/schema";

type Engine = "mock" | "openrouter" | "mock-fallback" | null;

export default function BuildPage() {
  const [utterance, setUtterance] = useState(SAMPLE_ORDER_RAMBLE);
  const [state, setState] = useState<ArchState | null>(null);
  const [past, setPast] = useState<ArchState[]>([]);
  const [future, setFuture] = useState<ArchState[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [tab, setTab] = useState<"prd" | "critic" | "tf">("prd");
  const [engine, setEngine] = useState<Engine>(null);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [tool, setTool] = useState<"select" | "hand">("select");

  const submit = useCallback(async () => {
    const text = utterance.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    const t0 = performance.now();
    console.debug("[client] submit utterance=", JSON.stringify(text.slice(0, 200)), "prevNodes=", state?.nodes.length ?? 0);
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: text, currentState: state }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      console.debug(
        "[client] engine=", json.engine,
        "nodes:", state?.nodes.length ?? 0, "->", json.state?.nodes?.length ?? 0,
        "edges:", state?.edges.length ?? 0, "->", json.state?.edges?.length ?? 0,
        `${Math.round(performance.now() - t0)}ms`
      );
      if (state) setPast((p) => [...p, state].slice(-20));
      setFuture([]);
      setState(json.state as ArchState);
      setEngine((json.engine as Engine) ?? null);
      setUtterance("");
    } catch (e) {
      console.error("[client] synthesize failed:", e);
      setError(e instanceof Error ? e.message : "Synthesis failed");
    } finally {
      setLoading(false);
    }
  }, [utterance, state, loading]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    if (state) setFuture((f) => [state, ...f].slice(0, 20));
    setPast((p) => p.slice(0, -1));
    setState(prev);
  }, [past, state]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const [next, ...rest] = future;
    if (state) setPast((p) => [...p, state].slice(-20));
    setFuture(rest);
    setState(next);
  }, [future, state]);

  const clear = useCallback(() => {
    if (state) setPast((p) => [...p, state].slice(-20));
    setFuture([]);
    setState(null);
  }, [state]);

  // Apply user-driven node edits (rename / type / region / delete)
  const handleNodePatch = useCallback(
    (
      id: string,
      patch: Partial<{ label: string; sublabel: string; type: ArchState["nodes"][number]["type"]; region: string }>
    ) => {
      if (!state) return;
      setPast((p) => [...p, state].slice(-20));
      setFuture([]);
      // Empty label = delete node (and its edges)
      if (patch.label === "") {
        setState({
          ...state,
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        });
        return;
      }
      setState({
        ...state,
        nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      });
    },
    [state]
  );

  // Excalidraw-ish shortcuts: V select, H hand, Ctrl+Z/Y undo/redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "v" || e.key === "V") setTool("select");
      if (e.key === "h" || e.key === "H") setTool("hand");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const toolBtn = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
      active ? "bg-[#e0dfff] text-[#1e1e1e]" : "text-[#495057] hover:bg-[#f1f0ff]"
    }`;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-white text-[#1e1e1e]">
      {/* Canvas */}
      <div className="absolute inset-0">
        <DiagramCanvas
          nodes={state?.nodes ?? []}
          edges={state?.edges ?? []}
          panMode={tool === "hand"}
          onNodePatch={handleNodePatch}
        />
      </div>

      {/* Top-left: menu + logo */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <button
          title="ArchFlow menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9e9eb] bg-white text-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:bg-[#f1f0ff]"
          onClick={() => setPanelOpen((v) => !v)}
        >
          ☰
        </button>
        <Link
          href="/"
          className="excali-rough hidden items-center gap-1 border-[1.5px] border-[#1e1e1e] bg-[#fff9db] px-3 py-1.5 shadow-[2px_2px_0_#1e1e1e] sm:flex"
        >
          <span className="font-hand text-2xl font-bold leading-5">ArchFlow</span>
          <span className="rounded bg-[#1e1e1e] px-1.5 py-px font-mono text-[10px] text-[#ffd43b]">
            {engine ?? "excali"}
          </span>
        </Link>
      </div>

      {/* Top-center: Excalidraw toolbar */}
      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-[#e9e9eb] bg-white/95 px-2 py-1.5 shadow-[0_12px_32px_rgba(30,30,30,0.12)] backdrop-blur">
        <button title="Select (V)" className={toolBtn(tool === "select")} onClick={() => setTool("select")}>
          ➖
        </button>
        <button title="Pan (H)" className={toolBtn(tool === "hand")} onClick={() => setTool("hand")}>
          ✋
        </button>
        <div className="mx-1 h-6 w-px bg-[#e9e9eb]" />
        <button title="PRD notes" className={toolBtn(tab === "prd" && panelOpen)} onClick={() => { setTab("prd"); setPanelOpen(true); }}>
          📝
        </button>
        <button title="Staff review stickies" className={toolBtn(tab === "critic" && panelOpen)} onClick={() => { setTab("critic"); setPanelOpen(true); }}>
          📌{state?.warnings.length ? <sup className="ml-0.5 text-[10px] font-bold text-[#fa5252]">{state.warnings.length}</sup> : null}
        </button>
        <button title="Terraform block" className={toolBtn(tab === "tf" && panelOpen)} onClick={() => { setTab("tf"); setPanelOpen(true); }}>
          🧱
        </button>
        <div className="mx-1 h-6 w-px bg-[#e9e9eb]" />
        <button title="Undo (Ctrl+Z)" onClick={undo} disabled={!past.length} className={`${toolBtn(false)} disabled:opacity-30`}>
          ↩️
        </button>
        <button title="Redo (Ctrl+Y)" onClick={redo} disabled={!future.length} className={`${toolBtn(false)} disabled:opacity-30`}>
          ↪️
        </button>
        <button title="Clear canvas" onClick={clear} disabled={!state} className={`${toolBtn(false)} disabled:opacity-30`}>
          🗑️
        </button>
      </div>

      {/* Top-right: share / export */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="hidden h-10 items-center rounded-xl border border-[#e9e9eb] bg-white px-3 text-sm font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:bg-[#f1f0ff] md:flex"
        >
          {panelOpen ? "Hide panel" : "Show docs"}
        </button>
        <button
          onClick={() => state && download("archflow-prd.md", state.prd_markdown, "text/markdown")}
          disabled={!state}
          className="h-10 rounded-xl border-[1.5px] border-[#1e1e1e] bg-[#6965db] px-4 text-sm font-bold text-white shadow-[2px_2px_0_#1e1e1e] hover:bg-[#5b57d1] disabled:opacity-40"
        >
          Share ⤴
        </button>
      </div>

      {/* Right panel: docs like Excalidraw properties */}
      {panelOpen && (
        <aside className="absolute bottom-[300px] right-4 top-[76px] flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#e9e9eb] bg-white/97 shadow-[0_16px_48px_rgba(30,30,30,0.16)] backdrop-blur">
          <div className="flex items-center gap-1 border-b border-[#e9e9eb] p-2">
            {(
              [
                ["prd", "📝 PRD"],
                ["critic", `📌 Review${state?.warnings.length ? ` ${state.warnings.length}` : ""}`],
                ["tf", "🧱 Terraform"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-lg px-3 py-1.5 font-hand text-[19px] font-bold leading-5 ${
                  tab === k ? "bg-[#e0dfff]" : "text-[#868e96] hover:bg-[#f1f0ff]"
                }`}
              >
                {label}
              </button>
            ))}
            <div className="relative ml-auto flex gap-1">
              <button
                title="More download options"
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-base leading-none transition ${
                  moreOpen ? "bg-[#e0dfff] text-[#1e1e1e]" : "text-[#495057] hover:bg-[#f1f0ff]"
                }`}
              >
                ⋯
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-8 z-30 w-56 rounded-xl border border-[#e9e9eb] bg-white p-1.5 shadow-[0_12px_32px_rgba(30,30,30,0.16)]">
                    <p className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#868e96]">
                      Download
                    </p>
                    <button
                      onClick={() => {
                        if (state) download("archflow-prd.md", state.prd_markdown, "text/markdown");
                        setMoreOpen(false);
                      }}
                      disabled={!state}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-[#1e1e1e] hover:bg-[#f1f0ff] disabled:opacity-30"
                    >
                      <span>📝</span> Download PRD <span className="ml-auto font-mono text-[10px] text-[#868e96]">.md</span>
                    </button>
                    <button
                      onClick={() => {
                        if (state) {
                          const review = state.warnings.length
                            ? state.warnings
                                .map(
                                  (w, i) =>
                                    `## ${i + 1}. [${w.severity.toUpperCase()}] ${w.title}\n\n${w.detail}\n\n**Fix:** ${w.fix}`
                                )
                                .join("\n\n---\n\n")
                            : "_No review warnings._";
                          download("archflow-review.md", `# ArchFlow Staff Review\n\n${review}\n`, "text/markdown");
                        }
                        setMoreOpen(false);
                      }}
                      disabled={!state}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-[#1e1e1e] hover:bg-[#f1f0ff] disabled:opacity-30"
                    >
                      <span>📌</span> Download Review <span className="ml-auto font-mono text-[10px] text-[#868e96]">.md</span>
                    </button>
                    <button
                      onClick={() => {
                        if (state) download("main.tf", state.terraform_hcl);
                        setMoreOpen(false);
                      }}
                      disabled={!state}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-[#1e1e1e] hover:bg-[#f1f0ff] disabled:opacity-30"
                    >
                      <span>🧱</span> Download Terraform <span className="ml-auto font-mono text-[10px] text-[#868e96]">.tf</span>
                    </button>
                    <div className="my-1 border-t border-[#e9e9eb]" />
                    <button
                      onClick={() => {
                        if (state) download("diagram.mmd", mermaidFromState(state));
                        setMoreOpen(false);
                      }}
                      disabled={!state}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-[#495057] hover:bg-[#f1f0ff] disabled:opacity-30"
                    >
                      <span>🔗</span> Download Mermaid <span className="ml-auto font-mono text-[10px] text-[#868e96]">.mmd</span>
                    </button>
                    <button
                      onClick={() => {
                        if (state) download("archflow.json", JSON.stringify(state, null, 2), "application/json");
                        setMoreOpen(false);
                      }}
                      disabled={!state}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-[#495057] hover:bg-[#f1f0ff] disabled:opacity-30"
                    >
                      <span>📦</span> Download State <span className="ml-auto font-mono text-[10px] text-[#868e96]">.json</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="excali-scroll flex-1 overflow-y-auto p-4">
            {tab === "prd" && <PrdView markdown={state?.prd_markdown ?? ""} />}
            {tab === "critic" && <CriticView state={state} />}
            {tab === "tf" && <TerraformView code={state?.terraform_hcl ?? ""} />}
          </div>
          <div className="border-t border-dashed border-[#e9e9eb] px-4 py-2">
            <p className="font-mono text-[10px] leading-4 text-[#868e96]">
              V select · H pan · drag nodes to rearrange · scroll to zoom · Ctrl+Z undo voice patch
            </p>
          </div>
        </aside>
      )}

      {/* Bottom-center: voice island */}
      <div className="absolute bottom-4 left-1/2 flex w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2">
        {error && (
          <p className="rounded-xl border border-[#fa5252] bg-[#fff5f5] px-3 py-2 text-xs font-semibold text-[#c92a2a]">
            Error: {error}
          </p>
        )}
        {state?.cleaned_transcript && (
          <p className="excali-rough-sm truncate border border-[#e9e9eb] bg-[#fff9db]/95 px-3 py-1.5 font-hand text-[18px] font-semibold text-[#495057]">
            ✍️ Heard: {state.cleaned_transcript}
          </p>
        )}
        <VoiceBar
          value={utterance}
          onChange={setUtterance}
          onSubmit={submit}
          loading={loading}
          autoSubmit={autoSubmit}
          onToggleAuto={setAutoSubmit}
        />
      </div>

      {/* Bottom-left: canvas meta */}
      <div className="absolute bottom-4 left-4 hidden flex-col gap-1 lg:flex">
        <div className="rounded-xl border border-[#e9e9eb] bg-white/90 px-2.5 py-1.5 font-mono text-[10px] text-[#868e96] shadow">
          {state ? `${state.nodes.length} shapes · ${state.edges.length} arrows` : "empty canvas"} ·{" "}
          {past.length} undo
        </div>
      </div>
    </main>
  );
}

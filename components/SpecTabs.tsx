"use client";

import ReactMarkdown from "react-markdown";
import type { ArchState } from "@/lib/schema";

export function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function mermaidFromState(s: ArchState): string {
  const lines = ["graph LR"];
  s.nodes.forEach((n) => lines.push(`  ${n.id}["${n.label}"]`));
  s.edges.forEach((e) => lines.push(`  ${e.source} -->|${e.label || e.protocol || ""}| ${e.target}`));
  return lines.join("\n");
}

export function PrdView({ markdown }: { markdown: string }) {
  if (!markdown)
    return (
      <div className="excali-rough border-[1.5px] border-dashed border-[#adb5bd] bg-[#fffdf5] p-4 text-center">
        <p className="font-hand text-2xl font-bold text-[#495057]">PRD sketch appears here 📝</p>
        <p className="text-xs text-[#868e96]">Synthesize once to generate the living spec.</p>
      </div>
    );
  return (
    <div className="prose prose-sm prose-zinc max-w-none [&_h2]:font-hand [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:text-[#1e1e1e] [&_h2]:underline [&_h2]:decoration-[#ffd43b] [&_h2]:decoration-wavy [&_h2]:underline-offset-4 [&_li]:text-[13px] [&_p]:text-[13px]">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

const STICKY: Record<string, string> = {
  high: "bg-[#ffe3e3] border-[#fa5252] rotate-[0.6deg]",
  medium: "bg-[#fff3bf] border-[#fab005] rotate-[-0.6deg]",
  low: "bg-[#d0ebff] border-[#339af0] rotate-[0.4deg]",
};

export function CriticView({ state }: { state: ArchState | null }) {
  if (!state || !state.warnings.length)
    return (
      <div className="excali-rough border-[1.5px] border-dashed border-[#adb5bd] bg-[#fffdf5] p-4 text-center">
        <p className="font-hand text-2xl font-bold text-[#495057]">No red flags yet ✅</p>
        <p className="text-xs text-[#868e96]">Staff review runs on every voice patch.</p>
      </div>
    );
  return (
    <div className="space-y-4 pt-2">
      {state.warnings.map((w, i) => (
        <div
          key={i}
          className={`tape relative rounded-sm border-[1.5px] p-3 pt-4 shadow-[3px_4px_0_rgba(30,30,30,0.12)] ${STICKY[w.severity]}`}
        >
          <div className="font-hand text-[21px] font-bold leading-5 text-[#1e1e1e]">
            {w.severity === "high" ? "⚠️" : w.severity === "medium" ? "⚡" : "ℹ️"} {w.title}
          </div>
          <div className="mt-1 text-[13px] leading-5 text-[#343a40]">{w.detail}</div>
          <div className="mt-1.5 inline-block rounded bg-[#1e1e1e] px-2 py-0.5 font-mono text-[11px] text-[#ffd43b]">
            Fix → {w.fix}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TerraformView({ code }: { code: string }) {
  if (!code)
    return (
      <div className="excali-rough border-[1.5px] border-dashed border-[#adb5bd] bg-[#fffdf5] p-4 text-center">
        <p className="font-hand text-2xl font-bold text-[#495057]">Terraform doodle here 🏗️</p>
      </div>
    );
  return (
    <div>
      <div className="mb-2 flex gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
        <span className="h-3 w-3 rounded-full bg-[#ffd43b]" />
        <span className="h-3 w-3 rounded-full bg-[#51cf66]" />
        <span className="ml-2 font-mono text-[11px] text-[#868e96]">main.tf — terraform plan ready</span>
      </div>
      <pre className="excali-scroll overflow-auto rounded-xl border-[1.5px] border-[#1e1e1e] bg-[#1e1e1e] p-4 font-mono text-[11px] leading-5 text-[#e7f5ff]">
        {code}
      </pre>
    </div>
  );
}

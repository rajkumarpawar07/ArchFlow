"use client";

import { useEffect, useRef } from "react";
import {
  SAMPLE_GCP_RAMBLE,
  SAMPLE_MUTATION_DLQ,
  SAMPLE_MUTATION_SPANNER,
  SAMPLE_ORDER_RAMBLE,
} from "@/lib/samples";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  autoSubmit: boolean;
  onToggleAuto: (v: boolean) => void;
};

export default function VoiceBar({ value, onChange, onSubmit, loading, autoSubmit, onToggleAuto }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!autoSubmit || loading) return;
    if (!value.trim()) return;
    timer.current = setTimeout(() => {
      if (value.trim().length > 12) onSubmit();
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, autoSubmit]);

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full rounded-2xl border border-[#e9e9eb] bg-white/95 shadow-[0_16px_40px_rgba(30,30,30,0.14)] backdrop-blur">
      <div className="flex items-center gap-3 px-4 pt-3">
        <button
          onClick={() => areaRef.current?.focus()}
          title="Focus for Wispr Flow dictation"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg transition ${
            autoSubmit
              ? "border-[#6965db] bg-[#6965db] text-white shadow-[2px_3px_0_rgba(30,30,30,0.2)]"
              : "border-[#1e1e1e] bg-white hover:bg-[#f1f0ff]"
          }`}
        >
          🎙️
        </button>
        <div className="min-w-0">
          <p className="font-hand text-[22px] font-bold leading-5 text-[#1e1e1e]">
            Hold Wispr hotkey & talk to sketch…
          </p>
          <p className="truncate text-xs text-[#868e96]">
            Burst auto-sends 900ms after you stop · Enter to send · Shift+Enter newline
          </p>
        </div>
        <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#e9e9eb] bg-[#f8f9fa] px-2.5 py-1 text-[11px] font-semibold text-[#495057]">
          <span className={`inline-block h-2 w-2 rounded-full ${autoSubmit ? "bg-[#40c057]" : "bg-[#adb5bd]"}`} />
          <input
            type="checkbox"
            checked={autoSubmit}
            onChange={(e) => onToggleAuto(e.target.checked)}
            className="hidden"
          />
          Auto {autoSubmit ? "ON" : "OFF"}
        </label>
      </div>

      <div className="px-4 pb-1 pt-2">
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={3}
          placeholder="Dictate via Wispr Flow, e.g. Let's design an event-driven order system on GCP…"
          className="excali-rough-sm w-full resize-y border-[1.5px] border-[#1e1e1e]/70 bg-[#fffdf5] p-3 text-sm leading-6 text-[#1e1e1e] outline-none placeholder:text-[#adb5bd] focus:border-[#6965db] focus:bg-white"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1">
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="rounded-lg border-[1.5px] border-[#1e1e1e] bg-[#6965db] px-4 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_#1e1e1e] transition hover:bg-[#5b57d1] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40"
        >
          {loading ? "Sketching…" : "✨ Sketch →"}
        </button>
        <span className="font-mono text-[11px] text-[#868e96]">{words} words</span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {(
            [
              ["orders", SAMPLE_ORDER_RAMBLE],
              ["active-active", SAMPLE_GCP_RAMBLE],
              ["⇄ Spanner", SAMPLE_MUTATION_SPANNER],
              ["＋ DLQ", SAMPLE_MUTATION_DLQ],
            ] as const
          ).map(([label, sample]) => (
            <button
              key={label}
              onClick={() => onChange(sample)}
              className="excali-rough-sm border border-[#ced4da] bg-white px-2.5 py-1 font-hand text-[17px] font-semibold leading-5 text-[#343a40] hover:border-[#6965db] hover:bg-[#f1f0ff]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

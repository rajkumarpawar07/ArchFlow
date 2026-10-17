"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { layoutGraph, NODE_COLORS, NODE_FILLS } from "@/lib/layout";
import { logoForNode } from "@/lib/serviceLogos";
import type { ArchEdge, ArchNode, ArchNodeType } from "@/lib/schema";

type NodeData = {
  label: string;
  sublabel?: string;
  nodeType: string;
  region?: string;
  editing?: boolean;
  onEdit?: (id: string, patch: Partial<Pick<ArchNode, "label" | "sublabel" | "type" | "region">>) => void;
};

function SketchNode({
  id,
  data,
  selected,
}: {
  id: string;
  data: NodeData;
  selected?: boolean;
}) {
  const stroke = NODE_COLORS[data.nodeType] ?? "#495057";
  const fill = NODE_FILLS[data.nodeType] ?? "#f8f9fa";
  const logo = logoForNode(data.label, data.sublabel, data.nodeType);
  const LogoIcon = logo.Icon;
  const tilt = (data.label.length % 3) - 1;
  const isEllipse = data.nodeType === "actor";
  const isDiamond = data.nodeType === "gateway" || data.nodeType === "cache";
  const isPill = data.nodeType === "messaging";

  const [draft, setDraft] = useState<{ id: string; label: string; sub: string } | null>(null);
  // Reset draft when editing opens (render-time adjustment, no effect needed)
  if (data.editing && (!draft || draft.id !== id)) {
    setDraft({ id, label: data.label, sub: data.sublabel ?? "" });
  }

  const commit = () => {
    if (!draft) return;
    data.onEdit?.(id, {
      label: draft.label.trim() || data.label,
      sublabel: draft.sub.trim(),
    });
  };

  return (
    <div
      className="group"
      style={{ transform: `rotate(${tilt * 0.6}deg)`, filter: "url(#excali-rough)" }}
    >
      <div
        className="excali-rough relative border-[2px] px-4 py-2.5 shadow-[2px_3px_0_rgba(30,30,30,0.15)]"
        style={{
          background: fill,
          borderColor: selected ? "#6965db" : stroke,
          minWidth: 176,
          maxWidth: 230,
          outline: selected ? "2px solid rgba(105,101,219,0.45)" : undefined,
          outlineOffset: 2,
          borderRadius: isEllipse
            ? "50% / 50%"
            : isDiamond
              ? "18px"
              : isPill
                ? "999px"
                : undefined,
          transform: isDiamond ? "skewX(-6deg)" : undefined,
          cursor: data.editing ? "default" : "grab",
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !rounded-[3px] !border-2 !border-[#1e1e1e] !bg-white opacity-0 transition group-hover:opacity-100"
        />
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex h-5 w-5 items-center justify-center"
            style={{ color: logo.color }}
            title={logo.name}
          >
            <LogoIcon className="h-5 w-5" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1e1e1e]/70">
            {data.nodeType}
          </span>
        </div>

        {data.editing && draft ? (
          <div className="mt-1 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") data.onEdit?.(id, {});
              }}
              className="w-full rounded border border-[#adb5bd] bg-white px-1.5 py-0.5 font-hand text-[20px] font-semibold text-[#1e1e1e] outline-none focus:border-[#6965db]"
              placeholder="Service name"
            />
            <input
              value={draft.sub}
              onChange={(e) => setDraft({ ...draft, sub: e.target.value })}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") data.onEdit?.(id, {});
              }}
              className="w-full rounded border border-[#e9e9eb] bg-white/90 px-1.5 py-0.5 font-hand text-[14px] text-[#495057] outline-none focus:border-[#6965db]"
              placeholder="Sublabel (optional)"
            />
            <p className="font-mono text-[9px] text-[#868e96]">Enter save · Esc cancel · double-click to edit</p>
          </div>
        ) : (
          <>
            <div
              className="font-hand text-[22px] font-semibold leading-6 text-[#1e1e1e]"
              title="Double-click to edit"
            >
              {data.label}
            </div>
            {data.sublabel ? (
              <div className="font-hand text-[16px] leading-5 text-[#1e1e1e]/70">{data.sublabel}</div>
            ) : null}
            {data.region ? (
              <div className="excali-rough-sm mt-1 inline-block border border-[#1e1e1e]/60 bg-white/80 px-2 py-px font-mono text-[10px] text-[#1e1e1e]">
                {data.region}
              </div>
            ) : null}
          </>
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !rounded-[3px] !border-2 !border-[#1e1e1e] !bg-white opacity-0 transition group-hover:opacity-100"
        />
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = { default: SketchNode };

const TYPE_OPTIONS: ArchNodeType[] = [
  "actor",
  "gateway",
  "compute",
  "messaging",
  "data",
  "cache",
  "security",
  "analytics",
  "generic",
];

export default function DiagramCanvas({
  nodes,
  edges,
  panMode = false,
  onNodesChange: onParentNodesChange,
  onNodePatch,
}: {
  nodes: ArchNode[];
  edges: ArchEdge[];
  panMode?: boolean;
  /** Called when React Flow reports node position/selection changes. */
  onNodesChange?: (nodes: ArchNode[]) => void;
  /** Called when the user edits a node (label, type, region). */
  onNodePatch?: (id: string, patch: Partial<Pick<ArchNode, "label" | "sublabel" | "type" | "region">>) => void;
}) {
  const [rfNodes, setRfNodes, onNodesChangeInternal] = useNodesState<Node<NodeData>>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const layoutKeyRef = useRef<string>("");

  const nodeKey = useMemo(() => nodes.map((n) => n.id).join("|"), [nodes]);
  const edgeKey = useMemo(
    () => edges.map((e) => `${e.source}->${e.target}:${e.label}`).join("|"),
    [edges]
  );

  const handleEdit = useCallback(
    (id: string, patch: Partial<Pick<ArchNode, "label" | "sublabel" | "type" | "region">>) => {
      // Empty patch = toggle edit mode
      if (!patch || Object.keys(patch).length === 0) {
        setEditingId((cur) => (cur === id ? null : id));
        return;
      }
      setEditingId(null);
      onNodePatch?.(id, patch);
    },
    [onNodePatch]
  );

  // Re-layout only when the graph structure changes (new synthesis / undo), not on drag.
  useEffect(() => {
    const key = `${nodeKey}::${edgeKey}`;
    if (key === layoutKeyRef.current) return;
    layoutKeyRef.current = key;

    if (!nodes.length) {
      setRfNodes([]);
      setRfEdges([]);
      return;
    }

    const { rfNodes: laid, rfEdges: laidEdges } = layoutGraph(nodes, edges);
    setRfNodes((prev) => {
      const prevById = new Map(prev.map((n) => [n.id, n]));
      return laid.map((n) => {
        const old = prevById.get(n.id);
        return {
          id: n.id,
          type: "default",
          data: {
            ...n.data,
            editing: editingId === n.id,
            onEdit: handleEdit,
          },
          position: n.position,
          draggable: !panMode,
          selected: selectedId === n.id,
          // Carry measurements over so a node can be dragged immediately after re-layout
          // (missing `measured` triggers React Flow error #015).
          ...(old?.measured ? { measured: old.measured } : {}),
        };
      });
    });
    setRfEdges(
      laidEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.animated,
        type: "smoothstep",
        style: { stroke: "#1e1e1e", strokeWidth: 2 },
        labelBgStyle: { fill: "#fff", fillOpacity: 1 },
        labelStyle: { fill: "#1e1e1e", fontSize: 15, fontFamily: "Caveat, cursive", fontWeight: 600 },
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeKey, edgeKey, nodes, edges]);

  // Keep editing flag + panMode + callbacks fresh on existing nodes without re-layout.
  useEffect(() => {
    setRfNodes((nds) =>
      nds.map((n) => {
        const base = nodes.find((x) => x.id === n.id);
        return {
          ...n,
          draggable: !panMode,
          selected: selectedId === n.id,
          data: {
            ...n.data,
            ...(base
              ? { label: base.label, sublabel: base.sublabel, nodeType: base.type, region: base.region }
              : {}),
            editing: editingId === n.id,
            onEdit: handleEdit,
          },
        };
      })
    );
  }, [editingId, panMode, selectedId, handleEdit, setRfNodes, nodes]);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChangeInternal>[0]) => {
      onNodesChangeInternal(changes);
      const hasPosition = changes.some((c) => c.type === "position");
      if (!hasPosition || !onParentNodesChange) return;
      // Defer read so React Flow has applied the change
      requestAnimationFrame(() => {
        const current = rfNodes;
        const byId = new Map(nodes.map((n) => [n.id, n]));
        const next = current
          .map((n) => {
            const base = byId.get(n.id);
            if (!base) return null;
            return { ...base };
          })
          .filter(Boolean) as ArchNode[];
        onParentNodesChange(next);
      });
    },
    [onNodesChangeInternal, onParentNodesChange, rfNodes, nodes]
  );

  const handleSelectionChange = useCallback(({ nodes: sel }: OnSelectionChangeParams) => {
    setSelectedId(sel[0]?.id ?? null);
  }, []);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);

  const patchType = (type: ArchNodeType) => {
    if (!selectedId) return;
    onNodePatch?.(selectedId, { type });
  };

  const patchRegion = (region: string) => {
    if (!selectedId) return;
    onNodePatch?.(selectedId, { region });
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    onNodePatch?.(selectedId, { label: "" }); // parent interprets empty label as delete
  };

  return (
    <div className="excali-flow relative h-full w-full overflow-hidden bg-white">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="excali-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
          </filter>
        </defs>
      </svg>

      {!nodes.length ? (
        <div className="excali-dots absolute inset-0">
          <div className="flex h-full items-center justify-center p-8">
            <div className="excali-rough max-w-md border-2 border-dashed border-[#adb5bd] bg-white/90 p-8 text-center shadow-[3px_4px_0_rgba(30,30,30,0.08)]">
              <div className="font-hand text-4xl font-bold text-[#1e1e1e]">Infinite canvas awaits ✍️</div>
              <p className="mt-2 text-sm text-[#495057]">
                Hold your <b>Wispr Flow hotkey</b> in the bar below and talk your architecture — or pick a
                sample to see the sketch come alive.
              </p>
              <p className="mt-3 font-mono text-[11px] text-[#868e96]">
                drag to pan · scroll to zoom · drag nodes · double-click to edit
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onSelectionChange={handleSelectionChange}
          onNodeDoubleClick={(_, n) => setEditingId((cur) => (cur === n.id ? null : n.id))}
          onPaneClick={() => {
            setEditingId(null);
            setSelectedId(null);
          }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          panOnDrag={panMode ? true : [1, 2]}
          selectionOnDrag={!panMode}
          panOnScroll
          zoomOnScroll
          minZoom={0.3}
          maxZoom={2}
          colorMode="light"
          proOptions={{ hideAttribution: false }}
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.6} color="#d4d4d4" bgColor="#ffffff" />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            style={{ width: 140, height: 100, background: "#fff" }}
            maskColor="rgba(105, 101, 219, 0.12)"
          />
        </ReactFlow>
      )}

      {/* Customize panel for selected node */}
      {selectedNode && (
        <div className="absolute left-4 top-16 z-20 w-56 rounded-2xl border border-[#e9e9eb] bg-white/97 p-3 shadow-[0_12px_32px_rgba(30,30,30,0.14)] backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-hand text-[18px] font-bold text-[#1e1e1e]">Customize</p>
            <button
              onClick={() => setSelectedId(null)}
              className="rounded px-1.5 text-sm text-[#868e96] hover:bg-[#f1f0ff]"
              title="Close"
            >
              ✕
            </button>
          </div>
          <p className="mb-1 truncate font-mono text-[10px] text-[#868e96]" title={selectedNode.label}>
            {selectedNode.label}
          </p>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#868e96]">Type</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => patchType(t)}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold transition ${
                  selectedNode.type === t
                    ? "border-transparent text-white"
                    : "border-[#e9e9eb] text-[#495057] hover:border-[#c3c0ff]"
                }`}
                style={
                  selectedNode.type === t
                    ? { background: NODE_COLORS[t] }
                    : { background: NODE_FILLS[t] }
                }
              >
                {t}
              </button>
            ))}
          </div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#868e96]">Region</label>
          <input
            defaultValue={selectedNode.region ?? ""}
            onBlur={(e) => patchRegion(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            placeholder="e.g. us-central1"
            className="mb-2 w-full rounded-lg border border-[#e9e9eb] px-2 py-1 font-mono text-[11px] outline-none focus:border-[#6965db]"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => setEditingId(selectedNode.id)}
              className="flex-1 rounded-lg border border-[#e9e9eb] px-2 py-1 text-[11px] font-semibold text-[#495057] hover:bg-[#f1f0ff]"
            >
              Rename
            </button>
            <button
              onClick={deleteSelected}
              className="rounded-lg border border-[#ffc9c9] bg-[#fff5f5] px-2 py-1 text-[11px] font-semibold text-[#c92a2a] hover:bg-[#ffe3e3]"
            >
              Delete
            </button>
          </div>
          <p className="mt-2 font-mono text-[9px] leading-3 text-[#adb5bd]">
            Drag node to move · double-click rename · type chips restyle shape
          </p>
        </div>
      )}
    </div>
  );
}

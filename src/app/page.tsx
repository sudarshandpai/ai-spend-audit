"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

interface ToolInput {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

const TOOLS = [
  { id: "cursor", name: "Cursor", emoji: "🖱️", plans: ["Hobby", "Pro", "Business", "Enterprise"] },
  { id: "github_copilot", name: "GitHub Copilot", emoji: "🐙", plans: ["Individual", "Business", "Enterprise"] },
  { id: "claude", name: "Claude", emoji: "🤖", plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API"] },
  { id: "chatgpt", name: "ChatGPT", emoji: "💬", plans: ["Plus", "Team", "Enterprise", "API"] },
  { id: "anthropic_api", name: "Anthropic API", emoji: "⚡", plans: ["Pay as you go"] },
  { id: "openai_api", name: "OpenAI API", emoji: "🔮", plans: ["Pay as you go"] },
  { id: "gemini", name: "Gemini", emoji: "♊", plans: ["Pro", "Ultra", "API"] },
  { id: "windsurf", name: "Windsurf", emoji: "🏄", plans: ["Free", "Pro", "Teams"] },
];

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "💻 Coding" },
  { value: "writing", label: "✍️ Writing" },
  { value: "data", label: "📊 Data" },
  { value: "research", label: "🔍 Research" },
  { value: "mixed", label: "🔀 Mixed" },
];

const defaultTools: ToolInput[] = TOOLS.map((t) => ({
  tool: t.id,
  plan: t.plans[0],
  monthlySpend: 0,
  seats: 1,
}));

export default function Home() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolInput[]>(defaultTools);
  const [teamSize, setTeamSize] = useState<number | "">(1);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("audit_form");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTools(parsed.tools || defaultTools);
      setTeamSize(parsed.teamSize || 1);
      setUseCase(parsed.useCase || "mixed");
      setActiveTools(new Set(parsed.activeTools || []));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "audit_form",
      JSON.stringify({ tools, teamSize, useCase, activeTools: [...activeTools] })
    );
  }, [tools, teamSize, useCase, activeTools]);

  function toggleTool(toolId: string) {
    setActiveTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  }

  function updateTool(toolId: string, field: keyof ToolInput, value: string | number) {
    setTools((prev) =>
      prev.map((t) => (t.tool === toolId ? { ...t, [field]: value } : t))
    );
  }

  function resetForm() {
    setTools(defaultTools);
    setTeamSize(1);
    setUseCase("mixed");
    setActiveTools(new Set());
    localStorage.removeItem("audit_form");
  }

  async function handleSubmit() {
    const activePaid = tools.filter(
      (t) => activeTools.has(t.tool) && t.monthlySpend > 0
    );
    if (activePaid.length === 0) {
      alert("Please add at least one tool with a monthly spend.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools: tools.filter((t) => activeTools.has(t.tool)),
          teamSize: teamSize || 1,
          useCase,
        }),
      });
      const data = await res.json();
      if (data.shareId) {
        router.push(`/results/${data.shareId}`);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const totalSpend = tools
    .filter((t) => activeTools.has(t.tool))
    .reduce((sum, t) => sum + (t.monthlySpend || 0), 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={resetForm} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="text-emerald-400 font-bold text-lg">⚡ SpendLens</span>
          </button>
          <span className="text-slate-500 text-xs">Free · No login needed</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-emerald-400 text-xs font-medium">Free AI spend audit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            Are you <span className="text-emerald-400">overpaying</span><br />for AI tools?
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Get an instant audit — what to cut, what to switch, and exactly how much you'd save.
          </p>
        </div>

        {/* Team info */}
        <div className="bg-slate-800/80 rounded-2xl p-5 mb-4 border border-slate-700/50 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">About your team</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Team size</label>
              <input
                type="number"
                min={1}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => { if (teamSize === "" || Number(teamSize) < 1) setTeamSize(1); }}
                className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Primary use case</label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value as UseCase)}
                className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              >
                {USE_CASES.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Which AI tools do you pay for?
          </h2>

          <div className="space-y-2">
            {TOOLS.map((toolDef) => {
              const isActive = activeTools.has(toolDef.id);
              const toolData = tools.find((t) => t.tool === toolDef.id)!;

              return (
                <div
                  key={toolDef.id}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? "border-emerald-500/50 bg-slate-800/90 shadow-lg shadow-emerald-500/5"
                      : "border-slate-700/40 bg-slate-800/40"
                  }`}
                >
                  <button
                    onClick={() => toggleTool(toolDef.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{toolDef.emoji}</span>
                      <span className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-400"}`}>
                        {toolDef.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && toolData.monthlySpend > 0 && (
                        <span className="text-emerald-400 text-xs font-semibold">
                          ${toolData.monthlySpend}/mo
                        </span>
                      )}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive ? "border-emerald-400 bg-emerald-400" : "border-slate-600"
                      }`}>
                        {isActive && (
                          <svg className="w-2.5 h-2.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  {isActive && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Plan</label>
                          <select
                            value={toolData.plan}
                            onChange={(e) => updateTool(toolDef.id, "plan", e.target.value)}
                            className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                          >
                            {toolDef.plans.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">$/month</label>
                          <input
                            type="number"
                            min={0}
                            value={toolData.monthlySpend === 0 ? "" : toolData.monthlySpend}
                            placeholder="0"
                            onChange={(e) =>
                              updateTool(toolDef.id, "monthlySpend", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            onBlur={(e) => { if (!e.target.value) updateTool(toolDef.id, "monthlySpend", 0); }}
                            className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Seats</label>
                          <input
                            type="number"
                            min={1}
                            value={toolData.seats === 0 ? "" : toolData.seats}
                            onChange={(e) =>
                              updateTool(toolDef.id, "seats", e.target.value === "" ? 0 : Number(e.target.value))
                            }
                            onBlur={(e) => {
                              if (!e.target.value || Number(e.target.value) < 1) updateTool(toolDef.id, "seats", 1);
                            }}
                            className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 px-4 py-3 z-20">
        <div className="max-w-2xl mx-auto">
          {activeTools.size > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">
                {activeTools.size} tool{activeTools.size > 1 ? "s" : ""} · ${totalSpend}/mo
              </span>
              <span className="text-slate-500 text-xs">
                ~${(totalSpend * 12).toLocaleString()}/yr
              </span>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || activeTools.size === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Running audit...
              </span>
            ) : (
              "Run my free audit →"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
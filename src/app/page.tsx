"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UseCase = "coding" | "writing" | "data" | "research" | "mixed";
type Tab = "audit" | "tools";

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

const PRESETS = [
  {
    label: "🌱 Lean",
    desc: "Essential only",
    tools: ["cursor", "chatgpt"],
    plans: { cursor: "Pro", chatgpt: "Plus" },
    spends: { cursor: 20, chatgpt: 20 },
  },
  {
    label: "🚀 Scale",
    desc: "Growing team",
    tools: ["cursor", "claude", "chatgpt", "github_copilot"],
    plans: { cursor: "Business", claude: "Team", chatgpt: "Team", github_copilot: "Business" },
    spends: { cursor: 40, claude: 30, chatgpt: 30, github_copilot: 19 },
  },
  {
    label: "💎 Full Stack",
    desc: "Best-in-class",
    tools: ["cursor", "claude", "chatgpt", "github_copilot", "gemini"],
    plans: { cursor: "Enterprise", claude: "Enterprise", chatgpt: "Enterprise", github_copilot: "Enterprise", gemini: "Ultra" },
    spends: { cursor: 100, claude: 60, chatgpt: 60, github_copilot: 39, gemini: 300 },
  },
];

const defaultTools: ToolInput[] = TOOLS.map((t) => ({
  tool: t.id,
  plan: t.plans[0],
  monthlySpend: 0,
  seats: 1,
}));

// Reset Icon SVG
function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("audit");
  const [tools, setTools] = useState<ToolInput[]>(defaultTools);
  const [teamSize, setTeamSize] = useState<number | "">(1);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  // What-If state
  const [whatIfSeats, setWhatIfSeats] = useState(5);

  // API estimator state
  const [tokensPerDay, setTokensPerDay] = useState(100000);
  const [apiModel, setApiModel] = useState<"gpt4" | "claude3" | "gemini">("claude3");

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

  function applyPreset(preset: typeof PRESETS[0]) {
    setActiveTools(new Set(preset.tools));
    setTools((prev) =>
      prev.map((t) => ({
        ...t,
        plan: (preset.plans as Record<string, string>)[t.tool] || t.plan,
        monthlySpend: (preset.spends as Record<string, number>)[t.tool] || 0,
        seats: 1,
      }))
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

  // What-If
  const currentSeats = Math.max(...tools.filter((t) => activeTools.has(t.tool)).map((t) => t.seats), 1);
  const whatIfSpend = totalSpend * ((currentSeats + whatIfSeats) / currentSeats);
  const whatIfDelta = whatIfSpend - totalSpend;

  // ROI
  const costPerDev = totalSpend / (Number(teamSize) || 1);
  const roiValue = (8000 * 15) / 100;
  const roiMultiple = costPerDev > 0 ? (roiValue / costPerDev).toFixed(1) : "∞";

  // API
  const API_COSTS: Record<string, { per1k: number; name: string }> = {
    claude3: { per1k: 0.003, name: "Claude Sonnet" },
    gpt4: { per1k: 0.03, name: "GPT-4o" },
    gemini: { per1k: 0.00075, name: "Gemini 1.5 Flash" },
  };
  const selectedApi = API_COSTS[apiModel];
  const estimatedApiCost = ((tokensPerDay * 30) / 1000) * selectedApi.per1k;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-emerald-400 font-bold text-lg">⚡ SpendLens</span>
          <button
            onClick={resetForm}
            title="Reset form"
            className="text-slate-400 hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-slate-700/50"
          >
            <ResetIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-0">
          {(["audit", "tools"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                tab === t
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {t === "audit" ? "🔍 Audit" : "🛠️ Tools"}
            </button>
          ))}
        </div>
      </div>

      {/* AUDIT TAB */}
      {tab === "audit" && (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-36">
          {/* Hero */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-3">
              <span className="text-emerald-400 text-xs font-medium">Free AI spend audit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
              Are you <span className="text-emerald-400">overpaying</span><br />for AI tools?
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Get an instant audit — what to cut, what to switch, and exactly how much you'd save.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">Start with a preset or fill in manually:</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-3 text-left transition-all active:scale-95"
                >
                  <div className="text-sm font-semibold text-white">{preset.label}</div>
                  <div className="text-xs text-slate-400">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Team info */}
          <div className="bg-slate-800/80 rounded-2xl p-4 mb-4 border border-slate-700/50">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">About your team</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Team size</label>
                <input
                  type="number"
                  min={1}
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={() => { if (teamSize === "" || Number(teamSize) < 1) setTeamSize(1); }}
                  className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Primary use case</label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as UseCase)}
                  className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
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
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
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
                          <span className="text-emerald-400 text-xs font-semibold">${toolData.monthlySpend}/mo</span>
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
      )}

      {/* TOOLS TAB */}
      {tab === "tools" && (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
          <p className="text-slate-400 text-sm mb-6 text-center">
            Explore costs before you commit. All calculators use your current audit data.
          </p>

          {/* What-If Calculator */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center text-lg">🔮</div>
              <div>
                <h3 className="font-bold text-white text-sm">What-If Calculator</h3>
                <p className="text-slate-400 text-xs">Simulate adding seats to your current stack</p>
              </div>
            </div>

            <div className="mt-4">
              {totalSpend === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                  Add tools in the Audit tab first to use this calculator.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 text-xs">Seats to add</label>
                    <span className="text-white font-bold text-sm">+{whatIfSeats} seats</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={whatIfSeats}
                    onChange={(e) => setWhatIfSeats(Number(e.target.value))}
                    className="w-full accent-emerald-500 mb-4"
                  />

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-700/60 rounded-xl p-3 text-center">
                      <div className="text-slate-400 text-xs mb-1">Now</div>
                      <div className="text-white font-bold">${totalSpend}/mo</div>
                    </div>
                    <div className="flex items-center justify-center text-slate-500 text-xl">→</div>
                    <div className="bg-orange-900/30 border border-orange-700/40 rounded-xl p-3 text-center">
                      <div className="text-slate-400 text-xs mb-1">After +{whatIfSeats}</div>
                      <div className="text-orange-400 font-bold">${whatIfSpend.toFixed(0)}/mo</div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Extra monthly cost</span>
                    <span className="text-red-400 font-bold text-sm">+${whatIfDelta.toFixed(0)}/mo (+${(whatIfDelta * 12).toFixed(0)}/yr)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center text-lg">📈</div>
              <div>
                <h3 className="font-bold text-white text-sm">ROI Calculator</h3>
                <p className="text-slate-400 text-xs">Is your AI spend worth it?</p>
              </div>
            </div>

            {totalSpend === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">
                Add tools in the Audit tab first.
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-400 text-sm">Total AI spend</span>
                    <span className="text-white font-semibold">${totalSpend}/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-400 text-sm">Cost per developer</span>
                    <span className="text-white font-semibold">${costPerDev.toFixed(0)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-400 text-sm">Est. productivity gain</span>
                    <span className="text-emerald-400 font-semibold">+15%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-400 text-sm">Value generated/dev</span>
                    <span className="text-emerald-400 font-semibold">${roiValue}/mo</span>
                  </div>
                </div>

                <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-center">
                  <div className="text-slate-300 text-xs mb-1">Your AI ROI multiple</div>
                  <div className="text-4xl font-bold text-emerald-400">{roiMultiple}x</div>
                  <div className="text-slate-400 text-xs mt-1">
                    For every $1 spent on AI, you get ~${roiMultiple} back in productivity
                  </div>
                </div>

                <p className="text-slate-500 text-xs mt-3 text-center">
                  Based on avg. $8k/mo developer salary · 15% conservative productivity improvement
                </p>
              </>
            )}
          </div>

          {/* API Cost Estimator */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center text-lg">⚡</div>
              <div>
                <h3 className="font-bold text-white text-sm">API Cost Estimator</h3>
                <p className="text-slate-400 text-xs">Tokens per day → monthly bill</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-slate-400 text-xs mb-1.5 block">Choose model</label>
              <div className="grid grid-cols-3 gap-2">
                {(["claude3", "gpt4", "gemini"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setApiModel(m)}
                    className={`rounded-xl py-2 px-2 text-xs font-medium transition-all border ${
                      apiModel === m
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {m === "claude3" ? "Claude" : m === "gpt4" ? "GPT-4o" : "Gemini"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 text-xs">Tokens per day</label>
                <span className="text-white font-bold text-sm">{tokensPerDay.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={5000000}
                step={10000}
                value={tokensPerDay}
                onChange={(e) => setTokensPerDay(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10k (light)</span><span>5M (heavy)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/60 rounded-xl p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">Monthly tokens</div>
                <div className="text-white font-bold">{(tokensPerDay * 30 / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-3 text-center">
                <div className="text-slate-400 text-xs mb-1">Est. monthly cost</div>
                <div className="text-emerald-400 font-bold text-lg">${estimatedApiCost.toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-3 bg-slate-700/30 rounded-xl p-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Model</span>
                <span className="text-white">{selectedApi.name}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-400">Rate</span>
                <span className="text-white">${selectedApi.per1k}/1k tokens</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom bar — only on audit tab */}
      {tab === "audit" && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 px-4 py-3 z-20">
          <div className="max-w-2xl mx-auto">
            {activeTools.size > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">
                  {activeTools.size} tool{activeTools.size > 1 ? "s" : ""} · ${totalSpend}/mo
                </span>
                <span className="text-slate-500 text-xs">~${(totalSpend * 12).toLocaleString()}/yr</span>
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
      )}
    </main>
  );
}
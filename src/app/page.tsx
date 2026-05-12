"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UseCase = "coding" | "writing" | "data" | "research" | "mixed";
type Tab = "audit" | "tools";
type Theme = "dark" | "light";

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
    label: "🌱 Lean Startup",
    desc: "Essential tools only",
    tools: ["cursor", "chatgpt"],
    plans: { cursor: "Pro", chatgpt: "Plus" },
    spends: { cursor: 20, chatgpt: 20 },
  },
  {
    label: "🚀 Scale-Ready",
    desc: "Growing team stack",
    tools: ["cursor", "claude", "chatgpt", "github_copilot"],
    plans: { cursor: "Business", claude: "Team", chatgpt: "Team", github_copilot: "Business" },
    spends: { cursor: 40, claude: 30, chatgpt: 30, github_copilot: 19 },
  },
  {
    label: "💎 Best-in-Class",
    desc: "Full enterprise stack",
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

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("audit");
  const [theme, setTheme] = useState<Theme>("dark");
  const [tools, setTools] = useState<ToolInput[]>(defaultTools);
  const [teamSize, setTeamSize] = useState<number | "">(1);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
  const [whatIfSeats, setWhatIfSeats] = useState(5);
  const [tokensPerDay, setTokensPerDay] = useState(100000);
  const [apiModel, setApiModel] = useState<"gpt4" | "claude3" | "gemini">("claude3");

  const dark = theme === "dark";

  useEffect(() => {
    const saved = localStorage.getItem("audit_form");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTools(parsed.tools || defaultTools);
      setTeamSize(parsed.teamSize || 1);
      setUseCase(parsed.useCase || "mixed");
      setActiveTools(new Set(parsed.activeTools || []));
    }
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("audit_form", JSON.stringify({ tools, teamSize, useCase, activeTools: [...activeTools] }));
  }, [tools, teamSize, useCase, activeTools]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  function toggleTool(toolId: string) {
    setActiveTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  }

  function updateTool(toolId: string, field: keyof ToolInput, value: string | number) {
    setTools((prev) => prev.map((t) => (t.tool === toolId ? { ...t, [field]: value } : t)));
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
    const activePaid = tools.filter((t) => activeTools.has(t.tool) && t.monthlySpend > 0);
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

  const totalSpend = tools.filter((t) => activeTools.has(t.tool)).reduce((sum, t) => sum + (t.monthlySpend || 0), 0);
  const currentSeats = Math.max(...tools.filter((t) => activeTools.has(t.tool)).map((t) => t.seats), 1);
  const whatIfSpend = totalSpend * ((currentSeats + whatIfSeats) / currentSeats);
  const whatIfDelta = whatIfSpend - totalSpend;
  const costPerDev = totalSpend / (Number(teamSize) || 1);
  const roiValue = (8000 * 15) / 100;
  const roiMultiple = costPerDev > 0 ? (roiValue / costPerDev).toFixed(1) : "∞";
  const API_COSTS = {
    claude3: { per1k: 0.003, name: "Claude Sonnet" },
    gpt4: { per1k: 0.03, name: "GPT-4o" },
    gemini: { per1k: 0.00075, name: "Gemini 1.5 Flash" },
  };
  const selectedApi = API_COSTS[apiModel];
  const estimatedApiCost = ((tokensPerDay * 30) / 1000) * selectedApi.per1k;

  // Theme classes
  const bg = dark ? "bg-[#0f1117]" : "bg-[#f4f6f9]";
  const headerBg = dark ? "bg-[#0f1117]/90 border-white/5" : "bg-white/90 border-black/5";
  const cardBg = dark ? "bg-[#1a1d27] border-white/8" : "bg-white border-black/8";
  const cardBgAlt = dark ? "bg-[#12141c] border-white/5" : "bg-[#f9fafb] border-black/5";
  const text = dark ? "text-white" : "text-[#0f1117]";
  const textMuted = dark ? "text-slate-400" : "text-slate-500";
  const textFaint = dark ? "text-slate-500" : "text-slate-400";
  const inputBg = dark ? "bg-[#0f1117] border-white/10 text-white" : "bg-white border-black/10 text-[#0f1117]";
  const toolActive = dark ? "border-emerald-500/40 bg-[#1a1d27] shadow-emerald-500/5" : "border-emerald-500/60 bg-emerald-50 shadow-emerald-500/10";
  const toolInactive = dark ? "border-white/6 bg-[#1a1d27]/60" : "border-black/6 bg-white";
  const tabActive = dark ? "border-emerald-400 text-emerald-400" : "border-emerald-600 text-emerald-600";
  const tabInactive = dark ? "border-transparent text-slate-500 hover:text-slate-300" : "border-transparent text-slate-400 hover:text-slate-600";
  const iconBtn = dark ? "text-slate-400 hover:text-emerald-400 hover:bg-white/5" : "text-slate-500 hover:text-emerald-600 hover:bg-black/5";
  const statBg = dark ? "bg-[#0f1117] border-white/6" : "bg-slate-100 border-black/6";
  const highlightBg = dark ? "bg-emerald-900/20 border-emerald-500/20" : "bg-emerald-50 border-emerald-200";
  const presetBg = dark ? "bg-[#1a1d27] border-white/8 hover:border-emerald-500/40" : "bg-white border-black/8 hover:border-emerald-500/60";
  const stickyBar = dark ? "bg-[#0f1117]/95 border-white/8" : "bg-white/95 border-black/8";

  return (
    <main className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${headerBg} backdrop-blur-xl sticky top-0 z-20 border-b`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xl">⚡</span>
              <span className="font-bold text-lg tracking-tight">SpendLens</span>
              <span className={`hidden sm:inline text-xs ${textFaint} ml-1`}>AI Spend Audit</span>
            </div>

            {/* Tabs - centered on desktop */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {(["audit", "tools"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    tab === t
                      ? dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/10 text-emerald-600"
                      : `${textMuted} hover:${text}`
                  }`}
                >
                  {t === "audit" ? "🔍 Audit" : "🛠️ Tools"}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <button onClick={toggleTheme} title="Toggle theme" className={`p-2 rounded-lg transition-all ${iconBtn}`}>
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>
              <button onClick={resetForm} title="Reset form" className={`p-2 rounded-lg transition-all ${iconBtn}`}>
                <ResetIcon />
              </button>
              <span className={`hidden sm:inline text-xs ${textFaint} ml-2 border-l pl-3 ${dark ? "border-white/10" : "border-black/10"}`}>
                Free · No login
              </span>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex md:hidden gap-1 pb-0">
            {(["audit", "tools"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${tab === t ? tabActive : tabInactive}`}
              >
                {t === "audit" ? "🔍 Audit" : "🛠️ Tools"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* AUDIT TAB */}
      {tab === "audit" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Hero */}
              <div className="mb-2">
                <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 mb-3 ${dark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}>
                  <span className="text-emerald-500 text-xs font-semibold">Free instant audit</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-2">
                  Are you <span className="text-emerald-500">overpaying</span><br className="hidden sm:block" /> for AI tools?
                </h1>
                <p className={`${textMuted} text-base max-w-lg`}>
                  Enter your subscriptions and get a full audit — what to cut, what to switch, and exactly how much you'd save.
                </p>
              </div>

              {/* Presets */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${textFaint} mb-2`}>Quick presets</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset)}
                      className={`${presetBg} border rounded-xl p-3 text-left transition-all active:scale-95 shadow-sm`}
                    >
                      <div className="text-sm font-semibold mb-0.5">{preset.label}</div>
                      <div className={`text-xs ${textFaint}`}>{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team info */}
              <div className={`${cardBg} border rounded-2xl p-5 shadow-sm`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${textFaint} mb-4`}>About your team</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs ${textMuted} mb-1.5 block`}>Team size</label>
                    <input
                      type="number"
                      min={1}
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value === "" ? "" : Number(e.target.value))}
                      onBlur={() => { if (teamSize === "" || Number(teamSize) < 1) setTeamSize(1); }}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${textMuted} mb-1.5 block`}>Primary use case</label>
                    <select
                      value={useCase}
                      onChange={(e) => setUseCase(e.target.value as UseCase)}
                      className={`w-full ${inputBg} border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all`}
                    >
                      {USE_CASES.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tools */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${textFaint} mb-3`}>Your AI tools</p>
                <div className="space-y-2">
                  {TOOLS.map((toolDef) => {
                    const isActive = activeTools.has(toolDef.id);
                    const toolData = tools.find((t) => t.tool === toolDef.id)!;
                    return (
                      <div
                        key={toolDef.id}
                        className={`rounded-2xl border transition-all duration-200 shadow-sm ${isActive ? toolActive : toolInactive}`}
                      >
                        <button
                          onClick={() => toggleTool(toolDef.id)}
                          className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl w-7 text-center">{toolDef.emoji}</span>
                            <span className={`text-sm font-medium ${isActive ? text : textMuted}`}>{toolDef.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isActive && toolData.monthlySpend > 0 && (
                              <span className="text-emerald-500 text-xs font-bold">${toolData.monthlySpend}/mo</span>
                            )}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? "border-emerald-500 bg-emerald-500" : dark ? "border-slate-600" : "border-slate-300"}`}>
                              {isActive && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                        {isActive && (
                          <div className={`px-4 pb-4 grid grid-cols-3 gap-3 border-t ${dark ? "border-white/5" : "border-black/5"} pt-3`}>
                            <div>
                              <label className={`text-xs ${textFaint} mb-1 block`}>Plan</label>
                              <select
                                value={toolData.plan}
                                onChange={(e) => updateTool(toolDef.id, "plan", e.target.value)}
                                className={`w-full ${inputBg} border rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all`}
                              >
                                {toolDef.plans.map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={`text-xs ${textFaint} mb-1 block`}>$/month</label>
                              <input
                                type="number"
                                min={0}
                                value={toolData.monthlySpend === 0 ? "" : toolData.monthlySpend}
                                placeholder="0"
                                onChange={(e) => updateTool(toolDef.id, "monthlySpend", e.target.value === "" ? 0 : Number(e.target.value))}
                                onBlur={(e) => { if (!e.target.value) updateTool(toolDef.id, "monthlySpend", 0); }}
                                className={`w-full ${inputBg} border rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs ${textFaint} mb-1 block`}>Seats</label>
                              <input
                                type="number"
                                min={1}
                                value={toolData.seats === 0 ? "" : toolData.seats}
                                onChange={(e) => updateTool(toolDef.id, "seats", e.target.value === "" ? 0 : Number(e.target.value))}
                                onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) updateTool(toolDef.id, "seats", 1); }}
                                className={`w-full ${inputBg} border rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Sticky summary sidebar (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                {/* Spend summary card */}
                <div className={`${cardBg} border rounded-2xl p-5 shadow-sm`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${textFaint} mb-4`}>Your summary</p>
                  {activeTools.size === 0 ? (
                    <div className={`text-center py-6 ${textFaint} text-sm`}>
                      Select tools to see your spend summary
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {tools.filter((t) => activeTools.has(t.tool) && t.monthlySpend > 0).map((t) => {
                          const def = TOOLS.find((d) => d.id === t.tool)!;
                          return (
                            <div key={t.tool} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{def.emoji}</span>
                                <span className={`text-sm ${textMuted}`}>{def.name}</span>
                              </div>
                              <span className="text-sm font-semibold">${t.monthlySpend}/mo</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className={`border-t pt-3 ${dark ? "border-white/8" : "border-black/8"}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm ${textMuted}`}>Monthly total</span>
                          <span className="text-lg font-bold text-emerald-500">${totalSpend}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${textMuted}`}>Annual total</span>
                          <span className={`text-sm font-semibold ${textMuted}`}>${(totalSpend * 12).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || activeTools.size === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Running audit...
                    </span>
                  ) : "Run my free audit →"}
                </button>
                <p className={`text-center text-xs ${textFaint}`}>No account needed · Results are instant</p>

                {/* Cost per dev */}
                {totalSpend > 0 && (
                  <div className={`${cardBgAlt} border rounded-2xl p-4`}>
                    <p className={`text-xs ${textFaint} mb-2`}>Cost per team member</p>
                    <p className="text-2xl font-bold text-emerald-500">${costPerDev.toFixed(0)}<span className={`text-sm font-normal ${textMuted}`}>/mo</span></p>
                    <p className={`text-xs ${textFaint} mt-1`}>Across {teamSize || 1} people</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOLS TAB */}
      {tab === "tools" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Planning Tools</h2>
            <p className={`${textMuted} text-sm`}>Explore costs before you commit. Uses your current audit data.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* What-If Calculator */}
            <div className={`${cardBg} border rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${dark ? "bg-purple-500/15" : "bg-purple-50"}`}>🔮</div>
                <div>
                  <h3 className="font-bold text-sm">What-If Calculator</h3>
                  <p className={`text-xs ${textFaint}`}>Simulate adding seats</p>
                </div>
              </div>

              {totalSpend === 0 ? (
                <div className={`text-center py-8 ${textFaint} text-sm`}>Add tools in the Audit tab first.</div>
              ) : (
                <>
                  <div className="mb-5">
                    <div className="flex justify-between mb-2">
                      <span className={`text-xs ${textMuted}`}>Seats to add</span>
                      <span className="text-sm font-bold text-purple-400">+{whatIfSeats} seats</span>
                    </div>
                    <input
                      type="range" min={1} max={50} value={whatIfSeats}
                      onChange={(e) => setWhatIfSeats(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                    <div className={`flex justify-between text-xs ${textFaint} mt-1`}>
                      <span>1</span><span>50</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={`${statBg} border rounded-xl p-3 flex justify-between items-center`}>
                      <span className={`text-xs ${textMuted}`}>Current spend</span>
                      <span className="font-bold text-sm">${totalSpend}/mo</span>
                    </div>
                    <div className="flex justify-center"><span className={`text-xs ${textFaint}`}>↓ after +{whatIfSeats} seats</span></div>
                    <div className={`${dark ? "bg-orange-900/20 border-orange-500/20" : "bg-orange-50 border-orange-200"} border rounded-xl p-3 flex justify-between items-center`}>
                      <span className={`text-xs ${textMuted}`}>New spend</span>
                      <span className="font-bold text-sm text-orange-400">${whatIfSpend.toFixed(0)}/mo</span>
                    </div>
                    <div className={`${dark ? "bg-red-900/20 border-red-500/20" : "bg-red-50 border-red-200"} border rounded-xl p-3 flex justify-between items-center`}>
                      <span className={`text-xs ${textMuted}`}>Extra cost</span>
                      <span className="font-bold text-sm text-red-400">+${whatIfDelta.toFixed(0)}/mo · +${(whatIfDelta * 12).toFixed(0)}/yr</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ROI Calculator */}
            <div className={`${cardBg} border rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${dark ? "bg-emerald-500/15" : "bg-emerald-50"}`}>📈</div>
                <div>
                  <h3 className="font-bold text-sm">ROI Calculator</h3>
                  <p className={`text-xs ${textFaint}`}>Is your AI spend worth it?</p>
                </div>
              </div>

              {totalSpend === 0 ? (
                <div className={`text-center py-8 ${textFaint} text-sm`}>Add tools in the Audit tab first.</div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {[
                      { label: "Total AI spend", value: `$${totalSpend}/mo`, color: "" },
                      { label: "Cost per developer", value: `$${costPerDev.toFixed(0)}/mo`, color: "" },
                      { label: "Est. productivity gain", value: "+15%", color: "text-emerald-500" },
                      { label: "Value generated/dev", value: `$${roiValue}/mo`, color: "text-emerald-500" },
                    ].map((row) => (
                      <div key={row.label} className={`flex justify-between items-center py-2 border-b ${dark ? "border-white/5" : "border-black/5"}`}>
                        <span className={`text-xs ${textMuted}`}>{row.label}</span>
                        <span className={`text-sm font-semibold ${row.color || text}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`${highlightBg} border rounded-2xl p-4 text-center`}>
                    <p className={`text-xs ${textMuted} mb-1`}>Your AI ROI multiple</p>
                    <p className="text-5xl font-black text-emerald-500">{roiMultiple}x</p>
                    <p className={`text-xs ${textFaint} mt-1`}>Per $1 spent on AI tools</p>
                  </div>

                  <p className={`text-xs ${textFaint} text-center mt-3`}>
                    Based on $8k/mo avg. developer salary
                  </p>
                </>
              )}
            </div>

            {/* API Cost Estimator */}
            <div className={`${cardBg} border rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${dark ? "bg-blue-500/15" : "bg-blue-50"}`}>⚡</div>
                <div>
                  <h3 className="font-bold text-sm">API Cost Estimator</h3>
                  <p className={`text-xs ${textFaint}`}>Tokens per day → monthly bill</p>
                </div>
              </div>

              <div className="mb-4">
                <p className={`text-xs ${textFaint} mb-2`}>Choose model</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["claude3", "gpt4", "gemini"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setApiModel(m)}
                      className={`rounded-xl py-2 px-1 text-xs font-medium transition-all border ${
                        apiModel === m
                          ? dark ? "bg-blue-500/15 border-blue-500/40 text-blue-400" : "bg-blue-50 border-blue-300 text-blue-600"
                          : `${dark ? "bg-transparent border-white/8" : "bg-transparent border-black/8"} ${textMuted} hover:border-blue-400/40`
                      }`}
                    >
                      {m === "claude3" ? "Claude" : m === "gpt4" ? "GPT-4o" : "Gemini"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between mb-2">
                  <span className={`text-xs ${textMuted}`}>Tokens per day</span>
                  <span className="text-xs font-bold text-blue-400">{tokensPerDay.toLocaleString()}</span>
                </div>
                <input
                  type="range" min={10000} max={5000000} step={10000} value={tokensPerDay}
                  onChange={(e) => setTokensPerDay(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className={`flex justify-between text-xs ${textFaint} mt-1`}>
                  <span>10k (light)</span><span>5M (heavy)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className={`${statBg} border rounded-xl p-3 text-center`}>
                  <p className={`text-xs ${textFaint} mb-1`}>Monthly tokens</p>
                  <p className="font-bold text-sm">{(tokensPerDay * 30 / 1000000).toFixed(1)}M</p>
                </div>
                <div className={`${highlightBg} border rounded-xl p-3 text-center`}>
                  <p className={`text-xs ${textFaint} mb-1`}>Est. cost</p>
                  <p className="font-bold text-lg text-emerald-500">${estimatedApiCost.toFixed(2)}</p>
                </div>
              </div>

              <div className={`${statBg} border rounded-xl p-3 space-y-1`}>
                <div className="flex justify-between text-xs">
                  <span className={textFaint}>Model</span>
                  <span className={`font-medium ${text}`}>{selectedApi.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={textFaint}>Rate</span>
                  <span className={`font-medium ${text}`}>${selectedApi.per1k}/1k tokens</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={textFaint}>Per month</span>
                  <span className={`font-medium ${text}`}>${estimatedApiCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky bottom bar — audit tab only */}
      {tab === "audit" && (
        <div className={`fixed bottom-0 left-0 right-0 lg:hidden ${stickyBar} backdrop-blur-xl border-t px-4 py-3 z-20`}>
          <div className="max-w-2xl mx-auto">
            {activeTools.size > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs ${textMuted}`}>
                  {activeTools.size} tool{activeTools.size > 1 ? "s" : ""} · ${totalSpend}/mo
                </span>
                <span className={`text-xs ${textFaint}`}>~${(totalSpend * 12).toLocaleString()}/yr</span>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || activeTools.size === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Running audit...
                </span>
              ) : "Run my free audit →"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
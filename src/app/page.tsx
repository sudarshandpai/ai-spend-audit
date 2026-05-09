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
  {
    id: "cursor",
    name: "Cursor",
    plans: ["Hobby", "Pro", "Business", "Enterprise"],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    plans: ["Individual", "Business", "Enterprise"],
  },
  {
    id: "claude",
    name: "Claude",
    plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    plans: ["Plus", "Team", "Enterprise", "API"],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API Direct",
    plans: ["Pay as you go"],
  },
  {
    id: "openai_api",
    name: "OpenAI API Direct",
    plans: ["Pay as you go"],
  },
  {
    id: "gemini",
    name: "Gemini",
    plans: ["Pro", "Ultra", "API"],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    plans: ["Free", "Pro", "Teams"],
  },
];

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "💻 Coding / Engineering" },
  { value: "writing", label: "✍️ Writing / Content" },
  { value: "data", label: "📊 Data Analysis" },
  { value: "research", label: "🔍 Research" },
  { value: "mixed", label: "🔀 Mixed / General" },
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
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  // Persist form state across reloads
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
      JSON.stringify({
        tools,
        teamSize,
        useCase,
        activeTools: [...activeTools],
      }),
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

  function updateTool(
    toolId: string,
    field: keyof ToolInput,
    value: string | number,
  ) {
    setTools((prev) =>
      prev.map((t) => (t.tool === toolId ? { ...t, [field]: value } : t)),
    );
  }

  async function handleSubmit() {
    const activePaid = tools.filter(
      (t) => activeTools.has(t.tool) && t.monthlySpend > 0,
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
          teamSize,
          useCase,
        }),
      });
      const data = await res.json();
      if (data.shareId) {
        router.push(`/results/${data.shareId}`);
      }
    } catch (e) {
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
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-bold text-xl">
              ⚡ SpendLens
            </span>
            <span className="text-slate-400 text-sm ml-2">AI Spend Audit</span>
          </div>
          <span className="text-slate-400 text-sm">
            Free · No login required
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Find out if you're{" "}
            <span className="text-emerald-400">overpaying</span> for AI tools
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Enter your current AI subscriptions and get an instant audit — what
            to cut, what to switch, and exactly how much you'd save.
          </p>
        </div>

        {/* Team info */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">About your team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">
                Team size
              </label>
              <input
                type="number"
                min={1}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">
                Primary use case
              </label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value as UseCase)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {USE_CASES.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Which AI tools do you pay for?
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Toggle the tools you use, then fill in your plan and monthly spend.
          </p>

          <div className="space-y-3">
            {TOOLS.map((toolDef) => {
              const isActive = activeTools.has(toolDef.id);
              const toolData = tools.find((t) => t.tool === toolDef.id)!;

              return (
                <div
                  key={toolDef.id}
                  className={`rounded-xl border transition-all ${
                    isActive
                      ? "border-emerald-500 bg-slate-800"
                      : "border-slate-700 bg-slate-800/50"
                  }`}
                >
                  {/* Toggle header */}
                  <button
                    onClick={() => toggleTool(toolDef.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isActive
                            ? "border-emerald-400 bg-emerald-400"
                            : "border-slate-500"
                        }`}
                      >
                        {isActive && (
                          <svg
                            className="w-3 h-3 text-slate-900"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={
                          isActive ? "text-white font-medium" : "text-slate-400"
                        }
                      >
                        {toolDef.name}
                      </span>
                    </div>
                    {isActive && toolData.monthlySpend > 0 && (
                      <span className="text-emerald-400 text-sm font-medium">
                        ${toolData.monthlySpend}/mo
                      </span>
                    )}
                  </button>

                  {/* Expanded fields */}
                  {isActive && (
                    <div className="px-5 pb-5 grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">
                          Plan
                        </label>
                        <select
                          value={toolData.plan}
                          onChange={(e) =>
                            updateTool(toolDef.id, "plan", e.target.value)
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        >
                          {toolDef.plans.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">
                          Monthly spend ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={toolData.monthlySpend || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateTool(
                              toolDef.id,
                              "monthlySpend",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">
                          Seats / users
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={toolData.seats || 1}
                          onChange={(e) =>
                            updateTool(
                              toolDef.id,
                              "seats",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary bar */}
        {activeTools.size > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-sm">
                Total monthly spend:{" "}
              </span>
              <span className="text-white font-bold text-lg">
                ${totalSpend}/mo
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              {activeTools.size} tool{activeTools.size > 1 ? "s" : ""} selected
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || activeTools.size === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors"
        >
          {loading ? "Running your audit..." : "Run my free audit →"}
        </button>

        <p className="text-center text-slate-500 text-sm mt-4">
          No account needed. Results are instant and shareable.
        </p>
      </div>
    </main>
  );
}

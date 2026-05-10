"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AuditResult {
  tool: string;
  plan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedTool?: string;
  recommendedPlan?: string;
  estimatedCost: number;
  savings: number;
  reason: string;
}

interface AuditData {
  id: string;
  share_id: string;
  created_at: string;
  tools: object[];
  team_size: number;
  use_case: string;
  total_monthly_savings: number;
  total_annual_savings: number;
  summary: string;
  audit_results: AuditResult[];
}

const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

const TOOL_EMOJI: Record<string, string> = {
  cursor: "🖱️",
  github_copilot: "🐙",
  claude: "🤖",
  chatgpt: "💬",
  anthropic_api: "⚡",
  openai_api: "🔮",
  gemini: "♊",
  windsurf: "🏄",
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAudit() {
      const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("share_id", shareId)
        .single();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setAudit(data);
      setLoading(false);
    }
    fetchAudit();
  }, [shareId]);

  async function submitLead() {
    if (!email || !audit) return;
    setSubmittingLead(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: audit.id,
          email,
          companyName: company,
          role,
          teamSize: audit.team_size,
        }),
      });
      setLeadSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmittingLead(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-emerald-400 mx-auto mb-3"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-slate-400 text-sm">Loading your audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-white text-lg mb-2">Audit not found</div>
          <p className="text-slate-400 text-sm mb-4">
            This link may have expired or is invalid.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium"
          >
            Run a new audit
          </button>
        </div>
      </div>
    );
  }

  const isHighSavings = audit.total_monthly_savings > 500;
  const isOptimal = audit.total_monthly_savings < 100;
  const hasResults = audit.audit_results && audit.audit_results.length > 0;
  const maxSpend = hasResults
    ? Math.max(...audit.audit_results.map((r) => r.currentSpend))
    : 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-emerald-400 font-bold text-lg"
          >
            ⚡ SpendLens
          </button>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="bg-slate-700/80 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "✓ Copied!" : "Share"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              New audit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {/* Hero savings */}
        <div
          className={`rounded-2xl p-6 mb-5 text-center border ${
            isOptimal
              ? "bg-emerald-900/20 border-emerald-700/50"
              : "bg-gradient-to-br from-emerald-900/40 to-slate-800/80 border-emerald-600/40"
          }`}
        >
          {isOptimal ? (
            <>
              <div className="text-4xl mb-2">✅</div>
              <h1 className="text-2xl font-bold mb-1">You're spending well</h1>
              <p className="text-slate-300 text-sm">
                Your AI stack is optimized for your team.
              </p>
            </>
          ) : (
            <>
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">
                Potential savings found
              </div>
              <div className="text-5xl sm:text-6xl font-bold text-emerald-400 mb-1">
                ${audit.total_monthly_savings.toFixed(0)}
                <span className="text-xl text-emerald-500">/mo</span>
              </div>
              <div className="text-slate-300 text-lg font-semibold mb-1">
                ${audit.total_annual_savings.toFixed(0)}
                <span className="text-slate-400 font-normal text-sm">
                  {" "}
                  per year
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                Team of {audit.team_size} · {audit.use_case} use case
              </p>
            </>
          )}
        </div>

        {/* AI Summary */}
        {audit.summary && (
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400 text-sm">✦</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                AI Summary
              </span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {audit.summary}
            </p>
          </div>
        )}

        {/* Per-tool breakdown */}
        {hasResults && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Tool breakdown
            </h2>
            <div className="space-y-3">
              {audit.audit_results.map((result, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-4 ${
                    result.savings > 0
                      ? "border-orange-700/40 bg-orange-900/10"
                      : "border-slate-700/40 bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {TOOL_EMOJI[result.tool] || "🔧"}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-white">
                          {TOOL_NAMES[result.tool] || result.tool}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {result.plan} plan
                        </div>
                      </div>
                    </div>
                    {result.savings > 0 ? (
                      <span className="bg-orange-500/20 text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        Save ${result.savings.toFixed(0)}/mo
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full">
                        ✓ Optimal
                      </span>
                    )}
                  </div>

                  {/* Spend bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Current: ${result.currentSpend}/mo</span>
                      <span>
                        Recommended: ${result.estimatedCost.toFixed(0)}/mo
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${result.savings > 0 ? "bg-orange-500" : "bg-emerald-500"}`}
                        style={{
                          width: `${Math.min(100, (result.currentSpend / maxSpend) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl px-3 py-2 mb-2">
                    <span className="text-slate-400 text-xs">Action: </span>
                    <span className="text-white text-xs font-medium">
                      {result.recommendedAction}
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    {result.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credex CTA */}
        {isHighSavings && (
          <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800/80 border border-emerald-600/40 rounded-2xl p-5 mb-5">
            <div className="flex gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-bold text-sm mb-1">
                  Save even more with Credex
                </h3>
                <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                  Credex sources discounted AI credits from companies that
                  overforecast — Cursor, Claude, ChatGPT Enterprise at real
                  discounts.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors inline-block"
                >
                  Book a Credex consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Lead capture */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 mb-5">
          {leadSubmitted ? (
            <div className="text-center py-2">
              <div className="text-3xl mb-2">📬</div>
              <h3 className="font-bold text-sm mb-1">Report sent!</h3>
              <p className="text-slate-400 text-xs">
                Check your inbox.
                {isHighSavings && " A Credex advisor will reach out shortly."}
              </p>
            </div>
          ) : showLeadForm ? (
            <div>
              <h3 className="font-bold text-sm mb-3">
                {isOptimal
                  ? "Get notified on new optimizations"
                  : "Email me this report"}
              </h3>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="Your role (optional)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  name="website"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <button
                  onClick={submitLead}
                  disabled={!email || submittingLead}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {submittingLead ? "Sending..." : "Send report →"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm mb-0.5">
                  {isOptimal
                    ? "Stay updated on pricing changes"
                    : "Get this report by email"}
                </h3>
                <p className="text-slate-400 text-xs">
                  {isOptimal
                    ? "We'll notify you when deals apply to your stack."
                    : "Full breakdown + action steps."}
                </p>
              </div>
              <button
                onClick={() => setShowLeadForm(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors whitespace-nowrap shrink-0"
              >
                {isOptimal ? "Notify me" : "Email report"}
              </button>
            </div>
          )}
        </div>

        {/* Share */}
        <div className="text-center">
          <p className="text-slate-500 text-xs mb-2">
            Share this report with your team
          </p>
          <button
            onClick={copyLink}
            className="bg-slate-700/80 hover:bg-slate-600 text-white px-5 py-2 rounded-xl text-sm transition-colors"
          >
            {copied ? "✓ Link copied!" : "📋 Copy shareable link"}
          </button>
        </div>
      </div>
    </main>
  );
}

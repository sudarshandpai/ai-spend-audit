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
    } catch (e) {
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
        <div className="text-white text-xl animate-pulse">Loading your audit...</div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Audit not found</div>
          <button
            onClick={() => router.push("/")}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg"
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-emerald-400 font-bold text-xl">
            ⚡ SpendLens
          </button>
          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {copied ? "✓ Copied!" : "Share report"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              New audit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero savings block */}
        <div
          className={`rounded-2xl p-8 mb-8 text-center border ${
            isOptimal
              ? "bg-emerald-900/30 border-emerald-700"
              : "bg-gradient-to-br from-emerald-900/50 to-slate-800 border-emerald-600"
          }`}
        >
          {isOptimal ? (
            <>
              <div className="text-5xl mb-3">✅</div>
              <h1 className="text-3xl font-bold mb-2">You're spending well</h1>
              <p className="text-slate-300 text-lg">
                Your AI stack is optimized for your team size and use case.
              </p>
            </>
          ) : (
            <>
              <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                Potential savings identified
              </div>
              <div className="text-6xl font-bold text-emerald-400 mb-1">
                ${audit.total_monthly_savings.toFixed(0)}
                <span className="text-2xl text-emerald-500">/mo</span>
              </div>
              <div className="text-slate-300 text-xl mb-2">
                ${audit.total_annual_savings.toFixed(0)} per year
              </div>
              <p className="text-slate-400 text-sm">
                For a team of {audit.team_size} · {audit.use_case} use case
              </p>
            </>
          )}
        </div>

        {/* AI Summary */}
        {audit.summary && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400">✦</span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                AI-generated summary
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed">{audit.summary}</p>
          </div>
        )}

        {/* Per-tool breakdown */}
        {hasResults && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Tool-by-tool breakdown</h2>
            <div className="space-y-4">
              {audit.audit_results.map((result, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-5 ${
                    result.savings > 0
                      ? "border-orange-700/50 bg-orange-900/10"
                      : "border-slate-700 bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-semibold text-white">
                        {TOOL_NAMES[result.tool] || result.tool}
                      </span>
                      <span className="text-slate-400 text-sm ml-2">
                        {result.plan} plan
                      </span>
                    </div>
                    {result.savings > 0 ? (
                      <span className="bg-orange-500/20 text-orange-400 text-sm font-medium px-3 py-1 rounded-full">
                        Save ${result.savings.toFixed(0)}/mo
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full">
                        ✓ Optimal
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Current</div>
                      <div className="text-white font-medium">
                        ${result.currentSpend}/mo
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">→ Recommended</div>
                      <div className="text-emerald-400 font-medium">
                        ${result.estimatedCost.toFixed(0)}/mo
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Action</div>
                      <div className="text-white font-medium text-xs">
                        {result.recommendedAction}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {result.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <div className="bg-gradient-to-r from-emerald-900/60 to-slate-800 border border-emerald-600 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-lg font-bold mb-1">
                  You could save even more with Credex
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Credex sources discounted AI credits from companies that
                  overforecast — Cursor, Claude, ChatGPT Enterprise and more, at
                  real discounts. For teams saving $500+/mo, the additional
                  savings through credits can be substantial.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors inline-block"
                >
                  Book a Credex consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Lead capture */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
          {leadSubmitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📬</div>
              <h3 className="text-lg font-bold mb-1">Report sent!</h3>
              <p className="text-slate-400 text-sm">
                Check your inbox for the full audit report.
                {isHighSavings && " A Credex advisor will reach out shortly."}
              </p>
            </div>
          ) : showLeadForm ? (
            <div>
              <h3 className="font-bold mb-4">
                {isOptimal
                  ? "Get notified when new optimizations apply to your stack"
                  : "Email me this report"}
              </h3>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="your@email.com *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Company name (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Your role (optional)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                {/* Honeypot - hidden from real users */}
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
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {submittingLead ? "Sending..." : "Send me the report →"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">
                  {isOptimal
                    ? "Stay updated on AI pricing changes"
                    : "Get this report in your inbox"}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isOptimal
                    ? "We'll notify you when a better deal applies to your stack."
                    : "Full breakdown + action steps sent to your email."}
                </p>
              </div>
              <button
                onClick={() => setShowLeadForm(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors ml-4 whitespace-nowrap"
              >
                {isOptimal ? "Notify me" : "Email report"}
              </button>
            </div>
          )}
        </div>

        {/* Share */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-3">
            Share this report with your team
          </p>
          <button
            onClick={copyLink}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {copied ? "✓ Link copied!" : "Copy shareable link"}
          </button>
        </div>
      </div>
    </main>
  );
}
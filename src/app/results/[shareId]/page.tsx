"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { exportAuditPDF } from "@/lib/pdfExport";

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

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-4 h-4"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-4 h-4"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [exportingPdf, setExportingPdf] = useState(false);
  const confettiFired = useRef(false);

  const dark = theme === "dark";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  }

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

  useEffect(() => {
    if (audit && audit.total_monthly_savings > 200 && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.4 },
          colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff", "#fbbf24"],
        });
      }, 600);
    }
  }, [audit]);

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
          auditData: audit,
        }),
      });
      setLeadSubmitted(true);
    } catch {
      alert("Something went wrong.");
    } finally {
      setSubmittingLead(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExportPDF() {
    if (!audit) return;
    setExportingPdf(true);
    try {
      await exportAuditPDF(audit);
    } catch (e) {
      console.error(e);
      alert("PDF export failed.");
    } finally {
      setExportingPdf(false);
    }
  }

  function getCostForecast(monthlySpend: number) {
    return [3, 6, 12].map((m) => ({
      months: m,
      spend: Math.round(monthlySpend * Math.pow(1.05, m)),
    }));
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen ${dark ? "bg-[#0f1117]" : "bg-[#f4f6f9]"} flex items-center justify-center`}
      >
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
          <p
            className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            Loading your audit...
          </p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div
        className={`min-h-screen ${dark ? "bg-[#0f1117] text-white" : "bg-[#f4f6f9] text-[#0f1117]"} flex items-center justify-center px-4`}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-xl font-bold mb-2">Audit not found</div>
          <p
            className={`text-sm mb-5 ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            This link may have expired.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold"
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
  const totalCurrentSpend =
    audit.audit_results?.reduce((s, r) => s + r.currentSpend, 0) || 0;
  const forecast = getCostForecast(totalCurrentSpend);

  // Theme
  const bg = dark ? "bg-[#0f1117]" : "bg-[#f0f2f5]";
  const text = dark ? "text-white" : "text-[#0f1117]";
  const textMuted = dark ? "text-slate-400" : "text-slate-500";
  const textFaint = dark ? "text-slate-500" : "text-slate-400";
  const headerBg = dark
    ? "bg-[#0f1117]/95 border-white/6"
    : "bg-white/95 border-black/6";
  const cardBg = dark
    ? "bg-[#1a1d27] border-white/6"
    : "bg-white border-black/6";
  const statBg = dark
    ? "bg-[#0f1117] border-white/5"
    : "bg-slate-50 border-black/5";
  const inputBg = dark
    ? "bg-[#0f1117] border-white/10 text-white placeholder-slate-600"
    : "bg-white border-black/10 text-[#0f1117] placeholder-slate-400";
  const iconBtn = dark
    ? "text-slate-400 hover:text-white hover:bg-white/8"
    : "text-slate-500 hover:text-slate-800 hover:bg-black/5";
  const divider = dark ? "border-white/6" : "border-black/6";

  return (
    <main
      className={`min-h-screen ${bg} ${text} transition-colors duration-300`}
    >
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          />
          <div
            className={`relative w-full sm:max-w-md mx-4 sm:mx-auto ${dark ? "bg-[#1a1d27] border-white/10" : "bg-white border-black/10"} border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl`}
          >
            {leadSubmitted ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">📬</div>
                <h3 className="text-xl font-bold mb-2">Report sent!</h3>
                <p className={`text-sm ${textMuted} mb-5`}>
                  Check your inbox.
                  {isHighSavings && " A Credex advisor will reach out shortly."}
                </p>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setLeadSubmitted(false);
                  }}
                  className="bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-lg">Get your report</h3>
                    <p className={`text-xs ${textMuted}`}>
                      We'll email you the full breakdown
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className={`p-2 rounded-xl ${iconBtn}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-5 h-5"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${inputBg} border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all`}
                  />
                  <input
                    type="text"
                    placeholder="Company (optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={`w-full ${inputBg} border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all`}
                  />
                  <input
                    type="text"
                    placeholder="Your role (optional)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full ${inputBg} border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all`}
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
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
                  >
                    {submittingLead ? "Sending..." : "Send my report →"}
                  </button>
                  <p className={`text-center text-xs ${textFaint}`}>
                    No spam. One email only.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={`${headerBg} backdrop-blur-xl sticky top-0 z-20 border-b`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-emerald-400 text-lg">⚡</span>
              <span className="font-bold">SpendLens</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* PDF - desktop only */}
              <button
                onClick={handleExportPDF}
                disabled={exportingPdf}
                className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${dark ? "border-white/10 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400" : "border-black/10 text-slate-600 hover:border-emerald-500/60"}`}
              >
                {exportingPdf ? (
                  <svg
                    className="animate-spin h-3 w-3"
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
                ) : (
                  <span>📄</span>
                )}
                {exportingPdf ? "Exporting..." : "PDF"}
              </button>

              {/* Email report */}
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all"
              >
                <span>📧</span>
                <span className="hidden sm:inline">Email Report</span>
                <span className="sm:hidden">Email</span>
              </button>

              {/* Share */}
              <button
                onClick={copyLink}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${dark ? "border-white/10 text-slate-300 hover:border-white/20" : "border-black/10 text-slate-600"}`}
              >
                {copied ? "✓" : "🔗"}
                <span className="hidden sm:inline">
                  {copied ? "Copied!" : "Share"}
                </span>
              </button>

              {/* New audit */}
              <button
                onClick={() => router.push("/")}
                className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all ${dark ? "border-white/10 text-slate-400 hover:text-white hover:border-white/20" : "border-black/10 text-slate-500 hover:text-slate-800"}`}
              >
                + New
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${iconBtn}`}
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero */}
            <div
              className={`rounded-2xl overflow-hidden border ${
                isOptimal
                  ? dark
                    ? "border-emerald-700/30 bg-emerald-900/15"
                    : "border-emerald-200 bg-emerald-50"
                  : dark
                    ? "border-emerald-600/20 bg-gradient-to-br from-[#0d2e1f] to-[#1a1d27]"
                    : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
              }`}
            >
              {isOptimal ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="text-5xl mb-3">✅</div>
                  <h1 className="text-2xl font-bold mb-1">
                    You're spending well
                  </h1>
                  <p className={`text-sm ${textMuted}`}>
                    Your AI stack is optimized for your team size and use case.
                  </p>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <p
                    className={`text-xs uppercase tracking-widest font-semibold mb-2 ${dark ? "text-emerald-400/70" : "text-emerald-600/70"}`}
                  >
                    Savings identified
                  </p>
                  {/* Big number */}
                  <div className="flex items-end gap-3 mb-1">
                    <span className="text-5xl sm:text-6xl font-black text-emerald-400 leading-none">
                      ${audit.total_monthly_savings.toFixed(0)}
                    </span>
                    <span className={`text-lg font-semibold mb-1 ${textMuted}`}>
                      /mo
                    </span>
                  </div>
                  <p
                    className={`text-base font-semibold mb-3 ${dark ? "text-emerald-300" : "text-emerald-700"}`}
                  >
                    ${audit.total_annual_savings.toFixed(0)} saved per year
                  </p>
                  {/* Mini stats row */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${dark ? "bg-white/8 text-slate-300" : "bg-black/5 text-slate-600"}`}
                    >
                      👥 {audit.team_size} person team
                    </span>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${dark ? "bg-white/8 text-slate-300" : "bg-black/5 text-slate-600"}`}
                    >
                      🎯 {audit.use_case} use case
                    </span>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${dark ? "bg-white/8 text-slate-300" : "bg-black/5 text-slate-600"}`}
                    >
                      🔧 {audit.audit_results?.length || 0} tools audited
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {audit.summary && (
              <div className={`${cardBg} border rounded-2xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${dark ? "bg-emerald-500/15" : "bg-emerald-100"}`}
                  >
                    ✦
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider text-emerald-400`}
                  >
                    AI Summary
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${textMuted}`}>
                  {audit.summary}
                </p>
              </div>
            )}

            {/* Tool cards */}
            {hasResults && (
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${textFaint} mb-3`}
                >
                  Tool breakdown
                </p>
                <div className="space-y-3">
                  {audit.audit_results.map((result, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border overflow-hidden ${
                        result.savings > 0
                          ? dark
                            ? "border-orange-700/25 bg-[#1f1510]"
                            : "border-orange-200 bg-orange-50/50"
                          : dark
                            ? `border-white/6 ${cardBg.split(" ")[0]}`
                            : "border-black/6 bg-white"
                      }`}
                    >
                      {/* Tool header */}
                      <div className="flex items-center justify-between px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${dark ? "bg-white/6" : "bg-black/5"}`}
                          >
                            {TOOL_EMOJI[result.tool] || "🔧"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {TOOL_NAMES[result.tool] || result.tool}
                            </p>
                            <p className={`text-xs ${textFaint}`}>
                              {result.plan} plan
                            </p>
                          </div>
                        </div>
                        {result.savings > 0 ? (
                          <div
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${dark ? "bg-orange-500/15 text-orange-400" : "bg-orange-100 text-orange-600"}`}
                          >
                            −${result.savings.toFixed(0)}/mo
                          </div>
                        ) : (
                          <div
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}
                          >
                            ✓ Optimal
                          </div>
                        )}
                      </div>

                      {/* Spend bar */}
                      <div
                        className={`mx-4 mb-3 p-3 rounded-xl ${dark ? "bg-white/4" : "bg-black/3"}`}
                      >
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={textFaint}>
                            Current:{" "}
                            <span
                              className={`font-semibold ${dark ? "text-white" : "text-slate-900"}`}
                            >
                              ${result.currentSpend}/mo
                            </span>
                          </span>
                          <span className={textFaint}>
                            Target:{" "}
                            <span
                              className={`font-semibold ${dark ? "text-emerald-400" : "text-emerald-600"}`}
                            >
                              ${result.estimatedCost.toFixed(0)}/mo
                            </span>
                          </span>
                        </div>
                        <div
                          className={`h-1.5 rounded-full ${dark ? "bg-white/10" : "bg-black/10"}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all ${result.savings > 0 ? "bg-orange-500" : "bg-emerald-500"}`}
                            style={{
                              width: `${Math.min(100, (result.currentSpend / maxSpend) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Action + reason */}
                      <div className="px-4 pb-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mb-2 ${dark ? "bg-white/6 text-white" : "bg-black/5 text-slate-900"}`}
                        >
                          <span>→</span> {result.recommendedAction}
                        </div>
                        <p className={`text-xs leading-relaxed ${textMuted}`}>
                          {result.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credex CTA */}
            {isHighSavings && (
              <div
                className={`rounded-2xl p-5 border ${dark ? "bg-gradient-to-br from-[#0d2e1f] to-[#1a1d27] border-emerald-700/30" : "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"}`}
              >
                <div className="flex gap-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="font-bold mb-1">
                      Save even more with Credex
                    </h3>
                    <p className={`text-sm mb-3 leading-relaxed ${textMuted}`}>
                      Credex sources discounted AI credits — Cursor, Claude,
                      ChatGPT Enterprise at real discounts.
                    </p>
                    <a
                      href="https://credex.rocks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Book a free consultation →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile PDF + share */}
            <div className="flex gap-2 sm:hidden">
              <button
                onClick={handleExportPDF}
                disabled={exportingPdf}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all ${dark ? "border-white/10 text-slate-300" : "border-black/10 text-slate-600"}`}
              >
                📄 {exportingPdf ? "Exporting..." : "Export PDF"}
              </button>
              <button
                onClick={copyLink}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all ${dark ? "border-white/10 text-slate-300" : "border-black/10 text-slate-600"}`}
              >
                {copied ? "✓ Copied!" : "🔗 Copy Link"}
              </button>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Stats card */}
            <div className={`${cardBg} border rounded-2xl p-5`}>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${textFaint} mb-4`}
              >
                Audit summary
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Monthly savings",
                    value: `$${audit.total_monthly_savings.toFixed(0)}`,
                    highlight: true,
                  },
                  {
                    label: "Annual savings",
                    value: `$${audit.total_annual_savings.toFixed(0)}`,
                    highlight: true,
                  },
                  {
                    label: "Tools audited",
                    value: `${audit.audit_results?.length || 0}`,
                  },
                  { label: "Team size", value: `${audit.team_size} people` },
                  { label: "Use case", value: audit.use_case },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${statBg} border rounded-xl px-4 py-3 flex justify-between items-center`}
                  >
                    <span className={`text-xs ${textMuted}`}>{stat.label}</span>
                    <span
                      className={`text-sm font-bold ${stat.highlight ? "text-emerald-400" : ""}`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost forecast */}
            <div className={`${cardBg} border rounded-2xl p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">📅</span>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${textFaint}`}
                >
                  Cost forecast
                </p>
              </div>
              <p className={`text-xs ${textMuted} mb-3`}>
                At 5% monthly team growth:
              </p>
              <div className="space-y-2">
                {forecast.map((f) => (
                  <div
                    key={f.months}
                    className={`${statBg} border rounded-xl px-4 py-3 flex justify-between items-center`}
                  >
                    <span className={`text-xs ${textMuted}`}>
                      In {f.months} months
                    </span>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${f.months === 12 && f.spend > 1000 ? "text-orange-400" : ""}`}
                      >
                        ${f.spend}/mo
                      </p>
                      <p className={`text-xs ${textFaint}`}>
                        ${(f.spend * 12).toLocaleString()}/yr
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {forecast[2].spend > 1000 && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${dark ? "bg-orange-900/20 border border-orange-700/30 text-orange-300" : "bg-orange-50 border border-orange-200 text-orange-700"}`}
                >
                  ⚠️ You'll exceed $1,000/mo within a year. Consider optimizing
                  now.
                </div>
              )}
            </div>

            {/* Desktop PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className={`hidden sm:flex w-full items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all ${dark ? "border-white/10 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 bg-[#1a1d27]" : "border-black/10 text-slate-600 hover:border-emerald-500/60 bg-white"}`}
            >
              {exportingPdf ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  </svg>{" "}
                  Generating...
                </>
              ) : (
                <>📄 Export PDF Report</>
              )}
            </button>

            {/* Desktop share */}
            <button
              onClick={copyLink}
              className={`hidden sm:flex w-full items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all ${dark ? "border-white/10 text-slate-300 hover:border-white/20 bg-[#1a1d27]" : "border-black/10 text-slate-600 bg-white"}`}
            >
              {copied ? "✓ Link copied!" : "🔗 Copy shareable link"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

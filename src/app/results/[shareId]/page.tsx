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

  const [showLeadForm, setShowLeadForm] = useState(false);

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
    const savedTheme = localStorage.getItem("theme") as
      | "dark"
      | "light";

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

  // Confetti
  useEffect(() => {
    if (
      audit &&
      audit.total_monthly_savings > 200 &&
      !confettiFired.current
    ) {
      confettiFired.current = true;

      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.4 },
          colors: [
            "#10b981",
            "#34d399",
            "#6ee7b7",
            "#ffffff",
            "#fbbf24",
          ],
        });
      }, 600);
    }
  }, [audit]);

  // UPDATED submitLead
  async function submitLead() {
    if (!email || !audit) return;

    setSubmittingLead(true);

    try {
      await fetch("/api/lead", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          auditId: audit.id,
          email,
          companyName: company,
          role,
          teamSize: audit.team_size,

          // FULL AUDIT OBJECT
          auditData: audit,
        }),
      });

      setLeadSubmitted(true);

    } catch (error) {
      console.error("Lead submit error:", error);
      alert("Something went wrong.");
    } finally {
      setSubmittingLead(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function exportPDF() {
    if (!audit) return;

    setExportingPdf(true);

    try {
      await exportAuditPDF(audit);
    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF export failed. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  }

  function getCostForecast(monthlySpend: number) {
    const months = [3, 6, 12];
    const growthRate = 0.05;

    return months.map((m) => ({
      months: m,
      spend: Math.round(
        monthlySpend * Math.pow(1 + growthRate, m)
      ),
    }));
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          dark ? "bg-[#0f1117]" : "bg-[#f4f6f9]"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <p
            className={`text-sm ${
              dark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
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
        className={`min-h-screen ${
          dark
            ? "bg-[#0f1117] text-white"
            : "bg-[#f4f6f9] text-[#0f1117]"
        } flex items-center justify-center`}
      >
        Audit not found
      </div>
    );
  }

  const forecast = getCostForecast(
    audit.audit_results?.reduce(
      (s, r) => s + r.currentSpend,
      0
    ) || 0
  );

  return (
    <main
      className={`min-h-screen ${
        dark
          ? "bg-[#0f1117] text-white"
          : "bg-[#f4f6f9] text-black"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-xl ${
          dark
            ? "bg-[#0f1117]/90 border-white/5"
            : "bg-white/90 border-black/5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <span className="text-emerald-400 text-xl">
                ⚡
              </span>

              <span className="font-bold text-lg">
                SpendLens
              </span>
            </button>

            {/* UPDATED HEADER BUTTONS */}
            <div className="flex items-center gap-2">

              <button
                onClick={exportPDF}
                disabled={exportingPdf}
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {exportingPdf
                  ? "Exporting..."
                  : "📄 Export PDF"}
              </button>

              <button
                onClick={() => setShowLeadForm(true)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  dark
                    ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-emerald-500/60 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                📧 Email Report
              </button>

              <button
                onClick={copyLink}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                  dark
                    ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                    : "border-slate-300 hover:bg-slate-100 text-slate-700"
                }`}
              >
                {copied
                  ? "✓ Copied!"
                  : "🔗 Share"}
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg"
              >
                {dark ? (
                  <SunIcon />
                ) : (
                  <MoonIcon />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero */}
            <div
              className={`rounded-2xl border p-8 text-center ${
                dark
                  ? "bg-gradient-to-br from-emerald-900/40 to-[#1a1d27] border-emerald-600/30"
                  : "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"
              }`}
            >
              <div className="text-xs uppercase tracking-widest mb-2 text-slate-400">
                Potential savings identified
              </div>

              <div className="text-6xl font-black text-emerald-500 mb-1">
                $
                {audit.total_monthly_savings.toFixed(0)}
                <span className="text-2xl font-bold text-emerald-400">
                  /mo
                </span>
              </div>

              <div className="text-xl font-bold mb-1">
                $
                {audit.total_annual_savings.toFixed(0)}
                <span className="text-sm font-normal text-slate-400">
                  {" "}
                  per year
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Team of {audit.team_size} ·{" "}
                {audit.use_case}
              </p>
            </div>

            {/* Summary */}
            {audit.summary && (
              <div
                className={`border rounded-2xl p-5 ${
                  dark
                    ? "bg-[#1a1d27] border-white/8"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-400">
                    ✦
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    AI-Generated Summary
                  </span>
                </div>

                <p
                  className={`text-sm leading-relaxed ${
                    dark
                      ? "text-slate-400"
                      : "text-slate-700"
                  }`}
                >
                  {audit.summary}
                </p>
              </div>
            )}

            {/* Tool Breakdown */}
            {audit.audit_results.map(
              (result, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 ${
                    dark
                      ? "border-white/6 bg-[#1a1d27]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {TOOL_EMOJI[
                          result.tool
                        ] || "🔧"}
                      </span>

                      <div>
                        <div className="font-semibold text-sm">
                          {TOOL_NAMES[
                            result.tool
                          ] || result.tool}
                        </div>

                        <div className="text-xs text-slate-500">
                          {result.plan} plan
                        </div>
                      </div>
                    </div>

                    {result.savings > 0 ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400">
                        Save $
                        {result.savings.toFixed(0)}
                        /mo
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                        ✓ Optimal
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-xs px-3 py-2 rounded-lg mb-2 ${
                      dark
                        ? "bg-white/5"
                        : "bg-slate-100"
                    }`}
                  >
                    <span className="text-slate-500">
                      Action:{" "}
                    </span>

                    <span className="font-semibold">
                      {
                        result.recommendedAction
                      }
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      dark
                        ? "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    {result.reason}
                  </p>
                </div>
              )
            )}

            {/* LEAD CAPTURE */}
            <div
              className={`border rounded-2xl p-5 ${
                dark
                  ? "bg-[#1a1d27] border-white/8"
                  : "bg-white border-slate-200"
              }`}
            >
              {leadSubmitted ? (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">
                    📬
                  </div>

                  <h3 className="font-bold text-sm mb-1">
                    Report sent!
                  </h3>

                  <p className="text-xs text-slate-400">
                    Check your inbox.
                  </p>
                </div>
              ) : showLeadForm ? (
                <div>
                  <h3 className="font-bold text-sm mb-3">
                    Email me this report
                  </h3>

                  <div className="space-y-2">

                    <input
                      type="email"
                      placeholder="your@email.com *"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm ${
                        dark
                          ? "bg-[#0f1117] border-white/10 text-white"
                          : "bg-white border-slate-200 text-black"
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Company"
                      value={company}
                      onChange={(e) =>
                        setCompany(e.target.value)
                      }
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm ${
                        dark
                          ? "bg-[#0f1117] border-white/10 text-white"
                          : "bg-white border-slate-200 text-black"
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Role"
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value)
                      }
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm ${
                        dark
                          ? "bg-[#0f1117] border-white/10 text-white"
                          : "bg-white border-slate-200 text-black"
                      }`}
                    />

                    <button
                      onClick={submitLead}
                      disabled={
                        !email ||
                        submittingLead
                      }
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm"
                    >
                      {submittingLead
                        ? "Sending..."
                        : "Send report →"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">
                      Get this report by email
                    </h3>

                    <p className="text-xs text-slate-400">
                      Full breakdown + action
                      steps.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowLeadForm(true)
                    }
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-xl text-xs"
                  >
                    Email report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Audit Summary */}
            <div
              className={`border rounded-2xl p-5 ${
                dark
                  ? "bg-[#1a1d27] border-white/8"
                  : "bg-white border-slate-200"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-slate-500">
                Audit summary
              </p>

              <div className="space-y-3">

                <div
                  className={`border rounded-xl p-3 flex justify-between ${
                    dark
                      ? "bg-[#0f1117] border-white/6"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-xs text-slate-400">
                    Monthly savings
                  </span>

                  <span className="font-bold text-emerald-500">
                    $
                    {audit.total_monthly_savings.toFixed(
                      0
                    )}
                  </span>
                </div>

                <div
                  className={`border rounded-xl p-3 flex justify-between ${
                    dark
                      ? "bg-[#0f1117] border-white/6"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-xs text-slate-400">
                    Annual savings
                  </span>

                  <span className="font-bold text-emerald-500">
                    $
                    {audit.total_annual_savings.toFixed(
                      0
                    )}
                  </span>
                </div>

                <div
                  className={`border rounded-xl p-3 flex justify-between ${
                    dark
                      ? "bg-[#0f1117] border-white/6"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-xs text-slate-400">
                    Tools audited
                  </span>

                  <span className="font-bold">
                    {
                      audit.audit_results
                        ?.length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div
              className={`border rounded-2xl p-5 ${
                dark
                  ? "bg-[#1a1d27] border-white/8"
                  : "bg-white border-slate-200"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-slate-500">
                Cost forecast
              </p>

              <div className="space-y-2">
                {forecast.map((f) => (
                  <div
                    key={f.months}
                    className={`border rounded-xl p-3 flex justify-between ${
                      dark
                        ? "bg-[#0f1117] border-white/6"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-xs text-slate-400">
                      In {f.months} months
                    </span>

                    <div className="text-right">
                      <span className="font-bold text-sm">
                        ${f.spend}/mo
                      </span>

                      <span className="text-xs block text-slate-500">
                        $
                        {(
                          f.spend * 12
                        ).toLocaleString()}
                        /yr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
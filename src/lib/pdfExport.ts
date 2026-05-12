import jsPDF from "jspdf";

interface AuditResult {
  tool: string;
  plan: string;
  currentSpend: number;
  recommendedAction: string;
  estimatedCost: number;
  savings: number;
  reason: string;
}

interface AuditData {
  id: string;
  share_id: string;
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

export async function exportAuditPDF(audit: AuditData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const MARGIN = 16;
  const CONTENT_W = W - MARGIN * 2;

  // Colors
  const BLACK: [number, number, number] = [15, 17, 23];
  const EMERALD: [number, number, number] = [16, 185, 129];
  const WHITE: [number, number, number] = [255, 255, 255];
  const GRAY: [number, number, number] = [100, 116, 139];
  const LIGHT_GRAY: [number, number, number] = [241, 245, 249];
  const ORANGE: [number, number, number] = [234, 88, 12];
  const ORANGE_BG: [number, number, number] = [255, 247, 237];
  const GREEN_BG: [number, number, number] = [240, 253, 244];

  let y = 0;

  // ── Header ──
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, W, 48, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SpendLens", MARGIN, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("AI Spend Audit Report", MARGIN, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, MARGIN, 33);
  doc.text(`Team size: ${audit.team_size}  |  Use case: ${audit.use_case}  |  Report ID: ${audit.share_id}`, MARGIN, 40);

  y = 58;

  // ── Savings hero ──
  if (audit.total_monthly_savings > 0) {
    doc.setFillColor(...EMERALD);
    doc.roundedRect(MARGIN, y, CONTENT_W, 28, 4, 4, "F");

    doc.setTextColor(...WHITE);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Potential savings: $${audit.total_monthly_savings.toFixed(0)}/mo  |  $${audit.total_annual_savings.toFixed(0)}/yr`,
      MARGIN + 6, y + 10
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Act on these recommendations to capture this savings opportunity.", MARGIN + 6, y + 19);

    y += 36;
  } else {
    doc.setFillColor(...GREEN_BG);
    doc.roundedRect(MARGIN, y, CONTENT_W, 20, 4, 4, "F");
    doc.setTextColor(...[22, 163, 74] as [number, number, number]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("You are spending well — your AI stack is optimized.", MARGIN + 6, y + 12);
    y += 28;
  }

  // ── AI Summary ──
  if (audit.summary) {
    doc.setTextColor(...BLACK);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AI-Generated Summary", MARGIN, y);
    y += 2;

    doc.setDrawColor(...EMERALD);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y + 1, MARGIN + 40, y + 1);
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    const summaryLines = doc.splitTextToSize(audit.summary, CONTENT_W);
    doc.text(summaryLines, MARGIN, y);
    y += summaryLines.length * 4.5 + 10;
  }

  // ── Tool breakdown ──
  doc.setTextColor(...BLACK);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Tool-by-Tool Breakdown", MARGIN, y);
  y += 2;
  doc.setDrawColor(...EMERALD);
  doc.line(MARGIN, y + 1, MARGIN + 44, y + 1);
  y += 8;

  if (audit.audit_results) {
    for (const result of audit.audit_results) {
      const cardH = 32;
      if (y + cardH > 275) {
        doc.addPage();
        y = 16;
      }

      // Card bg
      const bg = result.savings > 0 ? ORANGE_BG : GREEN_BG;
      doc.setFillColor(...bg);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 3, 3, "F");

      // Left accent bar
      const accentColor = result.savings > 0 ? ORANGE : EMERALD;
      doc.setFillColor(...accentColor);
      doc.roundedRect(MARGIN, y, 3, cardH, 1.5, 1.5, "F");

      // Tool name
      doc.setTextColor(...BLACK);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const toolName = `${TOOL_NAMES[result.tool] || result.tool}  (${result.plan})`;
      doc.text(toolName, MARGIN + 7, y + 8);

      // Badge
      if (result.savings > 0) {
        doc.setFillColor(...ORANGE);
        doc.roundedRect(W - MARGIN - 28, y + 3, 28, 8, 2, 2, "F");
        doc.setTextColor(...WHITE);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(`Save $${result.savings.toFixed(0)}/mo`, W - MARGIN - 26, y + 8.5);
      } else {
        doc.setFillColor(...EMERALD);
        doc.roundedRect(W - MARGIN - 20, y + 3, 20, 8, 2, 2, "F");
        doc.setTextColor(...WHITE);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("Optimal", W - MARGIN - 18, y + 8.5);
      }

      // Spend row
      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Current: $${result.currentSpend}/mo   Recommended: $${result.estimatedCost.toFixed(0)}/mo   Action: ${result.recommendedAction}`,
        MARGIN + 7, y + 16
      );

      // Reason
      const reasonLines = doc.splitTextToSize(result.reason, CONTENT_W - 14);
      doc.text(reasonLines.slice(0, 2), MARGIN + 7, y + 22);

      y += cardH + 4;
    }
  }

  // ── Footer ──
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...BLACK);
    doc.rect(0, 285, W, 12, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `SpendLens AI Spend Audit  |  ai-spend-audit-lovat.vercel.app  |  Powered by Credex  |  Page ${i} of ${pageCount}`,
      W / 2, 292, { align: "center" }
    );
  }

  doc.save(`spendlens-audit-${audit.share_id}.pdf`);
}
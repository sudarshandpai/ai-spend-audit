import { NextRequest, NextResponse } from "next/server";
import { runAudit, ToolInput, UseCase } from "@/lib/auditEngine";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateSummary(
  auditResults: ReturnType<typeof runAudit>,
  useCase: string,
  teamSize: number
): Promise<string> {
  try {
    const toolSummary = auditResults.results
      .map(
        (r) =>
          `${r.tool}: currently $${r.currentSpend}/mo, recommendation: ${r.recommendedAction}, saves $${r.savings}/mo`
      )
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are an AI spend consultant. Write a concise 80-100 word personalized audit summary for a team of ${teamSize} people whose primary use case is ${useCase}.

Their tool breakdown:
${toolSummary}

Total monthly savings opportunity: $${auditResults.totalMonthlySavings}

Write in second person ("You are..."). Be specific, honest, and actionable. If savings are low, acknowledge they're spending well. Do not use bullet points. Plain paragraph only.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") return content.text;
    return fallbackSummary(auditResults, teamSize);
  } catch (e) {
    return fallbackSummary(auditResults, teamSize);
  }
}

function fallbackSummary(
  audit: ReturnType<typeof runAudit>,
  teamSize: number
): string {
  if (audit.isOptimal) {
    return `Your team of ${teamSize} is spending efficiently on AI tools. Your current stack is well-matched to your usage patterns, and you're not paying for unnecessary seats or over-specced plans. Keep monitoring as your team grows — the right time to reassess is when you add 3+ people or change your primary use case.`;
  }
  return `Your team of ${teamSize} has a $${audit.totalMonthlySavings.toFixed(0)}/month savings opportunity — that's $${audit.totalAnnualSavings.toFixed(0)} annually. The biggest wins come from right-sizing plans to your actual team size and switching tools where cheaper alternatives offer equivalent capability for your use case. Acting on these recommendations requires less than an hour of admin work.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tools, teamSize, useCase } = body as {
      tools: ToolInput[];
      teamSize: number;
      useCase: UseCase;
    };

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return NextResponse.json({ error: "No tools provided" }, { status: 400 });
    }

    // Run the audit engine
    const auditResults = runAudit(tools, useCase, teamSize);

    // Generate AI summary
    const summary = await generateSummary(auditResults, useCase, teamSize);

    // Save to Supabase
    const { data, error } = await supabase
      .from("audits")
      .insert({
        tools: tools,
        team_size: teamSize,
        use_case: useCase,
        total_monthly_savings: auditResults.totalMonthlySavings,
        total_annual_savings: auditResults.totalAnnualSavings,
        summary: summary,
        audit_results: auditResults.results,
      })
      .select("share_id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save audit" }, { status: 500 });
    }

    return NextResponse.json({
      shareId: data.share_id,
      auditResults,
      summary,
    });
  } catch (e) {
    console.error("Audit error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
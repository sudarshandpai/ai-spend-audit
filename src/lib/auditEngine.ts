// src/lib/auditEngine.ts

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolInput {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditResult {
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

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isOptimal: boolean;
}

// PRICING DATA — sourced from official pages, verified May 2026
// Full citations in PRICING_DATA.md
const PRICING: Record<string, Record<string, number>> = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: 100,
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 30,
    enterprise: 60,
    api: 0, // variable
  },
  chatgpt: {
    plus: 20,
    team: 30,
    enterprise: 60,
    api: 0, // variable
  },
  anthropic_api: {
    payasyougo: 0, // variable, user inputs actual spend
  },
  openai_api: {
    payasyougo: 0, // variable
  },
  gemini: {
    pro: 20,
    ultra: 300,
    api: 0,
  },
  windsurf: {
    free: 0,
    pro: 15,
    teams: 35,
  },
};

function getAlternatives(
  tool: string,
  useCase: UseCase,
  seats: number
): { tool: string; plan: string; cost: number; reason: string } | null {
  if (tool === "cursor" && useCase === "coding") {
    const windsurfCost = PRICING.windsurf.pro * seats;
    return {
      tool: "Windsurf",
      plan: "Pro",
      cost: windsurfCost,
      reason:
        "Windsurf Pro offers similar AI coding assistance at $15/seat vs Cursor Pro's $20/seat",
    };
  }
  if (tool === "github_copilot" && useCase === "coding") {
    const cursorCost = PRICING.cursor.pro * seats;
    return {
      tool: "Cursor",
      plan: "Pro",
      cost: cursorCost,
      reason:
        "Cursor Pro provides a more integrated IDE experience with comparable coding AI at similar price",
    };
  }
  if (tool === "chatgpt" && (useCase === "writing" || useCase === "research")) {
    const claudeCost = PRICING.claude.pro * seats;
    return {
      tool: "Claude",
      plan: "Pro",
      cost: claudeCost,
      reason:
        "Claude Pro is comparably priced and excels at long-form writing and research tasks",
    };
  }
  if (tool === "gemini" && useCase !== "coding") {
    const claudeCost = PRICING.claude.pro * seats;
    return {
      tool: "Claude",
      plan: "Pro",
      cost: claudeCost,
      reason:
        "Claude Pro offers stronger reasoning for writing/research at $20/seat vs Gemini Pro's $20/seat — same price, better fit",
    };
  }
  return null;
}

function evaluateTool(input: ToolInput, useCase: UseCase): AuditResult {
  const { tool, plan, monthlySpend, seats } = input;
  const pricing = PRICING[tool];

  // If we don't have pricing for this tool, return as-is
  if (!pricing) {
    return {
      tool,
      plan,
      currentSpend: monthlySpend,
      recommendedAction: "Verify pricing",
      estimatedCost: monthlySpend,
      savings: 0,
      reason: "Unable to verify pricing for this tool. Check vendor site.",
    };
  }

  const officialPlanCost = pricing[plan.toLowerCase()] ?? monthlySpend / seats;
  const officialTotalCost = officialPlanCost * seats;

  // Check 1: Are they overpaying vs official pricing?
  if (monthlySpend > officialTotalCost * 1.1) {
    return {
      tool,
      plan,
      currentSpend: monthlySpend,
      recommendedAction: "Audit your bill",
      estimatedCost: officialTotalCost,
      savings: monthlySpend - officialTotalCost,
      reason: `You're paying $${monthlySpend}/mo but official pricing for ${seats} seat(s) on ${plan} is $${officialTotalCost}/mo. Check for unused seats or billing errors.`,
    };
  }

  // Check 2: Team plan for very few users — overkill?
  if (
    (plan.toLowerCase() === "team" || plan.toLowerCase() === "business") &&
    seats <= 2
  ) {
    const individualPlanKey = Object.keys(pricing).find(
      (k) => k === "individual" || k === "pro" || k === "plus"
    );
    if (individualPlanKey) {
      const individualCost = pricing[individualPlanKey] * seats;
      if (individualCost < officialTotalCost) {
        return {
          tool,
          plan,
          currentSpend: monthlySpend,
          recommendedAction: `Downgrade to ${individualPlanKey}`,
          recommendedPlan: individualPlanKey,
          estimatedCost: individualCost,
          savings: officialTotalCost - individualCost,
          reason: `${plan} plan for ${seats} user(s) is overkill. ${individualPlanKey} plan saves $${(officialTotalCost - individualCost).toFixed(0)}/mo with no meaningful feature loss at this team size.`,
        };
      }
    }
  }

  // Check 3: Enterprise for small team?
  if (plan.toLowerCase() === "enterprise" && seats < 10) {
    const teamKey = Object.keys(pricing).find(
      (k) => k === "team" || k === "business"
    );
    if (teamKey && pricing[teamKey]) {
      const teamCost = pricing[teamKey] * seats;
      if (teamCost < officialTotalCost) {
        return {
          tool,
          plan,
          currentSpend: monthlySpend,
          recommendedAction: `Downgrade to ${teamKey} plan`,
          recommendedPlan: teamKey,
          estimatedCost: teamCost,
          savings: officialTotalCost - teamCost,
          reason: `Enterprise plan for ${seats} seats is unnecessary. ${teamKey} plan covers all core needs for teams under 10 and saves $${(officialTotalCost - teamCost).toFixed(0)}/mo.`,
        };
      }
    }
  }

  // Check 4: Cheaper alternative tool?
  const alternative = getAlternatives(tool, useCase, seats);
  if (alternative && alternative.cost < officialTotalCost * 0.85) {
    return {
      tool,
      plan,
      currentSpend: monthlySpend,
      recommendedAction: `Switch to ${alternative.tool} ${alternative.plan}`,
      recommendedTool: alternative.tool,
      recommendedPlan: alternative.plan,
      estimatedCost: alternative.cost,
      savings: officialTotalCost - alternative.cost,
      reason: alternative.reason,
    };
  }

  // All good
  return {
    tool,
    plan,
    currentSpend: monthlySpend,
    recommendedAction: "No change needed",
    estimatedCost: officialTotalCost,
    savings: 0,
    reason: `You're on the right plan for your team size and use case. Spending is optimal.`,
  };
}

export function runAudit(
  tools: ToolInput[],
  useCase: UseCase,
  teamSize: number
): AuditSummary {
  const results = tools
    .filter((t) => t.monthlySpend > 0)
    .map((t) => evaluateTool(t, useCase));

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.savings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const isOptimal = totalMonthlySavings < 10;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal,
  };
}
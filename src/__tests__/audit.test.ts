import { runAudit, ToolInput } from "@/lib/auditEngine";

describe("runAudit", () => {
  test("returns optimal when spending matches official pricing", () => {
  const tools: ToolInput[] = [
    { tool: "claude", plan: "pro", monthlySpend: 20, seats: 1 },
  ];
  const result = runAudit(tools, "writing", 1);
  expect(result.isOptimal).toBe(true);
  expect(result.totalMonthlySavings).toBe(0);
});

  test("flags overpaying vs official pricing", () => {
    const tools: ToolInput[] = [
      { tool: "cursor", plan: "pro", monthlySpend: 80, seats: 1 },
    ];
    const result = runAudit(tools, "coding", 1);
    expect(result.results[0].recommendedAction).toBe("Audit your bill");
    expect(result.results[0].savings).toBeGreaterThan(0);
  });

  test("recommends downgrade from team plan for <= 2 seats", () => {
    const tools: ToolInput[] = [
      { tool: "claude", plan: "team", monthlySpend: 60, seats: 2 },
    ];
    const result = runAudit(tools, "writing", 2);
    expect(result.results[0].recommendedAction).toMatch(/downgrade/i);
    expect(result.results[0].savings).toBeGreaterThan(0);
  });

  test("suggests cheaper alternative tool when available", () => {
    const tools: ToolInput[] = [
      { tool: "cursor", plan: "pro", monthlySpend: 100, seats: 5 },
    ];
    const result = runAudit(tools, "coding", 5);
    expect(result.results[0].recommendedTool).toBe("Windsurf");
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  test("skips tools with zero monthly spend", () => {
    const tools: ToolInput[] = [
      { tool: "cursor", plan: "pro", monthlySpend: 0, seats: 1 },
      { tool: "claude", plan: "pro", monthlySpend: 20, seats: 1 },
    ];
    const result = runAudit(tools, "writing", 1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].tool).toBe("claude");
  });
});
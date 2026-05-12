import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, email, companyName, role, teamSize, auditData } = body;

    // Honeypot check
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    if (!email || !auditId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Save lead to Supabase
    const { error: dbError } = await supabase.from("leads").insert({
      audit_id: auditId,
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
    });

    if (dbError) {
      console.error("Lead insert error:", dbError);
    }

    // Fetch audit data if not provided
    let audit = auditData;
    if (!audit) {
      const { data } = await supabase
        .from("audits")
        .select("*")
        .eq("id", auditId)
        .single();
      audit = data;
    }

    const isHighSavings = audit?.total_monthly_savings > 500;
    const monthlySavings = audit?.total_monthly_savings?.toFixed(0) || "0";
    const annualSavings = audit?.total_annual_savings?.toFixed(0) || "0";

    // Build tool rows for email
    const toolRows = audit?.audit_results
      ?.map((r: { tool: string; plan: string; currentSpend: number; estimatedCost: number; savings: number; recommendedAction: string; reason: string }) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
            <strong style="color:#0f1117;">${r.tool.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</strong>
            <span style="color:#94a3b8;font-size:12px;"> · ${r.plan}</span>
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;">$${r.currentSpend}/mo</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#10b981;font-weight:600;">$${r.estimatedCost.toFixed(0)}/mo</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
            ${r.savings > 0
              ? `<span style="background:#fff7ed;color:#ea580c;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:600;">Save $${r.savings.toFixed(0)}/mo</span>`
              : `<span style="background:#f0fdf4;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:12px;">✓ Optimal</span>`
            }
          </td>
        </tr>
      `)
      .join("") || "";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SpendLens Audit Report</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f1117;border-radius:16px 16px 0 0;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">
                <span style="color:#10b981;">⚡</span> SpendLens
              </h1>
              <p style="margin:6px 0 0;color:#64748b;font-size:13px;">Your AI Spend Audit Report</p>
            </td>
          </tr>

          <!-- Savings hero -->
          <tr>
            <td style="background:#ffffff;padding:28px 32px 20px;">
              ${Number(monthlySavings) > 0 ? `
              <div style="background:linear-gradient(135deg,#064e3b,#065f46);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Savings identified</p>
                <h2 style="margin:0;color:#ffffff;font-size:36px;font-weight:900;">$${monthlySavings}<span style="font-size:18px;font-weight:400;">/mo</span></h2>
                <p style="margin:4px 0 0;color:#a7f3d0;font-size:15px;">$${annualSavings} per year</p>
              </div>
              ` : `
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                <p style="margin:0;color:#16a34a;font-size:16px;font-weight:700;">✅ You're spending well</p>
                <p style="margin:6px 0 0;color:#64748b;font-size:13px;">Your AI stack is optimized for your team.</p>
              </div>
              `}

              ${audit?.summary ? `
              <div style="background:#f8fafc;border-left:3px solid #10b981;border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;">
                <p style="margin:0 0 6px;color:#10b981;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">AI Summary</p>
                <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${audit.summary}</p>
              </div>
              ` : ""}
            </td>
          </tr>

          <!-- Tool breakdown -->
          ${toolRows ? `
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;">
              <h3 style="margin:0 0 16px;color:#0f1117;font-size:15px;font-weight:700;">Tool-by-Tool Breakdown</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1f5f9;border-radius:10px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Tool</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Current</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Target</th>
                  <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Status</th>
                </tr>
                ${toolRows}
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- Credex CTA for high savings -->
          ${isHighSavings ? `
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;">
              <div style="background:linear-gradient(135deg,#064e3b,#0f1117);border-radius:12px;padding:24px;">
                <h3 style="margin:0 0 8px;color:#ffffff;font-size:16px;">💰 Save even more with Credex</h3>
                <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;line-height:1.6;">
                  Credex sources discounted AI credits from companies that overforecast — Cursor, Claude, ChatGPT Enterprise and more at real discounts. For teams saving $500+/mo, the additional savings through credits can be substantial.
                </p>
                <a href="https://credex.rocks" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
                  Book a free Credex consultation →
                </a>
              </div>
            </td>
          </tr>
          ` : ""}

          <!-- View report button -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 32px;text-align:center;">
              <a href="https://ai-spend-audit-lovat.vercel.app/results/${audit?.share_id || ""}"
                style="display:inline-block;background:#0f1117;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
                View your full report →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Generated by <strong>SpendLens</strong> · Powered by <a href="https://credex.rocks" style="color:#10b981;text-decoration:none;">Credex</a>
              </p>
              <p style="margin:6px 0 0;color:#cbd5e1;font-size:11px;">
                You received this because you requested your audit report. No spam, ever.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "SpendLens <onboarding@resend.dev>",
      to: [email],
      subject: `Your AI Spend Audit — $${monthlySavings}/mo savings found`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      // Don't fail the request — lead is saved, email failed silently
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Lead route error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
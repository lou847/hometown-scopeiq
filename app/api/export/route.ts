import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const projectId = req.nextUrl.searchParams.get("project_id");
  const trade = req.nextUrl.searchParams.get("trade");
  if (!projectId) return new Response("Missing project_id", { status: 400 });

  // Fetch project
  const { data: project } = await supabase
    .from("projects").select("name").eq("id", projectId).single();

  // Fetch submissions with related data
  let query = supabase
    .from("bid_submissions")
    .select("*, bid_scope_responses(*, scope_items(item_text, drawing_ref)), bid_labor_rows(*)")
    .eq("project_id", projectId)
    .order("submitted_at");

  if (trade) query = query.eq("trade", trade);
  const { data: submissions } = await query;

  if (!submissions?.length) return new Response("No submissions", { status: 404 });

  // Fetch scope items
  const scopeQuery = supabase
    .from("scope_items").select("*").eq("project_id", projectId).eq("published", true).order("trade").order("sort_order");
  if (trade) scopeQuery.eq("trade", trade);
  const { data: scopeItems } = await scopeQuery;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = submissions.map((s) => ({
    Company: s.company_name,
    Trade: s.trade,
    "Total Labor": s.total_labor,
    "Total Material": s.total_material,
    "OH&P %": s.ohp_pct,
    "Total Bid": s.is_lump_sum
      ? s.lump_sum_total
      : s.total_labor + s.total_material + (s.total_labor + s.total_material) * (s.ohp_pct / 100),
    "Lump Sum": s.is_lump_sum ? "Yes" : "No",
    "Flagged Rows": s.flagged_row_count,
    "Scope Gaps": s.scope_gap_count,
    "Review Status": s.review_status,
    "Submitted": s.submitted_at,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");

  // Sheet 2: Scope Responses (side-by-side)
  if (scopeItems?.length) {
    const scopeRows = scopeItems.map((item) => {
      const row: Record<string, string> = {
        "Scope Item": item.item_text,
        "Drawing Ref": item.drawing_ref ?? "",
      };
      for (const sub of submissions) {
        const resp = sub.bid_scope_responses?.find(
          (r: { scope_item_id: string }) => r.scope_item_id === item.id
        );
        row[sub.company_name] = resp
          ? `${resp.response}${resp.note ? ` — ${resp.note}` : ""}`
          : "—";
      }
      return row;
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scopeRows), "Scope Comparison");
  }

  // Sheet 3: Labor Detail
  const laborRows: Record<string, unknown>[] = [];
  for (const sub of submissions) {
    for (const row of sub.bid_labor_rows ?? []) {
      laborRows.push({
        Company: sub.company_name,
        Classification: row.classification,
        Workers: row.worker_count,
        "Hours/Worker": row.hours_per_worker,
        "Base Wage": row.base_wage_entered,
        Fringe: row.fringe_entered,
        "Total Rate": row.total_entered_rate,
        "IDOL Minimum": row.idol_total_minimum,
        "Below Min": row.below_minimum ? "YES" : "",
        Variance: row.variance,
        "Row Total": row.row_total,
      });
    }
  }
  if (laborRows.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(laborRows), "Labor Detail");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `${project?.name ?? "ScopeIQ"}_${trade ?? "all"}_export.xlsx`;

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import type { Trade } from "@/lib/types";
import { TRADES } from "@/lib/types";

/** Map spreadsheet trade names to our Trade enum */
function normalizeTrade(raw: string): Trade {
  const s = raw.trim().toUpperCase();

  const mapping: Record<string, Trade> = {
    "ELECTRICAL": "electrical",
    "PLUMBING": "plumbing",
    "HVAC": "hvac",
    "CIVIL": "civil",
    "CARPENTRY": "carpentry",
    "FRAMING": "carpentry",
    "GLAZING": "glazing",
    "MASONRY": "masonry",
    "FIRE PROTECTION": "fire_protection",
    "ELEVATOR": "elevator",
    "ELEVATOR-HYDRAULIC LIFT": "elevator",
    "PAINTING": "painting",
    "DRYWALL": "drywall",
    "FRAMING DRYWALL AND TAPING": "drywall",
    "FRAMING, DRYWALL AND TAPING": "drywall",
    "FLOORING": "flooring",
    "ROOFING": "roofing",
    "CONCRETE": "concrete",
    "DEMOLITION": "demolition",
    "DEMO": "demolition",
    "INSULATION": "insulation",
    "SIGNAGE": "signage",
    "ASPHALT": "asphalt",
    "BATHROOM ACCESSORIES": "bathroom_accessories",
    "BATH ACCESSORIES": "bathroom_accessories",
    "COUNTERTOPS": "countertops",
    "COUNTERTOP": "countertops",
    "DFH": "doors_frames_hardware",
    "DOORS FRAMES HARDWARE": "doors_frames_hardware",
    "DOORS, FRAMES & HARDWARE": "doors_frames_hardware",
    "DOORS FRAMES AND HARDWARE": "doors_frames_hardware",
    "EPOXY": "epoxy",
    "FIRE ALARM": "fire_alarm",
    "LANDSCAPING": "landscaping",
    "LANDSCAPE": "landscaping",
    "LOW VOLTAGE": "low_voltage",
    "LOW-VOLTAGE": "low_voltage",
    "MILLWORK": "millwork",
    "PANORAMIC": "panoramic",
    "PANORAMIC DOORS": "panoramic",
    "PANORAMIC DOORS/WINDOWS": "panoramic",
    "PAVERS": "pavers",
    "PAVING": "paving",
    "PERGOLA": "pergola",
    "POLISHED CONCRETE": "polished_concrete",
    "SHIPLAP": "shiplap",
    "SPRINKLER": "sprinkler",
    "STEEL": "steel",
    "STRUCTURAL STEEL": "steel",
    "TEMP FENCING": "temp_fencing",
    "TEMPORARY FENCING": "temp_fencing",
    "UTILITIES": "utilities",
  };

  if (mapping[s]) return mapping[s];

  // Fuzzy fallback: check if any trade keyword is contained
  const lower = s.toLowerCase();
  for (const trade of TRADES) {
    if (trade !== "other" && lower.includes(trade.replace("_", " "))) {
      return trade;
    }
  }

  return "other";
}

/** Parse a bid amount string, returning null for "NOT FOUND" or invalid values */
function parseBidAmount(val: unknown): number | null {
  if (val == null) return null;
  const s = String(val).trim().toUpperCase();
  if (s === "" || s === "NOT FOUND" || s === "N/A" || s === "-") return null;
  const cleaned = s.replace(/[$,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("project_id");
  if (!projectId) {
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  }

  // Verify project exists
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Parse uploaded file
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Try to find the "All Bids Detail" sheet, fall back to first sheet
  const sheetName = workbook.SheetNames.find(
    (n) => n.toLowerCase().includes("all bids detail")
  ) ?? workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return NextResponse.json({ error: "No readable sheet found" }, { status: 400 });
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (!rows.length) {
    return NextResponse.json({ error: `Sheet "${sheetName}" has no rows. Available sheets: ${workbook.SheetNames.join(", ")}` }, { status: 400 });
  }

  // Debug: check what columns we have
  const firstRow = rows[0];
  const colKeys = Object.keys(firstRow);

  // Delete existing legacy bids for clean re-import
  await supabase.from("legacy_bids").delete().eq("project_id", projectId);

  // Map rows to legacy_bids records
  const records = rows
    .filter((row) => {
      // Must have at least a trade and vendor - try multiple possible column names
      const trade = row["Trade"] ?? row["trade"] ?? row["TRADE"] ?? row[colKeys[0]];
      const vendor = row["Vendor"] ?? row["vendor"] ?? row["VENDOR"] ?? row["Subcontractor"] ?? row["Company"] ?? row[colKeys[1]];
      return trade && String(trade).trim() !== "";
    })
    .map((row) => {
      const tradeRaw = String(row["Trade"] ?? row["trade"] ?? row["TRADE"] ?? row[colKeys[0]] ?? "");
      const vendor = String(row["Vendor"] ?? row["vendor"] ?? row["VENDOR"] ?? row["Subcontractor"] ?? row["Company"] ?? row[colKeys[1]] ?? "");
      const bidAmount = parseBidAmount(row["Bid Amount"] ?? row["bid_amount"] ?? row["Amount"] ?? row["Total"] ?? row[colKeys[2]]);
      const fileType = row["File Type"] ?? row["File"] ?? row["file_type"] ?? row[colKeys[3]] ?? null;
      const pwRaw = String(row["PW"] ?? row["pw"] ?? row["Prevailing Wage"] ?? row[colKeys[4]] ?? "").trim().toUpperCase();
      const detailScore = parseBidAmount(row["Detail Score"] ?? row["detail_score"] ?? row["Score"] ?? row[colKeys[5]]);
      const issues = row["Issues"] ?? row["issues"] ?? row[colKeys[6]] ?? null;
      const scopeNotes = row["Scope"] ?? row["scope_notes"] ?? row["Scope Notes"] ?? row[colKeys[7]] ?? null;
      const exclusions = row["Exclusions"] ?? row["exclusions"] ?? row[colKeys[8]] ?? null;
      const sourceFile = row["File"] ?? row["Source File"] ?? row["source_file"] ?? row[colKeys[9]] ?? null;

      return {
        project_id: projectId,
        trade: normalizeTrade(tradeRaw),
        vendor,
        bid_amount: bidAmount,
        file_type: fileType ? String(fileType) : null,
        pw_confirmed: pwRaw === "YES" || pwRaw === "TRUE",
        detail_score: detailScore,
        issues: issues ? String(issues) : null,
        scope_notes: scopeNotes ? String(scopeNotes) : null,
        exclusions: exclusions ? String(exclusions) : null,
        source_file: sourceFile ? String(sourceFile) : null,
      };
    });

  if (!records.length) {
    return NextResponse.json({
      error: `No valid rows found. Sheet: "${sheetName}", Total rows: ${rows.length}, Columns: [${colKeys.join(", ")}], First row sample: ${JSON.stringify(firstRow).substring(0, 200)}`
    }, { status: 400 });
  }

  // Insert in batches of 100
  let totalInserted = 0;
  for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100);
    const { error } = await supabase.from("legacy_bids").insert(batch);
    if (error) {
      return NextResponse.json(
        { error: `Insert error: ${error.message}`, imported: totalInserted },
        { status: 500 }
      );
    }
    totalInserted += batch.length;
  }

  return NextResponse.json({ imported: totalInserted, sheet: sheetName });
}

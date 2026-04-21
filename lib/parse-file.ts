import * as XLSX from "xlsx";

export interface VarianceRow {
  lineItem: string;
  budget: number;
  actuals: number;
  variance: number;
  variancePct: number;
}

// Expense-type lines: higher actuals = unfavorable
const EXPENSE_PATTERN = /cost|expense|cogs|opex|overhead|s&m|marketing|r&d|research|g&a|admin|interest|tax|depreciation|amort/i;
// Revenue/income lines: higher actuals = favorable
const REVENUE_PATTERN = /revenue|sales|income|gross profit|operating income|ebit|ebitda|margin|contribution/i;

export function isFavorable(row: VarianceRow): boolean {
  const name = row.lineItem;
  if (REVENUE_PATTERN.test(name)) return row.variance >= 0;
  if (EXPENSE_PATTERN.test(name)) return row.variance <= 0;
  // Default: positive variance = favorable (revenue assumption)
  return row.variance >= 0;
}

export function parseVarianceFile(buffer: ArrayBuffer): VarianceRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Try to find where data actually starts by scanning for a row with budget/actuals headers
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:Z100");
  let headerRow = 0;

  for (let r = range.s.r; r <= Math.min(range.e.r, 10); r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === "string") {
        if (/budget|plan|target|actual|result/i.test(cell.v)) {
          headerRow = r;
          break;
        }
      }
    }
    if (headerRow > 0) break;
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    range: headerRow,
  });

  return rows
    .map((row) => {
      const keys = Object.keys(row);

      // Broader column matching to handle messier labels
      const lineItemKey =
        keys.find((k) => /item|name|desc|account|category|line|dept|segment/i.test(k)) ??
        keys[0];
      const budgetKey =
        keys.find((k) => /budget|plan|target|forecast|expected/i.test(k)) ??
        keys[1];
      const actualsKey =
        keys.find((k) => /actual|result|real|ytd|reported/i.test(k)) ??
        keys[2];
      const varianceKey = keys.find((k) => /^variance$|^var$|^diff$/i.test(k));
      const variancePctKey = keys.find((k) => /(%|pct|percent)/i.test(k));

      const toNum = (v: unknown): number => {
        if (typeof v === "number") return v;
        if (typeof v === "string") return parseFloat(v.replace(/[$,%\s()/]/g, "")) || 0;
        return 0;
      };

      const lineItem = String(row[lineItemKey] ?? "").trim();
      const budget = toNum(row[budgetKey]);
      const actuals = toNum(row[actualsKey]);
      const variance = varianceKey ? toNum(row[varianceKey]) : actuals - budget;
      const variancePct = variancePctKey
        ? toNum(row[variancePctKey])
        : budget !== 0
        ? ((actuals - budget) / Math.abs(budget)) * 100
        : 0;

      return { lineItem, budget, actuals, variance, variancePct };
    })
    .filter((r) => {
      // Drop blank/total/header-like rows and rows with no numeric data
      if (!r.lineItem || r.lineItem.toLowerCase() === "unknown") return false;
      if (/^total$|^grand total$|^subtotal$/i.test(r.lineItem)) return false;
      if (r.budget === 0 && r.actuals === 0) return false;
      return true;
    });
}

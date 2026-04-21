import * as XLSX from "xlsx";

export interface VarianceRow {
  lineItem: string;
  budget: number;
  actuals: number;
  variance: number;
  variancePct: number;
}

export function parseVarianceFile(buffer: ArrayBuffer): VarianceRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return rows
    .map((row) => {
      const keys = Object.keys(row);
      const lineItemKey = keys.find((k) => /item|name|description|account/i.test(k)) ?? keys[0];
      const budgetKey = keys.find((k) => /budget|plan|target/i.test(k)) ?? keys[1];
      const actualsKey = keys.find((k) => /actual|result/i.test(k)) ?? keys[2];
      const varianceKey = keys.find((k) => /^variance$|^var$/i.test(k));
      const variancePctKey = keys.find((k) => /(%|pct|percent)/i.test(k));

      const toNum = (v: unknown): number => {
        if (typeof v === "number") return v;
        if (typeof v === "string") return parseFloat(v.replace(/[$,%\s]/g, "")) || 0;
        return 0;
      };

      const budget = toNum(row[budgetKey]);
      const actuals = toNum(row[actualsKey]);
      const variance = varianceKey ? toNum(row[varianceKey]) : actuals - budget;
      const variancePct = variancePctKey
        ? toNum(row[variancePctKey])
        : budget !== 0
        ? ((actuals - budget) / Math.abs(budget)) * 100
        : 0;

      return {
        lineItem: String(row[lineItemKey] ?? "Unknown"),
        budget,
        actuals,
        variance,
        variancePct,
      };
    })
    .filter((r) => r.lineItem !== "Unknown" && (r.budget !== 0 || r.actuals !== 0));
}

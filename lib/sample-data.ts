import * as XLSX from "xlsx";

const ROWS = [
  { item: "Revenue",          q1b: 4200000, q1a: 4410000, q2b: 4500000, q2a: 4275000 },
  { item: "Cost of Goods Sold", q1b: 1680000, q1a: 1730000, q2b: 1800000, q2a: 1980000 },
  { item: "Gross Profit",     q1b: 2520000, q1a: 2680000, q2b: 2700000, q2a: 2295000 },
  { item: "R&D",              q1b:  630000, q1a:  598000, q2b:  675000, q2a:  810000 },
  { item: "S&M",              q1b:  504000, q1a:  529000, q2b:  540000, q2a:  648000 },
  { item: "G&A",              q1b:  336000, q1a:  319000, q2b:  360000, q2a:  396000 },
  { item: "Operating Income", q1b: 1050000, q1a: 1234000, q2b: 1125000, q2a:  441000 },
  { item: "Interest Expense", q1b:   84000, q1a:   84000, q2b:   90000, q2a:  108000 },
  { item: "Tax",              q1b:  235000, q1a:  277000, q2b:  252000, q2a:   99000 },
  { item: "Net Income",       q1b:  731000, q1a:  873000, q2b:  783000, q2a:  234000 },
];

export function buildSampleFile(): File {
  const data = ROWS.map(r => ({
    "Line Item": r.item,
    "Budget":    r.q1b,
    "Actuals":   r.q1a,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "P&L");

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new File([buffer], "sample-variance-data.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

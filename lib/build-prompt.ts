import { VarianceRow } from "./parse-file";

export function buildVariancePrompt(rows: VarianceRow[]): string {
  const table = rows
    .map(
      (r) =>
        `- ${r.lineItem}: Budget $${r.budget.toLocaleString()}, Actuals $${r.actuals.toLocaleString()}, ` +
        `Variance $${r.variance.toLocaleString()} (${r.variancePct.toFixed(1)}%)`
    )
    .join("\n");

  return `You are a senior FP&A analyst writing variance commentary for a management report.

Here is the financial data for the period:

${table}

Write 3-5 sentences of professional variance commentary. Requirements:
- Lead with the most significant variance (favorable or unfavorable) and explain the likely business driver
- Mention 2-3 key line items — not every line
- Use business language: "favorable", "unfavorable", "drove", "offset", "outperformed", "underperformed"
- Do NOT use phrases like "it is worth noting" or "it should be noted"
- Do NOT use bullet points — prose only
- Assume the reader is a CFO or board member
- End with a one-sentence summary of the overall period performance

Output only the commentary. No preamble, no headers.`;
}

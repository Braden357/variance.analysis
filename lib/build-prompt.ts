import { VarianceRow, isFavorable } from "./parse-file";

export type OutputMode = "CFO Summary" | "Management Report" | "Board Pack";

const modeInstructions: Record<OutputMode, string> = {
  "CFO Summary":
    "Write exactly 2 sentences. Lead with the single most important variance and its dollar impact. Close with one-line overall performance verdict. Extremely concise — the CFO reads this in 10 seconds.",
  "Management Report":
    "Write 4-5 sentences of professional variance commentary. Lead with the most significant variance and its likely business driver. Mention 3-4 key line items. Use business language: 'favorable', 'unfavorable', 'drove', 'offset', 'outperformed'. End with an overall period summary.",
  "Board Pack":
    "Write 3 sentences in formal board-level language. No jargon. Dollar amounts only — no percentages in prose. Use 'exceeded', 'fell short of', 'driven by'. Assume the reader is a non-finance board member. Close with a one-sentence outlook implication.",
};

export function buildVariancePrompt(
  rows: VarianceRow[],
  threshold: number = 10,
  outputMode: OutputMode = "Management Report"
): string {
  const flagged = rows.filter((r) => Math.abs(r.variancePct) >= threshold);

  const table = rows
    .map(
      (r) =>
        `- ${r.lineItem}: Budget $${r.budget.toLocaleString()}, Actuals $${r.actuals.toLocaleString()}, ` +
        `Variance $${r.variance.toLocaleString()} (${r.variancePct >= 0 ? "+" : ""}${r.variancePct.toFixed(1)}%) [${isFavorable(r) ? "FAVORABLE" : "UNFAVORABLE"}]` +
        (Math.abs(r.variancePct) >= threshold ? " [FLAGGED]" : "")
    )
    .join("\n");

  const flagNote =
    flagged.length > 0
      ? `\nItems exceeding the ${threshold}% variance threshold (flagged): ${flagged.map((r) => r.lineItem).join(", ")}. Address these specifically.\n`
      : "";

  return `You are a senior FP&A analyst writing variance commentary.

Financial data for the period:
${table}
${flagNote}
Output mode: ${outputMode}
Instructions: ${modeInstructions[outputMode]}

Additional rules:
- Do NOT use "it is worth noting" or "it should be noted"
- Do NOT use bullet points — prose only
- Do NOT add preamble or headers

Output only the commentary.`;
}

import { VarianceRow, isFavorable } from "@/lib/parse-file";

interface Props {
  rows: VarianceRow[];
  threshold?: number;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export function DataPreview({ rows, threshold = 10 }: Props) {
  return (
    <div className="reveal" style={{ borderRadius: "2px", overflow: "hidden", border: "1px solid var(--border)" }}>
      {/* Table header bar */}
      <div style={{
        background: "var(--surface-raised)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          ACTUALS vs. BUDGET
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--gold)",
          fontFamily: "'IBM Plex Mono', monospace",
          opacity: 0.7,
        }}>
          {rows.length} LINE ITEMS · {rows.filter(r => Math.abs(r.variancePct) >= threshold).length} FLAGGED
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface)" }}>
            {["Account", "Budget", "Actuals", "Variance", "Δ%", ""].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "8px 16px",
                  textAlign: i === 0 ? "left" : "right",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 400,
                  borderBottom: "1px solid var(--border)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const fav = isFavorable(row);
            const flagged = Math.abs(row.variancePct) >= threshold;
            return (
              <tr
                key={i}
                style={{
                  borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.15s",
                  borderLeft: flagged ? `2px solid ${fav ? "var(--green)" : "var(--red)"}` : "2px solid transparent",

                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{
                  padding: "11px 16px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 400,
                }}>
                  {row.lineItem}
                </td>
                <td style={{
                  padding: "11px 16px",
                  textAlign: "right",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {fmt(row.budget)}
                </td>
                <td style={{
                  padding: "11px 16px",
                  textAlign: "right",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {fmt(row.actuals)}
                </td>
                <td style={{
                  padding: "11px 16px",
                  textAlign: "right",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                }}>
                  {fmt(row.variance)}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 7px",
                    borderRadius: "2px",
                    background: "var(--surface-raised)",
                    color: "var(--text-secondary)",
                    fontSize: "11px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                  }}>
                    {fmtPct(row.variancePct)}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", textAlign: "center" }}>
                  {flagged && (
                    <span style={{
                      fontSize: "9px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: fav ? "var(--green)" : "var(--red)",
                      textTransform: "uppercase",
                    }}>
                      {fav ? "▲ FAV" : "▼ UNF"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

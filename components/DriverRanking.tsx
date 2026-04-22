"use client";
import { VarianceRow, rankDrivers, isFavorable } from "@/lib/parse-file";

interface Props {
  rows: VarianceRow[];
  threshold: number;
}

const fmt = (n: number) =>
  `$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function DriverRanking({ rows, threshold }: Props) {
  const drivers = rankDrivers(rows, 5);

  return (
    <div
      className="reveal"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--gold)",
        borderRadius: "2px",
        padding: "24px 28px",
      }}
    >
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--gold)",
        opacity: 0.85,
        marginBottom: 20,
      }}>
        ◆ &nbsp;Top Variance Drivers
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {drivers.map((row, i) => {
          const favorable = isFavorable(row);
          const flagged = Math.abs(row.variancePct) >= threshold;
          return (
            <div
              key={row.lineItem}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr auto auto auto",
                alignItems: "center",
                gap: "0 16px",
                padding: "10px 14px",
                background: flagged
                  ? (favorable ? "rgba(26,124,69,0.06)" : "rgba(185,28,28,0.06)")
                  : "var(--surface-raised, rgba(255,255,255,0.03))",
                border: "1px solid var(--border)",
                borderRadius: "2px",
              }}
            >
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                color: "var(--gold)",
                opacity: 0.6,
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              <span style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {row.lineItem}
              </span>

              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "12px",
                fontWeight: 600,
                color: favorable ? "var(--green, #1a7c45)" : "var(--red, #b91c1c)",
                textAlign: "right",
                minWidth: 80,
              }}>
                {row.variance >= 0 ? "+" : "-"}{fmt(row.variance)}
              </span>

              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                color: favorable ? "var(--green, #1a7c45)" : "var(--red, #b91c1c)",
                textAlign: "right",
                minWidth: 52,
              }}>
                {row.variancePct >= 0 ? "+" : ""}{row.variancePct.toFixed(1)}%
              </span>

              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: favorable ? "var(--green, #1a7c45)" : "var(--red, #b91c1c)",
                border: `1px solid ${favorable ? "rgba(26,124,69,0.4)" : "rgba(185,28,28,0.4)"}`,
                borderRadius: "2px",
                padding: "2px 6px",
                textTransform: "uppercase",
                minWidth: 40,
                textAlign: "center",
              }}>
                {favorable ? "FAV" : "UNF"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

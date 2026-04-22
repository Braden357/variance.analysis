"use client";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { VarianceRow, rankDrivers, isFavorable } from "@/lib/parse-file";

interface Props {
  rows: VarianceRow[];
}

interface WaterfallEntry {
  name: string;
  offset: number;
  value: number;
  total: number;
  isTotal: boolean;
  favorable: boolean | null;
}

function buildWaterfallData(rows: VarianceRow[]): WaterfallEntry[] {
  const totalVariance = rows.reduce((s, r) => s + r.variance, 0);
  const drivers = rankDrivers(rows, 8);

  const entries: WaterfallEntry[] = [];

  let running = 0;
  for (const d of drivers) {
    const fav = isFavorable(d);
    const delta = d.variance;
    const start = fav ? running : running + delta;
    entries.push({
      name: d.lineItem.length > 14 ? d.lineItem.slice(0, 13) + "…" : d.lineItem,
      offset: start,
      value: Math.abs(delta),
      total: running + delta,
      isTotal: false,
      favorable: fav,
    });
    running += delta;
  }

  entries.push({
    name: "Net Var.",
    offset: Math.min(0, totalVariance),
    value: Math.abs(totalVariance),
    total: totalVariance,
    isTotal: true,
    favorable: null,
  });

  return entries;
}

const fmt = (v: number) =>
  `$${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: WaterfallEntry }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#1a1a2e",
      border: "1px solid rgba(201,168,76,0.3)",
      borderRadius: 2,
      padding: "10px 14px",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11,
      color: "#e8e8e8",
    }}>
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{d.name}</div>
      {d.isTotal ? (
        <div style={{ color: "#c9a84c" }}>{fmt(d.total)}</div>
      ) : (
        <>
          <div style={{ color: d.favorable ? "#1a7c45" : "#b91c1c" }}>
            {d.favorable ? "+" : "-"}{fmt(d.value)}
          </div>
          <div style={{ color: "#888", marginTop: 2 }}>
            Running: {fmt(d.total)}
          </div>
        </>
      )}
    </div>
  );
}

export function WaterfallChart({ rows }: Props) {
  const data = buildWaterfallData(rows);

  const allTops = data.map(d => d.offset + d.value);
  const allBots = data.map(d => d.offset);
  const yMax = Math.max(0, ...allTops);
  const yMin = Math.min(0, ...allBots);
  const range = yMax - yMin || 1;
  const domainMin = yMin - range * 0.1;
  const domainMax = yMax + range * 0.1;

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
        ◆ &nbsp;Variance Drivers (vs. Budget)
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          {/* invisible offset bar */}
          <Bar dataKey="offset" stackId="a" fill="transparent" isAnimationActive={false} />
          {/* visible variance bar — custom shape bypasses deprecated Cell coloring issues */}
          <Bar
            dataKey="value"
            stackId="a"
            isAnimationActive={false}
            shape={(props: { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
              const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
              const entry = data[index];
              const fill = entry.isTotal
                ? "rgba(201,168,76,0.5)"
                : entry.favorable
                ? "rgba(26,124,69,0.7)"
                : "rgba(185,28,28,0.7)";
              const stroke = entry.isTotal
                ? "rgba(201,168,76,0.9)"
                : entry.favorable
                ? "#1a7c45"
                : "#b91c1c";
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={Math.max(0, height)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1}
                  rx={2}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{
        display: "flex",
        gap: 20,
        marginTop: 8,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.08em",
        color: "#888",
        justifyContent: "center",
      }}>
        <span><span style={{ color: "rgba(201,168,76,0.9)" }}>■</span> Total</span>
        <span><span style={{ color: "#1a7c45" }}>■</span> Favorable</span>
        <span><span style={{ color: "#b91c1c" }}>■</span> Unfavorable</span>
      </div>
    </div>
  );
}

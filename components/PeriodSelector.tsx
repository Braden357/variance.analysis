"use client";

interface Props {
  periods: string[];
  selected: number;
  onChange: (i: number) => void;
  disabled?: boolean;
}

export function PeriodSelector({ periods, selected, onChange, disabled }: Props) {
  if (periods.length < 2) return null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        padding: "20px 28px",
      }}
    >
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-secondary)",
        marginBottom: 10,
      }}>
        Period
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {periods.map((label, i) => (
          <button
            key={label}
            disabled={disabled}
            onClick={() => onChange(i)}
            style={{
              padding: "7px 16px",
              border: `1px solid ${selected === i ? "var(--gold)" : "var(--border-bright)"}`,
              borderRadius: "2px",
              background: selected === i ? "var(--gold-dim)" : "transparent",
              color: selected === i ? "var(--gold)" : "var(--text-secondary)",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.06em",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

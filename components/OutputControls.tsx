"use client";

export type OutputMode = "CFO Summary" | "Management Report" | "Board Pack";

interface Props {
  threshold: number;
  setThreshold: (v: number) => void;
  outputMode: OutputMode;
  setOutputMode: (v: OutputMode) => void;
  email: string;
  setEmail: (v: string) => void;
  disabled: boolean;
}

const MODES: OutputMode[] = ["CFO Summary", "Management Report", "Board Pack"];

const modeDescriptions: Record<OutputMode, string> = {
  "CFO Summary": "2 sentences · top-line only",
  "Management Report": "4-5 sentences · key drivers",
  "Board Pack": "3 sentences · formal · no jargon",
};

export function OutputControls({
  threshold,
  setThreshold,
  outputMode,
  setOutputMode,
  email,
  setEmail,
  disabled,
}: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Label */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--gold)",
        opacity: 0.85,
      }}>
        ◆ &nbsp;Output Settings
      </div>

      {/* Output mode */}
      <div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: 10,
        }}>
          Output Mode
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODES.map((mode) => (
            <button
              key={mode}
              disabled={disabled}
              onClick={() => setOutputMode(mode)}
              style={{
                padding: "7px 14px",
                border: `1px solid ${outputMode === mode ? "var(--gold)" : "var(--border-bright)"}`,
                borderRadius: "2px",
                background: outputMode === mode ? "var(--gold-dim)" : "transparent",
                color: outputMode === mode ? "var(--gold)" : "var(--text-secondary)",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.06em",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <span>{mode}</span>
              <span style={{
                fontSize: "9px",
                opacity: 0.6,
                fontWeight: 400,
                letterSpacing: "0.04em",
              }}>
                {modeDescriptions[mode]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Threshold */}
      <div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}>
            Variance Threshold
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "12px",
            color: "var(--gold)",
            fontWeight: 500,
          }}>
            {threshold}%
          </div>
        </div>
        <input
          type="range"
          min={5}
          max={25}
          step={1}
          value={threshold}
          disabled={disabled}
          onChange={(e) => setThreshold(parseInt(e.target.value))}
          style={{
            width: "100%",
            accentColor: "var(--gold)",
            cursor: disabled ? "not-allowed" : "pointer",
            height: "2px",
          }}
        />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          color: "var(--text-muted)",
          marginTop: 6,
        }}>
          <span>5% · tight</span>
          <span>Items beyond this % are flagged in Excel</span>
          <span>25% · lenient</span>
        </div>
      </div>

      {/* Email */}
      <div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: 10,
        }}>
          Email Annotated Excel <span style={{ opacity: 0.5 }}>(optional)</span>
        </div>
        <input
          type="email"
          value={email}
          disabled={disabled}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            width: "100%",
            background: "var(--surface-raised)",
            border: "1px solid var(--border-bright)",
            borderRadius: "2px",
            padding: "10px 14px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "12px",
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
        />
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          color: "var(--text-muted)",
          marginTop: 6,
          letterSpacing: "0.04em",
        }}>
          Annotated .xlsx delivered to your inbox after generation
        </div>
      </div>
    </div>
  );
}

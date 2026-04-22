"use client";
import { useState } from "react";

interface Props {
  text: string;
}

export function Commentary({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="reveal"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--gold)",
        borderRadius: "2px",
        padding: "28px 32px",
        position: "relative",
      }}
    >
      {/* Label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
      }}>
        <span style={{
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gold)",
          fontFamily: "'IBM Plex Mono', monospace",
          opacity: 0.85,
        }}>
          ◆ &nbsp;Generated Commentary
        </span>
        <button
          onClick={copy}
          style={{
            background: copied ? "var(--gold-dim)" : "transparent",
            border: "1px solid var(--border-bright)",
            borderRadius: "2px",
            padding: "5px 12px",
            color: copied ? "var(--gold)" : "var(--text-secondary)",
            fontSize: "11px",
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gold)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-bright)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
            }
          }}
        >
          {copied ? "✓  Copied" : "Copy"}
        </button>
      </div>

      {/* Commentary text */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "16px",
        lineHeight: 1.85,
        color: "var(--text-primary)",
        letterSpacing: "0.01em",
      }}>
        {text}
      </p>

      {/* Bottom attribution line */}
      <div style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid var(--border)",
        fontSize: "10px",
        color: "var(--text-muted)",
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>v1</span>
      </div>
    </div>
  );
}

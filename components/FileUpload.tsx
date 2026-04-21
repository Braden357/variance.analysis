"use client";
import { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled: boolean;
}

export function FileUpload({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!disabled) onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        background: dragging ? "rgba(201,168,76,0.04)" : "var(--surface)",
        border: `1px solid ${dragging ? "var(--gold)" : "var(--border)"}`,
        borderRadius: "2px",
        padding: "56px 40px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner accents */}
      <span style={{
        position: "absolute", top: 8, left: 8,
        width: 16, height: 16,
        borderTop: "1px solid var(--gold)", borderLeft: "1px solid var(--gold)",
        opacity: dragging ? 1 : 0.4, transition: "opacity 0.2s",
      }} />
      <span style={{
        position: "absolute", top: 8, right: 8,
        width: 16, height: 16,
        borderTop: "1px solid var(--gold)", borderRight: "1px solid var(--gold)",
        opacity: dragging ? 1 : 0.4, transition: "opacity 0.2s",
      }} />
      <span style={{
        position: "absolute", bottom: 8, left: 8,
        width: 16, height: 16,
        borderBottom: "1px solid var(--gold)", borderLeft: "1px solid var(--gold)",
        opacity: dragging ? 1 : 0.4, transition: "opacity 0.2s",
      }} />
      <span style={{
        position: "absolute", bottom: 8, right: 8,
        width: 16, height: 16,
        borderBottom: "1px solid var(--gold)", borderRight: "1px solid var(--gold)",
        opacity: dragging ? 1 : 0.4, transition: "opacity 0.2s",
      }} />

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        disabled={disabled}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Upload icon — minimal grid */}
      <div style={{ marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: "0 auto", display: "block" }}>
          <rect x="4" y="4" width="10" height="10" stroke="var(--gold)" strokeWidth="1" opacity="0.4"/>
          <rect x="16" y="4" width="16" height="10" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5"/>
          <rect x="4" y="16" width="16" height="16" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5"/>
          <rect x="22" y="16" width="10" height="10" stroke="var(--gold)" strokeWidth="1" opacity="0.4"/>
          <line x1="18" y1="28" x2="18" y2="22" stroke="var(--gold)" strokeWidth="1.5" opacity="0.9"/>
          <polyline points="15,25 18,22 21,25" stroke="var(--gold)" strokeWidth="1.5" fill="none" opacity="0.9"/>
        </svg>
      </div>

      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "17px",
        fontWeight: 600,
        color: "var(--text-primary)",
        letterSpacing: "0.01em",
        marginBottom: 8,
      }}>
        Drop your variance file here
      </p>
      <p style={{
        fontSize: "12px",
        color: "var(--text-secondary)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        .xlsx · .xls · .csv &nbsp;·&nbsp; Line Item, Budget, Actuals
      </p>

      <div style={{ marginTop: 24 }}>
        <a
          href="/sample.xlsx"
          download
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: "11px",
            color: "var(--gold)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'IBM Plex Mono', monospace",
            borderBottom: "1px solid rgba(201,168,76,0.3)",
            paddingBottom: "1px",
          }}
        >
          Download sample file →
        </a>
      </div>
    </div>
  );
}

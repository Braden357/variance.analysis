"use client";
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DataPreview } from "@/components/DataPreview";
import { Commentary } from "@/components/Commentary";
import { VarianceRow } from "@/lib/parse-file";

export default function Home() {
  const [rows, setRows] = useState<VarianceRow[]>([]);
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setCommentary("");
    setRows([]);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setRows(data.rows);
      setCommentary(data.commentary);
    } catch {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      position: "relative",
      zIndex: 1,
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 120px" }}>

        {/* Header */}
        <header className="fade-up delay-1" style={{ marginBottom: 56, textAlign: "center" }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 20,
            opacity: 0.8,
          }}>
            FP&amp;A Intelligence · AI-Powered
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}>
            Variance Commentary
            <br />
            <span style={{ color: "var(--gold)", fontWeight: 400, fontStyle: "italic" }}>
              Generator
            </span>
          </h1>

          {/* Rule */}
          <div style={{
            width: 40,
            height: 1,
            background: "var(--gold)",
            margin: "20px auto",
            opacity: 0.5,
          }} />

          <p style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: 480,
            margin: "0 auto",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 300,
          }}>
            Upload your Excel budget vs. actuals file.
            Receive CFO-ready variance commentary in seconds —
            the kind that takes analysts 30 minutes to write.
          </p>
        </header>

        {/* Upload */}
        <div className="fade-up delay-2">
          <FileUpload onFile={handleFile} disabled={loading} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "40px 0",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            <span className="pulse-gold" style={{ color: "var(--gold)" }}>
              ◆ &nbsp;Generating commentary...
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 24,
            padding: "14px 20px",
            border: "1px solid var(--red-dim)",
            borderLeft: "3px solid var(--red)",
            borderRadius: "2px",
            background: "var(--red-dim)",
            fontSize: "13px",
            color: "var(--red)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {rows.length > 0 && !loading && (
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <DataPreview rows={rows} />
            {commentary && <Commentary text={commentary} />}
          </div>
        )}

        {/* Footer */}
        <footer className="fade-up delay-4" style={{
          marginTop: 80,
          textAlign: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}>
          Built with Next.js · GPT-4o · Vercel
        </footer>

      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DataPreview } from "@/components/DataPreview";
import { Commentary } from "@/components/Commentary";
import { DriverRanking } from "@/components/DriverRanking";
import { WaterfallChart } from "@/components/WaterfallChart";
import { OutputControls, OutputMode } from "@/components/OutputControls";
import { VarianceRow, Period } from "@/lib/parse-file";
import { PeriodSelector } from "@/components/PeriodSelector";

export default function Home() {
  const [rows, setRows] = useState<VarianceRow[]>([]);
  const [commentary, setCommentary] = useState("");
  const [excelBase64, setExcelBase64] = useState("");
  const [pptxBase64, setPptxBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Controls
  const [threshold, setThreshold] = useState(5);
  const [outputMode, setOutputMode] = useState<OutputMode>("Management Report");
  // Period detection
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const runGenerate = async (file: File, period?: Period) => {
    setError("");
    setCommentary("");
    setRows([]);
    setExcelBase64("");
    setPptxBase64("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("threshold", String(threshold));
    formData.append("outputMode", outputMode);
    if (period) {
      formData.append("periodLabel", period.label);
      formData.append("budgetKey", period.budgetKey);
      formData.append("actualsKey", period.actualsKey);
    }

    try {
      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();
      // #region agent log
      fetch("http://127.0.0.1:7439/ingest/5f64ed25-9557-4ce5-8048-837250822959", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "2b0ca5",
        },
        body: JSON.stringify({
          sessionId: "2b0ca5",
          runId: "pre-fix",
          hypothesisId: "H2_response_shape",
          location: "app/page.tsx:runGenerate_after_json",
          message: "Generate API JSON shape",
          data: {
            ok: res.ok,
            keys: data && typeof data === "object" ? Object.keys(data as object) : [],
            pptxType: typeof (data as { pptxBase64?: unknown }).pptxBase64,
            pptxLen:
              typeof (data as { pptxBase64?: string }).pptxBase64 === "string"
                ? (data as { pptxBase64: string }).pptxBase64.length
                : 0,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setRows(data.rows);
      setCommentary(data.commentary);
      setExcelBase64(data.excelBase64 ?? "");
      setPptxBase64(data.pptxBase64 ?? "");
    } catch {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    setPendingFile(file);
    setPeriods([]);
    setSelectedPeriod(0);

    // Detect periods first (lightweight, no GPT)
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/detect-periods", { method: "POST", body: fd });
      const data = await res.json();
      if (data.periods?.length >= 2) {
        setPeriods(data.periods);
        setSelectedPeriod(0);
        await runGenerate(file, data.periods[0]);
        return;
      }
    } catch { /* fall through to single-period */ }

    await runGenerate(file);
  };

  const handlePeriodChange = async (i: number) => {
    setSelectedPeriod(i);
    if (pendingFile && periods[i]) {
      await runGenerate(pendingFile, periods[i]);
    }
  };

  const downloadPptx = () => {
    if (!pptxBase64) return;
    const bytes = Uint8Array.from(atob(pptxBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "variance-commentary.pptx";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7439/ingest/5f64ed25-9557-4ce5-8048-837250822959", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2b0ca5",
      },
      body: JSON.stringify({
        sessionId: "2b0ca5",
        runId: "pre-fix",
        hypothesisId: "H3_client_ui_state",
        location: "app/page.tsx:useEffect_exports",
        message: "Client state for export buttons",
        data: {
          rowsCount: rows.length,
          excelLen: excelBase64.length,
          pptxLen: pptxBase64.length,
          showExcelBtn: Boolean(excelBase64),
          showPptBtn: Boolean(pptxBase64),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [rows.length, excelBase64, pptxBase64]);

  const downloadExcel = () => {
    if (!excelBase64) return;
    const bytes = Uint8Array.from(atob(excelBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "variance-analysis-annotated.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 120px" }}>

        <header className="fade-up delay-1" style={{ marginBottom: 56, textAlign: "center" }}>
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

          <div style={{ width: 40, height: 1, background: "var(--gold)", margin: "20px auto", opacity: 0.5 }} />

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            marginTop: 8,
            flexWrap: "wrap",
          }}>
            {[
              { step: "01", label: "Upload", desc: "Drop your Excel file with Budget & Actuals columns" },
              { step: "02", label: "Analyze", desc: "AI flags variances and writes CFO-ready commentary" },
              { step: "03", label: "Export", desc: "Download annotated Excel with AI commentary" },
            ].map(({ step, label, desc }, i) => (
              <div key={step} style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{
                  padding: "16px 28px",
                  textAlign: "center",
                  maxWidth: 180,
                }}>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "var(--gold)",
                    letterSpacing: "0.14em",
                    marginBottom: 6,
                    opacity: 0.7,
                  }}>
                    {step}
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}>
                    {desc}
                  </div>
                </div>
                {i < 2 && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    color: "var(--gold)",
                    opacity: 0.3,
                    fontSize: "12px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    paddingTop: 24,
                  }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </header>

        <div className="fade-up delay-2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <OutputControls
            threshold={threshold}
            setThreshold={setThreshold}
            outputMode={outputMode}
            setOutputMode={setOutputMode}
            disabled={loading}
          />
          <FileUpload onFile={handleFile} disabled={loading} />
          {periods.length >= 2 && (
            <PeriodSelector
              periods={periods.map((p) => p.label)}
              selected={selectedPeriod}
              onChange={handlePeriodChange}
              disabled={loading}
            />
          )}
        </div>

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

        {rows.length > 0 && !loading && (
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <DataPreview rows={rows} threshold={threshold} />
            <WaterfallChart rows={rows} />
            <DriverRanking rows={rows} threshold={threshold} />
            {commentary && <Commentary text={commentary} />}

            {/* Download + email status */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {excelBase64 && (
                <button
                  onClick={downloadExcel}
                  style={{
                    padding: "10px 20px",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--gold)",
                    borderRadius: "2px",
                    color: "var(--gold)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--gold-dim)";
                  }}
                >
                  ↓ &nbsp;Download Annotated Excel
                </button>
              )}
              {excelBase64 && (
                <button
                  onClick={downloadPptx}
                  disabled={!pptxBase64}
                  style={{
                    padding: "10px 20px",
                    background: "var(--gold-dim)",
                    border: "1px solid var(--gold)",
                    borderRadius: "2px",
                    color: "var(--gold)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: pptxBase64 ? "pointer" : "not-allowed",
                    opacity: pptxBase64 ? 1 : 0.4,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (pptxBase64) (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--gold-dim)";
                  }}
                >
                  ↓ &nbsp;Download Slide Deck
                </button>
              )}
            </div>
          </div>
        )}

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

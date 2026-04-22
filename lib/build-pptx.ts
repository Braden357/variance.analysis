import PptxGenJS from "pptxgenjs";
import { VarianceRow, rankDrivers, isFavorable } from "./parse-file";

const DARK_BG = "0D0D14";
const GOLD = "C9A84C";
const GOLD_DIM = "92660A";
const GREEN = "1A7C45";
const RED = "B91C1C";
const TEXT_PRIMARY = "E8E8E8";
const TEXT_MUTED = "666680";
const BORDER = "2A2A3E";

const fmt = (n: number) =>
  `$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export async function buildPptx(
  rows: VarianceRow[],
  commentary: string,
  threshold: number,
  outputMode: string,
  periodLabel?: string
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
  pptx.author = "Variance Commentary Generator";

  // ── Slide 1: Title ──────────────────────────────────────────────────────────
  const slide1 = pptx.addSlide();
  slide1.background = { color: DARK_BG };

  // Gold rule top
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.04,
    fill: { color: GOLD },
    line: { color: GOLD },
  });

  // Eyebrow label
  slide1.addText("FP&A INTELLIGENCE · AI-POWERED", {
    x: 1.5, y: 1.8, w: 10.3, h: 0.3,
    fontFace: "Courier New",
    fontSize: 9,
    bold: false,
    color: GOLD,
    align: "center",
    charSpacing: 4,
  });

  // Main title
  slide1.addText("Variance Commentary", {
    x: 1.5, y: 2.2, w: 10.3, h: 1.1,
    fontFace: "Georgia",
    fontSize: 44,
    bold: true,
    color: TEXT_PRIMARY,
    align: "center",
  });

  // Period label / italic subtitle
  if (periodLabel) {
    slide1.addText(periodLabel, {
      x: 1.5, y: 3.35, w: 10.3, h: 0.6,
      fontFace: "Georgia",
      fontSize: 28,
      italic: true,
      color: GOLD,
      align: "center",
    });
  }

  // Gold divider
  slide1.addShape(pptx.ShapeType.rect, {
    x: 5.67, y: 4.1, w: 2, h: 0.02,
    fill: { color: GOLD },
    line: { color: GOLD },
  });

  // Footer meta
  slide1.addText(`${outputMode}  ·  Threshold: ${threshold}%`, {
    x: 0.4, y: 7.1, w: 12.5, h: 0.28,
    fontFace: "Courier New",
    fontSize: 8,
    color: TEXT_MUTED,
    align: "center",
  });

  // Gold rule bottom
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.46, w: "100%", h: 0.04,
    fill: { color: GOLD },
    line: { color: GOLD },
  });

  // ── Slide 2: Analysis ───────────────────────────────────────────────────────
  const slide2 = pptx.addSlide();
  slide2.background = { color: DARK_BG };

  // Gold rule top
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.04,
    fill: { color: GOLD },
    line: { color: GOLD },
  });

  // Left column label
  slide2.addText("KEY VARIANCES", {
    x: 0.4, y: 0.3, w: 5.8, h: 0.3,
    fontFace: "Courier New",
    fontSize: 9,
    bold: true,
    color: GOLD,
    charSpacing: 3,
  });

  // Right column label
  slide2.addText("COMMENTARY", {
    x: 6.8, y: 0.3, w: 6.1, h: 0.3,
    fontFace: "Courier New",
    fontSize: 9,
    bold: true,
    color: GOLD,
    charSpacing: 3,
  });

  // Vertical divider
  slide2.addShape(pptx.ShapeType.rect, {
    x: 6.5, y: 0.3, w: 0.01, h: 6.8,
    fill: { color: BORDER },
    line: { color: BORDER },
  });

  // Driver table headers
  const tableTop = 0.75;
  const colX = [0.4, 2.7, 4.1, 5.1];
  const headers = ["LINE ITEM", "VARIANCE", "%", ""];
  headers.forEach((h, i) => {
    slide2.addText(h, {
      x: colX[i], y: tableTop, w: i === 0 ? 2.2 : 1.1, h: 0.22,
      fontFace: "Courier New",
      fontSize: 7,
      color: TEXT_MUTED,
      align: i === 0 ? "left" : "right",
      charSpacing: 1,
    });
  });

  // Gold rule under headers
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 0.97, w: 5.8, h: 0.01,
    fill: { color: GOLD_DIM },
    line: { color: GOLD_DIM },
  });

  // Driver rows
  const drivers = rankDrivers(rows, 5);
  drivers.forEach((row, i) => {
    const fav = isFavorable(row);
    const color = fav ? GREEN : RED;
    const y = 1.05 + i * 0.68;

    // Row bg on alternating
    if (i % 2 === 0) {
      slide2.addShape(pptx.ShapeType.rect, {
        x: 0.38, y: y - 0.04, w: 5.84, h: 0.6,
        fill: { color: "141422" },
        line: { color: DARK_BG },
      });
    }

    // Rank
    slide2.addText(String(i + 1).padStart(2, "0"), {
      x: 0.4, y, w: 0.3, h: 0.3,
      fontFace: "Courier New",
      fontSize: 8,
      color: GOLD_DIM,
    });

    // Line item name
    const name = row.lineItem.length > 18 ? row.lineItem.slice(0, 17) + "…" : row.lineItem;
    slide2.addText(name, {
      x: 0.75, y, w: 1.85, h: 0.3,
      fontFace: "Calibri",
      fontSize: 10,
      color: TEXT_PRIMARY,
    });

    // $ variance
    slide2.addText(`${row.variance >= 0 ? "+" : "-"}${fmt(row.variance)}`, {
      x: colX[1], y, w: 1.25, h: 0.3,
      fontFace: "Courier New",
      fontSize: 10,
      bold: true,
      color,
      align: "right",
    });

    // % variance
    slide2.addText(`${row.variancePct >= 0 ? "+" : ""}${row.variancePct.toFixed(1)}%`, {
      x: colX[2], y, w: 0.9, h: 0.3,
      fontFace: "Courier New",
      fontSize: 9,
      color,
      align: "right",
    });

    // FAV / UNF badge
    slide2.addText(fav ? "FAV" : "UNF", {
      x: colX[3], y: y + 0.01, w: 0.5, h: 0.24,
      fontFace: "Courier New",
      fontSize: 7,
      bold: true,
      color,
      align: "center",
      line: { color, width: 0.5 },
    });
  });

  // Commentary text
  slide2.addText(commentary, {
    x: 6.8, y: 0.75, w: 6.1, h: 5.9,
    fontFace: "Georgia",
    fontSize: 13,
    color: TEXT_PRIMARY,
    valign: "top",
    wrap: true,
    lineSpacingMultiple: 1.6,
  });

  // Footer
  slide2.addText(`${outputMode}  ·  Threshold: ${threshold}%`, {
    x: 0.4, y: 7.1, w: 12.5, h: 0.25,
    fontFace: "Courier New",
    fontSize: 7,
    color: TEXT_MUTED,
    align: "center",
  });

  // Gold rule bottom
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.46, w: "100%", h: 0.04,
    fill: { color: GOLD },
    line: { color: GOLD },
  });

  // ── Slide 3: Variance Driver Bar Chart ────────────────────────────────────
  const slide3 = pptx.addSlide();
  slide3.background = { color: DARK_BG };

  slide3.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.04,
    fill: { color: GOLD }, line: { color: GOLD },
  });

  slide3.addText("VARIANCE DRIVERS — BUDGET vs. ACTUALS BRIDGE", {
    x: 0.4, y: 0.15, w: 12.5, h: 0.3,
    fontFace: "Courier New", fontSize: 9, bold: true,
    color: GOLD, charSpacing: 3,
  });

  const bridgeDrivers = rankDrivers(rows, 8);
  const bridgeLabels = bridgeDrivers.map(d =>
    d.lineItem.length > 18 ? d.lineItem.slice(0, 17) + "…" : d.lineItem
  );
  const bridgeValues = bridgeDrivers.map(d => Math.abs(d.variance));
  const bridgeColors = bridgeDrivers.map(d => isFavorable(d) ? GREEN : RED);

  slide3.addChart(pptx.ChartType.bar, [
    { name: "$ Variance", labels: bridgeLabels, values: bridgeValues },
  ], {
    x: 0.4, y: 0.65, w: 12.5, h: 6.1,
    barDir: "bar",
    barGrouping: "clustered",
    chartColors: bridgeColors,
    showLegend: false,
    showValue: true,
    dataLabelFontSize: 8,
    dataLabelFontColor: TEXT_PRIMARY,
    valAxisLabelFontSize: 8,
    catAxisLabelFontSize: 9,
    valAxisLabelColor: "888888",
    catAxisLabelColor: "CCCCCC",
    plotAreaFill: { color: "13131F" },
    plotAreaBorder: { color: BORDER, pt: 0.5 },
  } as Parameters<typeof slide3.addChart>[2]);

  slide3.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.46, w: "100%", h: 0.04,
    fill: { color: GOLD }, line: { color: GOLD },
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  return buffer;
}

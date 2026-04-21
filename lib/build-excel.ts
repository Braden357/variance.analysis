import ExcelJS from "exceljs";
import { VarianceRow } from "./parse-file";
import { isFavorable } from "./parse-file";

const HEADER_BG = "FFE8EAF0";
const HEADER_TEXT = "FF1A1A2E";
const GREEN_TEXT = "FF1A7C45";
const GREEN_BG = "FFE6F4ED";
const RED_TEXT = "FFB91C1C";
const RED_BG = "FFFCE8E8";
const BORDER_COLOR = "FFD0D5DD";
const ALT_ROW = "FFF9FAFB";
const FLAG_GOLD = "FF92660A";

export async function buildAnnotatedExcel(
  rows: VarianceRow[],
  commentary: string,
  threshold: number,
  outputMode: string
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Variance Commentary Generator";

  // Sheet 1: Variance Data
  const dataSheet = wb.addWorksheet("Variance Analysis");
  dataSheet.views = [{ showGridLines: false }];

  // Title row
  dataSheet.mergeCells("A1:F1");
  const titleCell = dataSheet.getCell("A1");
  titleCell.value = "Budget vs. Actuals — Variance Analysis";
  titleCell.font = { name: "Calibri", bold: true, size: 13, color: { argb: HEADER_TEXT } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  dataSheet.getRow(1).height = 32;

  // Subtitle row
  dataSheet.mergeCells("A2:F2");
  const subCell = dataSheet.getCell("A2");
  subCell.value = `Output Mode: ${outputMode}  ·  Threshold: ${threshold}%  ·  AI-Generated — review before distribution`;
  subCell.font = { name: "Calibri", size: 9, color: { argb: "FF6B7280" } };
  subCell.alignment = { horizontal: "left" };
  dataSheet.getRow(2).height = 16;

  dataSheet.getRow(3).height = 8;

  // Header row
  const headers = ["Line Item", "Budget", "Actuals", "Variance ($)", "Variance (%)", "Flag"];
  const headerRow = dataSheet.getRow(4);
  headerRow.height = 24;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: "Calibri", bold: true, size: 9, color: { argb: HEADER_TEXT } };
    cell.alignment = { horizontal: i === 0 ? "left" : "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.border = {
      bottom: { style: "medium", color: { argb: BORDER_COLOR } },
      top: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  rows.forEach((row, i) => {
    const r = dataSheet.getRow(5 + i);
    r.height = 20;
    const flagged = Math.abs(row.variancePct) >= threshold;
    const favorable = isFavorable(row);
    const rowBg = i % 2 === 0 ? "FFFFFFFF" : ALT_ROW;

    const border = { style: "hair" as const, color: { argb: BORDER_COLOR } };

    const lineCell = r.getCell(1);
    lineCell.value = row.lineItem;
    lineCell.font = { name: "Calibri", size: 10, color: { argb: HEADER_TEXT } };
    lineCell.alignment = { horizontal: "left", vertical: "middle" };
    lineCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
    lineCell.border = { bottom: border };

    const budgetCell = r.getCell(2);
    budgetCell.value = fmt(row.budget);
    budgetCell.font = { name: "Calibri", size: 10, color: { argb: "FF374151" } };
    budgetCell.alignment = { horizontal: "right", vertical: "middle" };
    budgetCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
    budgetCell.border = { bottom: border };

    const actualsCell = r.getCell(3);
    actualsCell.value = fmt(row.actuals);
    actualsCell.font = { name: "Calibri", size: 10, color: { argb: "FF374151" } };
    actualsCell.alignment = { horizontal: "right", vertical: "middle" };
    actualsCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
    actualsCell.border = { bottom: border };

    const varColor = favorable ? GREEN_TEXT : RED_TEXT;
    const varBg = favorable ? GREEN_BG : RED_BG;

    const varCell = r.getCell(4);
    varCell.value = fmt(row.variance);
    varCell.font = { name: "Calibri", bold: true, size: 10, color: { argb: varColor } };
    varCell.alignment = { horizontal: "right", vertical: "middle" };
    varCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: flagged ? varBg : rowBg } };
    varCell.border = { bottom: border };

    const pctCell = r.getCell(5);
    pctCell.value = `${row.variancePct >= 0 ? "+" : ""}${row.variancePct.toFixed(1)}%`;
    pctCell.font = { name: "Calibri", bold: true, size: 10, color: { argb: varColor } };
    pctCell.alignment = { horizontal: "right", vertical: "middle" };
    pctCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: flagged ? varBg : rowBg } };
    pctCell.border = { bottom: border };

    const flagCell = r.getCell(6);
    flagCell.value = flagged ? (favorable ? "▲ FAV" : "▼ UNF") : "";
    flagCell.font = {
      name: "Calibri",
      bold: true,
      size: 9,
      color: { argb: flagged ? (favorable ? GREEN_TEXT : FLAG_GOLD) : "FFADB5BD" },
    };
    flagCell.alignment = { horizontal: "center", vertical: "middle" };
    flagCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
    flagCell.border = { bottom: border };
  });

  dataSheet.getColumn(1).width = 28;
  dataSheet.getColumn(2).width = 14;
  dataSheet.getColumn(3).width = 14;
  dataSheet.getColumn(4).width = 14;
  dataSheet.getColumn(5).width = 12;
  dataSheet.getColumn(6).width = 9;

  // Sheet 2: Commentary
  const comSheet = wb.addWorksheet("AI Commentary");
  comSheet.views = [{ showGridLines: false }];

  comSheet.mergeCells("A1:D1");
  const comTitle = comSheet.getCell("A1");
  comTitle.value = "AI-Generated Variance Commentary";
  comTitle.font = { name: "Calibri", bold: true, size: 13, color: { argb: HEADER_TEXT } };
  comTitle.alignment = { horizontal: "left", vertical: "middle" };
  comSheet.getRow(1).height = 32;

  comSheet.mergeCells("A2:D2");
  const comMeta = comSheet.getCell("A2");
  comMeta.value = `Output Mode: ${outputMode}  ·  AI-Generated  ·  Review before distribution`;
  comMeta.font = { name: "Calibri", size: 9, color: { argb: "FF6B7280" } };
  comSheet.getRow(2).height = 16;

  comSheet.getRow(3).height = 8;

  comSheet.mergeCells("A4:D4");
  const divider = comSheet.getCell("A4");
  divider.border = { bottom: { style: "medium", color: { argb: BORDER_COLOR } } };
  comSheet.getRow(4).height = 4;

  comSheet.getRow(5).height = 8;

  comSheet.mergeCells("A6:D20");
  const comText = comSheet.getCell("A6");
  comText.value = commentary;
  comText.font = { name: "Calibri", size: 11, color: { argb: "FF1F2937" } };
  comText.alignment = { wrapText: true, vertical: "top" };
  comSheet.getRow(6).height = 200;

  comSheet.getColumn(1).width = 22;
  comSheet.getColumn(2).width = 22;
  comSheet.getColumn(3).width = 22;
  comSheet.getColumn(4).width = 22;

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

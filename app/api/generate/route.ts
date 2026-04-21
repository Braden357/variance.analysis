import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseVarianceFile } from "@/lib/parse-file";
import { buildVariancePrompt, OutputMode } from "@/lib/build-prompt";
import { buildAnnotatedExcel } from "@/lib/build-excel";

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const threshold = parseFloat((formData.get("threshold") as string) ?? "10");
  const outputMode = (formData.get("outputMode") as OutputMode) ?? "Management Report";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/octet-stream",
  ];
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
  }
  if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return NextResponse.json(
      { error: "Invalid file type. Upload an Excel (.xlsx, .xls) or CSV file." },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();
  const rows = parseVarianceFile(buffer);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Could not parse any rows. Check column headers: Line Item, Budget, Actuals." },
      { status: 400 }
    );
  }

  const prompt = buildVariancePrompt(rows, threshold, outputMode);

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content: "You are a senior FP&A analyst. Write concise, professional variance commentary. No preamble.",
      },
      { role: "user", content: prompt },
    ],
  });

  const rawCommentary = completion.choices[0].message.content ?? "";

  const humanized = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content: `You are an editor that removes AI writing patterns from financial commentary. Apply these rules:
- Replace "serves as / stands as / marks / represents" with "is/are"
- Cut: pivotal, crucial, testament, underscores, showcases, vibrant, enduring, delve, foster, landscape (abstract)
- Remove -ing tail phrases ("highlighting that...", "reflecting...", "contributing to...")
- Cut promotional puffery and significance inflation
- Remove em dashes — replace with commas or periods
- Cut filler: "In order to", "It is important to note that", "At this point in time"
- Remove rule-of-three lists; write direct sentences
- No bold formatting, no emojis, no headers
- No "Let's dive in", "Here's what you need to know", "I hope this helps"
- Vary sentence length — short and long mixed
- Keep all numbers and financial facts exactly as stated
- Output only the rewritten commentary, nothing else`,
      },
      { role: "user", content: rawCommentary },
    ],
  });

  const commentary = humanized.choices[0].message.content ?? rawCommentary;

  // Build annotated Excel
  const excelBuffer = await buildAnnotatedExcel(rows, commentary, threshold, outputMode);
  const excelBase64 = excelBuffer.toString("base64");

  return NextResponse.json({ commentary, rows, excelBase64 });
  } catch (err) {
    console.error("[generate] unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

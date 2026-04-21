import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseVarianceFile } from "@/lib/parse-file";
import { buildVariancePrompt } from "@/lib/build-prompt";

const client = new OpenAI();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const rows = parseVarianceFile(buffer);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Could not parse any rows. Check column headers: Line Item, Budget, Actuals." },
      { status: 400 }
    );
  }

  const prompt = buildVariancePrompt(rows);

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content:
          "You are a senior FP&A analyst. Write concise, professional variance commentary. No preamble.",
      },
      { role: "user", content: prompt },
    ],
  });

  const commentary = completion.choices[0].message.content ?? "";

  return NextResponse.json({ commentary, rows });
}

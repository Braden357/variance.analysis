import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import { parseVarianceFile } from "@/lib/parse-file";
import { buildVariancePrompt, OutputMode } from "@/lib/build-prompt";
import { buildAnnotatedExcel } from "@/lib/build-excel";

const client = new OpenAI();

async function sendGmail(to: string, subject: string, html: string, xlsxBase64: string) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob"
  );
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_FROM,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken as string,
    },
  });

  await transporter.sendMail({
    from: `"Variance Commentary" <${process.env.GMAIL_FROM}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: "variance-analysis.xlsx",
        content: Buffer.from(xlsxBase64, "base64"),
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const threshold = parseFloat((formData.get("threshold") as string) ?? "10");
  const outputMode = (formData.get("outputMode") as OutputMode) ?? "Management Report";
  const email = (formData.get("email") as string) ?? "";

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

  // Send email via Gmail if provided and credentials configured
  let emailSent = false;
  let emailError = "";
  const gmailReady = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_FROM;
  if (email && gmailReady) {
    try {
      const html = `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #09090e; color: #e8e6df; padding: 40px; border-radius: 4px;">
          <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: #c9a84c; margin-bottom: 20px; text-transform: uppercase;">
            FP&amp;A Intelligence · ${outputMode}
          </div>
          <h2 style="font-size: 20px; color: #e8e6df; margin: 0 0 20px; font-weight: 400;">Variance Commentary</h2>
          <div style="border-left: 3px solid #c9a84c; padding-left: 20px; margin-bottom: 32px;">
            <p style="line-height: 1.85; color: #e8e6df; margin: 0;">${commentary}</p>
          </div>
          <p style="font-family: monospace; font-size: 10px; color: #44445a; text-transform: uppercase; letter-spacing: 0.08em;">
            AI-Generated · Review before distribution · Annotated Excel attached
          </p>
        </div>
      `;
      await sendGmail(email, `Variance Commentary — ${outputMode}`, html, excelBase64);
      emailSent = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Email delivery failed";
    }
  }

  return NextResponse.json({ commentary, rows, excelBase64, emailSent, emailError });
  } catch (err) {
    console.error("[generate] unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

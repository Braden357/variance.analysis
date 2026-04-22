import { NextRequest, NextResponse } from "next/server";
import { detectPeriods } from "@/lib/parse-file";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ periods: [] });

    const buffer = await file.arrayBuffer();
    const periods = detectPeriods(buffer);
    return NextResponse.json({ periods });
  } catch {
    return NextResponse.json({ periods: [] });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { loadS3IntoPinecone } from "@/lib/pinecone";

export const runtime = "nodejs"; // ✅ Not edge

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file_key } = body;

    if (!file_key) {
      return NextResponse.json({ error: "file_key is required" }, { status: 400 });
    }

    console.log("⏳ Processing file:", file_key);
    await loadS3IntoPinecone(file_key);
    console.log("✅ Finished processing:", file_key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing file:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

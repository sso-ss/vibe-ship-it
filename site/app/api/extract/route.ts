import { NextRequest, NextResponse } from "next/server";
import { extractDesignTokens } from "../../actions";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await extractDesignTokens(url);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong during extraction." },
      { status: 500 }
    );
  }
}

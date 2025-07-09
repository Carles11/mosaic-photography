import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Test environment endpoint",
    timestamp: new Date().toISOString(),
  });
}

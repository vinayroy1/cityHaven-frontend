import { NextResponse, type NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  // Google Places details has been disabled to eliminate recurring API billing.
  return NextResponse.json({ result: null });
}

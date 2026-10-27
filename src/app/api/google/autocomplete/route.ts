import { NextResponse, type NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  // Google Places autocomplete has been disabled to prevent recurring API billing.
  // Use Awasio Suggestion Engine (/v1/search/suggestions) instead.
  return NextResponse.json({ predictions: [] });
}

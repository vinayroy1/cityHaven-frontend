import { NextResponse, type NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  // Google reverse geocoding has been disabled to eliminate recurring API billing.
  // Use /api/geo/reverse-city for local database reverse geocoding.
  return NextResponse.json({ error: "Google reverse geocoding is disabled" }, { status: 404 });
}

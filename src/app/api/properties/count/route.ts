import { NextResponse } from "next/server";

export const revalidate = 86400; // Cache for 24 hours (24 * 60 * 60)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityName = searchParams.get("cityName");
  const listingType = searchParams.get("listingType") || "SELL";

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const API_BASE = rawApiUrl.replace(/\/api$/, "");

  try {
    // We only need the total count, so pageSize=1 is sufficient
    const backendUrl = new URL(`${API_BASE}/api/v1/propertyListing/search`);
    backendUrl.searchParams.set("pageSize", "1");
    backendUrl.searchParams.set("listingType", listingType);
    
    if (cityName) {
      backendUrl.searchParams.set("cityName", cityName);
    }

    const res = await fetch(backendUrl.toString(), {
      next: { revalidate: 86400 }, // Cache the backend response for 24 hours
    });

    if (!res.ok) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const data = await res.json();
    
    // Most pagination/search endpoints return a `total` field
    const count = data.data?.total || 0;
    
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch property count:", error);
    return NextResponse.json({ count: 0 }, { status: 200 }); // Graceful fallback
  }
}

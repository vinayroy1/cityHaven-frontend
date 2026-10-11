import { NextResponse } from "next/server";
import { getServerProjects, saveServerProject } from "@/data/projectsData";
import type { ProjectListing } from "@/types/project.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase().trim() || "";
    const city = searchParams.get("city")?.toLowerCase().trim() || "";
    const status = searchParams.get("status")?.toUpperCase().trim() || "";
    const bhk = searchParams.get("bhk")?.toLowerCase().trim() || "";
    const maxPrice = Number(searchParams.get("maxPrice")) || 0;
    const sortBy = searchParams.get("sortBy") || "featured";

    let projects = getServerProjects();

    // Query filter
    if (q) {
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.developerName.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    // City filter
    if (city && city !== "all") {
      projects = projects.filter((p) => p.city.toLowerCase().includes(city));
    }

    // Construction status filter
    if (status && status !== "ALL") {
      projects = projects.filter((p) => p.status === status);
    }

    // BHK filter
    if (bhk && bhk !== "all") {
      projects = projects.filter((p) =>
        p.configurations.some((c) => c.bhkType.toLowerCase().includes(bhk))
      );
    }

    // Max Budget filter
    if (maxPrice > 0) {
      projects = projects.filter((p) => p.priceMin <= maxPrice);
    }

    // Sort order
    if (sortBy === "price_asc") {
      projects.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sortBy === "price_desc") {
      projects.sort((a, b) => b.priceMin - a.priceMin);
    }

    return NextResponse.json({
      success: true,
      total: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("GET /api/projects error", error);
    return NextResponse.json(
      { success: false, message: "Failed to search projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: ProjectListing = await request.json();

    if (!body.name || !body.developerName || !body.reraId || !body.city || !body.locality) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed: Project Name, Developer, RERA ID, City and Locality are mandatory.",
        },
        { status: 400 }
      );
    }

    saveServerProject(body);

    return NextResponse.json({
      success: true,
      message: "Project published successfully to master project directory",
      data: body,
    });
  } catch (error) {
    console.error("POST /api/projects error", error);
    return NextResponse.json(
      { success: false, message: "Failed to publish project listing" },
      { status: 500 }
    );
  }
}

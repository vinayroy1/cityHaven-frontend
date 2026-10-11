import { NextResponse } from "next/server";
import { getServerProjects } from "@/data/projectsData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const projects = getServerProjects();
    const project = projects.find((p) => p.slug === slug || p.id === slug);

    if (!project) {
      return NextResponse.json(
        { success: false, message: `Project with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("GET /api/projects/[slug] error", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}

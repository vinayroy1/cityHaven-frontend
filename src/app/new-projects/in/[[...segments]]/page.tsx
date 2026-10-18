import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ segments?: string[] }> };

export default async function LegacyProjectsRedirect({ params }: Props) {
  const { segments = [] } = await params;
  if (!segments.length) {
    permanentRedirect("/new-projects");
  }
  permanentRedirect(`/new-projects/${segments.join("/")}`);
}

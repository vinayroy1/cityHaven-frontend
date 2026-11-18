import type { Metadata } from "next";
import { StaysDirectory } from "./StaysDirectory";
import { getInitialPage, staysMetadata } from "./serverData";


export async function generateMetadata(): Promise<Metadata> {
  return staysMetadata("", "/stays");
}

// Old ?city= / ?locality= links are moved to the path URL by src/proxy.ts (a real 308), so this
// page doesn't read the query string and stays cacheable (ISR + Cloudflare).
export const revalidate = 300;

export default async function StaysPage() {
  const initialPage = await getInitialPage("", "");
  return <StaysDirectory initialPage={initialPage} />;
}

import { IntentSearchRoute, metadataForIntentSearch } from "@/app/searchRoutePage";

export const revalidate = 60;

// Pages are rendered on first visit, then cached (ISR) — without this the route is fully dynamic.
export function generateStaticParams() {
  return [];
}
export const generateMetadata = metadataForIntentSearch;
export default IntentSearchRoute;

import { IntentSearchRoute, metadataForIntentSearch } from "@/app/searchRoutePage";

export const revalidate = 60;
export const generateMetadata = metadataForIntentSearch;
export default IntentSearchRoute;

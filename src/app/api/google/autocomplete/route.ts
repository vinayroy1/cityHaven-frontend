import { NextResponse, type NextRequest } from "next/server";

type GoogleAutocompleteResponse = {
  predictions?: GooglePrediction[];
  status?: string;
  error_message?: string;
};

type GooglePrediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
  };
  types?: string[];
};

const PLACE_TYPE_PRIORITY = [
  "locality",
  "sublocality",
  "sublocality_level_1",
  "neighborhood",
  "administrative_area_level_3",
  "administrative_area_level_2",
  "administrative_area_level_1",
  "postal_code",
];

const fallbackPriority = (prediction: GooglePrediction) => {
  const types = prediction.types ?? [];
  if (types.includes("route")) return 1;
  return 0;
};

const exactPriority = (prediction: GooglePrediction, input: string) => {
  const query = input.trim().toLowerCase();
  const mainText = prediction.structured_formatting?.main_text?.toLowerCase() ?? "";
  const description = prediction.description.toLowerCase();

  return mainText === query || description === `${query}, india` ? 0 : 1;
};

const textPriority = (prediction: GooglePrediction, input: string) => {
  const query = input.trim().toLowerCase();
  const mainText = prediction.structured_formatting?.main_text?.toLowerCase() ?? "";
  const description = prediction.description.toLowerCase();

  if (mainText.startsWith(query)) return 1;
  if (description.startsWith(query)) return 2;
  if (mainText.includes(query)) return 3;
  return 4;
};

const placePriority = (prediction: GooglePrediction) => {
  const types = prediction.types ?? [];
  const index = PLACE_TYPE_PRIORITY.findIndex((type) => types.includes(type));
  return index === -1 ? PLACE_TYPE_PRIORITY.length : index;
};

const sortPredictions = (predictions: GooglePrediction[], input: string) =>
  [...predictions].sort(
    (a, b) =>
      exactPriority(a, input) - exactPriority(b, input) ||
      fallbackPriority(a) - fallbackPriority(b) ||
      placePriority(a) - placePriority(b) ||
      textPriority(a, input) - textPriority(b, input),
  );

const fetchAutocomplete = async (key: string, input: string, types: string, sessionToken: string | null) => {
  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", input);
  url.searchParams.set("types", types);
  url.searchParams.set("components", "country:in");
  if (sessionToken) url.searchParams.set("sessiontoken", sessionToken);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return { error: "Failed to fetch suggestions", status: res.status };
  }

  const data = (await res.json()) as GoogleAutocompleteResponse;
  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return {
      error: data.error_message || `Google Places autocomplete failed: ${data.status}`,
      status: 502,
    };
  }

  return { predictions: data.predictions ?? [] };
};

export async function GET(req: NextRequest) {
  const key = process.env.G_SECRET || process.env.NEXT_PUBLIC_G_SECRET;
  if (!key) {
    return NextResponse.json({ error: "Google API key missing (G_SECRET)" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");
  const sessionToken = searchParams.get("sessionToken");

  if (!input || input.trim().length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const regionResults = await fetchAutocomplete(key, input, "(regions)", sessionToken);
  if (regionResults.error) {
    return NextResponse.json({ error: regionResults.error }, { status: regionResults.status });
  }

  const regionPredictions = regionResults.predictions ?? [];
  if (regionPredictions.length > 0) {
    return NextResponse.json({ predictions: sortPredictions(regionPredictions, input) });
  }

  const fallbackResults = await fetchAutocomplete(key, input, "geocode", sessionToken);
  if (fallbackResults.error) {
    return NextResponse.json({ error: fallbackResults.error }, { status: fallbackResults.status });
  }

  return NextResponse.json({ predictions: sortPredictions(fallbackResults.predictions ?? [], input) });
}

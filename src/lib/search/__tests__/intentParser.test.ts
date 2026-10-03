import { generateIntentSuggestions } from "../intentParser";
import { resolveMetroCluster } from "@/config/regionalClusters";

const cluster = resolveMetroCluster("Delhi", "IN");

describe("generateIntentSuggestions", () => {
  it("does not turn a plain city query in Commercial tab into an office-only intent", () => {
    expect(generateIntentSuggestions("Delhi", "COMMERCIAL", cluster)).toEqual([]);
  });

  it("still suggests commercial intents for explicit office queries", () => {
    const suggestions = generateIntentSuggestions("office in Delhi", "COMMERCIAL", cluster);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].params.intent).toBe("COMMERCIAL");
  });
});

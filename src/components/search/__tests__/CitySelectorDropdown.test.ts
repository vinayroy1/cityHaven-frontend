import { canonicalizeCity, dedupeCities, type CityItem } from "../CitySelectorDropdown";

describe("CitySelectorDropdown city normalization", () => {
  it("merges Delhi and duplicate New Delhi API records", () => {
    const cities: CityItem[] = [
      { id: 1, name: "Delhi", slug: "delhi", state: "Delhi" },
      { id: 2, name: "New Delhi", slug: "new-delhi", state: "Delhi" },
      { id: 3, name: "New Delhi", slug: "new-delhi-duplicate", state: "Delhi" },
    ];

    expect(dedupeCities(cities)).toEqual([
      { id: 1, name: "New Delhi", slug: "new-delhi", state: "Delhi" },
    ]);
  });

  it("normalizes other legacy city aliases", () => {
    expect(canonicalizeCity({ id: 4, name: "Gurgaon", slug: "gurgaon" })).toMatchObject({
      name: "Gurugram",
      slug: "gurugram",
      state: "Haryana",
    });
    expect(canonicalizeCity({ id: 5, name: "Bangalore", slug: "bangalore" })).toMatchObject({
      name: "Bengaluru",
      slug: "bengaluru",
      state: "Karnataka",
    });
  });
});

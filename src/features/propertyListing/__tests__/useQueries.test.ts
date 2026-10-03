import { normalizePage } from "../useQueries";

describe("normalizePage", () => {
  it("unwraps backend search responses with data.items", () => {
    const page = normalizePage({
      data: {
        items: [
          {
            id: 107,
            title: "Commercial Office Floor for Sale in Jasola District Centre, Delhi",
            cityName: "New Delhi",
            resCom: "COMMERCIAL",
          },
          {
            id: 52,
            title: "Retail Shop for Sale in Connaught Place, New Delhi",
            cityName: "New Delhi",
            resCom: "COMMERCIAL",
          },
        ],
        total: 2,
        hasMore: false,
        nextCursor: null,
      },
    });

    expect(page.items).toHaveLength(2);
    expect(page.items[0].id).toBe(107);
    expect(page.total).toBe(2);
    expect(page.nextCursor).toBeNull();
  });
});

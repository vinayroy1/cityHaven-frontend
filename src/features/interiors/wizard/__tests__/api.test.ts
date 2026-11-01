import { configureStore } from "@reduxjs/toolkit";

const calls: { url: string; method?: string; body?: unknown }[] = [];
let patchStatus = 404;

jest.mock("@/lib/api/baseQueryWithReauth", () => ({
  baseQueryWithReauth: async (args: { url: string; method?: string; body?: unknown }) => {
    calls.push(args);
    if (args.method === "PATCH") {
      return patchStatus === 200
        ? { data: { success: true, data: { id: 1, displayName: "Patched" } } }
        : { error: { status: patchStatus, data: { success: false, message: "x", fieldErrors: { "identity.about": "Too short" } } } };
    }
    if (args.method === "POST") return { data: { success: true, data: { id: 1, ...(args.body as object) } } };
    return { data: { success: true, data: { id: 1, displayName: "Old", branches: [{ id: 9 }] } } };
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { interiorsApi, __resetSectionPatchFallback, parseInteriorApiError } = require("../../api") as typeof import("../../api");

const makeStore = () =>
  configureStore({
    reducer: { [interiorsApi.reducerPath]: interiorsApi.reducer },
    middleware: (gdm) => gdm({ serializableCheck: false }).concat(interiorsApi.middleware),
  });

beforeEach(() => {
  calls.length = 0;
  __resetSectionPatchFallback();
});

test("PATCH 404 falls back to the legacy save once, then skips PATCH", async () => {
  patchStatus = 404;
  const store = makeStore();
  await store.dispatch(interiorsApi.endpoints.getMyInteriorProfile.initiate());
  const res = await store.dispatch(
    interiorsApi.endpoints.patchMyInteriorSection.initiate({ section: "identity", data: { displayName: "New" }, wizardStep: 2 }),
  );
  expect(res.error).toBeUndefined();
  const post = calls.find((c) => c.method === "POST")!;
  expect(post.url).toMatch(/\/interiors\/me$/);
  expect(post.body).toMatchObject({ displayName: "New", wizardStep: 2 });
  expect(post.body).not.toHaveProperty("branches");

  calls.length = 0;
  await store.dispatch(interiorsApi.endpoints.patchMyInteriorSection.initiate({ section: "services", data: {} }));
  expect(calls.some((c) => c.method === "PATCH")).toBe(false);
});

test("PATCH success sends {data, wizardStep} and updates the cached profile", async () => {
  patchStatus = 200;
  const store = makeStore();
  await store.dispatch(interiorsApi.endpoints.getMyInteriorProfile.initiate());
  await store.dispatch(interiorsApi.endpoints.patchMyInteriorSection.initiate({ section: "identity", data: { displayName: "New" }, wizardStep: 1 }));
  const patch = calls.find((c) => c.method === "PATCH")!;
  expect(patch.url).toMatch(/\/interiors\/me\/sections\/identity$/);
  expect(patch.body).toEqual({ data: { displayName: "New" }, wizardStep: 1 });
  const cached = interiorsApi.endpoints.getMyInteriorProfile.select()(store.getState() as never).data;
  expect(cached?.displayName).toBe("Patched");
  expect(cached?.branches).toEqual([{ id: 9 }]);
});

test("422 surfaces fieldErrors", async () => {
  patchStatus = 422;
  const store = makeStore();
  const res = await store.dispatch(interiorsApi.endpoints.patchMyInteriorSection.initiate({ section: "identity", data: {} }));
  expect(parseInteriorApiError(res.error).fieldErrors).toEqual({ "identity.about": "Too short" });
});

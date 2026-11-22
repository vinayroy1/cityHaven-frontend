"use client";

/**
 * Staff data entry for project sales contacts. Lists projects that have no sales phone and/or email
 * (mostly RERA-register imports). Staff search the web for the real number, type it in the row and save:
 * it goes straight to the Project record, so the project page and "View Contact" show it immediately.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";
import {
  adminApi,
  type AdminProjectContactList,
  type AdminProjectContactRow,
} from "@/features/admin/api";
import { projectDetailPath } from "@/app/new-projects/lib/projectUrls";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "any", label: "Missing phone or email", stat: "missingAny" },
  { id: "both", label: "Missing both", stat: "missingBoth" },
  { id: "phone", label: "Missing phone", stat: "missingPhone" },
  { id: "email", label: "Missing email", stat: "missingEmail" },
] as const;

const MAX_PHONES = 6;
const digits = (s: string) => s.replace(/\D/g, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Draft = { phones: string[]; email: string };
const draftOf = (r: AdminProjectContactRow): Draft => ({
  phones: [r.salesPhone || "", ...(r.salesPhones || [])].filter(Boolean).length
    ? [r.salesPhone || "", ...(r.salesPhones || [])].filter(Boolean)
    : [""],
  email: r.salesEmail || "",
});
const cleanPhones = (d: Draft) => d.phones.map((p) => p.trim()).filter(Boolean);
const googleUrl = (r: AdminProjectContactRow) =>
  `https://www.google.com/search?q=${encodeURIComponent([r.developerName, r.name, r.cityName, "sales contact number"].filter(Boolean).join(" "))}`;

export default function AdminProjectContactsPage() {
  const [filter, setFilter] = useState<string>("any");
  const [city, setCity] = useState("");
  const [developer, setDeveloper] = useState("");
  const [qDraft, setQDraft] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminProjectContactList | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const listTop = useRef<HTMLDivElement>(null);

  // Search box applies after a short pause.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ((cur) => {
        if (cur !== qDraft.trim()) setPage(1);
        return qDraft.trim();
      });
    }, 400);
    return () => clearTimeout(t);
  }, [qDraft]);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams({
      filter,
      page: String(page),
      pageSize: "25",
    });
    if (city) params.set("city", city);
    if (developer) params.set("developer", developer);
    if (q) params.set("q", q);
    adminApi
      .listProjectContacts(params.toString())
      .then((res) => {
        if (!alive) return;
        setData(res);
        setDrafts(Object.fromEntries(res.items.map((r) => [r.id, draftOf(r)])));
        setSaved({});
      })
      .catch(
        (e) =>
          alive &&
          toast.error(
            e instanceof Error ? e.message : "Couldn't load projects",
          ),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [filter, city, developer, q, page, tick]);

  const reload = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  const change = (fn: () => void) => {
    setLoading(true);
    setPage(1);
    fn();
  };

  const setDraft = (id: number, fn: (d: Draft) => Draft) => {
    setSaved((s) => ({ ...s, [id]: false }));
    setDrafts((all) => ({
      ...all,
      [id]: fn(all[id] ?? { phones: [""], email: "" }),
    }));
  };

  const save = async (row: AdminProjectContactRow) => {
    const d = drafts[row.id];
    if (!d) return;
    const phones = cleanPhones(d);
    for (const p of phones) {
      const n = digits(p).length;
      if (n < 8 || n > 15)
        return toast.error(`"${p}" is not a valid phone number`);
    }
    const email = d.email.trim();
    if (email && !EMAIL_RE.test(email))
      return toast.error(`"${email}" is not a valid email`);
    setSaving((s) => ({ ...s, [row.id]: true }));
    try {
      const updated = await adminApi.saveProjectContact(row.id, {
        salesPhones: phones,
        salesEmail: email,
      });
      setData((cur) =>
        cur
          ? {
              ...cur,
              items: cur.items.map((r) =>
                r.id === row.id ? { ...r, ...updated } : r,
              ),
            }
          : cur,
      );
      setDrafts((all) => ({ ...all, [row.id]: draftOf(updated) }));
      setSaved((s) => ({ ...s, [row.id]: true }));
      toast.success(`Saved ${row.name}`);
    } catch (e) {
      toast.error(
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Couldn't save",
      );
    } finally {
      setSaving((s) => ({ ...s, [row.id]: false }));
    }
  };

  /** Same builder usually has one sales desk: copy this row's entries to the other rows of that builder on this page. */
  const copyToDeveloper = (row: AdminProjectContactRow) => {
    const d = drafts[row.id];
    if (!d || !row.developerName) return;
    const others = (data?.items ?? []).filter(
      (r) => r.id !== row.id && r.developerName === row.developerName,
    );
    if (!others.length)
      return toast.info("No other projects of this builder on this page");
    setDrafts((all) => {
      const next = { ...all };
      for (const o of others)
        next[o.id] = {
          phones: d.phones.length ? [...d.phones] : [""],
          email: d.email,
        };
      return next;
    });
    setSaved((s) => ({
      ...s,
      ...Object.fromEntries(others.map((o) => [o.id, false])),
    }));
    toast.success(
      `Copied to ${others.length} more. Press Save on each to store.`,
    );
  };

  const stats = data?.stats;
  const items = useMemo(() => data?.items ?? [], [data]);
  const dirty = useMemo(() => {
    const out: Record<number, boolean> = {};
    for (const r of items) {
      const d = drafts[r.id];
      if (!d) continue;
      const base = draftOf(r);
      out[r.id] =
        JSON.stringify([cleanPhones(d), d.email.trim()]) !==
        JSON.stringify([cleanPhones(base), base.email.trim()]);
    }
    return out;
  }, [items, drafts]);

  const sel =
    "h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Project contacts
          </h1>
          <p className="text-sm text-slate-500">
            Projects with no sales phone or email. Use the Google button to find
            the real contact, type it in, then Save. Saved contacts go live on
            the project page straight away.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />{" "}
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["All projects", stats.totalProjects],
            ["Missing phone", stats.missingPhone],
            ["Missing email", stats.missingEmail],
            ["Missing both", stats.missingBoth],
          ].map(([label, n]) => (
            <div
              key={label as string}
              className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {(n as number).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => filter !== f.id && change(() => setFilter(f.id))}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              filter === f.id
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-300 dark:border-slate-700",
            )}
          >
            {f.label}{" "}
            {stats && (
              <span className="opacity-70">
                {(stats[f.stat] as number).toLocaleString("en-IN")}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            placeholder="Search project, builder or RERA number"
            className={cn(sel, "w-full pl-8")}
          />
        </div>
        <select
          value={city}
          onChange={(e) => change(() => setCity(e.target.value))}
          className={sel}
          aria-label="City"
        >
          <option value="">All cities</option>
          {(data?.cities ?? []).map((c) => (
            <option key={c.city} value={c.city}>
              {c.city} ({c.count})
            </option>
          ))}
        </select>
        {developer && (
          <button
            type="button"
            onClick={() => change(() => setDeveloper(""))}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-rose-50 px-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          >
            Builder: {developer} <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div ref={listTop} />
      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !items.length ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
          Nothing to fill here. 🎉
        </p>
      ) : (
        <ul className={cn("space-y-3", loading && "opacity-60")}>
          {items.map((r) => {
            const d = drafts[r.id] ?? { phones: [""], email: "" };
            const isDirty = dirty[r.id];
            const sameDev = r.developerName
              ? items.filter(
                  (o) => o.id !== r.id && o.developerName === r.developerName,
                ).length
              : 0;
            return (
              <li
                key={r.id}
                className={cn(
                  "rounded-xl border bg-white p-4 dark:bg-slate-900",
                  saved[r.id]
                    ? "border-emerald-400"
                    : isDirty
                      ? "border-amber-400"
                      : "border-slate-200 dark:border-slate-800",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {r.name}
                      </span>
                      {saved[r.id] && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <Check className="h-3 w-3" /> Saved
                        </span>
                      )}
                      {!saved[r.id] && isDirty && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          Unsaved
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {r.developerName ? (
                        <button
                          type="button"
                          onClick={() =>
                            change(() => setDeveloper(r.developerName!))
                          }
                          className="font-medium text-slate-700 underline-offset-2 hover:underline dark:text-slate-300"
                          title="Show only this builder's projects"
                        >
                          {r.developerName}
                        </button>
                      ) : (
                        "Builder unknown"
                      )}
                      {" · "}
                      {[r.locality, r.cityName, r.stateName]
                        .filter(Boolean)
                        .join(", ")}
                      {r.reraId && (
                        <>
                          {" · "}
                          <span className="font-mono">{r.reraId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={googleUrl(r)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <Search className="h-3.5 w-3.5" /> Google it
                    </a>
                    {r.slug && (
                      <a
                        href={projectDetailPath({ slug: r.slug })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Page
                      </a>
                    )}
                  </div>
                </div>

                <form
                  className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save(r);
                  }}
                >
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5" /> Sales numbers{" "}
                      {!cleanPhones(d).length && (
                        <span className="font-normal text-rose-500">
                          · missing
                        </span>
                      )}
                    </label>
                    {d.phones.map((p, i) => (
                      <div key={i} className="flex gap-1.5">
                        <input
                          value={p}
                          inputMode="tel"
                          onChange={(e) =>
                            setDraft(r.id, (x) => ({
                              ...x,
                              phones: x.phones.map((v, j) =>
                                j === i ? e.target.value : v,
                              ),
                            }))
                          }
                          placeholder={
                            i === 0
                              ? "Main sales number, e.g. +91 98300 12345"
                              : "Another number"
                          }
                          className={cn(sel, "w-full")}
                        />
                        {d.phones.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove number"
                            onClick={() =>
                              setDraft(r.id, (x) => ({
                                ...x,
                                phones: x.phones.filter((_, j) => j !== i),
                              }))
                            }
                            className="rounded-lg border border-slate-300 px-2 text-slate-500 hover:text-rose-600 dark:border-slate-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {d.phones.length < MAX_PHONES && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft(r.id, (x) => ({
                            ...x,
                            phones: [...x.phones, ""],
                          }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add another number
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <Mail className="h-3.5 w-3.5" /> Email{" "}
                      {!d.email.trim() && (
                        <span className="font-normal text-rose-500">
                          · missing
                        </span>
                      )}
                    </label>
                    <input
                      value={d.email}
                      type="email"
                      onChange={(e) =>
                        setDraft(r.id, (x) => ({ ...x, email: e.target.value }))
                      }
                      placeholder="sales@builder.com"
                      className={cn(sel, "w-full")}
                    />
                  </div>

                  <div className="flex flex-col justify-end gap-1.5">
                    <button
                      type="submit"
                      disabled={saving[r.id] || !isDirty}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving[r.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}{" "}
                      Save
                    </button>
                    {sameDev > 0 && (
                      <button
                        type="button"
                        onClick={() => copyToDeveloper(r)}
                        className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        <Copy className="h-3 w-3" /> Copy to {sameDev} same
                        builder
                      </button>
                    )}
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-slate-500">
            {data.total.toLocaleString("en-IN")} projects · page {data.page} of{" "}
            {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((p) => p - 1);
                listTop.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              type="button"
              disabled={page >= data.totalPages || loading}
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
                listTop.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

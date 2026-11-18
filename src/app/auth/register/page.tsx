import { redirect } from "next/navigation";

/** Old register link: open the login page in sign-up mode and keep where the visitor came from. */
export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ mode: "signup" });
  for (const key of ["redirect", "ref", "email"]) {
    const v = sp[key];
    if (typeof v === "string" && v) qs.set(key, v);
  }
  redirect(`/login?${qs}`);
}

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "signup");
    const ref = searchParams.get("ref");
    if (ref) {
      try {
        localStorage.setItem("awasio_referral_code", ref.trim());
      } catch {
        // ignore localStorage errors in private browsing
      }
    }
    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Redirecting to Awasio signup...
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      }
    >
      <SignupRedirect />
    </Suspense>
  );
}

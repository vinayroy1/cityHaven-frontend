import React from "react";
import Link from "next/link";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { FooterLinks } from "@/app/homePage/components/FooterLinks";
import { Home, Search, Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-150">
      <HeaderNav />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-3xl shadow-sm border border-blue-100 dark:border-blue-900/50">
            404
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Page Not Found
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The property or page you are looking for does not exist, has been moved, or is temporarily unavailable.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium shadow-sm transition"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
            <Link
              href="/new-projects"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 text-sm font-medium shadow-sm transition"
            >
              <Building2 className="w-4 h-4" />
              Explore Projects
            </Link>
          </div>
        </div>
      </main>
      <FooterLinks />
    </div>
  );
}

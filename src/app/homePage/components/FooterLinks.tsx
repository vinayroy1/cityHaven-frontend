import React from "react";

const columns = [
  { title: "Support", links: ["Help Centre", "Safety information", "Cancellation options", "Report concern"] },
  { title: "Hosting", links: ["List your home", "Host resources", "Community forum", "Responsible hosting"] },
  { title: "CityHaven", links: ["Careers", "Newsroom", "Investors", "Emergency stays"] },
];

export function FooterLinks() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-200">CH</span>
            <span className="tracking-tight">CityHaven</span>
          </div>
          <p className="text-sm text-slate-600">Clean, host-led stays and verified homes across top Indian cities.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-slate-900">{col.title}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              {col.links.map((link) => (
                <a key={link} className="hover:text-red-500" href="#">
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} CityHaven. Crafted for modern stays.</div>
    </footer>
  );
}

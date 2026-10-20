import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogEditor from "../components/BlogEditor";

export default function NewBlogPostPage() {
  return <div className="mx-auto max-w-7xl"><div className="mb-5"><Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600"><ArrowLeft className="h-4 w-4" />Blog studio</Link><h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Create an article</h1><p className="mt-1 text-sm text-slate-500">Build a structured story that works beautifully on every screen.</p></div><BlogEditor /></div>;
}

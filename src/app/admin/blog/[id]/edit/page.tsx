"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useGetAdminBlogPostQuery } from "@/features/blog/api";
import BlogEditor from "../../components/BlogEditor";

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetAdminBlogPostQuery(Number(params.id), { skip: !Number(params.id) });
  if (isLoading) return <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-rose-500" /></div>;
  if (isError || !data) return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950"><h1 className="font-bold">Article not found</h1><Link href="/admin/blog" className="mt-3 inline-block text-sm font-bold text-rose-600">Return to blog studio</Link></div>;
  return <div className="mx-auto max-w-7xl"><div className="mb-5"><Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600"><ArrowLeft className="h-4 w-4" />Blog studio</Link><h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Edit article</h1><p className="mt-1 text-sm text-slate-500">Last updated {new Date(data.updatedAt).toLocaleString("en-IN")}</p></div><BlogEditor post={data} /></div>;
}

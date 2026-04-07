"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

type BlogReferenceItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedLabel: string;
  readingTimeMinutes: number;
};

export function BlogReferencesSection() {
  const [articles, setArticles] = useState<BlogReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog/reference");
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) setArticles(Array.isArray(json.articles) ? (json.articles as BlogReferenceItem[]) : []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 rounded-xl bg-violet-500/15 p-2 text-violet-700 shrink-0">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-stone-800">Referințe din blog</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Articole practice de co-parenting, disponibile direct în aplicație.
            </p>
          </div>
        </div>
        <Link
          href="/blog"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 transition"
        >
          Vezi tot blogul
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <p className="text-xs text-stone-500">Se încarcă articolele…</p>
      ) : articles.length === 0 ? (
        <p className="text-xs text-stone-500">Nu am putut încărca articolele momentan.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug} className="rounded-[1rem] border border-violet-100 bg-white/80 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-stone-400">
                {article.category} · {article.publishedLabel} · {article.readingTimeMinutes} min
              </p>
              <Link
                href={`/blog/${article.slug}`}
                className="mt-1 block text-sm font-medium text-stone-900 hover:text-violet-700 hover:underline"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{article.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

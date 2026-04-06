import Link from "next/link";
import { getAllBlogArticles } from "@/content/blog";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";

export function LandingBlogPreview() {
  const latestArticles = getAllBlogArticles().slice(0, 3);

  return (
    <section id="blog" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-[#d8c7b6] bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-stone-600">
              Blog HomeSplit
            </span>
            <h2 className="landing-display mt-6 max-w-xl text-4xl text-stone-900 sm:text-5xl">
              Resurse zilnice pentru co-parenting, reglare și activități
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
              Construim un blog public, în română, cu articole relevante pentru familii care trec prin separare,
              handover-uri, schimbări de rutină sau zile grele emoțional. Fiecare articol pornește din surse
              psihologice și pediatrice credibile, nu din texte generice de marketing.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.06)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Ce vei găsi aici</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Co-parenting", "Emoții & siguranță", "Rutine & tranziții", "Activități & conectare"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#e5d4c4] bg-[#faf3eb] px-3 py-1.5 text-sm font-semibold text-stone-700"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Publicăm articole scurte, aplicate și clare, gândite pentru părinți care au nevoie de idei practice, nu
              de teorie fără folos.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center rounded-full bg-[#1f3a36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172c2a]"
            >
              Vezi toate articolele
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <BlogArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

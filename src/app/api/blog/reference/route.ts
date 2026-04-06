import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllBlogArticles, formatBlogDate } from "@/content/blog";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const articles = getAllBlogArticles()
    .slice(0, 4)
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      category: article.category.title,
      publishedAt: article.publishedAt,
      publishedLabel: formatBlogDate(article.publishedAt),
      readingTimeMinutes: article.readingTimeMinutes,
    }));

  return NextResponse.json({ articles });
}

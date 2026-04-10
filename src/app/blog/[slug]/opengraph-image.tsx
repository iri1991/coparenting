import { ImageResponse } from "next/og";
import { getBlogArticleBySlug, getAllBlogArticles } from "@/content/blog";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export function generateStaticParams() {
  return getAllBlogArticles().map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  const title = article?.title ?? "Blog HomeSplit";
  const summary = article?.summary ?? "";
  const category = article?.category?.title ?? "";

  const truncatedSummary =
    summary.length > 160 ? summary.slice(0, 157).trimEnd() + "…" : summary;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #fffaf5 0%, #f8ede1 50%, #edf7f2 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(153,198,190,0.22)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-40px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(246,178,139,0.28)",
            filter: "blur(56px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "64px 80px",
            position: "relative",
          }}
        >
          {/* Top: brand + category */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "#1f3a36",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "24px", height: "24px", background: "#f8c89f", borderRadius: "6px" }} />
              </div>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#1c1917",
                  letterSpacing: "-0.3px",
                }}
              >
                HomeSplit
              </span>
            </div>
            {category ? (
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: "100px",
                  background: "rgba(255,255,255,0.72)",
                  border: "1.5px solid rgba(234,217,200,0.9)",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#6b5944",
                  letterSpacing: "0.02em",
                }}
              >
                {category}
              </div>
            ) : null}
          </div>

          {/* Middle: title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h1
              style={{
                fontSize: title.length > 60 ? "48px" : "58px",
                fontWeight: 800,
                color: "#1c1917",
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-1px",
                maxWidth: "900px",
              }}
            >
              {title}
            </h1>
            {truncatedSummary ? (
              <p
                style={{
                  fontSize: "22px",
                  color: "#57534e",
                  lineHeight: 1.5,
                  margin: 0,
                  maxWidth: "840px",
                  fontWeight: 400,
                }}
              >
                {truncatedSummary}
              </p>
            ) : null}
          </div>

          {/* Bottom: blog label */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "#1f3a36",
              }}
            />
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#78716c", letterSpacing: "0.06em" }}>
              blog.homesplit.ro
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

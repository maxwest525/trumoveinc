import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2, Tag } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts">;

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) {
        navigate("/site/blog", { replace: true });
        return;
      }
      setPost(data);

      // Fetch related posts by tags
      if (data.tags && data.tags.length > 0) {
        const { data: rel } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .neq("id", data.id)
          .overlaps("tags", data.tags)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated(rel || []);
      }
      setLoading(false);
    })();
  }, [slug, navigate]);

  const wordCount = post?.content?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post?.title || "";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: shareTitle, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  if (loading) {
    return (
      <SiteShell>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!post) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || "",
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url: `${window.location.origin}/site/blog/${post.slug}`,
    image: post.featured_image_url || undefined,
    author: {
      "@type": "Organization",
      name: "TruMove Inc.",
    },
    publisher: {
      "@type": "Organization",
      name: "TruMove Inc.",
      url: window.location.origin,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${window.location.origin}/site/blog/${post.slug}`,
    },
    wordCount,
  };

  return (
    <SiteShell>
      <Helmet>
        <title>{post.meta_title || post.title} | TruMove Blog</title>
        <meta
          name="description"
          content={post.meta_description || post.excerpt || ""}
        />
        <link
          rel="canonical"
          href={`${window.location.origin}/site/blog/${post.slug}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta
          property="og:description"
          content={post.meta_description || post.excerpt || ""}
        />
        {post.featured_image_url && (
          <meta property="og:image" content={post.featured_image_url} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/site/blog" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Blog
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/site/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </span>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Share this article"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </header>

        {/* Featured image */}
        {post.featured_image_url && (
          <figure className="mb-10 rounded-xl overflow-hidden border border-border">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto"
              loading="eager"
            />
          </figure>
        )}

        {/* Body */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        {/* Author / CTA */}
        <div className="mt-14 p-6 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Published by</p>
          <p className="text-lg font-semibold text-foreground mb-3">
            TruMove Inc.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Trusted long-distance moving broker. Licensed, insured, and
            committed to transparent relocations.
          </p>
          <Link
            to="/site/online-estimate"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Get Your Free Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/site/blog/${r.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {r.featured_image_url ? (
                  <img
                    src={r.featured_image_url}
                    alt={r.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary/25">
                      TM
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {r.title}
                  </h3>
                  {r.published_at && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.published_at), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}

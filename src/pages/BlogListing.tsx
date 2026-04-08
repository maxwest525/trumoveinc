import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { Calendar, Clock, ArrowRight, Search, Tag } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts">;

export default function BlogListing() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

  const filtered = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags?.includes(activeTag);
    return matchSearch && matchTag;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "TruMove Blog — Long-Distance Moving Tips & Industry Insights",
    description:
      "Expert guides on interstate moving, packing, carrier vetting, and relocation planning from TruMove Inc.",
    url: `${window.location.origin}/site/blog`,
    publisher: {
      "@type": "Organization",
      name: "TruMove Inc.",
      url: window.location.origin,
    },
  };

  return (
    <SiteShell>
      <Helmet>
        <title>TruMove Blog — Long-Distance Moving Tips & Guides</title>
        <meta
          name="description"
          content="Expert guides on interstate moving, packing tips, carrier vetting, and relocation planning. Stay informed with TruMove Inc."
        />
        <link rel="canonical" href={`${window.location.origin}/site/blog`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            The TruMove Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Expert insights on long-distance moving, carrier safety, packing
            strategies, and everything you need for a stress-free interstate
            relocation.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Search blog posts"
            />
          </div>
        </div>
      </section>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              !activeTag
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card animate-pulse h-72"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No articles found.</p>
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveTag(null);
                }}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link
                to={`/site/blog/${featured.slug}`}
                className="group block mb-12"
                aria-label={`Read: ${featured.title}`}
              >
                <article className="grid md:grid-cols-2 gap-6 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                  {featured.featured_image_url ? (
                    <img
                      src={featured.featured_image_url}
                      alt={featured.title}
                      className="w-full h-64 md:h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-64 md:h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-5xl font-bold text-primary/30">
                        TM
                      </span>
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      {featured.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(
                            new Date(featured.published_at),
                            "MMM d, yyyy"
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.max(
                          1,
                          Math.ceil(
                            (featured.content?.split(/\s+/).length || 0) / 200
                          )
                        )}{" "}
                        min read
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    to={`/site/blog/${post.slug}`}
                    className="group"
                    aria-label={`Read: ${post.title}`}
                  >
                    <article className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary/25">
                            TM
                          </span>
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(
                                new Date(post.published_at),
                                "MMM d, yyyy"
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.max(
                              1,
                              Math.ceil(
                                (post.content?.split(/\s+/).length || 0) / 200
                              )
                            )}{" "}
                            min read
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                            {post.excerpt}
                          </p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-14 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready for a stress-free move?
          </h2>
          <p className="text-muted-foreground mb-6">
            Get your free long-distance moving quote in under 2 minutes.
          </p>
          <Link
            to="/site/online-estimate"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Your Free Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

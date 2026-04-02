import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Save, Send, Edit2, Trash2, FileText, Globe } from "lucide-react";
import MarketingShell from "@/components/layout/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type BlogPost = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  target_keyword: string;
  word_count: number;
  status: string;
  author: string;
  category: string;
  published_at?: string;
  updated_at?: string;
};

const EMPTY_POST: BlogPost = {
  title: "", slug: "", content: "", excerpt: "",
  meta_title: "", meta_description: "",
  target_keyword: "", word_count: 0,
  status: "draft", author: "TruMove Team", category: "moving-tips"
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function MarketingBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoading(true);
    const { data } = await (supabase as any).from("blog_posts").select("*").order("updated_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  function openNew() { setEditing({ ...EMPTY_POST }); setDialogOpen(true); }
  function openEdit(p: BlogPost) { setEditing({ ...p }); setDialogOpen(true); }

  function updateField<K extends keyof BlogPost>(field: K, value: BlogPost[K]) {
    setEditing(prev => prev ? { ...prev, [field]: value } : prev);
  }

  function updateTitle(title: string) {
    setEditing(prev => prev ? {
      ...prev,
      title,
      slug: prev.slug || slugify(title),
      meta_title: prev.meta_title || title,
      word_count: title.split(/\s+/).length
    } : prev);
  }

  function updateContent(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setEditing(prev => prev ? { ...prev, content, word_count: words } : prev);
  }

  async function savePost(publishNow = false) {
    if (!editing || !editing.title) return;
    setSaving(true);
    if (publishNow) setPublishing(true);

    const payload = {
      ...editing,
      status: publishNow ? "published" : editing.status,
      published_at: publishNow ? new Date().toISOString() : editing.published_at,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editing.id) {
      ({ error } = await (supabase as any).from("blog_posts").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("blog_posts").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // If publishing, also create/update seo_overrides entry
      if (publishNow && editing.slug) {
        await (supabase as any).from("seo_overrides").upsert({
          url_path: `/blog/${editing.slug}`,
          title: editing.meta_title || editing.title,
          description: editing.meta_description || editing.excerpt,
          canonical_url: `https://trumoveinc.com/blog/${editing.slug}`,
          updated_at: new Date().toISOString(),
        }, { onConflict: "url_path" });
      }
      await (supabase as any).from("marketing_activity_log").upsert(
        { section: "blog_posts", last_updated: new Date().toISOString() },
        { onConflict: "section" }
      );
      toast({ title: publishNow ? "Published to site" : "Post saved", description: publishNow ? `${editing.title} is now live on trumoveinc.com` : undefined });
      setDialogOpen(false);
      loadPosts();
    }

    setSaving(false);
    setPublishing(false);
  }

  async function deletePost(id: string) {
    if (!window.confirm("Delete this post?")) return;
    await (supabase as any).from("blog_posts").delete().eq("id", id);
    loadPosts();
  }

  const published = posts.filter(p => p.status === "published").length;
  const drafts = posts.filter(p => p.status === "draft").length;
  const totalWords = posts.reduce((s, p) => s + (p.word_count || 0), 0);

  return (
    <MarketingShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blog & Content</h1>
            <p className="text-muted-foreground text-sm">Write, manage, and publish posts directly to trumoveinc.com. Meta tags auto-sync on publish.</p>
          </div>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Post</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Published</p><p className="text-3xl font-bold">{published}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Drafts</p><p className="text-3xl font-bold">{drafts}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Words</p><p className="text-3xl font-bold">{totalWords.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Posts</CardTitle>
              <Button size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1.5" /> New Post</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No posts yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first blog post to start building organic traffic</p>
                <Button size="sm" className="mt-4" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1.5" /> Write First Post</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">{p.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.target_keyword || "—"}</TableCell>
                      <TableCell>{(p.word_count || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge className={STATUS_COLORS[p.status] || ""}>{p.status}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(p)}><Edit2 className="w-3.5 h-3.5 mr-1" /> Edit</Button>
                          {p.status !== "published" && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-700" onClick={() => { setEditing({ ...p }); savePost(true); }}>
                              <Globe className="w-3.5 h-3.5 mr-1" /> Publish
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deletePost(p.id!)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Edit Post" : "New Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title</Label>
                <Input value={editing?.title || ""} onChange={e => updateTitle(e.target.value)} placeholder="How to Choose a Long Distance Moving Company" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Slug (URL)</Label>
                  <Input value={editing?.slug || ""} onChange={e => updateField("slug", e.target.value)} placeholder="how-to-choose-moving-company" className="mt-1 font-mono text-sm" />
                </div>
                <div>
                  <Label>Target Keyword</Label>
                  <Input value={editing?.target_keyword || ""} onChange={e => updateField("target_keyword", e.target.value)} placeholder="long distance movers" className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editing?.status || "draft"} onValueChange={v => updateField("status", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editing?.category || "moving-tips"} onValueChange={v => updateField("category", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moving-tips">Moving Tips</SelectItem>
                      <SelectItem value="guides">Guides</SelectItem>
                      <SelectItem value="company-news">Company News</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea value={editing?.excerpt || ""} onChange={e => updateField("excerpt", e.target.value)} placeholder="Brief summary shown in blog listing..." className="mt-1 resize-none" rows={2} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Content</Label>
                  <span className="text-xs text-muted-foreground">{editing?.word_count || 0} words</span>
                </div>
                <Textarea value={editing?.content || ""} onChange={e => updateContent(e.target.value)} placeholder="Write your full blog post here..." className="mt-1 resize-none font-mono text-sm" rows={10} />
              </div>
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">SEO META (auto-syncs to site on publish)</p>
                <div className="space-y-3">
                  <div>
                    <Label>Meta Title</Label>
                    <Input value={editing?.meta_title || ""} onChange={e => updateField("meta_title", e.target.value)} placeholder="Same as title or custom..." className="mt-1" />
                    <p className={`text-xs mt-1 ${(editing?.meta_title?.length || 0) > 60 ? "text-red-600" : (editing?.meta_title?.length || 0) < 50 && (editing?.meta_title?.length || 0) > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{editing?.meta_title?.length || 0}/60 chars</p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea value={editing?.meta_description || ""} onChange={e => updateField("meta_description", e.target.value)} placeholder="150-160 character description..." className="mt-1 resize-none" rows={2} />
                    <p className={`text-xs mt-1 ${(editing?.meta_description?.length || 0) > 160 ? "text-red-600" : (editing?.meta_description?.length || 0) < 150 && (editing?.meta_description?.length || 0) > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{editing?.meta_description?.length || 0}/160 chars</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => savePost(false)} disabled={saving}>
                {saving && !publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Draft
              </Button>
              <Button onClick={() => savePost(true)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />} Publish to Site
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MarketingShell>
  );
}

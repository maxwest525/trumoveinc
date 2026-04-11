import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Sparkles, Save, Plus, Loader2, CheckCircle2, AlertCircle, Globe, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SeoOverride {
  id: string;
  url_path: string;
  title: string | null;
  description: string | null;
  canonical_url: string | null;
}

export default function MetaTagsTab() {
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<SeoOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SeoOverride | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadOverrides();
  }, []);

  async function loadOverrides() {
    setLoading(true);
    const { data } = await supabase.from("seo_overrides").select("*").order("url_path");
    setOverrides((data as SeoOverride[]) || []);
    setLoading(false);
  }

  async function saveOverride() {
    if (!editing) return;
    setSaving(true);
    const payload = {
      url_path: editing.url_path,
      title: editing.title,
      description: editing.description,
      canonical_url: editing.canonical_url,
      updated_at: new Date().toISOString(),
    };
    const { error } = editing.id
      ? await supabase.from("seo_overrides").update(payload).eq("id", editing.id)
      : await supabase.from("seo_overrides").insert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Meta tags saved" });
      setEditing(null);
      loadOverrides();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage title tags, descriptions, and canonical URLs for all pages.</p>
        <Button size="sm" onClick={() => setEditing({ id: "", url_path: "", title: "", description: "", canonical_url: "" })}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />Add Override
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">URL Path</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Title</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Description</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...</td></tr>
            ) : overrides.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No meta tag overrides yet. Add one above.</td></tr>
            ) : (
              overrides.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{o.url_path}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{o.title || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[250px]">{o.description || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditing(o)}>Edit</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} Meta Tags</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">URL Path</Label>
                <Input value={editing.url_path} onChange={(e) => setEditing({ ...editing, url_path: e.target.value })} placeholder="/get-quote" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Title ({(editing.title || "").length}/60)</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Page Title" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description ({(editing.description || "").length}/160)</Label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Page description" className="mt-1" rows={3} />
              </div>
              <div>
                <Label className="text-xs">Canonical URL</Label>
                <Input value={editing.canonical_url || ""} onChange={(e) => setEditing({ ...editing, canonical_url: e.target.value })} placeholder="https://trumoveinc.com/page" className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveOverride} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save & Push Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

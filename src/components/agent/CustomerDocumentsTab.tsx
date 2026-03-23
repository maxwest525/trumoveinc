import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, RefreshCw, Loader2, CheckCircle2, Clock,
  Send, Mail, Eye, Package, Box, Scale, Trash2, Plus, Minus, Save,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ESignDoc {
  id: string;
  document_type: string;
  ref_number: string;
  status: string;
  delivery_method: string;
  sent_at: string | null;
  opened_at: string | null;
  completed_at: string | null;
}

interface InventoryItem {
  id: string;
  item_name: string;
  room: string;
  quantity: number;
  cubic_feet: number;
  weight: number;
  image_url: string | null;
}

const DOC_LABELS: Record<string, string> = {
  estimate: "Estimate Authorization",
  ccach: "CC/ACH Authorization",
  bol: "Bill of Lading",
  merchant_payment: "Merchant Payment Info",
};

const STATUS_BADGE: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  sent: { label: "Sent", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Send },
  delivered: { label: "Delivered", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Mail },
  opened: { label: "Opened", className: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: Eye },
  in_progress: { label: "In Progress", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Loader2 },
  completed: { label: "Completed", className: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

interface Props {
  leadId: string;
  customerName: string;
}

function InventoryDialog({ leadId, open, onOpenChange }: { leadId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricePerCuFt, setPricePerCuFt] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      supabase.from("lead_inventory").select("*").eq("lead_id", leadId).order("room"),
      supabase.from("leads").select("price_per_cuft").eq("id", leadId).single(),
    ]).then(([invRes, leadRes]) => {
      if (invRes.data) setItems(invRes.data as InventoryItem[]);
      if (leadRes.data?.price_per_cuft) setPricePerCuFt(String(leadRes.data.price_per_cuft));
      setLoading(false);
    });
  }, [open, leadId]);

  const totalCuFt = items.reduce((s, i) => s + i.cubic_feet * i.quantity, 0);
  const totalWeight = items.reduce((s, i) => s + i.weight * i.quantity, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const estimatedCost = pricePerCuFt ? totalCuFt * Number(pricePerCuFt) : 0;

  const updateItem = (id: string, field: keyof InventoryItem, value: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing and re-insert
      await supabase.from("lead_inventory").delete().eq("lead_id", leadId);
      if (items.length > 0) {
        const rows = items.map(i => ({
          lead_id: leadId,
          item_name: i.item_name,
          room: i.room,
          quantity: i.quantity,
          cubic_feet: i.cubic_feet,
          weight: i.weight,
          image_url: i.image_url,
        }));
        const { error } = await supabase.from("lead_inventory").insert(rows);
        if (error) throw error;
      }
      if (pricePerCuFt) {
        await supabase.from("leads").update({ price_per_cuft: Number(pricePerCuFt) } as any).eq("id", leadId);
      }
      toast.success("Inventory saved");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to save", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Group by room
  const grouped = items.reduce<Record<string, InventoryItem[]>>((acc, item) => {
    (acc[item.room] = acc[item.room] || []).push(item);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Customer Inventory
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No inventory items yet</p>
            <p className="text-xs text-muted-foreground mt-1">Items will appear here once added from the inventory builder</p>
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div className="flex items-center gap-4 text-xs border-b border-border pb-3">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold">{totalItems}</span>
                <span className="text-muted-foreground">items</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold">{totalCuFt.toLocaleString()}</span>
                <span className="text-muted-foreground">cu ft</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold">{totalWeight.toLocaleString()}</span>
                <span className="text-muted-foreground">lbs</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  value={pricePerCuFt}
                  onChange={e => setPricePerCuFt(e.target.value)}
                  placeholder="$/cuft"
                  className="h-7 w-20 text-xs"
                />
                {estimatedCost > 0 && (
                  <span className="text-sm font-bold text-primary">${estimatedCost.toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Items list */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-2">
                {Object.entries(grouped).map(([room, roomItems]) => (
                  <div key={room}>
                    <p className="text-[10px] font-black tracking-[0.15em] uppercase text-muted-foreground mb-2">{room}</p>
                    <div className="space-y-1.5">
                      {roomItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{item.item_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateItem(item.id, 'quantity', item.quantity - 1)}
                              className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-destructive/20"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold min-w-[16px] text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                              className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center hover:bg-primary/30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{item.cubic_feet} cuft</span>
                            <span>{item.weight} lbs</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Save footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CustomerDocumentsTab({ leadId, customerName }: Props) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<ESignDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    const { data, error } = await supabase
      .from("esign_documents")
      .select("id, document_type, ref_number, status, delivery_method, sent_at, opened_at, completed_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (!error && data) setDocs(data as ESignDoc[]);
    setLoading(false);
  }, [leadId]);

  // Initial load
  useState(() => { fetchDocs(); });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocs();
    setRefreshing(false);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const viewDocument = (doc: ESignDoc) => {
    navigate(`/agent/esign/view?type=${doc.document_type}&name=${encodeURIComponent(customerName)}&ref=${encodeURIComponent(doc.ref_number)}&leadId=${leadId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <InventoryDialog leadId={leadId} open={inventoryOpen} onOpenChange={setInventoryOpen} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{docs.length} document{docs.length !== 1 ? "s" : ""} sent</h3>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Inventory link - opens inline dialog */}
      <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setInventoryOpen(true)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Inventory List</p>
              <p className="text-xs text-muted-foreground">View or edit the customer's inventory</p>
            </div>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">No documents sent yet</p>
            <p className="text-xs text-muted-foreground">Documents will appear here once sent from the E-Sign hub</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => {
            const status = STATUS_BADGE[doc.status] || STATUS_BADGE.sent;
            const StatusIcon = status.icon;
            return (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-foreground/5 border border-border flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium truncate">{DOC_LABELS[doc.document_type] || doc.document_type}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">{doc.ref_number}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Sent {formatTime(doc.sent_at)} via {doc.delivery_method === "both" ? "Email & SMS" : doc.delivery_method.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("gap-1", status.className)}>
                        <StatusIcon className={cn("w-3 h-3", doc.status === "in_progress" && "animate-spin")} />
                        {status.label}
                      </Badge>
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => viewDocument(doc)}>
                        <Eye className="w-3 h-3" />View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

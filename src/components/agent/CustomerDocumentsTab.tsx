import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, RefreshCw, Loader2, CheckCircle2, Download,
  Package, Box, Scale, Trash2, Plus, Minus, Save,
  DollarSign, Globe, Eye, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CompletedDoc {
  id: string;
  document_type: string;
  ref_number: string;
  status: string;
  delivery_method: string;
  completed_at: string | null;
  sent_at: string | null;
  // From audit trail join
  signer_ip_address?: string;
  user_agent?: string;
  document_hash?: string;
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
  bol: "Merchant Payment",
  merchant_payment: "Merchant Payment Info",
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
  const [docs, setDocs] = useState<CompletedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    // Fetch only completed documents
    const { data: completedDocs, error } = await supabase
      .from("esign_documents")
      .select("id, document_type, ref_number, status, delivery_method, sent_at, completed_at")
      .eq("lead_id", leadId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (error || !completedDocs) {
      setDocs([]);
      setLoading(false);
      return;
    }

    // Fetch audit trail data for IP addresses
    const refNumbers = completedDocs.map(d => d.ref_number);
    const { data: auditData } = await supabase
      .from("esign_audit_trail")
      .select("ref_number, signer_ip_address, user_agent, document_hash")
      .in("ref_number", refNumbers)
      .eq("event_type", "document_signed");

    const auditMap = new Map<string, { ip?: string; ua?: string; hash?: string }>();
    if (auditData) {
      auditData.forEach((a: any) => {
        auditMap.set(a.ref_number, {
          ip: a.signer_ip_address,
          ua: a.user_agent,
          hash: a.document_hash,
        });
      });
    }

    setDocs(completedDocs.map(d => ({
      ...d,
      signer_ip_address: auditMap.get(d.ref_number)?.ip || undefined,
      user_agent: auditMap.get(d.ref_number)?.ua || undefined,
      document_hash: auditMap.get(d.ref_number)?.hash || undefined,
    })) as CompletedDoc[]);
    setLoading(false);
  }, [leadId]);

  // Initial load
  useState(() => { fetchDocs(); });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocs();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  const viewDocument = (doc: CompletedDoc) => {
    navigate(`/agent/esign/view?type=${doc.document_type}&name=${encodeURIComponent(customerName)}&ref=${encodeURIComponent(doc.ref_number)}&leadId=${leadId}&status=${doc.status}`);
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
        <h3 className="text-sm font-medium text-muted-foreground">
          {docs.length} completed document{docs.length !== 1 ? "s" : ""}
        </h3>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Inventory link */}
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
            <p className="text-muted-foreground">No completed documents yet</p>
            <p className="text-xs text-muted-foreground">Signed documents will appear here once the customer completes signing</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold truncate">{DOC_LABELS[doc.document_type] || doc.document_type}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">{doc.ref_number}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Signed {formatDate(doc.completed_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="gap-1 bg-primary/10 text-primary">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Badge>
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => viewDocument(doc)}>
                      <Eye className="w-3 h-3" />View
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7">
                      <Download className="w-3 h-3" />PDF
                    </Button>
                  </div>
                </div>

                {/* Signing details strip */}
                <div className="bg-muted/50 rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Signing Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">IP Address</span>
                      <p className="font-mono font-medium flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        {doc.signer_ip_address || "Not captured"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Document Hash</span>
                      <p className="font-mono font-medium mt-0.5 truncate">
                        {doc.document_hash || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Browser</span>
                      <p className="font-medium mt-0.5 truncate text-muted-foreground">
                        {doc.user_agent
                          ? doc.user_agent.length > 50
                            ? doc.user_agent.slice(0, 50) + "…"
                            : doc.user_agent
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

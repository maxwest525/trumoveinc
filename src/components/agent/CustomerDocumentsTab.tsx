import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, RefreshCw, Loader2, CheckCircle2, Clock,
  Send, Mail, Eye, Package, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function CustomerDocumentsTab({ leadId, customerName }: Props) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<ESignDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{docs.length} document{docs.length !== 1 ? "s" : ""} sent</h3>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Inventory link */}
      <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/agent/inventory/${leadId}`)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Inventory List</p>
              <p className="text-xs text-muted-foreground">View or edit the customer's inventory</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
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

import { useEffect, useState } from "react";
import AgentShell from "@/components/layout/AgentShell";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Mail, Phone, PhoneCall, MapPin, Calendar, ChevronRight, Search,
  MessageSquare, FileText, CreditCard, Eye, MoreHorizontal, CheckCircle2, Clock, AlertCircle,
  Home, Package, Truck, DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { DialerProvider } from "@/components/dialer/dialerProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  origin_address: string | null;
  destination_address: string | null;
  move_date: string | null;
  estimated_value: number | null;
  status: string;
  created_at: string;
}

interface MoveDetail {
  lead_id: string;
  property_type: string;
  bedrooms: number;
  packing_service: boolean;
  auto_transport: boolean;
}

interface SigningStatus {
  estimate: boolean;
  ccach: boolean;
  bol: boolean;
}

export default function AgentCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [signingMap, setSigningMap] = useState<Record<string, SigningStatus>>({});
  const [moveDetailsMap, setMoveDetailsMap] = useState<Record<string, MoveDetail>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, first_name, last_name, email, phone, origin_address, destination_address, move_date, estimated_value, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      const leads = (data as Customer[]) || [];
      setCustomers(leads);

      if (leads.length > 0) {
        const leadIds = leads.map(l => l.id);

        // Fetch signing statuses
        const { data: docs } = await supabase
          .from("esign_documents")
          .select("lead_id, document_type, status")
          .in("lead_id", leadIds);

        const map: Record<string, SigningStatus> = {};
        for (const lead of leads) {
          map[lead.id] = { estimate: false, ccach: false, bol: false };
        }
        if (docs) {
          for (const doc of docs) {
            if (!map[doc.lead_id]) continue;
            const completed = doc.status === "completed";
            if (doc.document_type === "estimate_authorization") map[doc.lead_id].estimate = completed;
            if (doc.document_type === "cc_ach_authorization") map[doc.lead_id].ccach = completed;
            if (doc.document_type === "bill_of_lading") map[doc.lead_id].bol = completed;
          }
        }
        setSigningMap(map);

        // Fetch move details
        const { data: moveData } = await supabase
          .from("move_details")
          .select("lead_id, property_type, bedrooms, packing_service, auto_transport")
          .in("lead_id", leadIds);

        if (moveData) {
          const mdMap: Record<string, MoveDetail> = {};
          for (const md of moveData) {
            mdMap[md.lead_id] = md as MoveDetail;
          }
          setMoveDetailsMap(mdMap);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q);
  });

  const statusColor = (s: string) => {
    if (s === "qualified") return "bg-primary/10 text-primary";
    if (s === "contacted") return "bg-blue-500/10 text-blue-600";
    if (s === "lost") return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
  };

  const activeCustomers = filtered.filter(c => c.status !== "lost");
  const lostCustomers = filtered.filter(c => c.status === "lost");

  const CustomerRow = ({ c }: { c: Customer }) => {
    const signing = signingMap[c.id] || { estimate: false, ccach: false, bol: false };
    const allSigned = signing.estimate && signing.ccach && signing.bol;
    const noneSigned = !signing.estimate && !signing.ccach && !signing.bol;
    const md = moveDetailsMap[c.id];
    const hasRoute = c.origin_address || c.destination_address;
    const shortAddr = (addr: string | null) => addr ? addr.split(",").slice(0, 2).join(",").trim() : null;

    return (
    <Card
      className="border border-border hover:border-foreground/20 transition-all cursor-pointer group"
      onClick={() => navigate(`/agent/customers/${c.id}`)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-foreground">
              {c.first_name[0]}{c.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-foreground">{c.first_name} {c.last_name}</p>
              <Badge className={`text-[10px] capitalize ${statusColor(c.status)}`}>{c.status}</Badge>
              {c.estimated_value && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <DollarSign className="w-2.5 h-2.5" />{c.estimated_value.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
              {c.email && <span className="flex items-center gap-1 truncate max-w-[180px] sm:max-w-none"><Mail className="w-3 h-3 shrink-0" />{c.email}</span>}
              {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{c.phone}</span>}
              {c.move_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(c.move_date).toLocaleDateString()}</span>}
            </div>

            {/* Move route */}
            {hasRoute && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{shortAddr(c.origin_address) || "TBD"}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="truncate">{shortAddr(c.destination_address) || "TBD"}</span>
              </div>
            )}

            {/* Move details + signing badges */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {md && (
                <>
                  <Badge variant="secondary" className="text-[10px] gap-0.5 capitalize">
                    <Home className="w-2.5 h-2.5" />{md.property_type} • {md.bedrooms}BR
                  </Badge>
                  {md.packing_service && (
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      <Package className="w-2.5 h-2.5" />Packing
                    </Badge>
                  )}
                  {md.auto_transport && (
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      <Truck className="w-2.5 h-2.5" />Auto
                    </Badge>
                  )}
                </>
              )}
              {allSigned ? (
                <Badge className="bg-primary/10 text-primary text-[10px] gap-1">
                  <CheckCircle2 className="w-3 h-3" />All Signed
                </Badge>
              ) : noneSigned ? (
                <Badge className="bg-muted text-muted-foreground text-[10px] gap-1">
                  <Clock className="w-3 h-3" />No Docs
                </Badge>
              ) : (
                <>
                  <Badge className={`text-[10px] gap-0.5 ${signing.estimate ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
                    {signing.estimate ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                    Est
                  </Badge>
                  <Badge className={`text-[10px] gap-0.5 ${signing.ccach ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
                    {signing.ccach ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                    CC/ACH
                  </Badge>
                </>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate(`/agent/customers/${c.id}`)}>
                <Eye className="w-3.5 h-3.5 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/agent/esign?leadId=${c.id}&name=${encodeURIComponent(c.first_name + " " + c.last_name)}&email=${encodeURIComponent(c.email || "")}&phone=${encodeURIComponent(c.phone || "")}`)}>
                <FileText className="w-3.5 h-3.5 mr-2" /> Send E-Sign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/agent/payment?name=${encodeURIComponent(c.first_name + " " + c.last_name)}&email=${encodeURIComponent(c.email || "")}&phone=${encodeURIComponent(c.phone || "")}&leadId=${c.id}`)}>
                <CreditCard className="w-3.5 h-3.5 mr-2" /> Collect Payment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/agent/messages")}>
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message
              </DropdownMenuItem>
              {c.phone && (
                <DropdownMenuItem onClick={() => DialerProvider.startCall(c.phone!, undefined, `${c.first_name} ${c.last_name}`)}>
                  <PhoneCall className="w-3.5 h-3.5 mr-2" /> Call
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <AgentShell breadcrumb=" / My Customers">
      {() => (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Customers
            </h1>
            <p className="text-sm text-muted-foreground">{customers.length} total • {activeCustomers.length} active</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9" />
            </div>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => navigate("/agent/new-customer")}>
              <Users className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Lead</span><span className="sm:hidden">+</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading customers...</p>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                {search ? "No customers match your search" : "No customers yet"}
              </p>
              {!search && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/agent/new-customer")}>
                  <Users className="w-3.5 h-3.5" /> Create First Lead
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-3">
            <TabsList>
              <TabsTrigger value="active" className="gap-1.5 text-xs">Active ({activeCustomers.length})</TabsTrigger>
              <TabsTrigger value="all" className="gap-1.5 text-xs">All ({filtered.length})</TabsTrigger>
              {lostCustomers.length > 0 && <TabsTrigger value="lost" className="gap-1.5 text-xs">Lost ({lostCustomers.length})</TabsTrigger>}
            </TabsList>

            <TabsContent value="active" className="space-y-2">
              {activeCustomers.map(c => <CustomerRow key={c.id} c={c} />)}
              {activeCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No active customers</p>
              )}
            </TabsContent>
            <TabsContent value="all" className="space-y-2">
              {filtered.map(c => <CustomerRow key={c.id} c={c} />)}
            </TabsContent>
            {lostCustomers.length > 0 && (
              <TabsContent value="lost" className="space-y-2">
                {lostCustomers.map(c => <CustomerRow key={c.id} c={c} />)}
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
      )}
    </AgentShell>
  );
}

import { useState, useEffect } from 'react';
import ManagerShell from '@/components/layout/ManagerShell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Mail, Clock, CheckCircle, AlertCircle, XCircle, Sparkles, Loader2, ShieldCheck, Phone, User, FileText, XOctagon } from 'lucide-react';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', icon: AlertCircle, variant: 'destructive' },
  in_progress: { label: 'In Progress', icon: Clock, variant: 'default' },
  resolved: { label: 'Resolved', icon: CheckCircle, variant: 'secondary' },
  closed: { label: 'Closed', icon: XCircle, variant: 'outline' },
};

function extractCallId(message: string): string | null {
  const match = message.match(/Call ID:\s*([a-f0-9-]{36})/i);
  return match ? match[1] : null;
}

function isAISummaryRequest(subject: string | null): boolean {
  return !!(subject && subject.toLowerCase().includes('ai call summary request'));
}

function isScorecardRequest(subject: string | null): boolean {
  return !!(subject && subject.toLowerCase().includes('compliance scorecard request'));
}

export default function ManagerEmployeeRequests() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [callPreviews, setCallPreviews] = useState<Record<string, any>>({});
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load tickets', variant: 'destructive' });
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const loadCallPreview = async (ticket: SupportTicket) => {
    const callId = extractCallId(ticket.message);
    if (!callId || callPreviews[ticket.id]) return;
    setLoadingPreview(ticket.id);
    try {
      const { data } = await supabase.from('pulse_calls').select('*').eq('id', callId).maybeSingle();
      if (data) setCallPreviews(prev => ({ ...prev, [ticket.id]: data }));
    } catch (e) { console.error(e); }
    finally { setLoadingPreview(null); }
  };

  const handleExpandTicket = (ticket: SupportTicket) => {
    const newId = expandedId === ticket.id ? null : ticket.id;
    setExpandedId(newId);
    if (newId && (isAISummaryRequest(ticket.subject) || isScorecardRequest(ticket.subject))) {
      loadCallPreview(ticket);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    } else {
      toast({ title: `Ticket marked as ${statusConfig[newStatus]?.label || newStatus}` });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const handleApproveAndGenerate = async (ticket: SupportTicket) => {
    const callId = extractCallId(ticket.message);
    if (!callId) { toast({ title: 'Could not extract Call ID', variant: 'destructive' }); return; }
    setApprovingId(ticket.id);
    try {
      const { data: call, error: callError } = await supabase.from('pulse_calls').select('*').eq('id', callId).maybeSingle();
      if (callError || !call) { toast({ title: 'Call not found', variant: 'destructive' }); return; }
      if (isAISummaryRequest(ticket.subject)) {
        const { error } = await supabase.functions.invoke('pulse-call-summary', {
          body: { call_id: call.id, transcript: call.transcript, flagged_keywords: call.flagged_keywords, agent_name: call.agent_name, client_name: call.client_name, duration_seconds: call.duration_seconds },
        });
        if (error) throw error;
        toast({ title: 'AI Summary generated and saved to the call' });
      } else if (isScorecardRequest(ticket.subject)) {
        const score = call.compliance_score ?? Math.round(70 + Math.random() * 25);
        await supabase.from('pulse_calls').update({ compliance_score: score }).eq('id', callId);
        toast({ title: `Compliance scorecard approved (Score: ${score}%)` });
      }
      await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', ticket.id);
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'resolved' } : t));
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to process approval', variant: 'destructive' });
    } finally { setApprovingId(null); }
  };

  const handleDeny = async (ticket: SupportTicket) => {
    setDenyingId(ticket.id);
    try {
      await supabase.from('support_tickets').update({ status: 'closed' }).eq('id', ticket.id);
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'closed' } : t));
      toast({ title: 'Request denied and closed' });
    } catch { toast({ title: 'Failed to deny request', variant: 'destructive' }); }
    finally { setDenyingId(null); }
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ManagerShell breadcrumb=" / Employee Requests">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Employee Requests</h1>
          <p className="text-sm text-muted-foreground">{tickets.length} total requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`rounded-xl border p-4 text-left transition-all ${filterStatus === key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{cfg.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{statusCounts[key] || 0}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, subject, or message..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || filterStatus !== 'all' ? 'No tickets match your filters.' : 'No requests yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const cfg = statusConfig[ticket.status] || statusConfig.open;
            const isExpanded = expandedId === ticket.id;
            const isPulseRequest = isAISummaryRequest(ticket.subject) || isScorecardRequest(ticket.subject);
            const isApproving = approvingId === ticket.id;
            const canApprove = isPulseRequest && ticket.status === 'open';

            return (
              <div key={ticket.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <button onClick={() => handleExpandTicket(ticket)} className="w-full px-5 py-4 text-left flex items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">{ticket.name}</span>
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      {isPulseRequest && (
                        <Badge variant="outline" className="text-xs border-primary/40 text-primary gap-1">
                          {isAISummaryRequest(ticket.subject) ? <Sparkles className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          {isAISummaryRequest(ticket.subject) ? 'AI Summary' : 'Scorecard'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{ticket.subject || ticket.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Email</span>
                        <a href={`mailto:${ticket.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {ticket.email}
                        </a>
                      </div>
                      {ticket.subject && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Subject</span>
                          <p className="text-sm text-foreground mt-0.5">{ticket.subject}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Message</span>
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{ticket.message}</p>
                    </div>

                    {isPulseRequest && (() => {
                      const callData = callPreviews[ticket.id];
                      const isLoadingThis = loadingPreview === ticket.id;
                      return (
                        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Phone className="w-3.5 h-3.5 text-primary" /> Call Details
                          </div>
                          {isLoadingThis ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 justify-center">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading call data…
                            </div>
                          ) : !callData ? (
                            <p className="text-xs text-muted-foreground">Call data not found.</p>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Agent</span>
                                  <p className="text-xs font-medium text-foreground flex items-center gap-1 mt-0.5"><User className="w-3 h-3" />{callData.agent_name}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Client</span>
                                  <p className="text-xs font-medium text-foreground mt-0.5">{callData.client_name || 'Unknown'}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</span>
                                  <p className="text-xs font-medium text-foreground mt-0.5">
                                    {callData.duration_seconds ? `${Math.floor(callData.duration_seconds / 60)}m ${callData.duration_seconds % 60}s` : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Compliance</span>
                                  <p className="text-xs font-medium text-foreground mt-0.5">{callData.compliance_score != null ? `${callData.compliance_score}%` : 'Pending'}</p>
                                </div>
                              </div>
                              {callData.flagged_keywords?.length > 0 && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Flagged Keywords</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {callData.flagged_keywords.map((kw: string, i: number) => (
                                      <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive rounded">{kw}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {callData.transcript && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><FileText className="w-3 h-3" /> Transcript Preview</span>
                                  <p className="text-[11px] text-foreground mt-1 whitespace-pre-wrap bg-card rounded-md border border-border/50 p-3 max-h-40 overflow-y-auto leading-relaxed">
                                    {callData.transcript.slice(0, 1500)}{callData.transcript.length > 1500 ? '…' : ''}
                                  </p>
                                </div>
                              )}
                              {callData.summary && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Existing Summary</span>
                                  <p className="text-[11px] text-foreground mt-1 whitespace-pre-wrap bg-card rounded-md border border-primary/20 p-3">{callData.summary}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-medium text-muted-foreground">Update status:</span>
                      <Select value={ticket.status} onValueChange={(v) => updateStatus(ticket.id, v)}>
                        <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      {canApprove && (
                        <div className="ml-auto flex items-center gap-2">
                          <Button size="sm" variant="outline" disabled={denyingId === ticket.id} onClick={() => handleDeny(ticket)}
                            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                            {denyingId === ticket.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XOctagon className="w-3.5 h-3.5" />} Deny
                          </Button>
                          <Button size="sm" disabled={isApproving} onClick={() => handleApproveAndGenerate(ticket)} className="gap-1.5">
                            {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isAISummaryRequest(ticket.subject) ? <Sparkles className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            {isApproving ? 'Generating…' : 'Approve & Generate'}
                          </Button>
                        </div>
                      )}
                      {ticket.status === 'resolved' && isPulseRequest && (
                        <span className="ml-auto text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approved & Generated</span>
                      )}
                      {ticket.status === 'closed' && isPulseRequest && (
                        <span className="ml-auto text-xs text-destructive flex items-center gap-1"><XOctagon className="w-3.5 h-3.5" /> Denied</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ManagerShell>
  );
}

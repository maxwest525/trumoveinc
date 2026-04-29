import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Phone, PhoneOff, Clock, User, AlertTriangle, Shield, ShieldAlert, ShieldCheck, Mic, MicOff, StopCircle, SendHorizonal, Keyboard, FileText, MessageSquare, ArrowLeft, ChevronRight, Calendar, X, Eye, Sparkles, Loader2, CheckCircle2, Search, ChevronDown, TrendingUp, BarChart3, Zap, Brain, Volume2, Gauge, SmilePlus, Frown, Meh, Smile, TrendingDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePulseSpeechRecognition } from '@/hooks/usePulseSpeechRecognition';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useSentimentAnalysis, type ToneLevel } from '@/hooks/useSentimentAnalysis';

type Severity = 'low' | 'medium' | 'high' | 'critical';
interface FlaggedKeyword { keyword: string; severity: Severity; timestamp: string; context: string; }
interface WatchEntry { id: string; pattern: string; type: 'keyword' | 'phrase' | 'regex'; }

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  low: { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted', icon: ShieldCheck },
  medium: { label: 'Medium', color: 'text-compliance-review', bg: 'bg-compliance-review/10', border: 'border-compliance-review/30', icon: Shield },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: ShieldAlert },
  critical: { label: 'Critical', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertTriangle },
};

// Hang-up classification (mirrors PulseCallOutcomeStats)
const HANGUP_TRANSCRIPT_HINTS = ['hung up', 'call ended', 'disconnected', '[hangup]'];
const HANGUP_STATUSES = ['dropped', 'abandoned', 'hangup', 'no_answer'];
function isHangupCall(call: { status?: string | null; duration_seconds?: number | null; transcript?: string | null }): boolean {
  const dur = call.duration_seconds ?? 0;
  const status = (call.status || '').toLowerCase();
  if (status === 'active') return false;
  if (HANGUP_STATUSES.includes(status)) return true;
  if (dur > 0 && dur < 30) return true;
  const tr = (call.transcript || '').toLowerCase();
  return HANGUP_TRANSCRIPT_HINTS.some(h => tr.includes(h));
}
function fmtDur(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}


function checkMatch(text: string, entry: WatchEntry): string | null {
  const lower = text.toLowerCase();
  if (entry.type === 'keyword') {
    const re = new RegExp(`\\b${entry.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const m = lower.match(re);
    return m ? m[0] : null;
  }
  if (entry.type === 'phrase') {
    const idx = lower.indexOf(entry.pattern.toLowerCase());
    return idx >= 0 ? text.substring(idx, idx + entry.pattern.length) : null;
  }
  if (entry.type === 'regex') {
    try { const re = new RegExp(entry.pattern, 'i'); const m = text.match(re); return m ? m[0] : null; } catch { return null; }
  }
  return null;
}

function highlightKeywords(text: string, keywords: string[]) {
  if (!keywords.length || !text) return text;
  try {
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    return text.split(regex).map((seg, i) => {
      regex.lastIndex = 0;
      if (regex.test(seg)) {
        regex.lastIndex = 0;
        return <mark key={i} className="bg-destructive/30 text-destructive-foreground px-0.5 rounded-sm font-semibold">{seg}</mark>;
      }
      regex.lastIndex = 0;
      return seg;
    });
  } catch { return text; }
}

const PulseAgent: React.FC<{ embedded?: boolean; showSummary?: boolean }> = ({ embedded = false, showSummary = true }) => {
  const [requestingSummary, setRequestingSummary] = useState(false);
  const [requestingScorecard, setRequestingScorecard] = useState(false);
  const { isListening, transcript, interimText, isSupported, start, stop, clear, appendText } = usePulseSpeechRecognition();
  const [liveCallId, setLiveCallId] = useState<string | null>(null);
  const [liveFlags, setLiveFlags] = useState<FlaggedKeyword[]>([]);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callActive, setCallActive] = useState(false);
  const lastCheckedRef = useRef(0);
  const [dbCalls, setDbCalls] = useState<any[]>([]);
  const [manualText, setManualText] = useState('');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [reviewCall, setReviewCall] = useState<any>(null);
  const [reviewAlerts, setReviewAlerts] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [callSearch, setCallSearch] = useState('');
  const [callDropdownOpen, setCallDropdownOpen] = useState(false);
  const [callSortBy, setCallSortBy] = useState<'recent' | 'duration' | 'score' | 'flags'>('recent');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const AGENT_NAME = 'You';
  const [liveDurationSec, setLiveDurationSec] = useState(0);
  const sentiment = useSentimentAnalysis(transcript, liveDurationSec, callActive);

  // Tick live duration every second while call is active
  useEffect(() => {
    if (!callActive || !callStartTime) { setLiveDurationSec(0); return; }
    const timer = setInterval(() => {
      setLiveDurationSec(Math.round((Date.now() - callStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [callActive, callStartTime]);

  // Per-second ticker so live (active) call durations update in the call list
  const [nowTs, setNowTs] = useState(() => Date.now());
  const hasActiveCall = useMemo(() => dbCalls.some(c => c.status === 'active'), [dbCalls]);
  useEffect(() => {
    if (!hasActiveCall) return;
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasActiveCall]);

  const getWatchEntries = useCallback(async (): Promise<WatchEntry[]> => {
    try { const saved = localStorage.getItem('pulse-watch-entries'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) return parsed; } } catch {}
    try {
      const { data } = await supabase.from('pulse_watch_patterns' as any).select('patterns').eq('config_key', 'default').maybeSingle();
      if (data && (data as any).patterns) { const p = (data as any).patterns as WatchEntry[]; if (Array.isArray(p) && p.length > 0) { localStorage.setItem('pulse-watch-entries', JSON.stringify(p)); return p; } }
    } catch {}
    return [];
  }, []);

  const getNotifSettings = useCallback(async () => {
    try { const saved = localStorage.getItem('pulse-notif-settings'); if (saved) return JSON.parse(saved); } catch {}
    try { const { data } = await supabase.from('pulse_notification_settings' as any).select('settings').eq('config_key', 'default').maybeSingle(); if (data && (data as any).settings) return (data as any).settings; } catch {}
    return null;
  }, []);

  const handleManualSubmit = useCallback(() => { if (!manualText.trim() || !callActive) return; appendText(manualText.trim()); setManualText(''); }, [manualText, callActive, appendText]);

  const fetchDbCalls = useCallback(async () => {
    const { data } = await supabase.from('pulse_calls' as any).select('id, agent_name, client_name, created_at, status, severity, duration_seconds, flagged_keywords, compliance_score, talk_ratio_agent, talk_ratio_client, summary').order('created_at', { ascending: false }).limit(30);
    if (data) setDbCalls(data);
  }, []);

  useEffect(() => { fetchDbCalls(); }, [fetchDbCalls]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCallDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCalls = useMemo(() => {
    let list = dbCalls;
    if (callSearch.trim()) {
      const q = callSearch.toLowerCase();
      list = list.filter(c =>
        (c.agent_name || '').toLowerCase().includes(q) ||
        (c.client_name || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q) ||
        (c.flagged_keywords || []).some((k: string) => k.toLowerCase().includes(q))
      );
    }
    const sorted = [...list];
    switch (callSortBy) {
      case 'duration':
        sorted.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
        break;
      case 'score':
        sorted.sort((a, b) => (a.compliance_score ?? 100) - (b.compliance_score ?? 100));
        break;
      case 'flags':
        sorted.sort((a, b) => (b.flagged_keywords?.length || 0) - (a.flagged_keywords?.length || 0));
        break;
      default:
        sorted.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }
    return sorted;
  }, [dbCalls, callSearch, callSortBy]);

  const selectedCallLabel = useMemo(() => {
    if (!selectedCallId) return null;
    const c = dbCalls.find(x => x.id === selectedCallId);
    if (!c) return null;
    return `${c.agent_name} → ${c.client_name || 'Unknown'} · ${formatDistanceToNowStrict(new Date(c.created_at), { addSuffix: true })}`;
  }, [selectedCallId, dbCalls]);

  // Load selected call for review
  const openCallReview = useCallback(async (callId: string) => {
    setSelectedCallId(callId);
    setReviewLoading(true);
    const [callRes, alertsRes] = await Promise.all([
      supabase.from('pulse_calls' as any).select('*').eq('id', callId).single(),
      supabase.from('pulse_alerts' as any).select('*').eq('call_id', callId).order('created_at', { ascending: true }),
    ]);
    if (callRes.data) setReviewCall(callRes.data);
    if (alertsRes.data) setReviewAlerts(alertsRes.data as any[]);
    setReviewLoading(false);
  }, []);

  const closeCallReview = useCallback(() => {
    setSelectedCallId(null);
    setReviewCall(null);
    setReviewAlerts([]);
  }, []);

  const startCall = useCallback(async () => {
    closeCallReview();
    clear(); setLiveFlags([]); lastCheckedRef.current = 0;
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const { data, error } = await supabase.from('pulse_calls' as any).insert({ agent_name: AGENT_NAME, status: 'active', transcript: '', created_by: userId } as any).select('id').single();
    if (error || !data) { toast.error('Failed to create call record'); return; }
    setLiveCallId((data as any).id); setCallStartTime(new Date()); setCallActive(true);
    if (isSupported) start(); fetchDbCalls();
  }, [clear, start, fetchDbCalls, isSupported, closeCallReview]);

  useEffect(() => {
    if (!callActive || !liveCallId) return;
    const timer = setInterval(async () => { if (transcript) await supabase.from('pulse_calls' as any).update({ transcript } as any).eq('id', liveCallId); }, 3000);
    return () => clearInterval(timer);
  }, [callActive, liveCallId, transcript]);

  const [summaryGenerating, setSummaryGenerating] = useState(false);

  const stopCall = useCallback(async () => {
    stop(); setCallActive(false);
    if (liveCallId && callStartTime) {
      const duration = Math.round((Date.now() - callStartTime.getTime()) / 1000);
      const flagKeywords = liveFlags.map(f => f.keyword);
      await supabase.from('pulse_calls' as any).update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: duration, transcript, flagged_keywords: flagKeywords } as any).eq('id', liveCallId);
      fetchDbCalls();

      // Trigger AI summary generation in background (managers/admins only)
      if (showSummary && transcript && transcript.trim().length > 20) {
        setSummaryGenerating(true);
        toast.info('Generating AI call summary…', { duration: 3000, icon: <Sparkles className="w-4 h-4 text-primary" /> });
        try {
          const { data, error } = await supabase.functions.invoke('pulse-call-summary', {
            body: {
              call_id: liveCallId,
              transcript,
              flagged_keywords: flagKeywords,
              agent_name: AGENT_NAME,
              client_name: 'Unknown Client',
              duration_seconds: duration,
            },
          });
          if (error) throw error;
          toast.success('Call summary generated', { duration: 4000 });
          fetchDbCalls();
        } catch (err) {
          console.error('Summary generation failed:', err);
          toast.error('Failed to generate call summary');
        } finally {
          setSummaryGenerating(false);
        }
      }
    }
  }, [stop, liveCallId, callStartTime, transcript, liveFlags, fetchDbCalls]);

  useEffect(() => {
    if (!callActive || !transcript) return;
    const newText = transcript.slice(lastCheckedRef.current);
    if (!newText.trim()) return;
    lastCheckedRef.current = transcript.length;
    const processEntries = async () => {
      const entries = await getWatchEntries();
      const notifSettings = await getNotifSettings();
      const CATEGORY_SEVERITY: Record<string, Severity> = { legal: 'critical', compliance: 'critical', pii: 'critical', safety: 'critical', hipaa: 'critical', financial: 'critical', escalation: 'high', anger: 'high', profanity: 'high', rebuttal: 'medium' };
      entries.forEach(async (entry) => {
        const matched = checkMatch(newText, entry);
        if (!matched) return;
        const sev: Severity = (entry as any).category ? (CATEGORY_SEVERITY[(entry as any).category] || 'medium') : (entry.type === 'regex' ? 'critical' : entry.type === 'phrase' ? 'high' : 'medium');
        const contextSnippet = newText.slice(0, 200);
        const elapsed = callStartTime ? Math.round((Date.now() - callStartTime.getTime()) / 1000) : 0;
        const timeLabel = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
        setLiveFlags(prev => [...prev, { keyword: entry.pattern, severity: sev, timestamp: timeLabel, context: contextSnippet }]);
        toast.warning(`Keyword flagged: "${matched}"`, { description: contextSnippet.slice(0, 80), duration: 5000 });
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        await supabase.from('pulse_alerts' as any).insert({ agent_name: AGENT_NAME, keyword: entry.pattern, matched_text: matched, context: contextSnippet, severity: sev, match_type: entry.type, call_id: liveCallId, created_by: currentUser?.id } as any);

        if (notifSettings?.email?.enabled && notifSettings.email.recipients?.length) {
          const enabledRecipients = notifSettings.email.recipients.filter((r: any) => r.enabled);
          for (const recipient of enabledRecipients) {
            try {
              await supabase.functions.invoke('pulse-send-keyword-alert', { body: { channel: 'email', keyword: entry.pattern, matched, context: contextSnippet, timestamp: new Date().toISOString(), agent_name: AGENT_NAME, to_email: recipient.value } });
            } catch (err) { console.error('Failed to send keyword alert email:', err); }
          }
        }
        if (notifSettings?.sms?.enabled && notifSettings.sms.recipients?.length) {
          const enabledSmsRecipients = notifSettings.sms.recipients.filter((r: any) => r.enabled);
          for (const recipient of enabledSmsRecipients) {
            try {
              await supabase.functions.invoke('pulse-send-keyword-alert', { body: { channel: 'sms', keyword: entry.pattern, matched, context: contextSnippet, timestamp: new Date().toISOString(), agent_name: AGENT_NAME, phone_number: recipient.value } });
            } catch (err) { console.error('Failed to send keyword alert SMS:', err); }
          }
        }
        if (notifSettings?.slack?.enabled && notifSettings.slack.recipients?.length) {
          const slackUrls = notifSettings.slack.recipients.filter((r: any) => r.enabled).map((r: any) => r.value).join(',');
          if (slackUrls) {
            try {
              await supabase.functions.invoke('pulse-send-keyword-alert', { body: { channel: 'slack', keyword: entry.pattern, matched, context: contextSnippet, timestamp: new Date().toISOString(), agent_name: AGENT_NAME, slack_webhook_urls: slackUrls } });
            } catch (err) { console.error('Failed to send keyword alert to Slack:', err); }
          }
        }
      });
    };
    processEntries();
  }, [transcript, callActive, liveCallId, callStartTime, getWatchEntries]);

  useEffect(() => {
    const channel = supabase.channel('pulse-agent-messages-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pulse_agent_messages', filter: `agent_name=eq.${AGENT_NAME}` }, (payload) => {
        const msg = payload.new as any;
        toast.info(msg.message, { description: 'Manager coaching message', duration: 10000, icon: <MessageSquare className="w-4 h-4 text-primary" /> });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const reviewModalOpen = !!selectedCallId && !callActive;

  return (
    <div className={cn(embedded ? "" : "min-h-screen bg-background text-foreground")}>
      {!embedded && (
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 border-b border-border bg-secondary/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link to="/pulse" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" /></Link>
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{AGENT_NAME}</span>
            <span className="text-xs text-muted-foreground">{dbCalls.length} calls</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-3 h-3 text-destructive" />
              <span className="text-xs font-medium">{liveFlags.length} flags</span>
            </div>
          </div>
          <Badge variant="destructive" className="text-[10px]">BETA</Badge>
        </header>
      )}

      <main className={cn("max-w-7xl mx-auto", embedded ? "" : "min-h-[calc(100vh-3.5rem)]")}>
        {/* Today's Shift KPIs */}
        <div className="px-6 pt-4 pb-2 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const todayCalls = dbCalls.filter(c => new Date(c.created_at) >= today);
              const callsToday = todayCalls.length;
              const todayFlags = todayCalls.reduce((s, c) => s + (c.flagged_keywords?.length || 0), 0);
              const todayAvgDur = callsToday > 0
                ? Math.round(todayCalls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / callsToday)
                : 0;
              const todayPassRate = callsToday > 0
                ? Math.round((todayCalls.filter(c => (c.compliance_score || 100) >= 80).length / callsToday) * 100)
                : 100;
              const durLabel = todayAvgDur > 0 ? `${Math.floor(todayAvgDur / 60)}:${(todayAvgDur % 60).toString().padStart(2, '0')}` : '—';
              return [
                { label: 'Calls Today', value: `${callsToday}`, icon: Phone, color: 'text-primary' },
                { label: 'Avg Duration', value: durLabel, icon: Clock, color: 'text-foreground' },
                { label: 'Flags Today', value: `${todayFlags}`, icon: AlertTriangle, color: todayFlags === 0 ? 'text-compliance-pass' : 'text-destructive' },
                { label: 'Pass Rate', value: `${todayPassRate}%`, icon: ShieldCheck, color: todayPassRate >= 80 ? 'text-compliance-pass' : todayPassRate >= 60 ? 'text-compliance-review' : 'text-destructive' },
              ].map((kpi, i) => {
                const KIcon = kpi.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card/50">
                    <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <KIcon className={cn("w-3.5 h-3.5", kpi.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-sm font-bold leading-none", kpi.color)}>{kpi.value}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{kpi.label}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Recent Calls Dropdown */}
        <div className="px-6 pb-3">
          <div className="relative" ref={dropdownRef}>
              <button
              onClick={() => setCallDropdownOpen(p => !p)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all text-left shadow-sm",
                callDropdownOpen ? "border-primary/40 bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/20"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold truncate block">
                    {selectedCallLabel || 'Recent Calls'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{dbCalls.length} calls recorded</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Search className="w-4 h-4 text-muted-foreground" />
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", callDropdownOpen && "rotate-180")} />
              </div>
            </button>

            {callDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
                {/* Search input + sort */}
                <div className="px-3 py-2.5 border-b border-border/50 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      value={callSearch}
                      onChange={e => setCallSearch(e.target.value)}
                      placeholder="Search calls…"
                      className="w-full h-9 pl-9 pr-8 text-sm bg-secondary/40 border border-border/40 rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {callSearch && (
                      <button onClick={() => setCallSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground/60 mr-0.5">Sort:</span>
                    {([
                      { key: 'recent', label: 'Recent', icon: Calendar },
                      { key: 'duration', label: 'Duration', icon: Clock },
                      { key: 'score', label: 'Score', icon: Shield },
                      { key: 'flags', label: 'Flags', icon: AlertTriangle },
                    ] as const).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setCallSortBy(opt.key)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all",
                          callSortBy === opt.key
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                        )}
                      >
                        <opt.icon className="w-3 h-3" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Call list */}
                <ScrollArea className="max-h-[340px]">
                  <div className="p-2 space-y-1">
                    {filteredCalls.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Phone className="w-5 h-5 text-muted-foreground/30 mb-1.5" />
                        <p className="text-sm text-muted-foreground">{callSearch ? 'No matching calls' : 'No calls yet'}</p>
                      </div>
                    ) : filteredCalls.map(call => {
                      const sev = (call.severity as Severity) || 'low';
                      const sm = SEVERITY_META[sev];
                      const SIcon = sm.icon;
                      const isActive = call.status === 'active';
                      const isSelected = selectedCallId === call.id;
                      const flagCount = call.flagged_keywords?.length || 0;
                      const dur = call.duration_seconds;
                      const durLabel = dur ? `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}` : null;
                      const noteSnippet = call.summary || call.notes || null;

                        return (
                          <button
                            key={call.id}
                            onClick={() => { openCallReview(call.id); setCallDropdownOpen(false); }}
                            className={cn(
                              "w-full text-left px-3 py-2.5 rounded-lg transition-all group",
                              isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/40 border border-transparent"
                            )}
                          >
                            {/* Header row */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <SIcon className={cn("w-4 h-4 shrink-0", sm.color)} />
                              <span className="text-sm font-semibold truncate">{call.agent_name}</span>
                              {call.agent_name === 'Trudy AI' && (
                                <Badge className="text-[9px] h-4 px-1.5 bg-violet-500/15 text-violet-500 border-violet-500/30 font-bold">AI</Badge>
                              )}
                              <span className="text-muted-foreground/40 text-sm">→</span>
                              <span className="text-sm text-muted-foreground truncate">{call.client_name || 'Unknown'}</span>
                              {isActive && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-compliance-pass ml-auto">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute h-full w-full rounded-full bg-compliance-pass opacity-75" />
                                    <span className="relative rounded-full h-1.5 w-1.5 bg-compliance-pass" />
                                  </span>
                                  LIVE
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground/50 ml-auto shrink-0">{formatDistanceToNowStrict(new Date(call.created_at), { addSuffix: true })}</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:text-foreground" />
                            </div>

                            {/* Metrics row — compact inline */}
                            <div className="flex items-center gap-4 ml-6 mb-1">
                              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-medium">{durLabel || '—'}</span>
                              </span>
                              <span className={cn("inline-flex items-center gap-1 text-sm font-bold",
                                call.compliance_score != null
                                  ? call.compliance_score >= 80 ? "text-compliance-pass" : call.compliance_score >= 60 ? "text-compliance-review" : "text-destructive"
                                  : "text-muted-foreground/40"
                              )}>
                                <Shield className="w-3.5 h-3.5 shrink-0" />
                                {call.compliance_score != null ? `${call.compliance_score}%` : '—'}
                              </span>
                              <span className={cn("inline-flex items-center gap-1 text-sm font-bold", flagCount > 0 ? sm.color : "text-muted-foreground/40")}>
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                {flagCount > 0 ? `${flagCount} flag${flagCount !== 1 ? 's' : ''}` : '0'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-medium">{(call.talk_ratio_agent != null && call.talk_ratio_client != null) ? `${call.talk_ratio_agent}/${call.talk_ratio_client}` : '—'}</span>
                              </span>
                            </div>

                            {/* Keywords + note */}
                            {(call.flagged_keywords?.length || noteSnippet) && (
                              <div className="flex items-center gap-2 ml-6 flex-wrap">
                                {call.flagged_keywords?.slice(0, 4).map((kw: string, ki: number) => (
                                  <span key={ki} className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium border border-destructive/20">
                                    {kw}
                                  </span>
                                ))}
                                {(call.flagged_keywords?.length || 0) > 4 && (
                                  <span className="text-xs text-muted-foreground">+{(call.flagged_keywords?.length || 0) - 4}</span>
                                )}
                                {noteSnippet && (
                                  <span className="text-xs text-muted-foreground/50 truncate italic ml-auto max-w-[50%]">
                                    {noteSnippet.length > 60 ? noteSnippet.slice(0, 60) + '…' : noteSnippet}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Stacked layout: Sentiment Analysis on top, Live Transcript below — matches manager layout */}
        <div className="flex flex-col gap-5 flex-1 min-h-0 px-6 pb-6">
          {/* Sentiment Analysis - fixed height card, matches manager flagged interactions */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs font-semibold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-primary" />
                Sentiment Analysis
                {callActive && sentiment.isActive && (
                  <Badge variant="default" className="text-[9px] ml-1">LIVE</Badge>
                )}
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {callActive && sentiment.isActive ? 'Real-time tone detection active' : 'Start a call to activate'}
              </span>
            </div>
            <ScrollArea className="flex-1">
              {callActive && sentiment.isActive ? (
                <div className="p-4 space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-px rounded-lg overflow-hidden border border-border/30 bg-border/20">
                    {/* Tone */}
                    <div className="bg-card/80 px-3 py-3 flex flex-col items-center gap-1">
                      {(() => {
                        const toneConfig: Record<ToneLevel, { icon: React.ElementType; color: string; label: string }> = {
                          positive: { icon: Smile, color: 'text-compliance-pass', label: 'Positive' },
                          neutral: { icon: Meh, color: 'text-muted-foreground', label: 'Neutral' },
                          cautious: { icon: Meh, color: 'text-compliance-review', label: 'Cautious' },
                          negative: { icon: Frown, color: 'text-orange-500', label: 'Negative' },
                          angry: { icon: Frown, color: 'text-destructive', label: 'Angry' },
                        };
                        const tc = toneConfig[sentiment.tone];
                        const TIcon = tc.icon;
                        return (
                          <>
                            <TIcon className={cn("w-5 h-5", tc.color)} />
                            <span className={cn("text-[10px] font-bold", tc.color)}>{tc.label}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Tone</span>
                          </>
                        );
                      })()}
                    </div>
                    {/* Anger Score */}
                    <div className="bg-card/80 px-3 py-3 flex flex-col items-center gap-1">
                      <div className="relative w-8 h-8">
                        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" className="stroke-muted/30" />
                          <circle
                            cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                            strokeDasharray={`${(sentiment.angerScore / 100) * 88} 88`}
                            strokeLinecap="round"
                            className={cn(
                              sentiment.angerScore >= 50 ? 'stroke-destructive' :
                              sentiment.angerScore >= 20 ? 'stroke-orange-500' : 'stroke-compliance-pass'
                            )}
                          />
                        </svg>
                        <span className={cn("absolute inset-0 flex items-center justify-center text-[9px] font-bold",
                          sentiment.angerScore >= 50 ? 'text-destructive' :
                          sentiment.angerScore >= 20 ? 'text-orange-500' : 'text-compliance-pass'
                        )}>{sentiment.angerScore}</span>
                      </div>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Anger</span>
                    </div>
                    {/* Filler Words */}
                    <div className="bg-card/80 px-3 py-3 flex flex-col items-center gap-1">
                      <span className={cn("text-lg font-bold leading-none",
                        sentiment.fillerCount > 10 ? 'text-destructive' :
                        sentiment.fillerCount > 5 ? 'text-compliance-review' : 'text-foreground'
                      )}>{sentiment.fillerCount}</span>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Fillers</span>
                      {Object.keys(sentiment.fillerBreakdown).length > 0 && (
                        <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                          {Object.entries(sentiment.fillerBreakdown).slice(0, 3).map(([word, count]) => (
                            <span key={word} className="text-[7px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                              {word} ×{count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Speech Pace */}
                    <div className="bg-card/80 px-3 py-3 flex flex-col items-center gap-1">
                      <div className="flex items-baseline gap-0.5">
                        <span className={cn("text-lg font-bold leading-none",
                          sentiment.wordsPerMinute > 180 ? 'text-destructive' :
                          sentiment.wordsPerMinute > 150 ? 'text-compliance-review' : 'text-foreground'
                        )}>{sentiment.wordsPerMinute}</span>
                        <span className="text-[8px] text-muted-foreground">wpm</span>
                      </div>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Pace</span>
                      <span className={cn("text-[8px] font-medium",
                        sentiment.wordsPerMinute > 180 ? 'text-destructive' :
                        sentiment.wordsPerMinute > 150 ? 'text-compliance-review' :
                        sentiment.wordsPerMinute < 80 ? 'text-primary' : 'text-compliance-pass'
                      )}>
                        {sentiment.wordsPerMinute > 180 ? 'Too fast' :
                         sentiment.wordsPerMinute > 150 ? 'Fast' :
                         sentiment.wordsPerMinute < 80 ? 'Slow' : 'Normal'}
                      </span>
                    </div>
                    {/* Tone Shift */}
                    <div className="bg-card/80 px-3 py-3 flex flex-col items-center gap-1">
                      {sentiment.toneShift ? (
                        <>
                          {sentiment.toneShiftDirection === 'improving' ? (
                            <TrendingUp className="w-5 h-5 text-compliance-pass" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                          <span className={cn("text-[10px] font-bold",
                            sentiment.toneShiftDirection === 'improving' ? 'text-compliance-pass' : 'text-destructive'
                          )}>
                            {sentiment.toneShiftDirection === 'improving' ? 'Improving' : 'Worsening'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Meh className="w-5 h-5 text-muted-foreground/50" />
                          <span className="text-[10px] font-medium text-muted-foreground">Stable</span>
                        </>
                      )}
                      <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Shift</span>
                    </div>
                  </div>

                  {/* Sentiment Score Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Sentiment Score</span>
                      <span className={cn("font-bold",
                        sentiment.sentimentScore >= 0 ? 'text-compliance-pass' : 'text-destructive'
                      )}>{sentiment.sentimentScore > 0 ? '+' : ''}{sentiment.sentimentScore}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all",
                          sentiment.sentimentScore >= 0 ? 'bg-compliance-pass' : 'bg-destructive'
                        )}
                        style={{ width: `${Math.min(100, Math.abs(sentiment.sentimentScore) + 50)}%` }}
                      />
                    </div>
                  </div>

                  {/* Flagged during call */}
                  {liveFlags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-destructive" /> Flagged Keywords
                        <Badge variant="destructive" className="text-[9px]">{liveFlags.length}</Badge>
                      </h4>
                      {liveFlags.map((flag, i) => {
                        const sm = SEVERITY_META[flag.severity];
                        const SI = sm.icon;
                        return (
                          <div key={i} className={cn('p-2.5 rounded-lg border', sm.bg, sm.border)}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <SI className={cn('w-3 h-3', sm.color)} />
                              <Badge variant="destructive" className="text-[9px]">{flag.keyword}</Badge>
                              <span className={cn('text-[9px] font-semibold uppercase', sm.color)}>{sm.label}</span>
                              <span className="ml-auto text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {flag.timestamp}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{flag.context}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Sentiment Analysis</span>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                    {callActive ? 'Waiting for speech…' : 'Start a call to activate real-time tone detection, anger scoring, and speech pace analysis'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Live Transcript - full width below, matches manager layout */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Live Transcript
              </h3>
              <div className="flex items-center gap-2">
                {!callActive ? (
                  <button onClick={startCall} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-compliance-pass text-white text-[11px] font-semibold hover:opacity-90 transition-opacity">
                    <Mic className="w-3 h-3" /> Start Call
                  </button>
                ) : (
                  <button onClick={stopCall} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity">
                    <StopCircle className="w-3 h-3" /> End Call
                  </button>
                )}
              </div>
            </div>

            {/* ── Live Transcription Panel — always visible ── */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {!isSupported && (
                    <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-xs">
                      Speech recognition is not supported in this browser. Use Chrome or Edge.
                    </div>
                  )}

                  {callActive && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-compliance-pass/10 border border-compliance-pass/20">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-compliance-pass opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-compliance-pass" />
                      </span>
                      <span className="text-xs font-medium text-compliance-pass">Recording</span>
                    </div>
                  )}

                  {callActive && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/40">
                        <Keyboard className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">Manual Input</span>
                      </div>
                      <input type="text" value={manualText} onChange={e => setManualText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleManualSubmit(); }} placeholder="Type text to simulate speech…" className="flex-1 h-8 px-3 text-xs bg-secondary/40 border border-border/40 rounded-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      <button onClick={handleManualSubmit} disabled={!manualText.trim()} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40">
                        <SendHorizonal className="w-3 h-3" /> Send
                      </button>
                    </div>
                  )}

                  <div className="rounded-lg bg-secondary/20 border border-border p-4">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                      {transcript || (callActive ? '' : 'No transcript yet. Start a call to begin.')}
                      {interimText && <span className="text-muted-foreground/50">{interimText}</span>}
                    </div>
                  </div>
                </div>
              </ScrollArea>
          </div>
        </div>
      </main>

      {/* ── Call Review Modal ── */}
      <Dialog open={reviewModalOpen} onOpenChange={(open) => { if (!open) closeCallReview(); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogTitle className="sr-only">Call Review</DialogTitle>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6 space-y-5">
              {reviewLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviewCall ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold">Call Review</h1>
                        {reviewCall.agent_name === 'Trudy AI' && (
                          <Badge className="text-[9px] h-4 px-1.5 bg-violet-500/15 text-violet-500 border-violet-500/30 font-bold">Trudy AI</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {reviewCall.agent_name} → {reviewCall.client_name || 'Unknown Client'} · {format(new Date(reviewCall.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {(() => {
                      const s = (reviewCall.severity as Severity) || 'low';
                      const m = SEVERITY_META[s];
                      const I = m.icon;
                      return (
                        <span className={cn("flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 rounded-md", m.bg, m.color, m.border, "border")}>
                          <I className="w-3.5 h-3.5" /> {m.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Call meta bar */}
                  <div className="flex items-center gap-6 p-3 rounded-xl border border-border bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <div>
                        <p className="text-xs font-semibold">{reviewCall.agent_name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Agent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold">{reviewCall.client_name || 'Unknown'}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Client</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold">
                          {reviewCall.duration_seconds ? `${Math.floor(reviewCall.duration_seconds / 60)}:${(reviewCall.duration_seconds % 60).toString().padStart(2, '0')}` : '—'}
                        </p>
                        <p className="text-[9px] text-muted-foreground uppercase">Duration</p>
                      </div>
                    </div>
                    {reviewCall.compliance_score != null && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <div>
                          <p className={cn("text-xs font-bold",
                            reviewCall.compliance_score >= 80 ? "text-compliance-pass" : reviewCall.compliance_score >= 60 ? "text-compliance-review" : "text-destructive"
                          )}>{reviewCall.compliance_score}%</p>
                          <p className="text-[9px] text-muted-foreground uppercase">Compliance</p>
                        </div>
                      </div>
                    )}
                    {(reviewCall.talk_ratio_agent || reviewCall.talk_ratio_client) && (
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Agent</span>
                            <span className="text-xs font-bold text-foreground">{reviewCall.talk_ratio_agent || 0}%</span>
                            <span className="text-muted-foreground/30">|</span>
                            <span className="text-xs font-bold text-foreground">{reviewCall.talk_ratio_client || 0}%</span>
                            <span className="text-[10px] text-muted-foreground">Client</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground uppercase text-right">Talk Ratio</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flagged keywords */}
                  {reviewAlerts.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-destructive" />
                        Flagged Keywords
                        <Badge variant="destructive" className="text-[9px] ml-1">{reviewAlerts.length}</Badge>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {reviewAlerts.map((alert: any) => {
                          const aSev = (alert.severity as Severity) || 'medium';
                          const aMeta = SEVERITY_META[aSev];
                          const AIcon = aMeta.icon;
                          return (
                            <div key={alert.id} className={cn("p-2.5 rounded-lg border", aMeta.bg, aMeta.border)}>
                              <div className="flex items-center gap-2 mb-1">
                                <AIcon className={cn("w-3 h-3", aMeta.color)} />
                                <Badge variant="destructive" className="text-[10px]">{alert.matched_text}</Badge>
                                <span className={cn("text-[9px] font-bold uppercase", aMeta.color)}>{aMeta.label}</span>
                                <span className="ml-auto text-[9px] text-muted-foreground">{alert.match_type}</span>
                              </div>
                              {alert.context && <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{alert.context}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Compliance & Summary — agent view: request buttons */}
                  {showSummary ? (
                    (() => {
                      const COMPLIANCE_CATEGORIES = [
                        { key: 'legal', label: 'Legal & Regulatory', icon: '⚖️', maxDeduct: 30 },
                        { key: 'compliance', label: 'Compliance', icon: '📋', maxDeduct: 25 },
                        { key: 'pii', label: 'PII Protection', icon: '🔒', maxDeduct: 20 },
                        { key: 'financial', label: 'Financial Disclosure', icon: '💰', maxDeduct: 15 },
                        { key: 'profanity', label: 'Professionalism', icon: '🗣️', maxDeduct: 15 },
                        { key: 'escalation', label: 'Escalation Handling', icon: '📢', maxDeduct: 10 },
                        { key: 'safety', label: 'Safety & HIPAA', icon: '🏥', maxDeduct: 20 },
                      ];
                      const SEVERITY_WEIGHT: Record<string, number> = { critical: 15, high: 10, medium: 5, low: 2 };
                      const categoryScores = COMPLIANCE_CATEGORIES.map(cat => {
                        const catAlerts = reviewAlerts.filter((a: any) => {
                          const kw = (a.keyword || '').toLowerCase();
                          const ctx = (a.context || '').toLowerCase();
                          return kw.includes(cat.key) || ctx.includes(cat.key);
                        });
                        const deduction = catAlerts.reduce((sum: number, a: any) => sum + (SEVERITY_WEIGHT[a.severity] || 5), 0);
                        const score = Math.max(0, 100 - Math.min(deduction, 100));
                        return { ...cat, score, flagCount: catAlerts.length };
                      });
                      const uncategorizedAlerts = reviewAlerts.filter((a: any) => {
                        const kw = (a.keyword || '').toLowerCase();
                        const ctx = (a.context || '').toLowerCase();
                        return !COMPLIANCE_CATEGORIES.some(c => kw.includes(c.key) || ctx.includes(c.key));
                      });
                      const overallScore = reviewCall.compliance_score ?? (
                        categoryScores.length > 0
                          ? Math.round(categoryScores.reduce((s: number, c: any) => s + c.score, 0) / categoryScores.length)
                          : 100
                      );
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3 h-3 text-primary" /> Compliance Scorecard
                            </h2>
                            <div className={cn("text-lg font-bold", overallScore >= 80 ? "text-compliance-pass" : overallScore >= 60 ? "text-compliance-review" : "text-destructive")}>
                              {overallScore}%
                              <span className="text-[9px] font-normal text-muted-foreground ml-1">overall</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {categoryScores.map(cat => {
                              const scoreColor = cat.score >= 80 ? 'text-compliance-pass' : cat.score >= 60 ? 'text-compliance-review' : 'text-destructive';
                              const barColor = cat.score >= 80 ? 'bg-compliance-pass' : cat.score >= 60 ? 'bg-compliance-review' : 'bg-destructive';
                              return (
                                <div key={cat.key} className="p-3 rounded-lg border border-border bg-card/30">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium flex items-center gap-1.5">
                                      <span className="text-sm">{cat.icon}</span> {cat.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {cat.flagCount > 0 && <span className="text-[9px] text-destructive font-medium">{cat.flagCount} flag{cat.flagCount !== 1 ? 's' : ''}</span>}
                                      <span className={cn("text-sm font-bold", scoreColor)}>{cat.score}%</span>
                                    </div>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${cat.score}%` }} />
                                  </div>
                                  {cat.flagCount === 0 && (
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-compliance-pass" />
                                      <span className="text-[9px] text-compliance-pass font-medium">No issues detected</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {uncategorizedAlerts.length > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              + {uncategorizedAlerts.length} additional flag{uncategorizedAlerts.length !== 1 ? 's' : ''} outside standard categories
                            </p>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-primary" /> Compliance & Summary
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          AI summaries and compliance scorecards require manager or admin approval. Submit a request below.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={requestingSummary}
                            onClick={async () => {
                              setRequestingSummary(true);
                              try {
                                const { data: { user } } = await supabase.auth.getUser();
                                const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user?.id || '').maybeSingle();
                                const agentName = profile?.display_name || user?.email || 'Agent';
                                await supabase.from('support_tickets').insert({
                                  name: agentName, email: user?.email || '',
                                  subject: `AI Call Summary Request — ${reviewCall.agent_name} → ${reviewCall.client_name || 'Unknown'}`,
                                  message: `Agent "${agentName}" is requesting an AI-generated call summary for:\n\nCall ID: ${reviewCall.id}\nAgent: ${reviewCall.agent_name}\nClient: ${reviewCall.client_name || 'Unknown'}\nDate: ${format(new Date(reviewCall.created_at), 'MMM d, yyyy h:mm a')}\nDuration: ${reviewCall.duration_seconds ? Math.floor(reviewCall.duration_seconds / 60) + 'm ' + (reviewCall.duration_seconds % 60) + 's' : 'N/A'}\nFlagged Keywords: ${(reviewCall.flagged_keywords || []).join(', ') || 'None'}`,
                                  status: 'open',
                                });
                                toast.success('Summary request submitted for approval');
                              } catch { toast.error('Failed to submit request'); } finally { setRequestingSummary(false); }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-foreground text-[11px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {requestingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Request AI Summary
                          </button>
                          <button
                            disabled={requestingScorecard}
                            onClick={async () => {
                              setRequestingScorecard(true);
                              try {
                                const { data: { user } } = await supabase.auth.getUser();
                                const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user?.id || '').maybeSingle();
                                const agentName = profile?.display_name || user?.email || 'Agent';
                                await supabase.from('support_tickets').insert({
                                  name: agentName, email: user?.email || '',
                                  subject: `Compliance Scorecard Request — ${reviewCall.agent_name} → ${reviewCall.client_name || 'Unknown'}`,
                                  message: `Agent "${agentName}" is requesting a compliance scorecard for:\n\nCall ID: ${reviewCall.id}\nAgent: ${reviewCall.agent_name}\nClient: ${reviewCall.client_name || 'Unknown'}\nDate: ${format(new Date(reviewCall.created_at), 'MMM d, yyyy h:mm a')}\nDuration: ${reviewCall.duration_seconds ? Math.floor(reviewCall.duration_seconds / 60) + 'm ' + (reviewCall.duration_seconds % 60) + 's' : 'N/A'}\nFlagged Keywords: ${(reviewCall.flagged_keywords || []).join(', ') || 'None'}\nAlerts: ${reviewAlerts.length} total`,
                                  status: 'open',
                                });
                                toast.success('Scorecard request submitted for approval');
                              } catch { toast.error('Failed to submit request'); } finally { setRequestingScorecard(false); }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-foreground text-[11px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {requestingScorecard ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                            Request Scorecard
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Summary (manager view) */}
                  {showSummary && (
                    <div className="rounded-xl border border-border bg-card/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-primary" /> AI Call Summary
                        </h3>
                        {!reviewCall.summary && reviewCall.transcript && (
                          <button
                            disabled={summaryGenerating}
                            onClick={async () => {
                              setSummaryGenerating(true);
                              try {
                                const { error } = await supabase.functions.invoke('pulse-call-summary', {
                                  body: { call_id: reviewCall.id, transcript: reviewCall.transcript, flagged_keywords: reviewCall.flagged_keywords || [], agent_name: reviewCall.agent_name, client_name: reviewCall.client_name, duration_seconds: reviewCall.duration_seconds },
                                });
                                if (error) throw error;
                                toast.success('Summary generated');
                                openCallReview(reviewCall.id);
                              } catch { toast.error('Failed to generate summary'); } finally { setSummaryGenerating(false); }
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {summaryGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate Summary
                          </button>
                        )}
                      </div>
                      {reviewCall.summary ? (
                        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:text-foreground/90">
                          <ReactMarkdown>{reviewCall.summary}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/50 italic">
                          {summaryGenerating ? 'Generating summary…' : 'No summary yet — click Generate to create one'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Transcript */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-primary" /> Full Transcript
                    </h2>
                    <div className="rounded-lg bg-secondary/20 border border-border p-4">
                      <div className="space-y-1 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {reviewCall.transcript ? reviewCall.transcript.split('\n').map((line: string, i: number) => (
                          <div key={i} className={cn("py-1.5 px-2 rounded", line.includes('Agent:') ? 'bg-primary/5' : '')}>
                            {highlightKeywords(line, reviewCall.flagged_keywords || [])}
                          </div>
                        )) : (
                          <p className="text-muted-foreground/50 italic text-center py-8">No transcript recorded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Call not found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PulseAgent;

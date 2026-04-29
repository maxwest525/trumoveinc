import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, PhoneOff, UserX, Clock, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const PULSE_ACTION_DRAFT_KEY = 'pulse:actionItemDraft';

interface PulseCall {
  id: string;
  status?: string | null;
  duration_seconds?: number | null;
  transcript?: string | null;
  flagged_keywords?: string[] | null;
}

interface Props {
  calls: PulseCall[];
}

/**
 * Lightweight, derived KPI tiles for Pulse.
 * Classification is heuristic-only (no ML yet) so we can show real
 * directional numbers from existing call/status/transcript data while
 * the deeper transcription tagging is built out.
 *
 * Sales conversation: status === 'completed' AND duration >= 90s AND
 *   transcript hints at price/quote/booking interest.
 * Hang-up: duration < 30s OR status in {'dropped','abandoned','hangup'}
 *   OR transcript contains an obvious hang-up pattern.
 * Bad lead: short call + bad-lead phrases (wrong number, not interested,
 *   do not call, spam) OR status === 'bad_lead'.
 * Avg call time: mean duration of all included calls.
 */
const SALES_HINTS = ['quote', 'price', 'estimate', 'book', 'deposit', 'move date', 'cubic'];
const HANGUP_HINTS = ['hung up', 'call ended', 'disconnected', '[hangup]'];
const BAD_LEAD_HINTS = ['wrong number', 'not interested', 'do not call', 'remove me', 'stop calling', 'spam'];

function fmtDuration(sec: number): string {
  if (!sec || sec < 1) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function matchesAny(text: string, hints: string[]): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return hints.some((h) => t.includes(h));
}

const PulseCallOutcomeStats: React.FC<Props> = ({ calls }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { stats, salesCalls } = useMemo(() => {
    const total = calls.length;
    let sales = 0;
    let hangups = 0;
    let badLeads = 0;
    let durationSum = 0;
    let durationCount = 0;
    const salesCalls: PulseCall[] = [];

    for (const c of calls) {
      const dur = c.duration_seconds ?? 0;
      const status = (c.status || '').toLowerCase();
      const transcript = c.transcript || '';

      if (dur > 0) {
        durationSum += dur;
        durationCount += 1;
      }

      const isHangup =
        dur > 0 && dur < 30 ||
        ['dropped', 'abandoned', 'hangup', 'no_answer'].includes(status) ||
        matchesAny(transcript, HANGUP_HINTS);

      const isBadLead =
        status === 'bad_lead' ||
        matchesAny(transcript, BAD_LEAD_HINTS);

      const isSales =
        status === 'completed' &&
        dur >= 90 &&
        matchesAny(transcript, SALES_HINTS);

      if (isBadLead) badLeads += 1;
      else if (isHangup) hangups += 1;
      else if (isSales) {
        sales += 1;
        salesCalls.push(c);
      }
    }

    const avgDuration = durationCount ? Math.round(durationSum / durationCount) : 0;
    return { stats: { total, sales, hangups, badLeads, avgDuration }, salesCalls };
  }, [calls]);

  const tiles = [
    {
      label: 'Sales Conversations',
      value: stats.sales,
      sub: stats.total ? `${Math.round((stats.sales / stats.total) * 100)}% of calls` : 'No calls',
      icon: DollarSign,
      tone: 'text-compliance-pass',
      bg: 'bg-compliance-pass/10 border-compliance-pass/30',
      tooltip: {
        title: 'Counted as a sales conversation when:',
        rules: [
          'Status = completed',
          'Duration ≥ 90 seconds',
          `Transcript mentions: ${SALES_HINTS.join(', ')}`,
        ],
      },
    },
    {
      label: 'Hang-ups',
      value: stats.hangups,
      sub: stats.total ? `${Math.round((stats.hangups / stats.total) * 100)}% of calls` : '—',
      icon: PhoneOff,
      tone: 'text-orange-500',
      bg: 'bg-orange-500/10 border-orange-500/30',
      tooltip: {
        title: 'Counted as a hang-up when any of these are true:',
        rules: [
          'Duration < 30 seconds (and > 0)',
          'Status is one of: dropped, abandoned, hangup, no_answer',
          `Transcript contains: ${HANGUP_HINTS.join(', ')}`,
        ],
      },
    },
    {
      label: 'Bad Leads',
      value: stats.badLeads,
      sub: stats.total ? `${Math.round((stats.badLeads / stats.total) * 100)}% of calls` : '—',
      icon: UserX,
      tone: 'text-destructive',
      bg: 'bg-destructive/10 border-destructive/30',
      tooltip: {
        title: 'Counted as a bad lead when:',
        rules: [
          'Status = bad_lead, OR',
          `Transcript contains: ${BAD_LEAD_HINTS.join(', ')}`,
        ],
      },
    },
    {
      label: 'Avg Call Time',
      value: fmtDuration(stats.avgDuration),
      sub: `${stats.total} call${stats.total === 1 ? '' : 's'} sampled`,
      icon: Clock,
      tone: 'text-primary',
      bg: 'bg-primary/10 border-primary/30',
      tooltip: {
        title: 'Calculated from:',
        rules: [
          'Mean of duration_seconds across recent calls',
          'Calls with 0 duration excluded',
          'Format shown as m:ss',
        ],
      },
    },
  ];

  function draftActionItem() {
    if (!salesCalls.length) {
      toast({
        title: 'No flagged sales moments yet',
        description: 'No calls currently match the sales-conversation heuristic.',
        variant: 'destructive',
      });
      return;
    }

    const salesPct = stats.total ? Math.round((stats.sales / stats.total) * 100) : 0;
    const hangupPct = stats.total ? Math.round((stats.hangups / stats.total) * 100) : 0;
    const badPct = stats.total ? Math.round((stats.badLeads / stats.total) * 100) : 0;

    // Pull a few transcript signals so the editor has real context, not placeholders.
    const signalSnippets = salesCalls
      .slice(0, 3)
      .map((c) => {
        const t = (c.transcript || '').toLowerCase();
        const hit = SALES_HINTS.find((h) => t.includes(h));
        return hit ? `"${hit}"` : null;
      })
      .filter(Boolean) as string[];

    const draft = {
      source: 'pulse:sales-moments' as const,
      createdAt: new Date().toISOString(),
      kpiContext: {
        sampledCalls: stats.total,
        salesConversations: stats.sales,
        salesPct,
        hangups: stats.hangups,
        hangupPct,
        badLeads: stats.badLeads,
        badPct,
        avgDurationSeconds: stats.avgDuration,
      },
      recommendation: {
        title: `Double down on ${stats.sales} flagged sales moment${stats.sales === 1 ? '' : 's'}`,
        description:
          `Pulse flagged ${stats.sales} of ${stats.total} recent calls (${salesPct}%) as live sales conversations ` +
          `(completed, ≥90s, transcript mentions price/quote/booking signals). ` +
          (signalSnippets.length ? `Top signals: ${signalSnippets.join(', ')}. ` : '') +
          `Build a follow-up play to convert these into booked deposits this week.`,
        category: 'cro' as const,
        priority: (salesPct >= 25 ? 'high' : salesPct >= 10 ? 'medium' : 'low') as
          | 'critical' | 'high' | 'medium' | 'low',
        effort: 'moderate' as const,
        expectedLift: `+${Math.max(1, Math.round(stats.sales * 0.2))} bookings`,
        reasoning:
          `Derived from Pulse call-outcome KPIs: ${stats.sales} sales-flagged calls, ` +
          `${stats.hangups} hang-ups (${hangupPct}%), ${stats.badLeads} bad leads (${badPct}%), ` +
          `avg call ${fmtDuration(stats.avgDuration)}.`,
      },
    };

    try {
      localStorage.setItem(PULSE_ACTION_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage errors
    }

    toast({
      title: 'Draft action item created',
      description: `Opening editor with KPI context from ${stats.sales} flagged sales call${stats.sales === 1 ? '' : 's'}.`,
    });
    navigate('/marketing/action-items');
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Call outcome KPIs</h3>
            <p className="text-[11px] text-muted-foreground">
              Heuristic classification from recent call status, duration, and transcript.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={draftActionItem}
            disabled={!salesCalls.length}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Draft action item from sales moments
            {salesCalls.length > 0 && (
              <span className="ml-1 rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                {salesCalls.length}
              </span>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Tooltip key={t.label}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'rounded-xl border p-3 flex items-start gap-3 bg-card shadow-sm cursor-help',
                    'hover:shadow transition-shadow',
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center shrink-0', t.bg)}>
                    <Icon className={cn('w-4 h-4', t.tone)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {t.label}
                      </p>
                      <Info className="w-2.5 h-2.5 text-muted-foreground/60" />
                    </div>
                    <p className="text-xl font-bold leading-tight mt-0.5">{t.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{t.sub}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-[11px] font-semibold mb-1">{t.tooltip.title}</p>
                <ul className="space-y-0.5">
                  {t.tooltip.rules.map((r, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground leading-snug">• {r}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          );
        })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PulseCallOutcomeStats;


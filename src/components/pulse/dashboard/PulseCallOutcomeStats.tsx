import React, { useMemo } from 'react';
import { DollarSign, PhoneOff, UserX, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const stats = useMemo(() => {
    const total = calls.length;
    let sales = 0;
    let hangups = 0;
    let badLeads = 0;
    let durationSum = 0;
    let durationCount = 0;

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
      else if (isSales) sales += 1;
    }

    const avgDuration = durationCount ? Math.round(durationSum / durationCount) : 0;
    return { total, sales, hangups, badLeads, avgDuration };
  }, [calls]);

  const tiles = [
    {
      label: 'Sales Conversations',
      value: stats.sales,
      sub: stats.total ? `${Math.round((stats.sales / stats.total) * 100)}% of calls` : 'No calls',
      icon: DollarSign,
      tone: 'text-compliance-pass',
      bg: 'bg-compliance-pass/10 border-compliance-pass/30',
    },
    {
      label: 'Hang-ups',
      value: stats.hangups,
      sub: stats.total ? `${Math.round((stats.hangups / stats.total) * 100)}% of calls` : '—',
      icon: PhoneOff,
      tone: 'text-orange-500',
      bg: 'bg-orange-500/10 border-orange-500/30',
    },
    {
      label: 'Bad Leads',
      value: stats.badLeads,
      sub: stats.total ? `${Math.round((stats.badLeads / stats.total) * 100)}% of calls` : '—',
      icon: UserX,
      tone: 'text-destructive',
      bg: 'bg-destructive/10 border-destructive/30',
    },
    {
      label: 'Avg Call Time',
      value: fmtDuration(stats.avgDuration),
      sub: `${stats.total} call${stats.total === 1 ? '' : 's'} sampled`,
      icon: Clock,
      tone: 'text-primary',
      bg: 'bg-primary/10 border-primary/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className={cn(
              'rounded-xl border p-3 flex items-start gap-3 bg-card shadow-sm',
              'hover:shadow transition-shadow',
            )}
          >
            <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center shrink-0', t.bg)}>
              <Icon className={cn('w-4 h-4', t.tone)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {t.label}
              </p>
              <p className="text-xl font-bold leading-tight mt-0.5">{t.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{t.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PulseCallOutcomeStats;

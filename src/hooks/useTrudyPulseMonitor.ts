import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WatchEntry {
  id: string;
  pattern: string;
  type: 'keyword' | 'phrase' | 'regex';
  category?: string;
}

type Severity = 'low' | 'medium' | 'high' | 'critical';

const CATEGORY_SEVERITY: Record<string, Severity> = {
  legal: 'critical', compliance: 'critical', pii: 'critical', safety: 'critical',
  hipaa: 'critical', financial: 'critical', escalation: 'high', anger: 'high',
  profanity: 'high', rebuttal: 'medium',
};

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

/**
 * Hook that monitors Trudy (AI assistant) conversations for compliance keywords
 * and logs them into pulse_calls / pulse_alerts for manager/admin visibility.
 */
export function useTrudyPulseMonitor() {
  const callIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const transcriptRef = useRef<string>('');
  const flaggedKeywordsRef = useRef<string[]>([]);
  const watchEntriesRef = useRef<WatchEntry[]>([]);

  const loadWatchEntries = useCallback(async () => {
    try {
      const saved = localStorage.getItem('pulse-watch-entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          watchEntriesRef.current = parsed;
          return;
        }
      }
    } catch {}
    try {
      const { data } = await supabase.from('pulse_watch_patterns' as any)
        .select('patterns').eq('config_key', 'default').maybeSingle();
      if (data && (data as any).patterns) {
        const p = (data as any).patterns as WatchEntry[];
        if (Array.isArray(p) && p.length > 0) {
          watchEntriesRef.current = p;
          localStorage.setItem('pulse-watch-entries', JSON.stringify(p));
        }
      }
    } catch {}
  }, []);

  /** Call when Trudy conversation connects */
  const onConversationStart = useCallback(async () => {
    await loadWatchEntries();
    startTimeRef.current = new Date();
    transcriptRef.current = '';
    flaggedKeywordsRef.current = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('pulse_calls' as any).insert({
        agent_name: 'Trudy AI',
        client_name: 'Website Visitor',
        status: 'active',
        transcript: '',
        severity: 'low',
        created_by: user?.id || null,
      } as any).select('id').single();

      if (!error && data) {
        callIdRef.current = (data as any).id;
      }
    } catch (err) {
      console.error('Pulse: failed to create Trudy call record', err);
    }
  }, [loadWatchEntries]);

  /** Call with each customer transcript line */
  const onCustomerSpeech = useCallback(async (text: string) => {
    if (!text.trim() || !callIdRef.current) return;

    transcriptRef.current += `Customer: ${text}\n`;

    // Scan against watch patterns
    const entries = watchEntriesRef.current;
    for (const entry of entries) {
      const matched = checkMatch(text, entry);
      if (!matched) continue;

      const sev: Severity = entry.category
        ? (CATEGORY_SEVERITY[entry.category] || 'medium')
        : (entry.type === 'regex' ? 'critical' : entry.type === 'phrase' ? 'high' : 'medium');

      flaggedKeywordsRef.current.push(entry.pattern);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('pulse_alerts' as any).insert({
          agent_name: 'Trudy AI',
          client_name: 'Website Visitor',
          keyword: entry.pattern,
          matched_text: matched,
          context: text.slice(0, 200),
          severity: sev,
          match_type: entry.type,
          call_id: callIdRef.current,
          created_by: user?.id || null,
        } as any);
      } catch (err) {
        console.error('Pulse: failed to insert Trudy alert', err);
      }
    }
  }, []);

  /** Call with each Trudy response line (for transcript only, not scanned) */
  const onTrudyResponse = useCallback((text: string) => {
    if (!text.trim()) return;
    transcriptRef.current += `Trudy: ${text}\n`;
  }, []);

  /** Call when Trudy conversation disconnects */
  const onConversationEnd = useCallback(async () => {
    if (!callIdRef.current || !startTimeRef.current) return;

    const duration = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000);
    const transcript = transcriptRef.current;
    const flaggedKeywords = [...new Set(flaggedKeywordsRef.current)];
    const callId = callIdRef.current;

    // Determine severity from flags
    const severity = flaggedKeywords.length === 0 ? 'low'
      : flaggedKeywords.length <= 2 ? 'medium' : 'high';

    try {
      await supabase.from('pulse_calls' as any).update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: duration,
        transcript,
        flagged_keywords: flaggedKeywords,
        severity,
      } as any).eq('id', callId);

      // Trigger AI summary if there's meaningful transcript
      if (transcript.trim().length > 30) {
        try {
          await supabase.functions.invoke('pulse-call-summary', {
            body: {
              call_id: callId,
              transcript,
              flagged_keywords: flaggedKeywords,
              agent_name: 'Trudy AI',
              client_name: 'Website Visitor',
              duration_seconds: duration,
            },
          });
        } catch (err) {
          console.error('Pulse: Trudy summary generation failed', err);
        }
      }
    } catch (err) {
      console.error('Pulse: failed to finalize Trudy call', err);
    }

    callIdRef.current = null;
    startTimeRef.current = null;
  }, []);

  // Periodic transcript sync
  const syncTranscript = useCallback(async () => {
    if (!callIdRef.current || !transcriptRef.current) return;
    try {
      await supabase.from('pulse_calls' as any)
        .update({ transcript: transcriptRef.current } as any)
        .eq('id', callIdRef.current);
    } catch {}
  }, []);

  return {
    onConversationStart,
    onCustomerSpeech,
    onTrudyResponse,
    onConversationEnd,
    syncTranscript,
  };
}

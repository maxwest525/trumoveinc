import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOpenRequestCount() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    const { count: c } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');
    setCount(c || 0);
  }, []);

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel('open-request-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchCount()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCount]);

  return count;
}

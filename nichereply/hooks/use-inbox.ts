'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InboxConversation {
  id: string;
  status: string;
  current_flow: string | null;
  last_message_at: string;
  contact: {
    name: string | null;
    wa_id: string;
    lead_score: number;
    lead_status: string;
  } | null;
}

export function useInbox(businessId: string | undefined) {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    async function fetchConversations() {
      const { data } = await supabase
        .from('conversations')
        .select('*, contact:contacts(name, wa_id, lead_score, lead_status)')
        .eq('business_id', businessId)
        .in('status', ['active', 'waiting', 'handed_off'])
        .order('last_message_at', { ascending: false });

      setConversations((data as any) || []);
      setLoading(false);
    }

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('inbox-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  return { conversations, loading };
}

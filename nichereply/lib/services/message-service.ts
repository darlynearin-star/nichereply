import { createAdminClient } from '@/lib/supabase/admin';
import type { Message } from '@/lib/types';

export async function getRecentMessages(businessId: string, limit = 50): Promise<Message[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('messages')
    .select('*, conversation:conversations!inner(business_id)')
    .eq('conversation.business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data as Message[]) || [];
}

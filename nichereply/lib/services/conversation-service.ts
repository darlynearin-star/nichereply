import { createAdminClient } from '@/lib/supabase/admin';
import type { Conversation, Message } from '@/lib/types';

export async function getActiveConversations(businessId: string): Promise<(Conversation & { contact: { name: string | null; wa_id: string; lead_score: number; lead_status: string } | null; lastMessage?: Message | null })[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('conversations')
    .select('*, contact:contacts(name, wa_id, lead_score, lead_status)')
    .eq('business_id', businessId)
    .in('status', ['active', 'waiting', 'handed_off'])
    .order('last_message_at', { ascending: false });

  return (data as any[]) || [];
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return (data as Message[]) || [];
}

export async function getConversationWithDetails(conversationId: string) {
  const admin = createAdminClient();
  const { data: conversation } = await admin
    .from('conversations')
    .select('*, contact:contacts(*), business:businesses(name, niche)')
    .eq('id', conversationId)
    .single();

  if (!conversation) return null;

  const messages = await getConversationMessages(conversationId);

  return { conversation, messages };
}

export async function resolveConversation(conversationId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('conversations')
    .update({ status: 'resolved' })
    .eq('id', conversationId);
}

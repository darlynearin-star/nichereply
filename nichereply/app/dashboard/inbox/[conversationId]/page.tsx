import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { ConversationPanel } from '@/components/inbox/conversation-panel';
import { InboxList } from '@/components/inbox/inbox-list';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) redirect('/dashboard/wizard');

  // Get all active conversations for the sidebar
  const { data: conversations } = await admin
    .from('conversations')
    .select('*, contact:contacts(name, wa_id, lead_score, lead_status)')
    .eq('business_id', business.id)
    .in('status', ['active', 'waiting', 'handed_off'])
    .order('last_message_at', { ascending: false });

  // Get the selected conversation with details
  const { data: conversation } = await admin
    .from('conversations')
    .select('*, contact:contacts(*), business:businesses(name, niche)')
    .eq('id', conversationId)
    .single();

  if (!conversation) redirect('/dashboard/inbox');

  // Get messages for this conversation
  const { data: messages } = await admin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      <div className="w-80 flex-shrink-0">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold">Active Conversations</h2>
        </div>
        <InboxList items={(conversations as any[]) || []} />
      </div>
      <div className="flex-1 flex flex-col">
        <ConversationPanel
          conversation={conversation as any}
          messages={(messages as any[]) || []}
          businessId={business.id}
        />
      </div>
    </div>
  );
}

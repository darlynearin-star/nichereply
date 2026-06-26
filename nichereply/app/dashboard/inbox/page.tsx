import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { InboxList } from '@/components/inbox/inbox-list';
import { Card, CardContent } from '@/components/ui/card';

export default async function InboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
          Set up your business first to see conversations.
        </CardContent>
      </Card>
    );
  }

  const { data: conversations } = await admin
    .from('conversations')
    .select('*, contact:contacts(name, wa_id, lead_score, lead_status)')
    .eq('business_id', business.id)
    .in('status', ['active', 'waiting', 'handed_off'])
    .order('last_message_at', { ascending: false });

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      <div className="w-80 flex-shrink-0">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold">Active Conversations</h2>
        </div>
        <InboxList items={(conversations as any[]) || []} />
      </div>
      <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
        <div className="text-center">
          <p className="text-lg mb-1">Select a conversation</p>
          <p className="text-sm">Choose a conversation from the list to view messages</p>
        </div>
      </div>
    </div>
  );
}

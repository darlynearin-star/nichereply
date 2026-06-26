import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { formatPhone, timeAgo } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function ContactsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">Set up your business first.</CardContent></Card>;
  }

  const { data: contacts } = await admin
    .from('contacts')
    .select('*')
    .eq('business_id', business.id)
    .order('last_message_at', { ascending: false });

  const statusColors: Record<string, string> = {
    new: 'blue',
    warm: 'yellow',
    hot: 'red',
    cold: 'gray',
    converted: 'green',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">All Contacts</h2>
        <p className="text-sm text-[var(--muted-foreground)]">{contacts?.length || 0} total</p>
      </div>

      {!contacts?.length ? (
        <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">No contacts yet.</CardContent></Card>
      ) : (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Tags</th>
                <th className="text-left px-4 py-3 font-medium">Last Message</th>
              </tr>
            </thead>
            <tbody>
              {(contacts as any[]).map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50">
                  <td className="px-4 py-3 font-medium">{c.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{formatPhone(c.wa_id)}</td>
                  <td className="px-4 py-3"><Badge color={statusColors[c.lead_status]}>{c.lead_status}</Badge></td>
                  <td className="px-4 py-3">{c.lead_score}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).map((t: string) => (
                        <Badge key={t} color="blue">{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{c.last_message_at ? timeAgo(c.last_message_at) : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

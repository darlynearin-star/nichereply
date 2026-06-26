import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { KPICards } from '@/components/layout/kpi-cards';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="space-y-6">
      {!business ? (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Welcome to NicheReply!</h2></CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">Set up your business to get started.</p>
            <a
              href="/dashboard/wizard"
              className="inline-flex h-10 items-center rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              Start Setup Wizard
            </a>
          </CardContent>
        </Card>
      ) : (
        <>
          <KPICards
            data={[
              { key: 'conversations', label: 'Conversations', value: 0 },
              { key: 'leads', label: 'Leads Captured', value: 0 },
              { key: 'bookings', label: 'Bookings', value: 0 },
              { key: 'handoffs', label: 'Handoffs', value: 0 },
              { key: 'reminders', label: 'Reminders Sent', value: 0 },
              { key: 'reply_rate', label: 'Reply Rate', value: '0%' },
            ]}
          />
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader><h3 className="font-semibold">Recent Conversations</h3></CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">No conversations yet. Connect your WhatsApp number to start receiving messages.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h3 className="font-semibold">Niche Status</h3></CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">Current niche: <span className="font-medium text-[var(--foreground)]">{business.niche}</span></p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Business: <span className="font-medium text-[var(--foreground)]">{business.name}</span></p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

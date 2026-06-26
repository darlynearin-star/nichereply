import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPhone } from '@/lib/utils';

export default async function BookingsPage() {
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

  const { data: bookings } = await admin
    .from('bookings')
    .select('*, contact:contacts(name, wa_id)')
    .eq('business_id', business.id)
    .order('date', { ascending: false });

  const statusColors: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'green',
    completed: 'blue',
    cancelled: 'red',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Bookings & Appointments</h2>
        <p className="text-sm text-[var(--muted-foreground)]">{bookings?.length || 0} total</p>
      </div>

      {!bookings?.length ? (
        <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">No bookings yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {(bookings as any[]).map((b) => (
            <Card key={b.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{b.contact?.name || formatPhone(b.contact?.wa_id || '')}</span>
                  <Badge color={statusColors[b.status]}>{b.status}</Badge>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {b.service || 'No service specified'}
                  {b.date && ` on ${b.date}`}
                  {b.time && ` at ${b.time}`}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

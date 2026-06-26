import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getLeadStats } from '@/lib/services/lead-service';
import { getBookingStats } from '@/lib/services/booking-service';

const admin = createAdminClient();

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { data: business } = await admin
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">Set up your business first.</CardContent></Card>;
  }

  const [leadStats, bookingStats, eventCounts, conversations] = await Promise.all([
    getLeadStats(business.id),
    getBookingStats(business.id),
    getEventCounts(business.id),
    getConversationCounts(business.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-sm text-[var(--muted-foreground)]">Total Conversations</p><p className="text-2xl font-bold">{conversations.total}</p></Card>
        <Card className="p-4"><p className="text-sm text-[var(--muted-foreground)]">Active Now</p><p className="text-2xl font-bold">{conversations.active}</p></Card>
        <Card className="p-4"><p className="text-sm text-[var(--muted-foreground)]">Handoffs</p><p className="text-2xl font-bold">{conversations.handoffs}</p></Card>
        <Card className="p-4"><p className="text-sm text-[var(--muted-foreground)]">Events Today</p><p className="text-2xl font-bold">{eventCounts.today}</p></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold">Lead Pipeline</h3></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'New', count: leadStats.new, color: 'bg-blue-500' },
                { label: 'Contacted', count: leadStats.contacted, color: 'bg-yellow-500' },
                { label: 'Qualified', count: leadStats.qualified, color: 'bg-purple-500' },
                { label: 'Converted', count: leadStats.converted, color: 'bg-green-500' },
                { label: 'Lost', count: leadStats.lost, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                  <div className="w-32 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${leadStats.total ? (item.count / leadStats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Booking Status</h3></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Pending', count: bookingStats.pending, color: 'bg-yellow-500' },
                { label: 'Confirmed', count: bookingStats.confirmed, color: 'bg-green-500' },
                { label: 'Completed', count: bookingStats.completed, color: 'bg-blue-500' },
                { label: 'Cancelled', count: bookingStats.cancelled, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm flex-1">{item.label}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                  <div className="w-32 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${bookingStats.total ? (item.count / bookingStats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function getEventCounts(businessId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await admin
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', today);

  return { today: count || 0 };
}

async function getConversationCounts(businessId: string) {
  const { data } = await admin
    .from('conversations')
    .select('status')
    .eq('business_id', businessId);

  if (!data) return { total: 0, active: 0, handoffs: 0 };

  return {
    total: data.length,
    active: data.filter((c) => c.status === 'active' || c.status === 'waiting').length,
    handoffs: data.filter((c) => c.status === 'handed_off').length,
  };
}

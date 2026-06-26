import { createAdminClient } from '@/lib/supabase/admin';
import type { Booking } from '@/lib/types';

export async function getBookings(businessId: string): Promise<Booking[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('bookings')
    .select('*, contact:contacts(name, wa_id)')
    .eq('business_id', businessId)
    .order('date', { ascending: false });

  return (data as any[]) || [];
}

export async function getBookingStats(businessId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('bookings')
    .select('status')
    .eq('business_id', businessId);

  if (!data) return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

  return {
    total: data.length,
    pending: data.filter((b) => b.status === 'pending').length,
    confirmed: data.filter((b) => b.status === 'confirmed').length,
    completed: data.filter((b) => b.status === 'completed').length,
    cancelled: data.filter((b) => b.status === 'cancelled').length,
  };
}

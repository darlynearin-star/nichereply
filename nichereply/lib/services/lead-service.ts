import { createAdminClient } from '@/lib/supabase/admin';
import type { Lead } from '@/lib/types';

export async function getLeads(businessId: string): Promise<Lead[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('leads')
    .select('*, contact:contacts(name, wa_id)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  return (data as any[]) || [];
}

export async function getLeadStats(businessId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('leads')
    .select('status')
    .eq('business_id', businessId);

  if (!data) return { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };

  return {
    total: data.length,
    new: data.filter((l) => l.status === 'new').length,
    contacted: data.filter((l) => l.status === 'contacted').length,
    qualified: data.filter((l) => l.status === 'qualified').length,
    converted: data.filter((l) => l.status === 'converted').length,
    lost: data.filter((l) => l.status === 'lost').length,
  };
}

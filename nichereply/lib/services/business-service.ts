import { createAdminClient } from '@/lib/supabase/admin';
import type { Business } from '@/lib/types';

export async function getBusinessForUser(userId: string): Promise<Business | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .single();

  return data as Business | null;
}

export async function createBusiness(input: {
  name: string;
  slug: string;
  ownerId: string;
  niche: string;
  phoneNumberId?: string;
  wabaId?: string;
}): Promise<Business> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('businesses')
    .insert({
      name: input.name,
      slug: input.slug,
      owner_id: input.ownerId,
      niche: input.niche,
      phone_number_id: input.phoneNumberId || null,
      waba_id: input.wabaId || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create business: ${error.message}`);
  return data as Business;
}

export async function updateBusiness(
  businessId: string,
  updates: Partial<Pick<Business, 'name' | 'niche' | 'phone_number_id' | 'waba_id' | 'config_overrides'>>
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('businesses')
    .update(updates)
    .eq('id', businessId);

  if (error) throw new Error(`Failed to update business: ${error.message}`);
}

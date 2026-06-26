import { createAdminClient } from '@/lib/supabase/admin';
import type { Contact } from '@/lib/types';

export async function getContacts(businessId: string): Promise<Contact[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('contacts')
    .select('*')
    .eq('business_id', businessId)
    .order('last_message_at', { ascending: false });

  return (data as Contact[]) || [];
}

export async function getContact(contactId: string): Promise<Contact | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  return data as Contact | null;
}

export async function updateContactTags(contactId: string, tags: string[]): Promise<void> {
  const admin = createAdminClient();
  await admin.from('contacts').update({ tags }).eq('id', contactId);
}

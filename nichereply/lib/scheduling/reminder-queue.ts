import { createAdminClient } from '@/lib/supabase/admin';
import { sendTemplateMessage } from '@/lib/whatsapp/message-sender';
import { loadNicheConfig } from '@/lib/config/loader';
import type { Reminder, Business, Contact } from '@/lib/types';

export async function processPendingReminders(): Promise<number> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Fetch all pending reminders that are due
  const { data: reminders } = await admin
    .from('reminders')
    .select('*, business:businesses(*), contact:contacts(*)')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(50);

  if (!reminders || reminders.length === 0) return 0;

  let sent = 0;

  for (const reminder of reminders) {
    const business = reminder.business as unknown as Business;
    const contact = reminder.contact as unknown as Contact;

    if (!business.phone_number_id || !contact?.wa_id) {
      await admin
        .from('reminders')
        .update({ status: 'failed' })
        .eq('id', reminder.id);
      continue;
    }

    const templateName = reminder.message_template || 'appointment_reminder';
    const success = await sendTemplateMessage(
      business.phone_number_id,
      contact.wa_id,
      templateName,
      'en',
      parseTemplateParams(reminder.template_params || {})
    );

    if (success) {
      await admin
        .from('reminders')
        .update({ status: 'sent', sent_at: now })
        .eq('id', reminder.id);
      sent++;
    } else {
      await admin
        .from('reminders')
        .update({ status: 'failed' })
        .eq('id', reminder.id);
    }
  }

  return sent;
}

export async function scheduleReminder(input: {
  businessId: string;
  contactId: string;
  conversationId: string;
  bookingId?: string;
  type: 'booking_reminder' | 'follow_up' | 're_engagement';
  delayMs: number;
  template?: string;
  params?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  const scheduledFor = new Date(Date.now() + input.delayMs).toISOString();

  await admin.from('reminders').insert({
    business_id: input.businessId,
    contact_id: input.contactId,
    conversation_id: input.conversationId,
    booking_id: input.bookingId || null,
    type: input.type,
    scheduled_for: scheduledFor,
    message_template: input.template || null,
    template_params: input.params || {},
    status: 'pending',
  });
}

function parseTemplateParams(params: Record<string, unknown>): Array<Record<string, unknown>> {
  if (!params || Object.keys(params).length === 0) return [];

  return [
    {
      type: 'body',
      parameters: Object.values(params).map((v) => ({
        type: 'text',
        text: String(v),
      })),
    },
  ];
}

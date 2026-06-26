import type { WebhookPayload, InboundMessage } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { loadNicheConfig } from '@/lib/config/loader';
import { FlowRunner } from '@/lib/engine/flow-runner';
import { sendTextMessage } from './message-sender';
import type { Business, Contact, Conversation } from '@/lib/types';

export async function handleInboundWebhook(payload: WebhookPayload): Promise<void> {
  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (!value) return;

  const phoneNumberId = value.metadata?.phone_number_id;
  if (!phoneNumberId) return;

  // Find the business by phone number ID
  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('*')
    .eq('phone_number_id', phoneNumberId)
    .single();

  if (!business) {
    console.error(`No business found for phone_number_id: ${phoneNumberId}`);
    return;
  }

  // Process inbound messages
  if (value.messages) {
    for (const msg of value.messages) {
      const inbound: InboundMessage = {
        businessPhoneNumberId: phoneNumberId,
        waId: msg.from,
        waMessageId: msg.id,
        type: msg.type,
        text: msg.text?.body || null,
        timestamp: msg.timestamp,
      };

      await processInboundMessage(business as Business, inbound);
    }
  }

  // Update message statuses
  if (value.statuses) {
    for (const status of value.statuses) {
      await admin
        .from('messages')
        .update({ status: status.status })
        .eq('wa_message_id', status.id);
    }
  }
}

async function processInboundMessage(
  business: Business,
  data: InboundMessage
): Promise<void> {
  const admin = createAdminClient();

  // 1. Find or create contact
  const { data: existingContact } = await admin
    .from('contacts')
    .select('*')
    .eq('business_id', business.id)
    .eq('wa_id', data.waId)
    .single();

  let contact: Contact;

  if (existingContact) {
    contact = existingContact as Contact;
    await admin
      .from('contacts')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', contact.id);
  } else {
    const { data: newContact } = await admin
      .from('contacts')
      .insert({
        business_id: business.id,
        wa_id: data.waId,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!newContact) throw new Error('Failed to create contact');
    contact = newContact as Contact;
  }

  // 2. Find or create active conversation
  const { data: existingConv } = await admin
    .from('conversations')
    .select('*')
    .eq('contact_id', contact.id)
    .eq('business_id', business.id)
    .in('status', ['active', 'waiting'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let conversation: Conversation;

  if (existingConv) {
    conversation = existingConv as Conversation;
  } else {
    const { data: newConv } = await admin
      .from('conversations')
      .insert({
        business_id: business.id,
        contact_id: contact.id,
        status: 'active',
        is_24h_window_open: true,
        session_expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      })
      .select()
      .single();

    if (!newConv) throw new Error('Failed to create conversation');
    conversation = newConv as Conversation;

    // Log conversation started event
    await admin.from('events').insert({
      business_id: business.id,
      event_type: 'conversation_started',
      entity_type: 'conversation',
      entity_id: conversation.id,
      metadata: { contact_id: contact.id },
    });
  }

  // 3. Save inbound message
  await admin.from('messages').insert({
    conversation_id: conversation.id,
    business_id: business.id,
    direction: 'inbound',
    message_type: data.type || 'text',
    content: data.text,
    wa_message_id: data.waMessageId,
    status: 'sent',
  });

  // 4. Load niche config and run flow engine
  const config = loadNicheConfig(business.niche);
  const engine = new FlowRunner(config);
  const result = await engine.process(business, contact, conversation, data);

  // 5. Send response if needed
  if (result.response && result.action === 'send') {
    await sendTextMessage({
      phoneNumberId: business.phone_number_id!,
      to: contact.wa_id,
      text: result.response,
      businessId: business.id,
      conversationId: conversation.id,
    });
  }

  if (result.handoff) {
    await admin
      .from('handoff_requests')
      .insert({
        business_id: business.id,
        conversation_id: conversation.id,
        contact_id: contact.id,
        reason: 'Bot initiated handoff',
        requested_by: 'bot',
        status: 'pending',
      });

    await admin
      .from('conversations')
      .update({ status: 'handed_off' })
      .eq('id', conversation.id);

    if (result.response) {
      await sendTextMessage({
        phoneNumberId: business.phone_number_id!,
        to: contact.wa_id,
        text: result.response,
        businessId: business.id,
        conversationId: conversation.id,
      });
    }
  }
}

import { createAdminClient } from '@/lib/supabase/admin';

const WA_API_VERSION = process.env.WA_API_VERSION || 'v21.0';
const WA_API_BASE = 'https://graph.facebook.com';

interface SendMessageParams {
  phoneNumberId: string;
  to: string;
  text: string;
  businessId: string;
  conversationId: string;
}

export async function sendTextMessage(params: SendMessageParams): Promise<boolean> {
  const { phoneNumberId, to, text, businessId, conversationId } = params;
  const token = process.env.WA_ACCESS_TOKEN;

  if (!token) {
    console.error('WA_ACCESS_TOKEN not configured');
    return false;
  }

  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('WhatsApp send error:', data);
      await saveMessage(businessId, conversationId, 'outbound', text, 'failed', null);
      return false;
    }

    await saveMessage(
      businessId,
      conversationId,
      'outbound',
      text,
      'sent',
      data.messages?.[0]?.id || null
    );

    return true;
  } catch (err) {
    console.error('WhatsApp send exception:', err);
    await saveMessage(businessId, conversationId, 'outbound', text, 'failed', null);
    return false;
  }
}

export async function sendTemplateMessage(
  phoneNumberId: string,
  to: string,
  templateName: string,
  language = 'en',
  components: Record<string, unknown>[] = []
): Promise<boolean> {
  const token = process.env.WA_ACCESS_TOKEN;
  if (!token) return false;

  const url = `${WA_API_BASE}/${WA_API_VERSION}/${phoneNumberId}/messages`;

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
    },
  };

  if (components.length > 0) {
    (body.template as Record<string, unknown>).components = components;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Template send error:', data);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Template send exception:', err);
    return false;
  }
}

async function saveMessage(
  businessId: string,
  conversationId: string,
  direction: 'inbound' | 'outbound',
  content: string | null,
  status: string,
  waMessageId: string | null
): Promise<void> {
  const admin = createAdminClient();
  await admin.from('messages').insert({
    business_id: businessId,
    conversation_id: conversationId,
    direction,
    message_type: 'text',
    content,
    status,
    wa_message_id: waMessageId,
  });
}

export { saveMessage as saveMessageRecord };

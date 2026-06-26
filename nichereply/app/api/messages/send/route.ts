import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTextMessage } from '@/lib/whatsapp/message-sender';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, businessId, contactWaId, text } = body;

    if (!conversationId || !businessId || !contactWaId || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: business } = await admin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (!business?.phone_number_id) {
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 400 });
    }

    const success = await sendTextMessage({
      phoneNumberId: business.phone_number_id,
      to: contactWaId,
      text,
      businessId,
      conversationId,
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Send message error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

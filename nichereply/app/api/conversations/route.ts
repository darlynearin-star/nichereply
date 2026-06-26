import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, action } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const admin = createAdminClient();

    if (action === 'resolve') {
      await admin
        .from('conversations')
        .update({ status: 'resolved' })
        .eq('id', conversationId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Conversation API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

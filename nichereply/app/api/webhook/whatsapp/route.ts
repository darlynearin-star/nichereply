import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/whatsapp/verify';
import { handleInboundWebhook } from '@/lib/whatsapp/webhook-handler';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const result = verifyWebhook(mode, token, challenge);
  if (result) {
    return new NextResponse(result, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await handleInboundWebhook(body);
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new NextResponse('OK', { status: 200 });
  }
}

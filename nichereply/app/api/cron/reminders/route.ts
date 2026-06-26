import { NextResponse } from 'next/server';
import { processPendingReminders } from '@/lib/scheduling/reminder-queue';

// Called by Supabase pg_cron or external cron service
// GET /api/cron/reminders?key=your_cron_secret
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sent = await processPendingReminders();
    return NextResponse.json({ ok: true, remindersSent: sent });
  } catch (err) {
    console.error('Reminder cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

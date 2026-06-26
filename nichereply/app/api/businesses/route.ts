import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, ownerId, niche, phoneNumberId, wabaId } = body;

    if (!name || !ownerId || !niche) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('businesses')
      .insert({
        name,
        slug: finalSlug,
        owner_id: ownerId,
        niche,
        phone_number_id: phoneNumberId || null,
        waba_id: wabaId || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A business with this slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Create business error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, ...updates } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const allowedFields = ['name', 'niche', 'phone_number_id', 'waba_id'];

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error } = await admin
      .from('businesses')
      .update(cleanUpdates)
      .eq('id', businessId)
      .eq('owner_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Update business error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    return NextResponse.json(data || null);
  } catch (err) {
    console.error('Get business error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

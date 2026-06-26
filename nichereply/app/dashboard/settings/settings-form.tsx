'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SettingsForm({ business }: { business: { id: string; name: string; slug: string; timezone: string } | null }) {
  const [name, setName] = useState(business?.name || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);

    await fetch('/api/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business.id, name }),
    });

    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      {business && (
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <Input value={business.slug} disabled className="text-[var(--muted-foreground)]" />
        </div>
      )}
      <Button type="submit" loading={saving}>Save Changes</Button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function NicheSwitcher({
  businessId,
  currentNiche,
  niches,
}: {
  businessId: string;
  currentNiche: string;
  niches: string[];
}) {
  const [selected, setSelected] = useState(currentNiche);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSwitch() {
    if (selected === currentNiche) return;
    setSaving(true);

    await fetch('/api/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, niche: selected }),
    });

    setSaving(false);
    router.refresh();
  }

  const nicheLabels: Record<string, string> = {
    salons: 'Salon & Barber Shop 💇',
    clinics: 'Clinic & Medical 🏥',
    'real-estate': 'Real Estate 🏠',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {niches.map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selected === n
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            {nicheLabels[n] || n}
          </button>
        ))}
      </div>
      {selected !== currentNiche && (
        <Button onClick={handleSwitch} loading={saving}>
          Switch to {selected}
        </Button>
      )}
    </div>
  );
}

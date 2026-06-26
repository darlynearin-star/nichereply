'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const steps = [
  { id: 'business', label: 'Business Info' },
  { id: 'niche', label: 'Choose Niche' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'done', label: 'Done' },
];

const nicheOptions = [
  { id: 'salons', label: 'Salon & Barber Shop', desc: 'Bookings, FAQs, hair & beauty services' },
  { id: 'clinics', label: 'Clinic & Medical', desc: 'Appointments, health info, patient triage' },
  { id: 'real-estate', label: 'Real Estate', desc: 'Property listings, viewings, buyer qualification' },
];

export function SetupWizard({ userId }: { userId: string }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [niche, setNiche] = useState('salons');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const router = useRouter();

  async function handleNext() {
    if (step === 0) {
      if (!name.trim()) { setError('Business name is required'); return; }
      setError('');
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/businesses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug || name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            ownerId: userId,
            niche,
            phoneNumberId: phoneNumberId || undefined,
            wabaId: wabaId || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create business');

        setBusinessId(data.id);
        setStep(3);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i <= step ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i <= step ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[var(--border)] mx-1" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {step === 0 && 'Name your business'}
            {step === 1 && 'Choose your niche'}
            {step === 2 && 'Connect WhatsApp'}
            {step === 3 && 'You\'re all set!'}
          </h2>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grace's Beauty Salon" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated from name" />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Used for your unique NicheReply URL</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {nicheOptions.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNiche(n.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    niche === n.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{n.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Connect your WhatsApp Business API. You can also set this up later.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                <Input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="From WhatsApp Business API" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WABA ID</label>
                <Input value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="WhatsApp Business Account ID" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <p className="text-[var(--muted-foreground)]">
                Your business <span className="font-medium text-[var(--foreground)]">{name}</span> is ready!
                <br />
                Using the <span className="font-medium text-[var(--foreground)]">{niche}</span> niche.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <div className="flex justify-between mt-6">
            {step > 0 && step < 3 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < 3 && (
              <Button onClick={handleNext} loading={loading} className="ml-auto">
                {step === 2 ? 'Complete Setup' : 'Continue'}
              </Button>
            )}
            {step === 3 && (
              <Button onClick={() => router.push('/dashboard')} className="ml-auto">
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { NicheConfig } from '@/lib/config/validator';

export function FlowPreview({ config }: { config: NicheConfig }) {
  const [tab, setTab] = useState<'welcome' | 'faqs' | 'booking' | 'handoff'>('welcome');

  const tabs = [
    { key: 'welcome' as const, label: 'Welcome' },
    { key: 'faqs' as const, label: 'FAQs' },
    { key: 'booking' as const, label: 'Booking' },
    { key: 'handoff' as const, label: 'Handoff' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tab === 'welcome' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">TONE</p>
              <p className="text-sm">{config.tone.voice}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">WELCOME MESSAGE</p>
              <div className="bg-[var(--muted)] rounded-lg p-3 text-sm">{config.welcome.message}</div>
            </div>
            {config.welcome.quickReplies.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-1">QUICK REPLIES</p>
                <div className="flex gap-2 flex-wrap">
                  {config.welcome.quickReplies.map((qr, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full border border-[var(--border)] text-sm">{qr}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-3">
            {config.faqs.slice(0, 5).map((faq) => (
              <details key={faq.id} className="border border-[var(--border)] rounded-lg">
                <summary className="px-3 py-2 text-sm font-medium cursor-pointer hover:bg-[var(--muted)]">{faq.question}</summary>
                <div className="px-3 py-2 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">{faq.answer}</div>
              </details>
            ))}
            {config.faqs.length > 5 && (
              <p className="text-xs text-[var(--muted-foreground)]">+{config.faqs.length - 5} more FAQs</p>
            )}
          </div>
        )}

        {tab === 'booking' && (
          <div className="space-y-3">
            <p className="text-sm">Type: <span className="font-medium">{config.booking.type}</span></p>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-2">REQUIRED FIELDS</p>
              {config.booking.fields.map((f) => (
                <div key={f.id} className="flex items-center gap-2 py-1">
                  <span className="text-sm">{f.label}</span>
                  {f.required && <span className="text-xs text-red-500">*</span>}
                  {f.options && <span className="text-xs text-[var(--muted-foreground)]">({f.options.length} options)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'handoff' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-2">HANDOFF TRIGGERS</p>
              {config.handoff.triggers.map((t) => (
                <div key={t.id} className="border border-[var(--border)] rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium">{t.triggerType.replace('_', ' ')}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{t.description}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">FALLBACK MESSAGE</p>
              <div className="bg-[var(--muted)] rounded-lg p-3 text-sm">{config.handoff.fallbackMessage}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

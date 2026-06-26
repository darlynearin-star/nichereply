import Link from 'next/link';

const niches = [
  { name: 'Salons', description: 'Book appointments, answer styling FAQs, capture leads' },
  { name: 'Clinics', description: 'Schedule visits, share health tips, triage urgent cases' },
  { name: 'Real Estate', description: 'Qualify buyers, schedule viewings, answer property FAQs' },
];

export default function LandingPage() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          WhatsApp Automation for<br />
          <span className="text-[var(--primary)]">African Small Businesses</span>
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
          NicheReply is a reusable WhatsApp automation engine. Pick your industry, plug in your number,
          and start capturing leads 24/7 — without writing a single line of code.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-xl bg-[var(--primary)] px-8 text-base font-medium text-white hover:opacity-90"
          >
            Start Free Trial
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center rounded-xl border border-[var(--border)] px-8 text-base font-medium hover:bg-[var(--muted)]"
          >
            See Pricing
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Switch Niches in One Click</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {niches.map((n) => (
            <div key={n.name} className="rounded-xl border border-[var(--border)] p-6 hover:border-[var(--primary)] transition-colors">
              <h3 className="font-semibold text-lg mb-2">{n.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{n.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--muted)] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect WhatsApp', desc: 'Link your WhatsApp Business number in 2 clicks.' },
              { step: '2', title: 'Pick Your Niche', desc: 'Select salon, clinic, real estate, or custom.' },
              { step: '3', title: 'Go Live', desc: 'NicheReply handles FAQs, bookings, and leads.' },
              { step: '4', title: 'Track & Grow', desc: 'Monitor conversations, leads, and revenue.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'UGX 50,000',
    period: '/month',
    features: ['1 business', '1 niche', '500 conversations/mo', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Growth',
    price: 'UGX 150,000',
    period: '/month',
    popular: true,
    features: ['1 business', 'All niches', '2,000 conversations/mo', 'Advanced analytics', 'WhatsApp support', 'Custom templates'],
  },
  {
    name: 'Enterprise',
    price: 'UGX 500,000',
    period: '/month',
    features: ['Up to 3 businesses', 'All niches', 'Unlimited conversations', 'White-label option', 'Priority support', 'Dedicated account manager'],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Simple, transparent pricing</h1>
      <p className="text-center text-[var(--muted-foreground)] mb-12">No hidden fees. Cancel anytime.</p>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-xl border ${p.popular ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]' : 'border-[var(--border)]'} p-6 relative`}>
            {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>}
            <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">{p.price}</span>
              <span className="text-[var(--muted-foreground)] text-sm">{p.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {p.features.map((f) => (
                <li key={f} className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                  <span className="text-green-600">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`block text-center rounded-lg h-10 leading-10 text-sm font-medium ${p.popular ? 'bg-[var(--primary)] text-white' : 'border border-[var(--border)]'} hover:opacity-90`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

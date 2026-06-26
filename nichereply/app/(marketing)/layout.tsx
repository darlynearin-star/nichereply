import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">NicheReply</Link>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Pricing</Link>
            <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Log in</Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[var(--muted-foreground)]">
          &copy; {new Date().getFullYear()} NicheReply. Built for African small businesses.
        </div>
      </footer>
    </div>
  );
}

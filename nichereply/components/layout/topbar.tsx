'use client';

import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/inbox': 'Inbox',
  '/dashboard/contacts': 'Contacts',
  '/dashboard/bookings': 'Bookings',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/wizard': 'Setup Wizard',
};

export function Topbar() {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] || 'Dashboard';

  return (
    <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--background)]">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <Avatar initials="JD" />
      </div>
    </header>
  );
}

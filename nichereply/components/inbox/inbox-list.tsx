'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, timeAgo, truncate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface InboxItem {
  id: string;
  status: string;
  current_flow: string | null;
  last_message_at: string;
  contact: {
    name: string | null;
    wa_id: string;
    lead_score: number;
    lead_status: string;
  } | null;
  lastMessage?: { content: string; created_at: string } | null;
}

export function InboxList({ items }: { items: InboxItem[] }) {
  const pathname = usePathname();

  const statusColors: Record<string, string> = {
    active: 'green',
    waiting: 'yellow',
    handed_off: 'red',
    resolved: 'gray',
  };

  const flowLabels: Record<string, string> = {
    welcome: 'New',
    faq: 'FAQ',
    booking: 'Booking',
    pricing: 'Pricing',
    handoff: 'Handoff',
  };

  return (
    <div className="border-r border-[var(--border)] overflow-y-auto">
      {items.length === 0 ? (
        <div className="p-6 text-center text-sm text-[var(--muted-foreground)]">
          No conversations yet
        </div>
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/inbox/${item.id}`}
            className={cn(
              'block px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors',
              pathname === `/dashboard/inbox/${item.id}` && 'bg-[var(--muted)]'
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar initials={(item.contact?.name || item.contact?.wa_id || '??').slice(0, 2).toUpperCase()} className="h-8 w-8 text-xs" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-sm truncate">
                    {item.contact?.name || `+${item.contact?.wa_id?.slice(0, 8)}...` || 'Unknown'}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap ml-2">
                    {timeAgo(item.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.current_flow && (
                    <Badge color={statusColors[item.status] || 'gray'}>
                      {flowLabels[item.current_flow] || item.current_flow}
                    </Badge>
                  )}
                  {item.contact && (
                    <Badge color={item.contact.lead_score >= 70 ? 'red' : item.contact.lead_score >= 40 ? 'yellow' : 'gray'}>
                      {item.contact.lead_status}
                    </Badge>
                  )}
                </div>
                {item.lastMessage && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
                    {truncate(item.lastMessage.content || '', 60)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Props {
  conversation: any;
  messages: any[];
  businessId: string;
}

export function ConversationPanel({ conversation, messages, businessId }: Props) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const contact = conversation.contact;
  const flowLabels: Record<string, string> = {
    welcome: 'Welcome',
    faq: 'Answering FAQs',
    booking: 'Booking',
    pricing: 'Pricing',
    handoff: 'Human Handoff',
    unknown: 'Unclear',
  };

  async function handleSendReply() {
    if (!replyText.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          businessId,
          contactWaId: contact.wa_id,
          text: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyText('');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    await fetch(`/api/conversations`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: conversation.id, action: 'resolve' }),
    });
    router.push('/dashboard/inbox');
    router.refresh();
  }

  const statusColors: Record<string, string> = {
    active: 'green',
    waiting: 'yellow',
    handed_off: 'red',
    resolved: 'gray',
  };

  return (
    <>
      <div className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{contact?.name || `+${contact?.wa_id?.slice(0, 12)}`}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={statusColors[conversation.status]}>{conversation.status}</Badge>
              {conversation.current_flow && (
                <Badge>{flowLabels[conversation.current_flow] || conversation.current_flow}</Badge>
              )}
              {contact && (
                <Badge color={contact.lead_score >= 70 ? 'red' : contact.lead_score >= 40 ? 'yellow' : 'gray'}>
                  Score: {contact.lead_score}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleResolve}>Mark Resolved</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No messages yet</p>
        )}
        {messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.direction === 'inbound' ? '' : 'justify-end'}`}>
            <div
              className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                msg.direction === 'inbound'
                  ? 'bg-[var(--muted)]'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.direction === 'inbound' ? 'text-[var(--muted-foreground)]' : 'text-white/70'}`}>
                {timeAgo(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] px-6 py-4">
        <div className="flex gap-3">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a reply..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
          />
          <Button onClick={handleSendReply} loading={sending}>Send</Button>
        </div>
      </div>
    </>
  );
}

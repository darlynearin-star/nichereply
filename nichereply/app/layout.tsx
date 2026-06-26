import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'NicheReply', template: '%s | NicheReply' },
  description: 'WhatsApp automation engine for African small businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

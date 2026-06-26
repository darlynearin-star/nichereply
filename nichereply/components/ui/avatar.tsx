import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Avatar({ className, initials, ...props }: HTMLAttributes<HTMLDivElement> & { initials?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium text-sm',
        'h-9 w-9',
        className
      )}
      {...props}
    >
      {initials || '?'}
    </div>
  );
}

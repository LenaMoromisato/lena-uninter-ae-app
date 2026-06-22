'use client';

import { QueryProvider } from '@core/providers/query-provider';
import { SessionProvider } from '@features/auth/contexts/session-provider';
import { TooltipProvider } from '@shadcn/ui/tooltip';
import { Toaster } from '@shadcn/ui/sonner';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </SessionProvider>
    </QueryProvider>
  );
}

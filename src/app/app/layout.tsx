import { SessionGuard } from '@features/auth/components/session-guard';
import { AppShell } from '@ui/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <AppShell>{children}</AppShell>
    </SessionGuard>
  );
}

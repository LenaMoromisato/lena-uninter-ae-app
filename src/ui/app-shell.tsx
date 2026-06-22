'use client';

import { APP_NAME, APP_TAGLINE } from '@core/constants/app';
import { ADMIN_AREA_PERMISSIONS } from '@features/auth/constants/admin-permissions';
import { authRedirect } from '@features/auth/utils/auth-redirect';
import { hasAnyPermission, hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@shadcn/ui/sidebar';
import {
  Bell,
  Calendar,
  Compass,
  Home,
  LogOut,
  MessageSquare,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { NavLink } from '@ui/nav-link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
};

const navItems: NavItem[] = [
  { href: '/app', label: 'Inicio', icon: Home },
  { href: '/app/perfil', label: 'Meu perfil', icon: User },
  { href: '/app/descobrir', label: 'Descobrir', icon: Compass, permission: 'profiles.read' },
  { href: '/app/mentorias', label: 'Mentorias', icon: Users, permission: 'mentorship_requests.read' },
  { href: '/app/conversas', label: 'Conversas', icon: MessageSquare, permission: 'conversations.read' },
  { href: '/app/eventos', label: 'Eventos', icon: Calendar, permission: 'events.read' },
  { href: '/app/notificacoes', label: 'Notificacoes', icon: Bell, permission: 'notifications.read' },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const permissions = session?.user.permissionCodes ?? [];

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(permissions, item.permission)
  );
  const showAdminLink = hasAnyPermission(permissions, [...ADMIN_AREA_PERMISSIONS]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-4">
          <NavLink href="/app" className="text-lg font-semibold">
            {APP_NAME}
          </NavLink>
          <p className="text-xs text-muted-foreground">
            {session?.user.firstName} {session?.user.lastName}
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== '/app' && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <NavLink href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {showAdminLink ? (
            <SidebarGroup>
              <SidebarGroupLabel>Sistema</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith('/admin')}
                    >
                      <NavLink href="/admin">
                        <Shield />
                        <span>Administracao</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null}
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={async () => {
              await logout();
              authRedirect('/entrar');
            }}
          >
            <LogOut />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">{APP_TAGLINE}</span>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

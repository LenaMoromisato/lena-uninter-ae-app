'use client';

import { APP_ADMIN_NAME } from '@core/constants/app';
import { ADMIN_AREA_PERMISSIONS } from '@features/auth/constants/admin-permissions';
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
import { authRedirect } from '@features/auth/utils/auth-redirect';
import { ArrowLeft, Home, LogOut, Shield, UserPlus, Users } from 'lucide-react';
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
  { href: '/admin', label: 'Inicio', icon: Home },
  { href: '/admin/roles', label: 'Papeis', icon: Shield, permission: 'roles.read' },
  { href: '/admin/usuarias', label: 'Usuarias', icon: Users, permission: 'users.read' },
  {
    href: '/admin/usuarias/nova',
    label: 'Provisionar',
    icon: UserPlus,
    permission: 'users.write',
  },
];

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const permissions = session?.user.permissionCodes ?? [];
  const canAccessAdmin = hasAnyPermission(permissions, [...ADMIN_AREA_PERMISSIONS]);

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(permissions, item.permission)
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-4">
          <NavLink href="/admin" className="text-lg font-semibold">
            {APP_ADMIN_NAME}
          </NavLink>
          <p className="text-xs text-muted-foreground">
            {session?.user.firstName} {session?.user.lastName}
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administracao</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

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
        </SidebarContent>
        <SidebarFooter className="border-t p-2 space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink href="/app">
              <ArrowLeft />
              Voltar ao app
            </NavLink>
          </Button>
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
          <span className="text-sm text-muted-foreground">
            {canAccessAdmin ? 'Area administrativa' : 'Acesso restrito'}
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

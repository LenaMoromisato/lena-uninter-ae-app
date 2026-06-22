'use client';

/** Redirect de auth/permissoes via navegacao completa — evita router antes da hidratacao. */
export function authRedirect(href: string) {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname === href) {
    return;
  }

  window.location.replace(href);
}

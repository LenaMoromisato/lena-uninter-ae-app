import type { AnchorHTMLAttributes } from 'react';

type NavLinkHref = string | { pathname?: string | null };

export type NavLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: NavLinkHref;
};

function hrefToString(href: NavLinkHref): string {
  if (typeof href === 'string') {
    return href;
  }

  if (href.pathname) {
    return href.pathname;
  }

  return '#';
}

/** Navegacao interna via ancora nativa — nunca usa next/link nem App Router (estavel no E2E/dev). */
export function NavLink({ href, ...props }: NavLinkProps) {
  return <a href={hrefToString(href)} {...props} />;
}

'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

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

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  const target = event.currentTarget.target;

  return (
    Boolean(target && target !== '_self') ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function trySoftNavigate(href: string) {
  const router = window.next?.router;
  if (!router) {
    return false;
  }

  try {
    router.push(href);
    return true;
  } catch {
    return false;
  }
}

/** Ancora nativa — nao monta next/link (evita prefetch e race com HMR/router init no dev/E2E). */
export function NavLink({ href, onClick, ...props }: NavLinkProps) {
  const hrefStr = hrefToString(href);

  return (
    <a
      href={hrefStr}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || isModifiedClick(event)) {
          return;
        }

        if (trySoftNavigate(hrefStr)) {
          event.preventDefault();
        }
      }}
    />
  );
}

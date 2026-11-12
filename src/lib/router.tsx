'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';

/** react-router-style `Link` (uses `to`) backed by next/link. */
export function Link({ to, ...rest }: { to: string } & Omit<React.ComponentProps<typeof NextLink>, 'href'>) {
  return <NextLink href={to} {...rest} />;
}

/** react-router-style `NavLink` with `isActive` className callback. */
export function NavLink({
  to,
  className,
  end,
  ...rest
}: {
  to: string;
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
} & Omit<React.ComponentProps<typeof NextLink>, 'href' | 'className'>) {
  const pathname = usePathname() || '/';
  const isActive = to === '/' || end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  return <NextLink href={to} className={cls} {...rest} />;
}

export function useLocation() {
  const pathname = usePathname() || '/';
  return { pathname, search: '', hash: '' };
}

export function useSearchParams() {
  return [useNextSearchParams()] as const;
}

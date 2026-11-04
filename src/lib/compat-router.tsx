'use client';

import React, { useCallback, useMemo } from 'react';
import NextLink from 'next/link';
import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  children: React.ReactNode;
  replace?: boolean;
}

export function Link({ to, href, children, ...props }: LinkProps) {
  const destination = to || href || '#';
  return (
    <NextLink href={destination} {...props}>
      {children}
    </NextLink>
  );
}

export function NavLink({
  to,
  href,
  children,
  className,
  ...props
}: LinkProps & {
  className?: string | ((props: { isActive: boolean }) => string);
}) {
  const pathname = usePathname();
  const destination = to || href || '#';
  const isActive = pathname === destination;

  const resolvedClass =
    typeof className === 'function' ? (className as any)({ isActive }) : className;

  return (
    <NextLink href={destination} className={resolvedClass} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
        }
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

export function useLocation() {
  const pathname = usePathname() || '/';
  return useMemo(
    () => ({
      pathname,
      search: typeof window !== 'undefined' ? window.location.search : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: 'default',
    }),
    [pathname]
  );
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>() {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams() {
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useMemo(() => {
    return new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : '');
  }, [nextSearchParams]);

  const setSearchParams = useCallback(
    (newParams: URLSearchParams | Record<string, string | number | boolean> | string) => {
      let qs = '';
      if (newParams instanceof URLSearchParams) {
        qs = newParams.toString();
      } else if (typeof newParams === 'string') {
        qs = newParams.replace(/^\?/, '');
      } else if (newParams && typeof newParams === 'object') {
        const u = new URLSearchParams();
        Object.entries(newParams).forEach(([k, v]) => {
          if (v !== undefined && v !== null) u.set(k, String(v));
        });
        qs = u.toString();
      }
      router.push(pathname + (qs ? `?${qs}` : ''), { scroll: false });
    },
    [pathname, router]
  );

  return [searchParams, setSearchParams] as const;
}

export function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const router = useRouter();

  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);

  return null;
}


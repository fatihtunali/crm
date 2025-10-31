'use client';

import { useAuth } from './auth-context';

interface RBACGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RBACGuard({ roles, children, fallback = null }: RBACGuardProps) {
  const { hasAnyRole } = useAuth();

  if (!hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

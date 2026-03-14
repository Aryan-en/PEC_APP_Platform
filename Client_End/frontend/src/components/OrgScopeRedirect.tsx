"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useParams } from "next/navigation";

/**
 * Wrapper that auto-redirects non-super-admin users to org-scoped URLs
 * Example: /dashboard → /pec/dashboard
 * 
 * Mock version: uses a default org slug 'demo' for redirects.
 */
export function OrgScopeRedirect({ children }: { children: React.ReactNode }) {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const pathname = usePathname();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock: if no orgSlug in URL, redirect to /demo/<path>
    if (!orgSlug) {
      setRedirectTo(`/demo${pathname}`);
    }
    setLoading(false);
  }, [orgSlug, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

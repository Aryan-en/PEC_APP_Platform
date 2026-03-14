"use client";

import { db, auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
/**
 * Hook to get current user's organization slug
 * Returns null if super_admin or no organization
 */
export function useOrgSlug() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  return orgSlug || null;
}

/**
 * Auto-redirect component for non-super-admin users
 * Detects user's organization and redirects to /:orgSlug/path
 */
export function OrgRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();

  useEffect(() => {
    const checkAndRedirect = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', user.uid as string));
        const userData = userDoc.data();

        if (!userData) return;

        // Super admins don't need org slug
        if (userData.role === 'super_admin') {
          return;
        }

        // If user has organization but URL doesn't have slug, redirect
        if (userData?.organizationId && !orgSlug) {
          // Get organization to find slug
          const orgDoc = await getDoc(doc(db, 'organizations', userData?.organizationId as string));
          const orgData = orgDoc.data();

          if (orgData?.slug) {
            const currentPath = window.pathname;
            router.replace(`/${orgData.slug}${currentPath}`);
          }
        }
      } catch (error) {
        console.error('Error checking organization:', error);
      }
    };

    // Check on auth state change
    const unsubscribe = onAuthStateChanged(auth, checkAndRedirect);
    return () => unsubscribe();
  }, [router.push, orgSlug]);

  return <>{children}</>;
}

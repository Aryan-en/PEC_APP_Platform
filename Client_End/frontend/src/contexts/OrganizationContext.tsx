"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Organization } from '@/types';

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Mock organization data
const MOCK_ORGANIZATION: Organization = {
  id: 'demo-org-001',
  name: 'Demo University',
  location: 'Demo City',
  type: 'university',
  verified: true,
};

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization] = useState<Organization | null>(MOCK_ORGANIZATION);
  const [isLoading] = useState(false);

  const refreshOrganization = async () => {
    console.log('[Mock] refreshOrganization called');
  };

  return (
    <OrganizationContext.Provider value={{ organization, isLoading, refreshOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}

// Helper hook to get current organization ID
export function useOrganizationId(): string | null {
  const { organization } = useOrganization();
  return organization?.id || null;
}

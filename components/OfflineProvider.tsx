'use client';

import { useOffline } from '@/hooks/useOffline';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ReactNode } from 'react';

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const offline = useOffline({
    autoSync: true,
    syncInterval: 45 * 60 * 1000 // 45 minutes
  });

  return (
    <>
      <OfflineIndicator position="top" showDetails={true} />
      {children}
    </>
  );
}

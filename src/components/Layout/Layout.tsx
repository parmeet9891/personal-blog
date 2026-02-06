'use client';

import { ReactNode } from 'react';
import Header from './Header';
import NetworkStatus from '@/components/UI/NetworkStatus';
import ClientErrorBoundary from '@/components/UI/ClientErrorBoundary';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <NetworkStatus />
      <Header />
      <main>
        <ClientErrorBoundary>
          {children}
        </ClientErrorBoundary>
      </main>
    </div>
  );
}
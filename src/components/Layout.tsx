import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sundae-dark via-sundae-surface to-sundae-dark">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-primary opacity-10 blur-3xl rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-gold opacity-10 blur-3xl rounded-full" />
      </div>

      {/* Site Header */}
      <SiteHeader />

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );
}

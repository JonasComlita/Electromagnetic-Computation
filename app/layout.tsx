import type { Metadata } from 'next';
import { Sora, IBM_Plex_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { StatusBar } from '@/components/layout/StatusBar';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sans'
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'EM Learning Lab',
  description: 'Interactive learning platform for electromagnetic fields and computational architectures.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="en" className={`${sora.variable} ${plexMono.variable}`}>
      <body className="font-[var(--font-sans)]">
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-180px)] w-full max-w-7xl px-4 py-8">{children}</main>
        <StatusBar position="bottom" />
      </body>
    </html>
  );
}

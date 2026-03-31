'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TierToggle } from '@/components/layout/TierToggle';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/guided', label: 'Guided' },
  { href: '/explore', label: 'Free Explore' },
  { href: '/compare', label: 'Architectures' },
  { href: '/about', label: 'About' }
];

export function SiteHeader(): JSX.Element {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-slatebg/85">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent/80">Electromagnetic Learning Lab</p>
          <h1 className="text-lg font-semibold text-white">Full-Stack Universe Architect</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? 'border-accent/70 bg-accent/20 text-accent'
                    : 'border-white/15 text-slate-100 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <TierToggle />
        </nav>
      </div>
    </header>
  );
}

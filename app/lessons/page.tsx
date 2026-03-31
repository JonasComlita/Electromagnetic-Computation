import Link from 'next/link';

const LESSONS = [
  { href: '/lessons/phase-1', label: 'Phase 1: The Field' },
  { href: '/lessons/phase-2', label: 'Phase 2: Relativity and Lag' },
  { href: '/lessons/phase-3', label: 'Phase 3: 4x4 vs 6-value' },
  { href: '/lessons/phase-4', label: 'Phase 4: Architectures' }
];

export default function LessonsIndexPage(): JSX.Element {
  return (
    <div className="space-y-4">
      <section className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Lesson Notes</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">MDX Narrative Library</h2>
        <p className="mt-2 text-slate-200">
          These pages provide editable conceptual text and formulas, while interactive simulations live in guided/explore pages.
        </p>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {LESSONS.map((lesson) => (
          <Link key={lesson.href} href={lesson.href} className="panel rounded-xl px-4 py-3 text-slate-100 hover:bg-white/10">
            {lesson.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

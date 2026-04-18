import Link from 'next/link';

const LESSONS = [
  { href: '/lessons/phase-1', label: 'Lesson 1: The Field' },
  { href: '/lessons/phase-2', label: 'Lesson 2: Relativity and Lag' },
  { href: '/lessons/phase-3', label: 'Lesson 3: 4x4 vs 6-value' },
  { href: '/lessons/phase-4', label: 'Lesson 4: Architectures' },
  { href: '/lessons/phase-5', label: 'Lesson 5: Transistor and Circuit Emulation' },
  { href: '/lessons/phase-6', label: 'Lesson 6: Satellite Link' }
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

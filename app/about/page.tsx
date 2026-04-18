export default function AboutPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent/75">About This Project</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Physics as information architecture</h2>
        <p className="mt-3 max-w-3xl text-slate-200">
          The curriculum is structured as a narrative bridge from field intuition to architecture design. Learners first understand
          what the field is, then why relativistic transforms matter, then how data representation choices shape compute.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="panel rounded-2xl p-4">
          <h3 className="text-xl font-semibold text-white">Core Principle</h3>
          <p className="mt-2 text-slate-200">
            A point in the electromagnetic field can be represented by six independent values: Ex, Ey, Ez, Bx, By, Bz.
          </p>
        </article>
        <article className="panel rounded-2xl p-4">
          <h3 className="text-xl font-semibold text-white">Representation Strategy</h3>
          <p className="mt-2 text-slate-200">
            UI and storage use six values; transformation logic can temporarily lift to a 4x4 tensor form for frame operations.
          </p>
        </article>
        <article className="panel rounded-2xl p-4">
          <h3 className="text-xl font-semibold text-white">Relativity Scope</h3>
          <p className="mt-2 text-slate-200">
            Computation uses Special Relativity transforms; General Relativity appears as a conceptual visualization layer.
          </p>
        </article>
        <article className="panel rounded-2xl p-4">
          <h3 className="text-xl font-semibold text-white">Progress Model</h3>
          <p className="mt-2 text-slate-200">
            V1 stores progress in local browser storage with no account requirement and keeps analytics local for learning telemetry.
          </p>
        </article>
      </section>
    </div>
  );
}

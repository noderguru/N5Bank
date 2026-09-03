export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col rounded-[24px] border border-hairline bg-surface sm:min-h-[calc(100vh-3rem)]">
        <header className="flex items-center justify-between border-b border-hairline px-5 py-4 sm:px-8">
          <span className="text-lg font-semibold tracking-[-0.04em]">
            N5Deal
          </span>
          <span className="rounded-full bg-tint px-3 py-1.5 text-xs font-medium text-brand">
            Prototype
          </span>
        </header>

        <div className="grid flex-1 items-end gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:px-12 lg:py-12">
          <div className="max-w-3xl self-center">
            <p className="mb-5 text-sm font-medium text-brand">
              M&amp;A marketplace infrastructure
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
              The marketplace is taking shape.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted-ink sm:text-lg">
              A focused workspace for buyers, sellers, and platform managers to
              discover and manage financial opportunities.
            </p>
          </div>

          <aside className="rounded-2xl bg-canvas p-5 sm:p-6" aria-label="Project status">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-ink">
                Foundation
              </span>
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline">
              <div className="bg-surface p-4">
                <dt className="text-xs text-muted-ink">Framework</dt>
                <dd className="mt-2 text-sm font-medium text-ink">Next.js 15</dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs text-muted-ink">Language</dt>
                <dd className="mt-2 text-sm font-medium text-ink">TypeScript</dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs text-muted-ink">Interface</dt>
                <dd className="mt-2 text-sm font-medium text-ink">Tailwind v4</dd>
              </div>
              <div className="bg-surface p-4">
                <dt className="text-xs text-muted-ink">Status</dt>
                <dd className="mt-2 text-sm font-medium text-ink">In progress</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}

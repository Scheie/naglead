export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 bg-nag-dark/95 border-b-2 border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse" />
          <div className="w-28 h-6 bg-zinc-800 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {[1, 2, 3, 4].map((section) => (
          <section key={section} className="space-y-4">
            <div className="w-24 h-5 bg-zinc-800 rounded animate-pulse mb-4" />
            {[1, 2].map((field) => (
              <div key={field}>
                <div className="w-16 h-3 bg-zinc-800 rounded animate-pulse mb-2" />
                <div className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </section>
        ))}

        <div className="w-full h-12 bg-zinc-800 rounded-sm animate-pulse" />
      </main>
    </div>
  );
}

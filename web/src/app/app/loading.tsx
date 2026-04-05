export default function AppLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 bg-nag-dark/95 border-b-2 border-nag-orange">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-sm animate-pulse" />
            <div>
              <div className="w-24 h-5 bg-zinc-800 rounded animate-pulse mb-1" />
              <div className="w-16 h-3 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-10 bg-zinc-800 rounded-sm animate-pulse" />
            <div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8">
        {/* Reply Now skeleton */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-zinc-800 animate-pulse" />
            <div className="w-40 h-7 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="w-32 h-5 bg-zinc-800 rounded animate-pulse mb-2" />
                    <div className="w-48 h-4 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-4 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="w-16 h-9 bg-zinc-800 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Waiting skeleton */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-zinc-800 animate-pulse" />
            <div className="w-32 h-7 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <div className="w-full h-4 bg-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Won/Lost skeleton */}
        <section className="flex gap-4">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="w-8 h-8 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="w-8 h-8 bg-zinc-800 rounded animate-pulse" />
          </div>
        </section>
      </main>
    </div>
  );
}

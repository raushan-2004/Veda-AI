export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-veda-purple-500 to-veda-indigo-500" />
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Veda AI</h1>
        </div>
        <p className="max-w-xl text-lg text-muted-foreground">
          AI-powered assessment creator platform. Generate assessments, auto-grade submissions,
          and gain real-time insights.
        </p>
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Monorepo initialized — ready for development
        </div>
      </div>
    </main>
  );
}

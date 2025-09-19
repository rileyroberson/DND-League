export default function Landing() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Screentime League</h1>
      <p className="text-neutral-600 max-w-prose">
        Compete with friends to keep weekly screentime low. Submit your time and
        view standings.
      </p>
      <div className="flex gap-3">
        <a
          href="/login"
          className="inline-flex items-center rounded-md bg-neutral-900 text-white px-4 py-2 text-sm"
        >
          Login / Join League
        </a>
        <a
          href="/standings"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm"
        >
          View Standings
        </a>
      </div>
    </section>
  );
}

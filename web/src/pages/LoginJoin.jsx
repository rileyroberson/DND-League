export default function LoginJoin() {
  return (
    <section className="max-w-md space-y-4">
      <h2 className="text-2xl font-semibold">Login / Join a League</h2>
      <form className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="code">
            Invite Code
          </label>
          <input
            id="code"
            type="text"
            className="w-full rounded-md border px-3 py-2"
            placeholder="ABC123"
          />
        </div>
        <button
          type="button"
          className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm"
        >
          Continue
        </button>
      </form>
    </section>
  );
}

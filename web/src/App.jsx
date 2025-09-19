import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            Screentime League
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/submit" className="hover:underline">
              Submit
            </Link>
            <Link to="/standings" className="hover:underline">
              Standings
            </Link>
            <Link to="/season" className="hover:underline">
              Season
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-neutral-500">
          Built with Vite + React + Tailwind
        </div>
      </footer>
    </div>
  );
}

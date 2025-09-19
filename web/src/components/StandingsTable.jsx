export default function StandingsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[480px] w-full border text-sm">
        <thead className="bg-neutral-100 text-neutral-700">
          <tr>
            <th className="px-3 py-2 text-left">Rank</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">HH:MM</th>
            <th className="px-3 py-2 text-left">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.rank}-${r.name}`} className="border-t">
              <td className="px-3 py-2">{r.rank}</td>
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2">
                {Math.floor(r.minutes / 60)}:
                {String(r.minutes % 60).padStart(2, "0")}
              </td>
              <td className="px-3 py-2">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

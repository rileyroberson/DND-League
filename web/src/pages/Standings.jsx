import StandingsTable from "../components/StandingsTable.jsx";

const rows = [
  { rank: 1, name: "Alice", minutes: 210, points: 12 },
  { rank: 2, name: "Bob", minutes: 245, points: 11 },
];

export default function Standings() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Weekly Standings</h2>
      <StandingsTable rows={rows} />
    </section>
  );
}

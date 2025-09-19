export default function SubmitForm({ value, onChange, onSubmit }) {
  return (
    <div className="max-w-md space-y-3">
      <input
        inputMode="numeric"
        placeholder="HH:MM"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 font-mono"
      />
      <button
        onClick={onSubmit}
        className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm"
      >
        Submit
      </button>
    </div>
  );
}

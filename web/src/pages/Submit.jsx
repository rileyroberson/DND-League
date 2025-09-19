import { useState } from "react";
import SubmitForm from "../components/SubmitForm.jsx";
import ScreenshotUploader from "../components/ScreenshotUploader.jsx";

export default function Submit() {
  const [tab, setTab] = useState("manual");
  const [hhmm, setHhmm] = useState("");

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Submit Screentime</h2>
      <div className="inline-flex rounded-lg border p-1 text-sm">
        <button
          className={`px-3 py-1 rounded-md ${
            tab === "manual" ? "bg-neutral-900 text-white" : ""
          }`}
          onClick={() => setTab("manual")}
        >
          Manual
        </button>
        <button
          className={`px-3 py-1 rounded-md ${
            tab === "screenshot" ? "bg-neutral-900 text-white" : ""
          }`}
          onClick={() => setTab("screenshot")}
        >
          Screenshot
        </button>
      </div>

      {tab === "manual" ? (
        <SubmitForm value={hhmm} onChange={setHhmm} onSubmit={() => {}} />
      ) : (
        <ScreenshotUploader onUpload={() => {}} />
      )}
    </section>
  );
}

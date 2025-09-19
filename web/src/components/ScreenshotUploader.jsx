import { useRef, useState } from "react";

export default function ScreenshotUploader({ onUpload }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onUpload?.(file);
  }

  return (
    <div className="max-w-md space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm"
      />
      {fileName && (
        <p className="text-sm text-neutral-600">Selected: {fileName}</p>
      )}
      <button
        type="button"
        className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm"
      >
        Upload & Parse
      </button>
    </div>
  );
}

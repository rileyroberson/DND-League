export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  // Stub: In Vercel, this file becomes an API route at /api/gemini/parse
  // Expected body: { fileUrl } or { submissionId }
  res
    .status(200)
    .json({ hhmm: "02:30", confidence: 0.9, extract: { stub: true } });
}

// Thrown when the API refuses an upload (too big, wrong type, ...), so the admin
// sees why instead of the file silently going missing.
export class UploadError extends Error {}

// Server-only: sends one file to the API's /uploads and returns its stored path.
// Kept out of the "use server" action files so it isn't exposed as an endpoint.
export async function uploadFile(file: File, token: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${process.env.API_URL}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new UploadError(`Couldn't upload "${file.name}": ${data?.error ?? `server returned ${res.status}`}`);
  }
  const data = await res.json();
  return (data.url as string) ?? null;
}

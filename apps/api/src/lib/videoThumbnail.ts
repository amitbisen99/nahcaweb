// Derives a public preview image for a video product's Store card — never
// the embeddable/playable URL itself, just a static thumbnail, so it's safe
// to include in the public product list before purchase.
export async function deriveVideoThumbnail(videoUrl: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }

  if (url.hostname.includes("youtube.com") || url.hostname === "youtu.be") {
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }

  if (url.hostname.includes("vimeo.com")) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { thumbnail_url?: string };
      return data.thumbnail_url ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

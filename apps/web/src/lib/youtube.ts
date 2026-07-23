// Converts common YouTube URL formats (watch?v=, youtu.be/, embed/) into an
// embeddable player URL. Returns null if the URL isn't a recognizable
// YouTube link, so callers can fall back to a plain "watch" link instead.
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

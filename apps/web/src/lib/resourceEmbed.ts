import { toVideoEmbedUrl } from "@/lib/store";

export interface ResourceEmbed {
  src: string;
  // From the pasted embed code, when it gave one (audio players like Spotify's
  // are short bars, not 16:9).
  height: number | null;
}

// Works out the player to show for a podcast/video: the iframe in the embed
// code an admin pasted, else a player built from a YouTube/Vimeo link. Only the
// iframe's address is used — never the pasted markup itself — and only https
// ones, so the embed box can't be made to run anything else.
export function getResourceEmbed(resource: { embedCode: string | null; linkUrl: string | null }): ResourceEmbed | null {
  if (resource.embedCode) {
    const tag = resource.embedCode.match(/<iframe\b[^>]*>/i)?.[0];
    const rawSrc = tag?.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (tag && rawSrc) {
      const src = rawSrc.startsWith("//") ? `https:${rawSrc}` : rawSrc;
      if (/^https:\/\//i.test(src)) {
        const height = Number(tag.match(/\sheight\s*=\s*["']?(\d+)/i)?.[1]);
        return { src, height: height > 0 && height <= 700 ? height : null };
      }
    }
  }
  const auto = resource.linkUrl ? toVideoEmbedUrl(resource.linkUrl) : null;
  return auto ? { src: auto, height: null } : null;
}

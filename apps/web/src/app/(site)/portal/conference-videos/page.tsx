import { auth } from "@/auth";
import { getMemberConferenceVideos } from "@/lib/api";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

export default async function PortalConferenceVideosPage() {
  const session = await auth();
  const videos = session?.apiToken ? await getMemberConferenceVideos(session.apiToken) : [];

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Conference Videos</h1>
      <p className="mt-2 text-ink/70">Recordings from past NAHCA conferences — a member-only benefit.</p>

      {videos.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">No conference videos published yet.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {videos.map((video) => {
            const embedUrl = getYouTubeEmbedUrl(video.videoUrl);
            return (
              <div key={video.id} className="rounded-xl border border-ink/10 bg-white p-4">
                {embedUrl ? (
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video items-center justify-center rounded-lg bg-ink/5 text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    Watch video →
                  </a>
                )}

                <p className="mt-3 font-heading text-base font-medium text-heading">{video.title}</p>
                <p className="mt-1 text-sm text-ink/50">
                  {[video.year, video.category].filter(Boolean).join(" · ")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

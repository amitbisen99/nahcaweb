import { auth } from "@/auth";
import { getMemberConferenceVideos } from "@/lib/api";
import { getResourceEmbed } from "@/lib/resourceEmbed";

export default async function PortalConferenceVideosPage() {
  const session = await auth();
  const videos = session?.apiToken ? await getMemberConferenceVideos(session.apiToken) : [];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div>
      <h1 className="font-heading text-3xl font-medium text-heading">Conference Videos</h1>
      <p className="mt-2 text-black">Recordings from past NAHCA conferences — a member-only benefit.</p>

      {videos.length === 0 ? (
        <p className="mt-6 text-sm text-black">No conference videos published yet.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {videos.map((video) => {
            // An uploaded file plays first, then the embed code, then the link.
            const embed = video.videoFileUrl ? null : getResourceEmbed({ embedCode: video.embedCode, linkUrl: video.videoUrl });
            const thumbnail = video.thumbnailUrl ? `${apiUrl}${video.thumbnailUrl}` : undefined;
            return (
              <div key={video.id} className="rounded-xl border border-ink/10 bg-white p-4">
                {video.videoFileUrl ? (
                  <video
                    controls
                    preload="metadata"
                    poster={thumbnail}
                    src={`${apiUrl}${video.videoFileUrl}`}
                    className="aspect-video w-full rounded-lg bg-black"
                  />
                ) : embed ? (
                  <div
                    className={`overflow-hidden rounded-lg ${embed.height ? "" : "aspect-video"}`}
                    style={embed.height ? { height: embed.height } : undefined}
                  >
                    <iframe
                      src={embed.src}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                ) : video.videoUrl ? (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video items-center justify-center rounded-lg bg-ink/5 bg-cover bg-center text-sm font-semibold text-brand hover:text-brand-dark"
                    style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
                  >
                    <span className="rounded-lg bg-white/90 px-4 py-2">Watch video →</span>
                  </a>
                ) : null}

                <p className="mt-3 font-heading text-base font-medium text-heading">{video.title}</p>
                <p className="mt-1 text-sm text-black">
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

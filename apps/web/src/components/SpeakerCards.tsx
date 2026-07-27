import type { CmsSpeaker } from "@/lib/cms";

// Small overlapping avatar stack for list/card previews — surfaces speaker
// faces before a visitor clicks through, as a trust signal on Event and
// Webinar listing cards (not just the detail page).
export function SpeakerAvatarStack({ speakers, max = 2 }: { speakers: CmsSpeaker[]; max?: number }) {
  const shown = speakers.slice(0, max);
  const remaining = speakers.length - shown.length;

  return (
    <div className="flex flex-none items-center">
      <div className="flex -space-x-2">
        {shown.map((speaker, index) =>
          speaker.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded file from an arbitrary host, not in next.config.js image patterns
            <img
              key={index}
              src={`${process.env.NEXT_PUBLIC_API_URL}${speaker.photoUrl}`}
              alt={speaker.name}
              title={speaker.name}
              className="h-8 w-8 flex-none rounded-full border-2 border-white object-cover"
            />
          ) : (
            <div
              key={index}
              title={speaker.name}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-white bg-sand text-xs font-semibold text-heading"
            >
              {speaker.name.charAt(0).toUpperCase()}
            </div>
          )
        )}
      </div>
      {remaining > 0 && <span className="ml-1.5 text-xs font-medium text-white/80">+{remaining}</span>}
    </div>
  );
}

export function SpeakerCards({ speakers }: { speakers: CmsSpeaker[] }) {
  return (
    <div className="mt-6">
      <h2 className="font-heading text-lg font-medium text-heading">
        {speakers.length > 1 ? "Speakers" : "Speaker"}
      </h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {speakers.map((speaker, index) => (
          <div key={`${speaker.name}-${index}`} className="flex items-center gap-4">
            {speaker.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded file from an arbitrary host, not in next.config.js image patterns
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${speaker.photoUrl}`}
                alt={speaker.name}
                className="h-16 w-16 flex-none rounded-full border border-ink/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-sand text-lg font-semibold text-heading">
                {speaker.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-heading font-medium text-heading">{speaker.name}</p>
              {speaker.title && <p className="mt-0.5 text-sm text-black">{speaker.title}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

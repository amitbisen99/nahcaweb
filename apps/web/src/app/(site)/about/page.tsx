import { Container } from "@/components/Container";
import { EventBanner } from "@/components/EventBanner";
import { getBoardMembers } from "@/lib/cms";

export default async function AboutPage() {
  const boardMembers = await getBoardMembers();

  return (
    <>
      <EventBanner title="About Us" image="/brand/temple-home.jpg" />

      {/* NAHCA Board */}
      <section id="board" className="bg-white py-20">
        <Container>
          <div>
            <h2 className="font-heading text-[36px] font-bold text-heading">2026-2029 NAHCA Board</h2>
            <p className="mt-4 text-black">
              Meet the volunteer leaders who guide NAHCA&apos;s mission to support Hindu chaplains and
              the communities they serve.
            </p>
          </div>

          {boardMembers.length === 0 ? (
            <p className="mt-14 text-sm text-black">Board member profiles will be published here soon.</p>
          ) : (
            <div className="mt-14 flex flex-col gap-16">
              {boardMembers.map((member) => (
                <div key={member.id} className="grid gap-8 sm:grid-cols-[180px_1fr] sm:items-start">
                  {member.photoUrl && (
                    <div className="mx-auto h-[225px] w-[180px] flex-none overflow-hidden rounded-lg sm:mx-0">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${member.photoUrl}`}
                        alt={member.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h2 className="font-heading text-xl font-medium text-heading">{member.name}</h2>
                    {member.role && (
                      <p className="mt-1 text-center text-sm font-semibold uppercase tracking-wide text-brand sm:text-left">
                        {member.role}
                      </p>
                    )}
                    {member.bio && (
                      <p className="mt-4 whitespace-pre-line text-center text-black sm:text-justify">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

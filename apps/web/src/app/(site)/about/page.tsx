import { SVGProps } from "react";
import { Container } from "@/components/Container";
import { getBoardMembers } from "@/lib/cms";

function DiamondIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l5 10-5 10-5-10z" />
    </svg>
  );
}

export default async function AboutPage() {
  const boardMembers = await getBoardMembers();

  return (
    <>
      {/* NAHCA Board */}
      <section id="board" className="bg-white py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              <DiamondIcon className="h-3 w-3" />
              About Us
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold text-heading">NAHCA Board</h1>
            <p className="mt-4 text-ink/70">
              Meet the volunteer leaders who guide NAHCA&apos;s mission to support Hindu chaplains and
              the communities they serve.
            </p>
          </div>

          {boardMembers.length === 0 ? (
            <p className="mt-14 text-sm text-ink/50">Board member profiles will be published here soon.</p>
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
                      <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand">
                        {member.role}
                      </p>
                    )}
                    {member.bio && (
                      <p className="mt-4 whitespace-pre-line text-ink/75">{member.bio}</p>
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

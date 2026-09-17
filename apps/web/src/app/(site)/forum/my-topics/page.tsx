import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getMyForumTopics } from "@/lib/forum";
import { MyForumTopicsList } from "@/components/MyForumTopicsList";

export default async function MyForumTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>;
}) {
  const { posted } = await searchParams;
  const session = await auth();
  const token = session?.apiToken ?? "";
  const topics = await getMyForumTopics(token);

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-12">
        <Link href="/forum" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Forum
        </Link>
        <h1 className="mt-1 font-heading text-3xl font-medium text-heading">My Topics</h1>

        {posted === "published" && (
          <div className="mt-4 rounded-lg border border-forest/30 bg-forest/5 p-3 text-sm text-black">
            Your topic has been posted.
          </div>
        )}
        {posted === "pending" && (
          <div className="mt-4 rounded-lg border border-forest/30 bg-forest/5 p-3 text-sm text-black">
            Your topic was submitted and is awaiting admin review.
          </div>
        )}

        <div className="mt-6">
          <MyForumTopicsList topics={topics} />
        </div>
      </div>
    </Container>
  );
}

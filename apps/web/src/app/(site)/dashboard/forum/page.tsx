import Link from "next/link";
import { auth } from "@/auth";
import { getMyForumTopics } from "@/lib/forum";
import { MyForumTopicsList } from "@/components/MyForumTopicsList";

export default async function DashboardForumPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";
  const topics = await getMyForumTopics(token);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-3xl font-medium text-heading">My Forum Topics</h1>
        <Link href="/forum" className="text-sm font-semibold text-brand hover:text-brand-dark">
          Browse Forum →
        </Link>
      </div>

      <div className="mt-6">
        <MyForumTopicsList topics={topics} />
      </div>
    </div>
  );
}

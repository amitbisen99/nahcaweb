import Link from "next/link";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getForumCategories } from "@/lib/forum";
import { getMyMemberships } from "@/lib/api";
import { NewTopicForm } from "./NewTopicForm";

export default async function NewForumTopicPage() {
  const session = await auth();
  const token = session?.apiToken ?? "";

  const [categories, memberships] = await Promise.all([
    getForumCategories(token),
    getMyMemberships(token),
  ]);

  const canPostMembersOnly =
    session?.user?.role === "admin" || memberships.some((m) => m.status === "active");

  return (
    <Container>
      <div className="mx-auto max-w-2xl py-12">
        <Link href="/forum" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Forum
        </Link>
        <h1 className="mt-1 font-heading text-3xl font-medium text-heading">New Topic</h1>
        <div className="mt-6">
          <NewTopicForm categories={categories} canPostMembersOnly={canPostMembersOnly} />
        </div>
      </div>
    </Container>
  );
}

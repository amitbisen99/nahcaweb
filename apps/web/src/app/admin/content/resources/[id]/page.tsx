import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getContentItem } from "@/lib/adminApi";
import { saveResource } from "../actions";
import { ResourceForm, type ResourceFormItem } from "@/components/admin/ResourceForm";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const item = await getContentItem("resources", id, session?.apiToken ?? "");
  if (!item) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/content/resources" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Resources
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">Edit Resource</h1>
      <div className="mt-8">
        <ResourceForm action={saveResource.bind(null, id)} item={item as ResourceFormItem} />
      </div>
    </div>
  );
}

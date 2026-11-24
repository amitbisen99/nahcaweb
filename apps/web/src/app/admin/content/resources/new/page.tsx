import Link from "next/link";
import { saveResource } from "../actions";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewResourcePage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/content/resources" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Resources
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">New Resource</h1>
      <div className="mt-8">
        <ResourceForm action={saveResource.bind(null, null)} />
      </div>
    </div>
  );
}

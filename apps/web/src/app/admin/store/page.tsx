import Link from "next/link";
import { auth } from "@/auth";
import { listAdminProducts } from "@/lib/adminStore";
import { formatDate } from "@/lib/formatDate";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export default async function AdminStorePage() {
  const session = await auth();
  const products = session?.apiToken ? await listAdminProducts(session.apiToken) : [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium text-heading">Store</h1>
          <p className="mt-1 text-sm text-black">Digital products for sale — videos (streamed only) and files.</p>
        </div>
        <Link
          href="/admin/store/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-black">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/40 text-xs uppercase tracking-wide text-black">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink/10 align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link href={`/admin/store/${p.id}`} className="hover:text-brand">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-black capitalize">{p.type}</td>
                  <td className="px-4 py-3 text-black">${(p.priceCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-black"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <ProductRowActions product={p} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Container } from "@/components/Container";
import { listProducts } from "@/lib/store";

const TYPE_LABELS = { video: "Video", file: "Download" } as const;

export default async function StorePage() {
  const products = await listProducts();

  return (
    <Container>
      <div className="py-12">
        <h1 className="font-heading text-3xl font-medium text-heading">Store</h1>
        <p className="mt-1 text-sm text-black">
          Videos and downloadable resources from NAHCA. Browse freely — you&rsquo;ll need to sign in to purchase.
        </p>

        {products.length === 0 ? (
          <p className="mt-6 text-sm text-black">Nothing for sale yet — check back soon.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.id}`}
                className="flex flex-col gap-2 rounded-xl border border-ink/10 bg-white p-5 transition-colors hover:border-brand"
              >
                <span className="self-start rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-black">
                  {TYPE_LABELS[p.type]}
                </span>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="line-clamp-3 text-sm text-black/70">{p.description}</p>
                <p className="mt-auto text-sm font-semibold text-brand-dark">
                  ${(p.priceCents / 100).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

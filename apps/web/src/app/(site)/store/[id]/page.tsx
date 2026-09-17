import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { auth } from "@/auth";
import { getProduct, toVideoEmbedUrl } from "@/lib/store";
import { PurchaseButton } from "./PurchaseButton";

export default async function StoreProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const { status } = await searchParams;
  const session = await auth();
  const token = session?.apiToken ?? "";
  const result = await getProduct(productId, token);
  if (!result) notFound();
  const { product, owned } = result;

  return (
    <Container>
      <div className="mx-auto max-w-2xl py-12">
        <Link href="/store" className="text-sm font-semibold text-brand hover:text-brand-dark">
          ← Store
        </Link>

        {status === "success" && (
          <div className="mt-4 rounded-lg border border-forest/30 bg-forest/5 p-3 text-sm text-black">
            Thanks for your purchase! It&rsquo;s ready below.
          </div>
        )}
        {status === "cancelled" && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-black">
            Checkout was cancelled — you haven&rsquo;t been charged.
          </div>
        )}

        <span className="mt-4 inline-block rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-black">
          {product.type === "video" ? "Video" : "Download"}
        </span>
        <h1 className="mt-1 font-heading text-3xl font-medium text-heading">{product.title}</h1>
        <div
          className="mt-3 text-base text-black [&_a]:text-brand [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        {owned ? (
          <div className="mt-6 rounded-xl border border-ink/10 bg-white p-6">
            {product.type === "video" ? (
              product.videoUrl && toVideoEmbedUrl(product.videoUrl) ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    src={toVideoEmbedUrl(product.videoUrl)!}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  This video link couldn&rsquo;t be loaded — please contact NAHCA for help.
                </p>
              )
            ) : (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${product.fileUrl}`}
                className="inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Download
              </a>
            )}
          </div>
        ) : session?.apiToken ? (
          <div className="mt-6">
            <PurchaseButton productId={product.id} priceCents={product.priceCents} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-lg font-semibold text-heading">${(product.priceCents / 100).toFixed(2)}</p>
            <p className="text-sm text-black">
              <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark">
                create a free account
              </Link>{" "}
              to purchase.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

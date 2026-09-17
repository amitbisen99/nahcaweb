import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getAdminProduct } from "@/lib/adminStore";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const session = await auth();
  const product = session?.apiToken ? await getAdminProduct(productId, session.apiToken) : null;
  if (!product) notFound();

  const action = updateProduct.bind(null, productId);

  return (
    <div>
      <Link href="/admin/store" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Store
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">Edit Product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm product={product} action={action} />
      </div>
    </div>
  );
}

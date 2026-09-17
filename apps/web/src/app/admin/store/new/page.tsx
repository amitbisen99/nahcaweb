import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/store" className="text-sm font-semibold text-brand hover:text-brand-dark">
        ← Store
      </Link>
      <h1 className="mt-1 font-heading text-3xl font-medium text-heading">New Product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm action={createProduct} />
      </div>
    </div>
  );
}

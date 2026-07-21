import { AdminMembershipPlan } from "@/lib/adminApi";
import { Button } from "@/components/Button";

export function MembershipPlanForm({
  plan,
  action,
}: {
  plan: AdminMembershipPlan;
  action: (formData: FormData) => Promise<void>;
}) {
  const isInstitutional = plan.type === "institutional";

  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={plan.name}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Term (display text, e.g. &ldquo;per year&rdquo;)</span>
        <input
          type="text"
          name="term"
          required
          defaultValue={plan.term}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      {isInstitutional ? (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">Price per student (USD)</span>
            <input
              type="number"
              name="pricePerStudent"
              step="0.01"
              min={0}
              required
              defaultValue={((plan.pricePerStudentCents ?? 0) / 100).toFixed(2)}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">Minimum students</span>
            <input
              type="number"
              name="minStudents"
              min={1}
              required
              defaultValue={plan.minStudents ?? 5}
              className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
            />
          </label>
        </>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Price (USD)</span>
          <input
            type="number"
            name="price"
            step="0.01"
            min={0}
            required
            defaultValue={(plan.priceCents / 100).toFixed(2)}
            className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
          />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Description</span>
        <textarea
          name="note"
          required
          rows={4}
          defaultValue={plan.note}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Benefits (one per line)</span>
        <textarea
          name="benefits"
          required
          rows={6}
          defaultValue={plan.benefits}
          className="rounded-lg border border-ink/20 bg-white px-3 py-2 focus:border-brand focus:outline-none"
        />
      </label>

      <Button type="submit" className="mt-2 self-start">
        Save
      </Button>
    </form>
  );
}

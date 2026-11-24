import { redirect } from "next/navigation";

// Newsletters now live in the Resource Library.
export default function NewslettersPage() {
  redirect("/resources/newsletters");
}

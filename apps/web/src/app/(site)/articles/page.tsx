import { redirect } from "next/navigation";

// Articles now live in the Resource Library.
export default function ArticlesPage() {
  redirect("/resources/articles");
}

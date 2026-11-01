import { MyEventsView } from "@/components/MyEventsView";

export default async function MyEventsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <MyEventsView basePath="/portal/events" type={type} />;
}

import { Container } from "./Container";

export function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Container>
      <div className="py-16">
        <h1 className="font-heading text-3xl font-medium text-heading">{title}</h1>
        <p className="mt-4 max-w-2xl text-ink/70">{description}</p>
        <p className="mt-8 text-sm text-ink/40">Content for this page will be built out in a follow-up phase.</p>
      </div>
    </Container>
  );
}

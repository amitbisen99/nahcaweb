import { Container } from "./Container";
import { EventBanner } from "./EventBanner";

export function PagePlaceholder({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <>
      <EventBanner title={title} image={image} />
      <Container>
        <div className="py-16">
          <p className="text-black">{description}</p>
          <p className="mt-8 text-sm text-black">Content for this page will be built out in a follow-up phase.</p>
        </div>
      </Container>
    </>
  );
}

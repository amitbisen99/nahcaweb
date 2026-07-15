import Image from "next/image";
import { Container } from "./Container";

export function EventBanner({ title, image }: { title: string; image: string }) {
  return (
    <section className="relative isolate -mt-16 h-[300px] overflow-hidden lg:-mt-20 lg:h-[340px]">
      <Image src={image} alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/70 to-forest/40" />

      <Container>
        <div className="relative flex h-[300px] items-end pb-10 lg:h-[340px]">
          <h1 className="font-heading text-3xl font-medium italic leading-tight text-white sm:text-4xl">
            {title}
          </h1>
        </div>
      </Container>
    </section>
  );
}

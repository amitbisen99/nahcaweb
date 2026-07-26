import Image from "next/image";
import { Container } from "./Container";

export function EventBanner({ title, image }: { title: string; image: string }) {
  return (
    <section className="relative isolate -mt-16 h-[300px] overflow-hidden lg:-mt-20 lg:h-[340px]">
      <Image src={image} alt="" fill priority className="object-cover" />

      <Container>
        <div className="relative flex h-[300px] items-end pb-10 lg:h-[340px]">
          <h1 className="line-clamp-2 max-w-xl font-heading text-[30px] font-medium leading-tight text-white sm:text-[36px]">
            {title}
          </h1>
        </div>
      </Container>
    </section>
  );
}

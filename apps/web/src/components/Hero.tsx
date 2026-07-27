import { Container } from "./Container";
import { Button } from "./Button";

export function Hero() {
  return (
    <section className="relative isolate -mt-16 overflow-hidden lg:-mt-20">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xs"
      >
        <source src="/brand/homevideo2.mp4" type="video/mp4" />
      </video>

      <Container>
        <div className="relative flex min-h-[560px] flex-col justify-center gap-6 pb-24 pt-40 text-white lg:pt-44">
          <h1 className="max-w-4xl text-[36px] font-heading font-bold leading-tight [text-shadow:1px_1px_#212121] sm:text-[48px] lg:text-[60px]">
            North American Hindu Chaplains Association
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
            We offer a sacred space to connect with current and aspiring spiritual care-givers in
            higher education, healthcare, corrections, military and community settings in order to
            learn how Hindu chaplains have approached their spiritual care-giving.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button href="/membership">Become a Member</Button>
            <Button
              href="/what-is-hindu-chaplaincy/community"
              variant="ghost"
              className="!border-white !text-white hover:!bg-white hover:!text-brand"
            >
              Visit Our Community
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

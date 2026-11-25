import { preload } from "react-dom";
import { Container } from "./Container";
import { Button } from "./Button";

const VIDEO = "/brand/homevideo2.mp4";
// The video's first frame (about 40 KB). It shows while the video downloads, and
// stays if the video can't play (slow network, phone battery saver). Re-create
// it whenever the video is replaced.
const POSTER = "/brand/homevideo2-poster.jpg";

export function Hero() {
  preload(POSTER, { as: "image", fetchPriority: "high" });

  return (
    // The dark background keeps the white heading readable before anything loads.
    <section className="relative isolate -mt-16 overflow-hidden bg-neutral-800 lg:-mt-20">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xs"
      >
        <source src={VIDEO} type="video/mp4" />
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
              href="/forum"
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

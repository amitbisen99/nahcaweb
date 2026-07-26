import Image from "next/image";
import { Button } from "./Button";
import { ChevronIcon, DiamondIcon } from "./icons";

type Card = {
  image: string;
  title: string;
  lead?: string;
  items: string[];
  trailing?: string;
  cta?: boolean;
};

const CARDS: Card[] = [
  {
    image: "/chaplaincy/puja.jpg",
    title: "Endorsement & Certification",
    items: [
      "We are an endorsing body for Hindu candidates applying to become Board Certified Chaplains through APC and to become Certified Educator Candidates through ACPE",
      "We offer endorsement and mentorship for Hindu spiritual care professionals in higher education",
      "Our members work in higher education, healthcare, community, and military spaces",
    ],
  },
  {
    image: "/chaplaincy/colorful-palm-leaf-books.jpg",
    title: "Education & Field Partnerships",
    items: [
      "We are an accredited Field Education Site for Harvard & Yale Divinity School M.Div students",
      "We cultivate important partnerships with professional chaplaincy and spiritual care organizations",
      "We consult for hiring managers seeking to fill jobs in Hindu spiritual care",
    ],
  },
  {
    image: "/chaplaincy/lotus-flower-candle-holder.webp",
    title: "Professional Development",
    lead: "Our unique professional development programs offer opportunities to",
    items: ["Network", "Share ideas and resources", "Learn and lead"],
    trailing:
      "Our newsletters keep you updated on what's current in the field as well as employment and educational opportunities",
    cta: true,
  },
];

function ChevronList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[16px] leading-snug text-white/90">
          <ChevronIcon className="mt-0.5 h-3 w-3 flex-none text-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function WhatIsNahcaCards() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {CARDS.map((card) => (
        <div
          key={card.title}
          className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/10"
        >
          <Image
            src={card.image}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Default state: title label over a bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-6 transition-opacity duration-300 group-hover:opacity-0">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand text-white">
              <DiamondIcon className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-white">{card.title}</h3>
          </div>

          {/* Hover state: full description overlay */}
          <div className="absolute inset-0 flex flex-col justify-center overflow-hidden bg-navy/95 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="font-heading text-[22px] font-semibold text-white">{card.title}</h3>
            {card.lead && <p className="mt-1.5 text-[16px] leading-snug text-white/90">{card.lead}</p>}
            <div className="mt-1.5">
              <ChevronList items={card.items} />
            </div>
            {card.trailing && <p className="mt-1.5 text-[16px] leading-snug text-white/90">{card.trailing}</p>}
            {card.cta && (
              <div className="mt-2">
                <Button href="/membership" className="!px-4 !py-1.5 !text-[13px]">
                  Join Us!
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { Container } from "./Container";
import { DiamondIcon } from "./icons";

const TRUST_ITEMS = [
  "Endorsing Body for APC Board Certification",
  "Endorsing Body for ACPE Certified Educators",
  "Field Education Site — Harvard & Yale Divinity Schools",
  "Serving Higher Ed, Healthcare, Military & Community",
];

export function TrustStrip() {
  return (
    <div className="bg-navy py-5">
      <Container>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/90 sm:text-sm"
            >
              <DiamondIcon className="h-3 w-3 flex-none text-brand" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

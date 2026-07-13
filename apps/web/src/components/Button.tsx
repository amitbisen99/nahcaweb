import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

const BASE =
  "inline-flex items-center justify-center rounded-lg px-6 py-3 font-body text-sm font-semibold transition-colors duration-200";

const VARIANTS = {
  solid: "bg-brand text-white hover:bg-brand-dark",
  outline: "bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/5",
  ghost: "bg-white/10 text-white border border-white/40 backdrop-blur hover:bg-white hover:text-forest",
};

export function Button({
  href,
  variant = "solid",
  children,
  className = "",
  ...rest
}: {
  href?: string;
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

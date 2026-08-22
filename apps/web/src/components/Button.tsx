import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

const BASE = "inline-flex items-center justify-center rounded-lg font-body font-semibold transition-colors duration-200";

const VARIANTS = {
  solid: "bg-brand text-white hover:bg-brand-dark",
  outline: "bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/5",
  ghost: "bg-white/10 text-white border border-white/40 backdrop-blur hover:bg-white hover:text-brand",
};

// "md" matches the size this component always used before "sm" existed —
// every existing call site is unaffected by omitting the prop.
const SIZES = {
  md: "px-6 py-3 text-sm",
  sm: "px-4 py-2 text-xs",
};

export function Button({
  href,
  target,
  rel,
  variant = "solid",
  size = "md",
  children,
  className = "",
  ...rest
}: {
  href?: string;
  target?: string;
  rel?: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
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

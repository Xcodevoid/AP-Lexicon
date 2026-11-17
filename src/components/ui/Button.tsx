import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "outline";
type Size = "sm" | "md" | "lg";

const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background,box-shadow,transform,color] duration-150 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none select-none";
const variants: Record<Variant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-800 shadow-card dark:bg-brand-500 dark:hover:bg-brand-400",
  accent: "bg-brand-500 text-white hover:bg-brand-600 shadow-glow",
  secondary: "surface hover:bg-[rgb(var(--bg-sunken))] text-[rgb(var(--fg))]",
  outline: "border border-current/20 hover:bg-[rgb(var(--bg-sunken))]",
  ghost: "hover:bg-[rgb(var(--bg-sunken))] text-[rgb(var(--fg))]",
  danger: "bg-coral-500 text-white hover:bg-coral-600",
};
const sizes: Record<Size, string> = { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-[15px]", lg: "h-[52px] px-6 text-base" };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest }, ref) {
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({ href, variant = "primary", size = "md", className, children, icon, ...rest }: { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode; icon?: ReactNode; prefetch?: boolean; "aria-label"?: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

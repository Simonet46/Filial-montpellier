import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-mhb-orange to-mhb-orange-light text-white shadow-[0_0_24px_-6px_var(--color-mhb-orange)] hover:brightness-110",
  secondary:
    "border border-mhb-blue-light/40 bg-mhb-blue/15 text-text hover:bg-mhb-blue/30 hover:border-mhb-blue-light/70",
  ghost: "text-muted hover:text-text hover:bg-white/5",
  danger: "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
};

export function buttonClass(variant: Variant = "primary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-display font-semibold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "h-10 px-4 text-[0.95rem]" : "h-8 px-3 text-sm",
    variants[variant],
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: "sm" | "md" }) {
  return <Link {...props} className={cn(buttonClass(variant, size), className)} />;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: "sm" | "md" }) {
  return <button {...props} className={cn(buttonClass(variant, size), className)} />;
}

export function Panel({
  title,
  kicker,
  action,
  children,
  className,
  hud = false,
}: {
  title?: ReactNode;
  kicker?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  hud?: boolean;
}) {
  return (
    <section className={cn("glass min-w-0 rounded-2xl p-5", hud && "hud", className)}>
      {(title || action || kicker) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {kicker && <p className="label mb-1">{kicker}</p>}
            {title && (
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-text">
                {title}
              </h2>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

type Tone = "blue" | "orange" | "celeste" | "sol" | "neutral" | "green" | "red";
const tones: Record<Tone, string> = {
  blue: "border-mhb-blue-light/40 bg-mhb-blue/15 text-mhb-blue-light",
  orange: "border-mhb-orange/40 bg-mhb-orange/15 text-mhb-orange-light",
  celeste: "border-celeste/40 bg-celeste/10 text-celeste",
  sol: "border-sol/40 bg-sol/10 text-sol",
  neutral: "border-white/10 bg-white/5 text-muted",
  green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  red: "border-red-400/40 bg-red-400/10 text-red-300",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  title,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[0.68rem] font-medium uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="animate-rise">
        {kicker && <p className="label mb-2 text-mhb-orange-light">{kicker}</p>}
        <h1 className="font-display text-4xl font-extrabold uppercase italic leading-none tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  accent = "blue",
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  accent?: "blue" | "orange" | "celeste" | "sol";
  hint?: ReactNode;
}) {
  const color = {
    blue: "text-gradient-blue",
    orange: "text-gradient-orange",
    celeste: "text-celeste",
    sol: "text-sol",
  }[accent];
  return (
    <div className="glass hud rounded-2xl p-4">
      <p className="label">{label}</p>
      <p className={cn("mt-1 font-display text-4xl font-extrabold tabular-nums", color)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function DataRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2 last:border-0">
      <dt className="label">{label}</dt>
      <dd className="text-right font-medium text-text">{value}</dd>
    </div>
  );
}

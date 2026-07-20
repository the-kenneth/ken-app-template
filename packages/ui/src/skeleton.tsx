import { cn } from "@ken/ui";

/**
 * Placeholder block for content that is still loading. Size it to match the
 * real content so the swap doesn't shift layout.
 *
 * Fill is `bg-muted-foreground/20`, deliberately NOT `bg-muted` or `bg-accent`
 * — this theme defines those as the same colour, and it's the fill used by
 * real surfaces like todo rows. Matching it would leave the pulse as the only
 * thing distinguishing a skeleton from loaded content, which fails under
 * `prefers-reduced-motion` (Tailwind v4 does not disable `animate-pulse`
 * there, hence the explicit `motion-reduce:animate-none`).
 *
 * No "use client" — it renders a plain div with no hooks, so it works in
 * server and client components alike.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted-foreground/20 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

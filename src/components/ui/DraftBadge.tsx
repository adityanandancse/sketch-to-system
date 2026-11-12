import { isDev } from "@/lib/draft";

type DraftBadgeProps = {
  draft: boolean;
  /** Position overrides; defaults to the top-right of the nearest relative parent. */
  className?: string;
};

/** Dev-only marker for placeholder content. Renders nothing in production. */
export default function DraftBadge({ draft, className }: DraftBadgeProps) {
  if (!isDev || !draft) return null;

  return (
    <span
      className={`absolute border border-dashed border-signal px-2 py-0.5 font-mono text-[10px] text-signal ${className ?? "top-3 right-3"}`}
    >
      DRAFT
    </span>
  );
}

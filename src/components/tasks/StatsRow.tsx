import type { Stats } from "@/types";

export default function StatsRow({ stats }: { stats: Stats }) {
  const cards: Array<{ label: string; value: number; color?: string }> = [
    { label: "Open", value: stats.open },
    { label: "Overdue", value: stats.overdue, color: "text-danger" },
    { label: "Done", value: stats.done, color: "text-success" },
    { label: "Total", value: stats.total },
  ];
  return (
    <div className="mb-4 grid grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className={`font-display text-2xl font-semibold ${c.color || ""}`}>{c.value}</p>
          <p className="mt-0.5 text-[12px] uppercase tracking-wide text-text-muted">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

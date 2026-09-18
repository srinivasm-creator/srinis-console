"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, StickyNote, Calendar } from "lucide-react";

const NAV = [
  { href: "/", label: "Tasks", icon: CheckSquare },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-3.5">
      <div className="flex items-center gap-2.5 px-2.5 pb-6 pt-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-bg">
          C
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight">
          Srini&apos;s Console
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

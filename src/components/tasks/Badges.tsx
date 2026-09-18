import type { Priority, TaskStatus } from "@/types";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-neutral-soft text-neutral",
  IN_PROGRESS: "bg-warn-soft text-warn",
  BLOCKED: "bg-blocked-soft text-blocked",
  DONE: "bg-success-soft text-success",
};

export const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: "bg-neutral",
  IN_PROGRESS: "bg-warn",
  BLOCKED: "bg-blocked",
  DONE: "bg-success",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-neutral-soft text-neutral",
  MEDIUM: "bg-warn-soft text-warn",
  HIGH: "bg-danger-soft text-danger",
};

const badgeBase = "inline-block rounded-md px-2 py-0.5 text-[11px] font-medium leading-snug";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`${badgeBase} ${STATUS_STYLES[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`${badgeBase} ${PRIORITY_STYLES[priority]}`}>{PRIORITY_LABEL[priority]}</span>;
}

export function TagChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={`${badgeBase} ${active ? "bg-accent-soft text-accent" : "bg-surface-2 text-text-muted"} ${
        onClick ? "cursor-pointer hover:text-text" : ""
      }`}
    >
      {label}
    </Comp>
  );
}

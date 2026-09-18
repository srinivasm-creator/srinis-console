import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import type { Task } from "@/types";

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "MMM d, h:mm a");
  } catch {
    return iso;
  }
}

/** "Today" / "Tomorrow" / "Sep 12" - falls back to a plain date further out. */
export function formatDueDate(iso: string): string {
  if (!iso) return "";
  const date = parseISO(iso);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function isOverdue(task: Pick<Task, "dueDate" | "status">): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  return isPast(parseISO(task.dueDate));
}

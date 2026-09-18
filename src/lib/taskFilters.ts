import type { Task, TaskStatus } from "@/types";

export function getStatusVisibleTasks(
  tasks: Task[],
  statusFilter: TaskStatus | "all",
  showDoneInAll: boolean
): Task[] {
  if (statusFilter === "all") return showDoneInAll ? tasks : tasks.filter((t) => t.status !== "DONE");
  return tasks.filter((t) => t.status === statusFilter);
}

export function getSearchVisibleTasks(tasks: Task[], searchTerm: string): Task[] {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function visibleTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return [...set].sort();
}

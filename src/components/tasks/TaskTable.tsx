import type { Task, TaskStatus, Priority } from "@/types";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import { PriorityBadge, STATUS_DOT } from "./Badges";
import { isOverdue } from "@/lib/taskFilters";

export type GroupBy = "status" | "priority";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const PRIORITY_ORDER: Priority[] = ["HIGH", "MEDIUM", "LOW"];

export function TaskTable({
  tasks,
  groupBy,
  onOpen,
}: {
  tasks: Task[];
  groupBy: GroupBy;
  onOpen: (task: Task) => void;
}) {
  const order = groupBy === "status" ? STATUS_ORDER : PRIORITY_ORDER;
  const groups = order
    .map((key) => ({
      key,
      label: groupBy === "status" ? STATUS_LABEL[key as TaskStatus] : PRIORITY_LABEL[key as Priority],
      items: tasks.filter((t) => (groupBy === "status" ? t.status === key : t.priority === key)),
    }))
    .filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">Nothing here yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-text-muted">
            {group.label} <span className="text-text-faint">· {group.items.length}</span>
          </p>
          <div className="flex flex-col gap-1.5">
            {group.items.map((task) => (
              <button
                key={task.id}
                onClick={() => onOpen(task)}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[task.status]}`} />
                <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
                {task.category && (
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      color: task.category.color,
                      background: `color-mix(in srgb, ${task.category.color} 14%, transparent)`,
                    }}
                  >
                    {task.category.name}
                  </span>
                )}
                {task.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted">
                    {tag}
                  </span>
                ))}
                {task.dueDate && (
                  <span className={`whitespace-nowrap text-[12px] ${isOverdue(task) ? "text-danger" : "text-text-muted"}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <PriorityBadge priority={task.priority} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

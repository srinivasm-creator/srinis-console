"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Priority, Task, TaskStatus } from "@/types";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import { PriorityBadge, STATUS_DOT } from "./Badges";
import { formatDueDate, isOverdue } from "@/lib/dates";

export type GroupBy = "status" | "priority";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const PRIORITY_ORDER: Priority[] = ["HIGH", "MEDIUM", "LOW"];

function groupTasks(tasks: Task[], groupBy: GroupBy): Array<{ key: string; label: string; tasks: Task[] }> {
  const order = groupBy === "status" ? STATUS_ORDER : PRIORITY_ORDER;
  return order
    .map((key) => ({
      key,
      label: groupBy === "status" ? STATUS_LABEL[key as TaskStatus] : PRIORITY_LABEL[key as Priority],
      tasks: tasks.filter((t) => (groupBy === "status" ? t.status : t.priority) === key),
    }))
    .filter((g) => g.tasks.length > 0);
}

export function TaskTable({
  tasks,
  groupBy,
  onOpen,
  onChanged,
}: {
  tasks: Task[];
  groupBy: GroupBy;
  onOpen: (task: Task) => void;
  onChanged: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const groups = useMemo(() => groupTasks(tasks, groupBy), [tasks, groupBy]);

  if (!tasks.length) {
    return <p className="py-10 text-center text-sm text-text-muted">Nothing here yet. Add your first task.</p>;
  }

  async function toggleDone(t: Task) {
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: t.status === "DONE" ? "TODO" : "DONE" }),
    });
    onChanged();
  }

  function toggleCollapsed(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        return (
          <div key={group.key} className="overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => toggleCollapsed(group.key)}
              className="flex w-full items-center gap-2 bg-surface-2 px-3.5 py-2.5 text-left"
            >
              {isCollapsed ? <ChevronRight size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              {groupBy === "status" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[group.key as TaskStatus]}`} />}
              <span className="text-[12.5px] font-semibold">{group.label}</span>
              <span className="font-mono text-[11px] text-text-faint">{group.tasks.length}</span>
            </button>
            {!isCollapsed && (
              <table className="w-full table-fixed border-collapse text-left text-[13px]">
                <colgroup>
                  <col className="w-[34px]" />
                  <col className="w-[36%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <tbody>
                  {group.tasks.map((t) => {
                    const overdue = isOverdue(t);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => onOpen(t)}
                        className={`cursor-pointer border-t border-border/70 hover:bg-surface-2 ${overdue ? "bg-danger-soft/30" : ""}`}
                      >
                        <td className="px-3.5 py-2.5">
                          <input
                            type="checkbox"
                            checked={t.status === "DONE"}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleDone(t)}
                            className="h-3.5 w-3.5 accent-accent"
                          />
                        </td>
                        <td
                          className={`truncate py-2.5 pr-2 font-medium ${t.status === "DONE" ? "text-text-muted line-through" : ""}`}
                          title={t.title}
                        >
                          {t.title}
                        </td>
                        <td className={`whitespace-nowrap px-3.5 py-2.5 ${overdue ? "font-medium text-danger" : "text-text-muted"}`}>
                          {t.dueDate ? formatDueDate(t.dueDate) : "—"}
                        </td>
                        <td className="px-3.5 py-2.5">{groupBy !== "status" && <StatusDotLabel status={t.status} />}</td>
                        <td className="px-3.5 py-2.5">{groupBy !== "priority" && <PriorityBadge priority={t.priority} />}</td>
                        <td className="truncate px-3.5 py-2.5 text-text-muted" title={t.tags.join(", ")}>
                          {t.tags.join(", ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusDotLabel({ status }: { status: TaskStatus }) {
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

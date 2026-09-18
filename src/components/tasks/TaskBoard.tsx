"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/types";
import { STATUS_LABEL } from "@/types";
import { PriorityBadge, STATUS_DOT } from "./Badges";
import { isOverdue } from "@/lib/taskFilters";

const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

export function TaskBoard({
  tasks,
  onOpen,
  onStatusChange,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  return (
    <div className="grid grid-cols-4 gap-3">
      {COLUMNS.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/task-id");
              if (taskId) onStatusChange(taskId, status);
              setDragOver(null);
            }}
            className={`flex min-h-[200px] flex-col gap-2 rounded-xl border p-2.5 transition-colors ${
              dragOver === status ? "border-accent bg-accent-soft" : "border-border bg-surface"
            }`}
          >
            <p className="flex items-center gap-2 px-1 text-[12px] font-medium uppercase tracking-wide text-text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
              {STATUS_LABEL[status]} <span className="text-text-faint">· {items.length}</span>
            </p>

            <div className="flex flex-col gap-2">
              {items.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
                  onClick={() => onOpen(task)}
                  className="cursor-pointer rounded-lg border border-border bg-surface-2 p-3 text-sm transition-colors hover:bg-surface-3"
                >
                  <p className="mb-2 line-clamp-2">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span className={`text-[11px] ${isOverdue(task) ? "text-danger" : "text-text-muted"}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

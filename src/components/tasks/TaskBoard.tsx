"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "@/types";
import { STATUS_LABEL } from "@/types";
import { PriorityBadge, STATUS_DOT } from "./Badges";
import { formatDueDate, isOverdue } from "@/lib/dates";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

const COLUMN_GLOW: Record<TaskStatus, string> = {
  TODO: "border-neutral bg-neutral-soft/40 shadow-[0_0_0_1px_var(--color-neutral)]",
  IN_PROGRESS: "border-warn bg-warn-soft/40 shadow-[0_0_0_1px_var(--color-warn)]",
  BLOCKED: "border-blocked bg-blocked-soft/40 shadow-[0_0_0_1px_var(--color-blocked)]",
  DONE: "border-success bg-success-soft/40 shadow-[0_0_0_1px_var(--color-success)]",
};

export function TaskBoard({ tasks, onOpen, onChanged }: { tasks: Task[]; onOpen: (task: Task) => void; onChanged: () => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const confirm = useConfirm();

  async function drop(status: TaskStatus) {
    setOverColumn(null);
    if (!dragId) return;
    const task = tasks.find((t) => t.id === dragId);
    setDragId(null);
    if (!task || task.status === status) return;
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChanged();
  }

  async function handleDelete(e: React.MouseEvent, task: Task) {
    e.stopPropagation();
    const ok = await confirm({ title: "Delete this task?", description: "This can't be undone.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col);
        const isOver = overColumn === col;
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col);
            }}
            onDragLeave={() => setOverColumn((c) => (c === col ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              drop(col);
            }}
            className={`flex min-h-[240px] flex-col gap-2 rounded-xl border p-2.5 transition-all duration-150 ${
              isOver ? COLUMN_GLOW[col] : "border-border bg-surface"
            }`}
          >
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-text-muted">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[col]}`} />
                {STATUS_LABEL[col]}
              </span>
              <span className="font-mono text-[11px] text-text-faint">{colTasks.length}</span>
            </div>
            {colTasks.map((t) => {
              const overdue = isOverdue(t);
              const dragging = dragId === t.id;
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onOpen(t)}
                  className={`group relative cursor-grab rounded-lg border border-border bg-surface-2 p-2.5 text-[12.5px] shadow-sm transition-all duration-150 ease-out hover:border-accent/50 active:cursor-grabbing ${
                    dragging ? "scale-95 opacity-50" : "scale-100 opacity-100"
                  } ${overdue ? "border-l-2 border-l-danger" : ""}`}
                >
                  <button
                    onClick={(e) => handleDelete(e, t)}
                    className="absolute right-1.5 top-1.5 rounded p-1 text-text-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="pr-4 font-medium leading-snug">{t.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={t.priority} />
                    {t.dueDate && <span className={`text-[11px] ${overdue ? "font-medium text-danger" : "text-text-muted"}`}>{formatDueDate(t.dueDate)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

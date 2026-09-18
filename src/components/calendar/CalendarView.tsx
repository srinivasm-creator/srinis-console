"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types";
import { STATUS_DOT } from "@/components/tasks/Badges";
import { TaskModal } from "@/components/tasks/TaskModal";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildGrid(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarView() {
  const { tasks, categories, reload } = useTasks();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const days = useMemo(() => buildGrid(monthDate), [monthDate]);
  const today = new Date();

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = new Date(t.dueDate).toDateString();
      map.set(key, [...(map.get(key) ?? []), t]);
    });
    return map;
  }, [tasks]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-semibold">
          {monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
            className="rounded-lg border border-border p-1.5 text-text-muted hover:text-text"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setMonthDate(new Date())}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] text-text-muted hover:text-text"
          >
            Today
          </button>
          <button
            onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
            className="rounded-lg border border-border p-1.5 text-text-muted hover:text-text"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-surface px-2 py-1.5 text-center text-[11px] uppercase tracking-wide text-text-muted">
            {w}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === monthDate.getMonth();
          const dayTasks = tasksByDay.get(day.toDateString()) ?? [];
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[92px] bg-surface p-1.5 ${inMonth ? "" : "opacity-40"}`}
            >
              <p className={`mb-1 text-[12px] ${isSameDay(day, today) ? "font-semibold text-accent" : "text-text-muted"}`}>
                {day.getDate()}
              </p>
              <div className="flex flex-col gap-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center gap-1 truncate rounded-md bg-surface-2 px-1.5 py-0.5 text-left text-[11px] hover:bg-surface-3"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[task.status]}`} />
                    <span className="truncate">{task.title}</span>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10.5px] text-text-faint">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          categories={categories}
          onClose={() => {
            setSelectedTask(null);
            reload();
          }}
          onSaved={setSelectedTask}
          onDeleted={() => {
            setSelectedTask(null);
            reload();
          }}
          onCategoriesChanged={reload}
        />
      )}
    </div>
  );
}

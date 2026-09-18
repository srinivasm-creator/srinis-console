"use client";

import { useMemo, useState, useTransition } from "react";
import type { Priority, Task } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  HIGH: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

type Filter = "ALL" | "ACTIVE" | "DONE";

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [isPending, startTransition] = useTransition();

  const visibleTasks = useMemo(() => {
    if (filter === "ACTIVE") return tasks.filter((t) => !t.completed);
    if (filter === "DONE") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const remaining = tasks.filter((t) => !t.completed).length;

  async function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmed,
        priority,
        dueDate: dueDate || null,
      }),
    });

    if (res.ok) {
      const created: Task = await res.json();
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      setDueDate("");
      setPriority("MEDIUM");
    }
  }

  function toggleCompleted(task: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
    startTransition(async () => {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
    });
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Srini&apos;s Console</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {remaining === 0 ? "All caught up" : `${remaining} task${remaining === 1 ? "" : "s"} left`}
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-2 text-sm outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button
            onClick={addTask}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        {(["ALL", "ACTIVE", "DONE"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 transition ${
              filter === f
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {f === "ALL" ? "All" : f === "ACTIVE" ? "Active" : "Done"}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {visibleTasks.length === 0 && (
          <li className="text-center text-sm text-slate-400 py-10">Nothing here yet.</li>
        )}
        {visibleTasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm transition hover:shadow-md"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleCompleted(task)}
              className="h-4 w-4 rounded accent-blue-600"
            />
            <div className="flex-1 min-w-0">
              <p
                className={`truncate text-sm font-medium ${
                  task.completed ? "line-through text-slate-400" : ""
                }`}
              >
                {task.title}
              </p>
              {task.dueDate && (
                <p className="text-xs text-slate-400">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition text-sm"
              aria-label="Delete task"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p className="text-center text-xs text-slate-300 dark:text-slate-600">
        {isPending ? "Syncing…" : "Synced"}
      </p>
    </div>
  );
}

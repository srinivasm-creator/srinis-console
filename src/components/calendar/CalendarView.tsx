"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types";
import { isOverdue } from "@/lib/dates";
import { TaskModal } from "@/components/tasks/TaskModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarView() {
  const { tasks, categories, reload } = useTasks();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = t.dueDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const cells: Array<number | null> = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => shiftMonth(-1)} className="rounded-lg border border-border p-1.5 text-text-muted hover:text-text">
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-[15px] font-semibold">
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={() => shiftMonth(1)} className="rounded-lg border border-border p-1.5 text-text-muted hover:text-text">
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => {
            setYear(today.getFullYear());
            setMonth(today.getMonth());
          }}
          className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] text-text-muted hover:text-text"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-text-muted">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = isoDate(year, month, day);
          const dayTasks = byDate.get(dateStr) || [];
          const isToday = dateStr === isoDate(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <div key={i} className={`min-h-[86px] rounded-lg border p-1.5 ${isToday ? "border-accent" : "border-border"} bg-surface`}>
              <p className={`mb-1 text-[11.5px] ${isToday ? "font-semibold text-accent" : "text-text-muted"}`}>{day}</p>
              <div className="flex flex-col gap-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setOpenTask(t)}
                    className={`truncate rounded px-1.5 py-0.5 text-left text-[10.5px] ${
                      isOverdue(t) ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
                    }`}
                    title={t.title}
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <span className="text-[10px] text-text-faint">+{dayTasks.length - 3} more</span>}
              </div>
            </div>
          );
        })}
      </div>

      {openTask && (
        <TaskModal
          task={openTask}
          categories={categories}
          onClose={() => setOpenTask(null)}
          onSaved={reload}
          onCategoriesChanged={reload}
        />
      )}
    </div>
  );
}

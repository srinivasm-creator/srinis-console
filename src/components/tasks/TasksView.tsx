"use client";

import { useEffect, useMemo, useState } from "react";
import { List, LayoutGrid, Download, Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import type { Stats, Task, TaskStatus } from "@/types";
import { STATUS_LABEL } from "@/types";
import StatsRow from "./StatsRow";
import { TaskTable, type GroupBy } from "./TaskTable";
import { TaskBoard } from "./TaskBoard";
import { TaskModal } from "./TaskModal";
import { TagChip } from "./Badges";
import { getStatusVisibleTasks, getSearchVisibleTasks, visibleTags } from "@/lib/taskFilters";

const STATUS_TABS: Array<TaskStatus | "all"> = ["all", "TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const UI_KEY = "srinis-console-tasks-ui";

export default function TasksView() {
  const { tasks, categories, reload } = useTasks();
  const [stats, setStats] = useState<Stats>({ open: 0, done: 0, overdue: 0, total: 0 });

  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(UI_KEY) || "{}");
    } catch {
      return {};
    }
  }, []);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">(saved.statusFilter || "all");
  const [showDoneInAll, setShowDoneInAll] = useState<boolean>(!!saved.showDoneInAll);
  const [viewMode, setViewMode] = useState<"list" | "board">(saved.viewMode || "list");
  const [groupBy, setGroupBy] = useState<GroupBy>(saved.groupBy || "status");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem(UI_KEY, JSON.stringify({ statusFilter, showDoneInAll, viewMode, groupBy }));
  }, [statusFilter, showDoneInAll, viewMode, groupBy]);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, [tasks]);

  const statusVisible = useMemo(
    () => getStatusVisibleTasks(tasks, statusFilter, showDoneInAll),
    [tasks, statusFilter, showDoneInAll]
  );
  const searchVisible = useMemo(() => getSearchVisibleTasks(statusVisible, search), [statusVisible, search]);
  const tagOptions = useMemo(() => visibleTags(searchVisible), [searchVisible]);

  useEffect(() => {
    if (activeTag && !tagOptions.includes(activeTag)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears a stale filter, terminates immediately
      setActiveTag(null);
    }
  }, [tagOptions, activeTag]);

  const finalTasks = useMemo(
    () => (activeTag ? searchVisible.filter((t) => t.tags.includes(activeTag)) : searchVisible),
    [searchVisible, activeTag]
  );

  async function handleQuickAdd(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !quickAdd.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: quickAdd.trim() }),
    });
    setQuickAdd("");
    reload();
  }

  async function handleNewTask() {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled task" }),
    });
    const task = await res.json();
    await reload();
    setSelectedTask(task);
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    reload();
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-9 bg-bg px-9 pb-3">
        <StatsRow stats={stats} />

        <input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={handleQuickAdd}
          placeholder="Quick add a task, press Enter to save..."
          className="mb-4 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        />

        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  statusFilter === s ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {statusFilter === "all" && (
              <label className="flex items-center gap-1.5 text-[12.5px] text-text-muted">
                <input type="checkbox" checked={showDoneInAll} onChange={(e) => setShowDoneInAll(e.target.checked)} />
                Show Done
              </label>
            )}
            {viewMode === "list" && (
              <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted">
                Group by
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[12.5px]"
                >
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            )}
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text"}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`rounded-md p-1.5 ${viewMode === "board" ? "bg-accent-soft text-accent" : "text-text-muted hover:text-text"}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {tagOptions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <TagChip label="All tags" active={!activeTag} onClick={() => setActiveTag(null)} />
            {tagOptions.map((tag) => (
              <TagChip key={tag} label={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] outline-none focus:border-accent"
          />
          <span className="whitespace-nowrap text-[12.5px] text-text-muted">{finalTasks.length} tasks</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- triggers a file download, not a page navigation */}
          <a
            href="/api/tasks/export"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12.5px] text-text-muted hover:text-text"
          >
            <Download size={13} /> Export CSV
          </a>
          <button
            onClick={handleNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[12.5px] font-medium text-bg hover:brightness-110"
          >
            <Plus size={14} /> New task
          </button>
        </div>
      </div>

      <div className="pt-4">
        {viewMode === "list" ? (
          <TaskTable tasks={finalTasks} groupBy={groupBy} onOpen={setSelectedTask} />
        ) : (
          <TaskBoard tasks={finalTasks} onOpen={setSelectedTask} onStatusChange={handleStatusChange} />
        )}
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

"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import type { Category, Priority, Task, TaskStatus } from "@/types";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import { useDebouncedAutosave } from "@/hooks/useDebouncedCallback";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TagChipInput } from "@/components/ui/TagChipInput";
import { formatDateTime } from "@/lib/dates";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

interface Props {
  task: Task | null; // null = creating a new task
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onCategoriesChanged: () => void;
}

async function patchTask(id: string, data: Record<string, unknown>): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Save failed");
  return res.json();
}

export function TaskModal({ task, categories, onClose, onSaved, onCategoriesChanged }: Props) {
  const isEditing = !!task;
  const toast = useToast();
  const confirm = useConfirm();

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "TODO");
  const [priority, setPriority] = useState<Priority>(task?.priority || "MEDIUM");
  const [categoryId, setCategoryId] = useState(task?.categoryId || "");
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [comment, setComment] = useState("");
  const [live, setLive] = useState<Task | null>(task);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

  const autosave = useDebouncedAutosave(async (payload: Record<string, unknown>) => {
    if (!live) return;
    setSaveStatus("saving");
    try {
      const updated = await patchTask(live.id, payload);
      setLive(updated);
      setSaveStatus("saved");
      onSaved();
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "" : s)), 1500);
    } catch (err) {
      setSaveStatus("");
      toast(err instanceof Error ? err.message : "Save failed", true);
    }
  }, 700);

  // A brand new task still needs an explicit Save so we don't create
  // half-filled tasks as you type.
  function fieldChanged(patch: Record<string, unknown>) {
    if (!isEditing) return;
    autosave(patch);
  }

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          dueDate: dueDate || null,
          status,
          priority,
          categoryId: categoryId || null,
          tags,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not create task");
      onSaved();
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create task", true);
    }
  }

  async function handleDelete() {
    if (!live) return;
    const ok = await confirm({ title: "Delete this task?", description: "This can't be undone.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    await fetch(`/api/tasks/${live.id}`, { method: "DELETE" });
    onSaved();
    onClose();
  }

  async function handleAddComment() {
    if (!live || !comment.trim()) return;
    const res = await fetch(`/api/tasks/${live.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment.trim() }),
    });
    const created = await res.json();
    setLive({ ...live, comments: [...live.comments, created] });
    setComment("");
    onSaved();
  }

  async function handleDeleteComment(commentId: string) {
    if (!live) return;
    const ok = await confirm({ title: "Delete this comment?", description: "This can't be undone.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    await fetch(`/api/tasks/${live.id}/comments/${commentId}`, { method: "DELETE" });
    setLive({ ...live, comments: live.comments.filter((c) => c.id !== commentId) });
    onSaved();
  }

  async function handleNewCategory() {
    const catName = window.prompt("New category name:");
    if (!catName || !catName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName.trim() }),
      });
      const created = await res.json();
      onCategoriesChanged();
      setCategoryId(created.id);
      fieldChanged({ categoryId: created.id });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create category", true);
    }
  }

  // Escape closes, matching every other modal in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-90 flex items-start justify-center overflow-y-auto bg-black/55 p-6 pt-[6vh]" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-[16px] font-semibold">{isEditing ? "Edit task" : "New task"}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              fieldChanged({ title: e.target.value });
            }}
            maxLength={120}
            placeholder="Task title"
            className="w-full bg-transparent font-display text-[18px] font-semibold outline-none placeholder:text-text-faint"
          />

          <div className="mt-3">
            <RichTextEditor
              contentHtml={description}
              placeholder="What's this task about..."
              onChange={(html) => {
                setDescription(html);
                fieldChanged({ description: html });
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-surface-2 p-3">
            <PropertyRow label="Status">
              <select
                value={status}
                onChange={(e) => {
                  const v = e.target.value as TaskStatus;
                  setStatus(v);
                  fieldChanged({ status: v });
                }}
                className="w-full bg-transparent text-[13px] outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} className="bg-surface" value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </PropertyRow>
            <PropertyRow label="Priority">
              <select
                value={priority}
                onChange={(e) => {
                  const v = e.target.value as Priority;
                  setPriority(v);
                  fieldChanged({ priority: v });
                }}
                className="w-full bg-transparent text-[13px] outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} className="bg-surface" value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </PropertyRow>
            <PropertyRow label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  fieldChanged({ dueDate: e.target.value || null });
                }}
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </PropertyRow>
            <PropertyRow label="Category">
              <div className="flex items-center gap-1.5">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    fieldChanged({ categoryId: e.target.value || null });
                  }}
                  className="w-full bg-transparent text-[13px] outline-none"
                >
                  <option value="" className="bg-surface">
                    No category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">
                      {c.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleNewCategory} className="shrink-0 text-text-faint hover:text-text" title="New category">
                  <Plus size={14} />
                </button>
              </div>
            </PropertyRow>
            <div className="col-span-2">
              <PropertyRow label="Tags">
                <TagChipInput
                  tags={tags}
                  onChange={(next) => {
                    setTags(next);
                    fieldChanged({ tags: next });
                  }}
                />
              </PropertyRow>
            </div>
          </div>

          {isEditing && live && (
            <Section label="Comments">
              <div className="flex flex-col gap-2.5">
                {live.comments.length === 0 && <p className="text-[12px] text-text-muted">No comments yet.</p>}
                {live.comments.map((c) => (
                  <div key={c.id} className="group flex items-start justify-between gap-2 border-l-2 border-accent/60 pl-2.5">
                    <div>
                      <p className="text-[12.5px]">{c.text}</p>
                      <span className="font-mono text-[10.5px] text-text-faint">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="shrink-0 text-text-faint opacity-0 hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  rows={1}
                  placeholder="Add a comment..."
                  className="flex-1 resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-accent"
                />
                <button onClick={handleAddComment} className="self-end rounded-lg border border-border px-3 py-2 text-[12.5px] text-text-muted hover:text-text">
                  Add
                </button>
              </div>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
          {isEditing ? (
            <button onClick={handleDelete} className="text-[13px] font-medium text-text-muted hover:text-danger">
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-text-muted transition-opacity" style={{ opacity: saveStatus ? 1 : 0 }}>
              {saveStatus === "saving" ? "Saving..." : "Saved"}
            </span>
            {isEditing ? (
              <button onClick={onClose} className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-bg hover:brightness-110">
                Close
              </button>
            ) : (
              <>
                <button onClick={onClose} className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-text-muted hover:bg-surface-2">
                  Cancel
                </button>
                <button onClick={handleCreate} className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-bg hover:brightness-110">
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-faint">{label}</span>
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[12.5px] font-medium text-text-muted">{label}</span>
      {children}
    </div>
  );
}

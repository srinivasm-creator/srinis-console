"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { Category, Task, TaskStatus, Priority } from "@/types";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH"];

const fieldClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent";

export function TaskModal({
  task,
  categories,
  onClose,
  onSaved,
  onDeleted,
  onCategoriesChanged,
}: {
  task: Task;
  categories: Category[];
  onClose: () => void;
  onSaved: (task: Task) => void;
  onDeleted: () => void;
  onCategoriesChanged: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(task.tags);
  const [commentText, setCommentText] = useState("");
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    onSaved(updated);
    return updated;
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !tagInput.trim()) return;
    const next = [...new Set([...tags, tagInput.trim()])];
    setTags(next);
    setTagInput("");
    patch({ tags: next });
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    patch({ tags: next });
  }

  async function addComment() {
    if (!commentText.trim()) return;
    await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText.trim() }),
    });
    setCommentText("");
    const listRes = await fetch("/api/tasks");
    const all: Task[] = await listRes.json();
    const fresh = all.find((t) => t.id === task.id);
    if (fresh) onSaved(fresh);
  }

  async function createCategory() {
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    const category = await res.json();
    setNewCategoryName("");
    setNewCategoryMode(false);
    onCategoriesChanged();
    await patch({ categoryId: category.id });
  }

  async function handleDelete() {
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-border bg-surface"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && patch({ title: title.trim() })}
            className="flex-1 bg-transparent font-display text-lg font-semibold outline-none"
          />
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => patch({ description })}
            placeholder="Description..."
            rows={3}
            className={fieldClass}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Status</label>
              <select
                value={task.status}
                onChange={(e) => patch({ status: e.target.value })}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => patch({ priority: e.target.value })}
                className={fieldClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Due date</label>
              <input
                type="date"
                defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                onChange={(e) => patch({ dueDate: e.target.value || null })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Category</label>
              {newCategoryMode ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createCategory()}
                    placeholder="Category name"
                    className={fieldClass}
                  />
                  <button
                    onClick={createCategory}
                    className="rounded-lg bg-accent px-2.5 text-xs font-medium text-bg"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={task.categoryId ?? ""}
                  onChange={(e) => {
                    if (e.target.value === "__new__") setNewCategoryMode(true);
                    else patch({ categoryId: e.target.value || null });
                  }}
                  className={fieldClass}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="__new__">+ New category…</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Tags</label>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-danger">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add a tag, press Enter"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-text-muted">
              Comments <span className="text-text-faint">· {task.comments.length}</span>
            </label>
            <div className="mb-2 flex flex-col gap-1.5">
              {task.comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-surface-2 px-3 py-2 text-[13px]">
                  <p>{c.text}</p>
                  <p className="mt-0.5 text-[11px] text-text-faint">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Add a comment, press Enter"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-[12.5px] text-text-muted hover:text-danger"
          >
            <Trash2 size={13} /> Delete task
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-1.5 text-[12.5px] font-medium text-bg hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

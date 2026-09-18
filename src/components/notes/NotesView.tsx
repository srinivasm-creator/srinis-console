"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, Trash2, Plus } from "lucide-react";
import type { Note } from "@/types";
import { TagChip } from "@/components/tasks/Badges";

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});

  async function reload() {
    const res = await fetch("/api/notes");
    setNotes(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    reload();
  }, []);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (activeTag && !n.tags.includes(activeTag)) return false;
      if (q && !n.content.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notes, search, activeTag]);

  async function addNote() {
    if (!newContent.trim()) return;
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent.trim(), tags }),
    });
    setNewContent("");
    setNewTags("");
    reload();
  }

  async function saveContent(note: Note) {
    const content = editing[note.id];
    if (content === undefined || content === note.content) return;
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    reload();
  }

  async function togglePin(note: Note) {
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    reload();
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <div className="mb-5 rounded-xl border border-border bg-surface p-3.5">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write a note..."
          rows={3}
          className="mb-2 w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <input
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags, comma separated"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
          <button
            onClick={addNote}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[12.5px] font-medium text-bg hover:brightness-110"
          >
            <Plus size={14} /> Add note
          </button>
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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes..."
        className="mb-4 w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] outline-none focus:border-accent"
      />

      <div className="grid grid-cols-2 gap-3">
        {visible.map((note) => (
          <div key={note.id} className="rounded-xl border border-border bg-surface p-3.5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <button onClick={() => togglePin(note)} className={note.pinned ? "text-warn" : "text-text-faint hover:text-text-muted"}>
                <Star size={15} fill={note.pinned ? "currentColor" : "none"} />
              </button>
              <button onClick={() => deleteNote(note.id)} className="text-text-faint hover:text-danger">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={editing[note.id] ?? note.content}
              onChange={(e) => setEditing((prev) => ({ ...prev, [note.id]: e.target.value }))}
              onBlur={() => saveContent(note)}
              rows={4}
              className="mb-2 w-full resize-none bg-transparent text-sm outline-none"
            />
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && <p className="col-span-2 py-10 text-center text-sm text-text-muted">No notes yet.</p>}
      </div>
    </div>
  );
}

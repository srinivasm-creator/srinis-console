"use client";

import { useMemo, useRef, useState } from "react";
import { Star, Plus, Trash2 } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import type { Note } from "@/types";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { TagChipInput } from "@/components/ui/TagChipInput";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useDebouncedAutosave } from "@/hooks/useDebouncedCallback";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/dates";
import { visibleTags, titleAndSnippet, wordCount, stripHtml } from "@/lib/noteFilters";

export default function NotesView() {
  const { notes, reload } = useNotes();

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);

  const tagOptions = useMemo(() => visibleTags(notes), [notes]);

  const filteredNotes = useMemo(() => {
    let list = notes;
    if (activeTag) list = list.filter((n) => n.tags.includes(activeTag));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((n) => stripHtml(n.content).toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)));
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [notes, activeTag, search]);

  const selectedNote = selectedId && selectedId !== "new" ? notes.find((n) => n.id === selectedId) || null : null;

  return (
    <div className="grid h-[calc(100vh-160px)] grid-cols-[180px_280px_1fr] gap-4">
      <div className="flex flex-col gap-0.5 overflow-y-auto border-r border-border pr-3">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-lg px-2.5 py-2 text-left text-[13px] font-medium ${
            !activeTag ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface-2 hover:text-text"
          }`}
        >
          All notes
          <span className="ml-1.5 font-mono text-[11px] text-text-faint">{notes.length}</span>
        </button>
        {tagOptions.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`truncate rounded-lg px-2.5 py-2 text-left text-[13px] ${
              activeTag === tag ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            {tag}
            <span className="ml-1.5 font-mono text-[11px] text-text-faint">{notes.filter((n) => n.tags.includes(tag)).length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden border-r border-border pr-3">
        <div className="mb-2.5 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] outline-none focus:border-accent"
          />
          <button
            onClick={() => setSelectedId("new")}
            className="flex shrink-0 items-center justify-center rounded-lg bg-accent px-2.5 text-bg hover:brightness-110"
            title="New note"
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {filteredNotes.length === 0 && <p className="px-2 py-6 text-center text-[12.5px] text-text-muted">No notes here.</p>}
          {filteredNotes.map((n) => {
            const { title, snippet } = titleAndSnippet(n);
            return (
              <button
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                className={`w-full rounded-lg px-2.5 py-2 text-left ${selectedId === n.id ? "bg-accent-soft" : "hover:bg-surface-2"}`}
              >
                <div className="flex items-center gap-1.5">
                  {n.pinned && <Star size={11} className="shrink-0 fill-warn text-warn" />}
                  <span className={`truncate text-[12.5px] font-medium ${selectedId === n.id ? "text-accent" : "text-text"}`}>{title}</span>
                </div>
                {snippet && <p className="mt-0.5 truncate text-[11.5px] text-text-muted">{snippet}</p>}
                <p className="mt-0.5 font-mono text-[10px] text-text-faint">{formatDateTime(n.updatedAt)}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto">
        {selectedId === "new" ? (
          <NoteEditor
            key="new"
            note={null}
            onCreated={(note) => {
              setSelectedId(note.id);
              reload();
            }}
            onDeleted={() => setSelectedId(null)}
            onChanged={reload}
          />
        ) : selectedNote ? (
          <NoteEditor key={selectedNote.id} note={selectedNote} onDeleted={() => setSelectedId(null)} onChanged={reload} />
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] text-text-muted">Select a note, or create a new one.</div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({
  note,
  onCreated,
  onDeleted,
  onChanged,
}: {
  note: Note | null;
  onCreated?: (note: Note) => void;
  onDeleted: () => void;
  onChanged: () => void;
}) {
  const confirm = useConfirm();
  const toast = useToast();

  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [html, setHtml] = useState(note?.content || "");
  const [count, setCount] = useState(wordCount(note?.content || ""));
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const liveIdRef = useRef<string | null>(note?.id || null);

  const autosave = useDebouncedAutosave(async (payload: { content?: string; tags?: string[]; pinned?: boolean }) => {
    const text = stripHtml(payload.content ?? html);
    setSaveStatus("saving");
    try {
      if (!liveIdRef.current) {
        if (!text) {
          setSaveStatus("");
          return;
        }
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: payload.content ?? html,
            tags: payload.tags ?? tags,
          }),
        });
        const created = await res.json();
        liveIdRef.current = created.id;
        onCreated?.(created);
      } else {
        await fetch(`/api/notes/${liveIdRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setSaveStatus("saved");
      onChanged();
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "" : s)), 1500);
    } catch (err) {
      setSaveStatus("");
      toast(err instanceof Error ? err.message : "Save failed", true);
    }
  }, 500);

  async function handleDelete() {
    if (!liveIdRef.current) {
      onDeleted();
      return;
    }
    const ok = await confirm({ title: "Delete this note?", description: "This can't be undone.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    await fetch(`/api/notes/${liveIdRef.current}`, { method: "DELETE" });
    onChanged();
    onDeleted();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <TagChipInput
          tags={tags}
          onChange={(next) => {
            setTags(next);
            autosave({ tags: next });
          }}
        />
        <div className="ml-3 flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              const next = !pinned;
              setPinned(next);
              autosave({ pinned: next });
            }}
            className={pinned ? "text-warn" : "text-text-faint hover:text-warn"}
            title="Pin note"
          >
            <Star size={16} fill={pinned ? "currentColor" : "none"} />
          </button>
          <button onClick={handleDelete} className="text-text-faint hover:text-danger" title="Delete note">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <RichTextEditor
          contentHtml={html}
          placeholder="Paste or type something to hold on to..."
          onChange={(next) => {
            setHtml(next);
            setCount(wordCount(next));
            autosave({ content: next });
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-text-faint">
        <span>{note ? `Created ${formatDateTime(note.createdAt)}` : "New note"}</span>
        <div className="flex items-center gap-3">
          <span className={`transition-opacity ${saveStatus ? "opacity-100" : "opacity-0"}`}>{saveStatus === "saving" ? "Saving..." : "Saved"}</span>
          <span>{count} words</span>
        </div>
      </div>
    </div>
  );
}

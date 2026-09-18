"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagChipInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    if (!value) return;
    if (!tags.includes(value)) onChange([...tags, value]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 focus-within:border-accent">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-md bg-surface-3 px-2 py-0.5 text-[11.5px]">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-text-faint hover:text-danger">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "Backspace" && !draft && tags.length) {
            removeTag(tags[tags.length - 1]);
          }
        }}
        onBlur={commitDraft}
        placeholder={tags.length ? "" : "Add a tag, press Enter"}
        className="min-w-[100px] flex-1 bg-transparent text-[13px] outline-none"
      />
    </div>
  );
}

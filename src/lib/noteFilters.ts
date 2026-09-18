import type { Note } from "@/types";

export function visibleTags(notes: Note[]): string[] {
  const set = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleAndSnippet(note: Note): { title: string; snippet: string } {
  const text = stripHtml(note.content);
  if (!text) return { title: "(empty note)", snippet: "" };
  return { title: text.slice(0, 80), snippet: text.slice(80, 200) };
}

export function wordCount(html: string): number {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).length : 0;
}

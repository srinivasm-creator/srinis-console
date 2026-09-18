"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { Bold, Italic, Strikethrough, List, ListChecks, Heading2, Quote, Code2, Link as LinkIcon } from "lucide-react";

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors ${
        active ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface-2 hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1">
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton title="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <ListChecks size={14} />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Link"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("Link URL:", "https://");
          if (!url || !url.trim()) return;
          let href = url.trim();
          if (!/^(https?:\/\/|mailto:)/i.test(href)) href = "https://" + href;
          editor.chain().focus().setLink({ href }).run();
        }}
      >
        <LinkIcon size={14} />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  contentHtml,
  placeholder,
  onChange,
  editable = true,
}: {
  contentHtml?: string | null;
  placeholder?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: placeholder || "Type something..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
    ],
    content: contentHtml || "",
    editable,
    editorProps: { attributes: { class: "tiptap-content" } },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    immediatelyRender: false,
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-2">
      {editable && <Toolbar editor={editor} />}
      <div className="max-h-64 overflow-y-auto px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
